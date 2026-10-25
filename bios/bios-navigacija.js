'use strict';

function pomeri(smer) {
    var navig = trenutniRedoviModel.filter(function (r) {
        return r.izbor && !redIskljucen(r);
    });
    if (!navig.length) return;
    var i = -1;
    for (var j = 0; j < navig.length; j++) {
        if (navig[j].id === izabraniId) {
            i = j;
            break;
        }
    }
    var novi;
    if (i === -1) novi = smer > 0 ? navig[0] : navig[navig.length - 1];
    else novi = navig[(i + smer + navig.length) % navig.length];
    izabraniId = novi.id;
    osveziSelekciju();
    var el = redElement(izabraniId);
    if (el) el.focus();
}

function promeniKategoriju(kat) {
    if (aktivnaKategorija === kat) return;
    if (sideOtvoren) zatvoriSidePanel();
    aktivnaKategorija = kat;
    izabraniId = null;
    osveziNav();
    renderRedovi();
}

function kategorijaPomeraj(smer) {
    var i = 0;
    KATEGORIJE.forEach(function (k, idx) {
        if (k.id === aktivnaKategorija) i = idx;
    });
    var novi = (i + smer + KATEGORIJE.length) % KATEGORIJE.length;
    promeniKategoriju(KATEGORIJE[novi].id);
}

function skociNaKategoriju(indeks) {
    if (indeks < 0 || indeks >= KATEGORIJE.length) return;
    promeniKategoriju(KATEGORIJE[indeks].id);
}

function promeniIzbor(red, smer) {
    var vred = red.get();
    var i = -1;
    (red.opcije || []).forEach(function (o, idx) {
        if (String(o.v) === String(vred)) i = idx;
    });
    if (i === -1) i = 0;
    var novi = red.opcije[(i + smer + red.opcije.length) % red.opcije.length];
    red.set(novi.v);
}

function promeniVrednost(smer) {
    var red = nadjiRed(izabraniId);
    if (!red || !red.izbor || redIskljucen(red)) return;
    if (red.vrsta === 'select') {
        promeniIzbor(red, smer);
    } else if (red.vrsta === 'gxboja' || red.vrsta === 'gxpalette') {
        promeniGxPreset(smer);
    } else if (red.vrsta === 'number') {
        var n = parseFloat(red.get());
        if (isNaN(n)) n = red.min;
        var novi = n + (red.korak || 1) * smer;
        var naGranici = false;
        if (novi < red.min) {
            novi = red.min;
            naGranici = true;
        }
        if (novi > red.max) {
            novi = red.max;
            naGranici = true;
        }
        if (novi !== n) red.set(novi);
        if (naGranici) {
            osveziPrikaz();
            tresi(izabraniId);
            return;
        }
    } else if (red.vrsta === 'checkbox') {
        red.set(smer > 0);
    } else if (red.vrsta === 'datum') {
        var mR = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(red.get() || ''));
        var dR = mR ? new Date(+mR[1], +mR[2] - 1, +mR[3]) : new Date();
        dR.setDate(dR.getDate() + smer);
        var godR = dR.getFullYear();
        if (godR < 2000 || godR > 2099) {
            osveziPrikaz();
            tresi(izabraniId);
            return;
        }
        red.set(godR + '-' + dvoje(dR.getMonth() + 1) + '-' + dvoje(dR.getDate()));
    } else {
        return;
    }
    osveziPrikaz();
}

function tresi(id) {
    var el = redElement(id);
    if (!el) return;
    el.classList.remove('bios-treska');
    void el.offsetWidth;
    el.classList.add('bios-treska');
}

function aktivirajIzabrano() {
    var red = nadjiRed(izabraniId);
    if (!red || !red.izbor) return;
    if (redIskljucen(red)) {
        tresi(izabraniId);
        return;
    }
    switch (red.vrsta) {
        case 'text':
        case 'number':
        case 'time':
        case 'datum':
            zameniUnosom(red);
            break;
        case 'select':
            promeniIzbor(red, 1);
            osveziPrikaz();
            break;
        case 'gxboja':
            panelBoje(red);
            break;
        case 'gxpalette':
            promeniGxPreset(1);
            osveziPrikaz();
            break;
        case 'checkbox':
            red.set(!red.get());
            osveziPrikaz();
            break;
        case 'color':
            panelBoje(red);
            break;
        case 'action':
        case 'predmet':
            if (typeof red.akcija === 'function') red.akcija();
            break;
        case 'zakljucano':
            dialogOdbijen();
            break;
    }
}

function zameniUnosom(red) {
    var redEl = redElement(red.id);
    if (!redEl) return;
    var vEl = redEl.querySelector('.bios-red-vrednost');
    if (!vEl) return;

    var stari = document.querySelector('.bios-red-vrednost .bios-unos-red');
    if (stari) return;

    var input = document.createElement('input');
    input.className = 'bios-unos bios-unos-red';
    if (red.vrsta === 'text') {
        input.type = 'text';
        input.maxLength = 60;
        input.value = String(red.get() == null ? '' : red.get());
    } else if (red.vrsta === 'number') {
        input.type = 'number';
        input.min = String(red.min);
        input.max = String(red.max);
        input.step = String(red.korak || 1);
        input.value = String(red.get());
    } else if (red.vrsta === 'datum') {
        input.type = 'date';
        input.min = '2000-01-01';
        input.max = '2099-12-31';
        input.value = String(red.get() || '');
    } else {
        input.type = 'time';
        input.value = String(red.get() || '');
    }

    function uklopi() {
        var n = Math.max(4, Math.min(28, String(input.value || '').length + 2));
        input.style.width = n + 'ch';
    }
    if (red.vrsta === 'text') {
        uklopi();
        input.addEventListener('input', uklopi);
    } else if (red.vrsta === 'number') {
        input.style.width = String(red.max).length + 2 + 'ch';
    } else if (red.vrsta === 'datum') {
        input.style.width = '12ch';
    } else {
        input.style.width = '7ch';
    }

    var otvorenaZagrada = document.createTextNode('[ ');
    var zatvorenaZagrada = document.createTextNode(' ]');
    var pak = document.createElement('span');
    pak.className = 'bios-unos-pak';
    var sloj = document.createElement('span');
    sloj.className = 'bios-kurzor-sloj';
    sloj.setAttribute('aria-hidden', 'true');
    var ogledaloPre = document.createElement('span');
    ogledaloPre.className = 'bk-ogledalo';
    var ogledaloPosle = document.createElement('span');
    ogledaloPosle.className = 'bk-ogledalo';
    var kurzor = document.createElement('span');
    kurzor.className = 'bios-kurzor';
    kurzor.textContent = '\u2588';
    sloj.appendChild(ogledaloPre);
    sloj.appendChild(kurzor);
    sloj.appendChild(ogledaloPosle);
    pak.appendChild(input);
    pak.appendChild(sloj);

    vEl.textContent = '';
    vEl.appendChild(otvorenaZagrada);
    vEl.appendChild(pak);
    vEl.appendChild(zatvorenaZagrada);
    input.focus();
    if (input.select) input.select();

    var poslednjaPozicija = -1;
    function azurirajKurzor() {
        if (!input.isConnected) {
            ocistiSlusace();
            return;
        }
        var tekst = String(input.value || '');
        var poz = null;
        try {
            poz = input.selectionEnd;
        } catch (e) {}
        if (poz == null) poz = tekst.length;
        ogledaloPre.textContent = tekst.slice(0, poz);
        ogledaloPosle.textContent = tekst.slice(poz);
        sloj.scrollLeft = input.scrollLeft || 0;
        if (poz !== poslednjaPozicija) {
            poslednjaPozicija = poz;

            kurzor.style.animation = 'none';
            void kurzor.offsetWidth;
            kurzor.style.animation = '';
        }
    }
    function naPromenuSelekcije() {
        if (document.activeElement === input) azurirajKurzor();
    }
    function ocistiSlusace() {
        document.removeEventListener('selectionchange', naPromenuSelekcije);
    }
    ['input', 'keyup', 'click', 'focus', 'select'].forEach(function (dogadjaj) {
        input.addEventListener(dogadjaj, azurirajKurzor);
    });
    document.addEventListener('selectionchange', naPromenuSelekcije);
    azurirajKurzor();

    var zavrseno = false;

    function potvrdi() {
        if (zavrseno) return;
        zavrseno = true;
        ocistiSlusace();
        var v = input.value;
        if (red.vrsta === 'text') {
            v = String(v).trim();
            if (!v) {
                toast(t('bios.toast.vrednostPrazna'), 'greska');
            } else {
                red.set(v);
            }
        } else if (red.vrsta === 'number') {
            var n = parseFloat(v);
            if (!isNaN(n)) {
                red.set(Math.min(red.max, Math.max(red.min, n)));
            }
        } else if (red.vrsta === 'time') {
            if (/^\d{2}:\d{2}$/.test(String(v))) red.set(String(v));
        } else if (red.vrsta === 'datum') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(String(v))) red.set(String(v));
        }

        setTimeout(osveziPrikaz, 0);
    }

    function otkazi() {
        if (zavrseno) return;
        zavrseno = true;
        ocistiSlusace();
        setTimeout(osveziPrikaz, 0);
    }

    input.addEventListener('keydown', function (d) {
        d.stopPropagation();
        if (d.key === 'Enter') {
            d.preventDefault();
            potvrdi();
        } else if (d.key === 'Escape') {
            d.preventDefault();
            otkazi();
        }
    });
    input.addEventListener('blur', potvrdi);
}

function otvoriSidePanel(podaci) {
    var side = dom('biosSide');
    if (!side) return;
    dom('biosSideNaslov').textContent = podaci.naslov || 'PODMENI';

    var sadrzaj = dom('biosSideSadrzaj');
    var footer = dom('biosSideFooter');
    sadrzaj.innerHTML = '';
    footer.innerHTML = '';

    if (typeof podaci.render === 'function') {
        try {
            podaci.render(sadrzaj, footer);
        } catch (e) {}
    }

    side.removeAttribute('hidden');
    sideOtvoren = true;

    var cilj = podaci.fokus ? sadrzaj.querySelector(podaci.fokus) : null;
    if (!cilj) cilj = sadrzaj.querySelector('button, input') || footer.querySelector('button') || null;
    if (cilj) {
        try {
            cilj.focus();
        } catch (e) {}
    }
}

function zatvoriSidePanel() {
    var side = dom('biosSide');
    if (side) side.setAttribute('hidden', '');
    sideOtvoren = false;
    dom('biosSideSadrzaj').innerHTML = '';
    dom('biosSideFooter').innerHTML = '';

    var f = redElement(izabraniId) || document.querySelector('#biosNav .bios-nav-dugme.aktivan');
    if (f && otvorenFlag) {
        try {
            f.focus();
        } catch (e) {}
    }
}
