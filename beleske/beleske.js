// Tab beleski: kartice, filteri po tipu, pretraga i traka napretka.
'use strict';
// ===== POMOCNE FUNKCIJE =====
function normalizujTekst(t) {
    return String(t == null ? '' : t).toLowerCase()
        .replace(/č/g, 'c').replace(/ć/g, 'c').replace(/š/g, 's')
        .replace(/ž/g, 'z').replace(/đ/g, 'dj')
        .replace(/\s+/g, ' ').trim();
}

// ===== PRIKAZ BELESKI =====
function prikaziBeleske() {
    const kontejner = document.getElementById('mrezaBeleski');
    if (!kontejner) return;

    const filter = stanje.currentFilter;
    const upit = normalizujTekst(stanje.pretraga);
    let beleske = [...podaciAplikacije.notes];
    if (filter !== 'sve') {
        beleske = beleske.filter(n => n.type === filter);
    }
    if (upit) {
        beleske = beleske.filter(n => {
            const predmet = n.subjectId ? dobijPredmet(n.subjectId) : null;
            const tekst = normalizujTekst(
                (n.title || '') + ' ' + (n.content || '') +
                (predmet ? ' ' + predmet.name : '')
            );
            return tekst.includes(upit);
        });
    }

    beleske.sort((a, b) => {
        const zakačene = (b.pinned === true) - (a.pinned === true);
        if (zakačene) return zakačene;
        return kreirajDatumLokalno(a.date) - kreirajDatumLokalno(b.date);
    });

        document.getElementById('brojSve').textContent = podaciAplikacije.notes.length;
    ['kontrolni', 'pismeni', 'blic', 'prezentacija', 'domaci', 'ostalo'].forEach(tip => {
        const el = document.getElementById('broj' + tip.charAt(0).toUpperCase() + tip.slice(1));
        if (el) el.textContent = podaciAplikacije.notes.filter(n => n.type === tip).length;
    });

    azurirajProgresBeleski();
    azurirajPretraguPrikaz(beleske.length);

    const praznoZbogPretrage = !!upit && podaciAplikacije.notes.length > 0;
    if (beleske.length === 0) {
        kontejner.innerHTML = `
            <div class="prazno-stanje">
                <div class="prazno-stanje-ikona" aria-hidden="true">${praznoZbogPretrage ? ikonica('lupa', '[?]') : ikonica('beleske', '[N]')}</div>
                <p class="prazno-sadrzaj">${praznoZbogPretrage
            ? esc(t('bel.nemaRezultata', { upit: skratiTekst(stanje.pretraga, 30) }))
            : esc(t(filter !== 'sve' ? 'bel.nemaBeleskiKat' : 'bel.nemaBeleski'))}</p>
            </div>`;
        return;
    }

    let html = '';
    beleske.forEach(beleska => {
        const tip = TIPOVI_BELESKE[beleska.type] || TIPOVI_BELESKE.ostalo;
        const predmet = beleska.subjectId ? dobijPredmet(beleska.subjectId) : null;
        const dana = danaDoDatuma(beleska.date);
        const naslov = skratiTekst(beleska.title, 52);
        const opis = skratiTekst(beleska.content, 90);

        html += `
            <div class="beleska-kartica ${beleska.completed ? 'zavrsena' : ''}${beleska.pinned ? ' zakačena' : ''}" style="border-top-color:${tip.color}">
                ${beleska.pinned ? '<span class="beleska-zakac-traka" aria-hidden="true">' + ikonica('cackalica', '*') + ' ' + esc(t('bel.zakaceno')) + '</span>' : ''}
                <div class="beleska-kartica-zaglavlje">
                    <div class="beleska-kartica-tip">
                        <span aria-hidden="true">${ikonaTipa(tip)}</span>
                        <span class="oznaka oznaka-${esc(beleska.type)}">${esc(tip.label)}</span>
                    </div>
                    <div class="beleska-kartica-akcije">
                        <button type="button" class="dugme dugme-ghost dugme-ikona dugme-zakaci${beleska.pinned ? ' aktivan' : ''}" onclick="zakaciBelesku('${esc(beleska.id)}')" title="${esc(t(beleska.pinned ? 'bel.otkaciTitle' : 'bel.zakačiTitle'))}" aria-pressed="${beleska.pinned ? 'true' : 'false'}" aria-label="${esc(t('bel.zakačiAria'))}">${ikonica('cackalica', '*')}</button>
                        <button type="button" class="dugme dugme-ghost dugme-ikona" onclick="promeniStatusBeleske('${esc(beleska.id)}')" title="${esc(t(beleska.completed ? 'bel.vratiTitle' : 'bel.zavrsiTitle'))}">${beleska.completed ? ikonica('vrati', '&lt;~') : ikonica('cek_u_krugu', '[v]')}</button>
                        <button type="button" class="dugme dugme-ghost dugme-ikona" onclick="otvoriModalBeleska('${esc(beleska.id)}')" title="${esc(t('bel.izmeniTitle'))}">${ikonica('olovka', '&gt;')}</button>
                        <button type="button" class="dugme dugme-ghost dugme-ikona" onclick="obrisiBelesku('${esc(beleska.id)}')" title="${esc(t('bel.obrisiTitle'))}">${ikonica('kanta', '[x]')}</button>
                    </div>
                </div>
                <div class="beleska-kartica-telo">
                    <div class="beleska-kartica-naslov ${beleska.completed ? 'zavrsen' : ''}" title="${esc(beleska.title)}">${esc(naslov)}</div>
                    ${opis ? `<div class="beleska-kartica-opis">${esc(opis)}</div>` : ''}
                    <div class="beleska-kartica-footer">
                        <span class="beleska-kartica-datum">${ikonica('kalendar', '[D]')} ${formatirajDatum(kreirajDatumLokalno(beleska.date))}</span>
                        ${dana >= 0 && !beleska.completed ? `<span class="oznaka ${dana === 0 ? 'oznaka-opasno' : dana <= 3 ? 'oznaka-upozorenje' : 'oznaka-kontura'}">${esc(tekstDana(dana))}</span>` : ''}
                        ${predmet ? `<span class="oznaka oznaka-kontura">${esc(predmet.name)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    kontejner.innerHTML = html;
}

// ===== STATUS, KACENJE, BRISANJE =====
function promeniStatusBeleske(id) {
    const beleska = podaciAplikacije.notes.find(n => n.id === id);
    if (beleska) {
        beleska.completed = !beleska.completed;
        sacuvajPodatke();
        azurirajPrikazeBeleski();
    }
}

function zakaciBelesku(id) {
    const beleska = podaciAplikacije.notes.find(n => n.id === id);
    if (!beleska) return;
    beleska.pinned = !beleska.pinned;
    sacuvajPodatke();
    azurirajPrikazeBeleski();
    prikaziToast(beleska.pinned ? t('bel.toastZakacena') : t('bel.toastOtkacena'), 'info');
}

function obrisiBelesku(id) {
    prikaziPotvrdu(t('bel.potvrdaBrisanje'), (potvrdjeno) => {
        if (!potvrdjeno) return;
        podaciAplikacije.notes = podaciAplikacije.notes.filter(n => n.id !== id);
        sacuvajPodatke();
        azurirajPrikazeBeleski();
        prikaziToast(t('bel.toastObrisana'), 'uspeh');
    });
}

// ===== FILTRI =====
function azurirajPrikazeBeleski() {
    prikaziBeleske();
    prikaziBeleskeIzabraniDatum();
    prikaziNadolazeceDogadjaje();
    prikaziObavestenja();
    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
    azurirajPodnozje();
}

function postaviFilter(filter) {
    stanje.currentFilter = filter;
    document.querySelectorAll('.filter-dugme').forEach(dugme => {
        dugme.classList.toggle('aktivan', dugme.dataset.filter === filter);
    });
    prikaziBeleske();
}

// ===== PROGRES =====
function azurirajProgresBeleski() {
    const wrap = document.getElementById('beleskeProgres');
    const traka = document.getElementById('beleskeProgresPopunjeno');
    const tekst = document.getElementById('beleskeProgresTekst');
    const aria = document.getElementById('beleskeProgresTraka');
    if (!wrap || !traka || !tekst) return;

    let skup = [...podaciAplikacije.notes];
    if (stanje.currentFilter !== 'sve') skup = skup.filter(n => n.type === stanje.currentFilter);

    if (skup.length === 0) {
        wrap.hidden = true;
        return;
    }
    wrap.hidden = false;
    const zavrsene = skup.filter(n => n.completed).length;
    const procenat = Math.round((zavrsene / skup.length) * 100);
    traka.style.width = procenat + '%';
    tekst.textContent = t('bel.progres', { z: zavrsene, u: skup.length, p: procenat });
    if (aria) {
        aria.setAttribute('aria-valuenow', String(procenat));
        if (procenat === 100) aria.setAttribute('aria-valuetext', t('bel.progresSve'));
    }
}

// ===== PRETRAGA =====
function azurirajPretraguPrikaz(brojRezultata) {
    const brojEl = document.getElementById('pretragaBroj');
    const ocistiEl = document.getElementById('dugmeOcistiPretragu');
    const upit = stanje.pretraga;

    if (ocistiEl) ocistiEl.hidden = !upit;
    if (!brojEl) return;

    if (!upit) {
        brojEl.textContent = '';
        brojEl.hidden = true;
        return;
    }
    brojEl.hidden = false;
    const ukupno = podaciAplikacije.notes.length;
    brojEl.textContent = `${brojRezultata}/${ukupno} ${t(brojRezultata === 1 ? 'bel.rezultat' : 'bel.rezultati')}`;
}

function postaviPretragu(upit) {
    stanje.pretraga = String(upit || '');
    prikaziBeleske();
}

function ocistiPretragu() {
    const unos = document.getElementById('pretragaBeleske');
    if (unos) unos.value = '';
    stanje.pretraga = '';
    prikaziBeleske();
}
