// Modul nalog: login/registracija, veza sa serverom i sinhronizacija podataka.
// Radi samo kad je server dostupan; bez servera aplikacija nastavlja kao i ranije.
// Prefiks klasa: .nal-
'use strict';

// ===== KONSTANTE I STANJE =====
const NALOG_SERVER_KLJUC = 'skolski-info-server';
const NALOG_TOKEN_KLJUC = 'skolski-info-token';
const NALOG_SINHRO_KLJUC = 'skolski-info-sinhro';
const NALOG_AUTO_KLJUC = 'skolski-info-auto-sinhro';
const NALOG_IZMENA_KLJUC = 'skolski-info-izmena'; // trajni žig poslednje lokalne izmene (preživljava odjavu)

const nalStanje = {
    inicijalizovan: false,
    serverDostupan: false,
    prviPutProvera: true,     // da li je prva provera servera od pokretanja
    prijavljen: false,
    ime: null,
    info: null,               // /api/nalog odgovor
    sinhro: null,             // { hash, vreme, izmena }
    uToku: false,             // sinhronizacija u toku
    primenjuje: false,        // primena preuzetih podataka (ne obeležava izmene)
    sukobOtovren: false,
    tajmerAuto: null,
    tajmerProvere: null,
    mesanaSadrzinaUpozoreno: false,
    poslednjaGreskaToast: 0
};

// ===== ČUVANJE POMOĆNOG STANJA (van glavnih podataka, ne ide u izvoz) =====
function nalCitajSinhro() {
    try { return JSON.parse(localStorage.getItem(NALOG_SINHRO_KLJUC) || 'null'); } catch (e) { return null; }
}
function nalZabeleziSinhro(hash) {
    const meta = { hash: hash, vreme: new Date().toISOString(), izmena: null };
    try { localStorage.setItem(NALOG_SINHRO_KLJUC, JSON.stringify(meta)); } catch (e) { }
    // Skinuo sam i trajni žig izmene: podaci su sada sinhronizovani, pa stari žig
    // ne sme da se koristi kao "vreme lokalne izmene" u budućem spajanju.
    try { localStorage.removeItem(NALOG_IZMENA_KLJUC); } catch (e) { }
    nalStanje.sinhro = meta;
    nalAzurirajUI();
}
// Čitanje prijavnog tokena iz localStorage (prazno ako nema prijave).
function nalToken() {
    try { return localStorage.getItem(NALOG_TOKEN_KLJUC) || ''; } catch (e) { return ''; }
}

// Adresa servera: iz localStorage, a ako nije unešena onda isti izvor stranice.
function nalServerUrl() {
    let sacuvano = '';
    try { sacuvano = (localStorage.getItem(NALOG_SERVER_KLJUC) || '').trim(); } catch (e) { }
    if (sacuvano) return sacuvano.replace(/\/+$/, '');
    // Prazno: koristi isti izvor ako je aplikacija otvorena sa servera.
    if (location.protocol === 'http:' || location.protocol === 'https:') return location.origin;
    return '';
}
// Da li je adresa servera poznata (ručno unešena ili isti izvor stranice).
function nalServerPodesen() {
    return !!nalServerUrl();
}

// Da li je automatska sinhronizacija uključena (podrazumevano jeste).
function nalAutoSinhro() {
    try { return localStorage.getItem(NALOG_AUTO_KLJUC) !== '0'; } catch (e) { return true; }
}
// Uključi ili isključi automatsku sinhronizaciju i podesi tajmer za slanje.
function nalPostaviAutoSinhro(vrednost) {
    try { localStorage.setItem(NALOG_AUTO_KLJUC, vrednost ? '1' : '0'); } catch (e) { }
    if (vrednost) nalZakaziAutoSinhro();
    else if (nalStanje.tajmerAuto) { clearTimeout(nalStanje.tajmerAuto); nalStanje.tajmerAuto = null; }
}

// ===== HASH PODATAKA (identičan algoritam kao na serveru) =====
function nalKanonickiJson(vrednost) {
    if (vrednost === null || typeof vrednost !== 'object') return JSON.stringify(vrednost);
    if (Array.isArray(vrednost)) return '[' + vrednost.map(nalKanonickiJson).join(',') + ']';
    const kljucevi = Object.keys(vrednost).sort();
    return '{' + kljucevi.map(k => JSON.stringify(k) + ':' + nalKanonickiJson(vrednost[k])).join(',') + '}';
}
function nalHash(podaci) {
    try {
        const tekst = nalKanonickiJson(podaci);
        let h = 0x811c9dc5;
        for (let i = 0; i < tekst.length; i++) {
            h ^= tekst.charCodeAt(i);
            h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
        }
        return ('0000000' + h.toString(16)).slice(-8);
    } catch (e) {
        return null;
    }
}

// Da li lokalni podaci odstupaju od poslednje sinhronizovane verzije?
function nalJePrljavo() {
    const meta = nalStanje.sinhro || nalCitajSinhro();
    if (!nalToken()) return false;            // bez naloga nema sinhronizacije
    if (!meta) return nalImaLokalnihPodataka(); // nalog postoji ali nikad sinhronizovano
    return nalHash(podaciAplikacije) !== meta.hash;
}

function nalImaLokalnihPodataka() {
    return (podaciAplikacije.notes && podaciAplikacije.notes.length > 0) ||
        (podaciAplikacije.schedule && podaciAplikacije.schedule.length > 0);
}

// ===== API KLIJENT =====
async function nalZahtev(metod, putanja, telo, opcije) {
    const opc = opcije || {};
    const url = nalServerUrl() + putanja;
    const zaglavlja = { 'Content-Type': 'application/json' };
    if (opc.auth && nalToken()) zaglavlja['Authorization'] = 'Bearer ' + nalToken();

    const kontrolor = new AbortController();
    const tajmer = setTimeout(() => kontrolor.abort(), opc.tajmaut || 6000);

    try {
        const odgovor = await fetch(url, {
            method: metod,
            headers: zaglavlja,
            body: telo !== null && telo !== undefined ? JSON.stringify(telo) : undefined,
            signal: kontrolor.signal
        });
        let data = null;
        try { data = await odgovor.json(); } catch (e) { data = null; }
        return { ok: odgovor.ok, status: odgovor.status, data: data };
    } catch (e) {
        return { ok: false, status: 0, data: null, mreza: true };
    } finally {
        clearTimeout(tajmer);
    }
}

// ===== PROVERA SERVERA =====
async function nalProveriServer(izvor) {
    const izvorTekst = izvor || 'rucno';
    if (!nalServerPodesen()) {
        const pre = nalStanje.serverDostupan;
        nalStanje.serverDostupan = false;
        if (!pre) nalAzurirajUI();
        return false;
    }

    // Pregledač blokira HTTP pozive sa HTTPS stranice (mešani sadržaj).
    if (location.protocol === 'https:' && nalServerUrl().startsWith('http:')) {
        nalStanje.serverDostupan = false;
        if (!nalStanje.mesanaSadrzinaUpozoreno) {
            nalStanje.mesanaSadrzinaUpozoreno = true;
            if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastMesanaSadrzina'), 'greska');
        }
        nalAzurirajUI();
        return false;
    }

    const odg = await nalZahtev('GET', '/api/zdravo', null, { tajmaut: 3500 });
    const pre = nalStanje.serverDostupan;
    nalStanje.serverDostupan = odg.ok;

    // Prelazi stanja: obavesti korisnika.
    if (pre && !odg.ok && nalStanje.prijavljen) {
        if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastServerPao'), 'greska');
    }
    if (!pre && odg.ok && !nalStanje.prviPutProvera) {
        if (nalStanje.prijavljen) {
            if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastServerVratio'), 'info');
            nalSinhronizuj({ tiho: true });
        }
    }
    nalStanje.prviPutProvera = false;
    nalAzurirajUI();

    if (odg.ok && izvorTekst === 'start' && nalToken() && !nalStanje.prijavljen) {
        nalAutoPrijava();
    }
    return odg.ok;
}

function nalPokreniProveru() {
    if (nalStanje.tajmerProvere) clearInterval(nalStanje.tajmerProvere);
    nalStanje.tajmerProvere = setInterval(() => {
        if (!document.hidden) {
            nalProveriServer('perioda').then(() => {
                // Periodično tiho dovlačenje izmena sa servera (npr. sa drugog uređaja),
                // ali samo kad je lokalno sve sinhronizovano i korisnik ništa ne uređuje.
                if (nalStanje.prijavljen && nalStanje.serverDostupan &&
                    !nalStanje.uToku && !nalJePrljavo() && !nalKorisnikRadi()) {
                    nalSinhronizuj({ tiho: true });
                }
            });
        }
    }, 30000);
}

// Da li korisnik trenutno nešto uređuje (modal, BIOS, paleta)? Tada ne diramo podatke.
function nalKorisnikRadi() {
    if (document.querySelector('.modal.prikazi')) return true;
    if (window.BIOS && typeof window.BIOS.otvoren === 'function' && window.BIOS.otvoren()) return true;
    if (window.KomandnaPaleta && window.KomandnaPaleta.otvorena && window.KomandnaPaleta.otvorena()) return true;
    const fokus = document.activeElement;
    return !!(fokus && (fokus.tagName === 'INPUT' || fokus.tagName === 'TEXTAREA' || fokus.tagName === 'SELECT' || fokus.isContentEditable));
}

// ===== PRIJAVA / REGISTRACIJA =====
function nalOtvoriModal() {
    if (!document.getElementById('modalNalog')) return;
    nalOsveziModal();
    otvoriModal('modalNalog');
    // Ako je poslednji poznati status „nedostupan", probaj odmah svežu proveru,
    // da status u modalu ne ostane zastareo (server se možda vratio u međuvremenu).
    if (!nalStanje.serverDostupan) nalProveriServer('modal');
    const prvoPolje = nalStanje.prijavljen ? null : document.getElementById('nalPrijavaIme');
    if (prvoPolje) setTimeout(() => { try { prvoPolje.focus(); } catch (e) { } }, 120);
}

function nalZatvoriModal() {
    zatvoriModal('modalNalog');
}

// Osvežava sadržaj modala prema trenutnom stanju (prijavljen vs ne).
function nalOsveziModal() {
    const formaPrijava = document.getElementById('nalFormaPrijava');
    const formaRegistracija = document.getElementById('nalFormaRegistracija');
    const pregled = document.getElementById('nalPregled');
    const tabovi = document.getElementById('nalTabovi');
    const greskaP = document.getElementById('nalGreskaPrijava');
    const greskaR = document.getElementById('nalGreskaRegistracija');
    if (greskaP) greskaP.hidden = true;
    if (greskaR) greskaR.hidden = true;

    if (nalStanje.prijavljen) {
        if (formaPrijava) formaPrijava.hidden = true;
        if (formaRegistracija) formaRegistracija.hidden = true;
        if (tabovi) tabovi.hidden = true;
        if (pregled) {
            pregled.hidden = false;
            nalPopuniPregled();
        }
    } else {
        if (formaPrijava) formaPrijava.hidden = nalAktivniTab !== 'prijava';
        if (formaRegistracija) formaRegistracija.hidden = nalAktivniTab !== 'registracija';
        if (tabovi) tabovi.hidden = false;
        if (pregled) pregled.hidden = true;
        nalObojiTabove();
    }

    // Status servera u modalu.
    const statusTekst = document.getElementById('nalStatusTekst');
    const statusTacka = document.getElementById('nalStatusTacka');
    const oflajn = document.getElementById('nalOflajnObjasnjenje');
    if (statusTekst && statusTacka) {
        statusTacka.className = 'nal-status-tacka ' +
            (nalStanje.serverDostupan ? 'nal-status-tacka--dobro' : 'nal-status-tacka--lose');
        if (!nalServerPodesen()) statusTekst.textContent = t('nal.statusNijePodesen');
        else statusTekst.textContent = nalStanje.serverDostupan ? t('nal.statusDostupan') : t('nal.statusNedostupan');
    }
    if (oflajn) {
        // Prikaži objašnjenje samo dok server nije dostupan.
        oflajn.hidden = nalStanje.serverDostupan;
    }

    // Server adresa u polju.
    const urlPolje = document.getElementById('nalServerUrl');
    if (urlPolje) {
        let sacuvano = '';
        try { sacuvano = (localStorage.getItem(NALOG_SERVER_KLJUC) || '').trim(); } catch (e) { }
        urlPolje.value = sacuvano;
    }
}

let nalAktivniTab = 'prijava';

function nalPrebaciTab(tab) {
    nalAktivniTab = tab === 'registracija' ? 'registracija' : 'prijava';
    nalOsveziModal();
    const fokus = nalAktivniTab === 'prijava' ? 'nalPrijavaIme' : 'nalRegIme';
    const el = document.getElementById(fokus);
    if (el) setTimeout(() => { try { el.focus(); } catch (e) { } }, 60);
}

function nalObojiTabove() {
    const tP = document.getElementById('nalTabPrijava');
    const tR = document.getElementById('nalTabRegistracija');
    if (tP) {
        tP.classList.toggle('aktivan', nalAktivniTab === 'prijava');
        tP.setAttribute('aria-selected', String(nalAktivniTab === 'prijava'));
    }
    if (tR) {
        tR.classList.toggle('aktivan', nalAktivniTab === 'registracija');
        tR.setAttribute('aria-selected', String(nalAktivniTab === 'registracija'));
    }
}

function nalPrikaziGresku(id, poruka) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = poruka;
        el.hidden = false;
    }
}

async function nalPrijavi() {
    const ime = (document.getElementById('nalPrijavaIme') || {}).value || '';
    const lozinka = (document.getElementById('nalPrijavaLozinka') || {}).value || '';
    const greska = 'nalGreskaPrijava';
    const dugme = document.getElementById('nalDugmePrijava');

    if (!ime.trim() || !lozinka) return nalPrikaziGresku(greska, t('nal.greskaPrazno'));
    if (!nalServerPodesen()) return nalPrikaziGresku(greska, t('nal.greskaNijePodesen'));
    if (!nalStanje.serverDostupan) {
        await nalProveriServer('prijava'); // sveža provera pre odbijanja
        if (!nalStanje.serverDostupan) return nalPrikaziGresku(greska, t('nal.greskaNedostupan'));
    }

    if (dugme) { dugme.disabled = true; dugme.textContent = t('nal.ucitavam'); }
    const odg = await nalZahtev('POST', '/api/prijava', { ime: ime.trim(), lozinka });
    if (dugme) { dugme.disabled = false; dugme.textContent = t('nal.prijaviSe'); }

    if (odg.status === 401) return nalPrikaziGresku(greska, t('nal.greskaServer401'));
    if (odg.status === 429) return nalPrikaziGresku(greska, t('nal.greskaServer429'));
    if (odg.mreza || !odg.ok) return nalPrikaziGresku(greska, t('nal.greskaMreza'));

    nalPoslePrijave(odg.data.ime, odg.data.token, { nov: false });
}

async function nalRegistruj() {
    const ime = (document.getElementById('nalRegIme') || {}).value || '';
    const lozinka = (document.getElementById('nalRegLozinka') || {}).value || '';
    const lozinka2 = (document.getElementById('nalRegLozinka2') || {}).value || '';
    const greska = 'nalGreskaRegistracija';
    const dugme = document.getElementById('nalDugmeRegistracija');

    if (!ime.trim() || !lozinka) return nalPrikaziGresku(greska, t('nal.greskaPrazno'));
    if (lozinka !== lozinka2) return nalPrikaziGresku(greska, t('nal.greskaPonovljena'));
    if (!/^[a-z0-9_\-.]{3,24}$/.test(ime.trim().toLowerCase())) return nalPrikaziGresku(greska, t('nal.greskaIme'));
    if (lozinka.length < 6) return nalPrikaziGresku(greska, t('nal.greskaLozinka'));
    if (!nalServerPodesen()) return nalPrikaziGresku(greska, t('nal.greskaNijePodesen'));
    if (!nalStanje.serverDostupan) {
        await nalProveriServer('registracija'); // sveža provera pre odbijanja
        if (!nalStanje.serverDostupan) return nalPrikaziGresku(greska, t('nal.greskaNedostupan'));
    }

    if (dugme) { dugme.disabled = true; dugme.textContent = t('nal.ucitavam'); }
    const odg = await nalZahtev('POST', '/api/registracija', { ime: ime.trim(), lozinka });
    if (dugme) { dugme.disabled = false; dugme.textContent = t('nal.napraviNalog'); }

    if (odg.status === 409) return nalPrikaziGresku(greska, t('nal.greskaServer409'));
    if (odg.status === 400) return nalPrikaziGresku(greska, t('nal.greskaIme'));
    if (odg.status === 429) return nalPrikaziGresku(greska, t('nal.greskaServer429'));
    if (odg.status === 503) return nalPrikaziGresku(greska, t('nal.greskaServer503'));
    if (odg.mreza || !odg.ok) return nalPrikaziGresku(greska, t('nal.greskaMreza'));

    nalPoslePrijave(odg.data.ime, odg.data.token, { nov: true });
}

function nalPoslePrijave(ime, token, opcije) {
    try { localStorage.setItem(NALOG_TOKEN_KLJUC, token); } catch (e) { }
    nalStanje.prijavljen = true;
    nalStanje.ime = ime;
    if (typeof prikaziToast === 'function') {
        prikaziToast(opcije && opcije.nov ? t('nal.toastNalogNapravljen', { ime }) : t('nal.toastDobrodosao', { ime }), 'uspeh');
    }
    nalZatvoriModal();
    nalAzurirajUI();
    // Info o nalogu pa sinhronizacija.
    nalZahtev('GET', '/api/nalog', null, { auth: true }).then((odg) => {
        if (odg.ok && odg.data) nalStanje.info = odg.data;
        nalAzurirajUI();
    }).catch(() => { });
    nalSinhronizuj({});
}

// Automatska prijava ukoliko token postoji (npr. posle ponovnog otvaranja).
async function nalAutoPrijava() {
    if (!nalToken() || !nalStanje.serverDostupan || nalStanje.prijavljen) return;

    const odg = await nalZahtev('GET', '/api/nalog', null, { auth: true });
    if (odg.status === 401) {
        // Token više ne važi.
        try { localStorage.removeItem(NALOG_TOKEN_KLJUC); } catch (e) { }
        try { localStorage.removeItem(NALOG_SINHRO_KLJUC); } catch (e) { }
        nalStanje.sinhro = null;
        if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastSesijaIstekla'), 'info');
        nalAzurirajUI();
        return;
    }
    if (!odg.ok) return; // mreža/server greška: ostavi token, probati kasnije

    nalStanje.prijavljen = true;
    nalStanje.ime = odg.data.ime;
    nalStanje.info = odg.data;
    nalStanje.sinhro = nalCitajSinhro();
    nalAzurirajUI();
    nalSinhronizuj({ tiho: true });
}

// ===== ODJAVA =====
async function nalOdjavi() {
    if (nalJePrljavo()) {
        const potvrda = window.App && typeof window.App.potvrdi === 'function'
            ? window.App.potvrdi(t('nal.potvrdaOdjava'))
            : Promise.resolve(true);
        const ok = await potvrda;
        if (!ok) return;
    }
    try { await nalZahtev('POST', '/api/odjava', null, { auth: true }); } catch (e) { }
    try {
        localStorage.removeItem(NALOG_TOKEN_KLJUC);
        localStorage.removeItem(NALOG_SINHRO_KLJUC);
    } catch (e) { }
    nalStanje.prijavljen = false;
    nalStanje.ime = null;
    nalStanje.info = null;
    nalStanje.sinhro = null;
    if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastOdjavljen'), 'uspeh');
    nalZatvoriModal();
    nalAzurirajUI();
}

// ===== MOTOR SINHRONIZACIJE =====
async function nalSinhronizuj(opcije) {
    const opc = opcije || {};
    // Ako je dijalog sukoba otvoren, nova sinhronizacija bi pregazila dokument
    // sukoba koji korisnik upravo razmatra. Prvo neka završi izbor.
    if (nalStanje.sukobOtovren) return;
    if (!nalStanje.prijavljen) {
        if (!opc.tiho) {
            if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastNijePrijavljen'), 'greska');
            nalOtvoriModal();
        }
        return;
    }
    if (!nalStanje.serverDostupan) {
        if (!opc.tiho && typeof prikaziToast === 'function') prikaziToast(t('nal.toastServerNedostupan'), 'greska');
        return;
    }
    if (nalStanje.uToku) return;

    nalStanje.uToku = true;
    nalAzurirajUI();

    try {
        const odg = await nalZahtev('GET', '/api/podaci', null, { auth: true, tajmaut: 8000 });
        if (odg.status === 401) { nalStanje.uToku = false; nalAutoIstekla(); return; }

        let serverDok = null;
        if (odg.ok && odg.data && odg.data.podaci) serverDok = odg.data;
        else if (odg.status !== 404) throw new Error('mreza');

        const lokalniPodaci = JSON.parse(JSON.stringify(podaciAplikacije));
        const lokalniHash = nalHash(lokalniPodaci);
        const meta = nalStanje.sinhro || nalCitajSinhro();

        // --- Server nema podatke: prvo slanje. ---
        if (!serverDok) {
            const rez = await nalGurni(lokalniPodaci, meta ? meta.hash : null, false);
            if (rez.prekid) return;
            if (rez.sukob) { nalPrikaziSukob(rez.dokument); return; }
            nalZabeleziSinhro(rez.hash);
            if (!opc.tiho && typeof prikaziToast === 'function') prikaziToast(t('nal.toastPoslataPrviPut'), 'uspeh');
            return;
        }

        // --- Prva sinhronizacija u ovom pregledaču. ---
        if (!meta) {
            if (lokalniHash === serverDok.hash) {
                nalZabeleziSinhro(serverDok.hash);
                return;
            }
            nalPrikaziSukob(serverDok, { prviPut: true });
            return;
        }

        const lokalniCist = lokalniHash === meta.hash;
        const serverskiCist = serverDok.hash === meta.hash;

        // --- Ništa nije menjano. ---
        if (lokalniCist && serverskiCist) {
            nalZabeleziSinhro(serverDok.hash);
            if (!opc.tiho && typeof prikaziToast === 'function') prikaziToast(t('nal.toastNemaIzmena'), 'info');
            return;
        }

        // --- Samo server menjan: preuzmi. ---
        if (lokalniCist && !serverskiCist) {
            nalPrimeniPodatke(serverDok.podaci);
            nalZabeleziSinhro(serverDok.hash);
            if (!opc.tiho && typeof prikaziToast === 'function') prikaziToast(t('nal.toastPreuzeti'), 'uspeh');
            return;
        }

        // --- Samo lokalno menjano: pošalji. ---
        if (!lokalniCist && serverskiCist) {
            const rez = await nalGurni(lokalniPodaci, meta.hash, false);
            if (rez.prekid) return;
            if (rez.sukob) { nalPrikaziSukob(rez.dokument); return; }
            nalZabeleziSinhro(rez.hash);
            if (!opc.tiho && typeof prikaziToast === 'function') prikaziToast(t('nal.toastPoslato'), 'uspeh');
            return;
        }

        // --- Oba strane menjane: sukob. ---
        nalPrikaziSukob(serverDok);
    } catch (e) {
        const sad = Date.now();
        if ((!opc.tiho || sad - nalStanje.poslednjaGreskaToast > 60000) && typeof prikaziToast === 'function') {
            nalStanje.poslednjaGreskaToast = sad;
            prikaziToast(t('nal.toastGreskaSinhro'), 'greska');
        }
    } finally {
        nalStanje.uToku = false;
        nalAzurirajUI();
    }
}

// Pošalji podatke na server. Vraća { hash } | { sukob, dokument } | { prekid }.
async function nalGurni(podaci, osnoviHash, forsiraj) {
    const odg = await nalZahtev('PUT', '/api/podaci', {
        podaci: podaci,
        osnoviHash: osnoviHash || null,
        forsiraj: !!forsiraj
    }, { auth: true, tajmaut: 10000 });

    if (odg.status === 401) { nalAutoIstekla(); return { prekid: true }; }
    if (odg.status === 409 && odg.data) return { sukob: true, dokument: odg.data };
    if (!odg.ok) throw new Error('gurni');
    return { hash: odg.data && odg.data.hash };
}

// Istekla sesija tokom sinhronizacije.
function nalAutoIstekla() {
    try {
        localStorage.removeItem(NALOG_TOKEN_KLJUC);
        localStorage.removeItem(NALOG_SINHRO_KLJUC);
    } catch (e) { }
    nalStanje.prijavljen = false;
    nalStanje.ime = null;
    nalStanje.info = null;
    nalStanje.sinhro = null;
    if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastSesijaIstekla'), 'info');
    nalAzurirajUI();
}

// Poziv funkcije ako postoji, sa gutanjem greške: osvežavanje prikaza nije
// kritično za sinhronizaciju i ne sme da obusti slanje i čuvanje podataka.
function nalBezbednoPozovi(naziv, fn) {
    try {
        if (typeof fn === 'function') fn();
    } catch (e) {
        console.warn('[nalog] osvežavanje prikaza palo (' + naziv + '):', e && e.message);
    }
}

// Primena podataka preuzetih sa servera (isto kao uvoz uz zamenu).
// Zamena i čuvanje podataka su u prvom bloku. Osvežavanje sučelja je odvojeno
// i svaki deo ide nezavisno, da greška u prikazu jedne beleške ne obusti sve.
function nalPrimeniPodatke(noviPodaci) {
    if (!noviPodaci || !noviPodaci.settings) return;
    nalStanje.primenjuje = true;
    try {
        Store.dispatch({
            type: 'PODACI_ZAMENI',
            payload: {
                settings: { ...JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA)), ...(noviPodaci.settings || {}) },
                schedule: noviPodaci.schedule || [],
                notes: (noviPodaci.notes || []).map(n => ({ ...n, pinned: n.pinned === true }))
            }
        });
        if (typeof ucitajPodatkeStrukturu === 'function') ucitajPodatkeStrukturu();
        sacuvajPodatke();
    } finally {
        nalStanje.primenjuje = false;
    }

    // Osvežavanje prikaza: svako posebno, redosled je bitan.
    nalBezbednoPozovi('tema', () => primeniTemu());
    nalBezbednoPozovi('auto tema', () => azurirajAutoTemu(true, true));
    nalBezbednoPozovi('jezik', () => postaviJezik(podaciAplikacije.settings.language, { sacuvaj: false, osvezi: false }));
    nalBezbednoPozovi('auto smena', () => azurirajAutoSmenu());
    nalBezbednoPozovi('prikaz sve', () => prikaziSve());
}

// Poziva iz skladiste.js posle svakog čuvanja podataka.
function nalObeleziIzmenu() {
    if (nalStanje.primenjuje) return;

    const sad = new Date().toISOString();
    // Trajni žig poslednje izmene: koristi ga spajanje i posle odjave i ponovne prijave.
    try { localStorage.setItem(NALOG_IZMENA_KLJUC, sad); } catch (e) { }

    const meta = nalCitajSinhro();
    if (meta) {
        meta.izmena = sad;
        try { localStorage.setItem(NALOG_SINHRO_KLJUC, JSON.stringify(meta)); } catch (e) { }
        nalStanje.sinhro = meta;
    }
    nalAzurirajUI();

    // Automatsko slanje kad smo prijavljeni i server radi.
    if (nalStanje.prijavljen && nalStanje.serverDostupan && nalAutoSinhro()) {
        nalZakaziAutoSinhro();
    }
}

function nalZakaziAutoSinhro() {
    if (nalStanje.tajmerAuto) clearTimeout(nalStanje.tajmerAuto);
    nalStanje.tajmerAuto = setTimeout(() => {
        nalStanje.tajmerAuto = null;
        if (nalStanje.prijavljen && nalStanje.serverDostupan) nalSinhronizuj({ tiho: true });
    }, 2500);
}

// ===== SPAJANJE (MERGE) =====
// Spajanje jednog niza (beleške, časovi, predmeti) po ID: unija bez duplikata.
// Ako je isti ID na obe strane, uzima se stavka sa strane koja ima prednost.
// Napomena: brisanja se NE prenose kroz spajanje. Stavka obrisana na jednoj
// strani se vraća ako postoji na drugoj, jer unija po ID-u nema podatak da je
// neko tu stavku obrisao. Zato dijalog sukoba nosi vidljivu napomenu korisniku.
// Pravi prenos brisanja bi tražio tombstone zapise (deleted: true sa vremenom
// brisanja) koje bi ova funkcija poštovala. To je tek ideja za neku verziju v2.
function nalSpojiNiz(lokalniNiz, serverskiNiz, lokalniImaPrednost, brojac) {
    const mapa = new Map();
    (serverskiNiz || []).forEach(stavka => {
        if (stavka && stavka.id !== undefined) mapa.set(String(stavka.id), stavka);
    });
    let dodato = 0;
    (lokalniNiz || []).forEach(stavka => {
        if (!stavka || stavka.id === undefined) return;
        const kljuc = String(stavka.id);
        if (!mapa.has(kljuc)) {
            mapa.set(kljuc, stavka);
            dodato++;
        } else if (lokalniImaPrednost) {
            const postojeca = mapa.get(kljuc);
            if (nalKanonickiJson(postojeca) !== nalKanonickiJson(stavka)) {
                mapa.set(kljuc, stavka); // isti ID, različit sadržaj → novija strana
            }
        }
    });
    if (brojac) brojac.dodato = dodato;
    return Array.from(mapa.values());
}

function nalSpoji(lokalni, serverski, serverAzurirano) {
    const meta = nalStanje.sinhro || nalCitajSinhro();
    // Vreme poslednje lokalne izmene: iz sinhro mete, a padovi na trajni žig
    // (korisno posle odjave, jer se meta briše a izmene pamte).
    let lokalnaIzmena = meta && meta.izmena ? new Date(meta.izmena).getTime() : 0;
    if (!lokalnaIzmena) {
        try {
            const ziv = localStorage.getItem(NALOG_IZMENA_KLJUC);
            if (ziv) lokalnaIzmena = new Date(ziv).getTime() || 0;
        } catch (e) { }
    }
    const serverskaIzmena = serverAzurirano ? new Date(serverAzurirano).getTime() : 0;
    const lokalniNoviji = lokalnaIzmena >= serverskaIzmena;

    const b = { dodato: 0 }, c = { dodato: 0 }, p = { dodato: 0 };
    const beleske = nalSpojiNiz(lokalni.notes, serverski.notes, lokalniNoviji, b);
    const raspored = nalSpojiNiz(lokalni.schedule, serverski.schedule, lokalniNoviji, c);
    const predmeti = nalSpojiNiz(
        (lokalni.settings && lokalni.settings.subjects) || [],
        (serverski.settings && serverski.settings.subjects) || [],
        lokalniNoviji, p
    );

    // Ostala podešavanja se uzimaju sa novije strane.
    const osnovna = JSON.parse(JSON.stringify(lokalniNoviji ? lokalni : serverski));
    if (!osnovna.settings) osnovna.settings = {};
    osnovna.settings.subjects = predmeti;

    return {
        podaci: {
            settings: osnovna.settings,
            schedule: raspored,
            notes: beleske
        },
        izvestaj: { beleske: b.dodato, casovi: c.dodato, predmeti: p.dodato }
    };
}

// ===== DIJALOG SUKOBA =====
let nalSukobDokument = null;

function nalPrikaziSukob(serverDokument, opcije) {
    nalSukobDokument = serverDokument;
    const lokalni = podaciAplikacije;
    const server = serverDokument.podaci || { settings: {}, schedule: [], notes: [] };

    const popuni = (id, podaci, vremeTekst) => {
        const el = document.getElementById(id);
        if (!el) return;
        const beleske = (podaci.notes || []).length;
        const casovi = (podaci.schedule || []).length;
        const predmeti = ((podaci.settings && podaci.settings.subjects) || []).length;
        el.innerHTML =
            '<dt>' + esc(t('nal.sukobBeleske', { n: beleske })) + '</dt>' +
            '<dt>' + esc(t('nal.sukobCasovi', { n: casovi })) + '</dt>' +
            '<dt>' + esc(t('nal.sukobPredmeti', { n: predmeti })) + '</dt>' +
            '<dt class="nal-sukob-vreme">' + esc(vremeTekst) + '</dt>';
    };

    const meta = nalCitajSinhro();
    const lokalnaIzmena = meta && meta.izmena ? new Date(meta.izmena) : null;
    popuni('nalSukobLokalnoLista', lokalni, t('nal.sukobIzmenjeno', {
        vreme: lokalnaIzmena ? formatirajDatum(lokalnaIzmena) + ' ' +
            String(lokalnaIzmena.getHours()).padStart(2, '0') + ':' + String(lokalnaIzmena.getMinutes()).padStart(2, '0') : t('nal.biosPoslednjaNikad')
    }));

    let serverskoVreme = t('nal.biosPoslednjaNikad');
    if (serverDokument.azurirano) {
        try {
            const d = new Date(serverDokument.azurirano);
            serverskoVreme = t('nal.sukobIzmenjeno', {
                vreme: formatirajDatum(d) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
            });
        } catch (e) { }
    }
    popuni('nalSukobServerLista', server, serverskoVreme);

    otvoriModal('modalNalogSukob');
    nalStanje.sukobOtovren = true;
    const fokus = document.querySelector('#modalNalogSukob .nal-opcija[data-izbor="spoji"]');
    if (fokus) setTimeout(() => { try { fokus.focus(); } catch (e) { } }, 120);
}

function nalZatvoriSukob(odlozeno) {
    zatvoriModal('modalNalogSukob');
    nalStanje.sukobOtovren = false;
    nalSukobDokument = null;
    if (odlozeno && typeof prikaziToast === 'function') {
        prikaziToast(t('nal.toastOdgodjeno'), 'info');
    }
}

async function nalResiSukob(izbor) {
    const dokument = nalSukobDokument;
    if (!dokument) return nalZatvoriSukob(false);
    const lokalniPodaci = JSON.parse(JSON.stringify(podaciAplikacije));

    if (izbor === 'lokalno') {
        nalZatvoriSukob(false);
        const rez = await nalGurni(lokalniPodaci, null, true); // forsiraj prepisivanje servera
        if (rez.prekid) return;
        if (rez.hash) {
            nalZabeleziSinhro(rez.hash);
            if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastZadrzaoLokalne'), 'uspeh');
        }
        return;
    }

    if (izbor === 'server') {
        nalZatvoriSukob(false);
        nalPrimeniPodatke(dokument.podaci);
        nalZabeleziSinhro(dokument.hash);
        if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastZadrzaoServer'), 'uspeh');
        return;
    }

    if (izbor === 'spoji') {
        nalZatvoriSukob(false);
        const spoj = nalSpoji(lokalniPodaci, dokument.podaci, dokument.azurirano);
        nalPrimeniPodatke(spoj.podaci);
        const rez = await nalGurni(spoj.podaci, null, true); // spoj uključuje obe strane → forsiraj
        if (rez.prekid) return;
        if (rez.hash) nalZabeleziSinhro(rez.hash);
        if (typeof prikaziToast === 'function') {
            prikaziToast(t('nal.toastSpojeno', {
                b: spoj.izvestaj.beleske, c: spoj.izvestaj.casovi, p: spoj.izvestaj.predmeti
            }), 'uspeh');
        }
        return;
    }
}

// ===== KORISNIČKI PREGLED NALOGA (u modalu) =====
// Popuni pregled naloga u modalu: ime, avatar, adresa servera, poslednja sinhro, veličina.
function nalPopuniPregled() {
    const imeEl = document.getElementById('nalPregledIme');
    const avatarEl = document.getElementById('nalPregledAvatar');
    const meta = nalCitajSinhro();
    const poslednjaEl = document.getElementById('nalPregledPoslednja');
    const serverEl = document.getElementById('nalPregledServer');
    const velicinaEl = document.getElementById('nalPregledVelicina');

    if (imeEl) imeEl.textContent = nalStanje.ime || '/';
    if (avatarEl) avatarEl.textContent = (nalStanje.ime || '?').charAt(0);
    if (serverEl) serverEl.textContent = nalServerUrl() || t('nal.serverIstiOrigin');
    if (poslednjaEl) {
        if (meta && meta.vreme) {
            try {
                const d = new Date(meta.vreme);
                poslednjaEl.textContent = formatirajDatum(d) + ' ' +
                    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
            } catch (e) { poslednjaEl.textContent = t('nal.biosPoslednjaNikad'); }
        } else poslednjaEl.textContent = t('nal.biosPoslednjaNikad');
    }
    if (velicinaEl) velicinaEl.textContent = nalStanje.info && nalStanje.info.velicinaKB ? nalStanje.info.velicinaKB + ' KB' : '/';
}

// ===== KORISNIČKI INTERFEJS =====
function nalAzurirajUI() {
    // Dugme u zaglavlju.
    const dugme = document.getElementById('dugmeNalog');
    if (dugme) {
        const tacka = dugme.querySelector('.nal-tacka');
        if (tacka) {
            tacka.className = 'nal-tacka';
            if (nalStanje.prijavljen) {
                tacka.classList.add(nalStanje.serverDostupan ? (nalJePrljavo() ? 'nal-tacka--upozorenje' : 'nal-tacka--dobro') : 'nal-tacka--nedostupno');
            }
        }
        dugme.title = nalStanje.prijavljen ? t('nal.headerPrijavljen', { ime: nalStanje.ime || '?' }) : t('nal.headerPrijava');
        dugme.setAttribute('aria-label', dugme.title);
    }

    // Statusna traka u zaglavlju.
    const cip = document.getElementById('nalCip');
    const sep = document.getElementById('nalCipSep');
    if (cip && sep) {
        const prikazi = nalStanje.prijavljen || nalToken();
        cip.hidden = !prikazi;
        sep.hidden = !prikazi;
        if (prikazi) {
            cip.className = 'nal-cip';
            if (!nalStanje.serverDostupan) {
                cip.classList.add('nal-cip--lose');
                cip.textContent = t('nal.cipNedostupan');
            } else if (nalStanje.uToku) {
                cip.classList.add('nal-cip--info');
                cip.textContent = t('nal.cipUToku');
            } else if (nalJePrljavo()) {
                cip.classList.add('nal-cip--upozorenje');
                cip.textContent = t('nal.cipNesinhronizovano');
            } else {
                cip.classList.add('nal-cip--dobro');
                const meta = nalCitajSinhro();
                let vreme = '';
                if (meta && meta.vreme) {
                    try {
                        const d = new Date(meta.vreme);
                        vreme = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
                    } catch (e) { }
                }
                cip.textContent = vreme ? t('nal.cipSinhronizovano', { vreme }) : t('nal.cipSinhronizovanoKratko');
            }
        }
    }

    // Ako je modal naloga otvoren, osveži ga.
    const modal = document.getElementById('modalNalog');
    if (modal && modal.classList.contains('prikazi')) nalOsveziModal();

    // Osveži BIOS ako je otvoren (status red).
    try {
        if (window.BIOS && typeof window.BIOS.otvoren === 'function' && window.BIOS.otvoren() && typeof osveziPrikaz === 'function') {
            osveziPrikaz();
        }
    } catch (e) { }
}

// Opis statusa za BIOS red.
function nalOpisStatusa() {
    const deoServer = nalServerPodesen()
        ? (nalStanje.serverDostupan ? t('nal.biosServerRadi') : t('nal.biosServerNedostupan'))
        : t('nal.biosServerNijePodesen');
    const deoNalog = nalStanje.prijavljen
        ? t('nal.biosStatusPrijavljen', { ime: nalStanje.ime || '?' })
        : t('nal.biosStatusNeprijavljen');
    return deoNalog + ' · ' + deoServer;
}

// ===== POSTAVLJANJE ADRESE SERVERA =====
function nalPostaviServerUrl(url) {
    let cist = String(url || '').trim();
    if (cist) {
        cist = cist.replace(/\/+$/, '');
        if (!/^https?:\/\/[^\s]+$/i.test(cist)) {
            if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastLosUrl'), 'greska');
            return false;
        }
    }
    try { localStorage.setItem(NALOG_SERVER_KLJUC, cist); } catch (e) { }
    nalStanje.serverDostupan = false;
    nalProveriServer('rucno');
    nalAzurirajUI();
    if (typeof prikaziToast === 'function') prikaziToast(cist ? t('nal.toastUrlPodesen') : t('nal.toastUrlObrisan'), 'uspeh');
    return true;
}

// ===== DOGAĐAJI I INICIJALIZACIJA =====
// Kači sve događaje: zaglavlje, mobilni meni, modal naloga, dijalog sukoba,
// promene mreže, napuštanje stranice i vidljivost taba.
function nalZakačiDogađaje() {
    // Zaglavlje.
    const dugme = document.getElementById('dugmeNalog');
    if (dugme) dugme.addEventListener('click', nalOtvoriModal);

    // Mobilni meni.
    const meniDugme = document.getElementById('meniNalog');
    if (meniDugme) meniDugme.addEventListener('click', () => {
        zatvoriMobilniMeni();
        nalOtvoriModal();
    });

    // Modal naloga.
    const zatvori = document.getElementById('zatvoriModalNalog');
    if (zatvori) zatvori.addEventListener('click', nalZatvoriModal);
    const nastavi = document.getElementById('nalDugmeNastavi');
    if (nastavi) nastavi.addEventListener('click', nalZatvoriModal);

    const tabP = document.getElementById('nalTabPrijava');
    if (tabP) tabP.addEventListener('click', () => nalPrebaciTab('prijava'));
    const tabR = document.getElementById('nalTabRegistracija');
    if (tabR) tabR.addEventListener('click', () => nalPrebaciTab('registracija'));

    const formaP = document.getElementById('nalFormaPrijava');
    if (formaP) formaP.addEventListener('submit', (e) => { e.preventDefault(); nalPrijavi(); });
    const formaR = document.getElementById('nalFormaRegistracija');
    if (formaR) formaR.addEventListener('submit', (e) => { e.preventDefault(); nalRegistruj(); });

    const preklop = document.getElementById('nalPreklopServer');
    if (preklop) preklop.addEventListener('click', () => {
        const telo = document.getElementById('nalServerTelo');
        if (!telo) return;
        telo.hidden = !telo.hidden;
        preklop.setAttribute('aria-expanded', String(!telo.hidden));
    });
    const dugmeUrl = document.getElementById('nalDugmeSacuvajServer');
    if (dugmeUrl) dugmeUrl.addEventListener('click', () => {
        const polje = document.getElementById('nalServerUrl');
        if (polje) nalPostaviServerUrl(polje.value);
    });

    // Pregled naloga (kad je prijavljen).
    const dugmeSinhro = document.getElementById('nalPregledSinhronizuj');
    if (dugmeSinhro) dugmeSinhro.addEventListener('click', () => { nalZatvoriModal(); nalSinhronizuj({}); });
    const dugmeOdjava = document.getElementById('nalPregledOdjavi');
    if (dugmeOdjava) dugmeOdjava.addEventListener('click', nalOdjavi);

    // Dijalog sukoba: izbor opcija.
    document.querySelectorAll('#modalNalogSukob .nal-opcija').forEach(opcija => {
        opcija.addEventListener('click', () => {
            nalResiSukob(opcija.getAttribute('data-izbor')).catch(() => {
                // Neočekivana greška pri rešavanju sukoba: korisnik mora da je vidi.
                if (typeof prikaziToast === 'function') prikaziToast(t('nal.toastGreskaSinhro'), 'greska');
            });
        });
    });
    const sukobOtkazi = document.getElementById('nalSukobOtkazi');
    if (sukobOtkazi) sukobOtkazi.addEventListener('click', () => nalZatvoriSukob(true));

    // ESC na dijalogu sukoba = odloži (uhvati pre opšteg handlera).
    document.addEventListener('keydown', (e) => {
        if (nalStanje.sukobOtovren && (e.key === 'Escape' || e.key === 'Esc')) {
            e.preventDefault();
            e.stopPropagation();
            nalZatvoriSukob(true);
        }
    }, true);

    // Mreža: prelazi online/offline.
    window.addEventListener('online', () => nalProveriServer('online'));
    window.addEventListener('offline', () => {
        if (nalStanje.serverDostupan && nalStanje.prijavljen && typeof prikaziToast === 'function') {
            prikaziToast(t('nal.toastOffline'), 'greska');
        }
        nalStanje.serverDostupan = false;
        nalAzurirajUI();
    });

    // Upozorenje pri napuštanju stranice sa nesinhronizovanim izmenama.
    window.addEventListener('beforeunload', (e) => {
        if (nalStanje.prijavljen && nalJePrljavo()) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // Povratak na tab → proveri server i sinhronizuj ako treba.
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && nalStanje.prijavljen) {
            nalProveriServer('vidljivo').then(() => {
                if (nalStanje.serverDostupan && nalJePrljavo() && nalAutoSinhro()) {
                    nalSinhronizuj({ tiho: true });
                }
            });
        }
    });
}

// Inicijalizacija modula (samo jednom): stanje, događaji, prva provera servera.
function nalInit() {
    if (nalStanje.inicijalizovan) return;
    nalStanje.inicijalizovan = true;
    nalStanje.sinhro = nalCitajSinhro();
    nalZakačiDogađaje();
    nalAzurirajUI();
    nalProveriServer('start');
    nalPokreniProveru();
}

// ===== JAVNI API =====
window.Nalog = {
    init: nalInit,
    otvoriModal: nalOtvoriModal,
    zatvoriModal: nalZatvoriModal,
    sinhronizuj: () => nalSinhronizuj({}),
    odjavi: nalOdjavi,
    obeleziIzmenu: nalObeleziIzmenu,
    opisStatusa: nalOpisStatusa,
    serverUrl: nalServerUrl,
    postaviServerUrl: nalPostaviServerUrl,
    autoSinhro: nalAutoSinhro,
    postaviAutoSinhro: nalPostaviAutoSinhro,
    poslednjaSinhronizacija: () => {
        const meta = nalCitajSinhro();
        return meta && meta.vreme ? meta.vreme : null;
    },
    jePrijavljen: () => nalStanje.prijavljen,
    jeServerDostupan: () => nalStanje.serverDostupan,
    jePrljavo: nalJePrljavo,
    stanje: () => ({
        prijavljen: nalStanje.prijavljen,
        ime: nalStanje.ime,
        serverDostupan: nalStanje.serverDostupan,
        serverPodesen: nalServerPodesen()
    })
};

// Pokretanje: dogadjaji.js poziva Nalog.init() unutar DOMContentLoaded,
// ali ako se modul učita kasnije, pokreni sam.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(nalInit, 0));
} else {
    setTimeout(nalInit, 0);
}
