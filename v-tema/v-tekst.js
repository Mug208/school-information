// VirusTema: skrambl efekti nad tekstom.
'use strict';
    var skramblId = 0;

    // ===== EFEKTI TEKSTA =====
    function skrambl(el, krajnje, trajanje) {
        var token = ++skramblId;
        el._vtSk = token;
        var pocetak = performance.now();

        (function frejm(sada) {
            if (el._vtSk !== token) return;
            var p = Math.min(1, (sada - pocetak) / trajanje);
            var otkriveno = Math.floor(p * krajnje.length);
            var tekst = krajnje.slice(0, otkriveno);

            for (var i = otkriveno; i < krajnje.length; i++) {
                var znak = krajnje.charAt(i);
                tekst += (znak === ' ' || znak === '·')
                    ? znak
                    : ZNAKOVI[(Math.random() * ZNAKOVI.length) | 0];
            }

            el.textContent = tekst;
            if (p < 1) requestAnimationFrame(frejm);
            else el.textContent = krajnje;
        })(pocetak);
    }

    function raspad(el, trajanje) {
        var token = ++skramblId;
        el._vtSk = token;
        var duzina = Math.max(2, (el.textContent || '').length);
        var pocetak = performance.now();

        (function frejm(sada) {
            if (el._vtSk !== token) return;
            if (sada - pocetak >= trajanje) return;
            var tekst = '';
            for (var i = 0; i < duzina; i++) {
                tekst += ZNAKOVI[(Math.random() * ZNAKOVI.length) | 0];
            }
            el.textContent = tekst;
            requestAnimationFrame(frejm);
        })(pocetak);
    }

    var TEKST_CILJEVI = '#nazivSkole span, #nazivRazreda, ' +
                        '.nav-dugme > span:not(.nav-ikona)';

    function skrambljTekstove(trajanje) {
        if (smanjenPrikaz) return;
        var els = document.querySelectorAll(TEKST_CILJEVI);
        for (var i = 0; i < els.length; i++) {
            var t = (els[i].textContent || '').trim();
            if (t.length > 1) skrambl(els[i], t, trajanje);
        }
    }
