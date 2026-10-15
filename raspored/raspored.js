'use strict';
function pronadjiBeleskuZaDatum(subjectId, datumStr) {
    if (!subjectId) return null;
    return podaciAplikacije.notes.find(n =>
        n.date === datumStr && n.subjectId === subjectId && !n.completed
    ) || null;
}

function pronadjiPredstojeceBeleske(subjectId, trenutniDatumStr) {
    if (!subjectId) return [];
    const danas = new Date();
    danas.setHours(0, 0, 0, 0);

    const predstojece = [];
    for (let i = 1; i <= 3; i++) {
        const datum = new Date(danas);
        datum.setDate(danas.getDate() + i);
        const dStr = formatirajDatumISO(datum);
        if (dStr === trenutniDatumStr) continue;

        const beleska = podaciAplikacije.notes.find(n =>
            n.date === dStr && n.subjectId === subjectId && !n.completed
        );
        if (beleska) {
            predstojece.push({ ...beleska, daysUntil: i });
        }
    }
    return predstojece;
}

function datumZaDanUNedelji(dayIndex) {
    const danas = new Date();
    const trenutniDan = danas.getDay();
    const targetDan = dayIndex + 1;         const razlika = targetDan - trenutniDan;
    const datum = new Date(danas);
    datum.setDate(danas.getDate() + razlika);
    return formatirajDatumISO(datum);
}

function generisiIndikatorBeleske(subjectId, dayIndex) {
    if (!subjectId) return '';
    const predmet = dobijPredmet(subjectId);
    if (!predmet) return '';

    const datumStr = datumZaDanUNedelji(dayIndex);
    let html = '';

    const beleskaDanas = pronadjiBeleskuZaDatum(subjectId, datumStr);
    if (beleskaDanas) {
        const tipInfo = TIPOVI_BELESKE[beleskaDanas.type] || TIPOVI_BELESKE.ostalo;
        const textColor = getContrastText(tipInfo.color);
        html += `<span class="indikator-beleske ${esc(beleskaDanas.type)} danas"
            style="background:${tipInfo.color}; color:${textColor}"
            data-tooltip="${esc(tipInfo.label)}: ${esc(beleskaDanas.title)}">
            ${ikonaTipa(tipInfo)} ${esc(tipInfo.shortLabel)}
        </span>`;
    }

    const predstojece = pronadjiPredstojeceBeleske(subjectId, datumStr);
    predstojece.forEach(b => {
        const tipInfo = TIPOVI_BELESKE[b.type] || TIPOVI_BELESKE.ostalo;
        html += `<span class="indikator-beleske ${esc(b.type)} predstojece"
            data-tooltip="${esc(tipInfo.label)} za ${b.daysUntil} dana: ${esc(b.title)}">
            ${ikonaTipa(tipInfo)} ${b.daysUntil}d
        </span>`;
    });

    return html ? `<div class="indikatori-beleski">${html}</div>` : '';
}
function dobijStavkuRasporeda(dan, cas, smena = null) {
    const trenutnaSmena = smena || podaciAplikacije.settings.currentShift;
    return podaciAplikacije.schedule.find(s => s.day === dan && s.period === cas && s.shift === trenutnaSmena);
}

function dobijPredmet(id) {
    return podaciAplikacije.settings.subjects.find(s => s.id === id);
}

function infoTrenutnogCasa() {
    const vremena = izracunajVremenaCasova();
    const sad = trenutnoVremeMinuta();
    const danas = new Date().getDay();
    const indeksDana = (danas === 0 || danas === 6) ? -1 : danas - 1;

    for (let i = 0; i < vremena.length; i++) {
        const t = vremena[i];
        const pocetakMin = vremeUMinute(t.start);
        const krajMin = vremeUMinute(t.end);

        if (sad >= pocetakMin && sad < krajMin) {
            return {
                isBreak: t.isBreak,
                isBigBreak: !!t.isBigBreak,
                period: t.period,
                start: t.start,
                end: t.end,
                dayIndex: indeksDana
            };
        }
    }
    return null;
}

function jeTrenutniCas(cas, indeksDana = null) {
    const trenutni = infoTrenutnogCasa();
    if (!trenutni || trenutni.isBreak) return false;
    if (indeksDana !== null && trenutni.dayIndex !== indeksDana) return false;
    return trenutni.period === cas;
}

function jeTrenutniOdmorVeliki() {
    const t = infoTrenutnogCasa();
    return !!(t && t.isBreak && t.isBigBreak);
}

function formatirajTrajanje(minuta) {
    if (minuta <= 0) return '0min';
    const sati = Math.floor(minuta / 60);
    const minuti = minuta % 60;
    if (sati > 0 && minuti > 0) return `${sati}č ${minuti}min`;
    if (sati > 0) return `${sati}č`;
    return `${minuti}min`;
}

function pluralCasovi(n) {
    return n === 1 ? 'čas' : (n >= 2 && n <= 4 ? 'časa' : 'časova');
}

function izaberiKolonuDana(d) {
    if (stanje.izabranaKolona === d) {
        stanje.izabranaKolona = null;
    } else {
        stanje.izabranaKolona = d;
        stanje.selectedDay = d;
        const selektor = document.getElementById('selektorDana');
        if (selektor) selektor.value = String(d);
        prikaziMobilniRaspored();
    }
    prikaziDesktopRaspored();
}

function postaviKolonuDana(d) {
    stanje.izabranaKolona = d;
    stanje.selectedDay = d;
    const selektor = document.getElementById('selektorDana');
    if (selektor) selektor.value = String(d);
    prikaziMobilniRaspored();
    prikaziDesktopRaspored();
}

function otvoriPretraguPredmeta() {
    if (stanje.currentTab !== 'raspored') prebaciTab('raspored');
    const kont = document.getElementById('pretragaPredmetaBar');
    if (!kont) return;
    kont.hidden = false;
    const unosEl = document.getElementById('ppUnos');
    if (unosEl) {
        unosEl.focus();
        unosEl.select();
    }
    azurirajPretraguPredmeta();
}

function zatvoriPretraguPredmeta() {
    const kont = document.getElementById('pretragaPredmetaBar');
    const unosEl = document.getElementById('ppUnos');
    if (unosEl) unosEl.value = '';
    if (kont) kont.hidden = true;
    azurirajPretraguPredmeta();
}

function preklopiPretraguPredmeta() {
    const kont = document.getElementById('pretragaPredmetaBar');
    if (kont && !kont.hidden) zatvoriPretraguPredmeta();
    else otvoriPretraguPredmeta();
}

function dodajPredmetUPretragu(naziv) {
    const unosEl = document.getElementById('ppUnos');
    if (!unosEl) return;
    const pojmovi = unosEl.value.split(',').map(p => p.trim());
    pojmovi.pop();
    const vecIma = pojmovi.some(p =>
        bezDijakritika(p).toLowerCase() === bezDijakritika(naziv).toLowerCase());
    if (!vecIma) pojmovi.push(naziv);
    unosEl.value = pojmovi.filter(Boolean).join(', ') + ', ';
    azurirajPretraguPredmeta();
    unosEl.focus();
    unosEl.setSelectionRange(unosEl.value.length, unosEl.value.length);
}

function azurirajPretraguPredmeta() {
    const kont = document.getElementById('pretragaPredmetaBar');
    const otvoreno = !!(kont && !kont.hidden);
    const unosEl = document.getElementById('ppUnos');

    const pojmovi = otvoreno && unosEl
        ? unosEl.value.split(',')
            .map(p => bezDijakritika(p).trim().toLowerCase())
            .filter(p => p.length > 0)
        : [];

    const predmeti = podaciAplikacije.settings.subjects || [];
    const pogodci = pojmovi.length
        ? predmeti.filter(p => {
            const naziv = bezDijakritika(p.name || '').toLowerCase();
            const nastavnik = bezDijakritika(p.teacher || '').toLowerCase();
            return pojmovi.some(pojam => naziv.includes(pojam) || nastavnik.includes(pojam));
        })
        : [];

    stanje.pogodciPredmeta = new Set(pogodci.map(p => p.id));

        const brojEl = document.getElementById('ppBroj');
    if (brojEl) {
        brojEl.textContent = pogodci.length ? String(pogodci.length) : '';
        brojEl.classList.toggle('vidljiv', pogodci.length > 0);
    }

        const pogodciEl = document.getElementById('ppPogodci');
    if (pogodciEl) {
        let html = '';
        if (pojmovi.length && !pogodci.length) {
            html = `<span class="pp-prazno">${ikonica('🚫', '//')} Nema pogodaka / prikazan je ceo raspored</span>`;
        } else {
            for (const p of pogodci) {
                const broj = podaciAplikacije.schedule.filter(s => s.subjectId === p.id).length;
                html += `<button type="button" class="pp-cip" style="--pb:${p.color}"
                    onclick="dodajPredmetUPretragu('${esc(p.name)}')"
                    title="Dodaj „${esc(p.name)}“ kao pojam (multi-select)">
                    <span class="pp-tackica" aria-hidden="true"></span>
                    <span class="pp-ime">${esc(p.name)}</span>
                    ${broj ? `<span class="pp-kolicina">×${broj}</span>` : ''}
                    <span class="pp-plus" aria-hidden="true">+</span>
                </button>`;
            }
        }
        pogodciEl.innerHTML = html;
        pogodciEl.classList.toggle('prazan', !html);
    }

    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
}

function ponedeljakZaPrikaz() {
    const sad = new Date();
    const danUSedmici = (sad.getDay() + 6) % 7;
    const pon = new Date(sad);
    pon.setHours(0, 0, 0, 0);
    if (danUSedmici >= 5) pon.setDate(pon.getDate() + (7 - danUSedmici));
    else pon.setDate(pon.getDate() - danUSedmici);
    return pon;
}

function brojNedelje(datum) {
    const d = new Date(datum.getFullYear(), datum.getMonth(), datum.getDate());
    const dan = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - dan);
    const prviJanuar = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - prviJanuar) / 86400000 + 1) / 7);
}

function azurirajPrintZaglavlje() {
    const el = document.getElementById('printZaglavlje');
    if (!el) return;
    const s = podaciAplikacije.settings;
    const pon = ponedeljakZaPrikaz();
    const petak = new Date(pon); petak.setDate(pon.getDate() + 4);
    const d2 = d => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    const smena = s.shifts[s.currentShift] || { name: '/' };
    let rotOznaka = '';
    if (s.shiftMode === 'rotacija') {
        rotOznaka = ` · ROTACIJA: ${NAZIVI_ROTACIJE[s.shiftRotation] || NAZIVI_ROTACIJE.nedelja}`;
        if (s.shiftRotation === 'nedelja' && danPromeneRotacije() !== 1) {
            rotOznaka += ` (${DANI_ROTACIJE_INSTRUMENTAL[danPromeneRotacije() - 1]})`;
        }
    }
    el.innerHTML = `
        <div class="print-zaglavlje-naslov">${esc(s.schoolName || 'Školska Informacija')} / Raspored časova</div>
        <div class="print-zaglavlje-meta">
            <span>Razred: <strong>${esc(s.className || '/')}</strong></span>
            <span>${esc(smena.name + rotOznaka)}</span>
            <span>NEDELJA ${brojNedelje(pon)} · ${d2(pon)} – ${d2(petak)}</span>
            <span>Odštampano: ${formatirajDatum(new Date())}</span>
        </div>`;
}

function prikaziDesktopRaspored() {
    const kontejner = document.getElementById('desktopRaspored');
    if (!kontejner) return;

    const msAktivan = !!stanje.multiSelect;
    kontejner.classList.toggle('ms-aktivan', msAktivan);

    const brojCasova = podaciAplikacije.settings.periodsCount;
    const vremena = izracunajVremenaCasova();
    const danas = new Date().getDay();
    const indeksDana = (danas === 0 || danas === 6) ? -1 : danas - 1;

    let html = '';

            html += '<div class="celija-zaglavlja celija-cas">Čas</div>';
    for (let d = 0; d < 5; d++) {
        const jeDanas = d === indeksDana;
        const izabrana = stanje.izabranaKolona === d;
        const datumStr = datumZaDanUNedelji(d);
        const danDatum = datumStr ? `${datumStr.slice(8, 10)}.${datumStr.slice(5, 7)}.` : '';
        html += `<button type="button" class="celija-zaglavlja celija-dan${jeDanas ? ' zaglavlje-danas' : ''}${izabrana ? ' zaglavlje-izabrano' : ''}" data-dan="${d}"
            onclick="izaberiKolonuDana(${d})"
            aria-pressed="${izabrana}"
            title="${izabrana ? 'Skini isticanje' : 'Istakni'} / ${DANI_LAT[d]}">
            <span class="dan-naziv">${izabrana ? '<span class="strelica-kolone" aria-hidden="true">▸ </span>' : ''}${DANI_LAT[d]}${jeDanas ? ' <span class="oznaka-danas">Danas</span>' : ''}</span>
            ${danDatum ? `<span class="dan-datum" aria-hidden="true">${danDatum}</span>` : ''}
        </button>`;
    }

        for (let c = 0; c < brojCasova; c++) {
        const vremeCasa = vremena.find(t => t.period === c + 1 && !t.isBreak);
        const jeTrenutni = jeTrenutniCas(c + 1);

        html += `<div class="celija-vremena ${jeTrenutni ? 'trenutni-cas' : ''}">
            <span class="broj-casa">${c + 1}</span>
            <span class="vreme">${vremeCasa ? vremeCasa.start : ''}<br>${vremeCasa ? vremeCasa.end : ''}</span>
            ${jeTrenutni ? '<span class="indikator-trenutnog">▶</span>' : ''}
        </div>`;

        for (let d = 0; d < 5; d++) {
            const stavka = dobijStavkuRasporeda(d, c);
            const predmet = stavka ? dobijPredmet(stavka.subjectId) : null;
            const jeDanasCelija = d === indeksDana;
            const jeTrenutnaCelija = jeTrenutniCas(c + 1, d);
            const indikatori = predmet ? generisiIndikatorBeleske(predmet.id, d) : '';

            let klase = 'celija-rasporeda';
            if (predmet) klase += ' ima-predmet';
            else klase += ' celija-prazna';
            if (jeDanasCelija) klase += ' kolona-danas';
            if (jeTrenutnaCelija) klase += ' trenutni-cas';
            if (stanje.izabranaKolona === d) klase += ' kolona-izabrana';

            const msIzabrana = msAktivan && stanje.izabraniSlotovi.has(d + '-' + c);
            if (msIzabrana) klase += ' ms-izabrana';
            const akcijaCelije = msAktivan ? `klikMultiSelect(${d}, ${c})` : `otvoriModalRaspored(${d}, ${c})`;

                        if (stanje.pogodciPredmeta.size) {
                if (predmet && stanje.pogodciPredmeta.has(predmet.id)) klase += ' predmet-filtriran';
                else klase += ' zatamnjeno';
            }

            if (predmet) {
                html += `<button type="button" class="${klase}" data-dan="${d}" data-predmet="${predmet.id}"
                    style="--pb:${predmet.color}"
                    onclick="${akcijaCelije}"
                    ${msAktivan ? `aria-pressed="${msIzabrana}"` : ''}
                    aria-label="${msAktivan ? (msIzabrana ? 'Izabrano: ' : 'Izaberi: ') : ''}${esc(predmet.name)}, ${c + 1}. čas, ${DANI_LAT[d]}">
                    ${msAktivan ? '<span class="ms-kucica" aria-hidden="true">✓</span>' : ''}
                    <span class="predmet-red-naziv">
                        <span class="predmet-tackica" aria-hidden="true"></span>
                        <span class="naziv-predmeta">${esc(predmet.name)}</span>
                    </span>
                    ${stavka.room ? `<span class="kabinet">${ikonica('📍', '@')} ${esc(stavka.room)}</span>` : ''}
                    ${jeTrenutnaCelija ? '<span class="oznaka-uzivo">● UŽIVO</span>' : ''}
                    ${indikatori}
                </button>`;
            } else {
                html += `<button type="button" class="${klase}" data-dan="${d}"
                    onclick="${akcijaCelije}"
                    ${msAktivan ? `aria-pressed="${msIzabrana}"` : ''}
                    aria-label="${msAktivan ? (msIzabrana ? 'Izabran prazan čas' : 'Izaberi prazan čas') : 'Dodaj'} ${c + 1}. čas, ${DANI_LAT[d]}">${msAktivan ? '<span class="ms-kucica" aria-hidden="true">✓</span>' : ''}${msAktivan ? '' : '+'}</button>`;
            }
        }

                const velikiOdmor = vremena.find(t => t.isBreak && t.isBigBreak && t.period === c + 1);
        if (velikiOdmor) {
            const jeOdmorSada = jeTrenutniOdmorVeliki() && infoTrenutnogCasa() && infoTrenutnogCasa().period === c + 1;
            html += `<div class="red-pauze velika-pauza ${jeOdmorSada ? 'trenutni-odmor' : ''}">
                <span class="ikona-odmora">${ikonica('☕', '[BRK]')}</span>
                VELIKI ODMOR (${velikiOdmor.start} – ${velikiOdmor.end})
                ${jeOdmorSada ? '<span class="oznaka-uzivo">● UŽIVO</span>' : ''}
            </div>`;
        }
    }

    kontejner.innerHTML = html;
}

function prikaziMobilniRaspored() {
    const kontejner = document.getElementById('mobilniRaspored');
    if (!kontejner) return;

    const msAktivan = !!stanje.multiSelect;
    kontejner.classList.toggle('ms-aktivan', msAktivan);

    const dan = stanje.selectedDay;
    const brojCasova = podaciAplikacije.settings.periodsCount;
    const vremena = izracunajVremenaCasova();
    const danas = new Date().getDay();
    const indeksDana = (danas === 0 || danas === 6) ? -1 : danas - 1;
    const jeDanas = dan === indeksDana;

    document.getElementById('naslovMobilniDan').textContent = DANI_LAT[dan] + (jeDanas ? ' (Danas)' : '');
    document.getElementById('selektorDana').value = String(dan);

        const datumEl = document.getElementById('mobilniDanDatum');
    if (datumEl) {
        const ds = datumZaDanUNedelji(dan);
        datumEl.textContent = ds ? `${ds.slice(8, 10)}.${ds.slice(5, 7)}.` : '';
    }

    let html = '';

    for (let c = 0; c < brojCasova; c++) {
        const vremeCasa = vremena.find(t => t.period === c + 1 && !t.isBreak);
        const stavka = dobijStavkuRasporeda(dan, c);
        const predmet = stavka ? dobijPredmet(stavka.subjectId) : null;
        const jeTrenutni = jeDanas && jeTrenutniCas(c + 1, dan);
        const indikatori = predmet ? generisiIndikatorBeleske(predmet.id, dan) : '';

        let klase = 'stavka-rasporeda';
        if (predmet) klase += ' ima-predmet';
        else klase += ' prazna';
        if (jeTrenutni) klase += ' trenutni-cas';

        const msIzabrana = msAktivan && stanje.izabraniSlotovi.has(dan + '-' + c);
        if (msIzabrana) klase += ' ms-izabrana';
        const akcijaStavke = msAktivan ? `klikMultiSelect(${dan}, ${c})` : `otvoriModalRaspored(${dan}, ${c})`;

                if (stanje.pogodciPredmeta.size) {
            if (predmet && stanje.pogodciPredmeta.has(predmet.id)) klase += ' predmet-filtriran';
            else klase += ' zatamnjeno';
        }

        if (predmet) {
            html += `<button type="button" class="${klase}" data-predmet="${predmet.id}"
                style="--pb:${predmet.color}"
                onclick="${akcijaStavke}"
                ${msAktivan ? `aria-pressed="${msIzabrana}"` : ''}>
                ${msAktivan ? '<span class="ms-kucica" aria-hidden="true">✓</span>' : ''}
                <span class="stavka-rasporeda-broj">
                    <span class="broj">${c + 1}</span>
                    <span class="vreme">${vremeCasa ? vremeCasa.start : ''}</span>
                </span>
                <span class="stavka-rasporeda-sadrzaj">
                    <span class="predmet-red-naziv">
                        <span class="predmet-tackica" aria-hidden="true"></span>
                        <span class="naziv-predmeta">${esc(predmet.name)}</span>
                    </span>
                    ${stavka.room ? `<span class="kabinet">${ikonica('📍', '@')} ${esc(stavka.room)}</span>` : ''}
                    ${indikatori}
                </span>
                ${msAktivan ? '' : (jeTrenutni ? '<span class="oznaka-uzivo-mobilni">● UŽIVO</span>' : `<span class="stavka-rasporeda-izmeni">${ikonica('✏️', '&gt;')}</span>`)}
            </button>`;
        } else {
            html += `<button type="button" class="${klase}"
                onclick="${akcijaStavke}"
                ${msAktivan ? `aria-pressed="${msIzabrana}"` : ''}>
                ${msAktivan ? '<span class="ms-kucica" aria-hidden="true">✓</span>' : ''}
                <span class="stavka-rasporeda-broj">
                    <span class="broj">${c + 1}</span>
                    <span class="vreme">${vremeCasa ? vremeCasa.start : ''}</span>
                </span>
                <span class="stavka-rasporeda-sadrzaj">
                    <span class="naziv-predmeta" style="color:var(--tekst-muted)">Prazan čas</span>
                </span>
                ${msAktivan ? '' : '<span class="stavka-rasporeda-izmeni">+</span>'}
            </button>`;
        }

                const velikiOdmor = vremena.find(t => t.isBreak && t.isBigBreak && t.period === c + 1);
        if (velikiOdmor) {
            const jeOdmorSada = jeDanas && jeTrenutniOdmorVeliki() && infoTrenutnogCasa() && infoTrenutnogCasa().period === c + 1;
            html += `<div class="red-pauze velika-pauza ${jeOdmorSada ? 'trenutni-odmor' : ''}">
                <span class="ikona-odmora">${ikonica('☕', '[BRK]')}</span>
                VELIKI ODMOR (${velikiOdmor.start} – ${velikiOdmor.end})
                ${jeOdmorSada ? '<span class="oznaka-uzivo">● UŽIVO</span>' : ''}
            </div>`;
        }
    }

    kontejner.innerHTML = html;
}

function promeniDan(smer) {
    stanje.selectedDay = (stanje.selectedDay + smer + 5) % 5;
    stanje.izabranaKolona = stanje.selectedDay;
    prikaziMobilniRaspored();
    prikaziDesktopRaspored();
}

function preklopiMultiSelect(ukljuci) {
    stanje.multiSelect = arguments.length > 0 ? !!ukljuci : !stanje.multiSelect;
    stanje.izabraniSlotovi.clear();
    azurirajMultiSelectUI();
    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
    if (stanje.multiSelect) {
        prikaziToast('Višestruki izbor: kliknite na časove koje menjate.\nIzlaz: ESC ili ✕ na traci.', 'info');
    }
}

function otvoriMultiSelect() {
    if (stanje.currentTab !== 'raspored') prebaciTab('raspored');
    if (!stanje.multiSelect) preklopiMultiSelect(true);
}

function klikMultiSelect(dan, cas) {
    const kljuc = dan + '-' + cas;
    if (stanje.izabraniSlotovi.has(kljuc)) stanje.izabraniSlotovi.delete(kljuc);
    else stanje.izabraniSlotovi.add(kljuc);
    azurirajMultiSelectUI();
    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
}

function izaberiSveSlotove() {
    if (!stanje.multiSelect) return;
    const brojCasova = podaciAplikacije.settings.periodsCount;
    stanje.izabraniSlotovi.clear();
    for (let d = 0; d < 5; d++) {
        for (let c = 0; c < brojCasova; c++) stanje.izabraniSlotovi.add(d + '-' + c);
    }
    azurirajMultiSelectUI();
    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
}

function ocistiIzborSlotova() {
    stanje.izabraniSlotovi.clear();
    azurirajMultiSelectUI();
    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
}

function azurirajMultiSelectUI() {
    const aktivan = !!stanje.multiSelect;
    const broj = stanje.izabraniSlotovi.size;

    document.querySelectorAll('#dugmeMultiSelect, .dugmeMultiSelectMobilni').forEach(d => {
        d.classList.toggle('aktivan', aktivan);
        d.setAttribute('aria-pressed', String(aktivan));
        d.title = aktivan ? 'Izađi iz višestrukog izbora (M)' : 'Višestruki izbor časova (M)';
    });

    const bar = document.getElementById('multiSelectBar');
    if (!bar) return;
    bar.hidden = !aktivan;

    const brojEl = document.getElementById('msBroj');
    if (brojEl) brojEl.textContent = broj;
    const smenaEl = document.getElementById('msSmena');
    if (smenaEl) {
        smenaEl.textContent = (podaciAplikacije.settings.currentShift === 'popodnevna' ? 'POPODNEVNA' : 'JUTARNJA') + ' SMENA';
    }
    ['msIzmeni', 'msObrisi'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = broj === 0;
    });
    const dugmeSacuvaj = document.getElementById('dugmeSacuvajGrupnu');
    if (dugmeSacuvaj) dugmeSacuvaj.textContent = broj > 0 ? `Primeni na ${broj} ${pluralCasovi(broj)}` : 'Primeni izmene';
}

function obrisiIzabraneSlotove() {
    const smena = podaciAplikacije.settings.currentShift;
    const n = stanje.izabraniSlotovi.size;
    if (!n) return;

    prikaziPotvrdu(`Da li ste sigurni da želite da obrišete izabrane časove (${n})?`, (potvrdjeno) => {
        if (!potvrdjeno) return;
        let obrisano = 0;
        podaciAplikacije.schedule = podaciAplikacije.schedule.filter(s => {
            const pogodak = s.shift === smena && stanje.izabraniSlotovi.has(s.day + '-' + s.period);
            if (pogodak) obrisano++;
            return !pogodak;
        });
        sacuvajPodatke();
        ocistiIzborSlotova();
        azurirajPretraguPredmeta();
        prikaziDesktopRaspored();
        prikaziMobilniRaspored();
        azurirajPrintZaglavlje();
        azurirajPodnozje();
        prikaziToast(`Obrisano ${obrisano} ${pluralCasovi(obrisano)}!`, 'uspeh');
    });
}
