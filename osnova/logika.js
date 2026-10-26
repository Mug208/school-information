'use strict';
// Cista logika bez DOM-a i bez globalnih stanja: sve funkcije prime
// argumente i vracaju rezultat. 
// U pregledacu je dostupno kao window.Logika, u Node.js preko require.
var Logika = (function () {
    // ===== ID I ZASTITA TEKSTA =====

    function generisiId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function esc(tekst) {
        return String(tekst == null ? '' : tekst)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ===== FORMATIRANJE VREMENA I DATUMA =====
    function formatirajVreme(vreme, dodajMinute = 0) {
        const delovi = String(vreme).split(':').map(Number);
        const ukupnoMinuta = delovi[0] * 60 + delovi[1] + dodajMinute;
        const s = Math.floor(ukupnoMinuta / 60) % 24;
        const m = ukupnoMinuta % 60;
        return String(s).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }

    function formatirajDatum(datum) {
        return String(datum.getDate()).padStart(2, '0') + '.' +
            String(datum.getMonth() + 1).padStart(2, '0') + '.' + datum.getFullYear();
    }

    function formatirajDatumISO(datum) {
        return datum.getFullYear() + '-' +
            String(datum.getMonth() + 1).padStart(2, '0') + '-' +
            String(datum.getDate()).padStart(2, '0');
    }

    function kreirajDatumLokalno(datumStr) {
        const [godina, mesec, dan] = datumStr.split('-').map(Number);
        return new Date(godina, mesec - 1, dan);
    }

    function danaDoDatuma(datumStr, danas = new Date()) {
        const pocetak = new Date(danas.getFullYear(), danas.getMonth(), danas.getDate());
        const cilj = kreirajDatumLokalno(datumStr);
        return Math.round((cilj.getTime() - pocetak.getTime()) / 86400000);
    }

    function skratiTekst(tekst, maxDuzina = 100) {
        if (!tekst) return '';
        let ociscen = String(tekst).replace(/\s+/g, ' ').trim();
        if (ociscen.length > maxDuzina) {
            ociscen = ociscen.substring(0, maxDuzina).trim() + '...';
        }
        return ociscen;
    }

    function vremeUMinute(vremeStr) {
        const [sati, minuti] = String(vremeStr).split(':').map(Number);
        return sati * 60 + minuti;
    }

    function trenutnoVremeMinuta(datum = new Date()) {
        return datum.getHours() * 60 + datum.getMinutes();
    }

    // Raspored casova i odmora za jednu smenu. Argumenti umesto globala.
    // ===== RASPORED CASOVA I SMENA =====

    function izracunajVremenaCasova(podesavanja, smena) {
        const brojCasova = podesavanja.periodsCount;
        const velikiOdmorPosle = smena.bigBreakAfterPeriod;
        const vremena = [];
        let trenutno = smena.startTime;

        for (let i = 0; i < brojCasova; i++) {
            const pocetakCasa = trenutno;
            const krajCasa = formatirajVreme(pocetakCasa, podesavanja.periodDuration);
            vremena.push({ period: i + 1, start: pocetakCasa, end: krajCasa, isBreak: false });

            if (i < brojCasova - 1) {
                const trajanjeOdmora = (i + 1) === velikiOdmorPosle ?
                    podesavanja.bigBreakDuration : podesavanja.smallBreakDuration;
                const pocetakOdmora = krajCasa;
                const krajOdmora = formatirajVreme(pocetakOdmora, trajanjeOdmora);
                vremena.push({
                    period: i + 1,
                    start: pocetakOdmora,
                    end: krajOdmora,
                    isBreak: true,
                    isBigBreak: (i + 1) === velikiOdmorPosle
                });
                trenutno = krajOdmora;
            }
        }
        return vremena;
    }

    // Tekuca smena po rezimu rada, bez citanja globalnog stanja.
    function odrediSmenu(podesavanja, minuti = trenutnoVremeMinuta()) {
        const rezim = podesavanja.shiftMode || 'sat';
        if (rezim === 'rucno') return podesavanja.currentShift;

        const popodnevniPocetak = vremeUMinute(podesavanja.shifts.popodnevna.startTime);
        if (minuti >= popodnevniPocetak) return 'popodnevna';
        return 'jutarnja';
    }

    // ===== JAVNI API =====
    const api = {
        generisiId,
        esc,
        formatirajVreme,
        formatirajDatum,
        formatirajDatumISO,
        kreirajDatumLokalno,
        danaDoDatuma,
        skratiTekst,
        vremeUMinute,
        trenutnoVremeMinuta,
        izracunajVremenaCasova,
        odrediSmenu
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (typeof window !== 'undefined') window.Logika = api;
    return api;
})();
