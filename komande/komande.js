'use strict';
const kpStanje = { otvorena: false, filtrirane: [], indeks: 0 };

function kpRegistar() {
    const s = podaciAplikacije.settings;
    const komande = [
        { ikona: 'sat', ikonaA: '[#]', naziv: t('kp.c.raspored'), kat: t('kp.k.navigacija'), taster: '1', kw: 'tab prikaz casovi schedule', akcija: () => prebaciTab('raspored') },
        { ikona: 'kalendar', ikonaA: '[D]', naziv: t('kp.c.kalendar'), kat: t('kp.k.navigacija'), taster: '2', kw: 'tab prikaz mesec calendar', akcija: () => prebaciTab('kalendar') },
        { ikona: 'beleske', ikonaA: '[N]', naziv: t('kp.c.beleske'), kat: t('kp.k.navigacija'), taster: '3', kw: 'tab prikaz notes', akcija: () => prebaciTab('beleske') },
        { ikona: 'danas', ikonaA: '[*]', naziv: t('kp.c.danas'), kat: t('kp.k.kalendar'), kw: 'danas mesec skok today', akcija: kalendarNaDanas }
    ];

    for (let d = 0; d < 5; d++) {
        komande.push({
            ikona: 'kalendar_nedelja', ikonaA: '>>', naziv: t('kp.c.nedelja', { dan: DANI_LAT[d] }), kat: t('kp.k.nedelja'), kw: 'nedelja dan kolona week',
            akcija: () => { prebaciTab('raspored'); postaviKolonuDana(d); }
        });
    }

    komande.push(
        { ikona: 'plus', ikonaA: '[+]', naziv: t('kp.c.novaBeleska'), kat: t('kp.k.beleske'), taster: 'N', kw: 'dodaj napravi note', akcija: () => { prebaciTab('beleske'); otvoriModalBeleska(); } },
        {
            ikona: 'lupa', ikonaA: '[/]', naziv: t('kp.c.pretragaBeleski'), kat: t('kp.k.beleske'), taster: '/', kw: 'trazi nadji filter search', akcija: () => {
                prebaciTab('beleske');
                setTimeout(() => { const u = document.getElementById('pretragaBeleske'); if (u) u.focus(); }, 0);
            }
        },
        {
            ikona: 'stampac', ikonaA: 'PRN', naziv: t('kp.c.stampaj'), kat: t('kp.k.alati'), kw: 'stampa pdf papir nedelja print week', akcija: () => {
                prikaziToast(t('kp.stampajToast'), 'info');
                setTimeout(() => window.print(), 150);
            }
        },
        {
            ikona: 'lupa', ikonaA: '[>]', naziv: t('kp.c.pretragaPredmeta'), kat: t('kp.k.alati'), taster: 'S', kw: 'predmet trazi nadji filter istakni zarez multi subject', akcija: () => {
                prebaciTab('raspored');
                otvoriPretraguPredmeta();
            }
        },
        {
            ikona: 'kvacica_kvadrat', ikonaA: '[M]', naziv: t('kp.c.multi'), kat: t('kp.k.alati'), taster: 'M', kw: 'multi vise izbor grupna izmena brisanje casovi bulk', akcija: () => {
                otvoriMultiSelect();
            }
        },
        {
            ikona: 'rotacija', ikonaA: '[R]', naziv: t('kp.c.rezimSmene'), kat: t('kp.k.alati'), kw: 'smena rotacija nedelja mesec polugodiste godina rezim shift', akcija: () => {
                if (window.BIOS && typeof window.BIOS.otvori === 'function') window.BIOS.otvori('smene');
            }
        },
        { ikona: 'izvoz', ikonaA: 'EXP', naziv: t('kp.c.izvoz'), kat: t('kp.k.podaci'), kw: 'backup sacuvaj json export', akcija: izveziPodatke },
        { ikona: 'paleta', ikonaA: '[T]', naziv: s.codeTheme ? t('kp.c.codeVarijanta') : t('kp.c.promeniTemu'), kat: t('kp.k.izgled'), taster: 'T', kw: 'tema boja izgled svetla tamna automatska theme', akcija: promeniTemu }
    );

    if (stanje.pretraga) {
        komande.push({
            ikona: 'ocisti', ikonaA: '[X]', naziv: t('kp.c.ocisti'), kat: t('kp.k.beleske'), kw: 'reset brisi clear', akcija: () => {
                ocistiPretragu();
                prikaziToast(t('kp.c.ocistiToast'), 'info');
            }
        });
    }

    if (s.codeUnlocked) {
        komande.push({
            ikona: 'munja', ikonaA: 'GX',
            naziv: s.codeTheme ? t('kp.c.codeIskljuci') : t('kp.c.codeUkljuci'),
            kat: t('kp.k.izgled'),
            kw: 'code codes matrix fosfor hacker',
            akcija: aktivirajCodeTemu
        });
    }

    komande.push(
        {
            ikona: 'iskre', ikonaA: '[*]', naziv: t('kp.c.novo'), kat: t('kp.k.sistem'), kw: 'novo novine changelog verzija update izmene what new', akcija: () => {
                if (window.Novine && typeof window.Novine.otvori === 'function') window.Novine.otvori();
            }
        },
        {
            ikona: 'podesavanja', ikonaA: '[S]', naziv: t('kp.c.bios'), kat: t('kp.k.sistem'), taster: 'DEL', kw: 'podesavanja settings konfiguracija bios', akcija: () => {
                if (window.BIOS && typeof window.BIOS.otvori === 'function') window.BIOS.otvori();
            }
        },
        { ikona: 'pomoc', ikonaA: '[?]', naziv: t('kp.c.precice'), kat: t('kp.k.sistem'), taster: '?', kw: 'precice pomoc help tastatura shortcuts', akcija: () => prikaziToast(TEKST_PRECICA, 'info') }
    );

    return komande;
}

function kpOtvori() {
    const overlay = document.getElementById('kpOverlay');
    if (!overlay) return;
    kpStanje.otvorena = true;
    overlay.hidden = false;
    const unos = document.getElementById('kpUnos');
    if (unos) unos.value = '';
    kpStanje.indeks = 0;
    kpRender();
    setTimeout(() => { if (unos) unos.focus(); }, 30);
}

function kpZatvori() {
    const overlay = document.getElementById('kpOverlay');
    kpStanje.otvorena = false;
    if (overlay) overlay.hidden = true;
}

function kpPreklopi() { if (kpStanje.otvorena) kpZatvori(); else kpOtvori(); }

function kpRender() {
    const lista = document.getElementById('kpLista');
    if (!lista) return;

    const unosEl = document.getElementById('kpUnos');
    const upit = normalizujTekst(unosEl ? unosEl.value : '');
    const sve = kpRegistar();
    kpStanje.filtrirane = upit
        ? sve.filter(k => normalizujTekst(k.naziv + ' ' + k.kat + ' ' + (k.taster || '') + ' ' + (k.kw || '')).includes(upit))
        : sve;
    if (kpStanje.indeks >= kpStanje.filtrirane.length) kpStanje.indeks = Math.max(0, kpStanje.filtrirane.length - 1);

    if (!kpStanje.filtrirane.length) {
        lista.innerHTML = `
            <div class="kp-prazno">
                <span class="kp-prazno-ikona" aria-hidden="true">⌘</span>
                <p>${esc(t('kp.prazno', { upit: skratiTekst(upit, 24) }))}</p>
                <span class="kp-prazno-savet">${esc(t('kp.savet'))}</span>
            </div>`;
        const brojac = document.getElementById('kpBrojac');
        if (brojac) { brojac.textContent = '0'; brojac.hidden = true; }
        return;
    }

    const brojac = document.getElementById('kpBrojac');
    if (brojac) {
        brojac.hidden = false;
        const rec = jeSrpski()
            ? (kpStanje.filtrirane.length === 1 ? 'komanda' : (kpStanje.filtrirane.length < 5 ? 'komande' : 'komandi'))
            : (kpStanje.filtrirane.length === 1 ? 'command' : 'commands');
        brojac.textContent = `${kpStanje.filtrirane.length} ${rec}`;
    }

    lista.innerHTML = kpStanje.filtrirane.map((k, i) => `
        <button type="button" class="kp-stavka${i === kpStanje.indeks ? ' izabrana' : ''}" data-i="${i}"
            role="option" aria-selected="${i === kpStanje.indeks}">
            <span class="kp-stavka-ikona" aria-hidden="true">${ikonica(k.ikona, k.ikonaA || '')}</span>
            <span class="kp-stavka-naziv">${esc(k.naziv)}</span>
            <span class="kp-stavka-kat" aria-hidden="true">${k.kat}</span>
            ${k.taster ? `<span class="kp-stavka-taster"><kbd>${esc(k.taster)}</kbd></span>` : ''}
        </button>`).join('');
}

function kpPomeri(smer) {
    const n = kpStanje.filtrirane.length;
    if (!n) return;
    kpStanje.indeks = (kpStanje.indeks + smer + n) % n;
    kpRender();
    const el = document.querySelector('.kp-stavka.izabrana');
    if (el) el.scrollIntoView({ block: 'nearest' });
}

function kpIzvrsi() {
    const komanda = kpStanje.filtrirane[kpStanje.indeks];
    if (!komanda) return;
    kpZatvori();
    try { komanda.akcija(); } catch (e) { prikaziToast(t('kp.nijeUspela'), 'greska'); }
}

window.KomandnaPaleta = {
    otvori: kpOtvori,
    zatvori: kpZatvori,
    preklopi: kpPreklopi,
    otvorena: () => kpStanje.otvorena
};
