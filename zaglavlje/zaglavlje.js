'use strict';
function prebaciTab(tab) {
    stanje.currentTab = tab;

    document.querySelectorAll('.nav-dugme, .mobilni-nav-dugme').forEach(dugme => {
        dugme.classList.toggle('aktivan', dugme.dataset.tab === tab);
    });

    document.querySelectorAll('.tab-sadrzaj').forEach(sadrzaj => {
        sadrzaj.classList.toggle('aktivan', sadrzaj.id === `tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    });

    const mobilniMeni = document.getElementById('mobilniMeni');
    if (mobilniMeni) mobilniMeni.classList.remove('prikazi');
}

function prebaciMobilniMeni() {
    document.getElementById('mobilniMeni').classList.toggle('prikazi');
}

function prikaziObavestenja() {
    const kontejner = document.getElementById('listaObavestenja');
    const oznaka = document.getElementById('brojObavestenja');
    if (!kontejner || !oznaka) return;

    const nadolazeci = nadolazeciSortirani();

    oznaka.textContent = nadolazeci.length;
    oznaka.classList.toggle('prikazi', nadolazeci.length > 0);

    if (nadolazeci.length === 0) {
        kontejner.innerHTML = '<p style="text-align:center;color:var(--tekst-sekundarni);padding:18px 10px;font-size:0.8rem;">Nema nadolazećih događaja <span class="ik" data-e="🎉" data-a=":)"></span></p>';
        return;
    }

    let html = '';
    nadolazeci.forEach(beleska => {
        const tip = TIPOVI_BELESKE[beleska.type] || TIPOVI_BELESKE.ostalo;
        const dana = danaDoDatuma(beleska.date);
        const predmet = beleska.subjectId ? dobijPredmet(beleska.subjectId) : null;

        html += `
            <div class="dropdown-stavka" onclick="izaberiDatumBeleske('${esc(beleska.date)}'); zatvoriObavestenja();">
                <div class="dropdown-stavka-naslov">${ikonaTipa(tip)} ${esc(beleska.title)}</div>
                <div class="dropdown-stavka-meta">
                    <span>${formatirajDatum(kreirajDatumLokalno(beleska.date))}</span>
                    <span class="oznaka ${dana === 0 ? 'oznaka-opasno' : dana <= 3 ? 'oznaka-upozorenje' : 'oznaka-kontura'}">
                        ${dana === 0 ? 'Danas!' : dana === 1 ? 'Sutra' : `${dana} dana`}
                    </span>
                </div>
                ${predmet ? `<span class="oznaka oznaka-kontura">${esc(predmet.name)}</span>` : ''}
            </div>
        `;
    });

    kontejner.innerHTML = html;
}

function zatvoriObavestenja() {
    const dropdown = document.getElementById('dropdownObavestenja');
    const dugme = document.getElementById('dugmeObavestenja');
    if (dropdown) dropdown.classList.remove('prikazi');
    if (dugme) dugme.setAttribute('aria-expanded', 'false');
}

function prikaziOznakuSmene() {
    const smena = podaciAplikacije.settings.currentShift;
    const podesavanjaSmene = podaciAplikacije.settings.shifts[smena];
    const trenutniCasInfo = infoTrenutnogCasa();

    const nazivEl = document.getElementById('nazivSmene');
    const ikonaEl = document.getElementById('ikonaSmene');
    if (!nazivEl || !ikonaEl) return;

    postaviIkonu(ikonaEl, smena === 'jutarnja' ? '🌅' : '🌇', smena === 'jutarnja' ? '[AM]' : '[PM]');
    nazivEl.textContent = podesavanjaSmene.name;

    const rezim = podaciAplikacije.settings.shiftMode || 'sat';
    if (rezim === 'sat' && smena === 'jutarnja' && !trenutniCasInfo) {
        const sad = trenutnoVremeMinuta();
        const popodnevniPocetak = vremeUMinute(podaciAplikacije.settings.shifts.popodnevna.startTime);
        if (sad < popodnevniPocetak) {
            const minutaDo = popodnevniPocetak - sad;
            const sati = Math.floor(minutaDo / 60);
            const minuti = minutaDo % 60;
            nazivEl.textContent += sati > 0
                ? ` (popodnevna za ${sati}č ${minuti}min)`
                : ` (popodnevna za ${minuti}min)`;
        }
    } else if (rezim === 'rotacija') {

        const sledeca = datumSledeceRotacije();
        if (sledeca) {
            let danTekst = '';
            if ((podaciAplikacije.settings.shiftRotation || 'nedelja') === 'nedelja') {
                const dan = danPromeneRotacije();
                if (dan !== 1) danTekst = DANI_ROTACIJE_INSTRUMENTAL[dan - 1] + ' ';
            }
            nazivEl.textContent += ` (menja se ${danTekst}${formatirajDatum(sledeca)})`;
        }
    }
}

function azurirajStatusTekst() {
    const el = document.getElementById('statusTekst');
    if (!el) return;

    const info = infoTrenutnogCasa();
    if (!info) {
        const jutarnjiPocetak = vremeUMinute(podaciAplikacije.settings.shifts.jutarnja.startTime);
        el.textContent = trenutnoVremeMinuta() < jutarnjiPocetak ? 'Nastava još nije počela' : 'Nastava je završena';
        return;
    }

    if (info.isBreak) {
        el.textContent = info.isBigBreak ? '☕ Veliki odmor' : '🔹 Mali odmor';
        if (document.body.classList.contains('code-tema')) el.textContent = tekstBezEmojija(el.textContent);
        return;
    }

    const stavka = info.dayIndex >= 0 ? dobijStavkuRasporeda(info.dayIndex, info.period - 1) : null;
    const predmet = stavka ? dobijPredmet(stavka.subjectId) : null;
    el.textContent = `▶ ${info.period}. čas${predmet ? ' / ' + predmet.name : ''} (${info.start}–${info.end})`;
}

function pokreniSat() {
    const satEl = document.getElementById('livSat');
    const datumEl = document.getElementById('livDatum');

    const osvezi = () => {
        const sad = new Date();
        if (satEl) {
            satEl.textContent = [sad.getHours(), sad.getMinutes(), sad.getSeconds()]
                .map(v => String(v).padStart(2, '0')).join(':');
        }
        if (datumEl) {
            datumEl.textContent = `${DANI_KRATKO[(sad.getDay() + 6) % 7]}, ${formatirajDatum(sad)}`;
        }
    };

    osvezi();
    setInterval(osvezi, 1000);
    setInterval(() => {
        azurirajStatusTekst();
        azurirajAutoSmenu();
    }, 30000);
}

function azurirajPodnozje() {
    const el = document.getElementById('podnozjeStat');
    if (!el) return;

    const st = getStatistike();
    el.textContent = `${st.predmeta} predmeta • ${st.beleski} beleški • ${st.stavkiRasporeda} časova • ${st.velicinaKB} KB`;
}

function prikaziNazivSkole() {
    const naziv = podaciAplikacije.settings.schoolName || 'Školska Informacija';
    const h1 = document.getElementById('nazivSkole');
    const delovi = naziv.trim().split(/\s+/);
    const prva = delovi[0] || 'Školska';
    const ostatak = delovi.slice(1).join(' ');

    document.getElementById('tajnaRec1').textContent = prva;
    document.getElementById('nazivSkoleOstatak').textContent = ostatak;
    h1.setAttribute('data-text', naziv);
    h1.title = naziv;
    document.getElementById('nazivRazreda').textContent = `Razred: ${podaciAplikacije.settings.className || '/'}`;
}
