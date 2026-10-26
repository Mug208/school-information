// VirusTema: efekti na dugmadima i panelu teme.
'use strict';
    // ===== EFEKTI NA DUGMADIMA =====
    function dugmeTeme() {
        var d = document.getElementById('dugmeTema');
        if (!d) {
            var ikona = document.getElementById('ikonaTema');
            d = (ikona && ikona.parentElement) || null;
        }
        return d;
    }

    function epicentar() {
        var d = dugmeTeme();
        var r = d
            ? d.getBoundingClientRect()
            : { left: innerWidth - 60, top: 40, width: 40, height: 40 };
        return {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
            w: r.width
        };
    }

    function podesiTalas(c) {
        var dijagonala = Math.sqrt(innerWidth * innerWidth +
                                   innerHeight * innerHeight);
        var precnik = dijagonala * 2.06;
        var osnova = 1200;

        atmos.style.width = osnova + 'px';
        atmos.style.height = osnova + 'px';
        atmos.style.left = (c.x - osnova / 2) + 'px';
        atmos.style.top = (c.y - osnova / 2) + 'px';
        atmos.style.setProperty('--vt-skala', (precnik / osnova).toFixed(3));
    }

    // ===== SPORE =====
    function spore(n, lecenje, osnova, raspon, oblast) {
        if (smanjenPrikaz) return;
        var c = epicentar();

        for (var i = 0; i < n; i++) {
            var s = document.createElement('span');
            s.className = 'vt-spore' + (lecenje ? ' heal' : '');
            s.textContent = ZNAKOVI[(Math.random() * ZNAKOVI.length) | 0];

            var ugao = Math.random() * Math.PI * 2;
            var r = oblast[0] + Math.random() * (oblast[1] - oblast[0]);
            s.style.left = Math.max(6, Math.min(innerWidth - 16, c.x + Math.cos(ugao) * r)) + 'px';
            s.style.top = Math.max(6, Math.min(innerHeight - 16, c.y + Math.sin(ugao) * r)) + 'px';
            s.style.fontSize = (9 + Math.random() * 9).toFixed(1) + 'px';
            s.style.animationDelay = (osnova + Math.random() * raspon).toFixed(2) + 's';

            fx.appendChild(s);
            (function (cvor, zivot) {
                setTimeout(function () { cvor.remove(); }, zivot);
            })(s, (osnova + raspon + 1.8) * 1000);
        }
    }

    // ===== ZARAZA =====
    function zarazi(primeni) {
        var d = dugmeTeme();
        var c = epicentar();

        podesiTalas(c);
        blesk.style.left = c.x + 'px';
        blesk.style.top = c.y + 'px';
        atmosReset();

        document.body.classList.add('vt-zaraza');

        if (d) d.classList.add('vt-inficira');
        var ikona = document.getElementById('ikonaTema');
        if (ikona && !smanjenPrikaz) raspad(ikona, 760);

        skrambljTekstove(820);
        spore(7, false, 0.00, 0.25, [4, Math.max(30, c.w)]);

        setTimeout(function () {
            spore(9, false, 0, 0.30, [12, 140]);
            atmos.classList.add('vt-siri');
            blesk.classList.add('vt-talas');
        }, 280);

        setTimeout(function () {
            spore(7, false, 0, 0.20, [4, Math.max(30, c.w)]);
        }, 620);

        setTimeout(function () {
            if (d) d.classList.remove('vt-inficira');
            if (typeof primeni === 'function') primeni();
            spore(5, false, 0, 0.5, [10, 110]);
        }, 780);

        setTimeout(function () {
            atmos.classList.add('vt-tihan');
        }, 1450);

        setTimeout(function () {
            blesk.classList.remove('vt-talas');
            document.body.classList.remove('vt-zaraza');
            zauzeto = false;
        }, 2400);
    }

    function ozivi(primeni) {
        var d = dugmeTeme();

        document.body.classList.add('vt-ozivljava');

        svetlost.classList.add('vt-dise');
        DomRengen.sakrij();

        var ikona = document.getElementById('ikonaTema');
        if (ikona && !smanjenPrikaz) raspad(ikona, 720);
        setTimeout(function () { skrambljTekstove(700); }, 80);

        spore(11, true, 0.0, 0.8, [8, 130]);
        spore(6, true, 0.1, 0.5, [10, 220]);

        setTimeout(function () {
            spore(5, true, 0, 0.5, [8, 110]);
        }, 480);

        setTimeout(function () {
            if (typeof primeni === 'function') primeni();
        }, 750);

        setTimeout(function () {
            if (d) d.classList.add('vt-pulse');
        }, 2150);

        setTimeout(function () {
            if (d) d.classList.remove('vt-pulse');
            svetlost.classList.remove('vt-dise');
            document.body.classList.remove('vt-ozivljava');
            atmosReset();
            zauzeto = false;
        }, 3150);
    }
