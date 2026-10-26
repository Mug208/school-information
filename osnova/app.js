'use strict';
// window.App je fasada preko Store-a (osnova/store.js). Za novi kod
// radije koristi Store.getStanje(), Store.dispatch i Store.subscribe.
// ===== PUNO OSVEZAVANJE PRIKAZA =====
function prikaziSve() {
    prikaziNazivSkole();
    azurirajPretraguPredmeta();
    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
    azurirajPrintZaglavlje();
    prikaziKalendar();
    prikaziBeleskeIzabraniDatum();
    prikaziNadolazeceDogadjaje();
    prikaziBeleske();
    prikaziObavestenja();
    prikaziOznakuSmene();
    azurirajStatusTekst();
    azurirajPodnozje();
    primeniTemu();
}

// ===== JAVNI API (FASADA) =====
window.App = {
    verzija: VERZIJA,
    getPodaci: () => podaciAplikacije,
    getPodesavanja: () => podaciAplikacije.settings,
    podrazumevanaPodesavanja: () => JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA)),
    sacuvajPodesavanja: sacuvajPodesavanja,
    primiTemu: primeniTemu,
    primenicodeBoju: primenicodeBoju,
    codeBoje: code_BOJE,
    renderujSve: prikaziSve,
    prikaziToast: prikaziToast,
    potvrdi: (poruka) => new Promise(resolve => {
        prikaziPotvrdu(poruka, (odgovor) => resolve(!!odgovor));
    }),
    izveziPodatke: izveziPodatke,
    uveziPodatke: (spoji) => {
        stanje.uvozMod = !!spoji;
        const input = document.getElementById('inputUvoz');
        if (input) {
            input.value = '';
            input.click();
        }
    },
    resetujSve: resetujSvePodatke,
    getStatistike: getStatistike,
    store: Store
};
