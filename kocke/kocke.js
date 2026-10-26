// Sakrivene kockice C O D E S koje otkljucavaju CODE temu.
'use strict';
(function () {
    const KLJUC = 'skolski-info-kocke';
    const SLOVA = ['C', 'O', 'D', 'E', 'S'];
    const KATEGORIJE = ['raspored', 'kalendar', 'bios', 'beleske', 'modal'];
    const ZNAKOVI = '01#$%&@<>/|';
    const POLOVINA = 7;

    // ===== DEFINICIJE POZICIJA =====
    const DEFINICIJE = {
        raspored: {
            ekviv: true,
            strogo: false,
            maxVrh: 760,
            hostovi: ['.raspored-kontejner.desktop', '.raspored-kontejner.mobilni'],
            x: [4, 96],
            y: [26, 94]
        },
        kalendar: {
            ekviv: false,
            strogo: false,
            maxVrh: 760,
            hostovi: [
                '#tabKalendar .kalendar-kontejner .kartica',
                '#tabKalendar .kalendar-sidebar .kartica',
                '#karticaNadolazeci'
            ],
            x: [4, 96],
            y: [24, 94]
        },
        bios: {
            ekviv: false,
            strogo: false,
            maxVrh: 760,
            hostovi: ['#biosOverlay .bios-panel', '#biosOverlay .bios-info'],
            x: [4, 94],
            y: [18, 94]
        },
        beleske: {
            ekviv: false,
            strogo: false,
            maxVrh: 640,
            hostovi: ['#tabBeleske'],
            x: [3, 97],
            y: [30, 96]
        },
        modal: {
            ekviv: false,
            strogo: true,
            maxVrh: 900,
            hostovi: ['#modalRaspored .modal-kartica', '#modalBeleska .modal-kartica'],
            x: [4, 94],
            y: [18, 94]
        }
    };

    // ===== STANJE I POMOCNE FUNKCIJE =====
    let sacuvano = null;
    let trenutna = null;
    let trenutnoSlovo = '';
    let animacija = false;
    let zakazano = 0;

    function izmedju(od, do_) {
        return od + Math.random() * (do_ - od);
    }

    function zaokruzi(v) {
        return Math.round(v * 10) / 10;
    }

    function promesaj(niz) {
        const kopija = niz.slice();
        for (let i = kopija.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const t = kopija[i];
            kopija[i] = kopija[j];
            kopija[j] = t;
        }
        return kopija;
    }

    // ===== PLAN KOCKICA =====
    function napraviPlan() {
        const redosled = promesaj(KATEGORIJE);
        return SLOVA.map(function (slovo, i) {
            const kat = redosled[i];
            const def = DEFINICIJE[kat];
            return {
                s: slovo,
                k: kat,
                h: Math.floor(Math.random() * def.hostovi.length),
                x: zaokruzi(izmedju(def.x[0], def.x[1])),
                y: zaokruzi(izmedju(def.y[0], def.y[1]))
            };
        });
    }

    function planVazi(obj) {
        if (!obj || typeof obj !== 'object' || !Array.isArray(obj.plan)) return false;
        if (obj.plan.length !== SLOVA.length) return false;
        const videne = {};
        for (let i = 0; i < obj.plan.length; i++) {
            const p = obj.plan[i];
            if (!p || p.s !== SLOVA[i]) return false;
            if (KATEGORIJE.indexOf(p.k) === -1 || videne[p.k]) return false;
            videne[p.k] = true;
            if (!Number.isInteger(p.h) || p.h < 0 || p.h >= DEFINICIJE[p.k].hostovi.length) return false;
            if (!isFinite(p.x) || !isFinite(p.y) || p.x < 0 || p.x > 100 || p.y < 0 || p.y > 100) return false;
        }
        return true;
    }

    function upisi() {
        try {
            localStorage.setItem(KLJUC, JSON.stringify(sacuvano));
        } catch (e) {
        }
    }

    function ucitajStanje() {
        let obj = null;
        try {
            obj = JSON.parse(localStorage.getItem(KLJUC));
        } catch (e) {
            obj = null;
        }
        if (!planVazi(obj)) {
            obj = { v: 1, plan: napraviPlan(), nadjeno: 0 };
        }
        const n = parseInt(obj.nadjeno, 10);
        obj.nadjeno = isFinite(n) ? Math.max(0, Math.min(SLOVA.length, n)) : 0;
        sacuvano = obj;
        upisi();
    }

    function vidljiv(el) {
        return !!el && el.getClientRects().length > 0;
    }

    function upotrebljiv(el) {
        if (!vidljiv(el)) return false;
        const modal = el.closest('.modal');
        return !modal || modal.classList.contains('prikazi');
    }

    function nadjiHost(stavka) {
        const def = DEFINICIJE[stavka.k];
        const lista = def.hostovi.map(function (sel) {
            return document.querySelector(sel);
        });
        if (def.ekviv) {
            return lista.find(upotrebljiv) || null;
        }
        const planirani = lista[stavka.h];
        if (upotrebljiv(planirani)) return planirani;
        if (def.strogo) return null;
        return lista.find(upotrebljiv) || null;
    }

    // ===== PRIKAZ KOCKICE =====
    function ukloni() {
        if (trenutna) {
            trenutna.remove();
            trenutna = null;
            trenutnoSlovo = '';
        }
    }

    function napravi(stavka, host) {
        const def = DEFINICIJE[stavka.k];
        if (window.getComputedStyle(host).position === 'static') {
            host.style.position = 'relative';
        }
        const el = document.createElement('span');
        el.className = 'kk-kocka';
        el.textContent = stavka.s;
        el.setAttribute('aria-hidden', 'true');
        el.style.left = 'calc(' + stavka.x + '% - ' + POLOVINA + 'px)';
        el.style.top = 'min(' + stavka.y + '%, ' + def.maxVrh + 'px)';
        el.addEventListener('click', pronadjena);
        host.appendChild(el);
        trenutna = el;
        trenutnoSlovo = stavka.s;
    }

    function osvezi() {
        zakazano = 0;
        if (animacija || !sacuvano) return;
        const s = typeof podaciAplikacije !== 'undefined' ? podaciAplikacije.settings : null;
        if (!s) return;
        if (s.codeUnlocked) {
            ukloni();
            return;
        }
        if (sacuvano.nadjeno >= SLOVA.length) {
            sacuvano.nadjeno = 0;
            upisi();
        }
        const stavka = sacuvano.plan[sacuvano.nadjeno];
        const host = nadjiHost(stavka);
        if (!host) {
            ukloni();
            return;
        }
        if (trenutna && trenutna.parentNode === host && trenutnoSlovo === stavka.s) return;
        ukloni();
        napravi(stavka, host);
    }

    function zakaziOsvezavanje() {
        if (!zakazano) zakazano = requestAnimationFrame(osvezi);
    }

    function prikaziNapredak() {
        const n = sacuvano.nadjeno;
        const tekst = SLOVA.map(function (l, i) {
            return i < n ? l : '_';
        }).join(' ');
        if (typeof prikaziToast === 'function') prikaziToast('> ' + tekst, 'info');
    }

    // ===== EFEKAT POGOTKA =====
    function napraviSloj(cx, cy) {
        const sloj = document.createElement('div');
        sloj.className = 'kk-fx';

        const prsten = document.createElement('span');
        prsten.className = 'kk-prsten';
        prsten.style.left = cx + 'px';
        prsten.style.top = cy + 'px';
        sloj.appendChild(prsten);

        const linija = document.createElement('span');
        linija.className = 'kk-linija';
        linija.style.top = cy + 'px';
        sloj.appendChild(linija);

        for (let i = 0; i < 8; i++) {
            const z = document.createElement('span');
            z.className = 'kk-znak';
            z.textContent = ZNAKOVI.charAt(Math.floor(Math.random() * ZNAKOVI.length));
            const ugao = Math.random() * Math.PI * 2;
            const put = 22 + Math.random() * 34;
            z.style.left = cx + 'px';
            z.style.top = cy + 'px';
            z.style.setProperty('--kk-dx', Math.round(Math.cos(ugao) * put) + 'px');
            z.style.setProperty('--kk-dy', Math.round(Math.sin(ugao) * put - 12) + 'px');
            z.style.animationDelay = Math.round(Math.random() * 120) + 'ms';
            sloj.appendChild(z);
        }
        return sloj;
    }

    function pokreniEfekat(el, slovo, okvir, kraj) {
        const smanjeno = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        el.classList.add('kk-pogodak');
        if (smanjeno) {
            setTimeout(kraj, 220);
            return;
        }
        const sloj = napraviSloj(okvir.left + okvir.width / 2, okvir.top + okvir.height / 2);
        document.body.appendChild(sloj);

        let broj = 0;
        const mesanje = setInterval(function () {
            broj++;
            if (broj < 7) {
                el.textContent = ZNAKOVI.charAt(Math.floor(Math.random() * ZNAKOVI.length));
            } else {
                el.textContent = slovo;
                clearInterval(mesanje);
            }
        }, 60);

        setTimeout(function () {
            sloj.remove();
        }, 950);
        setTimeout(kraj, 560);
    }

    // ===== NALAZENJE =====
    function pronadjena(e) {
        e.preventDefault();
        e.stopPropagation();
        if (animacija || !trenutna || e.currentTarget !== trenutna) return;
        animacija = true;
        const el = trenutna;
        const slovo = trenutnoSlovo;
        const okvir = el.getBoundingClientRect();
        sacuvano.nadjeno += 1;
        upisi();
        const gotovo = sacuvano.nadjeno >= SLOVA.length;

        pokreniEfekat(el, slovo, okvir, function () {
            ukloni();
            animacija = false;
            if (gotovo) {
                if (typeof aktivirajCodeTemu === 'function') aktivirajCodeTemu();
            } else {
                prikaziNapredak();
                osvezi();
            }
        });
    }

    // ===== POKRETANJE I JAVNI API =====
    function pokreni() {
        ucitajStanje();
        osvezi();
        new MutationObserver(zakaziOsvezavanje).observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'hidden']
        });
        window.addEventListener('resize', zakaziOsvezavanje);
        setInterval(osvezi, 1500);
    }

    window.Kocke = { osvezi: osvezi };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', pokreni);
    } else {
        pokreni();
    }
})();
