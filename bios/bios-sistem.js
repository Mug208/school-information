'use strict';

function izlazniTok() {
    if (imaIzmena()) {
        prikaziDialog({
            naslov: 'NESAČUVANE PROMENE',
            html: 'Sačuvati promene pre izlaza?',
            dugmad: [
                {
                    tekst: 'Sačuvaj i izađi',
                    klasa: 'bios-dugme-glavni',
                    onEnter: function () {
                        zatvori(true);
                    }
                },
                {
                    tekst: 'Izađi bez čuvanja',
                    onEnter: function () {
                        zatvori(false);
                    }
                },
                { tekst: 'Otkaži' }
            ]
        });
    } else {
        zatvori(false);
    }
}

function potvrdaFabrickaIzlaz() {
    prikaziDialog({
        naslov: 'FABRIČKA PODEŠAVANJA',
        html: 'Vratiti fabrička podešavanja? (beleške, raspored i predmeti se ČUVAJU)',
        dugmad: [{ tekst: 'Da', klasa: 'bios-dugme-glavni', onEnter: vratiFabricka }, { tekst: 'Ne' }]
    });
}

function potvrdaPodrazumevanoF9() {
    prikaziDialog({
        naslov: 'PODRAZUMEVANO',
        html: 'Vratiti podrazumevano podešavanja?',
        dugmad: [{ tekst: 'Da', klasa: 'bios-dugme-glavni', onEnter: vratiFabricka }, { tekst: 'Ne' }]
    });
}

function vratiFabricka() {
    if (!(window.App && typeof window.App.podrazumevanaPodesavanja === 'function')) {
        toast('Podrazumevana podešavanja nisu dostupna.', 'greska');
        return;
    }
    var predmeti = radna.subjects;
    try {
        radna = normalizuj(window.App.podrazumevanaPodesavanja());
    } catch (e) {
        toast('Greška pri vraćanju podešavanja.', 'greska');
        return;
    }
    radna.subjects = Array.isArray(predmeti) && predmeti.length ? predmeti : [];
    izabraniId = null;
    osveziPrikaz();
    toast('Fabrička podešavanja vraćena / sačuvajte sa F10.', 'info');
}

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
            pregledUzorak.textContent = 'BOJA ' + trenutna.toUpperCase();
        }
        if (pregledHex) pregledHex.textContent = trenutna.toUpperCase();
    }

    otvoriSidePanel({
        naslov: nov ? 'DODAJ PREDMET' : 'IZMENA PREDMETA',
        fokus: '#spNaziv',
        render: function (sadrzaj, footer) {
            var l1 = document.createElement('label');
            l1.className = 'sp-naslov';
            l1.textContent = 'NAZIV';
            sadrzaj.appendChild(l1);
            nazivEl = document.createElement('input');
            nazivEl.type = 'text';
            nazivEl.className = 'bios-unos sp-unos';
            nazivEl.id = 'spNaziv';
            nazivEl.maxLength = 60;
            nazivEl.value = p.name;
            nazivEl.setAttribute('aria-label', 'Naziv predmeta');
            sadrzaj.appendChild(nazivEl);

            var l2 = document.createElement('label');
            l2.className = 'sp-naslov';
            l2.textContent = 'NASTAVNIK (OPCIONO)';
            sadrzaj.appendChild(l2);
            nastavnikEl = document.createElement('input');
            nastavnikEl.type = 'text';
            nastavnikEl.className = 'bios-unos sp-unos';
            nastavnikEl.id = 'spNastavnik';
            nastavnikEl.maxLength = 60;
            nastavnikEl.value = p.teacher || '';
            nastavnikEl.setAttribute('aria-label', 'Nastavnik (opciono)');
            sadrzaj.appendChild(nastavnikEl);

            var sekB = document.createElement('div');
            sekB.className = 'sp-sekcija';
            sekB.textContent = 'BOJA';
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
            hint.innerHTML = '<kbd>ESC</kbd> Otkaži &middot; <kbd>ENTER</kbd> Sačuvaj';
            footer.appendChild(hint);

            var dugmeS = document.createElement('button');
            dugmeS.type = 'button';
            dugmeS.className = 'bios-dugme bios-dugme-glavni';
            dugmeS.textContent = 'Sačuvaj';
            dugmeS.addEventListener('click', sacuvaj);
            footer.appendChild(dugmeS);

            if (!nov) {
                var dugmeB = document.createElement('button');
                dugmeB.type = 'button';
                dugmeB.className = 'bios-dugme bios-dugme-opasno';
                dugmeB.textContent = 'Obriši';
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
            toast('Unesite naziv predmeta!', 'greska');
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
            toast('Predmet dodat / sačuvajte sa F10.', 'uspeh');
        } else {
            predmet.name = ime;
            predmet.color = trenutna;
            predmet.teacher = nast;
            toast('Predmet izmenjen / sačuvajte sa F10.', 'uspeh');
        }
        zatvoriSidePanel();
        osveziPrikaz();
    }

    function potvrdiBrisanje() {
        prikaziDialog({
            naslov: 'BRISANJE PREDMETA',
            html: 'Obrisati predmet <b>' + bEsc(p.name) + '</b>? Biće uklonjen iz rasporeda i beleški.',
            dugmad: [
                {
                    tekst: 'Da',
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
                { tekst: 'Ne' }
            ]
        });
    }
}

function akcijaIzvoz() {
    if (window.App && typeof window.App.izveziPodatke === 'function') {
        try {
            window.App.izveziPodatke();
        } catch (e) {}
        toast('Podaci izvezeni!', 'info');
    } else {
        toast('Izvoz nije dostupan.', 'greska');
    }
}

function akcijaUvoz(spoji) {
    prikaziDialog({
        naslov: spoji ? 'SPOJI BELEŠKE' : 'UVOZ PODATAKA',
        html: spoji
            ? 'Beleške iz fajla biće spojene sa postojećim. Nastaviti?'
            : 'Uvoz će ZAMENITI sve postojeće podatke. Nastaviti?',
        dugmad: [
            {
                tekst: 'Da',
                klasa: spoji ? 'bios-dugme-glavni' : 'bios-dugme-opasno',
                onEnter: function () {
                    izadjiIUvezi(spoji);
                }
            },
            { tekst: 'Ne' }
        ]
    });
}

function izadjiIUvezi(spoji) {
    zatvori(false);
    setTimeout(function () {
        if (window.App && typeof window.App.uveziPodatke === 'function') {
            try {
                window.App.uveziPodatke(!!spoji);
            } catch (e) {}
        }
    }, 80);
}

function akcijaReset() {
    prikaziDialog({
        naslov: 'RESET SVIH PODATAKA',
        html: 'Obrisati SVE podatke (podešavanja, raspored, beleške)? Ovo se ne može poništiti!',
        dugmad: [
            {
                tekst: 'Obriši',
                klasa: 'bios-dugme-opasno',
                onEnter: function () {
                    zatvori(false);
                    setTimeout(function () {
                        if (window.App && typeof window.App.resetujSve === 'function') {
                            try {
                                window.App.resetujSve();
                            } catch (e) {}
                        }
                    }, 80);
                }
            },
            { tekst: 'Otkaži' }
        ]
    });
}
