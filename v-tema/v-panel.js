'use strict';
    var IMENA_EFEKATA = [
        ['scanlines', 'Sken linije (CRT)'],
        ['flicker', 'CRT treperenje'],
        ['invert', 'Invertovanje boja (kratko)'],
        ['rain', 'Digitalna kiša (matrix)'],
        ['corruption', 'Korupcija teksta']
    ];

    function podesavanjaAplikacije() {
        try {
            if (window.App && typeof window.App.getPodesavanja === 'function') {
                return window.App.getPodesavanja() || {};
            }
        } catch (e) { }
        return {};
    }

    function efektiPanel() {
        if (document.getElementById('vt-efekti-sloj')) return;

        var s = podesavanjaAplikacije();
        var ef = s.effects || {};
        var intenzitet = Math.max(1, Math.min(10, parseInt(ef.intensity, 10) || 5));
        var anim = s.animTema !== false;

        var ukljuceni = [];
        for (var i = 0; i < IMENA_EFEKATA.length; i++) {
            if (ef[IMENA_EFEKATA[i][0]] === true) ukljuceni.push(IMENA_EFEKATA[i][1]);
        }
        var efektiTekst = ukljuceni.length
            ? 'uključeni: ' + ukljuceni.join(' · ')
            : 'svi ISKLJUČENI / radi performansi; uključuju se pojedinačno';

        var noviSloj = document.createElement('div');
        noviSloj.id = 'vt-efekti-sloj';
        noviSloj.innerHTML =
            '<div class="eo-prozor" role="dialog" aria-modal="true" aria-labelledby="vt-eo-naslov">' +
              '<div class="eo-zaglavlje">' +
                '<span class="eo-naslov" id="vt-eo-naslov">&gt;_ CODE / DODATNA PODEŠAVANJA</span>' +
                '<button type="button" class="eo-zatvori" id="vt-eo-zatvori" aria-label="Zatvori obaveštenje">✕</button>' +
              '</div>' +
              '<div class="eo-telo">' +
                '<p class="eo-intro">CODE mod je aktivan. Sve dodatno se podešava u <b>BIOS → Efekti</b>:</p>' +
                '<ul class="eo-lista">' +
                  '<li><b>CODE tema</b><span>uključi / isključi (prečica: CODES)</span></li>' +
                  '<li><b>Animacija promene teme</b><span>trenutno: ' + (anim ? 'UKLJUČENA' : 'ISKLJUČENA') + ' / isključena menja temu trenutno, bez animacije</span></li>' +
                  '<li><b>Intenzitet efekata</b><span>trenutno: ' + intenzitet + '/10 / koliko jako efekti utiču na stranicu</span></li>' +
                  '<li><b>Boja teme (fosfor) + preseti</b><span>zelena · plava · cijan · žuta · crvena · magenta · bela</span></li>' +
                  '<li><b>5 CODE efekata</b><span>Sken linije (CRT) · CRT treperenje · Invertovanje boja (kratko) · Digitalna kiša (matrix) · Korupcija teksta / trenutno: ' + efektiTekst + '</span></li>' +
                '</ul>' +
                '<p class="eo-upozorenje">⚠ Pažnja: uključeni efekti mogu uticati na performanse (naročito na slabijim računarima) / zato su podrazumevano isključeni.</p>' +
                '<p class="eo-xray">Bonus: u ovoj temi pređite mišem preko dugmadi, tabova, tabele rasporeda ili logotipa / iznad elementa se pojavljuje oznaka sa njegovim <b>#id</b> / <b>.klasama</b> (DOM x-ray inspekcija).</p>' +
              '</div>' +
              '<div class="eo-footer">' +
                '<button type="button" class="eo-dugme" id="vt-eo-bios">Otvori BIOS → Efekti</button>' +
                '<button type="button" class="eo-dugme eo-glavni" id="vt-eo-uredu">U redu</button>' +
              '</div>' +
            '</div>';

        document.body.appendChild(noviSloj);

        function zatvoriEO() {
            document.removeEventListener('keydown', naEscape, true);
            var el = document.getElementById('vt-efekti-sloj');
            if (!el) return;
            el.classList.add('vt-eo-zatvara');
            setTimeout(function () { el.remove(); }, 190);
        }

        function naEscape(e) {
            if (e.key === 'Escape') zatvoriEO();
        }

        document.getElementById('vt-eo-uredu').addEventListener('click', zatvoriEO);
        document.getElementById('vt-eo-zatvori').addEventListener('click', zatvoriEO);
        document.getElementById('vt-eo-bios').addEventListener('click', function () {
            zatvoriEO();
            try {
                if (window.BIOS && typeof window.BIOS.otvori === 'function') {
                    window.BIOS.otvori('efekti');
                }
            } catch (e) { }
        });
        document.addEventListener('keydown', naEscape, true);

        var fokus = document.getElementById('vt-eo-uredu');
        if (fokus) {
            try { fokus.focus(); } catch (e) { }
        }
    }
