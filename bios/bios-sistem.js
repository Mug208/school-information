// BIOS: cuvanje, izvoz, uvoz, reset i statistika.
'use strict';

// ===== IZLAZ I RESET =====
function izlazniTok() {
    if (imaIzmena()) {
        prikaziDialog({
            naslov: t('bios.dlg.nesacuvano'),
            html: t('bios.dlg.sacuvati'),
            dugmad: [
                {
                    tekst: t('bios.dlg.sacuvajIziđi'),
                    klasa: 'bios-dugme-glavni',
                    onEnter: function () {
                        zatvori(true);
                    }
                },
                {
                    tekst: t('bios.dlg.izadjiBez'),
                    onEnter: function () {
                        zatvori(false);
                    }
                },
                { tekst: t('bios.dlg.otkazi') }
            ]
        });
    } else {
        zatvori(false);
    }
}

function potvrdaFabrickaIzlaz() {
    prikaziDialog({
        naslov: t('bios.dlg.fabricka'),
        html: t('bios.dlg.fabrickaPitanje'),
        dugmad: [{ tekst: t('bios.dlg.da'), klasa: 'bios-dugme-glavni', onEnter: vratiFabricka }, { tekst: t('bios.dlg.ne') }]
    });
}

function potvrdaPodrazumevanoF9() {
    prikaziDialog({
        naslov: t('bios.dlg.podrazumevano'),
        html: t('bios.dlg.podrazumevanoPitanje'),
        dugmad: [{ tekst: t('bios.dlg.da'), klasa: 'bios-dugme-glavni', onEnter: vratiFabricka }, { tekst: t('bios.dlg.ne') }]
    });
}

function vratiFabricka() {
    if (!(window.App && typeof window.App.podrazumevanaPodesavanja === 'function')) {
        toast(t('bios.toast.podrazumevanaNedostupna'), 'greska');
        return;
    }
    var predmeti = radna.subjects;
    try {
        radna = normalizuj(window.App.podrazumevanaPodesavanja());
    } catch (e) {
        toast(t('bios.toast.greskaVracanje'), 'greska');
        return;
    }
    radna.subjects = Array.isArray(predmeti) && predmeti.length ? predmeti : [];
    izabraniId = null;
    osveziPrikaz();
    toast(t('bios.toast.fabrickaVracena'), 'info');
}

// ===== PANEL PREDMETA =====
function panelPredmeta(predmet) {
    var nov = !predmet;
    var p = predmet || { name: '', teacher: '', color: '#0d9488' };
    var sacuvano = false;

    var trenutna = bezbednaBoja(p.color);
    var mreza,
        pregledUzorak,
        pregledHex,
        hsvBirac = null;
    var nazivEl = null,
        nastavnikEl = null;

    function upisiBoju(hex) {
        trenutna = bezbednaBoja(hex);
    }

    function azuriraj() {
        if (mreza) {
            svi('.sp-sw', mreza).forEach(function (b) {
                b.classList.toggle('aktivan', b.getAttribute('data-hex').toLowerCase() === trenutna.toLowerCase());
            });
        }
        if (pregledUzorak) {
            pregledUzorak.style.background = trenutna;
            pregledUzorak.textContent = t('bios.panel.bojaUzorak', { hex: trenutna.toUpperCase() });
        }
        if (pregledHex) pregledHex.textContent = trenutna.toUpperCase();
    }

    otvoriSidePanel({
        naslov: nov ? t('bios.panel.dodaj') : t('bios.panel.izmena'),
        fokus: '#spNaziv',
        render: function (sadrzaj, footer) {
            var l1 = document.createElement('label');
            l1.className = 'sp-naslov';
            l1.textContent = t('bios.panel.naziv');
            sadrzaj.appendChild(l1);
            nazivEl = document.createElement('input');
            nazivEl.type = 'text';
            nazivEl.className = 'bios-unos sp-unos';
            nazivEl.id = 'spNaziv';
            nazivEl.maxLength = 60;
            nazivEl.value = p.name;
            nazivEl.setAttribute('aria-label', t('mod.nazivPredmeta'));
            sadrzaj.appendChild(nazivEl);

            var l2 = document.createElement('label');
            l2.className = 'sp-naslov';
            l2.textContent = t('bios.panel.nastavnik');
            sadrzaj.appendChild(l2);
            nastavnikEl = document.createElement('input');
            nastavnikEl.type = 'text';
            nastavnikEl.className = 'bios-unos sp-unos';
            nastavnikEl.id = 'spNastavnik';
            nastavnikEl.maxLength = 60;
            nastavnikEl.value = p.teacher || '';
            nastavnikEl.setAttribute('aria-label', t('mod.nastavnik'));
            sadrzaj.appendChild(nastavnikEl);

            var sekB = document.createElement('div');
            sekB.className = 'sp-sekcija';
            sekB.textContent = t('bios.panel.boja');
            sadrzaj.appendChild(sekB);

            hsvBirac = napraviHsvBirac(sadrzaj, trenutna, function (hex) {
                upisiBoju(hex);
                azuriraj();
            });

            mreza = document.createElement('div');
            mreza.className = 'sp-boje';
            BOJE_PRESETA.forEach(function (hexP) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'sp-sw';
                b.setAttribute('data-hex', hexP);
                b.style.background = hexP;
                b.title = hexP.toUpperCase();
                b.setAttribute('aria-label', 'Boja ' + hexP.toUpperCase());
                b.addEventListener('click', function () {
                    if (hsvBirac) hsvBirac.setHex(hexP);
                });
                mreza.appendChild(b);
            });
            sadrzaj.appendChild(mreza);

            var pregled = document.createElement('div');
            pregled.className = 'sp-pregled';
            pregledUzorak = document.createElement('div');
            pregledUzorak.className = 'sp-pregled-uzorak';
            pregledHex = document.createElement('span');
            pregledHex.className = 'sp-hex';
            pregled.appendChild(pregledUzorak);
            pregled.appendChild(pregledHex);
            sadrzaj.appendChild(pregled);

            [nazivEl, nastavnikEl].forEach(function (el) {
                el.addEventListener('keydown', function (d) {
                    if (d.key === 'Enter') {
                        d.preventDefault();
                        sacuvaj();
                    }
                });
            });

            var hint = document.createElement('span');
            hint.className = 'bios-side-hint';
            hint.innerHTML = t('bios.panel.hint');
            footer.appendChild(hint);

            var dugmeS = document.createElement('button');
            dugmeS.type = 'button';
            dugmeS.className = 'bios-dugme bios-dugme-glavni';
            dugmeS.textContent = t('mod.sacuvaj');
            dugmeS.addEventListener('click', sacuvaj);
            footer.appendChild(dugmeS);

            if (!nov) {
                var dugmeB = document.createElement('button');
                dugmeB.type = 'button';
                dugmeB.className = 'bios-dugme bios-dugme-opasno';
                dugmeB.textContent = t('mod.obrisi');
                dugmeB.addEventListener('click', function () {
                    potvrdiBrisanje();
                });
                footer.appendChild(dugmeB);
            }

            azuriraj();
        }
    });

    function sacuvaj() {
        if (sacuvano) return;
        var ime = nazivEl ? String(nazivEl.value || '').trim() : '';
        if (!ime) {
            toast(t('bios.toast.unesiteNaziv'), 'greska');
            if (nazivEl) nazivEl.focus();
            return;
        }
        sacuvano = true;
        var nast = nastavnikEl ? String(nastavnikEl.value || '').trim() : '';
        if (nov) {
            radna.subjects.push({
                id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name: ime,
                color: trenutna,
                teacher: nast
            });
            toast(t('bios.toast.predmetDodat'), 'uspeh');
        } else {
            predmet.name = ime;
            predmet.color = trenutna;
            predmet.teacher = nast;
            toast(t('bios.toast.predmetIzmenjen'), 'uspeh');
        }
        zatvoriSidePanel();
        osveziPrikaz();
    }

    function potvrdiBrisanje() {
        prikaziDialog({
            naslov: t('bios.dlg.brisanje'),
            html: t('bios.dlg.brisanjePitanje', { ime: bEsc(p.name) }),
            dugmad: [
                {
                    tekst: t('bios.dlg.da'),
                    klasa: 'bios-dugme-opasno',
                    onEnter: function () {
                        radna.subjects = radna.subjects.filter(function (s) {
                            return s.id !== predmet.id;
                        });
                        izabraniId = null;
                        zatvoriSidePanel();
                        osveziPrikaz();
                    }
                },
                { tekst: t('bios.dlg.ne') }
            ]
        });
    }
}

// ===== AKCIJE: IZVOZ, UVOZ, RESET =====
function akcijaIzvoz() {
    if (window.App && typeof window.App.izveziPodatke === 'function') {
        try {
            window.App.izveziPodatke();
        } catch (e) { }
        toast(t('bios.toast.izvezeni'), 'info');
    } else {
        toast(t('bios.toast.izvozNedostupan'), 'greska');
    }
}

function akcijaUvoz(spoji) {
    prikaziDialog({
        naslov: spoji ? t('bios.dlg.spoji') : t('bios.dlg.uvoz'),
        html: spoji
            ? t('bios.dlg.spojiPitanje')
            : t('bios.dlg.uvozPitanje'),
        dugmad: [
            {
                tekst: t('bios.dlg.da'),
                klasa: spoji ? 'bios-dugme-glavni' : 'bios-dugme-opasno',
                onEnter: function () {
                    izadjiIUvezi(spoji);
                }
            },
            { tekst: t('bios.dlg.ne') }
        ]
    });
}

function izadjiIUvezi(spoji) {
    zatvori(false);
    setTimeout(function () {
        if (window.App && typeof window.App.uveziPodatke === 'function') {
            try {
                window.App.uveziPodatke(!!spoji);
            } catch (e) { }
        }
    }, 80);
}

function akcijaReset() {
    prikaziDialog({
        naslov: t('bios.dlg.reset'),
        html: t('bios.dlg.resetPitanje'),
        dugmad: [
            {
                tekst: t('mod.obrisi'),
                klasa: 'bios-dugme-opasno',
                onEnter: function () {
                    zatvori(false);
                    setTimeout(function () {
                        if (window.App && typeof window.App.resetujSve === 'function') {
                            try {
                                window.App.resetujSve();
                            } catch (e) { }
                        }
                    }, 80);
                }
            },
            { tekst: t('bios.dlg.otkazi') }
        ]
    });
}
