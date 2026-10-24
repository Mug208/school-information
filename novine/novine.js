'use strict';

const NOVINE_KLJUC = 'skolski-info-novine';
const NOVINE_VERZIJA = '2.02';

const NOVINE_NASLOV = 'Šta je novo';
const NOVINE_PODNASLOV = 'Kratak pregled najvažnijih izmena u ovoj verziji.';

const NOVINE_STAVKE = [
    {
        ikona: 'paleta',
        ikonaA: '[T]',
        naziv: 'Nove ikonice kroz celu aplikaciju',
        opis: 'Emoji su zamenjeni sa 43 crtane ikonice. Prate boju teksta i temu, ' +
              'a u CODE temi se pretvaraju u ASCII oznake, pa terminal ostaje čist.'
    },
    {
        ikona: 'zvono',
        ikonaA: '[!]',
        naziv: 'Prozor „Šta je novo”',
        opis: 'Posle svake veće izmene dobijate ovaj kratak pregled. Prikazuje se ' +
              'samo jednom po verziji, a ručno ga otvarate iz komandne palete (Ctrl+K).'
    },
    {
        ikona: 'iskre',
        ikonaA: '[*]',
        naziv: 'Verzija 2.02',
        opis: 'Broj verzije je usklađen u zaglavlju, BIOS-u, komandnoj paleti i podnožju.'
    }
];

let novineOtvorene = false;
let novineFokusPre = null;

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

function novineTrebaPrikazati() {
    return NOVINE_STAVKE.length > 0 && novineVidjenaVerzija() !== NOVINE_VERZIJA;
}

function novineIscrtaj() {
    const verzijaEl = document.getElementById('novineVerzija');
    const naslovEl = document.getElementById('novineNaslov');
    const podnaslovEl = document.getElementById('novinePodnaslov');
    const listaEl = document.getElementById('novineLista');

    if (verzijaEl) verzijaEl.textContent = 'v' + NOVINE_VERZIJA;
    if (naslovEl) naslovEl.textContent = NOVINE_NASLOV;
    if (podnaslovEl) podnaslovEl.textContent = NOVINE_PODNASLOV;
    if (!listaEl) return;

    listaEl.innerHTML = NOVINE_STAVKE.map(stavka => `
        <li class="novine-stavka">
            <span class="novine-ikona" aria-hidden="true">${ikonica(stavka.ikona, stavka.ikonaA || '')}</span>
            <span class="novine-tekst">
                <span class="novine-naziv">${esc(stavka.naziv)}</span>
                <span class="novine-opis">${esc(stavka.opis)}</span>
            </span>
        </li>`).join('');
}

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
