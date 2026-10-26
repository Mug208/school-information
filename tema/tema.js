// Logika svetle i tamne teme, auto tema i tajna aktivacija CODE teme.
'use strict';

// ===== TAJNA SEKVENCA =====
const TAJNA_SEKVENC = ['c', 'o', 'd', 'e', 's'];
let tajnaIndeks = 0;
let tajnaPoslednji = 0;

// ===== AUTO TEMA PO VREMENU =====
function temaVremeUMinute(v) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || ''));
    if (!m) return null;
    const h = parseInt(m[1], 10);
    const mi = parseInt(m[2], 10);
    if (h > 23 || mi > 59) return null;
    return h * 60 + mi;
}

function temaPeriodTekuci() {
    const s = podaciAplikacije.settings;
    let dan = temaVremeUMinute(s.autoThemeDayStart);
    let noc = temaVremeUMinute(s.autoThemeNightStart);
    if (dan === null) dan = 7 * 60;
    if (noc === null) noc = 18 * 60;
    if (dan === noc) { dan = 7 * 60; noc = 18 * 60; }
    const sad = new Date();
    const minuti = sad.getHours() * 60 + sad.getMinutes();
    if (dan < noc) return (minuti >= dan && minuti < noc) ? 'light' : 'dark';
    return (minuti >= dan || minuti < noc) ? 'light' : 'dark';
}

function azurirajAutoTemu(tiho, forsirano) {
    const s = podaciAplikacije.settings;
    if (!s.autoTheme) return;
    if (!forsirano && window.BIOS && typeof window.BIOS.otvoren === 'function' && window.BIOS.otvoren()) return;
    const period = temaPeriodTekuci();

    if (s.codeTheme) {
        const svetla = period === 'light';
        if (s.codeLight !== svetla) {
            s.codeLight = svetla;
            sacuvajPodatke();
            primeniTemu();
            if (!tiho) {
                prikaziToast(svetla ? t('tema.codeSvetla') : t('tema.codeTamna'), 'info');
            }
        }
        return;
    }

    if (s.theme !== period) {
        s.theme = period;
        sacuvajPodatke();
        primeniTemu();
        if (!tiho) {
            prikaziToast(period === 'light' ? t('tema.autoSvetla') : t('tema.autoTamna'), 'info');
        }
    }
}

// ===== TAJNA AKTIVACIJA =====
function inicijalizujTajnuAktivaciju() {
    document.addEventListener('keydown', (e) => {
        if (!podaciAplikacije.settings.codeUnlocked) {
            tajnaIndeks = 0;
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
        if (window.BIOS && typeof window.BIOS.otvoren === 'function' && window.BIOS.otvoren()) return;

        const k = (e.key || '').toLowerCase();
        if (k.length !== 1) return;

        const sad = Date.now();
        if (sad - tajnaPoslednji > 2000) tajnaIndeks = 0;
        tajnaPoslednji = sad;

        if (k === TAJNA_SEKVENC[tajnaIndeks]) {
            tajnaIndeks++;
            if (tajnaIndeks >= TAJNA_SEKVENC.length) {
                tajnaIndeks = 0;
                if (e.stopImmediatePropagation) e.stopImmediatePropagation();
                aktivirajCodeTemu();
            }
        } else {
            tajnaIndeks = (k === TAJNA_SEKVENC[0]) ? 1 : 0;
        }
    });
}

function aktivirajCodeTemu() {
    const s = podaciAplikacije.settings;

    if (!s.codeUnlocked) {

        s.codeUnlocked = true;
        s.codeTheme = true;
        s.efektiNapomena = true;
        sacuvajPodatke();
        primeniTemu();

        if (window.codeEngine) {
            try {
                window.codeEngine.okiniPrasak(true);
                window.codeEngine.okiniInverziju(300);
            } catch (e) {  }
        }

        prikaziToast(t('tema.codeAktivirana'), 'uspeh');

        prikaziEfektiUvod(2600);
        return;
    }

        s.codeTheme = !s.codeTheme;
    if (s.codeTheme && s.autoTheme) s.codeLight = temaPeriodTekuci() === 'light';
    sacuvajPodatke();
    primeniTemu();
    prikaziToast(s.codeTheme ? t('tema.codeUkljucena') : t('tema.codeIskljucena'), 'uspeh');

    if (s.codeTheme && !s.efektiNapomena) {
        s.efektiNapomena = true;
        sacuvajPodatke();
        prikaziEfektiUvod(1600);
    }
}

function prikaziEfektiUvod(kasnjenje) {
    setTimeout(() => {
        if (window.VirusTema && typeof window.VirusTema.efektiPanel === 'function') {
            window.VirusTema.efektiPanel();
        }
    }, kasnjenje == null ? 1200 : kasnjenje);
}
// ===== CODE TEMA: BOJE =====

const code_BOJE = [
    { id: 'zelena',  naziv: 'Zelena',  hex: '#00ff9c' },
    { id: 'plava',   naziv: 'Plava',   hex: '#3aa0ff' },
    { id: 'cijan',   naziv: 'Cijan',   hex: '#22d3ee' },
    { id: 'zuta',    naziv: 'Žuta',    hex: '#ffd60a' },
    { id: 'crvena',  naziv: 'Crvena',  hex: '#ff3860' },
    { id: 'magenta', naziv: 'Magenta', hex: '#e879f9' },
    { id: 'bela',    naziv: 'Bela',    hex: '#e8f4ec' }
];
/* naziv je rezerva; prikaz se prevodi preko t('boja.' + id) u BIOS-u */
const code_BOJA_PODRAZUMEVANA = '#00ff9c';

const code_VARIJABLE = [
    '--gx-rgb', '--primarna', '--primarna-hover', '--primarna-tekst', '--uspesna',
    '--bg-glavni', '--bg-kartica', '--bg-zaglavlje', '--bg-muted',
    '--tekst-primarni', '--tekst-sekundarni', '--tekst-muted',
    '--ivica', '--ivica-svetla',
    '--gx-bg-unos', '--gx-bg-prekrivac', '--gx-bg-podnozje',
    '--gx-bios-bg', '--gx-bios-bg-tamno', '--gx-bios-panel',
    '--gx-bios-tekst', '--gx-bios-tekst-siv', '--gx-bios-zuti',
    '--gx-bios-naziv', '--gx-bios-kbd-bg', '--gx-bios-kbd-tekst', '--gx-bios-kbd-ivica',
    '--gx-boot-tekst', '--gx-boot-tekst-siv', '--gx-boot-zuti', '--gx-boot-zeleni',
    '--gx-xray-bg', '--gx-xray-tekst', '--gx-xray-ivica', '--gx-xray-senka', '--gx-xray-okvir'
];

function hexZacodeBoju(bojaId, prilagodjeniHex) {
    if (bojaId === 'prilagodjeno') {
        return /^#[0-9a-fA-F]{6}$/.test(String(prilagodjeniHex || ''))
            ? String(prilagodjeniHex).toLowerCase()
            : code_BOJA_PODRAZUMEVANA;
    }
    const preset = code_BOJE.find(b => b.id === bojaId);
    return preset ? preset.hex : code_BOJA_PODRAZUMEVANA;
}

function generisicodePaletu(boja) {
    const hex = /^#[0-9a-fA-F]{6}$/.test(String(boja || ''))
        ? String(boja).toLowerCase()
        : code_BOJA_PODRAZUMEVANA;
    const rgb = hexToRgb(hex);
    const { h, s, l } = hexToHsl(hex);
    const H = (lz, sz) => hslToHex(h, sz, lz);
    const sat = faktor => Math.round(s * faktor);

    return {
        '--gx-rgb': `${rgb.r}, ${rgb.g}, ${rgb.b}`,
        '--primarna': hex,
        '--primarna-hover': H(Math.min(l + 16, 68), s),

        '--primarna-tekst': getContrastText(hex),
        '--uspesna': hex,
        '--bg-glavni': H(2.5, sat(0.5)),
        '--bg-kartica': H(4, sat(0.6)) + 'ef',
        '--bg-zaglavlje': H(3, sat(0.65)) + 'f5',
        '--bg-muted': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.07)`,
        '--tekst-primarni': H(91, Math.min(s, 90)),
        '--tekst-sekundarni': H(67, sat(0.5)),
        '--tekst-muted': H(40, sat(0.4)),
        '--ivica': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`,
        '--ivica-svetla': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`,
        '--gx-bg-unos': H(3, sat(0.65)) + 'e6',
        '--gx-bg-prekrivac': H(1.6, sat(0.8)) + 'ea',
        '--gx-bg-podnozje': H(3, sat(0.65)) + 'f2',
        '--gx-bios-bg': H(2, sat(0.8)),
        '--gx-bios-bg-tamno': H(1, sat(0.8)),
        '--gx-bios-panel': H(5, sat(0.75)),
        '--gx-bios-tekst': H(89, Math.min(s, 80)),
        '--gx-bios-tekst-siv': H(42, sat(0.28)),
        '--gx-bios-zuti': H(75, s),
        '--gx-bios-naziv': H(93, Math.min(s, 40)),
        '--gx-bios-kbd-bg': 'rgba(0, 0, 0, 0.35)',
        '--gx-bios-kbd-tekst': H(75, s),
        '--gx-bios-kbd-ivica': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
        '--gx-boot-tekst': H(89, Math.min(s, 80)),
        '--gx-boot-tekst-siv': H(70, sat(0.45)),
        '--gx-boot-zuti': H(80, Math.min(s, 95)),
        '--gx-boot-zeleni': hex,
        '--gx-xray-bg': H(3, sat(0.8)) + 'f0',
        '--gx-xray-tekst': hex,
        '--gx-xray-ivica': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
        '--gx-xray-senka': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`,
        '--gx-xray-okvir': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`
    };
}

function generisicodePaletuSvetlu(boja) {
    const hex = /^#[0-9a-fA-F]{6}$/.test(String(boja || ''))
        ? String(boja).toLowerCase()
        : code_BOJA_PODRAZUMEVANA;
    const rgb = hexToRgb(hex);
    const { h, s, l } = hexToHsl(hex);
    const H = (lz, sz) => hslToHex(h, sz, lz);
    const sat = faktor => Math.round(s * faktor);

    const tamni = hexToRgb(H(Math.max(l - 22, 26), Math.min(s + 8, 96)));
    const t = tamni;
    const akcenat = hexToRgb(H(Math.min(Math.max(l - 30, 18), 30), Math.min(s + 12, 96)));

    return {
        '--gx-rgb': `${t.r}, ${t.g}, ${t.b}`,
        '--primarna': H(Math.max(l - 22, 26), Math.min(s + 8, 96)),
        '--primarna-hover': H(Math.max(l - 30, 18), Math.min(s + 8, 96)),
        '--primarna-tekst': '#ffffff',
        '--uspesna': H(Math.max(l - 18, 30), s),
        '--bg-glavni': H(97, sat(0.3)),
        '--bg-kartica': H(99, sat(0.4)) + 'f5',
        '--bg-zaglavlje': H(98, sat(0.35)) + 'f2',
        '--bg-muted': `rgba(${t.r}, ${t.g}, ${t.b}, 0.08)`,
        '--tekst-primarni': H(14, sat(0.55)),
        '--tekst-sekundarni': H(30, sat(0.5)),
        '--tekst-muted': H(45, sat(0.4)),
        '--ivica': `rgba(${t.r}, ${t.g}, ${t.b}, 0.4)`,
        '--ivica-svetla': `rgba(${t.r}, ${t.g}, ${t.b}, 0.18)`,
        '--gx-bg-unos': H(100, sat(0.25)) + 'e6',
        '--gx-bg-prekrivac': H(96, sat(0.4)) + 'ea',
        '--gx-bg-podnozje': H(97, sat(0.35)) + 'f2',
        '--gx-bios-bg': H(96, sat(0.35)),
        '--gx-bios-bg-tamno': H(93, sat(0.35)),
        '--gx-bios-panel': H(98, sat(0.3)),
        '--gx-bios-tekst': H(16, sat(0.55)),
        '--gx-bios-tekst-siv': H(42, sat(0.35)),
        '--gx-bios-zuti': H(28, s),
        '--gx-bios-naziv': H(14, sat(0.6)),
        '--gx-bios-kbd-bg': H(99, sat(0.2)),
        '--gx-bios-kbd-tekst': H(Math.min(Math.max(l - 30, 18), 30), Math.min(s + 12, 96)),
        '--gx-bios-kbd-ivica': `rgba(${t.r}, ${t.g}, ${t.b}, 0.45)`,
        '--gx-boot-tekst': H(89, Math.min(s, 80)),
        '--gx-boot-tekst-siv': H(70, sat(0.45)),
        '--gx-boot-zuti': H(80, Math.min(s, 95)),
        '--gx-boot-zeleni': hex,
        '--gx-xray-bg': H(99, sat(0.2)) + 'f2',
        '--gx-xray-tekst': H(Math.min(Math.max(l - 30, 18), 30), Math.min(s + 12, 96)),
        '--gx-xray-ivica': `rgba(${akcenat.r}, ${akcenat.g}, ${akcenat.b}, 0.55)`,
        '--gx-xray-senka': `rgba(${akcenat.r}, ${akcenat.g}, ${akcenat.b}, 0.22)`,
        '--gx-xray-okvir': `rgba(${akcenat.r}, ${akcenat.g}, ${akcenat.b}, 0.9)`
    };
}

function primenicodeBoju(bojaHex, svetlaOverride) {
    const telo = document.body;
    if (!telo) return;
    ocisticodeBoje();

    const efekti = podaciAplikacije.settings.effects || {};
    const idBoje = efekti.color || 'zelena';
    const hex = (typeof bojaHex === 'string' && /^#[0-9a-fA-F]{6}$/.test(bojaHex))
        ? bojaHex.toLowerCase()
        : hexZacodeBoju(idBoje, efekti.customColor);
    const svetla = typeof svetlaOverride === 'boolean'
        ? svetlaOverride
        : !!(podaciAplikacije.settings.codeLight);

    telo.setAttribute('data-gx-boja', idBoje);
    telo.classList.toggle('code-svetla', svetla);
    try {
        const paleta = svetla ? generisicodePaletuSvetlu(hex) : generisicodePaletu(hex);
        Object.entries(paleta).forEach(([ime, vrednost]) => {
            telo.style.setProperty(ime, vrednost);
        });
    } catch (e) {  }

        if (window.codeEngine && typeof window.codeEngine.osveziBoje === 'function') {
        try { window.codeEngine.osveziBoje(); } catch (e) {  }
    }
}

function ocisticodeBoje() {
    const telo = document.body;
    if (!telo) return;
    code_VARIJABLE.forEach(ime => telo.style.removeProperty(ime));
    telo.removeAttribute('data-gx-boja');
    telo.classList.remove('code-svetla');
}

// ===== KONVERZIJE BOJA =====
function hexToHsl(hex) {
    hex = String(hex || '').replace(/^#/, '');
    if (hex.length !== 6) return { h: 174, s: 42, l: 32 };

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex) {
    hex = String(hex || '').replace(/^#/, '');
    return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16)
    };
}

function getLuminance(rgb) {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastText(bgColor) {
    try {
        return getLuminance(hexToRgb(bgColor)) > 0.179 ? '#000000' : '#ffffff';
    } catch (e) {
        return '#ffffff';
    }
}

// ===== PRILAGODJENA TEMA =====
function generateThemeColors(primaryColor, themeMode) {
    const hsl = hexToHsl(primaryColor);
    const isDark = themeMode === 'dark';

    const adj = { ...hsl };
    if (isDark) {
        adj.l = Math.min(hsl.l + 15, 60);
        adj.s = Math.max(hsl.s - 5, 45);
    } else {
        adj.l = Math.max(hsl.l - 5, 35);
    }

    const primary = hslToHex(adj.h, adj.s, adj.l);
    const primaryHover = hslToHex(adj.h, adj.s, isDark ? Math.min(adj.l + 10, 75) : Math.max(adj.l - 10, 25));

    let bgMain, bgCard, bgHeader, bgMuted;
    let textPrimary, textSecondary, textMuted;
    let border, borderLight;

    if (isDark) {
        bgMain = hslToHex(adj.h, Math.max(adj.s - 30, 25), 10);
        bgCard = hslToHex(adj.h, Math.max(adj.s - 25, 30), 14);
        bgHeader = hslToHex(adj.h, Math.max(adj.s - 30, 25), 12) + 'f2';
        bgMuted = hslToHex(adj.h, Math.max(adj.s - 20, 35), 20);

        textPrimary = '#f8fafc';
        textSecondary = '#cbd5e1';
        textMuted = '#94a3b8';

        border = hslToHex(adj.h, Math.max(adj.s - 15, 40), 25);
        borderLight = hslToHex(adj.h, Math.max(adj.s - 25, 30), 16);
    } else {
        bgMain = hslToHex(adj.h, Math.max(adj.s - 55, 15), 96);
        bgCard = hslToHex(adj.h, Math.max(adj.s - 60, 10), 99);
        bgHeader = hslToHex(adj.h, Math.max(adj.s - 55, 15), 97) + 'f2';
        bgMuted = hslToHex(adj.h, Math.max(adj.s - 50, 20), 92);

        textPrimary = '#1e293b';
        textSecondary = '#64748b';
        textMuted = '#94a3b8';

        border = hslToHex(adj.h, Math.max(adj.s - 45, 25), 85);
        borderLight = hslToHex(adj.h, Math.max(adj.s - 55, 15), 94);
    }

    return {
        '--primarna': primary,
        '--primarna-hover': primaryHover,
        '--primarna-tekst': getContrastText(primary),
        '--sekundarna': isDark ? hslToHex(adj.h, 30, 50) : hslToHex(adj.h, 20, 45),
        '--opasna': '#ef4444',
        '--opasna-hover': '#dc2626',
        '--uspesna': '#22c55e',
        '--bg-glavni': bgMain,
        '--bg-kartica': bgCard,
        '--bg-zaglavlje': bgHeader,
        '--bg-muted': bgMuted,
        '--tekst-primarni': textPrimary,
        '--tekst-sekundarni': textSecondary,
        '--tekst-muted': textMuted,
        '--ivica': border,
        '--ivica-svetla': borderLight,
        '--primarna-10': primary + '1a',
        '--primarna-20': primary + '33',
        '--primarna-30': primary + '4d',
        '--primarna-40': primary + '66',
        '--primarna-50': primary + '80'
    };
}

function applyCustomTheme() {

    if (podaciAplikacije.settings.codeTheme) return;

    const customTheme = podaciAplikacije.settings.customTheme;
    const themeMode = podaciAplikacije.settings.theme;

    if (!customTheme || !customTheme.enabled) return;

    const colors = generateThemeColors(customTheme.primaryColor, themeMode);
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
}
// ===== REZIM I PROMENA TEME =====

function codeRezimOznaka() {
    const s = podaciAplikacije.settings;
    if (s.autoTheme) return 'A';
    return s.codeLight ? 'S' : 'D';
}

function promeniCodeRezim() {
    const s = podaciAplikacije.settings;
    const sledeci = { D: 'S', S: 'A', A: 'D' }[codeRezimOznaka()];

    s.autoTheme = sledeci === 'A';
    if (sledeci === 'A') {
        s.codeLight = temaPeriodTekuci() === 'light';
    } else {
        s.codeLight = sledeci === 'S';
    }
    sacuvajPodatke();
    primeniTemu();
    prikaziToast(t('tema.codeVarijanta', { oznaka: sledeci, naziv: t(sledeci === 'D' ? 'tema.nazivTamna' : sledeci === 'S' ? 'tema.nazivSvetla' : 'tema.nazivAuto') }), 'info');
}

function promeniTemu() {
    const s = podaciAplikacije.settings;

    if (s.codeTheme) {
        promeniCodeRezim();
        return;
    }

    if (s.autoTheme) {
        s.autoTheme = false;
        sacuvajPodatke();
        prikaziToast(t('tema.autoIskljucena'), 'info');
    }

    s.theme = s.theme === 'dark' ? 'light' : 'dark';
    sacuvajPodatke();
    primeniTemu();
}

function primeniTemu() {
    const s = podaciAplikacije.settings;
    const jeTamna = s.theme === 'dark';
    const jecode = !!s.codeTheme;

    if (window.VirusTema && typeof window.VirusTema.animacija === 'function') {
        window.VirusTema.animacija(s.animTema !== false);
    }

    if (window.VirusTema && VirusTema.tranzicija(jecode, primeniTemuStvarno)) return;

    primeniTemuStvarno();

    function primeniTemuStvarno() {

        document.documentElement.removeAttribute('style');

        document.body.classList.toggle('tamna', jeTamna && !jecode);
        document.body.classList.toggle('code-tema', jecode);

        if (!jecode) {
            applyCustomTheme();
            ocisticodeBoje();
        } else {

            primenicodeBoju();
        }

        if (window.codeEngine && typeof window.codeEngine.primeni === 'function') {
            try {
                window.codeEngine.primeni({
                    omogucen: jecode,
                    intenzitet: (s.effects && s.effects.intensity) || 5,
                    inverzija: !!(s.effects && s.effects.invert),
                    kisa: !!(s.effects && s.effects.rain),
                    skenLinije: !!(s.effects && s.effects.scanlines),
                    treperenje: !!(s.effects && s.effects.flicker),
                    korupcija: !!(s.effects && s.effects.corruption)
                });
                if (jecode && typeof window.codeEngine.pokreni === 'function') {
                    window.codeEngine.pokreni();
                }
            } catch (e) {  }
        }

        const ikonaTema = document.getElementById('ikonaTema');
        const codeOznaka = '[' + codeRezimOznaka() + ']';
        if (ikonaTema) {
            postaviIkonu(ikonaTema,
                jeTamna ? 'sunce' : 'mesec',
                jecode ? codeOznaka : (jeTamna ? '[L]' : '[D]'));
        }

        const dugmeTema = document.getElementById('dugmeTema');
        if (dugmeTema) {
            if (jecode) {
                dugmeTema.title = t('tema.codeTitle', { naziv: t(codeRezimOznaka() === 'D' ? 'tema.nazivTamna' : codeRezimOznaka() === 'S' ? 'tema.nazivSvetla' : 'tema.nazivAuto') });
            } else {
                dugmeTema.removeAttribute('title');
            }
        }

        const logoIkona = document.getElementById('logoIkona');
        if (logoIkona) {
            postaviIkonu(logoIkona, jecode ? 'munja' : 'skola', '>_');
        }
    }
}
