'use strict';
const kpStanje = { otvorena: false, filtrirane: [], indeks: 0 };

function kpRegistar() {
    const s = podaciAplikacije.settings;
    const komande = [
        { ikona: 'sat', ikonaA: '[#]', naziv: 'Idi na Raspored', kat: 'NAVIGACIJA', taster: '1', kw: 'tab prikaz casovi', akcija: () => prebaciTab('raspored') },
        { ikona: 'kalendar', ikonaA: '[D]', naziv: 'Idi na Kalendar', kat: 'NAVIGACIJA', taster: '2', kw: 'tab prikaz mesec', akcija: () => prebaciTab('kalendar') },
        { ikona: 'beleske', ikonaA: '[N]', naziv: 'Idi na Beleške', kat: 'NAVIGACIJA', taster: '3', kw: 'tab prikaz', akcija: () => prebaciTab('beleske') },
        { ikona: 'danas', ikonaA: '[*]', naziv: 'Kalendar / vrati na danas', kat: 'KALENDAR', kw: 'danas mesec skok', akcija: kalendarNaDanas }
    ];

    for (let d = 0; d < 5; d++) {
        komande.push({
            ikona: 'kalendar_nedelja', ikonaA: '>>', naziv: 'Raspored / ' + DANI_LAT[d], kat: 'NEDELJA', kw: 'nedelja dan kolona',
            akcija: () => { prebaciTab('raspored'); postaviKolonuDana(d); }
        });
    }

    komande.push(
        { ikona: 'plus', ikonaA: '[+]', naziv: 'Nova beleška', kat: 'BELEŠKE', taster: 'N', kw: 'dodaj napravi', akcija: () => { prebaciTab('beleske'); otvoriModalBeleska(); } },
        {
            ikona: 'lupa', ikonaA: '[/]', naziv: 'Pretraga beleški', kat: 'BELEŠKE', taster: '/', kw: 'trazi nadji filter', akcija: () => {
                prebaciTab('beleske');
                setTimeout(() => { const u = document.getElementById('pretragaBeleske'); if (u) u.focus(); }, 0);
            }
        },
        {
            ikona: 'stampac', ikonaA: 'PRN', naziv: 'Odštampaj (raspored / cela nedelja / beleške)', kat: 'ALATI', kw: 'stampa pdf papir nedelja', akcija: () => {
                prikaziToast('Priprema za štampu… (cela nedelja)', 'info');
                setTimeout(() => window.print(), 150);
            }
        },
        {
            ikona: 'lupa', ikonaA: '[>]', naziv: 'Pretraga predmeta (raspored)', kat: 'ALATI', taster: 'S', kw: 'predmet trazi nadji filter istakni zarez multi', akcija: () => {
                prebaciTab('raspored');
                otvoriPretraguPredmeta();
            }
        },
        {
            ikona: 'kvacica_kvadrat', ikonaA: '[M]', naziv: 'Višestruki izbor časova (grupna izmena)', kat: 'ALATI', taster: 'M', kw: 'multi vise izbor grupna izmena brisanje casovi', akcija: () => {
                otvoriMultiSelect();
            }
        },
        {
            ikona: 'rotacija', ikonaA: '[R]', naziv: 'Režim smene / rotacija (BIOS → Smene)', kat: 'ALATI', kw: 'smena rotacija nedelja mesec polugodiste godina rezim', akcija: () => {
                if (window.BIOS && typeof window.BIOS.otvori === 'function') window.BIOS.otvori('smene');
            }
        },
        { ikona: 'izvoz', ikonaA: 'EXP', naziv: 'Izvoz podataka (JSON)', kat: 'PODACI', kw: 'backup sacuvaj json', akcija: izveziPodatke },
        { ikona: 'paleta', ikonaA: '[T]', naziv: s.codeTheme ? 'Promeni CODE varijantu (D / S / A)' : 'Promeni temu', kat: 'IZGLED', taster: 'T', kw: 'tema boja izgled svetla tamna automatska', akcija: promeniTemu }
    );

    if (stanje.pretraga) {
        komande.push({
            ikona: 'ocisti', ikonaA: '[X]', naziv: 'Očisti pretragu beleški', kat: 'BELEŠKE', kw: 'reset brisi', akcija: () => {
                ocistiPretragu();
                prikaziToast('Pretraga očišćena.', 'info');
            }
        });
    }

    if (s.codeUnlocked) {
        komande.push({
            ikona: 'munja', ikonaA: 'GX',
            naziv: s.codeTheme ? 'CODE tema / isključi' : 'CODE tema / uključi',
            kat: 'IZGLED',
            kw: 'code codes matrix fosfor hacker',
            akcija: aktivirajCodeTemu
        });
    }

    komande.push(
        {
            ikona: 'iskre', ikonaA: '[*]', naziv: 'Šta je novo u ovoj verziji', kat: 'SISTEM', kw: 'novo novine changelog verzija update izmene', akcija: () => {
                if (window.Novine && typeof window.Novine.otvori === 'function') window.Novine.otvori();
            }
        },
        {
            ikona: 'podesavanja', ikonaA: '[S]', naziv: 'BIOS podešavanja', kat: 'SISTEM', taster: 'DEL', kw: 'podesavanja settings konfiguracija', akcija: () => {
                if (window.BIOS && typeof window.BIOS.otvori === 'function') window.BIOS.otvori();
            }
        },
        { ikona: 'pomoc', ikonaA: '[?]', naziv: 'Spisak prečica (pomoć)', kat: 'SISTEM', taster: '?', kw: 'precice pomoc help tastatura', akcija: () => prikaziToast(TEKST_PRECICA, 'info') }
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
                <p>ERR_404: nema podudaranja za „${esc(skratiTekst(upit, 24))}”</p>
                <span class="kp-prazno-savet">Probajte: „raspored”, „beleska”, „tema”, „bios”…</span>
            </div>`;
        const brojac = document.getElementById('kpBrojac');
        if (brojac) { brojac.textContent = '0'; brojac.hidden = true; }
        return;
    }

    const brojac = document.getElementById('kpBrojac');
    if (brojac) {
        brojac.hidden = false;
        brojac.textContent = `${kpStanje.filtrirane.length} ${kpStanje.filtrirane.length === 1 ? 'komanda' : (kpStanje.filtrirane.length < 5 ? 'komande' : 'komandi')}`;
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
    try { komanda.akcija(); } catch (e) { prikaziToast('Komanda nije uspela.', 'greska'); }
}

window.KomandnaPaleta = {
    otvori: kpOtvori,
    zatvori: kpZatvori,
    preklopi: kpPreklopi,
    otvorena: () => kpStanje.otvorena
};
