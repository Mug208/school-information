'use strict';

function skupiBazen() {
    var bazen = [];
    if (!koren || !koren.isConnected) return bazen;
    var nadjeno;
    try {
        nadjeno = koren.querySelectorAll(SELEKTOR_BAZENA);
    } catch (e) {
        return bazen;
    }
    for (var i = 0; i < nadjeno.length; i++) {
        var el = nadjeno[i];
        if (!el || !el.isConnected) continue;
        if (el.hasAttribute('data-code-korumpiran')) continue;
        if (el.classList && el.classList.contains('code-pucket')) continue;
        if (el.querySelector('input, textarea, select')) continue;
        var tekst = el.textContent || '';
        if (tekst.length < 2 || tekst.length > 40) continue;
        if (tekst.replace(/\s+/g, '').length < 2) continue;
        if (el.offsetParent === null) continue;
        bazen.push(el);
    }
    return bazen;
}

function ukloniKlasePraska() {
    if (koren && koren.isConnected) {
        koren.classList.remove('code-prasak', 'code-static', 'code-slice');
        koren.style.removeProperty('--gx');
        koren.style.removeProperty('--gskew');
        koren.style.removeProperty('--ghue');
        koren.style.removeProperty('--prasak-trajanje');
        koren.style.removeProperty('--slice-trajanje');
    }
    ocisti('prasak-kraj');
    ocisti('slice-kraj');
    ocisti('static-kraj');
    if (pucketElement) {
        if (pucketElement.isConnected) {
            pucketElement.classList.remove('code-pucket');
            pucketElement.style.removeProperty('--pucket-trajanje');
        }
        pucketElement = null;
    }
    ocisti('pucket-kraj');
    prasakUToku = false;
}

function izvrsiPrasak(jak) {
    if (!koren || !koren.isConnected) return false;
    var i = cfg.intenzitet;
    var mnozilac = jak ? 1.75 : 1;
    var rezim = Math.floor(Math.random() * 4);
    prasakUToku = true;

    if (rezim === 1) {
        var bazen = skupiBazen();
        if (!bazen.length) {
            rezim = 0;
        } else {
            var meta = bazen[Math.floor(Math.random() * bazen.length)];
            var trajanjeP = Math.round((180 + i * 25) * mnozilac);
            meta.style.setProperty('--pucket-trajanje', trajanjeP + 'ms');
            meta.classList.add('code-pucket');
            pucketElement = meta;
            zakazi('pucket-kraj', function () {
                if (meta && meta.isConnected) {
                    meta.classList.remove('code-pucket');
                    meta.style.removeProperty('--pucket-trajanje');
                }
                if (pucketElement === meta) pucketElement = null;
                prasakUToku = false;
            }, trajanjeP);
            return true;
        }
    }

    if (rezim === 0) {

        var skala = jak ? 1 : (0.45 + 0.55 * (i / 10));
        var gx = (Math.random() * 20 - 10) * skala;
        var gskew = (Math.random() * 4 - 2) * skala;
        var ghue = Math.random() * 40 * skala;
        var trajanjeA = Math.round((140 + i * 22) * mnozilac);
        koren.style.setProperty('--gx', gx.toFixed(2) + 'px');
        koren.style.setProperty('--gskew', gskew.toFixed(2) + 'deg');
        koren.style.setProperty('--ghue', Math.round(ghue) + 'deg');
        koren.style.setProperty('--prasak-trajanje', trajanjeA + 'ms');
        koren.classList.add('code-prasak');
        zakazi('prasak-kraj', ukloniKlasePraska, trajanjeA);
        return true;
    }

    if (rezim === 2) {
        var trajanjeS = Math.round((110 + i * 10) * mnozilac);
        koren.classList.add('code-static');
        zakazi('static-kraj', ukloniKlasePraska, trajanjeS);
        return true;
    }


    var trajanjeC = Math.round((160 + i * 30) * mnozilac);
    koren.style.setProperty('--slice-trajanje', trajanjeC + 'ms');
    koren.classList.add('code-slice');
    zakazi('slice-kraj', ukloniKlasePraska, trajanjeC);
    return true;
}

function okiniPrasak(jak) {
    try {
        if (!koren || !koren.isConnected) return;
        if (podesavanjaSmanjenogPomeranja()) return;
        if (!cfg.omogucen && !temaAktivna()) return;
        if (inverzijaUToku) return;
        ukloniKlasePraska();
        izvrsiPrasak(!!jak);
    } catch (e) {
        ukloniKlasePraska();
    }
}

function planirajPrasak() {
    ocisti('prasak');
    if (!cfg.omogucen || !efikasneVrednosti().prasak || document.hidden) return;
    var osnovno = 16 - cfg.intenzitet * 1.4;
    var kasnjenje = osnovno * (0.6 + Math.random() * 0.8);
    zakazi('prasak', function () {
        if (cfg.omogucen && !prasakUToku && !inverzijaUToku) okiniPrasak(false);
        planirajPrasak();
    }, Math.max(400, kasnjenje * 1000));
}

function zaustaviInverziju() {
    ocisti('inverzija-kraj');
    if (koren && koren.isConnected) koren.classList.remove('invert-flash');
    inverzijaUToku = false;
}

function okiniInverziju(trajanjeMs) {
    try {
        if (!koren || !koren.isConnected) return;
        if (podesavanjaSmanjenogPomeranja()) return;
        if (!cfg.omogucen && !temaAktivna()) return;
        var ms = 200;
        if (typeof trajanjeMs === 'number' && isFinite(trajanjeMs) && trajanjeMs > 0) {
            ms = trajanjeMs;
        }
        if (ms > 600) ms = 600;
        zaustaviInverziju();
        void koren.offsetWidth;
        koren.classList.add('invert-flash');
        inverzijaUToku = true;
        zakazi('inverzija-kraj', zaustaviInverziju, ms);
    } catch (e) {
        zaustaviInverziju();
    }
}

function planirajInverziju() {
    ocisti('inverzija');
    if (!cfg.omogucen || !efikasneVrednosti().inverzija || document.hidden) return;
    var osnovno = 34 - cfg.intenzitet * 2.8;
    var kasnjenje = osnovno * (0.7 + Math.random() * 0.6);
    zakazi('inverzija', function () {
        if (cfg.omogucen && !inverzijaUToku) {
            okiniInverziju(90 + cfg.intenzitet * 14);
        }
        planirajInverziju();
    }, Math.max(500, kasnjenje * 1000));
}

function izmesajTekst(tekst) {
    var procenat = 0.35 + Math.random() * 0.25;
    var znakovi = tekst.split('');
    for (var i = 0; i < znakovi.length; i++) {
        var znak = znakovi[i];
        if (znak === ' ' || znak === '\n' || znak === '\t' || znak === '\r') continue;
        if (Math.random() < procenat) {
            znakovi[i] = ZNAKOVI_KORUPCIJE.charAt(
                Math.floor(Math.random() * ZNAKOVI_KORUPCIJE.length));
        }
    }
    return znakovi.join('');
}

function vratiKorupciju(zapis) {
    if (!zapis) return;
    ocisti(zapis.imeTajmera);
    var element = zapis.element;
    if (element && element.isConnected) {
        for (var i = 0; i < zapis.sacuvano.length; i++) {
            var par = zapis.sacuvano[i];
            if (par.cvor && par.cvor.isConnected) {
                par.cvor.nodeValue = par.original;
            }
        }
        element.removeAttribute('data-code-korumpiran');
        if (element.classList) element.classList.remove('code-korumpiran');
    }
    var indeks = aktivneKorupcije.indexOf(zapis);
    if (indeks !== -1) aktivneKorupcije.splice(indeks, 1);
}

function vratiSveKorupcije() {
    var kopija = aktivneKorupcije.slice();
    for (var i = 0; i < kopija.length; i++) vratiKorupciju(kopija[i]);
    aktivneKorupcije.length = 0;
}

function pokreniKorupciju() {
    if (document.hidden || !efikasneVrednosti().korupcija) return;
    var bazen = skupiBazen();
    if (!bazen.length) return;
    var element = bazen[Math.floor(Math.random() * bazen.length)];

    var cvorovi = [];
    (function kupi(cvor) {
        var deca = cvor.childNodes;
        for (var i = 0; i < deca.length; i++) {
            var dete = deca[i];
            if (dete.nodeType === 3) {
                var vrednost = dete.nodeValue || '';
                if (vrednost.replace(/\s+/g, '').length >= 2) cvorovi.push(dete);
            } else if (dete.nodeType === 1) {
                var oznaka = dete.tagName;
                if (oznaka !== 'SCRIPT' && oznaka !== 'STYLE' &&
                    oznaka !== 'INPUT' && oznaka !== 'TEXTAREA' && oznaka !== 'SELECT') {
                    kupi(dete);
                }
            }
        }
    })(element);
    if (!cvorovi.length) return;

    var sacuvano = [];
    for (var j = 0; j < cvorovi.length; j++) {
        sacuvano.push({ cvor: cvorovi[j], original: cvorovi[j].nodeValue });
        cvorovi[j].nodeValue = izmesajTekst(cvorovi[j].nodeValue || '');
    }
    element.setAttribute('data-code-korumpiran', '1');
    if (element.classList) element.classList.add('code-korumpiran');

    var imeTajmera = 'korupcija-kraj-' + (++brojacKorupcija);
    var zapis = { element: element, sacuvano: sacuvano, imeTajmera: imeTajmera };
    aktivneKorupcije.push(zapis);

    zakazi(imeTajmera, function () { vratiKorupciju(zapis); },
        160 + Math.random() * 420);
}

function planirajKorupciju() {
    ocisti('korupcija');
    if (!cfg.omogucen || !efikasneVrednosti().korupcija || document.hidden) return;
    var osnovno = 22 - cfg.intenzitet * 1.8;
    var kasnjenje = osnovno * (0.5 + Math.random());
    zakazi('korupcija', function () {
        if (cfg.omogucen) pokreniKorupciju();
        planirajKorupciju();
    }, Math.max(1100, kasnjenje * 1000));
}