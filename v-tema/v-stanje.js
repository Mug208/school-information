// VirusTema: znakovi i zastitice za tranziciju.
'use strict';
    var ZNAKOVI = '{}<>/*;:=+#$01&%!?~^'.split('');

    var zauzeto = false;
    var prviProlaz = true;
    var trenutnocode = document.body.classList.contains('code-tema');
    var smanjenPrikaz = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var ANIM_KLJUC = 'vt-anim';
    var animUkljucena = true;
    try {
        var _p = (window.App && typeof window.App.getPodesavanja === 'function')
            ? window.App.getPodesavanja() : null;
        if (_p && typeof _p.animTema === 'boolean') animUkljucena = _p.animTema;
        else animUkljucena = localStorage.getItem(ANIM_KLJUC) !== '0';
    }
    catch (e) {   }

    var sloj, atmos, blesk, svetlost, fx;

    // ===== SLOJEVI I ANIMACIJA =====
    function pripremiSlojeve() {
        if (sloj) return true;
        if (!document.body) return false;

        sloj = document.createElement('div');
        sloj.id = 'vt-sloj';

        atmos = document.createElement('div');
        atmos.id = 'vt-atmos';

        fx = document.createElement('div');
        fx.id = 'vt-fx';

        blesk = document.createElement('div');
        blesk.id = 'vt-blesk';

        svetlost = document.createElement('div');
        svetlost.id = 'vt-svetlost';

        sloj.appendChild(atmos);
        sloj.appendChild(fx);
        sloj.appendChild(blesk);
        sloj.appendChild(svetlost);
        document.body.appendChild(sloj);
        return true;
    }

    function animacija(uklj) {
        if (typeof uklj === 'boolean' && uklj !== animUkljucena) {
            animUkljucena = uklj;
            try { localStorage.setItem(ANIM_KLJUC, animUkljucena ? '1' : '0'); }
            catch (e) {   }
        }
        return animUkljucena;
    }

    function atmosReset() {
        atmos.style.transition = 'none';
        atmos.classList.remove('vt-siri', 'vt-tihan');
        void atmos.offsetWidth;
        atmos.style.transition = '';
    }
