// Konstante: kljuc skladista, verzija, tipovi beleski, podrazumevani predmeti i podesavanja.
'use strict';

// ===== OSNOVNE KONSTANTE =====
const KLJUC_SKLADISTA = 'skolski-info-podaci';
const VERZIJA = '2.1';

// ===== DANI I MESECI =====
let DANI_LAT = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
let DANI_KRATKO = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
let MESECI_LAT = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

let TEKST_PRECICA =
    'PREČICE:\n' +
    '1 / 2 / 3 / Raspored / Kalendar / Beleške\n' +
    'S / pretraga predmeta (, = više predmeta)\n' +
    'M / višestruki izbor časova (grupna izmena)\n' +
    'N / nova beleška (u tabu Beleške)\n' +
    '/ / pretraga beleški\n' +
    'Ctrl+K / komandna paleta\n' +
    'DEL / BIOS podešavanja\n' +
    'T / promena teme';

// ===== TIPOVI BELESKI =====
const TIPOVI_BELESKE = {
    kontrolni: { label: 'Kontrolni', color: '#ef4444', icon: 'upozorenje', iconA: '!!', shortLabel: 'KONT' },
    pismeni: { label: 'Pismeni', color: '#8b5cf6', icon: 'beleske', iconA: '[W]', shortLabel: 'PIS' },
    blic: { label: 'Blic', color: '#f59e0b', icon: 'munja', iconA: '[B]', shortLabel: 'BLIC' },
    prezentacija: { label: 'Prezentacija', color: '#14b8a6', icon: 'mikrofon', iconA: '[PR]', shortLabel: 'PRES' },
    domaci: { label: 'Domaći', color: '#3b82f6', icon: 'knjiga', iconA: '[HW]', shortLabel: 'DOM' },
    ostalo: { label: 'Ostalo', color: '#6b7280', icon: 'cackalica', iconA: '[O]', shortLabel: 'OST' }
};

// ===== PODRAZUMEVANI PREDMETI =====
const PREDMETI_PODRAZUMEVANI = [
    { id: '1', name: 'Serbian language', color: '#ef4444', teacher: '' },
    { id: '2', name: 'Mathematics', color: '#3b82f6', teacher: '' },
    { id: '3', name: 'English language', color: '#22c55e', teacher: '' },
    { id: '4', name: 'Physics', color: '#f59e0b', teacher: '' },
    { id: '5', name: 'Croatian language', color: '#8b5cf6', teacher: '' },
    { id: '6', name: 'Biology', color: '#10b981', teacher: '' },
    { id: '7', name: 'Object-Oriented Programming', color: '#6366f1', teacher: '' },
    { id: '8', name: 'Programming', color: '#2563eb', teacher: '' },
    { id: '9', name: 'Database Models', color: '#d946ef', teacher: '' },
    { id: '10', name: 'Computer Applications', color: '#2a9633', teacher: '' },
    { id: '11', name: 'Citizenship/Religious Education', color: '#14b8a6', teacher: '' },
    { id: '12', name: 'Visual Culture', color: '#ec4899', teacher: '' },
    { id: '13', name: 'Physical Education', color: '#f97316', teacher: '' },
    { id: '14', name: 'Discrimination', color: '#db2777', teacher: '' }
];

// ===== PODESAVANJA PODRAZUMEVANA =====
const PODESAVANJA_PODRAZUMEVANA = {
    schoolName: 'Your School Name',
    className: 'IV-3',
    language: 'en',
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
            name: 'Morning shift',
            startTime: '07:15',
            bigBreakAfterPeriod: 3
        },
        popodnevna: {
            name: 'Afternoon shift',
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
