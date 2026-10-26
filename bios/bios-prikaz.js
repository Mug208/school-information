// BIOS: renderovanje redova, panela i uzoraka boja.
'use strict';

// ===== BOJE =====
function uzorakBoje(hex, fallback) {
    var v = /^#[0-9a-fA-F]{6}$/.test(String(hex)) ? String(hex) : fallback || '#0d9488';
    return '<span class="bios-boja-uzorak" style="background:' + v + '"></span>';
}

function gxPaletaHTML() {
    var boje = codeBojeLista();
    var html = '<span class="gx-paletta" role="group" aria-label="' + bEsc(t('bios.paleta.arialabel')) + '">';
    boje.forEach(function (b) {
        var akt = radna && radna.effects.color === b.id ? ' aktivna' : '';
        var nazivBoje = t('boja.' + b.id);
        html +=
            '<button type="button" class="gx-sw' +
            akt +
            '" data-gx="' +
            bEsc(b.id) +
            '" tabindex="-1" style="background:' +
            bezbednaBojaGx(b.hex) +
            '" title="' +
            bEsc(nazivBoje) +
            '" aria-label="' +
            bEsc(nazivBoje) +
            '"></button>';
    });
    var custAkt = radna && radna.effects.color === 'prilagodjeno' ? ' aktivna' : '';
    html +=
        '<button type="button" class="gx-sw gx-sw-prilagodjena' +
        custAkt +
        '" data-gx="prilagodjeno" tabindex="-1" style="background:' +
        bezbednaBojaGx(radna ? radna.effects.customColor : '') +
        '" title="' + bEsc(t('bios.paleta.prilagodjena')) + '" aria-label="' + bEsc(t('bios.paleta.prilagodjenaAria')) + '"></button>';
    html += '</span>';
    return html;
}

// ===== VREDNOSTI REDOVA =====
function labelZaIzbor(red) {
    var v = red.get();
    var nadjen = null;
    (red.opcije || []).forEach(function (o) {
        if (String(o.v) === String(v)) nadjen = o;
    });
    return nadjen ? nadjen.l : String(v);
}

function postaviVrednost(vEl, red) {
    var t;
    switch (red.vrsta) {
        case 'info':
            vEl.textContent = String(uzmiVrednost(red));
            vEl.title = vEl.textContent;
            return;
        case 'text':
            t = String(red.get() == null ? '' : red.get());
            vEl.textContent = '[ ' + bSkratiTekst(t) + ' ]';
            if (bSkratiTekst(t) !== t) vEl.title = t;
            return;
        case 'number':
            vEl.textContent = '[ ' + red.get() + ' ]';
            return;
        case 'select':
            vEl.textContent = '[ ' + labelZaIzbor(red) + ' ]';
            return;
        case 'gxboja':
            vEl.innerHTML = uzorakBoje(red.get(), '#00ff9c') + '[ ' + bezbednaBojaGx(red.get()).toUpperCase() + ' ]';
            return;
        case 'gxpalette':
            vEl.innerHTML = gxPaletaHTML();
            return;
        case 'checkbox':
            vEl.textContent = red.get() ? '[ X ]' : '[\u00A0\u00A0\u00A0]';
            return;
        case 'time':
            vEl.textContent = '[ ' + red.get() + ' ]';
            return;
        case 'datum':
            var mD = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(red.get() || ''));
            vEl.textContent = mD ? '[ ' + mD[3] + '.' + mD[2] + '.' + mD[1] + '. ]' : '[ / ]';
            return;
        case 'color':
            vEl.innerHTML = uzorakBoje(red.get()) + '[ ' + bezbednaBoja(red.get()).toUpperCase() + ' ]';
            return;
        case 'action':
            vEl.textContent = red.prikaz;
            return;
        case 'zakljucano':
            vEl.textContent = '[ ????? ]';
            return;
        case 'predmet':
            vEl.innerHTML = uzorakBoje(red.get()) + '[ ' + bezbednaBoja(red.get()).toUpperCase() + ' ]';
            return;
    }
}

// ===== DOM REDOVA =====
function napraviRedDOM(red) {
    var el = document.createElement('div');

    if (red.vrsta === 'sekcija') {
        el.className = 'bios-red bios-sekcija';
        el.textContent = '── ' + red.naziv + ' ──';
        return el;
    }

    el.setAttribute('data-id', red.id);
    var klase = 'bios-red';
    if (red.vrsta === 'info') klase += ' tip-info';
    if (red.vrsta === 'action') {
        if (red.opasno) klase += ' tip-opasno';
        if (red.glavni) klase += ' tip-glavni';
    }
    if (red.vrsta === 'zakljucano') klase += ' tip-zakljucano';
    if (red.vrsta === 'predmet') klase += ' bios-predmet';
    if (red.izbor) {
        if (redIskljucen(red)) klase += ' iskljucen';
        el.setAttribute('role', 'option');
        el.setAttribute('aria-selected', 'false');
        el.tabIndex = -1;
    }
    el.className = klase;

    var l = document.createElement('span');
    l.className = 'bios-red-label';
    if (red.vrsta === 'predmet') {
        l.textContent = red.predmet.name;
        if (red.predmet.teacher) {
            var n = document.createElement('span');
            n.className = 'bios-red-nastavnik';
            n.textContent = ' · ' + red.predmet.teacher;
            l.appendChild(n);
        }
    } else {
        l.textContent = red.label;
    }

    var v = document.createElement('span');
    v.className = 'bios-red-vrednost';
    postaviVrednost(v, red);

    el.appendChild(l);
    el.appendChild(v);
    return el;
}

// ===== NAVIGACIJA =====
function renderNav() {
    var nav = dom('biosNav');
    if (!nav) return;
    nav.innerHTML = '';
    KATEGORIJE.forEach(function (kat) {
        var b = document.createElement('button');
        b.className = 'bios-nav-dugme';
        b.setAttribute('type', 'button');
        b.setAttribute('role', 'tab');
        b.setAttribute('data-kat', kat.id);
        b.textContent = t('bios.kat.' + kat.id);
        nav.appendChild(b);
    });
    osveziNav();
}

function osveziNav() {
    svi('#biosNav .bios-nav-dugme').forEach(function (b) {
        var akt = b.getAttribute('data-kat') === aktivnaKategorija;
        b.classList.toggle('aktivan', akt);
        b.setAttribute('aria-selected', akt ? 'true' : 'false');
    });
}

// ===== RENDER I OSVEZAVANJE =====
function renderRedovi() {
    if (!otvorenFlag || !radna) return;
    var kont = dom('biosRedovi');
    if (!kont) return;
    trenutniRedoviModel = trenutniRedovi();
    kont.innerHTML = '';

    var kat = null;
    KATEGORIJE.forEach(function (k) {
        if (k.id === aktivnaKategorija) kat = k;
    });
    if (!kat) kat = KATEGORIJE[0];
    dom('biosKategorijaNaslov').textContent = t('bios.kat.' + kat.id).toUpperCase();

    trenutniRedoviModel.forEach(function (red) {
        kont.appendChild(napraviRedDOM(red));
    });

    var postoji = trenutniRedoviModel.some(function (r) {
        return r.id === izabraniId && r.izbor;
    });
    if (!postoji) {
        izabraniId = null;
        for (var i = 0; i < trenutniRedoviModel.length; i++) {
            if (trenutniRedoviModel[i].izbor && !redIskljucen(trenutniRedoviModel[i])) {
                izabraniId = trenutniRedoviModel[i].id;
                break;
            }
        }
        if (izabraniId === null) {
            for (var j = 0; j < trenutniRedoviModel.length; j++) {
                if (trenutniRedoviModel[j].izbor) {
                    izabraniId = trenutniRedoviModel[j].id;
                    break;
                }
            }
        }
    }
    osveziSelekciju();
}

function osveziSelekciju() {
    var redovi = svi('#biosRedovi .bios-red[data-id]');
    redovi.forEach(function (el) {
        var iz = el.getAttribute('data-id') === izabraniId;
        el.classList.toggle('izabrano', iz);
        el.setAttribute('aria-selected', iz ? 'true' : 'false');
    });
    var el = redElement(izabraniId);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
}

function redElement(id) {
    if (!id) return null;
    return dom('biosRedovi') ? dom('biosRedovi').querySelector('.bios-red[data-id="' + id + '"]') : null;
}

function renderInfo() {
    if (!otvorenFlag || !radna) return;
    var dl = dom('biosInfoSistem');
    if (!dl) return;
    var st = statistike();
    var verzija = window.App && window.App.verzija ? window.App.verzija : VERZIJA;
    var redovi = [
        [t('bios.info.verzija'), 'v' + verzija, null],
        [t('bios.info.datum'), trenutniDatum(), 'datum'],
        [t('bios.info.vreme'), trenutnoVreme(), 'vreme'],
        [t('bios.info.skola'), radna.schoolName, null],
        [t('bios.info.razred'), radna.className || '/', null],
        [t('bios.info.predmeta'), st.predmeta, null],
        [t('bios.info.beleski'), st.beleski, null]
    ];
    dl.innerHTML = '';
    redovi.forEach(function (r) {
        var dt = document.createElement('dt');
        dt.textContent = r[0];
        var dd = document.createElement('dd');
        dd.textContent = String(r[1]);
        if (r[2]) dd.setAttribute('data-info', r[2]);
        dl.appendChild(dt);
        dl.appendChild(dd);
    });
}

function osveziPrikaz() {
    renderRedovi();
    renderInfo();
}