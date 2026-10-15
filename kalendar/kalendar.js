'use strict';
function prikaziKalendar() {
    const kontejner = document.getElementById('kalendarWrapper');
    if (!kontejner) return;

    const mesec = stanje.calendarMonth;
    const godina = stanje.calendarYear;
    const danas = new Date();
    const izabraniDatum = stanje.selectedDate;

    const prviDan = new Date(godina, mesec, 1);
    const poslednjiDan = new Date(godina, mesec + 1, 0);
    const startniDan = (prviDan.getDay() + 6) % 7;

    let html = `
        <div class="kalendar">
            <div class="kalendar-zaglavlje">
                <button type="button" class="kalendar-nav-dugme" onclick="promeniMesec(-1)" aria-label="Prethodni mesec">◀</button>
                <span class="kalendar-naslov">${MESECI_LAT[mesec]} ${godina}</span>
                <button type="button" class="kalendar-nav-dugme" onclick="promeniMesec(1)" aria-label="Sledeći mesec">▶</button>
                <button type="button" class="kalendar-danas-dugme" onclick="kalendarNaDanas()" title="Tekući mesec / izaberi današnji datum">● Danas</button>
            </div>
            <div class="kalendar-dani-u-nedelji">
                ${DANI_KRATKO.map(d => `<div class="dan-u-nedelji">${d}</div>`).join('')}
            </div>
            <div class="kalendar-dani">
    `;

        const prethodniMesec = new Date(godina, mesec, 0);
    for (let i = startniDan - 1; i >= 0; i--) {
        html += `<div class="kalendar-dan drugi-mesec" aria-hidden="true">${prethodniMesec.getDate() - i}</div>`;
    }

        for (let dan = 1; dan <= poslednjiDan.getDate(); dan++) {
        const datum = new Date(godina, mesec, dan);
        const datumStr = formatirajDatumISO(datum);
        const beleskeZaDan = podaciAplikacije.notes.filter(n => n.date === datumStr);
        const jeDanas = datum.toDateString() === danas.toDateString();
        const jeIzabran = datum.toDateString() === izabraniDatum.toDateString();

        let klase = 'kalendar-dan';
        if (jeDanas) klase += ' danas';
        if (jeIzabran) klase += ' izabran';
        if (beleskeZaDan.length) klase += ' ima-beleske';

                const tacke = [...new Set(beleskeZaDan.map(n => n.type))]
            .slice(0, 3)
            .map(t => `<span class="tacka" style="background:${(TIPOVI_BELESKE[t] || TIPOVI_BELESKE.ostalo).color}"></span>`)
            .join('');

        html += `<div class="${klase}" onclick="izaberiDatum(${godina}, ${mesec}, ${dan})"
            role="button" tabindex="0" aria-label="${dan}. ${MESECI_LAT[mesec]}${beleskeZaDan.length ? `, ${beleskeZaDan.length} beleški` : ''}">
            ${dan}
            ${tacke ? `<span class="tacke-beleski">${tacke}</span>` : ''}
        </div>`;
    }

        const preostalo = 42 - (startniDan + poslednjiDan.getDate());
    for (let dan = 1; dan <= preostalo; dan++) {
        html += `<div class="kalendar-dan drugi-mesec" aria-hidden="true">${dan}</div>`;
    }

    html += '</div></div>';
    kontejner.innerHTML = html;
}

function promeniMesec(smer) {
    stanje.calendarMonth += smer;
    if (stanje.calendarMonth > 11) {
        stanje.calendarMonth = 0;
        stanje.calendarYear++;
    } else if (stanje.calendarMonth < 0) {
        stanje.calendarMonth = 11;
        stanje.calendarYear--;
    }
    prikaziKalendar();
}

function kalendarNaDanas() {
    const d = new Date();
    stanje.calendarMonth = d.getMonth();
    stanje.calendarYear = d.getFullYear();
    izaberiDatum(d.getFullYear(), d.getMonth(), d.getDate());
}

function izaberiDatum(godina, mesec, dan) {
    stanje.selectedDate = new Date(godina, mesec, dan);
    prikaziKalendar();
    prikaziBeleskeIzabraniDatum();
}

function prikaziBeleskeIzabraniDatum() {
    const kontejner = document.getElementById('beleskeIzabraniDatum');
    if (!kontejner) return;

    const datumStr = formatirajDatumISO(stanje.selectedDate);
    const beleske = podaciAplikacije.notes.filter(n => n.date === datumStr);

    document.getElementById('naslovIzabraniDatum').textContent = formatirajDatum(stanje.selectedDate);

    if (beleske.length === 0) {
        kontejner.innerHTML = `
            <div class="prazno-stanje">
                <div class="prazno-stanje-ikona" aria-hidden="true"><span class="ik" data-e="🗒️" data-a="[N]"></span></div>
                <p class="prazno-sadrzaj">Nema beleški za ovaj dan</p>
            </div>`;
        return;
    }

    let html = '';
    beleske.forEach(beleska => {
        const tip = TIPOVI_BELESKE[beleska.type] || TIPOVI_BELESKE.ostalo;
        const predmet = beleska.subjectId ? dobijPredmet(beleska.subjectId) : null;
        const naslov = skratiTekst(beleska.title, 42);
        const opis = skratiTekst(beleska.content, 64);

        html += `
            <div class="stavka-beleske ${beleska.completed ? 'zavrsena' : ''}" style="border-left-color:${tip.color}">
                <div class="stavka-beleske-zaglavlje">
                    <span class="stavka-beleske-ikona" aria-hidden="true">${ikonaTipa(tip)}</span>
                    <div class="stavka-beleske-sadrzaj">
                        <div class="stavka-beleske-naslov ${beleska.completed ? 'zavrsen' : ''}" title="${esc(beleska.title)}">${esc(naslov)}</div>
                        ${opis ? `<div class="stavka-beleske-opis">${esc(opis)}</div>` : ''}
                        <div class="stavka-beleske-oznake">
                            <span class="oznaka oznaka-${esc(beleska.type)}">${tip.label}</span>
                            ${predmet ? `<span class="oznaka oznaka-kontura">${esc(predmet.name)}</span>` : ''}
                        </div>
                    </div>
                    <div class="stavka-beleske-akcije">
                        <button type="button" class="dugme dugme-ghost dugme-ikona" onclick="promeniStatusBeleske('${esc(beleska.id)}')" title="${beleska.completed ? 'Vrati u aktivne' : 'Označi kao završeno'}">${beleska.completed ? ikonica('↩️', '&lt;~') : ikonica('✅', '[v]')}</button>
                        <button type="button" class="dugme dugme-ghost dugme-ikona" onclick="otvoriModalBeleska('${esc(beleska.id)}')" title="Izmeni">${ikonica('✏️', '&gt;')}</button>
                        <button type="button" class="dugme dugme-ghost dugme-ikona" onclick="obrisiBelesku('${esc(beleska.id)}')" title="Obriši">${ikonica('🗑️', '[x]')}</button>
                    </div>
                </div>
            </div>
        `;
    });

    kontejner.innerHTML = html;
}

function nadolazeciSortirani() {
    return podaciAplikacije.notes
        .filter(n => !n.completed && danaDoDatuma(n.date) >= 0)
        .sort((a, b) => kreirajDatumLokalno(a.date) - kreirajDatumLokalno(b.date))
        .slice(0, 5);
}

function prikaziNadolazeceDogadjaje() {
    const kontejner = document.getElementById('nadolazeciDogadjaji');
    const kartica = document.getElementById('karticaNadolazeci');
    if (!kontejner || !kartica) return;

    const nadolazeci = nadolazeciSortirani();

    if (nadolazeci.length === 0) {
        kartica.style.display = 'none';
        return;
    }
    kartica.style.display = 'block';

    let html = '';
    nadolazeci.forEach(beleska => {
        const tip = TIPOVI_BELESKE[beleska.type] || TIPOVI_BELESKE.ostalo;
        const dana = danaDoDatuma(beleska.date);

        html += `
            <div class="nadolazeca-stavka" onclick="izaberiDatumBeleske('${esc(beleska.date)}')">
                <span class="nadolazeca-stavka-ikona" aria-hidden="true">${ikonaTipa(tip)}</span>
                <div class="nadolazeca-stavka-sadrzaj">
                    <div class="nadolazeca-stavka-naslov" title="${esc(beleska.title)}">${esc(beleska.title)}</div>
                    <div class="nadolazeca-stavka-datum">${formatirajDatum(kreirajDatumLokalno(beleska.date))}</div>
                </div>
                <span class="oznaka ${dana === 0 ? 'oznaka-opasno' : dana <= 3 ? 'oznaka-upozorenje' : 'oznaka-kontura'}">
                    ${dana === 0 ? 'Danas!' : dana === 1 ? 'Sutra' : `${dana} dana`}
                </span>
            </div>
        `;
    });

    kontejner.innerHTML = html;
}

function izaberiDatumBeleske(datumStr) {
    const datum = kreirajDatumLokalno(datumStr);
    stanje.selectedDate = datum;
    stanje.calendarMonth = datum.getMonth();
    stanje.calendarYear = datum.getFullYear();
    prebaciTab('kalendar');
    prikaziKalendar();
    prikaziBeleskeIzabraniDatum();
}
