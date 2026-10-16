'use strict';

const KLJUC_SKLADISTA = 'skolski-info-podaci';
const VERZIJA = '2.0';

const DANI_LAT = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
const DANI_KRATKO = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
const MESECI_LAT = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

const TEKST_PRECICA =
    'PREČICE:\n' +
    '1 / 2 / 3 / Raspored / Kalendar / Beleške\n' +
    'S / pretraga predmeta (, = više predmeta)\n' +
    'M / višestruki izbor časova (grupna izmena)\n' +
    'N / nova beleška (u tabu Beleške)\n' +
    '/ / pretraga beleški\n' +
    'Ctrl+K / komandna paleta\n' +
    'DEL / BIOS podešavanja\n' +
    'T / promena teme';

function ikonica(emoji, ascii) {
    return `<span class="ik" data-e="${emoji}" data-a="${ascii}" aria-hidden="true"></span>`;
}

function postaviIkonu(el, emoji, ascii) {
    if (!el) return;
    el.innerHTML = ikonica(emoji, ascii);
}

const EMOJI_ASCII_ZAMENA = [
    ['⚡', '!!'],
    ['📌', '*'],
    ['🎉', ':)'],
    ['🎓', ''],
    ['☕', 'BRK'],
    ['🔹', '-'],
    ['📅', '']
];

function tekstBezEmojija(tekst) {
    let t = String(tekst);
    EMOJI_ASCII_ZAMENA.forEach(([e, a]) => { t = t.split(e).join(a); });
    return t.replace(/\s{2,}/g, ' ').trim();
}

const TIPOVI_BELESKE = {
    kontrolni: { label: 'Kontrolni', color: '#ef4444', icon: '⚠️', iconA: '!!', shortLabel: 'KONT' },
    pismeni: { label: 'Pismeni', color: '#8b5cf6', icon: '📝', iconA: '[W]', shortLabel: 'PIS' },
    blic: { label: 'Blic', color: '#f59e0b', icon: '⚡', iconA: '[B]', shortLabel: 'BLIC' },
    prezentacija: { label: 'Prezentacija', color: '#14b8a6', icon: '🎤', iconA: '[PR]', shortLabel: 'PRES' },
    domaci: { label: 'Domaći', color: '#3b82f6', icon: '📚', iconA: '[HW]', shortLabel: 'DOM' },
    ostalo: { label: 'Ostalo', color: '#6b7280', icon: '📌', iconA: '[O]', shortLabel: 'OST' }
};

function ikonaTipa(tip) {
    return ikonica(tip.icon, tip.iconA || '');
}

const PREDMETI_PODRAZUMEVANI = [
    { id: '1', name: 'Srpski jezik', color: '#ef4444', teacher: '' },
    { id: '2', name: 'Matematika', color: '#3b82f6', teacher: '' },
    { id: '3', name: 'Engleski jezik', color: '#22c55e', teacher: '' },
    { id: '4', name: 'Fizika', color: '#f59e0b', teacher: '' },
    { id: '5', name: 'Čos', color: '#8b5cf6', teacher: '' },
    { id: '6', name: 'Biologija', color: '#10b981', teacher: '' },
    { id: '7', name: 'Objektno Orjentisovano Programiranje', color: '#6366f1', teacher: '' },
    { id: '8', name: 'Programiranje', color: '#2563eb', teacher: '' },
    { id: '9', name: 'Modeli Baza Podataka', color: '#d946ef', teacher: '' },
    { id: '10', name: 'Primena Računara', color: '#2a9633', teacher: '' },
    { id: '11', name: 'Građansko/Verska nastava', color: '#14b8a6', teacher: '' },
    { id: '12', name: 'Likovna kultura', color: '#ec4899', teacher: '' },
    { id: '13', name: 'Fizičko vaspitanje', color: '#f97316', teacher: '' },
    { id: '14', name: 'Diskriminacija', color: '#db2777', teacher: '' }
];

const PODESAVANJA_PODRAZUMEVANA = {
    schoolName: 'Smart Gimnazija',
    className: 'III-3',
    theme: 'light',
    autoTheme: false,
    autoThemeDayStart: '07:00',
    autoThemeNightStart: '18:00',
    periodsCount: 7,
    subjects: PREDMETI_PODRAZUMEVANI,
    currentShift: 'jutarnja',
    autoShiftChange: true,

    shiftMode: 'sat',
    shiftRotation: 'nedelja',
    shiftRotationStart: '',
    shiftRotationFirst: 'jutarnja',
    shiftRotationDay: 1,
    shifts: {
        jutarnja: {
            name: 'Jutarnja smena',
            startTime: '07:15',
            bigBreakAfterPeriod: 3
        },
        popodnevna: {
            name: 'Popodnevna smena',
            startTime: '14:00',
            bigBreakAfterPeriod: 2
        }
    },
    periodDuration: 45,
    smallBreakDuration: 5,
    bigBreakDuration: 20,
    customTheme: {
        primaryColor: '#0d9488',
        enabled: true
    },
    codeUnlocked: false,
    codeTheme: false,
    codeLight: false,
    animTema: true,
    effects: {
        intensity: 5,

        invert: false,
        rain: false,
        scanlines: false,
        flicker: false,
        corruption: false,
        color: 'zelena',
        customColor: '#00ff9c'
    }
};
