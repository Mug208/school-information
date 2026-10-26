// CODE tema: kisa znakova preko ekrana.
'use strict';

// ===== RENDER KISE =====
function podesaviPlatno() {
    if (!platno) return;
    try {
        dpr = Math.min(window.devicePixelRatio || 1, 1);
        var w = Math.max(1, Math.floor(window.innerWidth * dpr));
        var h = Math.max(1, Math.floor(window.innerHeight * dpr));
        platno.width = w;
        platno.height = h;
        velicinaFonta = Math.max(8, Math.round(16 * dpr));
        fontKise = velicinaFonta + 'px "JetBrains Mono", "Courier New", monospace';
        if (!kontekst) kontekst = platno.getContext('2d');
        if (!kontekst) return;
        kontekst.fillStyle = kisaBoje.pozadina;
        kontekst.fillRect(0, 0, w, h);
        izgradiKolone();
    } catch (e) {
        kontekst = null;
    }
}

function izgradiKolone() {
    kolone = [];
    if (!kontekst || !platno) return;
    var broj = Math.ceil(platno.width / velicinaFonta);
    var redovi = platno.height / velicinaFonta;
    for (var i = 0; i < broj; i++) {
        kolone.push(Math.floor(Math.random() * redovi));
    }
}


function korakKise() {
    if (!kontekst || !platno) return;

    kontekst.fillStyle = kisaBoje.pozadinaAlfa;
    kontekst.fillRect(0, 0, platno.width, platno.height);
    kontekst.font = fontKise;
    for (var i = 0; i < kolone.length; i++) {
        var znak = ZNAKOVI_KISE.charAt(Math.floor(Math.random() * ZNAKOVI_KISE.length));
        var x = i * velicinaFonta;
        var y = kolone[i] * velicinaFonta;

        kontekst.fillStyle = (Math.random() < 0.125) ? kisaBoje.svetla : kisaBoje.glavna;
        kontekst.fillText(znak, x, y);
        if (y > platno.height && Math.random() > 0.976) {

            kolone[i] = -Math.floor(Math.random() * 12);
        } else {
            kolone[i] += 1;
        }
    }
}

function petljaKise(t) {
    if (!cfg.omogucen || !efikasneVrednosti().kisa || document.hidden) {
        zaustaviKisu();
        return;
    }
    rafId = window.requestAnimationFrame(petljaKise);
    if (!prosliTrenutak) prosliTrenutak = t;
    var proteklo = t - prosliTrenutak;
    prosliTrenutak = t;
    if (proteklo < 0 || proteklo > 250) proteklo = KORAK_KISE;
    akumulator += proteklo;
    var koraka = 0;
    while (akumulator >= KORAK_KISE && koraka < 4) {
        korakKise();
        akumulator -= KORAK_KISE;
        koraka++;
    }
}

// ===== POKRETANJE I ZAUSTAVLJANJE =====
function pokreniKisu() {
    if (!platno || !kontekst) return;
    if (typeof window.requestAnimationFrame !== 'function') return;
    if (!cfg.omogucen || !efikasneVrednosti().kisa || document.hidden) return;
    if (rafId) return;
    prosliTrenutak = 0;
    akumulator = 0;
    rafId = window.requestAnimationFrame(petljaKise);
}

function zaustaviKisu() {
    if (rafId && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(rafId);
    }
    rafId = 0;
}

// ===== BOJE KISE =====
function citajBojeKise() {
    try {
        if (!document.body) return;
        var st = window.getComputedStyle(document.body);

        var triplet = String(st.getPropertyValue('--gx-rgb') || '').split(',');
        var r = parseInt(String(triplet[0] || '').trim(), 10);
        var g = parseInt(String(triplet[1] || '').trim(), 10);
        var b = parseInt(String(triplet[2] || '').trim(), 10);
        if (isNaN(r) || isNaN(g) || isNaN(b)) { r = 0; g = 255; b = 156; }
        var ogranici = function (v) { return Math.max(0, Math.min(255, v)); };
        r = ogranici(r); g = ogranici(g); b = ogranici(b);

        var hexBg = String(st.getPropertyValue('--bg-glavni') || '').trim();
        var br = 3, bgg = 9, bb = 6;
        if (/^#[0-9a-fA-F]{6}$/.test(hexBg)) {
            br = parseInt(hexBg.substring(1, 3), 16);
            bgg = parseInt(hexBg.substring(3, 5), 16);
            bb = parseInt(hexBg.substring(5, 7), 16);
        }

        kisaBoje.glavna = 'rgb(' + r + ',' + g + ',' + b + ')';
        kisaBoje.pozadina = 'rgb(' + br + ',' + bgg + ',' + bb + ')';
        kisaBoje.pozadinaAlfa = 'rgba(' + br + ',' + bgg + ',' + bb + ',0.06)';

        var svetlaVarijanta = !!(document.body && document.body.classList.contains('code-svetla'));
        var mesaj = function (c) { return svetlaVarijanta ? Math.round(c * 0.42) : Math.round(c + (255 - c) * 0.65); };
        kisaBoje.svetla = 'rgb(' + mesaj(r) + ',' + mesaj(g) + ',' + mesaj(b) + ')';
    } catch (e) {

    }
}

function osveziBoje() {
    citajBojeKise();
    if (kontekst && platno) {
        try {
            kontekst.fillStyle = kisaBoje.pozadina;
            kontekst.fillRect(0, 0, platno.width, platno.height);
        } catch (e) {

        }
    }
}