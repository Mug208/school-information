// Rezimi smena, rotacija i proracun vremena casova. Ciste funkcije su u osnova/logika.js.
'use strict';

// ===== PODACI ROTACIJE =====
let NAZIVI_ROTACIJE = {
    nedelja: 'svake nedelje',
    mesec: 'svakog meseca',
    polugodiste: 'svakog polugodišta',
    godina: 'svake godine'
};

let DANI_ROTACIJE = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
let DANI_ROTACIJE_INSTRUMENTAL = ['ponedeljkom', 'utorkom', 'sredom', 'četvrtkom', 'petkom', 'subotom', 'nedeljom'];

// ===== RACUNANJE ROTACIJE =====
function danPromeneRotacije() {
    const d = parseInt(podaciAplikacije.settings.shiftRotationDay, 10);
    return (d >= 1 && d <= 7) ? d : 1;
}

function pocetakNedeljnogPerioda(d) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const jsDan = danPromeneRotacije() % 7;
    x.setDate(x.getDate() - ((x.getDay() - jsDan + 7) % 7));
    return x;
}

function sidroRotacije() {
    const str = String(podaciAplikacije.settings.shiftRotationStart || '');
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const d = kreirajDatumLokalno(str);
        if (!isNaN(d.getTime())) return d;
    }
    const sad = new Date();
    const godina = sad.getMonth() >= 8 ? sad.getFullYear() : sad.getFullYear() - 1;
    return new Date(godina, 8, 1);
}

function indeksRotacije(datum) {
    const p = podaciAplikacije.settings.shiftRotation || 'nedelja';
    const sidro = sidroRotacije();

    if (p === 'nedelja') {
        const dana = Math.round((pocetakNedeljnogPerioda(datum) - pocetakNedeljnogPerioda(sidro)) / 86400000);
        return Math.floor(dana / 7);
    }
    const meseci = (datum.getFullYear() - sidro.getFullYear()) * 12 + (datum.getMonth() - sidro.getMonth());
    if (p === 'mesec') return Math.floor(meseci);
    if (p === 'polugodiste') return Math.floor(meseci / 6);
    return Math.floor(meseci / 12);
}

function smenaIzRotacije(datum = new Date()) {
    const s = podaciAplikacije.settings;
    const prva = s.shiftRotationFirst === 'popodnevna' ? 'popodnevna' : 'jutarnja';
    const druga = prva === 'jutarnja' ? 'popodnevna' : 'jutarnja';
    const idx = indeksRotacije(datum);
    return ((idx % 2) + 2) % 2 === 0 ? prva : druga;
}

function datumSledeceRotacije() {
    try {
        const p = podaciAplikacije.settings.shiftRotation || 'nedelja';
        const sidro = sidroRotacije();
        const idx = indeksRotacije(new Date()) + 1;
        if (p === 'nedelja') {
            return new Date(pocetakNedeljnogPerioda(sidro).getTime() + idx * 7 * 86400000);
        }
        const blok = p === 'mesec' ? 1 : p === 'polugodiste' ? 6 : 12;
        const ukMeseci = sidro.getFullYear() * 12 + sidro.getMonth() + idx * blok;
        return new Date(Math.floor(ukMeseci / 12), ukMeseci % 12, 1);
    } catch (e) {
        return null;
    }
}

// ===== AUTO SMENA =====
function normalizujRezimSmene(s) {
    if (!['rucno', 'sat', 'rotacija'].includes(s.shiftMode)) {
        s.shiftMode = (s.autoShiftChange === false) ? 'rucno' : 'sat';
    }
    if (!['nedelja', 'mesec', 'polugodiste', 'godina'].includes(s.shiftRotation)) s.shiftRotation = 'nedelja';
    const danRotacije = parseInt(s.shiftRotationDay, 10);
    s.shiftRotationDay = (danRotacije >= 1 && danRotacije <= 7) ? danRotacije : 1;
    s.shiftRotationFirst = s.shiftRotationFirst === 'popodnevna' ? 'popodnevna' : 'jutarnja';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s.shiftRotationStart || ''))) s.shiftRotationStart = '';
    s.autoShiftChange = s.shiftMode !== 'rucno';
}

function autoSmena() {
    const s = podaciAplikacije.settings;
    const rezim = s.shiftMode || 'sat';

    if (rezim === 'rotacija') return smenaIzRotacije();
    if (rezim === 'rucno') return s.currentShift;

    return Logika.odrediSmenu(s, trenutnoVremeMinuta());
}

function azurirajAutoSmenu() {
    const s = podaciAplikacije.settings;
    if ((s.shiftMode || 'sat') === 'rucno') {
        prikaziOznakuSmene();
        return;
    }
    const auto = autoSmena();
    if (s.currentShift !== auto) {
        const naziv = s.shifts[auto] ? s.shifts[auto].name : auto;
        s.currentShift = auto;
        sacuvajPodatke();
        prikaziOznakuSmene();
        prikaziDesktopRaspored();
        prikaziMobilniRaspored();
        azurirajPrintZaglavlje();
        azurirajMultiSelectUI();
        if (s.shiftMode === 'rotacija') prikaziToast(t('smen.toastRotacija', { naziv: naziv }), 'info');
    }
    prikaziOznakuSmene();
}

// Proracun vremena je cista funkcija u osnova/logika.js i ima testove.
// Ovde se samo cita tekuci kontekst i prosledjuje kao argument.
// ===== VREMENA CASOVA =====

function izracunajVremenaCasova() {
    const s = podaciAplikacije.settings;
    return Logika.izracunajVremenaCasova(s, s.shifts[s.currentShift]);
}
