// BIOS: kategorije, otvaranje, stanje izmena i javni API window.BIOS.
'use strict';

// ===== KATEGORIJE =====
var KATEGORIJE = [
    { id: 'glavno', naziv: 'Glavno' },
    { id: 'predmeti', naziv: 'Predmeti' },
    { id: 'smene', naziv: 'Smene' },
    { id: 'efekti', naziv: 'Efekti' },
    { id: 'podaci', naziv: 'Podaci' },
    { id: 'izlaz', naziv: 'Izlaz' }
];

var BOJE_PRESETA = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#0d9488', '#3b82f6', '#8b5cf6', '#ec4899'];

// ===== STANJE BIOS-A =====
var otvorenFlag = false;
var faza = 'zatvoren';
var radna = null;
var snimak = null;
var aktivnaKategorija = 'glavno';
var izabraniId = null;
var trenutniRedoviModel = [];

var satTimer = null;
var bootTajmeri = [];
var bootInterval = null;
var dialogOtvoren = false;
var dijalogDugmad = [];
var sideOtvoren = false;

// ===== DOM POMOCNE =====
function dom(id) {
    return document.getElementById(id);
}

function svi(selektor, koren) {
    return Array.prototype.slice.call((koren || document).querySelectorAll(selektor));
}

function bEsc(t) {
    return String(t)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function dvoje(n) {
    return String(n).padStart(2, '0');
}

// ===== VREME I DATUM =====
function trenutnoVreme() {
    var d = new Date();
    return dvoje(d.getHours()) + ':' + dvoje(d.getMinutes()) + ':' + dvoje(d.getSeconds());
}

function trenutniDatum() {
    var d = new Date();
    return dvoje(d.getDate()) + '.' + dvoje(d.getMonth() + 1) + '.' + d.getFullYear();
}

// ===== OSTALE POMOCNE =====
function bezbednaBoja(hex) {
    return /^#[0-9a-fA-F]{6}$/.test(String(hex)) ? String(hex) : '#0d9488';
}

function bSkratiTekst(t) {
    t = String(t == null ? '' : t);
    return t.length > 28 ? t.slice(0, 27) + '…' : t;
}

function statistike() {
    try {
        if (window.App && typeof window.App.getStatistike === 'function') {
            var st = window.App.getStatistike();
            if (st && typeof st === 'object') return st;
        }
    } catch (e) {}
    return { predmeta: 0, beleski: 0, stavkiRasporeda: 0, velicinaKB: 0 };
}

function toast(poruka, tip) {
    try {
        if (window.App && typeof window.App.prikaziToast === 'function') {
            window.App.prikaziToast(poruka, tip || 'info');
        }
    } catch (e) {}
}

// ===== VREDNOSTI I BROJEVI =====
function uzmiVrednost(red) {
    return typeof red.get === 'function' ? red.get() : red.get;
}

function broj(v, podrazumevano, min, max) {
    var n = parseInt(v, 10);
    if (isNaN(n)) return podrazumevano;
    return Math.min(max, Math.max(min, n));
}

// ===== NORMALIZACIJA I VALIDACIJA =====
function normalizuj(p) {
    var n = {};
    try {
        n = JSON.parse(JSON.stringify(p || {}));
    } catch (e) {
        n = {};
    }
    n.schoolName = n.schoolName != null ? String(n.schoolName) : 'Školska Informacija';
    n.className = n.className != null ? String(n.className) : '';
    n.theme = n.theme === 'dark' ? 'dark' : 'light';
    n.periodsCount = broj(n.periodsCount, 6, 5, 8);
    n.currentShift = n.currentShift === 'popodnevna' ? 'popodnevna' : 'jutarnja';

    if (['rucno', 'sat', 'rotacija'].indexOf(n.shiftMode) < 0) {
        n.shiftMode = n.autoShiftChange === false ? 'rucno' : 'sat';
    }
    n.shiftRotation =
        ['nedelja', 'mesec', 'polugodiste', 'godina'].indexOf(n.shiftRotation) >= 0 ? n.shiftRotation : 'nedelja';
    var danRot = parseInt(n.shiftRotationDay, 10);
    n.shiftRotationDay = danRot >= 1 && danRot <= 7 ? danRot : 1;
    n.shiftRotationFirst = n.shiftRotationFirst === 'popodnevna' ? 'popodnevna' : 'jutarnja';
    n.shiftRotationStart = /^\d{4}-\d{2}-\d{2}$/.test(String(n.shiftRotationStart)) ? n.shiftRotationStart : '';
    n.autoShiftChange = n.shiftMode !== 'rucno';
    if (!n.shifts || typeof n.shifts !== 'object') n.shifts = {};
    n.shifts.jutarnja = Object.assign(
        { name: 'Jutarnja', startTime: '07:15', bigBreakAfterPeriod: 2 },
        n.shifts.jutarnja || {}
    );
    n.shifts.popodnevna = Object.assign(
        { name: 'Popodnevna', startTime: '13:30', bigBreakAfterPeriod: 2 },
        n.shifts.popodnevna || {}
    );
    n.shifts.jutarnja.bigBreakAfterPeriod = broj(n.shifts.jutarnja.bigBreakAfterPeriod, 2, 1, 4);
    n.shifts.popodnevna.bigBreakAfterPeriod = broj(n.shifts.popodnevna.bigBreakAfterPeriod, 2, 1, 4);
    if (!/^\d{2}:\d{2}$/.test(String(n.shifts.jutarnja.startTime))) n.shifts.jutarnja.startTime = '07:15';
    if (!/^\d{2}:\d{2}$/.test(String(n.shifts.popodnevna.startTime))) n.shifts.popodnevna.startTime = '13:30';
    n.periodDuration = broj(n.periodDuration, 45, 30, 60);
    n.smallBreakDuration = broj(n.smallBreakDuration, 10, 5, 15);
    n.bigBreakDuration = broj(n.bigBreakDuration, 20, 10, 30);
    n.subjects = Array.isArray(n.subjects) ? n.subjects : [];
    if (!n.customTheme || typeof n.customTheme !== 'object') n.customTheme = {};
    n.customTheme.primaryColor = bezbednaBoja(n.customTheme.primaryColor);
    n.customTheme.enabled = n.customTheme.enabled !== false;
    n.language = n.language === 'sr' ? 'sr' : 'en';
    n.codeUnlocked = !!n.codeUnlocked;
    n.codeTheme = !!n.codeTheme;
    n.codeLight = n.codeLight === true;
    n.autoTheme = n.autoTheme === true;
    n.autoThemeDayStart = /^\d{2}:\d{2}$/.test(String(n.autoThemeDayStart)) ? n.autoThemeDayStart : '07:00';
    n.autoThemeNightStart = /^\d{2}:\d{2}$/.test(String(n.autoThemeNightStart)) ? n.autoThemeNightStart : '18:00';
    n.animTema = n.animTema !== false;
    if (!n.effects || typeof n.effects !== 'object') n.effects = {};
    n.effects = {
        intensity: broj(n.effects.intensity, 5, 1, 10),
        invert: !!n.effects.invert,
        rain: !!n.effects.rain,
        scanlines: !!n.effects.scanlines,
        flicker: !!n.effects.flicker,
        corruption: !!n.effects.corruption,
        color: dozvoljenaGxBoja(n.effects.color),
        customColor: bezbednaBojaGx(n.effects.customColor)
    };
    return n;
}

function validiraj() {
    if (!radna.schoolName || !String(radna.schoolName).trim()) {
        prikaziDialog({
            naslov: t('bios.dlg.greska'),
            html: t('bios.dlg.greskaSkola'),
            dugmad: [{ tekst: t('bios.dlg.uredu'), klasa: 'bios-dugme-glavni' }]
        });
        return false;
    }
    radna.language = radna.language === 'sr' ? 'sr' : 'en';
    radna.periodsCount = broj(radna.periodsCount, 6, 5, 8);
    radna.periodDuration = broj(radna.periodDuration, 45, 30, 60);
    radna.smallBreakDuration = broj(radna.smallBreakDuration, 10, 5, 15);
    radna.bigBreakDuration = broj(radna.bigBreakDuration, 20, 10, 30);
    radna.effects.intensity = broj(radna.effects.intensity, 5, 1, 10);
    radna.effects.color = dozvoljenaGxBoja(radna.effects.color);
    radna.effects.customColor = bezbednaBojaGx(radna.effects.customColor);
    radna.shifts.jutarnja.bigBreakAfterPeriod = broj(radna.shifts.jutarnja.bigBreakAfterPeriod, 2, 1, 4);
    radna.shifts.popodnevna.bigBreakAfterPeriod = broj(radna.shifts.popodnevna.bigBreakAfterPeriod, 2, 1, 4);

    radna.codeLight = radna.codeLight === true;
    radna.autoTheme = radna.autoTheme === true;
    if (!/^\d{2}:\d{2}$/.test(String(radna.autoThemeDayStart || ''))) radna.autoThemeDayStart = '07:00';
    if (!/^\d{2}:\d{2}$/.test(String(radna.autoThemeNightStart || ''))) radna.autoThemeNightStart = '18:00';

    if (['rucno', 'sat', 'rotacija'].indexOf(radna.shiftMode) < 0) radna.shiftMode = 'sat';
    if (['nedelja', 'mesec', 'polugodiste', 'godina'].indexOf(radna.shiftRotation) < 0) radna.shiftRotation = 'nedelja';
    var danRotV = parseInt(radna.shiftRotationDay, 10);
    radna.shiftRotationDay = danRotV >= 1 && danRotV <= 7 ? danRotV : 1;
    radna.shiftRotationFirst = radna.shiftRotationFirst === 'popodnevna' ? 'popodnevna' : 'jutarnja';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(radna.shiftRotationStart || ''))) radna.shiftRotationStart = '';
    radna.autoShiftChange = radna.shiftMode !== 'rucno';
    return true;
}

// ===== PROVERE I RACUN =====
function imaIzmena() {
    if (radna === null || snimak === null) return false;
    try {
        return JSON.stringify(radna) !== snimak;
    } catch (e) {
        return true;
    }
}

function izracunajVremena(podesavanja) {
    var smena = podesavanja.currentShift;
    var s = podesavanja.shifts[smena];
    var trajanje = podesavanja.periodDuration,
        mali = podesavanja.smallBreakDuration,
        veliki = podesavanja.bigBreakDuration;
    var posle = s.bigBreakAfterPeriod,
        brojCasova = podesavanja.periodsCount;
    var fmt = function (v, dodaj) {
        var delovi = v.split(':').map(Number);
        var t = delovi[0] * 60 + delovi[1] + (dodaj || 0);
        return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
    };
    var niz = [];
    var tren = s.startTime;
    for (var i = 0; i < brojCasova; i++) {
        var poc = tren,
            kraj = fmt(poc, trajanje);
        niz.push({ period: i + 1, start: poc, end: kraj, isBreak: false });
        if (i < brojCasova - 1) {
            var odmorTrajanje = i + 1 === posle ? veliki : mali;
            var op = kraj,
                ok = fmt(op, odmorTrajanje);
            niz.push({ period: i + 1, start: op, end: ok, isBreak: true, isBigBreak: i + 1 === posle });
            tren = ok;
        }
    }
    return niz;
}
