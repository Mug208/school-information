'use strict';
function sacuvajPodatke() {
    try {
        localStorage.setItem(KLJUC_SKLADISTA, JSON.stringify(podaciAplikacije));
    } catch (e) {   }
}

function ucitajPodatke() {
    const sacuvano = localStorage.getItem(KLJUC_SKLADISTA);
    if (!sacuvano) return;

    try {
        const parsirano = JSON.parse(sacuvano);
        podaciAplikacije = {
            settings: { ...JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA)), ...(parsirano.settings || {}) },
            schedule: parsirano.schedule || [],
            notes: (parsirano.notes || []).map(n => ({ ...n, pinned: n.pinned === true }))
        };
        const s = podaciAplikacije.settings;

                if (!s.shifts || !s.shifts.jutarnja || !s.shifts.popodnevna) {
            s.shifts = JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA.shifts));
        }
        if (!s.customTheme) {
            s.customTheme = { ...PODESAVANJA_PODRAZUMEVANA.customTheme };
        }
        if (!Array.isArray(s.subjects) || s.subjects.length === 0) {
            s.subjects = JSON.parse(JSON.stringify(PREDMETI_PODRAZUMEVANI));
        }

        if (s.codeUnlocked === undefined) s.codeUnlocked = false;
        if (s.codeTheme === undefined) s.codeTheme = false;
        if (s.autoTheme === undefined) s.autoTheme = false;
        if (s.codeLight === undefined) s.codeLight = false;
        if (!/^\d{2}:\d{2}$/.test(String(s.autoThemeDayStart || ''))) s.autoThemeDayStart = '07:00';
        if (!/^\d{2}:\d{2}$/.test(String(s.autoThemeNightStart || ''))) s.autoThemeNightStart = '18:00';

        if (typeof s.animTema !== 'boolean') {
            s.animTema = localStorage.getItem('vt-anim') !== '0';
        }
        if (s.language !== 'en' && s.language !== 'sr') s.language = 'en';
        if (!s.effects || typeof s.effects !== 'object') {
            s.effects = { ...PODESAVANJA_PODRAZUMEVANA.effects };
        } else {

            s.effects = {
                intensity: Math.min(10, Math.max(1, parseInt(s.effects.intensity, 10) || 5)),
                invert: s.effects.invert === true,
                rain: s.effects.rain === true,
                scanlines: s.effects.scanlines === true,
                flicker: s.effects.flicker === true,
                corruption: s.effects.corruption === true,
                color: (s.effects.color === 'prilagodjeno' || code_BOJE.some(b => b.id === s.effects.color)) ? s.effects.color : 'zelena',
                customColor: /^#[0-9a-fA-F]{6}$/.test(s.effects.customColor || '') ? s.effects.customColor : '#00ff9c'
            };
        }

        normalizujRezimSmene(s);
    } catch (e) {
        podaciAplikacije = {
            settings: JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA)),
            schedule: [],
            notes: []
        };
    }
}

function izveziPodatke() {
    const podaciStr = JSON.stringify(podaciAplikacije, null, 2);
    const blob = new Blob([podaciStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skolska-informacija-${formatirajDatum(new Date()).replace(/\./g, '-')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function uveziPodatkeIzFajla(fajl, spojiBeleske) {
    const citac = new FileReader();
    citac.onload = (e) => {
        try {
            const uvezeno = JSON.parse(e.target.result);
            if (uvezeno && uvezeno.settings && uvezeno.schedule !== undefined && uvezeno.notes !== undefined) {
                if (spojiBeleske) {
                    const postojeciId = new Set(podaciAplikacije.notes.map(n => n.id));
                    const noveBeleske = uvezeno.notes
                        .filter(n => !postojeciId.has(n.id))
                        .map(n => ({ ...n, pinned: n.pinned === true }));
                    podaciAplikacije.notes = [...podaciAplikacije.notes, ...noveBeleske];
                    sacuvajPodatke();
                    prikaziSve();
                    prikaziToast(t('pod.toastSpojeno', { n: noveBeleske.length }), 'uspeh');
                } else {
                    podaciAplikacije = {
                        settings: { ...JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA)), ...uvezeno.settings },
                        schedule: uvezeno.schedule || [],
                        notes: uvezeno.notes || []
                    };

                    ucitajPodatkeStrukturu();
                    sacuvajPodatke();
                    primeniTemu();
                    azurirajAutoTemu(true, true);
                    if (typeof postaviJezik === 'function') postaviJezik(podaciAplikacije.settings.language, { sacuvaj: false, osvezi: false });
                    prikaziSve();
                    prikaziToast(t('pod.toastUcitano'), 'uspeh');
                }
            } else {
                prikaziToast(t('pod.toastFormat'), 'greska');
            }
        } catch (greska) {
            prikaziToast(t('pod.toastCitanje'), 'greska');
        }
    };
    citac.readAsText(fajl);
}

function ucitajPodatkeStrukturu() {
    const s = podaciAplikacije.settings;
    if (!s.shifts || !s.shifts.jutarnja) s.shifts = JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA.shifts));
    if (!s.customTheme) s.customTheme = { ...PODESAVANJA_PODRAZUMEVANA.customTheme };
    if (!Array.isArray(s.subjects) || s.subjects.length === 0) s.subjects = JSON.parse(JSON.stringify(PREDMETI_PODRAZUMEVANI));
    if (!s.effects) s.effects = { ...PODESAVANJA_PODRAZUMEVANA.effects };
    else {
        const poznataBoja = s.effects.color === 'prilagodjeno' || code_BOJE.some(b => b.id === s.effects.color);
        if (!poznataBoja) s.effects.color = 'zelena';
        if (!/^#[0-9a-fA-F]{6}$/.test(s.effects.customColor || '')) s.effects.customColor = '#00ff9c';
    }
    if (s.codeUnlocked === undefined) s.codeUnlocked = false;
    if (s.codeTheme === undefined) s.codeTheme = false;
    if (s.autoTheme === undefined) s.autoTheme = false;
    if (s.codeLight === undefined) s.codeLight = false;
    if (s.language !== 'en' && s.language !== 'sr') s.language = 'en';
    if (!/^\d{2}:\d{2}$/.test(String(s.autoThemeDayStart || ''))) s.autoThemeDayStart = '07:00';
    if (!/^\d{2}:\d{2}$/.test(String(s.autoThemeNightStart || ''))) s.autoThemeNightStart = '18:00';

    normalizujRezimSmene(s);

    podaciAplikacije.notes.forEach(n => { if (n.pinned !== true) n.pinned = false; });
}

function resetujSvePodatke() {
    podaciAplikacije = {
        settings: JSON.parse(JSON.stringify(PODESAVANJA_PODRAZUMEVANA)),
        schedule: [],
        notes: []
    };
    sacuvajPodatke();
    primeniTemu();
    if (typeof postaviJezik === 'function') postaviJezik(podaciAplikacije.settings.language, { sacuvaj: false, osvezi: false });
    prikaziSve();
    prikaziToast(t('pod.toastReset'), 'uspeh');
}

function getStatistike() {
    let velicinaKB = 0;
    try {
        velicinaKB = Math.max(1, Math.round((localStorage.getItem(KLJUC_SKLADISTA) || '').length / 1024));
    } catch (e) {  }
    return {
        predmeta: podaciAplikacije.settings.subjects.length,
        beleski: podaciAplikacije.notes.length,
        stavkiRasporeda: podaciAplikacije.schedule.length,
        velicinaKB
    };
}

function sacuvajPodesavanja(novi) {
    if (!novi || typeof novi !== 'object') return;

        podaciAplikacije.settings = { ...novi };
    ucitajPodatkeStrukturu();

    if (typeof postaviJezik === 'function') {
        postaviJezik(podaciAplikacije.settings.language, { sacuvaj: false, osvezi: false });
    }

        const idjevi = new Set(podaciAplikacije.settings.subjects.map(s => s.id));
    podaciAplikacije.schedule = podaciAplikacije.schedule.filter(s => idjevi.has(s.subjectId));
    podaciAplikacije.notes.forEach(n => {
        if (n.subjectId && !idjevi.has(n.subjectId)) n.subjectId = undefined;
    });

    sacuvajPodatke();
    primeniTemu();
    azurirajAutoTemu(true, true);
    prikaziSve();

    azurirajAutoSmenu();
}
