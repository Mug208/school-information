'use strict';
// Jedno centralno stanje zivi u Store-u (osnova/store.js).
// Globalne promenljive ispod su samo most za stari kod i polako se uklanjaju: novi kod koristi Store.dispatch i Store.subscribe.
// ===== POCETNO STANJE =====
Store.init({
    podaci: {
        settings: JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA)),
        schedule: [],
        notes: []
    },
    stanje: {
        currentTab: 'raspored',
        selectedDay: (new Date().getDay() === 0 || new Date().getDay() === 6) ? 0 : new Date().getDay() - 1,
        izabranaKolona: null,
        pogodciPredmeta: new Set(),
        selectedDate: new Date(),
        calendarMonth: new Date().getMonth(),
        calendarYear: new Date().getFullYear(),
        editingSchedule: null,
        editingNote: null,
        editingSubject: null,
        currentFilter: 'sve',
        pretraga: '',
        confirmCallback: null,
        uvozMod: false,

        multiSelect: false,
        izabraniSlotovi: new Set(),
        grupnaIzmena: null
    }
});

// Reference na isti objekat iz store-a, radi i stari kod bez izmena.
// ===== MOST KA STAROM KODU =====
const podaciAplikacije = Store.getStanje().podaci;
const stanje = Store.getStanje().stanje;

// Osnovne akcije. Dodavati nove ovde ili kroz Store.registruj.
// ===== REGISTAR AKCIJA =====
Store.registruj('PODACI_ZAMENI', (s, novi) => {
    if (!novi) return;
    s.podaci.settings = novi.settings;
    s.podaci.schedule = novi.schedule;
    s.podaci.notes = novi.notes;
});

Store.registruj('TAB_PROMENI', (s, tab) => {
    if (typeof tab === 'string') s.stanje.currentTab = tab;
});

Store.registruj('DATUM_IZABERI', (s, datum) => {
    if (datum instanceof Date) s.stanje.selectedDate = datum;
});

Store.registruj('SMENA_POSTAVI', (s, smena) => {
    if (smena === 'jutarnja' || smena === 'popodnevna') {
        s.podaci.settings.currentShift = smena;
    }
});
