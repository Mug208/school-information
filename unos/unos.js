'use strict';
function bezDijakritika(tekst) {
    return String(tekst || '')
        .toLowerCase()
        .replace(/đ/g, 'dj')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function azurirajInfoSlota() {
    const el = document.getElementById('infoSlota');
    if (!el || !stanje.editingSchedule) return;

    const dan = parseInt(document.getElementById('rasporedDan').value, 10);
    const cas = parseInt(document.getElementById('rasporedCas').value, 10);
    const vremena = izracunajVremenaCasova();
    const v = vremena.find(t => t.period === cas + 1 && !t.isBreak);
    const smena = podaciAplikacije.settings.currentShift === 'popodnevna' ? 'POPODNEVNA' : 'JUTARNJA';

    el.innerHTML = `
        <span class="is-cip is-dan">${DANI_LAT[dan].toUpperCase()}</span>
        <span class="is-cip">${cas + 1}. ČAS</span>
        ${v ? `<span class="is-cip is-vreme">${v.start}–${v.end}</span>` : ''}
        <span class="is-cip is-smena">${smena} SMENA</span>
    `;
}

function renderujBiracPredmeta() {
    const kont = document.getElementById('biracPredmeta');
    if (!kont) return;

    const predmeti = podaciAplikacije.settings.subjects || [];
    const izabrani = stanje.editingSchedule ? stanje.editingSchedule.subjectId : '';
    const pretragaEl = document.getElementById('pretragaPredmeta');
    const filter = pretragaEl ? bezDijakritika(pretragaEl.value) : '';

        if (!predmeti.length) {
        kont.innerHTML = `
            <div class="bp-prazno">
                <span class="bp-prazno-naslov">${ikonica('📭', '[!]')} Nema još predmeta</span>
                <p>Dodajte predmet da biste popunili raspored / boja čipa olakšava snalaženje.</p>
                <button type="button" class="dugme dugme-glavno" onclick="otvoriModalPredmetSaRasporeda()">${ikonica('➕', '[+]')} Dodaj predmet</button>
            </div>`;
        return;
    }

    const smena = podaciAplikacije.settings.currentShift;
    const filtrirani = predmeti.filter(p =>
        !filter ||
        bezDijakritika(p.name).includes(filter) ||
        bezDijakritika(p.teacher || '').includes(filter)
    );

        if (!filtrirani.length) {
        kont.innerHTML = `
            <div class="bp-prazno">
                <span class="bp-prazno-naslov">${ikonica('🔍', '[>]')} Nema pogodaka</span>
                <p>Nijedan predmet ne odgovara pretrazi „${esc(pretragaEl ? pretragaEl.value : '')}”.</p>
                <button type="button" class="dugme dugme-sekundarno" onclick="ocistiPretraguPredmeta()">Prikaži sve predmete</button>
            </div>`;
        return;
    }

    kont.innerHTML = filtrirani.map(p => {
        const broj = podaciAplikacije.schedule.filter(s => s.subjectId === p.id && s.shift === smena).length;
        const izabran = p.id === izabrani;
        const metaDelovi = [];
        if (p.teacher) metaDelovi.push(esc(p.teacher));
        if (broj) metaDelovi.push('×' + broj);
        const metaTekst = metaDelovi.length ? metaDelovi.join(' · ') : '/';
        return `
        <button type="button" class="bp-predmet ${izabran ? 'izabran' : ''}"
            data-id="${esc(p.id)}" style="--pb:${esc(p.color)}"
            onclick="izaberiPredmetUBiracu('${esc(p.id)}')"
            aria-pressed="${izabran ? 'true' : 'false'}"
            title="${esc(p.name)}${p.teacher ? ' / ' + esc(p.teacher) : ''}">
            <span class="bp-cip" aria-hidden="true"></span>
            <span class="bp-sadrzaj">
                <span class="bp-naziv">${esc(p.name)}</span>
                <span class="bp-meta">${metaTekst}</span>
            </span>
            <span class="bp-cek" aria-hidden="true">${ikonica('✓', '[v]')}</span>
        </button>`;
    }).join('');
}

function izaberiPredmetUBiracu(id) {
    if (!stanje.editingSchedule) return;
    stanje.editingSchedule.subjectId = id;
    document.querySelectorAll('#biracPredmeta .bp-predmet').forEach(b => {
        const on = b.getAttribute('data-id') === id;
        b.classList.toggle('izabran', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}

function ocistiPretraguPredmeta() {
    const el = document.getElementById('pretragaPredmeta');
    if (el) el.value = '';
    renderujBiracPredmeta();
    if (el) el.focus();
}

function azurirajGiInfo() {
    const el = document.getElementById('giInfo');
    if (!el) return;
    const n = stanje.izabraniSlotovi.size;
    const smena = podaciAplikacije.settings.currentShift === 'popodnevna' ? 'POPODNEVNA' : 'JUTARNJA';
    el.innerHTML = `
        <span class="is-cip is-dan">${n} ${n === 1 ? 'IZABRAN' : 'IZABRANA'}</span>
        <span class="is-cip is-smena">${smena} SMENA</span>
        <span class="is-cip">PON – PET</span>
    `;
}

function azurirajGiPolja() {
    const poljePredmet = document.getElementById('giPoljePredmet');
    const chkPredmet = document.getElementById('giPromeniPredmet');
    if (poljePredmet && chkPredmet) poljePredmet.classList.toggle('gi-onemoguceno', !chkPredmet.checked);

    const poljeKabinet = document.getElementById('giPoljeKabinet');
    const chkKabinet = document.getElementById('giPromeniKabinet');
    if (poljeKabinet && chkKabinet) poljeKabinet.classList.toggle('gi-onemoguceno', !chkKabinet.checked);
}

function renderujBiracGrupne() {
    const kont = document.getElementById('biracGrupne');
    if (!kont) return;

    const predmeti = podaciAplikacije.settings.subjects || [];
    const izabrani = stanje.grupnaIzmena ? stanje.grupnaIzmena.subjectId : '';
    const pretragaEl = document.getElementById('giPretraga');
    const filter = pretragaEl ? bezDijakritika(pretragaEl.value) : '';

    if (!predmeti.length) {
        kont.innerHTML = `
            <div class="bp-prazno">
                <span class="bp-prazno-naslov">${ikonica('📭', '[!]')} Nema još predmeta</span>
                <p>Dodajte predmet da biste popunili raspored.</p>
                <button type="button" class="dugme dugme-glavno" onclick="otvoriModalPredmetIzGrupne()">${ikonica('➕', '[+]')} Dodaj predmet</button>
            </div>`;
        return;
    }

    const smena = podaciAplikacije.settings.currentShift;
    const filtrirani = predmeti.filter(p =>
        !filter ||
        bezDijakritika(p.name).includes(filter) ||
        bezDijakritika(p.teacher || '').includes(filter)
    );

    if (!filtrirani.length) {
        kont.innerHTML = `
            <div class="bp-prazno">
                <span class="bp-prazno-naslov">${ikonica('🔍', '[>]')} Nema pogodaka</span>
                <p>Nijedan predmet ne odgovara pretrazi „${esc(pretragaEl ? pretragaEl.value : '')}”.</p>
                <button type="button" class="dugme dugme-sekundarno" onclick="ocistiPretraguGrupne()">Prikaži sve predmete</button>
            </div>`;
        return;
    }

    kont.innerHTML = filtrirani.map(p => {
        const broj = podaciAplikacije.schedule.filter(s => s.subjectId === p.id && s.shift === smena).length;
        const izabran = p.id === izabrani;
        const metaDelovi = [];
        if (p.teacher) metaDelovi.push(esc(p.teacher));
        if (broj) metaDelovi.push('×' + broj);
        const metaTekst = metaDelovi.length ? metaDelovi.join(' · ') : '/';
        return `
        <button type="button" class="bp-predmet ${izabran ? 'izabran' : ''}"
            data-id="${esc(p.id)}" style="--pb:${esc(p.color)}"
            onclick="izaberiPredmetUGrupnoj('${esc(p.id)}')"
            aria-pressed="${izabran ? 'true' : 'false'}"
            title="${esc(p.name)}${p.teacher ? ' / ' + esc(p.teacher) : ''}">
            <span class="bp-cip" aria-hidden="true"></span>
            <span class="bp-sadrzaj">
                <span class="bp-naziv">${esc(p.name)}</span>
                <span class="bp-meta">${metaTekst}</span>
            </span>
            <span class="bp-cek" aria-hidden="true">${ikonica('✓', '[v]')}</span>
        </button>`;
    }).join('');
}

function izaberiPredmetUGrupnoj(id) {
    if (!stanje.grupnaIzmena) return;
    stanje.grupnaIzmena.subjectId = id;
    document.querySelectorAll('#biracGrupne .bp-predmet').forEach(b => {
        const on = b.getAttribute('data-id') === id;
        b.classList.toggle('izabran', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
}

function ocistiPretraguGrupne() {
    const el = document.getElementById('giPretraga');
    if (el) el.value = '';
    renderujBiracGrupne();
    if (el) el.focus();
}
