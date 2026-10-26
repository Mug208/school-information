// BIOS: model redova podesavanja po kategorijama.
'use strict';

// ===== FABRIKE REDOVA =====
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

function rVreme(id, label, uzmi, postavi, iskljucenFn) {
    return { id: id, label: label, vrsta: 'time', izbor: true, get: uzmi, set: postavi, iskljucenFn: iskljucenFn || null };
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

// ===== RED PREDMETA =====
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

// ===== KATEGORIJA: GLAVNO =====
function redoviGlavno() {
    return [
        rInfo('gl_sistem', t('bios.gl.sistem'), '\u0160kolska Informacija v' + VERZIJA),
        rInfo('gl_datum', t('bios.gl.datum'), function () {
            return trenutniDatum();
        }),
        rInfo('gl_vreme', t('bios.gl.vreme'), function () {
            return trenutnoVreme();
        }),
        rSekcija('sek_skola', t('bios.gl.sekcijaSkola')),
        rTekst(
            'gl_skola',
            t('bios.gl.nazivSkole'),
            function () {
                return radna.schoolName;
            },
            function (v) {
                radna.schoolName = v;
            }
        ),
        rTekst(
            'gl_razred',
            t('bios.gl.razred'),
            function () {
                return radna.className;
            },
            function (v) {
                radna.className = v;
            }
        ),
        rIzbor(
            'gl_jezik',
            t('bios.gl.jezik'),
            function () {
                return radna.language === 'sr' ? 'sr' : 'en';
            },
            function (v) {
                radna.language = v === 'sr' ? 'sr' : 'en';
                try {
                    if (window.Jezici && typeof window.Jezici.postavi === 'function') {
                        window.Jezici.postavi(radna.language);
                    }
                } catch (e) { }
            },
            [
                { v: 'en', l: 'English' },
                { v: 'sr', l: 'Srpski' }
            ]
        ),
        rIzbor(
            'gl_broj',
            t('bios.gl.brojCasova'),
            function () {
                return radna.periodsCount;
            },
            function (v) {
                radna.periodsCount = v;
            },
            [5, 6, 7, 8].map(function (n) {
                return { v: n, l: t('bios.gl.brojCasovaOpcija', { n: n }) };
            })
        ),
        rIzbor(
            'gl_smena',
            t('bios.gl.aktivnaSmena'),
            function () {
                return radna.currentShift;
            },
            function (v) {
                radna.currentShift = v;
            },
            [
                { v: 'jutarnja', l: t('smen.jutarnja') },
                { v: 'popodnevna', l: t('smen.popodnevna') }
            ]
        ),
        rInfo('gl_podaci', t('bios.gl.podaci'), function () {
            var s = statistike();
            return t('bios.gl.podaciInfo', { p: s.predmeta, b: s.beleski, c: s.stavkiRasporeda });
        })
    ];
}

// ===== KATEGORIJA: PREDMETI =====
function redoviPredmeti() {
    var redovi = [
        rInfo('pr_ukupno', t('bios.pr.ukupno'), function () {
            return statistike().predmeta;
        })
    ];
    redovi.push(rSekcija('sek_lista', t('bios.pr.sekcija')));
    if (!radna.subjects.length) {
        redovi.push(rInfo('pr_prazno', 'Status', t('bios.pr.prazno')));
    } else {
        radna.subjects.forEach(function (p) {
            redovi.push(rPredmet(p));
        });
    }
    redovi.push(
        rAkcija('pr_dodaj', t('bios.pr.dodaj'), function () {
            panelPredmeta(null);
        })
    );
    return redovi;
}

// ===== ROTACIJA =====
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
        var naziv = smena === 'popodnevna' ? t('smen.popodnevna') : t('smen.jutarnja');
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
            danTekst = DANI_ROTACIJE_INSTRUMENTAL[danPromeneBIOS(radna) - 1] + ' ';
        }
        var datumStr = dvoje(promena.getDate()) + '.' + dvoje(promena.getMonth() + 1) + '.' + promena.getFullYear() + '.';
        return danTekst
            ? t('bios.sm.rotOpis', { naziv: naziv, danTekst: danTekst, datum: datumStr })
            : t('bios.sm.rotOpisBezDana', { naziv: naziv, datum: datumStr });
    } catch (e) {
        return '/';
    }
}

// ===== KATEGORIJA: SMENE =====
function redoviSmene() {
    var nijeRotacija = function () {
        return (radna.shiftMode || 'sat') !== 'rotacija';
    };
    var redovi = [
        rIzbor(
            'sm_rezim',
            t('bios.sm.rezim'),
            function () {
                return radna.shiftMode || 'sat';
            },
            function (v) {
                radna.shiftMode = v;
                radna.autoShiftChange = v !== 'rucno';
            },
            [
                { v: 'rucno', l: t('bios.sm.rucno') },
                { v: 'sat', l: t('bios.sm.sat') },
                { v: 'rotacija', l: t('bios.sm.rotacija') }
            ]
        ),
        rInfo('sm_rezim_info', t('bios.sm.kako'), function () {
            var r = radna.shiftMode || 'sat';
            if (r === 'rucno') return t('bios.sm.kakoRucno');
            if (r === 'sat') return t('bios.sm.kakoSat');
            return t('bios.sm.kakoRotacija', { opis: rotacijaOpis() });
        }),
        rSekcija('sek_rotacija', t('bios.sm.sekcijaRotacija')),
        rIzbor(
            'sm_rot_perioda',
            t('bios.sm.menjaSe'),
            function () {
                return radna.shiftRotation || 'nedelja';
            },
            function (v) {
                radna.shiftRotation = v;
            },
            [
                { v: 'nedelja', l: t('rot.nedelja') },
                { v: 'mesec', l: t('rot.mesec') },
                { v: 'polugodiste', l: t('rot.polugodiste') },
                { v: 'godina', l: t('rot.godina') }
            ],
            nijeRotacija
        ),
        rIzbor(
            'sm_rot_dan',
            t('bios.sm.danPromene'),
            function () {
                return danPromeneBIOS(radna);
            },
            function (v) {
                radna.shiftRotationDay = parseInt(v, 10) || 1;
            },
            [1, 2, 3, 4, 5, 6, 7].map(function (n) {
                return { v: n, l: DANI_ROTACIJE[n - 1] };
            }),
            function () {
                return nijeRotacija() || (radna.shiftRotation || 'nedelja') !== 'nedelja';
            }
        ),
        rDatum(
            'sm_rot_sidro',
            t('bios.sm.sidro'),
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
            t('bios.sm.prva'),
            function () {
                return radna.shiftRotationFirst === 'popodnevna' ? 'popodnevna' : 'jutarnja';
            },
            function (v) {
                radna.shiftRotationFirst = v;
            },
            [
                { v: 'jutarnja', l: t('smen.jutarnja') },
                { v: 'popodnevna', l: t('smen.popodnevna') }
            ],
            nijeRotacija
        ),
        rInfo('sm_rot_danas', t('bios.sm.danas'), function () {
            return (radna.shiftMode || 'sat') === 'rotacija' ? rotacijaOpis() : '/';
        }),
        rSekcija('sek_trajanja', t('bios.sm.sekcijaTrajanja')),
        rBroj(
            'sm_trajanje',
            t('bios.sm.trajanjeCasa'),
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
            t('bios.sm.maliOdmor'),
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
            t('bios.sm.velikiOdmor'),
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
        rSekcija('sek_jutarnja', t('bios.sm.sekcijaJutarnja')),
        rVreme(
            'sm_jut_start',
            t('bios.sm.pocetak'),
            function () {
                return radna.shifts.jutarnja.startTime;
            },
            function (v) {
                radna.shifts.jutarnja.startTime = v;
            }
        ),
        rIzbor(
            'sm_jut_veliki',
            t('bios.sm.velikiPosle'),
            function () {
                return radna.shifts.jutarnja.bigBreakAfterPeriod;
            },
            function (v) {
                radna.shifts.jutarnja.bigBreakAfterPeriod = v;
            },
            [1, 2, 3, 4].map(function (n) {
                return { v: n, l: t('bios.sm.cas', { n: n }) };
            })
        ),
        rSekcija('sek_popodnevna', t('bios.sm.sekcijaPopodnevna')),
        rVreme(
            'sm_pop_start',
            t('bios.sm.pocetak'),
            function () {
                return radna.shifts.popodnevna.startTime;
            },
            function (v) {
                radna.shifts.popodnevna.startTime = v;
            }
        ),
        rIzbor(
            'sm_pop_veliki',
            t('bios.sm.velikiPosle'),
            function () {
                return radna.shifts.popodnevna.bigBreakAfterPeriod;
            },
            function (v) {
                radna.shifts.popodnevna.bigBreakAfterPeriod = v;
            },
            [1, 2, 3, 4].map(function (n) {
                return { v: n, l: t('bios.sm.cas', { n: n }) };
            })
        ),
        rSekcija('sek_pregled', t('bios.sm.pregled', { smena: radna.currentShift === 'jutarnja' ? 'JUTARNJA' : 'POPODNEVNA' }))
    ];
    var niz = izracunajVremena(radna);
    niz.forEach(function (t2, i) {
        var naziv;
        if (!t2.isBreak) naziv = t('bios.sm.cas', { n: t2.period });
        else naziv = t2.isBigBreak ? t('bios.sm.velikiOdmorCip') : t('bios.sm.maliOdmorCip');
        redovi.push(rInfo('pv_' + i, naziv, t2.start + ' - ' + t2.end));
    });
    return redovi;
}

function autoTemaPeriodSvetao(danStr, nocStr) {
    var p = /^(\d{1,2}):(\d{2})$/.exec(String(danStr || ''));
    var q = /^(\d{1,2}):(\d{2})$/.exec(String(nocStr || ''));
    var dan = p ? parseInt(p[1], 10) * 60 + parseInt(p[2], 10) : 7 * 60;
    var noc = q ? parseInt(q[1], 10) * 60 + parseInt(q[2], 10) : 18 * 60;
    if (dan === noc) { dan = 7 * 60; noc = 18 * 60; }
    var s = new Date();
    var sad = s.getHours() * 60 + s.getMinutes();
    if (dan < noc) return sad >= dan && sad < noc;
    return sad >= dan || sad < noc;
}

function autoTemaStatusTekst() {
    if (!radna) return '/';
    if (radna.autoTheme !== true) return t('bios.ef.autoStatusIskljuceno');
    var svetlo = autoTemaPeriodSvetao(radna.autoThemeDayStart, radna.autoThemeNightStart);
    var period = svetlo ? t('bios.ef.svetliPeriod') : t('bios.ef.tamniPeriod');
    if (radna.codeTheme) return period + ' ' + t(svetlo ? 'bios.ef.autoCodeSvetla' : 'bios.ef.autoCodeTamna');
    return period + ' ' + t(svetlo ? 'bios.ef.autoSvetlaTema' : 'bios.ef.autoTamnaTema');
}

function redoviEfekti() {
    var redovi = [
        rSekcija('sek_tema', t('bios.ef.sekcijaTema')),
        rProvera(
            'ef_auto_tema',
            t('bios.ef.auto'),
            function () {
                return radna.autoTheme === true;
            },
            function (v) {
                radna.autoTheme = v;
            }
        ),
        rVreme(
            'ef_auto_dan',
            t('bios.ef.danOd'),
            function () {
                return radna.autoThemeDayStart || '07:00';
            },
            function (v) {
                radna.autoThemeDayStart = v;
            },
            function () {
                return radna.autoTheme !== true;
            }
        ),
        rVreme(
            'ef_auto_noc',
            t('bios.ef.nocOd'),
            function () {
                return radna.autoThemeNightStart || '18:00';
            },
            function (v) {
                radna.autoThemeNightStart = v;
            },
            function () {
                return radna.autoTheme !== true;
            }
        ),
        rInfo('ef_auto_status', t('bios.ef.autoStatus'), autoTemaStatusTekst),
        rIzbor(
            'ef_tema',
            t('bios.ef.tema'),
            function () {
                return radna.theme;
            },
            function (v) {
                radna.theme = v;
            },
            [
                { v: 'light', l: t('bios.ef.svetla') },
                { v: 'dark', l: t('bios.ef.tamna') }
            ],
            function () {
                return radna.autoTheme === true;
            }
        ),
        rBoja(
            'ef_akcenat',
            t('bios.ef.akcenat'),
            function () {
                return radna.customTheme.primaryColor;
            },
            function (v) {
                radna.customTheme.primaryColor = v;
            }
        ),
        rSekcija('sek_code', t('bios.ef.sekcijaCode'))
    ];
    if (!radna.codeUnlocked) {
        redovi.push(rZakljucano('ef_code', t('bios.ef.codeTema')));
        redovi.push(rInfo('ef_status', 'Status', t('bios.ef.zakljucano')));
    } else {
        redovi.push(
            rProvera(
                'ef_code',
                t('bios.ef.codeTema'),
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
                t('bios.ef.anim'),
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
            rProvera(
                'ef_code_svetla',
                t('bios.ef.codeSvetla'),
                function () {
                    return radna.codeLight === true;
                },
                function (v) {
                    radna.codeLight = v;
                    prikazicodeBoju();
                },
                function () {
                    return radna.autoTheme === true;
                }
            )
        );
        redovi.push(
            rBroj(
                'ef_intenzitet',
                t('bios.ef.intenzitet'),
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

        redovi.push(rSekcija('sek_gx_boja', t('bios.ef.sekcijaGx')));
        redovi.push(
            rGxBoja(
                'ef_gx_boja',
                t('bios.ef.bojaTeme'),
                function () {
                    return hexGxBoje();
                },
                function (v) {
                    postaviGxBoju(v);
                }
            )
        );
        redovi.push(rGxPaleta('ef_gx_presets', t('bios.ef.presets')));

        redovi.push(rSekcija('sek_efekti', t('bios.ef.sekcijaEfekti')));
        [
            { id: 'ef_invert', kljuc: 'invert', key: 'bios.ef.invert' },
            { id: 'ef_kisa', kljuc: 'rain', key: 'bios.ef.kisa' },
            { id: 'ef_sken', kljuc: 'scanlines', key: 'bios.ef.sken' },
            { id: 'ef_treperenje', kljuc: 'flicker', key: 'bios.ef.treperenje' },
            { id: 'ef_korupcija', kljuc: 'corruption', key: 'bios.ef.korupcija' }
        ].forEach(function (e) {
            redovi.push(
                rProvera(
                    e.id,
                    t(e.key),
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
                t('bios.ef.savet'),
                radna.codeTheme
                    ? t('bios.ef.savetAktivno')
                    : t('bios.ef.savetNeaktivno')
            )
        );
        redovi.push(
            rAkcija(
                'ef_obavestenje',
                t('bios.ef.obavestenjeAkcija'),
                function () {
                    if (window.VirusTema && typeof window.VirusTema.efektiPanel === 'function') {
                        window.VirusTema.efektiPanel();
                    }
                },
                { vrednost: '[ i ]' }
            )
        );
    }
    redovi.push(rSekcija('sek_napomena', t('bios.ef.sekcijaNapomena')));
    return redovi;
}

function redoviPodaci() {
    return [
        rInfo('pd_predmeti', t('bios.pd.predmeti'), function () {
            return statistike().predmeta;
        }),
        rInfo('pd_beleske', t('bios.pd.beleske'), function () {
            return statistike().beleski;
        }),
        rInfo('pd_raspored', t('bios.pd.raspored'), function () {
            return statistike().stavkiRasporeda;
        }),
        rInfo('pd_zauzece', t('bios.pd.zauzece'), function () {
            return statistike().velicinaKB + ' KB';
        }),
        rSekcija('sek_akcije', t('bios.pd.sekcija')),
        rAkcija('pd_izvoz', t('bios.pd.izvoz'), akcijaIzvoz),
        rAkcija('pd_uvoz', t('bios.pd.uvoz'), function () {
            akcijaUvoz(false);
        }),
        rAkcija('pd_spoji', t('bios.pd.spoji'), function () {
            akcijaUvoz(true);
        }),
        rAkcija('pd_reset', t('bios.pd.reset'), akcijaReset, { opasno: true })
    ];
}

function redoviIzlaz() {
    return [
        rAkcija(
            'iz_sacuvaj',
            t('bios.iz.sacuvaj'),
            function () {
                zatvori(true);
            },
            { glavni: true, vrednost: '[ F10 ]' }
        ),
        rAkcija('iz_otkazi', t('bios.iz.otkazi'), function () {
            zatvori(false);
        }),
        rAkcija('iz_vrati', t('bios.iz.vrati'), potvrdaFabrickaIzlaz, { opasno: true })
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