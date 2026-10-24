'use strict';

const IKONE = {

    skola:
        '<path d="M2.6 9.2 12 5l9.4 4.2L12 13.4 2.6 9.2Z"/>' +
        '<path d="M6.6 11.4v4.1c0 1.5 2.4 2.7 5.4 2.7s5.4-1.2 5.4-2.7v-4.1"/>' +
        '<path d="M21.4 9.4v5.6"/>' +
        '<circle cx="21.4" cy="16.1" r="1.1" fill="currentColor" stroke="none"/>',

    sat:
        '<circle cx="12" cy="12" r="8.6"/>' +
        '<path d="M12 7.2V12l3.3 2"/>',

    kalendar:
        '<rect x="3.4" y="5" width="17.2" height="15.6" rx="2.6"/>' +
        '<path d="M8 2.9v3.6M16 2.9v3.6M3.4 10.2h17.2"/>',

    kalendar_nedelja:
        '<rect x="3.4" y="5" width="17.2" height="15.6" rx="2.6"/>' +
        '<path d="M8 2.9v3.6M16 2.9v3.6M3.4 10.2h17.2"/>' +
        '<circle cx="8.2" cy="14.1" r=".95" fill="currentColor" stroke="none"/>' +
        '<circle cx="12" cy="14.1" r=".95" fill="currentColor" stroke="none"/>' +
        '<circle cx="15.8" cy="14.1" r=".95" fill="currentColor" stroke="none"/>' +
        '<circle cx="8.2" cy="17.6" r=".95" fill="currentColor" stroke="none"/>' +
        '<circle cx="12" cy="17.6" r=".95" fill="currentColor" stroke="none"/>',

    danas:
        '<rect x="3.4" y="5" width="17.2" height="15.6" rx="2.6"/>' +
        '<path d="M8 2.9v3.6M16 2.9v3.6M3.4 10.2h17.2"/>' +
        '<circle cx="12" cy="15.3" r="2.2" fill="currentColor" stroke="none"/>',

    beleske:
        '<path d="M13.6 3.4H7a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.8Z"/>' +
        '<path d="M13.6 3.4v5.4H19"/>' +
        '<path d="M8.8 12.6h6.4M8.8 16.2h4.2"/>',

    zvono:
        '<path d="M18.2 8.7a6.2 6.2 0 1 0-12.4 0c0 4.9-2 6.4-2 6.4h16.4s-2-1.5-2-6.4Z"/>' +
        '<path d="M10.2 18.6a2.1 2.1 0 0 0 3.6 0"/>',

    podesavanja:
        '<circle cx="12" cy="12" r="3"/>' +
        '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',

    meni:
        '<path d="M3.8 7h16.4M3.8 12h16.4M3.8 17h16.4"/>',

    mesec:
        '<path d="M20.8 13.1A8.6 8.6 0 1 1 10.9 3.2a6.8 6.8 0 0 0 9.9 9.9Z"/>',

    sunce:
        '<circle cx="12" cy="12" r="4.2"/>' +
        '<path d="M12 2.4v2.2M12 19.4v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/>',

    munja:
        '<path d="M13.6 2.5 5.2 13.2h5.5l-1 8.3 8.4-10.7h-5.5Z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>',

    izlazak:
        '<path d="M2.8 18.5h18.4"/>' +
        '<path d="M7.2 18.5a4.8 4.8 0 0 1 9.6 0"/>' +
        '<path d="M12 2.8v4.6"/>' +
        '<path d="M9.7 5.1 12 2.8l2.3 2.3"/>' +
        '<path d="M5 10.6 6.4 12M19 10.6 17.6 12"/>',

    zalazak:
        '<path d="M2.8 18.5h18.4"/>' +
        '<path d="M7.2 18.5a4.8 4.8 0 0 1 9.6 0"/>' +
        '<path d="M12 7.4V2.8"/>' +
        '<path d="M9.7 5.1 12 7.4l2.3-2.3"/>' +
        '<path d="M5 10.6 6.4 12M19 10.6 17.6 12"/>',

    strelica_levo:
        '<path d="M14.6 4.8 7.4 12l7.2 7.2"/>',

    strelica_desno:
        '<path d="M9.4 4.8 16.6 12l-7.2 7.2"/>',

    plej:
        '<path d="M8.4 5 19 12 8.4 19Z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>',

    olovka:
        '<path d="M4 20.4h4.2L20.3 8.3a2.2 2.2 0 0 0-3.1-3.1L5.1 17.2Z"/>' +
        '<path d="M14.8 6.6 18.5 10.3"/>',

    kanta:
        '<path d="M3.8 6.6h16.4"/>' +
        '<path d="M9.2 6.6V4.2h5.6v2.4"/>' +
        '<path d="M6.4 6.6l.9 12.6a2 2 0 0 0 2 1.8h5.4a2 2 0 0 0 2-1.8l.9-12.6"/>' +
        '<path d="M10.4 10.8v6M13.6 10.8v6"/>',

    kvacica_kvadrat:
        '<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.2"/>' +
        '<path d="M7.9 12.2 10.8 15.1 16.2 9.4"/>',

    cek:
        '<path d="M4.6 12.4 9.4 17.2 19.4 7.2"/>',

    lupa:
        '<circle cx="10.9" cy="10.9" r="6.6"/>' +
        '<path d="M15.7 15.7 20.6 20.6"/>',

    zatvori:
        '<path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8"/>',

    ocisti:
        '<circle cx="12" cy="12" r="8.6"/>' +
        '<path d="M9.2 9.2 14.8 14.8M14.8 9.2 9.2 14.8"/>',

    lokacija:
        '<path d="M12 20.8s6.9-5.6 6.9-10.8a6.9 6.9 0 1 0-13.8 0c0 5.2 6.9 10.8 6.9 10.8Z"/>' +
        '<circle cx="12" cy="9.8" r="2.6"/>',

    kafa:
        '<path d="M17 8.6h1.1a2.9 2.9 0 0 1 0 5.8H17"/>' +
        '<path d="M3.6 8.6h13.4v5.2a4.6 4.6 0 0 1-4.6 4.6h-4.2a4.6 4.6 0 0 1-4.6-4.6Z"/>' +
        '<path d="M7.2 3.4v2.2M10.6 3.4v2.2M14 3.4v2.2"/>',

    plus:
        '<path d="M12 5.2v13.6M5.2 12h13.6"/>',

    stampac:
        '<path d="M7 8.2V3.8h10v4.4"/>' +
        '<rect x="3.4" y="8.2" width="17.2" height="7.2" rx="2"/>' +
        '<path d="M7 13.4h10v6.8H7Z"/>' +
        '<circle cx="17.2" cy="11.2" r=".85" fill="currentColor" stroke="none"/>',

    zabrana:
        '<circle cx="12" cy="12" r="8.6"/>' +
        '<path d="M6 18 18 6"/>',

    cackalica:
        '<path d="M12 17v5"/>' +
        '<path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1Z"/>',

    cek_u_krugu:
        '<circle cx="12" cy="12" r="8.6"/>' +
        '<path d="M8.1 12.3 10.8 15 15.9 9.7"/>',

    vrati:
        '<path d="M9.6 5.6 5 10.2l4.6 4.6"/>' +
        '<path d="M5 10.2h8.2a5 5 0 0 1 0 10h-1.4"/>',

    upozorenje:
        '<path d="M10.3 3.9a2 2 0 0 1 3.4 0l7.6 13.2a2 2 0 0 1-1.7 3H4.4a2 2 0 0 1-1.7-3Z"/>' +
        '<path d="M12 9.6v4.4"/>' +
        '<circle cx="12" cy="17" r=".95" fill="currentColor" stroke="none"/>',

    mikrofon:
        '<rect x="9" y="2.6" width="6" height="10.8" rx="3"/>' +
        '<path d="M5.6 11.2a6.4 6.4 0 0 0 12.8 0"/>' +
        '<path d="M12 17.6v3.4M8.6 21h6.8"/>',

    knjiga:
        '<path d="M12 7.2v13"/>' +
        '<path d="M12 7.2C10.3 5.7 8.2 4.8 6 4.8c-.9 0-1.8.1-2.6.35V18.4c.8-.25 1.7-.35 2.6-.35 2.2 0 4.3.9 6 2.4"/>' +
        '<path d="M12 7.2c1.7-1.5 3.8-2.4 6-2.4.9 0 1.8.1 2.6.35V18.4c-.8-.25-1.7-.35-2.6-.35-2.2 0-4.3.9-6 2.4"/>',

    iskre:
        '<path d="M9.8 3.4 11.4 8.2 16.2 9.8 11.4 11.4 9.8 16.2 8.2 11.4 3.4 9.8 8.2 8.2Z" fill="currentColor" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/>' +
        '<path d="M17.4 14.4 18.2 16.6 20.4 17.4 18.2 18.2 17.4 20.4 16.6 18.2 14.4 17.4 16.6 16.6Z" fill="currentColor" stroke="currentColor" stroke-width=".9" stroke-linejoin="round"/>',

    prazno:
        '<path d="M21.4 12.6h-5.2l-1.8 2.8H9.6l-1.8-2.8H2.6"/>' +
        '<path d="M5.8 5.2 2.6 12.6v4.8a2 2 0 0 0 2 2h14.8a2 2 0 0 0 2-2v-4.8l-3.2-7.4a2 2 0 0 0-1.8-1.2H7.6a2 2 0 0 0-1.8 1.2Z"/>',

    rombo:
        '<path d="M12 5.4 18.6 12 12 18.6 5.4 12Z" fill="currentColor" stroke="none"/>',

    tacka:
        '<circle cx="12" cy="12" r="8" fill="currentColor" stroke="none"/>',

    izvoz:
        '<path d="M12 3.2v11"/>' +
        '<path d="M7.8 7.4 12 3.2l4.2 4.2"/>' +
        '<path d="M4.4 13.8v4.4a2.4 2.4 0 0 0 2.4 2.4h10.4a2.4 2.4 0 0 0 2.4-2.4v-4.4"/>',

    paleta:
        '<path d="M12 3.4a8.6 8.6 0 1 0 0 17.2c1.5 0 2.1-1 2.1-2 0-.9-.7-1.5-.7-2.4 0-1 .9-1.8 2-1.8h1.5a3.9 3.9 0 0 0 3.9-3.9c0-4.1-4-7.1-8.8-7.1Z"/>' +
        '<circle cx="8.2" cy="8.4" r="1.15" fill="currentColor" stroke="none"/>' +
        '<circle cx="12.3" cy="6.6" r="1.15" fill="currentColor" stroke="none"/>' +
        '<circle cx="16.2" cy="8.6" r="1.15" fill="currentColor" stroke="none"/>' +
        '<circle cx="7" cy="13" r="1.15" fill="currentColor" stroke="none"/>',

    rotacija:
        '<path d="M17 3.4 20.6 7 17 10.6"/>' +
        '<path d="M3.4 12v-1.6A4.4 4.4 0 0 1 7.8 6h12.8"/>' +
        '<path d="M7 20.6 3.4 17 7 13.4"/>' +
        '<path d="M20.6 12v1.6a4.4 4.4 0 0 1-4.4 4.4H3.4"/>',

    pomoc:
        '<circle cx="12" cy="12" r="8.6"/>' +
        '<path d="M9.5 9.4a2.6 2.6 0 0 1 5 .9c0 1.7-2.5 2-2.5 3.7"/>' +
        '<circle cx="12" cy="17.1" r=".95" fill="currentColor" stroke="none"/>'
};

const IKONE_ATRIBUTI =
    'fill="none" stroke="currentColor" stroke-width="1.75" ' +
    'stroke-linecap="round" stroke-linejoin="round"';

function ikonaSimbol(naziv, sadrzaj) {
    return `<symbol id="i-${naziv}" viewBox="0 0 24 24" ${IKONE_ATRIBUTI}>${sadrzaj}</symbol>`;
}

function ugradiIkone() {
    if (document.getElementById('ikone-sprite')) return;

    const simboli = Object.keys(IKONE).map(naziv => ikonaSimbol(naziv, IKONE[naziv])).join('');
    const kontejner = document.createElement('div');
    kontejner.id = 'ikone-sprite';
    kontejner.className = 'ikone-sprite';
    kontejner.setAttribute('aria-hidden', 'true');
    kontejner.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" focusable="false">' + simboli + '</svg>';
    document.body.insertBefore(kontejner, document.body.firstChild);
}

function ikonica(naziv, ascii = '', boja = '') {
    const stil = boja ? ` style="color:${boja}"` : '';

    if (!IKONE[naziv]) {
        return `<span class="ik ik-tekst" aria-hidden="true"${stil}>${naziv}</span>`;
    }

    return `<span class="ik" data-ik="${naziv}" data-a="${ascii}"${stil} aria-hidden="true">` +
        `<svg class="ik-svg" viewBox="0 0 24 24" focusable="false"><use href="#i-${naziv}"></use></svg>` +
        '</span>';
}

function postaviIkonu(el, naziv, ascii = '') {
    if (!el) return;
    el.innerHTML = ikonica(naziv, ascii);
}

function ikonaTipa(tip) {
    return ikonica(tip.icon, tip.iconA || '');
}

if (document.body) ugradiIkone();
