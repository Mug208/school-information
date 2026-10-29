// Prozor sta je novo: verzija, stavke i pamcenje sta je korisnik vec video.
'use strict';

const NOVINE_KLJUC = 'skolski-info-novine';
const NOVINE_VERZIJA = '2.1';

// ===== SADRZAJ NOVINA =====
const NOVINE_STAVKE = {
    en: [
        {
            ikona: 'nalog',
            ikonaA: '[U]',
            naziv: 'Login and data sync',
            opis: 'Run the included server on an old laptop (node server/server.js) and every ' +
                  'user gets their own JSON file on it. Log in from any device in your network.'
        },
        {
            ikona: 'sinhro',
            ikonaA: '[~]',
            naziv: 'Offline-first with warnings',
            opis: 'No server? No problem, the app works exactly as before and data stays in the ' +
                  'browser. A status chip warns you about unsynced changes and the unreachable server.'
        },
        {
            ikona: 'oblak',
            ikonaA: 'CLD',
            naziv: 'Conflict resolution: keep / keep / merge',
            opis: 'If the data changed both locally and on the server, you choose: keep local, ' +
                  'keep the server copy, or merge both without duplicates.'
        },
        {
            ikona: 'katanac',
            ikonaA: '[#]',
            naziv: 'Passwords are hashed, data stays yours',
            opis: 'The server stores scrypt-hashed passwords and one JSON file per user. ' +
                  'No npm dependencies, no database, plain files on your own machine.'
        },
        {
            ikona: 'pomoc',
            ikonaA: '[?]',
            naziv: 'Note for opening from disk',
            opis: 'Server settings now explain that an app opened directly from disk (file://) ' +
                  'cannot detect the server address automatically, so you enter it by hand.'
        }
    ],
    sr: [
        {
            ikona: 'nalog',
            ikonaA: '[U]',
            naziv: 'Prijava i sinhronizacija podataka',
            opis: 'Pokreni priloženi server na starom laptopu (node server/server.js) i svaki ' +
                  'korisnik dobija svoj JSON fajl na njemu. Prijavi se sa bilo kog uređaja u mreži.'
        },
        {
            ikona: 'sinhro',
            ikonaA: '[~]',
            naziv: 'Offline-first sa upozorenjima',
            opis: 'Nema servera? Nema problema, aplikacija radi kao i ranije, podaci ostaju u ' +
                  'pregledaču. Statusna oznaka upozorava na nesinhronizovane izmene i nedostupan server.'
        },
        {
            ikona: 'oblak',
            ikonaA: 'CLD',
            naziv: 'Rešavanje sukoba: zadrži / zadrži / spoji',
            opis: 'Ako su podaci menjani i lokalno i na serveru, ti biraš: zadrži lokalne, ' +
                  'zadrži serverske ili spoji oba bez duplikata.'
        },
        {
            ikona: 'katanac',
            ikonaA: '[#]',
            naziv: 'Lozinke se hešuju, podaci ostaju tvoji',
            opis: 'Server čuva scrypt-hešovane lozinke i po jedan JSON fajl po korisniku. ' +
                  'Bez npm zavisnosti i bez baze, obični fajlovi na tvojoj mašini.'
        },
        {
            ikona: 'pomoc',
            ikonaA: '[?]',
            naziv: 'Napomena za otvaranje sa diska',
            opis: 'Podešavanja servera sada objašnjavaju da aplikacija otvorena direktno sa diska ' +
                  '(file://) ne može sama da prepozna adresu servera, pa se unosi ručno.'
        }
    ]
};

let novineOtvorene = false;
let novineFokusPre = null;

// ===== LOGIKA PRIKAZA =====
function novineVidjenaVerzija() {
    try {
        return localStorage.getItem(NOVINE_KLJUC) || '';
    } catch (e) {
        return '';
    }
}

function novineZapamtiVidjeno() {
    try {
        localStorage.setItem(NOVINE_KLJUC, NOVINE_VERZIJA);
    } catch (e) {  }
}

function novineStavke() {
    return (typeof trenutniJezik === 'function' && trenutniJezik() === 'sr') ? NOVINE_STAVKE.sr : NOVINE_STAVKE.en;
}

function novineTrebaPrikazati() {
    return novineStavke().length > 0 && novineVidjenaVerzija() !== NOVINE_VERZIJA;
}

// ===== ISCRTAVANJE =====
function novineIscrtaj() {
    const verzijaEl = document.getElementById('novineVerzija');
    const naslovEl = document.getElementById('novineNaslov');
    const podnaslovEl = document.getElementById('novinePodnaslov');
    const listaEl = document.getElementById('novineLista');

    if (verzijaEl) verzijaEl.textContent = 'v' + NOVINE_VERZIJA;
    if (naslovEl) naslovEl.textContent = t('nov.naslov');
    if (podnaslovEl) podnaslovEl.textContent = t('nov.podnaslov');
    if (!listaEl) return;

    listaEl.innerHTML = novineStavke().map(stavka => `
        <li class="novine-stavka">
            <span class="novine-ikona" aria-hidden="true">${ikonica(stavka.ikona, stavka.ikonaA || '')}</span>
            <span class="novine-tekst">
                <span class="novine-naziv">${esc(stavka.naziv)}</span>
                <span class="novine-opis">${esc(stavka.opis)}</span>
            </span>
        </li>`).join('');
}

// ===== OTVARANJE I ZATVARANJE =====
function otvoriNovine(prisilno = false) {
    const el = document.getElementById('modalNovine');
    if (!el || novineOtvorene) return false;
    if (!prisilno && !novineTrebaPrikazati()) return false;

    if (document.querySelector('.modal.prikazi')) return false;

    novineIscrtaj();
    novineFokusPre = document.activeElement;
    el.classList.add('prikazi');
    novineOtvorene = true;

    const dugme = document.getElementById('dugmeNovineUredu');
    if (dugme) setTimeout(() => { try { dugme.focus(); } catch (e) { } }, 90);
    return true;
}

function zatvoriNovine(zapamti = true) {
    const el = document.getElementById('modalNovine');
    if (!el) return;

    el.classList.remove('prikazi');
    novineOtvorene = false;

    if (zapamti) novineZapamtiVidjeno();

    if (novineFokusPre && typeof novineFokusPre.focus === 'function') {
        try { novineFokusPre.focus(); } catch (e) { }
    }
    novineFokusPre = null;
}

// ===== POKRETANJE I JAVNI API =====
function pokreniNovine() {
    if (!novineTrebaPrikazati()) return;
    setTimeout(() => otvoriNovine(), 600);
}

window.Novine = {
    otvori: () => otvoriNovine(true),
    zatvori: () => zatvoriNovine(true),
    otvorene: () => novineOtvorene,
    trebaPrikazati: novineTrebaPrikazati,
    verzija: () => NOVINE_VERZIJA,
    zaboravi: () => {
        try { localStorage.removeItem(NOVINE_KLJUC); } catch (e) { }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const zatvoriDugme = document.getElementById('zatvoriNovine');
    const ureduDugme = document.getElementById('dugmeNovineUredu');
    const prekrivac = document.querySelector('#modalNovine .modal-prekrivac');

    if (zatvoriDugme) zatvoriDugme.addEventListener('click', () => zatvoriNovine());
    if (ureduDugme) ureduDugme.addEventListener('click', () => zatvoriNovine());
    if (prekrivac) prekrivac.addEventListener('click', () => zatvoriNovine());

    pokreniNovine();
});
