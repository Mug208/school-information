// BIOS: reakcije na tastere i tok izlaska sa cuvanjem.
'use strict';

// ===== TASTATURA =====
function naTaster(dog) {
    if (!otvorenFlag) return;

    if (faza === 'boot') {
        dog.preventDefault();
        preskociBoot();
        return;
    }
    if (faza !== 'ui') return;

    var t = dog.target;
    var tag = t && t.tagName ? t.tagName.toUpperCase() : '';
    var izUnosa = tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA';
    var k = dog.key || '';

    if (dialogOtvoren) {
        rukujDijalogTaster(dog, izUnosa);
        return;
    }

    if (sideOtvoren) {
        var sideEl = dom('biosSide');
        var uSide = !!(sideEl && sideEl.contains(dog.target));
        if (k === 'Escape' || k === 'Esc') {
            dog.preventDefault();
            zatvoriSidePanel();
            return;
        }
        if (k === 'F10') {
            dog.preventDefault();
            zatvori(true);
            return;
        }
        if (uSide) {
            if (izUnosa) return;

            if (dog.target && dog.target.type === 'range') return;

            if (
                k !== 'Tab' &&
                dog.target &&
                dog.target.classList &&
                (dog.target.classList.contains('gxb-sv') || dog.target.classList.contains('gxb-hue'))
            ) {
                return;
            }

            if (k === 'Tab' || k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
                var listaF = svi('button, input, .gxb-sv, .gxb-hue', sideEl);
                var iF = listaF.indexOf(dog.target);
                if (iF !== -1 && listaF.length) {
                    dog.preventDefault();
                    var napred = k === 'ArrowRight' || k === 'ArrowDown' || (k === 'Tab' && !dog.shiftKey);
                    var jF = napred ? (iF + 1) % listaF.length : (iF - 1 + listaF.length) % listaF.length;
                    try {
                        listaF[jF].focus();
                    } catch (e) {}
                }
                return;
            }
            return;
        }
    }

    if (izUnosa) return;

    if (dog.ctrlKey || dog.metaKey || dog.altKey) return;

    if ((k === 'Enter' || k === ' ' || k === 'Spacebar') && tag === 'BUTTON') return;

    switch (k) {
        case 'ArrowUp':
            dog.preventDefault();
            pomeri(-1);
            break;
        case 'ArrowDown':
            dog.preventDefault();
            pomeri(1);
            break;
        case 'ArrowLeft':
            dog.preventDefault();
            kategorijaPomeraj(-1);
            break;
        case 'ArrowRight':
            dog.preventDefault();
            kategorijaPomeraj(1);
            break;
        case 'Tab':
            dog.preventDefault();
            kategorijaPomeraj(dog.shiftKey ? -1 : 1);
            break;
        case 'Home':
            dog.preventDefault();
            skociNaKategoriju(0);
            break;
        case 'End':
            dog.preventDefault();
            skociNaKategoriju(KATEGORIJE.length - 1);
            break;
        case 'PageUp':
            dog.preventDefault();
            kategorijaPomeraj(-1);
            break;
        case 'PageDown':
            dog.preventDefault();
            kategorijaPomeraj(1);
            break;
        case '+':
        case '=':
        case ']':
            dog.preventDefault();
            promeniVrednost(1);
            break;
        case '-':
        case '_':
        case '[':
            dog.preventDefault();
            promeniVrednost(-1);
            break;
        case 'Enter':
        case ' ':
        case 'Spacebar':
            dog.preventDefault();
            aktivirajIzabrano();
            break;
        case 'F1':
            dog.preventDefault();
            pomocDijalog();
            break;
        case 'F9':
            dog.preventDefault();
            potvrdaPodrazumevanoF9();
            break;
        case 'F10':
            dog.preventDefault();
            zatvori(true);
            break;
        case 'Escape':
        case 'Esc':
            dog.preventDefault();
            izlazniTok();
            break;
    }
}

// ===== KLIK =====
function naPokret() {
    if (faza === 'boot') preskociBoot();
}

function naNavKlik(dog) {
    if (!otvorenFlag || faza !== 'ui' || dialogOtvoren) return;
    var b = dog.target && dog.target.closest ? dog.target.closest('.bios-nav-dugme') : null;
    if (b) promeniKategoriju(b.getAttribute('data-kat'));
}

function naRedKlik(dog) {
    if (!otvorenFlag || faza !== 'ui' || dialogOtvoren) return;

    var sw = dog.target && dog.target.closest ? dog.target.closest('.gx-sw') : null;
    if (sw) {
        var paletaRed = nadjiRed('ef_gx_presets');
        if (paletaRed && redIskljucen(paletaRed)) {
            tresi('ef_gx_presets');
            return;
        }
        var p = sw.getAttribute('data-gx');
        try {
            sw.blur();
        } catch (e) {}
        if (p === 'prilagodjeno') {
            izabraniId = 'ef_gx_boja';
            osveziSelekciju();
            var redBoje = nadjiRed('ef_gx_boja');
            if (redBoje && !redIskljucen(redBoje)) panelBoje(redBoje);
        } else if (p) {
            if (sideOtvoren) zatvoriSidePanel();
            radna.effects.color = p;
            prikazicodeBoju();
            izabraniId = 'ef_gx_presets';
            osveziPrikaz();
            var elF = redElement(izabraniId);
            if (elF) elF.focus();
        }
        return;
    }

    var el = dog.target && dog.target.closest ? dog.target.closest('.bios-red') : null;
    if (!el) return;

    if (dog.target && dog.target.closest && dog.target.closest('.bios-unos-pak')) return;

    var id = el.getAttribute('data-id');
    if (!id) return;
    var red = nadjiRed(id);
    if (!red || !red.izbor) return;
    if (redIskljucen(red)) {
        tresi(id);
        return;
    }

    if (id === izabraniId) {
        aktivirajIzabrano();
    } else {
        izabraniId = id;
        osveziSelekciju();

        try {
            el.focus();
        } catch (e) {}
    }
}

// ===== OTVARANJE I ZATVARANJE =====
function otvori(kategorija) {
    if (otvorenFlag) return;
    otvorenFlag = true;

    var p = {};
    try {
        if (window.App && typeof window.App.getPodesavanja === 'function') {
            p = window.App.getPodesavanja() || {};
        }
    } catch (e) {
        p = {};
    }
    radna = normalizuj(p);
    snimak = JSON.stringify(radna);

    aktivnaKategorija = 'glavno';
    if (typeof kategorija === 'string') {
        for (var ki = 0; ki < KATEGORIJE.length; ki++) {
            if (KATEGORIJE[ki].id === kategorija) {
                aktivnaKategorija = kategorija;
                break;
            }
        }
    }
    izabraniId = null;
    trenutniRedoviModel = [];
    sideOtvoren = false;
    var sideEl0 = dom('biosSide');
    if (sideEl0) sideEl0.setAttribute('hidden', '');

    var overlay = dom('biosOverlay');
    overlay.removeAttribute('hidden');
    document.body.classList.add('bios-otvoren');

    try {
        if (window.codeEngine) {
            if (typeof window.codeEngine.okiniPrasak === 'function') window.codeEngine.okiniPrasak(true);
            if (typeof window.codeEngine.okiniInverziju === 'function') window.codeEngine.okiniInverziju(220);
        }
    } catch (e) {}

    document.addEventListener('keydown', naTaster, true);
    overlay.addEventListener('pointerdown', naPokret, true);

    pokreniBoot();
}

function zatvori(sacuvaj) {
    if (!otvorenFlag) return;

    if (sacuvaj) {
        if (!validiraj()) return;
        try {
            if (window.App && typeof window.App.sacuvajPodesavanja === 'function') {
                window.App.sacuvajPodesavanja(JSON.parse(JSON.stringify(radna)));
                toast(t('bios.toast.podesavanjaSacuvana'), 'uspeh');
            }
        } catch (e) {
            toast(t('bios.toast.greskaCuvanje'), 'greska');
        }
        if (radna.codeTheme) {
            try {
                if (window.codeEngine && typeof window.codeEngine.okiniPrasak === 'function') {
                    window.codeEngine.okiniPrasak(true);
                }
            } catch (e) {}
        }
    }

    otkaziBoot();
    zaustaviSat();

    if (!sacuvaj) {
        try {
            if (window.App && typeof window.App.primiTemu === 'function') {
                window.App.primiTemu();
            }
        } catch (e) {}
    }

    dialogOtvoren = false;
    dijalogDugmad = [];
    var dij = dom('biosDialog');
    if (dij) dij.setAttribute('hidden', '');

    sideOtvoren = false;
    var sideEl = dom('biosSide');
    if (sideEl) sideEl.setAttribute('hidden', '');

    var overlay = dom('biosOverlay');
    overlay.removeEventListener('pointerdown', naPokret, true);
    document.removeEventListener('keydown', naTaster, true);
    dom('biosUI').setAttribute('hidden', '');
    overlay.setAttribute('hidden', '');
    document.body.classList.remove('bios-otvoren');

    otvorenFlag = false;
    faza = 'zatvoren';
    radna = null;
    snimak = null;
    izabraniId = null;
    trenutniRedoviModel = [];
}

if (dom('biosNav')) dom('biosNav').addEventListener('click', naNavKlik);
if (dom('biosRedovi')) {
    dom('biosRedovi').addEventListener('click', naRedKlik);

    dom('biosRedovi').addEventListener('mousedown', function (dog) {
        if (!document.querySelector('.bios-red-vrednost .bios-unos-red')) return;
        if (dog.target && dog.target.closest && dog.target.closest('.bios-unos-pak')) return;
        dog.preventDefault();
    });
}

(function () {
    var f = document.querySelector('.bios-overlay .bios-footer');
    if (f && !f.querySelector('.bios-footer-mobilno')) {
        var s = document.createElement('span');
        s.className = 'bios-footer-mobilno';
        s.setAttribute('data-i18n', 'bios.mobilno');
        s.textContent = t('bios.mobilno');
        f.appendChild(s);
    }
})();

// ===== JAVNI API =====
window.BIOS = {
    otvori: otvori,
    zatvori: zatvori,
    otvoren: function () {
        return otvorenFlag;
    }
};