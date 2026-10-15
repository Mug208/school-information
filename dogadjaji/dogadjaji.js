'use strict';
function initDogadjaji() {
    inicijalizujTajnuAktivaciju();

        document.querySelectorAll('.nav-dugme, .mobilni-nav-dugme').forEach(dugme => {
        dugme.addEventListener('click', () => prebaciTab(dugme.dataset.tab));
    });

    document.getElementById('dugmeMobilniMeni').addEventListener('click', prebaciMobilniMeni);
    document.getElementById('dugmeTema').addEventListener('click', promeniTemu);

        document.getElementById('dugmePodesavanja').addEventListener('click', () => {
        if (window.BIOS && typeof window.BIOS.otvori === 'function') {
            window.BIOS.otvori();
        } else {
            prikaziToast('BIOS modul nije dostupan.', 'greska');
        }
    });

        const dugmeKomande = document.getElementById('dugmeKomande');
    if (dugmeKomande) dugmeKomande.addEventListener('click', kpPreklopi);

    const kpUnos = document.getElementById('kpUnos');
    if (kpUnos) {
        kpUnos.addEventListener('input', () => { kpStanje.indeks = 0; kpRender(); });
        kpUnos.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); kpPomeri(1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); kpPomeri(-1); }
            else if (e.key === 'Enter') { e.preventDefault(); kpIzvrsi(); }
            else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); kpZatvori(); }
            else if (e.key === 'Home') { e.preventDefault(); if (kpStanje.filtrirane.length) { kpStanje.indeks = 0; kpRender(); } }
            else if (e.key === 'End') { e.preventDefault(); if (kpStanje.filtrirane.length) { kpStanje.indeks = kpStanje.filtrirane.length - 1; kpRender(); } }
        });
    }

    const kpOverlayEl = document.getElementById('kpOverlay');
    if (kpOverlayEl) {
        kpOverlayEl.addEventListener('click', (e) => {
            if (e.target === kpOverlayEl || e.target.closest('[data-kp-zatvori]')) { kpZatvori(); return; }
            const stavka = e.target.closest('.kp-stavka');
            if (stavka) {
                kpStanje.indeks = parseInt(stavka.dataset.i, 10) || 0;
                kpIzvrsi();
            }
        });
    }

    const kpListaEl = document.getElementById('kpLista');
    if (kpListaEl) {
        kpListaEl.addEventListener('mouseover', (e) => {
            const stavka = e.target.closest('.kp-stavka');
            if (!stavka) return;
            const i = parseInt(stavka.dataset.i, 10);
            if (i !== kpStanje.indeks) {
                kpStanje.indeks = i;
                kpListaEl.querySelectorAll('.kp-stavka').forEach(el => {
                    const izabrana = parseInt(el.dataset.i, 10) === i;
                    el.classList.toggle('izabrana', izabrana);
                    el.setAttribute('aria-selected', String(izabrana));
                });
            }
        });
    }

        document.getElementById('dugmePredhodniDan').addEventListener('click', () => promeniDan(-1));
    document.getElementById('dugmeSledeciDan').addEventListener('click', () => promeniDan(1));
    document.getElementById('selektorDana').addEventListener('change', (e) => {
        stanje.selectedDay = parseInt(e.target.value, 10);
        stanje.izabranaKolona = stanje.selectedDay;
        prikaziMobilniRaspored();
        prikaziDesktopRaspored();
    });

    const ppUnosEl = document.getElementById('ppUnos');
    if (ppUnosEl) {
        ppUnosEl.addEventListener('input', azurirajPretraguPredmeta);
        ppUnosEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                zatvoriPretraguPredmeta();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                ppUnosEl.blur();
            }
        });
    }
    const ppZatvoriEl = document.getElementById('ppZatvori');
    if (ppZatvoriEl) ppZatvoriEl.addEventListener('click', zatvoriPretraguPredmeta);
    document.querySelectorAll('#dugmePretragaPredmeta, .dugmePretragaPredmetaMobilni').forEach(d => {
        d.addEventListener('click', preklopiPretraguPredmeta);
    });

        document.getElementById('zatvoriModalRaspored').addEventListener('click', zatvoriModalRaspored);
    document.getElementById('dugmeOtkaziRaspored').addEventListener('click', zatvoriModalRaspored);
    document.getElementById('dugmeSacuvajRaspored').addEventListener('click', sacuvajRaspored);
    document.getElementById('dugmeObrisiRaspored').addEventListener('click', () => {
        prikaziPotvrdu('Da li ste sigurni da želite da obrišete ovaj čas?', (potvrdjeno) => {
            if (!potvrdjeno) return;
            obrisiStavkuRasporeda();
        });
    });

    document.querySelectorAll('#dugmeMultiSelect, .dugmeMultiSelectMobilni').forEach(d => {
        d.addEventListener('click', () => preklopiMultiSelect());
    });
    const msZatvoriEl = document.getElementById('msZatvori');
    if (msZatvoriEl) msZatvoriEl.addEventListener('click', () => preklopiMultiSelect(false));
    const msSveEl = document.getElementById('msSve');
    if (msSveEl) msSveEl.addEventListener('click', izaberiSveSlotove);
    const msNistaEl = document.getElementById('msNista');
    if (msNistaEl) msNistaEl.addEventListener('click', ocistiIzborSlotova);
    const msIzmeniEl = document.getElementById('msIzmeni');
    if (msIzmeniEl) msIzmeniEl.addEventListener('click', otvoriModalGrupnaIzmena);
    const msObrisiEl = document.getElementById('msObrisi');
    if (msObrisiEl) msObrisiEl.addEventListener('click', obrisiIzabraneSlotove);

    document.getElementById('zatvoriModalGrupnaIzmena').addEventListener('click', zatvoriModalGrupnaIzmena);
    document.getElementById('dugmeOtkaziGrupnu').addEventListener('click', zatvoriModalGrupnaIzmena);
    document.getElementById('dugmeSacuvajGrupnu').addEventListener('click', sacuvajGrupnuIzmenu);
    document.getElementById('giPromeniPredmet').addEventListener('change', azurirajGiPolja);
    document.getElementById('giPromeniKabinet').addEventListener('change', azurirajGiPolja);

    const giPretragaEl = document.getElementById('giPretraga');
    if (giPretragaEl) {
        giPretragaEl.addEventListener('input', renderujBiracGrupne);
        giPretragaEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const dugmad = document.querySelectorAll('#biracGrupne .bp-predmet');
                if (dugmad.length === 1) dugmad[0].click();
                else if (dugmad.length > 1) dugmad[0].focus();
            }
        });
    }

        const pretragaPredmetaEl = document.getElementById('pretragaPredmeta');
    if (pretragaPredmetaEl) {
        pretragaPredmetaEl.addEventListener('input', renderujBiracPredmeta);
        pretragaPredmetaEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const dugmad = document.querySelectorAll('#biracPredmeta .bp-predmet');
                if (dugmad.length === 1) dugmad[0].click();
                else if (dugmad.length > 1) dugmad[0].focus();
            }
        });
    }
    document.getElementById('rasporedDan').addEventListener('change', azurirajInfoSlota);
    document.getElementById('rasporedCas').addEventListener('change', azurirajInfoSlota);

        document.getElementById('dugmeDodajBelesku').addEventListener('click', () => otvoriModalBeleska());
    document.getElementById('dugmeNovaBeleska').addEventListener('click', () => otvoriModalBeleska());
    document.getElementById('zatvoriModalBeleska').addEventListener('click', zatvoriModalBeleska);
    document.getElementById('dugmeOtkaziBelesku').addEventListener('click', zatvoriModalBeleska);
    document.getElementById('dugmeSacuvajBelesku').addEventListener('click', sacuvajBelesku);
    document.getElementById('dugmeObrisiBelesku').addEventListener('click', () => {
        prikaziPotvrdu('Da li ste sigurni da želite da obrišete ovu belešku?', (potvrdjeno) => {
            if (!potvrdjeno) return;
            if (stanje.editingNote && stanje.editingNote.id) {
                const id = stanje.editingNote.id;
                podaciAplikacije.notes = podaciAplikacije.notes.filter(n => n.id !== id);
                sacuvajPodatke();
                azurirajPrikazeBeleski();
                prikaziToast('Beleška obrisana.', 'uspeh');
            }
            zatvoriModalBeleska();
        });
    });

        document.querySelectorAll('.filter-dugme').forEach(dugme => {
        dugme.addEventListener('click', () => postaviFilter(dugme.dataset.filter));
    });

        const unosPretrage = document.getElementById('pretragaBeleske');
    if (unosPretrage) {
        unosPretrage.addEventListener('input', (e) => postaviPretragu(e.target.value));

        unosPretrage.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && e.target.value) {
                e.stopPropagation();
                e.preventDefault();
                ocistiPretragu();
            }
        });
    }
    const dugmeOcistiPretragu = document.getElementById('dugmeOcistiPretragu');
    if (dugmeOcistiPretragu) {
        dugmeOcistiPretragu.addEventListener('click', () => {
            ocistiPretragu();
            if (unosPretrage) unosPretrage.focus();
        });
    }

            ['#dugmeStampaj', '.dugmeStampajMobilni'].forEach(sel => {
        const dugme = document.querySelector(sel);
        if (dugme) {
            dugme.addEventListener('click', () => {
                prikaziToast('Priprema za štampu… (cela nedelja)', 'info');
                setTimeout(() => window.print(), 150);
            });
        }
    });

        document.getElementById('dugmeObrisiPredmet').addEventListener('click', obrisiPredmet);
    document.getElementById('zatvoriModalPredmet').addEventListener('click', zatvoriModalPredmet);
    document.getElementById('dugmeOtkaziPredmet').addEventListener('click', zatvoriModalPredmet);
    document.getElementById('dugmeSacuvajPredmet').addEventListener('click', sacuvajPredmet);

        document.querySelectorAll('#modalPredmet .boja-preset').forEach(dugme => {
        dugme.addEventListener('click', () => {
            document.getElementById('predmetBoja').value = dugme.dataset.color;
            document.querySelectorAll('#modalPredmet .boja-preset').forEach(b => b.classList.remove('aktivan'));
            dugme.classList.add('aktivan');
        });
    });

        document.getElementById('inputUvoz').addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            uveziPodatkeIzFajla(e.target.files[0], stanje.uvozMod);
        }
    });

        document.getElementById('dugmePotvrdaOtkazi').addEventListener('click', () => {
        const cb = stanje.confirmCallback;
        zatvoriModalPotvrde();
        if (cb) cb(false);
    });
    document.getElementById('dugmePotvrdaOk').addEventListener('click', () => {
        const cb = stanje.confirmCallback;
        zatvoriModalPotvrde();
        if (cb) cb(true);
    });

        const dugmeObavestenja = document.getElementById('dugmeObavestenja');
    dugmeObavestenja.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('dropdownObavestenja');
        const otvoren = dropdown.classList.toggle('prikazi');
        dugmeObavestenja.setAttribute('aria-expanded', String(otvoren));
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.obavestenje-wrapper')) {
            zatvoriObavestenja();
        }
        if (!e.target.closest('#mobilniMeni') && !e.target.closest('#dugmeMobilniMeni')) {
            document.getElementById('mobilniMeni').classList.remove('prikazi');
        }
    });

        document.querySelectorAll('.modal-prekrivac').forEach(prekrivac => {
        prekrivac.addEventListener('click', () => {
            const modal = prekrivac.closest('.modal');
            if (modal && modal.id === 'modalPotvrda') {
                const cb = stanje.confirmCallback;
                zatvoriModalPotvrde();
                if (cb) cb(false);
            } else if (modal) {
                modal.classList.remove('prikazi');
            }
        });
    });

        document.addEventListener('keydown', (e) => {
        const biosOtvoren = window.BIOS && typeof window.BIOS.otvoren === 'function' && window.BIOS.otvoren();
        if (biosOtvoren) return;

                if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (window.KomandnaPaleta) window.KomandnaPaleta.preklopi();
            return;
        }

                if (window.KomandnaPaleta && window.KomandnaPaleta.otvorena()) {
            if (e.key === 'Escape') { e.preventDefault(); window.KomandnaPaleta.zatvori(); }
            return;
        }

        const t = e.target;
        const uPolju = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);

        if (e.key === 'Escape') {
            const otvorenModal = document.querySelector('.modal.prikazi');
            if (otvorenModal) {
                if (otvorenModal.id === 'modalPotvrda') {
                    const cb = stanje.confirmCallback;
                    zatvoriModalPotvrde();
                    if (cb) cb(false);
                } else {
                    otvorenModal.classList.remove('prikazi');
                    if (otvorenModal.id === 'modalGrupnaIzmena') stanje.grupnaIzmena = null;
                }
            } else if (stanje.multiSelect) {

                preklopiMultiSelect(false);
            } else {
                document.querySelectorAll('.modal.prikazi').forEach(modal => {
                    if (modal.id === 'modalPotvrda') {
                        const cb = stanje.confirmCallback;
                        zatvoriModalPotvrde();
                        if (cb) cb(false);
                    } else {
                        modal.classList.remove('prikazi');
                    }
                });
            }
            return;
        }

                if (e.key === 'Delete' && !uPolju && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const modalOtvoren = document.querySelector('.modal.prikazi');
            if (!modalOtvoren && window.BIOS && typeof window.BIOS.otvori === 'function') {
                e.preventDefault();
                window.BIOS.otvori();
            }
            return;
        }

                if (uPolju || e.ctrlKey || e.metaKey || e.altKey) return;
        if (document.querySelector('.modal.prikazi')) return;

                        const sekvencaUToku = tajnaIndeks > 0;

        switch (e.key) {
            case '1': prebaciTab('raspored'); break;
            case '2': prebaciTab('kalendar'); break;
            case '3': prebaciTab('beleske'); break;
            case 'n': case 'N':
                if (!sekvencaUToku && stanje.currentTab === 'beleske') otvoriModalBeleska();
                break;
            case '/':
                e.preventDefault();
                if (stanje.currentTab !== 'beleske') prebaciTab('beleske');
                setTimeout(() => {
                    const unos = document.getElementById('pretragaBeleske');
                    if (unos) unos.focus();
                }, 0);
                break;
            case '?':
                prikaziToast(TEKST_PRECICA, 'info');
                break;
            case 'h': case 'H':
                if (!sekvencaUToku) prikaziToast(TEKST_PRECICA, 'info');
                break;
            case 't': case 'T':
                if (!sekvencaUToku) promeniTemu();
                break;
            case 's': case 'S':

                if (!sekvencaUToku) otvoriPretraguPredmeta();
                break;
            case 'm': case 'M':
                if (!sekvencaUToku) otvoriMultiSelect();
                break;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    ucitajPodatke();
    prikaziSve();
    initDogadjaji();
    pokreniSat();
    azurirajAutoSmenu();
    setInterval(azurirajAutoSmenu, 60000);

    if (window.codeEngine && typeof window.codeEngine.init === 'function') {
        try { window.codeEngine.init(); } catch (e) {  }
    }
    primeniTemu();
});
