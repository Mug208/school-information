'use strict';
let podaciAplikacije = {
    settings: JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA)),
    schedule: [],
    notes: []
};

let stanje = {
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
};
