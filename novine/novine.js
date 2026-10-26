// Prozor sta je novo: verzija, stavke i pamcenje sta je korisnik vec video.
'use strict';

const NOVINE_KLJUC = 'skolski-info-novine';
const NOVINE_VERZIJA = '2.03';

// ===== SADRZAJ NOVINA =====
const NOVINE_STAVKE = {
    en: [
        {
            ikona: 'paleta',
            ikonaA: '[T]',
            naziv: 'English language + Serbian',
            opis: 'The app now speaks English by default, and you can switch to Serbian ' +
                  'in BIOS → Main → Language. The change applies instantly.'
        },
        {
            ikona: 'meni',
            ikonaA: '[=]',
            naziv: 'New mobile side menu',
            opis: 'On phones the hamburger button now opens a slide-in side drawer ' +
                  'with navigation and quick actions, with an overlay and safe-area support.'
        },
        {
            ikona: 'kalendar',
            ikonaA: '[D]',
            naziv: 'Calendar fits small screens',
            opis: 'The calendar scales down on small displays, so the whole month is visible ' +
                  'without horizontal scrolling or zooming out.'
        },
        {
            ikona: 'skola',
            ikonaA: '[#]',
            naziv: 'Responsive redesign',
            opis: 'Header, schedule, notes and BIOS have been fine-tuned for narrow screens: ' +
                  'tighter paddings, larger touch targets and no more clipped content.'
        }
    ],
    sr: [
        {
            ikona: 'paleta',
            ikonaA: '[T]',
            naziv: 'Engleski + srpski jezik',
            opis: 'Aplikacija je sada podrazumevano na engleskom, a srpski se uključuje ' +
                  'u BIOS-u → Glavno → Jezik. Promena se primenjuje odmah.'
        },
        {
            ikona: 'meni',
            ikonaA: '[=]',
            naziv: 'Novi bočni meni na mobilnom',
            opis: 'Na telefonu hamburger dugme sada otvara bočni fioku-meni ' +
                  'sa navigacijom i brzim akcijama, sa prekrivačem i podrškom za safe-area.'
        },
        {
            ikona: 'kalendar',
            ikonaA: '[D]',
            naziv: 'Kalendar staje na male ekrane',
            opis: 'Kalendar se smanjuje na malim ekranima, pa je ceo mesec vidljiv ' +
                  'bez horizontalnog skrolovanja i zumiranja.'
        },
        {
            ikona: 'skola',
            ikonaA: '[#]',
            naziv: 'Responzivni redizajn',
            opis: 'Zaglavlje, raspored, beleške i BIOS su doterani za uske ekrane: ' +
                  'manje paddinge, veće dodirne ciljeve i bez odsečenog sadržaja.'
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
