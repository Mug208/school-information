// CODE tema: deljeno stanje i podesavanja efekata.
'use strict';

// ===== PODESAVANJA I STANJE =====
var cfg = {
    omogucen: false,
    intenzitet: 5,

    inverzija: false,
    kisa: false,
    skenLinije: false,
    treperenje: false,
    korupcija: false
};

var ZNAKOVI_KISE = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾈﾉﾊﾋﾌﾍﾎ01#$%&';
var ZNAKOVI_KORUPCIJE = '▓▒░#%&@$?!/\\|<>~^*';
var SELEKTOR_BAZENA = '.logo-naslov, .nav-dugme, .raspored-zaglavlje h2, ' +
    '.kartica-zaglavlje h3, .filter-dugme, .podnozje-levo span, ' +
    '.statusna-traka #nazivSmene, .kalendar-naslov';
var KORAK_KISE = 50;

var platno = null;
var kontekst = null;
var koren = null;
var inicijalizovan = false;
var pokrenut = false;

var kolone = [];
var velicinaFonta = 16;
var fontKise = '';
var dpr = 1;
var rafId = 0;
var prosliTrenutak = 0;
var akumulator = 0;

var tajmeri = {};
var brojacKorupcija = 0;
var aktivneKorupcije = [];
var pucketElement = null;
var prasakUToku = false;
var inverzijaUToku = false;

var medijaSmanjeno = (typeof window.matchMedia === 'function')
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

var kisaBoje = {
    glavna: '#00ff9c',
    svetla: '#b6ffe0',
    pozadina: '#030906',
    pozadinaAlfa: 'rgba(3,9,6,0.08)'
};

// ===== FUNKCIJE STANJA I TIMEROVA =====
function podesavanjaSmanjenogPomeranja() {
    return !!(medijaSmanjeno && medijaSmanjeno.matches);
}

function temaAktivna() {
    return !!(document.body && document.body.classList &&
        document.body.classList.contains('code-tema'));
}

function efikasneVrednosti() {
    var m = podesavanjaSmanjenogPomeranja();
    return {
        kisa: cfg.kisa && !m,
        inverzija: cfg.inverzija && !m,
        treperenje: cfg.treperenje && !m,
        korupcija: cfg.korupcija && !m,
        sken: cfg.skenLinije,
        prasak: !m
    };
}

function zakazi(ime, fn, ms) {
    ocisti(ime);
    tajmeri[ime] = setTimeout(fn, ms);
}

function ocisti(ime) {
    if (tajmeri[ime]) {
        clearTimeout(tajmeri[ime]);
        tajmeri[ime] = 0;
    }
}

function ocistiSve() {
    var kljuc;
    for (kljuc in tajmeri) {
        if (tajmeri.hasOwnProperty(kljuc)) ocisti(kljuc);
    }
}
