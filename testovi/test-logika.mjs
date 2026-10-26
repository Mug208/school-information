// Test logike iz osnova/logika.js.
// pokrece se sa: node testovi/test-logika.mjs ili npm test, ili u terminalu vsc npm.cmd test.
import { strict as assert } from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Logika = require('../osnova/logika.js');

let prolazi = 0;
function test(naziv, fn) {
    try {
        fn();
        prolazi++;
        console.log('OK  ' + naziv);
    } catch (e) {
        console.log('PAD ' + naziv);
        console.log('    ' + e.message);
        process.exitCode = 1;
    }
}

// formatirajVreme
test('formatirajVreme dodaje minute preko punog sata', () => {
    assert.equal(Logika.formatirajVreme('07:15', 45), '08:00');
});
test('formatirajVreme prelazi preko ponoci', () => {
    assert.equal(Logika.formatirajVreme('23:50', 20), '00:10');
});

// formatirajDatum i formatirajDatumISO
test('formatirajDatum formatira dan i mesec sa nulom', () => {
    assert.equal(Logika.formatirajDatum(new Date(2026, 9, 5)), '05.10.2026');
});
test('formatirajDatumISO vraca lokalni ISO format', () => {
    assert.equal(Logika.formatirajDatumISO(new Date(2026, 9, 5)), '2026-10-05');
});
test('kreirajDatumLokalno i formatirajDatumISO su inverse operacije', () => {
    const datum = Logika.kreirajDatumLokalno('2026-03-09');
    assert.equal(Logika.formatirajDatumISO(datum), '2026-03-09');
});

// danaDoDatuma
test('danaDoDatuma racuna razliku bez vremenske zone', () => {
    const danas = new Date(2026, 9, 20);
    assert.equal(Logika.danaDoDatuma('2026-10-24', danas), 4);
    assert.equal(Logika.danaDoDatuma('2026-10-16', danas), -4);
    assert.equal(Logika.danaDoDatuma('2026-10-20', danas), 0);
});

// vremeUMinute i trenutnoVremeMinuta
test('vremeUMinute prevodi HH:MM u minute', () => {
    assert.equal(Logika.vremeUMinute('07:15'), 435);
});
test('trenutnoVremeMinuta cita sat i minut iz datuma', () => {
    assert.equal(Logika.trenutnoVremeMinuta(new Date(2026, 0, 1, 14, 5)), 845);
});

// izracunajVremenaCasova
const PODESAVANJA = {
    periodsCount: 3,
    periodDuration: 45,
    smallBreakDuration: 5,
    bigBreakDuration: 20
};
const SMENA = { startTime: '07:15', bigBreakAfterPeriod: 2 };
const VREMENA = Logika.izracunajVremenaCasova(PODESAVANJA, SMENA);

test('izracunajVremenaCasova pravi cas i odmor za svaki osim poslednjeg', () => {
    assert.equal(VREMENA.length, 5);
    assert.equal(VREMENA[0].start, '07:15');
    assert.equal(VREMENA[0].end, '08:00');
    assert.equal(VREMENA[1].isBreak, true);
    assert.equal(VREMENA[4].isBreak, false);
});
test('izracunajVremenaCasova stavlja veliki odmor posle drugog casa', () => {
    assert.equal(VREMENA[1].isBigBreak, false);
    assert.equal(VREMENA[3].isBigBreak, true);
});
test('izracunajVremenaCasova nastavlja vreme posle velikog odmora', () => {
    assert.equal(VREMENA[2].start, '08:05');
    assert.equal(VREMENA[2].end, '08:50');
    assert.equal(VREMENA[3].start, '08:50');
    assert.equal(VREMENA[4].start, '09:10');
    assert.equal(VREMENA[4].end, '09:55');
});

// odrediSmenu
const PODESAVANJA_SMENA = {
    shiftMode: 'sat',
    currentShift: 'jutarnja',
    shifts: { popodnevna: { startTime: '14:00' } }
};
test('odrediSmenu vraca jutarnju pre podnevnog pocetka', () => {
    assert.equal(Logika.odrediSmenu(PODESAVANJA_SMENA, 800), 'jutarnja');
});
test('odrediSmenu vraca popodnevnu od podnevnog pocetka', () => {
    assert.equal(Logika.odrediSmenu(PODESAVANJA_SMENA, 840), 'popodnevna');
});
test('odrediSmenu u rucnom rezimu cita rucno izabranu smenu', () => {
    const p = { ...PODESAVANJA_SMENA, shiftMode: 'rucno', currentShift: 'popodnevna' };
    assert.equal(Logika.odrediSmenu(p, 300), 'popodnevna');
});

// esc i skratiTekst
test('esc zamenuje specijalne znakove', () => {
    assert.equal(Logika.esc('<b class="x">&\'</b>'), '&lt;b class=&quot;x&quot;&gt;&amp;&#39;&lt;/b&gt;');
});
test('skratiTekst krati na zadatu duzinu', () => {
    assert.equal(Logika.skratiTekst('abc def', 4), 'abc...');
    assert.equal(Logika.skratiTekst('abc', 10), 'abc');
    assert.equal(Logika.skratiTekst('', 5), '');
});

// generisiId
test('generisiId daje razlicite vrednosti uzastopno', () => {
    const a = Logika.generisiId();
    const b = Logika.generisiId();
    assert.notEqual(a, b);
    assert.equal(typeof a, 'string');
});

console.log('');
console.log('Rezultat: ' + prolazi + ' testova prolazi' + (process.exitCode ? ', neki su pali' : ''));
