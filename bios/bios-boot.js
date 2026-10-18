'use strict';

function bootRed(tekst, vrednostHtml) {
    var t = String(tekst);
    var tacke = '.'.repeat(Math.max(33 - t.length, 6));
    return bEsc(t) + ' ' + tacke + ' ' + vrednostHtml;
}

function dodajBootRed(html, prazno) {
    var d = document.createElement('div');
    d.className = 'bios-boot-red' + (prazno ? ' bios-boot-prazno' : '');
    d.innerHTML = prazno ? '&nbsp;' : html;
    dom('biosBootLog').appendChild(d);
}

function dodajMemRed() {
    dodajBootRed(bootRed('Detektovanje memorije', '<span class="bios-mem-broj">0K</span>'));
    var redovi = svi('#biosBootLog .bios-boot-red');
    var brojEl = redovi.length ? redovi[redovi.length - 1].querySelector('.bios-mem-broj') : null;
    if (!brojEl) return;
    var v = 0;
    bootInterval = setInterval(function () {
        if (faza !== 'boot') {
            clearInterval(bootInterval);
            bootInterval = null;
            return;
        }
        v += 4096;
        if (v >= 65536) {
            v = 65536;
            clearInterval(bootInterval);
            bootInterval = null;
            brojEl.textContent = '65536K';
            var ok = document.createElement('span');
            ok.className = 'bios-ok';
            ok.textContent = ' OK';
            brojEl.parentNode.appendChild(ok);
        } else {
            brojEl.textContent = v + 'K';
        }
    }, 45);
}

function kasnjenje(baza) {
    return Math.round(baza + Math.random() * 60);
}

function pokreniBoot() {
    var log = dom('biosBootLog');
    if (!log) return;
    log.innerHTML = '';
    dom('biosBoot').removeAttribute('hidden');
    dom('biosUI').setAttribute('hidden', '');
    faza = 'boot';

    var st = statistike();
    var statusTxt, statusCls;
    if (!radna.codeUnlocked) {
        statusTxt = '[ ZAKLJUČAN ]';
        statusCls = 'bios-status-zakljucano';
    } else if (radna.codeTheme) {
        statusTxt = '[ AKTIVAN ]';
        statusCls = 'bios-status-spreman';
    } else {
        statusTxt = '[ SPREMAN ]';
        statusCls = 'bios-status-spreman';
    }

    var plan = [
        { kasni: 100, tekst: 'ŠKOLSKI BIOS (C) 2025 Smart Gimnazija' },
        { kasni: 160, tekst: 'Verzija 2.01' },
        { kasni: 140, prazno: true },
        { kasni: 150, memorija: true },
        { kasni: 250, tekst: 'Učitavanje predmeta (' + st.predmeta + ')', vrednost: 'OK', ok: true },
        { kasni: 190, tekst: 'Učitavanje beleški (' + st.beleski + ')', vrednost: 'OK', ok: true },
        { kasni: 190, tekst: 'Učitavanje rasporeda (' + st.stavkiRasporeda + ')', vrednost: 'OK', ok: true },
        { kasni: 310, tekst: 'CODE modul', vrednost: statusTxt, klasa: statusCls },
        { kasni: 260, prazno: true },
        { kasni: 350, kraj: true }
    ];

    var t = 0;
    plan.forEach(function (korak) {
        t += kasnjenje(korak.kasni);
        bootTajmeri.push(
            setTimeout(function () {
                if (faza !== 'boot') return;
                if (korak.kraj) {
                    preskociBoot();
                    return;
                }
                if (korak.memorija) {
                    dodajMemRed();
                    return;
                }
                if (korak.prazno) {
                    dodajBootRed('', true);
                    return;
                }
                var v =
                    korak.vrednost != null
                        ? '<span class="' +
                          (korak.ok ? 'bios-ok' : korak.klasa) +
                          '">' +
                          bEsc(korak.vrednost) +
                          '</span>'
                        : null;
                dodajBootRed(v ? bootRed(korak.tekst, v) : bEsc(korak.tekst));
            }, t)
        );
    });
}

function otkaziBoot() {
    bootTajmeri.forEach(function (id) {
        clearTimeout(id);
    });
    bootTajmeri = [];
    if (bootInterval) {
        clearInterval(bootInterval);
        bootInterval = null;
    }
    var b = dom('biosBoot');
    if (b) b.setAttribute('hidden', '');
}

function preskociBoot() {
    if (faza !== 'boot') return;
    prikaziBIOSUI();
}

function prikaziBIOSUI() {
    faza = 'ui';
    otkaziBoot();
    dom('biosUI').removeAttribute('hidden');
    renderNav();
    renderRedovi();
    renderInfo();
    bPokreniSat();
    var prvo = dom('biosNav') ? dom('biosNav').querySelector('.bios-nav-dugme') : null;
    if (prvo) prvo.focus();
}

function bPokreniSat() {
    zaustaviSat();
    osveziSat();
    satTimer = setInterval(osveziSat, 1000);
}

function zaustaviSat() {
    if (satTimer) {
        clearInterval(satTimer);
        satTimer = null;
    }
}

function osveziSat() {
    if (!otvorenFlag) return;
    var vreme = trenutnoVreme();
    var datum = trenutniDatum();

    var sat = dom('biosSat');
    if (sat) sat.textContent = vreme;

    var elV = redElement('gl_vreme');
    if (elV) {
        var vV = elV.querySelector('.bios-red-vrednost');
        if (vV) vV.textContent = vreme;
    }
    var elD = redElement('gl_datum');
    if (elD) {
        var vD = elD.querySelector('.bios-red-vrednost');
        if (vD) vD.textContent = datum;
    }
    var dl = dom('biosInfoSistem');
    if (dl) {
        var ddV = dl.querySelector('dd[data-info="vreme"]');
        if (ddV) ddV.textContent = vreme;
        var ddD = dl.querySelector('dd[data-info="datum"]');
        if (ddD) ddD.textContent = datum;
    }
}
