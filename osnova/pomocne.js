'use strict';
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

function formatirajVreme(vreme, dodajMinute = 0) {
    const [sati, minuti] = String(vreme).split(':').map(Number);
    const ukupnoMinuta = sati * 60 + minuti + dodajMinute;
    const s = Math.floor(ukupnoMinuta / 60) % 24;
    const m = ukupnoMinuta % 60;
    return `${String(s).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatirajDatum(datum) {
    return `${String(datum.getDate()).padStart(2, '0')}.${String(datum.getMonth() + 1).padStart(2, '0')}.${datum.getFullYear()}`;
}

function formatirajDatumISO(datum) {
    return `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, '0')}-${String(datum.getDate()).padStart(2, '0')}`;
}

function kreirajDatumLokalno(datumStr) {
    const [godina, mesec, dan] = datumStr.split('-').map(Number);
    return new Date(godina, mesec - 1, dan);
}

function danaDoDatuma(datumStr) {
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);
    const cilj = kreirajDatumLokalno(datumStr);
    cilj.setHours(0, 0, 0, 0);
    return Math.round((cilj.getTime() - danas.getTime()) / (1000 * 60 * 60 * 24));
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

function trenutnoVremeMinuta() {
    const sad = new Date();
    return sad.getHours() * 60 + sad.getMinutes();
}
