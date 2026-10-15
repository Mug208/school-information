'use strict';
function otvoriModal(id) {
    document.getElementById(id).classList.add('prikazi');
}

function zatvoriModal(id) {
    document.getElementById(id).classList.remove('prikazi');
}

function otvoriModalPredmetSaRasporeda() {
    zatvoriModalRaspored();
    otvoriModalPredmet();
}

function otvoriModalRaspored(dan, cas) {
    const postojecaStavka = dobijStavkuRasporeda(dan, cas);
    stanje.editingSchedule = postojecaStavka || {
        id: '',
        day: dan,
        period: cas,
        shift: podaciAplikacije.settings.currentShift,
        subjectId: '',
        room: ''
    };

    document.getElementById('naslovModalRaspored').textContent = postojecaStavka ? 'Izmeni čas' : 'Dodaj čas';
    document.getElementById('rasporedDan').value = String(dan);
    document.getElementById('rasporedKabinet').value = postojecaStavka ? (postojecaStavka.room || '') : '';
    document.getElementById('dugmeObrisiRaspored').style.display = postojecaStavka ? 'inline-flex' : 'none';

    const selektCasa = document.getElementById('rasporedCas');
    selektCasa.innerHTML = '';
    for (let i = 0; i < podaciAplikacije.settings.periodsCount; i++) {
        selektCasa.innerHTML += `<option value="${i}" ${i === cas ? 'selected' : ''}>${i + 1}. čas</option>`;
    }

        const pretraga = document.getElementById('pretragaPredmeta');
    if (pretraga) pretraga.value = '';
    renderujBiracPredmeta();
    azurirajInfoSlota();

    otvoriModal('modalRaspored');
}

function zatvoriModalRaspored() {
    zatvoriModal('modalRaspored');
    stanje.editingSchedule = null;
}

function sacuvajRaspored() {
    const subjectId = stanje.editingSchedule ? stanje.editingSchedule.subjectId : '';
    if (!subjectId) {
        prikaziToast('Izaberite predmet!', 'greska');
        const kont = document.getElementById('biracPredmeta');
        if (kont) {
            kont.classList.remove('bp-greska');
            void kont.offsetWidth;
            kont.classList.add('bp-greska');
        }
        return;
    }

    const dan = parseInt(document.getElementById('rasporedDan').value, 10);
    const cas = parseInt(document.getElementById('rasporedCas').value, 10);
    const kabinet = document.getElementById('rasporedKabinet').value.trim();
    const smena = podaciAplikacije.settings.currentShift;

    podaciAplikacije.schedule = podaciAplikacije.schedule.filter(s =>
        !(s.day === dan && s.period === cas && s.shift === smena)
    );

    podaciAplikacije.schedule.push({
        id: stanje.editingSchedule.id || generisiId(),
        day: dan,
        period: cas,
        shift: smena,
        subjectId,
        room: kabinet
    });

    sacuvajPodatke();
    zatvoriModalRaspored();
    azurirajPretraguPredmeta();
    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
    azurirajPrintZaglavlje();
    azurirajPodnozje();
    prikaziToast('Čas sačuvan!', 'uspeh');
}

function obrisiStavkuRasporeda() {
    if (stanje.editingSchedule && stanje.editingSchedule.id) {
        podaciAplikacije.schedule = podaciAplikacije.schedule.filter(s => s.id !== stanje.editingSchedule.id);
        sacuvajPodatke();
        zatvoriModalRaspored();
        azurirajPretraguPredmeta();
        prikaziDesktopRaspored();
        prikaziMobilniRaspored();
        azurirajPrintZaglavlje();
        azurirajPodnozje();
        prikaziToast('Čas obrisan!', 'uspeh');
    }
}

function otvoriModalGrupnaIzmena() {
    if (!stanje.izabraniSlotovi.size) {
        prikaziToast('Prvo izaberite bar jedan čas u tabeli!', 'greska');
        return;
    }
    stanje.grupnaIzmena = { subjectId: '' };

    document.getElementById('giPromeniPredmet').checked = true;
    document.getElementById('giPromeniKabinet').checked = false;
    document.getElementById('giKabinet').value = '';
    const pretraga = document.getElementById('giPretraga');
    if (pretraga) pretraga.value = '';

    renderujBiracGrupne();
    azurirajGiPolja();
    azurirajGiInfo();
    otvoriModal('modalGrupnaIzmena');
    setTimeout(() => { const el = document.getElementById('giPretraga'); if (el) el.focus(); }, 80);
}

function zatvoriModalGrupnaIzmena() {
    zatvoriModal('modalGrupnaIzmena');
    stanje.grupnaIzmena = null;
}

function otvoriModalPredmetIzGrupne() {
    zatvoriModal('modalGrupnaIzmena');
    otvoriModalPredmet();
}

function sacuvajGrupnuIzmenu() {
    const menjaPredmet = document.getElementById('giPromeniPredmet').checked;
    const menjaKabinet = document.getElementById('giPromeniKabinet').checked;
    const predmetId = stanje.grupnaIzmena ? stanje.grupnaIzmena.subjectId : '';

    if (!menjaPredmet && !menjaKabinet) {
        prikaziToast('Označite šta menjate / predmet i/ili kabinet!', 'greska');
        return;
    }
    if (menjaPredmet && !predmetId) {
        prikaziToast('Izaberite predmet!', 'greska');
        const kont = document.getElementById('biracGrupne');
        if (kont) {
            kont.classList.remove('bp-greska');
            void kont.offsetWidth;
            kont.classList.add('bp-greska');
        }
        return;
    }

    const kabinet = document.getElementById('giKabinet').value.trim();
    const smena = podaciAplikacije.settings.currentShift;
    let promenjeno = 0;

    [...stanje.izabraniSlotovi].forEach(kljuc => {
        const [dan, cas] = kljuc.split('-').map(Number);
        const postojeca = podaciAplikacije.schedule.find(s =>
            s.day === dan && s.period === cas && s.shift === smena);

        if (!menjaPredmet && !postojeca) return;

        if (postojeca) {
            podaciAplikacije.schedule = podaciAplikacije.schedule.filter(s => s !== postojeca);
        }
        podaciAplikacije.schedule.push({
            id: postojeca ? postojeca.id : generisiId(),
            day: dan,
            period: cas,
            shift: smena,
            subjectId: menjaPredmet ? predmetId : postojeca.subjectId,
            room: menjaKabinet ? kabinet : (postojeca ? postojeca.room : '')
        });
        promenjeno++;
    });

    sacuvajPodatke();
    zatvoriModalGrupnaIzmena();
    azurirajPretraguPredmeta();
    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
    azurirajPrintZaglavlje();
    azurirajPodnozje();
    prikaziToast(`Ažurirano ${promenjeno} ${pluralCasovi(promenjeno)}!`, 'uspeh');
}

function otvoriModalBeleska(id = null) {
    const beleska = id ? podaciAplikacije.notes.find(n => n.id === id) : null;
    stanje.editingNote = beleska || {
        id: '',
        title: '',
        content: '',
        type: 'ostalo',
        date: formatirajDatumISO(stanje.selectedDate),
        subjectId: '',
        completed: false,
        pinned: false
    };

    document.getElementById('naslovModalBeleska').textContent = beleska ? 'Izmeni belešku' : 'Nova beleška';
    document.getElementById('beleskaNaslov').value = stanje.editingNote.title;
    document.getElementById('beleskaTip').value = stanje.editingNote.type;
    document.getElementById('beleskaDatum').value = stanje.editingNote.date;
    document.getElementById('beleskaOpis').value = stanje.editingNote.content || '';
    const chkZakaci = document.getElementById('beleskaZakaci');
    if (chkZakaci) chkZakaci.checked = stanje.editingNote.pinned === true;
    document.getElementById('dugmeObrisiBelesku').style.display = beleska ? 'inline-flex' : 'none';

    const selektPredmeta = document.getElementById('beleskaPredmet');
    selektPredmeta.innerHTML = '<option value="">-- Bez predmeta --</option>' +
        podaciAplikacije.settings.subjects.map(s =>
            `<option value="${esc(s.id)}" ${s.id === stanje.editingNote.subjectId ? 'selected' : ''}>${esc(s.name)}</option>`
        ).join('');

    otvoriModal('modalBeleska');
    setTimeout(() => document.getElementById('beleskaNaslov').focus(), 80);
}

function zatvoriModalBeleska() {
    zatvoriModal('modalBeleska');
    stanje.editingNote = null;
}

function sacuvajBelesku() {
    const naslov = document.getElementById('beleskaNaslov').value.trim();
    if (!naslov) {
        prikaziToast('Unesite naslov!', 'greska');
        return;
    }

    const podaciBeleske = {
        id: stanje.editingNote.id || generisiId(),
        title: naslov,
        content: document.getElementById('beleskaOpis').value.trim(),
        type: document.getElementById('beleskaTip').value,
        date: document.getElementById('beleskaDatum').value || formatirajDatumISO(new Date()),
        subjectId: document.getElementById('beleskaPredmet').value || undefined,
        completed: stanje.editingNote.completed || false,
        pinned: !!(document.getElementById('beleskaZakaci') || {}).checked
    };

    if (stanje.editingNote.id) {
        podaciAplikacije.notes = podaciAplikacije.notes.filter(n => n.id !== stanje.editingNote.id);
    }
    podaciAplikacije.notes.push(podaciBeleske);

    sacuvajPodatke();
    zatvoriModalBeleska();
    azurirajPrikazeBeleski();
    prikaziKalendar();
    prikaziToast('Beleška sačuvana!', 'uspeh');
}

function otvoriModalPredmet(id = null) {
    const predmet = id ? dobijPredmet(id) : null;
    stanje.editingSubject = predmet || { id: '', name: '', color: '#0d9488', teacher: '' };

    document.getElementById('naslovModalPredmet').textContent = predmet ? 'Izmeni predmet' : 'Dodaj predmet';
    document.getElementById('predmetNaziv').value = stanje.editingSubject.name;
    document.getElementById('predmetBoja').value = stanje.editingSubject.color;
    document.getElementById('predmetNastavnik').value = stanje.editingSubject.teacher || '';
    document.getElementById('dugmeObrisiPredmet').style.display = predmet ? 'inline-flex' : 'none';

    document.querySelectorAll('#modalPredmet .boja-preset').forEach(dugme => {
        dugme.classList.toggle('aktivan', dugme.dataset.color.toLowerCase() === String(stanje.editingSubject.color).toLowerCase());
    });

    otvoriModal('modalPredmet');
    setTimeout(() => document.getElementById('predmetNaziv').focus(), 80);
}

function zatvoriModalPredmet() {
    zatvoriModal('modalPredmet');
    stanje.editingSubject = null;
}

function sacuvajPredmet() {
    const naziv = document.getElementById('predmetNaziv').value.trim();
    if (!naziv) {
        prikaziToast('Unesite naziv predmeta!', 'greska');
        return;
    }

    const podaciPredmeta = {
        id: stanje.editingSubject.id || generisiId(),
        name: naziv,
        color: document.getElementById('predmetBoja').value,
        teacher: document.getElementById('predmetNastavnik').value.trim()
    };

    if (stanje.editingSubject.id) {
        const indeks = podaciAplikacije.settings.subjects.findIndex(s => s.id === stanje.editingSubject.id);
        if (indeks !== -1) {
            podaciAplikacije.settings.subjects[indeks] = podaciPredmeta;
        }
    } else {
        podaciAplikacije.settings.subjects.push(podaciPredmeta);
    }

    sacuvajPodatke();
    zatvoriModalPredmet();
    prikaziDesktopRaspored();
    prikaziMobilniRaspored();
    prikaziBeleske();
    azurirajPodnozje();
    prikaziToast('Predmet sačuvan!', 'uspeh');
}

function obrisiPredmet() {
    if (!stanje.editingSubject || !stanje.editingSubject.id) return;

    prikaziPotvrdu('Da li ste sigurni da želite da obrišete ovaj predmet? Biće uklonjen iz rasporeda.', (potvrdjeno) => {
        if (!potvrdjeno) return;
        const id = stanje.editingSubject.id;
        podaciAplikacije.settings.subjects = podaciAplikacije.settings.subjects.filter(s => s.id !== id);
        podaciAplikacije.schedule = podaciAplikacije.schedule.filter(s => s.subjectId !== id);
        podaciAplikacije.notes.forEach(n => {
            if (n.subjectId === id) n.subjectId = undefined;
        });
        sacuvajPodatke();
        zatvoriModalPredmet();
        prikaziDesktopRaspored();
        prikaziMobilniRaspored();
        prikaziBeleske();
        azurirajPodnozje();
        prikaziToast('Predmet obrisan!', 'uspeh');
    });
}

function prikaziPotvrdu(poruka, callback) {
    document.getElementById('tekstPotvrde').textContent = poruka;
    stanje.confirmCallback = callback;
    otvoriModal('modalPotvrda');
}

function zatvoriModalPotvrde() {
    zatvoriModal('modalPotvrda');
    stanje.confirmCallback = null;
}
