'use strict';

function rSekcija(id, naziv) {
    return { id: id, naziv: naziv, vrsta: 'sekcija', izbor: false };
}

function rInfo(id, label, vrednost) {
    return { id: id, label: label, vrsta: 'info', izbor: false, get: vrednost };
}

function rTekst(id, label, uzmi, postavi) {
    return { id: id, label: label, vrsta: 'text', izbor: true, get: uzmi, set: postavi };
}

function rBroj(id, label, uzmi, postavi, min, max, korak, iskljucenFn) {
    return {
        id: id,
        label: label,
        vrsta: 'number',
        izbor: true,
        get: uzmi,
        set: postavi,
        min: min,
        max: max,
        korak: korak || 1,
        iskljucenFn: iskljucenFn || null
    };
}

function rIzbor(id, label, uzmi, postavi, opcije, iskljucenFn) {
    return {
        id: id,
        label: label,
        vrsta: 'select',
        izbor: true,
        get: uzmi,
        set: postavi,
        opcije: opcije || [],
        iskljucenFn: iskljucenFn || null
    };
}

function rProvera(id, label, uzmi, postavi, iskljucenFn) {
    return {
        id: id,
        label: label,
        vrsta: 'checkbox',
        izbor: true,
        get: uzmi,
        set: postavi,
        iskljucenFn: iskljucenFn || null
    };
}

function rVreme(id, label, uzmi, postavi) {
    return { id: id, label: label, vrsta: 'time', izbor: true, get: uzmi, set: postavi };
}

function rDatum(id, label, uzmi, postavi, iskljucenFn) {
    return {
        id: id,
        label: label,
        vrsta: 'datum',
        izbor: true,
        get: uzmi,
        set: postavi,
        iskljucenFn: iskljucenFn || null
    };
}

function rBoja(id, label, uzmi, postavi, iskljucenFn) {
    return {
        id: id,
        label: label,
        vrsta: 'color',
        izbor: true,
        get: uzmi,
        set: postavi,
        iskljucenFn: iskljucenFn || null
    };
}

function rGxBoja(id, label, uzmi, postavi, iskljucenFn) {
    return {
        id: id,
        label: label,
        vrsta: 'gxboja',
        izbor: true,
        get: uzmi,
        set: postavi,
        iskljucenFn: iskljucenFn || null
    };
}

function rGxPaleta(id, label, iskljucenFn) {
    return {
        id: id,
        label: label,
        vrsta: 'gxpalette',
        izbor: true,
        get: function () {
            return hexGxBoje();
        },
        set: function (v) {
            postaviGxBoju(v);
        },
        iskljucenFn: iskljucenFn || null
    };
}

function rAkcija(id, label, akcija, opcije) {
    var o = opcije || {};
    return {
        id: id,
        label: label,
        vrsta: 'action',
        izbor: true,
        akcija: akcija,
        opasno: !!o.opasno,
        glavni: !!o.glavni,
        prikaz: o.vrednost || '[ Enter ↵ ]'
    };
}

function rPredmet(predmet) {
    return {
        id: 'predmet_' + predmet.id,
        label: predmet.name,
        vrsta: 'predmet',
        izbor: true,
        predmet: predmet,
        get: function () {
            return predmet.color;
        },
        akcija: function () {
            panelPredmeta(predmet);
        }
    };
}

function rZakljucano(id, label) {
    return { id: id, label: label, vrsta: 'zakljucano', izbor: true };
}

function redIskljucen(red) {
    return typeof red.iskljucenFn === 'function' ? !!red.iskljucenFn() : false;
}

function redoviGlavno() {
    return [
        rInfo('gl_sistem', 'Sistem', 'Školska Informacija v2.0'),
        rInfo('gl_datum', 'Datum', function () {
            return trenutniDatum();
        }),
        rInfo('gl_vreme', 'Vreme', function () {
            return trenutnoVreme();
        }),
        rSekcija('sek_skola', 'ŠKOLA'),
        rTekst(
            'gl_skola',
            'Naziv škole',
            function () {
                return radna.schoolName;
            },
            function (v) {
                radna.schoolName = v;
            }
        ),
        rTekst(
            'gl_razred',
            'Razred',
            function () {
                return radna.className;
            },
            function (v) {
                radna.className = v;
            }
        ),
        rIzbor(
            'gl_broj',
            'Broj časova',
            function () {
                return radna.periodsCount;
            },
            function (v) {
                radna.periodsCount = v;
            },
            [
                { v: 5, l: '5 časova' },
                { v: 6, l: '6 časova' },
                { v: 7, l: '7 časova' },
                { v: 8, l: '8 časova' }
            ]
        ),
        rIzbor(
            'gl_smena',
            'Aktivna smena',
            function () {
                return radna.currentShift;
            },
            function (v) {
                radna.currentShift = v;
            },
            [
                { v: 'jutarnja', l: 'Jutarnja' },
                { v: 'popodnevna', l: 'Popodnevna' }
            ]
        ),
        rInfo('gl_podaci', 'Podaci', function () {
            var s = statistike();
            return s.predmeta + ' predmeta • ' + s.beleski + ' beleški • ' + s.stavkiRasporeda + ' stavki rasporeda';
        })
    ];
}

function redoviPredmeti() {
    var redovi = [
        rInfo('pr_ukupno', 'Ukupno predmeta', function () {
            return statistike().predmeta;
        })
    ];
    redovi.push(rSekcija('sek_lista', 'LISTA PREDMETA'));
    if (!radna.subjects.length) {
        redovi.push(rInfo('pr_prazno', 'Status', 'Nema predmeta / dodajte prvi ispod'));
    } else {
        radna.subjects.forEach(function (p) {
            redovi.push(rPredmet(p));
        });
    }
    redovi.push(
        rAkcija('pr_dodaj', '+ Dodaj novi predmet', function () {
            panelPredmeta(null);
        })
    );
    return redovi;
}

function podrazumevanoSidro() {
    var sad = new Date();
    var godina = sad.getMonth() >= 8 ? sad.getFullYear() : sad.getFullYear() - 1;
    return godina + '-09-01';
}

function parsirajISO(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || ''));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
}

function ponedeljakNedeljeBIOS(d) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
}

function danPromeneBIOS(p) {
    var d = parseInt(p && p.shiftRotationDay, 10);
    return d >= 1 && d <= 7 ? d : 1;
}

function pocetakNedeljeBIOS(d, p) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var js = danPromeneBIOS(p) % 7;
    x.setDate(x.getDate() - ((x.getDay() - js + 7) % 7));
    return x;
}

function rotacijaDanas(p) {
    try {
        var sidro = parsirajISO(p.shiftRotationStart) || parsirajISO(podrazumevanoSidro());
        var perioda = p.shiftRotation || 'nedelja';
        var sad = new Date();
        var idx;
        if (perioda === 'nedelja') {
            var dana = Math.round((pocetakNedeljeBIOS(sad, p) - pocetakNedeljeBIOS(sidro, p)) / 86400000);
            idx = Math.floor(dana / 7);
        } else {
            var meseci = (sad.getFullYear() - sidro.getFullYear()) * 12 + (sad.getMonth() - sidro.getMonth());
            idx =
                perioda === 'mesec'
                    ? meseci
                    : perioda === 'polugodiste'
                      ? Math.floor(meseci / 6)
                      : Math.floor(meseci / 12);
        }
        var prva = p.shiftRotationFirst === 'popodnevna' ? 'popodnevna' : 'jutarnja';
        var parno = ((idx % 2) + 2) % 2 === 0;
        return parno ? prva : prva === 'jutarnja' ? 'popodnevna' : 'jutarnja';
    } catch (e) {
        return 'jutarnja';
    }
}

function rotacijaOpis() {
    if (!radna) return '/';
    try {
        var smena = rotacijaDanas(radna);
        var naziv = smena === 'popodnevna' ? 'Popodnevna' : 'Jutarnja';
        var sidro = parsirajISO(radna.shiftRotationStart) || parsirajISO(podrazumevanoSidro());
        var perioda = radna.shiftRotation || 'nedelja';
        var sad = new Date();
        var idx;
        if (perioda === 'nedelja') {
            var dana = Math.round((pocetakNedeljeBIOS(sad, radna) - pocetakNedeljeBIOS(sidro, radna)) / 86400000);
            idx = Math.floor(dana / 7);
        } else {
            var meseci = (sad.getFullYear() - sidro.getFullYear()) * 12 + (sad.getMonth() - sidro.getMonth());
            idx =
                perioda === 'mesec'
                    ? meseci
                    : perioda === 'polugodiste'
                      ? Math.floor(meseci / 6)
                      : Math.floor(meseci / 12);
        }
        var promena;
        if (perioda === 'nedelja') {
            promena = new Date(pocetakNedeljeBIOS(sidro, radna).getTime() + (idx + 1) * 7 * 86400000);
        } else {
            var b = perioda === 'mesec' ? 1 : perioda === 'polugodiste' ? 6 : 12;
            var uk = sidro.getFullYear() * 12 + sidro.getMonth() + (idx + 1) * b;
            promena = new Date(Math.floor(uk / 12), uk % 12, 1);
        }
        var danTekst = '';
        if (perioda === 'nedelja' && danPromeneBIOS(radna) !== 1) {
            var daniInstr = ['ponedeljkom', 'utorkom', 'sredom', 'četvrtkom', 'petkom', 'subotom', 'nedeljom'];
            danTekst = daniInstr[danPromeneBIOS(radna) - 1] + ' ';
        }
        return (
            naziv +
            ' (menja se ' +
            danTekst +
            dvoje(promena.getDate()) +
            '.' +
            dvoje(promena.getMonth() + 1) +
            '.' +
            promena.getFullYear() +
            '.)'
        );
    } catch (e) {
        return '/';
    }
}

function redoviSmene() {
    var nijeRotacija = function () {
        return (radna.shiftMode || 'sat') !== 'rotacija';
    };
    var redovi = [
        rIzbor(
            'sm_rezim',
            'Režim smene',
            function () {
                return radna.shiftMode || 'sat';
            },
            function (v) {
                radna.shiftMode = v;
                radna.autoShiftChange = v !== 'rucno';
            },
            [
                { v: 'rucno', l: 'Ručno (bez promene)' },
                { v: 'sat', l: 'Po satima (automatski)' },
                { v: 'rotacija', l: 'Rotacija (kalendar)' }
            ]
        ),
        rInfo('sm_rezim_info', 'Kako se menja', function () {
            var r = radna.shiftMode || 'sat';
            if (r === 'rucno') return 'Smenu biraš ručno';
            if (r === 'sat') return 'Po satu na zidu (dnevno)';
            return 'Rotacija: ' + rotacijaOpis();
        }),
        rSekcija('sek_rotacija', 'ROTACIJA SMENE (KALENDAR)'),
        rIzbor(
            'sm_rot_perioda',
            'Smena se menja',
            function () {
                return radna.shiftRotation || 'nedelja';
            },
            function (v) {
                radna.shiftRotation = v;
            },
            [
                { v: 'nedelja', l: 'svake nedelje' },
                { v: 'mesec', l: 'svakog meseca' },
                { v: 'polugodiste', l: 'svakog polugodišta' },
                { v: 'godina', l: 'svake godine' }
            ],
            nijeRotacija
        ),
        rIzbor(
            'sm_rot_dan',
            'Dan promene (nedelja)',
            function () {
                return danPromeneBIOS(radna);
            },
            function (v) {
                radna.shiftRotationDay = parseInt(v, 10) || 1;
            },
            [
                { v: 1, l: 'Ponedeljak' },
                { v: 2, l: 'Utorak' },
                { v: 3, l: 'Sreda' },
                { v: 4, l: 'Četvrtak' },
                { v: 5, l: 'Petak' },
                { v: 6, l: 'Subota' },
                { v: 7, l: 'Nedelja' }
            ],
            function () {
                return nijeRotacija() || (radna.shiftRotation || 'nedelja') !== 'nedelja';
            }
        ),
        rDatum(
            'sm_rot_sidro',
            'Rotacija počinje od',
            function () {
                return radna.shiftRotationStart || podrazumevanoSidro();
            },
            function (v) {
                radna.shiftRotationStart = v;
            },
            nijeRotacija
        ),
        rIzbor(
            'sm_rot_prva',
            'Prva smena u ciklusu',
            function () {
                return radna.shiftRotationFirst === 'popodnevna' ? 'popodnevna' : 'jutarnja';
            },
            function (v) {
                radna.shiftRotationFirst = v;
            },
            [
                { v: 'jutarnja', l: 'Jutarnja' },
                { v: 'popodnevna', l: 'Popodnevna' }
            ],
            nijeRotacija
        ),
        rInfo('sm_rot_danas', 'Danas po rotaciji', function () {
            return (radna.shiftMode || 'sat') === 'rotacija' ? rotacijaOpis() : '/';
        }),
        rSekcija('sek_trajanja', 'TRAJANJA'),
        rBroj(
            'sm_trajanje',
            'Trajanje časa (min)',
            function () {
                return radna.periodDuration;
            },
            function (v) {
                radna.periodDuration = v;
            },
            30,
            60,
            5
        ),
        rBroj(
            'sm_mali',
            'Mali odmor (min)',
            function () {
                return radna.smallBreakDuration;
            },
            function (v) {
                radna.smallBreakDuration = v;
            },
            5,
            15,
            1
        ),
        rBroj(
            'sm_veliki',
            'Veliki odmor (min)',
            function () {
                return radna.bigBreakDuration;
            },
            function (v) {
                radna.bigBreakDuration = v;
            },
            10,
            30,
            5
        ),
        rSekcija('sek_jutarnja', 'JUTARNJA SMENA'),
        rVreme(
            'sm_jut_start',
            'Vreme početka',
            function () {
                return radna.shifts.jutarnja.startTime;
            },
            function (v) {
                radna.shifts.jutarnja.startTime = v;
            }
        ),
        rIzbor(
            'sm_jut_veliki',
            'Veliki odmor posle časa',
            function () {
                return radna.shifts.jutarnja.bigBreakAfterPeriod;
            },
            function (v) {
                radna.shifts.jutarnja.bigBreakAfterPeriod = v;
            },
            [
                { v: 1, l: '1. čas' },
                { v: 2, l: '2. čas' },
                { v: 3, l: '3. čas' },
                { v: 4, l: '4. čas' }
            ]
        ),
        rSekcija('sek_popodnevna', 'POPODNEVNA SMENA'),
        rVreme(
            'sm_pop_start',
            'Vreme početka',
            function () {
                return radna.shifts.popodnevna.startTime;
            },
            function (v) {
                radna.shifts.popodnevna.startTime = v;
            }
        ),
        rIzbor(
            'sm_pop_veliki',
            'Veliki odmor posle časa',
            function () {
                return radna.shifts.popodnevna.bigBreakAfterPeriod;
            },
            function (v) {
                radna.shifts.popodnevna.bigBreakAfterPeriod = v;
            },
            [
                { v: 1, l: '1. čas' },
                { v: 2, l: '2. čas' },
                { v: 3, l: '3. čas' },
                { v: 4, l: '4. čas' }
            ]
        ),
        rSekcija('sek_pregled', 'PREGLED VREMENA / ' + (radna.currentShift === 'jutarnja' ? 'JUTARNJA' : 'POPODNEVNA'))
    ];
    var niz = izracunajVremena(radna);
    niz.forEach(function (t, i) {
        var naziv;
        if (!t.isBreak) naziv = t.period + '. čas';
        else naziv = t.isBigBreak ? 'VELIKI ODMOR' : 'Mali odmor';
        redovi.push(rInfo('pv_' + i, naziv, t.start + ' - ' + t.end));
    });
    return redovi;
}

function redoviEfekti() {
    var redovi = [
        rSekcija('sek_tema', 'TEMA'),
        rIzbor(
            'ef_tema',
            'Tema aplikacije',
            function () {
                return radna.theme;
            },
            function (v) {
                radna.theme = v;
            },
            [
                { v: 'light', l: 'Svetla' },
                { v: 'dark', l: 'Tamna' }
            ]
        ),
        rBoja(
            'ef_akcenat',
            'Boja akcenta',
            function () {
                return radna.customTheme.primaryColor;
            },
            function (v) {
                radna.customTheme.primaryColor = v;
            }
        ),
        rSekcija('sek_code', 'CODE TEMA')
    ];
    if (!radna.codeUnlocked) {
        redovi.push(rZakljucano('ef_code', 'CODE tema'));
        redovi.push(rInfo('ef_status', 'Status', 'ZAKLJUČANO / pronađite tajni kod'));
    } else {
        redovi.push(
            rProvera(
                'ef_code',
                'CODE tema',
                function () {
                    return radna.codeTheme;
                },
                function (v) {
                    radna.codeTheme = v;
                }
            )
        );
        redovi.push(
            rProvera(
                'ef_anim',
                'Animacija promene teme',
                function () {
                    return radna.animTema !== false;
                },
                function (v) {
                    radna.animTema = v;

                    if (window.VirusTema && typeof window.VirusTema.animacija === 'function') {
                        window.VirusTema.animacija(v);
                    }
                }
            )
        );
        redovi.push(
            rBroj(
                'ef_intenzitet',
                'Intenzitet efekata',
                function () {
                    return radna.effects.intensity;
                },
                function (v) {
                    radna.effects.intensity = v;
                },
                1,
                10,
                1
            )
        );

        redovi.push(rSekcija('sek_gx_boja', 'BOJA FOSFORA / IZGLED TEME'));
        redovi.push(
            rGxBoja(
                'ef_gx_boja',
                'Boja teme',
                function () {
                    return hexGxBoje();
                },
                function (v) {
                    postaviGxBoju(v);
                }
            )
        );
        redovi.push(rGxPaleta('ef_gx_presets', 'Preseti'));

        redovi.push(rSekcija('sek_efekti', 'EFEKTI'));
        [
            { id: 'ef_invert', label: 'Invertovanje boja (kratko)', kljuc: 'invert' },
            { id: 'ef_kisa', label: 'Digitalna kiša (matrix)', kljuc: 'rain' },
            { id: 'ef_sken', label: 'Sken linije (CRT)', kljuc: 'scanlines' },
            { id: 'ef_treperenje', label: 'CRT treperenje', kljuc: 'flicker' },
            { id: 'ef_korupcija', label: 'Korupcija teksta', kljuc: 'corruption' }
        ].forEach(function (e) {
            redovi.push(
                rProvera(
                    e.id,
                    e.label,
                    function () {
                        return radna.effects[e.kljuc];
                    },
                    function (v) {
                        radna.effects[e.kljuc] = v;
                    }
                )
            );
        });
        redovi.push(
            rInfo(
                'ef_savet',
                'Savet',
                radna.codeTheme
                    ? 'Enter otvara birač boje / promena je odmah vidljiva (F10 čuva)'
                    : 'Boja/efekti se vide po uključenju code teme (F10 čuva)'
            )
        );
        redovi.push(
            rAkcija(
                'ef_obavestenje',
                'Prikaži uvodno obaveštenje o efektima',
                function () {
                    if (window.VirusTema && typeof window.VirusTema.efektiPanel === 'function') {
                        window.VirusTema.efektiPanel();
                    }
                },
                { vrednost: '[ ⚡ ]' }
            )
        );
    }
    redovi.push(rSekcija('sek_napomena', 'NAPOMENA'));
    return redovi;
}

function redoviPodaci() {
    return [
        rInfo('pd_predmeti', 'Predmeti', function () {
            return statistike().predmeta;
        }),
        rInfo('pd_beleske', 'Beleške', function () {
            return statistike().beleski;
        }),
        rInfo('pd_raspored', 'Stavke rasporeda', function () {
            return statistike().stavkiRasporeda;
        }),
        rInfo('pd_zauzece', 'Zauzeće podataka', function () {
            return statistike().velicinaKB + ' KB';
        }),
        rSekcija('sek_akcije', 'AKCIJE'),
        rAkcija('pd_izvoz', 'Izvezi podatke (JSON)', akcijaIzvoz),
        rAkcija('pd_uvoz', 'Uvezi podatke (zamena svega)', function () {
            akcijaUvoz(false);
        }),
        rAkcija('pd_spoji', 'Spoji beleške iz fajla', function () {
            akcijaUvoz(true);
        }),
        rAkcija('pd_reset', 'Resetuj sve podatke', akcijaReset, { opasno: true })
    ];
}

function redoviIzlaz() {
    return [
        rAkcija(
            'iz_sacuvaj',
            'Sačuvaj promene i izađi',
            function () {
                zatvori(true);
            },
            { glavni: true, vrednost: '[ F10 ]' }
        ),
        rAkcija('iz_otkazi', 'Odbaci promene i izađi', function () {
            zatvori(false);
        }),
        rAkcija('iz_vrati', 'Vrati podrazumevana podešavanja', potvrdaFabrickaIzlaz, { opasno: true })
    ];
}

function trenutniRedovi() {
    switch (aktivnaKategorija) {
        case 'predmeti':
            return redoviPredmeti();
        case 'smene':
            return redoviSmene();
        case 'efekti':
            return redoviEfekti();
        case 'podaci':
            return redoviPodaci();
        case 'izlaz':
            return redoviIzlaz();
        default:
            return redoviGlavno();
    }
}

function nadjiRed(id) {
    for (var i = 0; i < trenutniRedoviModel.length; i++) {
        if (trenutniRedoviModel[i].id === id) return trenutniRedoviModel[i];
    }
    return null;
}
