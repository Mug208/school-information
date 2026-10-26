// CODE tema: glavni motor, javni API window.codeEngine.
'use strict';
    // ===== TAJMERI I POKRETANJE =====
    function pokreniSveTajmere() {
        planirajPrasak();
        planirajInverziju();
        planirajKorupciju();
    }

    function pokreni() {
        try {
            if (!cfg.omogucen) return;
            pokrenut = true;
            ocistiSve();
            ukloniKlasePraska();
            zaustaviInverziju();
            if (document.hidden) return;
            pokreniSveTajmere();
            pokreniKisu();
        } catch (e) {

        }
    }

    function zaustavi() {
        try {
            pokrenut = false;
            ocistiSve();
            ukloniKlasePraska();
            zaustaviInverziju();
            vratiSveKorupcije();
            zaustaviKisu();
        } catch (e) {

        }
    }

    // ===== PRIMENA PODESAVANJA =====
    function primeniAtribute() {
        var telo = document.body;
        if (!telo) return;
        var e = efikasneVrednosti();
        try {
            telo.setAttribute('data-code-intenzitet', String(cfg.intenzitet));
            telo.setAttribute('data-code-inverzija', e.inverzija ? '1' : '0');
            telo.setAttribute('data-code-kisa', e.kisa ? '1' : '0');
            telo.setAttribute('data-code-sken', e.sken ? '1' : '0');
            telo.setAttribute('data-code-treperenje', e.treperenje ? '1' : '0');
            telo.setAttribute('data-code-korupcija', e.korupcija ? '1' : '0');
            telo.style.setProperty('--code-jacina', (cfg.intenzitet / 10).toFixed(2));
        } catch (err) {

        }
    }

    function primeni(podesavanja) {
        try {
            if (podesavanja && typeof podesavanja === 'object') {
                if (typeof podesavanja.omogucen !== 'undefined') {
                    cfg.omogucen = !!podesavanja.omogucen;
                }
                if (typeof podesavanja.intenzitet !== 'undefined') {
                    var broj = parseInt(podesavanja.intenzitet, 10);
                    if (isNaN(broj)) broj = 5;
                    cfg.intenzitet = Math.max(1, Math.min(10, broj));
                }
                if (typeof podesavanja.inverzija !== 'undefined') {
                    cfg.inverzija = !!podesavanja.inverzija;
                }
                if (typeof podesavanja.kisa !== 'undefined') {
                    cfg.kisa = !!podesavanja.kisa;
                }
                if (typeof podesavanja.skenLinije !== 'undefined') {
                    cfg.skenLinije = !!podesavanja.skenLinije;
                }
                if (typeof podesavanja.treperenje !== 'undefined') {
                    cfg.treperenje = !!podesavanja.treperenje;
                }
                if (typeof podesavanja.korupcija !== 'undefined') {
                    cfg.korupcija = !!podesavanja.korupcija;
                }
            }
            primeniAtribute();
            citajBojeKise();
            if (cfg.omogucen) {
                pokreni();
            } else {
                zaustavi();
            }
        } catch (e) {

        }
    }

    // ===== SLUSACI I INICIJALIZACIJA =====
    function podesaviSlusace() {

        window.addEventListener('resize', function () {
            zakazi('resize', function () { podesaviPlatno(); }, 150);
        });

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                ocistiSve();
                ukloniKlasePraska();
                zaustaviInverziju();
                vratiSveKorupcije();
                zaustaviKisu();
            } else if (cfg.omogucen) {
                pokreni();
            }
        });

        if (medijaSmanjeno) {
            var promena = function () { primeni(); };
            if (typeof medijaSmanjeno.addEventListener === 'function') {
                medijaSmanjeno.addEventListener('change', promena);
            } else if (typeof medijaSmanjeno.addListener === 'function') {
                medijaSmanjeno.addListener(promena);
            }
        }
    }

    function cInit() {
        if (inicijalizovan) return;
        inicijalizovan = true;
        try {
            platno = document.getElementById('codeRain');
            koren = document.getElementById('appKoren');
            citajBojeKise();
            if (platno) podesaviPlatno();
            podesaviSlusace();

            if (document.body && !document.body.hasAttribute('data-code-intenzitet')) {
                primeniAtribute();
            }
        } catch (e) {

        }
    }

    // ===== JAVNI API =====
    window.codeEngine = {
        init: cInit,
        primeni: primeni,
        pokreni: pokreni,
        zaustavi: zaustavi,
        okiniPrasak: okiniPrasak,
        okiniInverziju: okiniInverziju,
        osveziBoje: osveziBoje,
        aktivan: function () { return !!cfg.omogucen; }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cInit);
    } else {
        cInit();
    }
