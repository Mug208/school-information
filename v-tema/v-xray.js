// VirusTema: rendgen prikaz elemenata.
'use strict';
    var DomRengen = (function () {

        var CILJEVI = '#dugmeTema, #dugmeKomande, #dugmePodesavanja, #dugmeObavestenja, ' +
                      '#logoIkona, #nazivSkole, #nazivRazreda, ' +
                      '.nav-dugme, .mobilni-nav-dugme, .filter-dugme, .dugme, ' +

                      '.celija-zaglavlja, .celija-vremena, .celija-rasporeda, .red-pauze, ' +

                      '.stavka-rasporeda, ' +

                      '#dugmeMultiSelect, #multiSelectBar, #biracGrupne, #giPretraga, #giKabinet, ' +

                      '.bp-predmet, #biracPredmeta, #infoSlota, ' +
                      '#rasporedDan, #rasporedCas, #rasporedKabinet, #pretragaPredmeta, ' +

                      '#pretragaBeleske, #ppUnos, #selektorDana, ' +

                      '.kartica';

        var cvor = null;
        var cilj = null;
        var tajmer = 0;
        var rafOznaka = 0;
        var aktivan = false;
        var poslednjiTekst = '';

        // ===== OZNAKE ELEMENATA =====
        function tekstOznake(el) {
            if (el.id) return '#' + el.id;
            var klase = (el.className || '').toString().split(/\s+/).filter(Boolean);
            if (klase.length) return '.' + klase.slice(0, 2).join('.');
            return '<' + el.tagName.toLowerCase() + '>';
        }

        function jecode() {
            return document.body.classList.contains('code-tema');
        }

        // ===== PRIKAZ I DOGADJAJI =====
        function postavi() {
            if (!cvor || !cilj || !fx) return;
            var s = fx.getBoundingClientRect();
            var r = cilj.getBoundingClientRect();
            var w = cvor.offsetWidth || 90;
            var h = cvor.offsetHeight || 22;
            var RAZMAK = 7;

            var levo = r.left - s.left + (r.width - w) / 2;
            if (levo < 8) levo = 8;
            if (levo > s.width - w - 8) levo = s.width - w - 8;

            var gore = r.top - s.top - h - RAZMAK;
            var ispod = false;
            if (gore < 8) {
                gore = r.bottom - s.top + RAZMAK;
                ispod = true;
            }
            if (gore < 8) gore = 8;
            if (gore > s.height - h - 8) gore = Math.max(8, s.height - h - 8);

            cvor.classList.toggle('ispod', ispod);
            cvor.style.left = Math.round(levo) + 'px';
            cvor.style.top = Math.round(gore) + 'px';
        }

        function pokazi(novi) {

            if (tajmer) { clearTimeout(tajmer); tajmer = 0; }

            var tekst = tekstOznake(novi);

            if (!cvor) {
                cvor = document.createElement('span');
                cvor.className = 'dom-tag';
                cvor.setAttribute('aria-hidden', 'true');
                fx.appendChild(cvor);
            }

            if (cilj && cilj !== novi) cilj.classList.remove('dom-inspekcija');
            cilj = novi;
            cilj.classList.add('dom-inspekcija');

            cvor.textContent = tekst;
            postavi();
            cvor.classList.add('ziv');
            if (poslednjiTekst !== tekst) skrambl(cvor, tekst, 260);
            poslednjiTekst = tekst;
        }

        function sakrij(odmah) {
            if (tajmer) { clearTimeout(tajmer); tajmer = 0; }
            if (!cvor) return;
            if (cilj) cilj.classList.remove('dom-inspekcija');
            cilj = null;

            var c = cvor;
            var ugasi = function () { c.classList.remove('ziv'); };
            if (odmah) ugasi();
            else tajmer = setTimeout(ugasi, 130);
        }

        var cekanjeUlaza = 0;

        function naUlaz(e) {
            if (!jecode()) return;
            var t = e.target;
            if (!t || !t.closest || t === document.body) return;
            if (cekanjeUlaza) return;
            cekanjeUlaza = requestAnimationFrame(function () {
                cekanjeUlaza = 0;
                if (!t.isConnected) return;
                var c = t.closest(CILJEVI);
                if (c === cilj) return;
                if (c) pokazi(c);
                else sakrij();
            });
        }

        function naIzlaz(e) {
            if (!cilj) return;
            var ka = e.relatedTarget;
            if (ka && cilj.contains(ka)) return;
            sakrij();
        }

        function naSkrol() {
            if (!cvor || !cvor.classList.contains('ziv') || rafOznaka) return;
            rafOznaka = requestAnimationFrame(function () {
                rafOznaka = 0;
                postavi();
            });
        }

        function ukljuci() {
            if (aktivan || !fx) return;
            aktivan = true;
            document.addEventListener('mouseover', naUlaz);
            document.addEventListener('mouseout', naIzlaz);
            window.addEventListener('scroll', naSkrol, true);
        }

        return {
            ukljuci: ukljuci,
            sakrij: sakrij
        };
    })();
