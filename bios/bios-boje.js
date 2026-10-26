// BIOS: redovi za izbor boja fosfora i prilagodjenog heksa.
'use strict';

// ===== GX BOJE =====
function bezbednaBojaGx(hex) {
    return /^#[0-9a-fA-F]{6}$/.test(String(hex)) ? String(hex) : '#00ff9c';
}

function codeBojeLista() {
    try {
        if (window.App && Array.isArray(window.App.codeBoje)) {
            return window.App.codeBoje;
        }
    } catch (e) { }
    return [];
}

function dozvoljenaGxBoja(v) {
    if (v === 'prilagodjeno') return v;
    var boje = codeBojeLista();
    for (var i = 0; i < boje.length; i++) {
        if (boje[i].id === v) return v;
    }
    return 'zelena';
}

function hexGxBoje() {
    if (!radna) return '#00ff9c';
    if (radna.effects.color === 'prilagodjeno') {
        return bezbednaBojaGx(radna.effects.customColor);
    }
    var boje = codeBojeLista();
    for (var i = 0; i < boje.length; i++) {
        if (boje[i].id === radna.effects.color) return boje[i].hex;
    }
    return '#00ff9c';
}

function postaviGxBoju(hex) {
    if (!radna) return;
    var h = bezbednaBojaGx(hex);
    var preset = null;
    codeBojeLista().forEach(function (b) {
        if (String(b.hex).toLowerCase() === h.toLowerCase()) preset = b.id;
    });
    radna.effects.color = preset || 'prilagodjeno';
    if (!preset) radna.effects.customColor = h;
    prikazicodeBoju();
}

function promeniGxPreset(smer) {
    if (!radna) return;
    var boje = codeBojeLista();
    if (!boje.length) return;
    var i = -1;
    boje.forEach(function (b, idx) {
        if (b.id === radna.effects.color) i = idx;
    });
    if (i === -1) i = smer > 0 ? -1 : 0;
    var novi = boje[(i + smer + boje.length) % boje.length];
    radna.effects.color = novi.id;
    prikazicodeBoju();
}

function prikazicodeBoju() {
    if (!radna || !radna.codeTheme) return;
    try {
        if (window.App && typeof window.App.primenicodeBoju === 'function') {
            window.App.primenicodeBoju(hexGxBoje(), radna.codeLight === true);
        }
    } catch (e) { }
}

// ===== KONVERZIJE BOJA =====
function rgbIzHexa(hex) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex || ''));
    if (!m) return { r: 0, g: 0, b: 0 };
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function hexIzRgb(r, g, b) {
    function d(v) {
        var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
        return s.length === 1 ? '0' + s : s;
    }
    return '#' + d(r) + d(g) + d(b);
}

function rgbUHsv(r, g, b) {
    var mx = Math.max(r, g, b);
    var mn = Math.min(r, g, b);
    var d = mx - mn;
    var h = 0;
    if (d !== 0) {
        if (mx === r) h = 60 * (((g - b) / d) % 6);
        else if (mx === g) h = 60 * ((b - r) / d + 2);
        else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;
    return { h: h, s: mx === 0 ? 0 : d / mx, v: mx / 255 };
}

function hsvURgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    var c = v * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = v - c;
    var r = 0,
        g = 0,
        b = 0;
    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

function hexNijanse(h) {
    var c = hsvURgb(h, 1, 1);
    return hexIzRgb(c.r, c.g, c.b);
}

// ===== HSV BIRAC =====
function napraviHsvBirac(kontejner, pocetniHex, promena) {
    var poc = rgbIzHexa(pocetniHex);
    var hsv = rgbUHsv(poc.r, poc.g, poc.b);

    var sv = document.createElement('div');
    sv.className = 'gxb-sv';
    sv.tabIndex = 0;
    sv.setAttribute('role', 'slider');
    sv.setAttribute('aria-label', 'Zasićenost i svetlina / strelice');
    var svK = document.createElement('div');
    svK.className = 'gxb-kursor';
    sv.appendChild(svK);
    kontejner.appendChild(sv);

    var hueRed = document.createElement('div');
    hueRed.className = 'gxb-hue-red';
    var krug = document.createElement('div');
    krug.className = 'gxb-krug';
    krug.setAttribute('aria-hidden', 'true');
    hueRed.appendChild(krug);
    var hue = document.createElement('div');
    hue.className = 'gxb-hue';
    hue.tabIndex = 0;
    hue.setAttribute('role', 'slider');
    hue.setAttribute('aria-label', 'Nijansa / strelice levo/desno');
    var hueK = document.createElement('div');
    hueK.className = 'gxb-kursor';
    hue.appendChild(hueK);
    hueRed.appendChild(hue);
    kontejner.appendChild(hueRed);

    var rgbRed = document.createElement('div');
    rgbRed.className = 'gxb-rgb';
    var polja = [];
    ['R', 'G', 'B'].forEach(function (slovo) {
        var polje = document.createElement('div');
        polje.className = 'gxb-polje';
        var input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = '255';
        input.step = '1';
        input.setAttribute('inputmode', 'numeric');
        input.className = 'gxb-broj';
        input.setAttribute('aria-label', 'Kanal ' + slovo);
        var l = document.createElement('span');
        l.className = 'gxb-polje-label';
        l.textContent = slovo;
        polje.appendChild(input);
        polje.appendChild(l);
        rgbRed.appendChild(polje);
        polja.push(input);
    });
    kontejner.appendChild(rgbRed);

    function tekuciHex() {
        var c = hsvURgb(hsv.h, hsv.s, hsv.v);
        return hexIzRgb(c.r, c.g, c.b);
    }

    function osvezi(korisnik) {
        var c = hsvURgb(hsv.h, hsv.s, hsv.v);

        sv.style.background =
            'linear-gradient(to top, #000, rgba(0,0,0,0)),' +
            'linear-gradient(to right, #fff, ' +
            hexNijanse(hsv.h) +
            ')';
        svK.style.left = (hsv.s * 100).toFixed(2) + '%';
        svK.style.top = ((1 - hsv.v) * 100).toFixed(2) + '%';
        krug.style.background = tekuciHex();
        hueK.style.left = (hsv.h / 3.6).toFixed(2) + '%';
        polja[0].value = c.r;
        polja[1].value = c.g;
        polja[2].value = c.b;
        sv.setAttribute(
            'aria-valuetext',
            Math.round(hsv.s * 100) + '% zasićenost, ' + Math.round(hsv.v * 100) + '% svetlina'
        );
        hue.setAttribute('aria-valuenow', String(Math.round(hsv.h)));
        if (korisnik && typeof promena === 'function') {
            try {
                promena(tekuciHex());
            } catch (e) { }
        }
    }

    function postaviSv(s, v) {
        hsv.s = Math.max(0, Math.min(1, s));
        hsv.v = Math.max(0, Math.min(1, v));
        osvezi(true);
    }

    function postaviHue(h) {
        hsv.h = ((h % 360) + 360) % 360;
        osvezi(true);
    }

    function vezi(el, fn) {
        var vuce = false;
        function pozicija(d) {
            var r = el.getBoundingClientRect();
            var x = Math.max(0, Math.min(1, (d.clientX - r.left) / r.width));
            var y = Math.max(0, Math.min(1, (d.clientY - r.top) / r.height));
            fn(x, y);
        }
        el.addEventListener('pointerdown', function (d) {
            vuce = true;
            try {
                el.setPointerCapture(d.pointerId);
            } catch (e) { }
            try {
                el.focus();
            } catch (e) { }
            pozicija(d);
            d.preventDefault();
        });
        el.addEventListener('pointermove', function (d) {
            if (vuce) pozicija(d);
        });
        function kraj(d) {
            vuce = false;
            try {
                el.releasePointerCapture(d.pointerId);
            } catch (e) { }
        }
        el.addEventListener('pointerup', kraj);
        el.addEventListener('pointercancel', kraj);
    }

    vezi(sv, function (x, y) {
        postaviSv(x, 1 - y);
    });
    vezi(hue, function (x) {
        postaviHue(x * 360);
    });

    sv.addEventListener('keydown', function (d) {
        var kor = d.shiftKey ? 0.1 : 0.02;
        switch (d.key) {
            case 'ArrowLeft':
                postaviSv(hsv.s - kor, hsv.v);
                d.preventDefault();
                break;
            case 'ArrowRight':
                postaviSv(hsv.s + kor, hsv.v);
                d.preventDefault();
                break;
            case 'ArrowUp':
                postaviSv(hsv.s, hsv.v + kor);
                d.preventDefault();
                break;
            case 'ArrowDown':
                postaviSv(hsv.s, hsv.v - kor);
                d.preventDefault();
                break;
            case 'Home':
                postaviSv(0, hsv.v);
                d.preventDefault();
                break;
            case 'End':
                postaviSv(1, hsv.v);
                d.preventDefault();
                break;
        }
    });
    hue.addEventListener('keydown', function (d) {
        var kor = d.shiftKey ? 15 : 3;
        switch (d.key) {
            case 'ArrowLeft':
                postaviHue(hsv.h - kor);
                d.preventDefault();
                break;
            case 'ArrowRight':
                postaviHue(hsv.h + kor);
                d.preventDefault();
                break;
            case 'Home':
                postaviHue(0);
                d.preventDefault();
                break;
            case 'End':
                postaviHue(359.9);
                d.preventDefault();
                break;
        }
    });

    function citajPolja() {
        var v = [];
        for (var i = 0; i < 3; i++) {
            var n = parseInt(polja[i].value, 10);
            if (isNaN(n)) return null;
            v.push(Math.max(0, Math.min(255, n)));
        }
        return { r: v[0], g: v[1], b: v[2] };
    }
    polja.forEach(function (input) {
        input.addEventListener('input', function () {
            var c = citajPolja();
            if (!c) return;
            hsv = rgbUHsv(c.r, c.g, c.b);
            osvezi(true);
        });
        input.addEventListener('blur', function () {
            osvezi(false);
        });
    });

    osvezi(false);

    return {
        setHex: function (hex) {
            var c = rgbIzHexa(hex);
            hsv = rgbUHsv(c.r, c.g, c.b);
            osvezi(true);
        },
        getHex: tekuciHex
    };
}
