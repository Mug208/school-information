// Zaglavlje: navigacija, mobilni meni, zvono sa obavestenjima i statusna traka.
'use strict';

// ===== NAVIGACIJA PO TABOVIMA =====
function prebaciTab(tab) {
    // Tok je vidljiv: akcija menja stanje u store-u, ostatak je reakcija.
    Store.dispatch({ type: 'TAB_PROMENI', payload: tab });

    document.querySelectorAll('.nav-dugme, .mobilni-nav-dugme').forEach(dugme => {
        dugme.classList.toggle('aktivan', dugme.dataset.tab === tab);
    });

    document.querySelectorAll('.tab-sadrzaj').forEach(sadrzaj => {
        sadrzaj.classList.toggle('aktivan', sadrzaj.id === `tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    });

    zatvoriMobilniMeni();
}

// ===== MOBILNI MENI =====
function prebaciMobilniMeni() {
    const meni = document.getElementById('mobilniMeni');
    if (!meni) return;
    if (meni.classList.contains('prikazi')) {
        zatvoriMobilniMeni();
    } else {
        otvoriMobilniMeni();
    }
}

function otvoriMobilniMeni() {
    const meni = document.getElementById('mobilniMeni');
    const prekrivac = document.getElementById('mobilniMeniPrekrivac');
    const dugme = document.getElementById('dugmeMobilniMeni');
    if (!meni) return;

    meni.classList.add('prikazi');
    if (prekrivac) prekrivac.classList.add('prikazi');
    document.body.classList.add('meni-otvoren');
    if (dugme) {
        dugme.setAttribute('aria-expanded', 'true');
        dugme.setAttribute('aria-label', t('meni.zatvori'));
    }
    const prvoDugme = meni.querySelector('.mobilni-nav-dugme');
    if (prvoDugme) setTimeout(() => { try { prvoDugme.focus(); } catch (e) { } }, 240);
}

function zatvoriMobilniMeni() {
    const meni = document.getElementById('mobilniMeni');
    const prekrivac = document.getElementById('mobilniMeniPrekrivac');
    const dugme = document.getElementById('dugmeMobilniMeni');
    if (!meni || !meni.classList.contains('prikazi')) return;

    meni.classList.remove('prikazi');
    if (prekrivac) prekrivac.classList.remove('prikazi');
    document.body.classList.remove('meni-otvoren');
    if (dugme) {
        dugme.setAttribute('aria-expanded', 'false');
        dugme.setAttribute('aria-label', t('meni.arialabel'));
    }
}

// ===== OBAVESTENJA =====
function prikaziObavestenja() {
    const kontejner = document.getElementById('listaObavestenja');
    const oznaka = document.getElementById('brojObavestenja');
    if (!kontejner || !oznaka) return;

    const nadolazeci = nadolazeciSortirani();

    oznaka.textContent = nadolazeci.length;
    oznaka.classList.toggle('prikazi', nadolazeci.length > 0);

    if (nadolazeci.length === 0) {
        kontejner.innerHTML = `<p style="text-align:center;color:var(--tekst-sekundarni);padding:18px 10px;font-size:0.8rem;">${esc(t('dropdown.nema'))} ${ikonica('iskre', ':)')}</p>`;
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
                        ${esc(tekstDana(dana))}
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

// ===== SMENA I STATUS =====
function prikaziOznakuSmene() {
    const smena = podaciAplikacije.settings.currentShift;
    const podesavanjaSmene = podaciAplikacije.settings.shifts[smena];
    const trenutniCasInfo = infoTrenutnogCasa();

    const nazivEl = document.getElementById('nazivSmene');
    const ikonaEl = document.getElementById('ikonaSmene');
    if (!nazivEl || !ikonaEl) return;

    postaviIkonu(ikonaEl, smena === 'jutarnja' ? 'izlazak' : 'zalazak', smena === 'jutarnja' ? '[AM]' : '[PM]');
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
                ? t('status.popodnevnaZa', { sati, minuti })
                : t('status.popodnevnaZaMin', { minuti });
        }
    } else if (rezim === 'rotacija') {

        const sledeca = datumSledeceRotacije();
        if (sledeca) {
            let danTekst = '';
            if ((podaciAplikacije.settings.shiftRotation || 'nedelja') === 'nedelja') {
                const dan = danPromeneRotacije();
                if (dan !== 1) danTekst = DANI_ROTACIJE_INSTRUMENTAL[dan - 1] + ' ';
            }
            nazivEl.textContent += t('status.menjaSe', { danTekst, datum: formatirajDatum(sledeca) });
        }
    }
}

function azurirajStatusTekst() {
    const el = document.getElementById('statusTekst');
    if (!el) return;

    const info = infoTrenutnogCasa();
    if (!info) {
        const jutarnjiPocetak = vremeUMinute(podaciAplikacije.settings.shifts.jutarnja.startTime);
        el.textContent = trenutnoVremeMinuta() < jutarnjiPocetak ? t('status.nastavaNije') : t('status.nastavaKraj');
        return;
    }

    if (info.isBreak) {
        el.innerHTML = info.isBigBreak
            ? `${ikonica('kafa', 'BRK')} ${esc(t('status.velikiOdmor'))}`
            : `${ikonica('rombo', '-')} ${esc(t('status.maliOdmor'))}`;
        return;
    }

    const stavka = info.dayIndex >= 0 ? dobijStavkuRasporeda(info.dayIndex, info.period - 1) : null;
    const predmet = stavka ? dobijPredmet(stavka.subjectId) : null;
    el.innerHTML = `${ikonica('plej', '>')} ${esc(t('status.cas', { n: info.period }))}${predmet ? ' / ' + esc(predmet.name) : ''} (${info.start}–${info.end})`;
}

// ===== SAT I PODNOZJE =====
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
    el.textContent = t('fud.statistika', { p: st.predmeta, b: st.beleski, c: st.stavkiRasporeda, kb: st.velicinaKB });
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
    document.getElementById('nazivRazreda').textContent = t('app.razred') + (podaciAplikacije.settings.className || '/');
}
