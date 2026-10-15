'use strict';

function panelBoje(red) {
    var gx = red.vrsta === 'gxboja';
    var bezbedna = gx ? bezbednaBojaGx : bezbednaBoja;
    var trenutna = bezbedna(red.get());

    var preseti = gx
        ? codeBojeLista().map(function (b) {
              return { naziv: b.naziv, hex: bezbednaBojaGx(b.hex) };
          })
        : [
              { naziv: 'Crvena', hex: '#ef4444' },
              { naziv: 'Narandž.', hex: '#f59e0b' },
              { naziv: 'Žuta', hex: '#eab308' },
              { naziv: 'Zelena', hex: '#22c55e' },
              { naziv: 'Tirkizna', hex: '#0d9488' },
              { naziv: 'Plava', hex: '#3b82f6' },
              { naziv: 'Ljubič.', hex: '#8b5cf6' },
              { naziv: 'Roze', hex: '#ec4899' }
          ];

    var mreza,
        pregledUzorak,
        pregledHex,
        hsvBirac = null;

    function upisi(hex) {
        trenutna = bezbedna(hex);
        red.set(trenutna);
        var el = redElement(red.id);
        if (el) {
            var vEl = el.querySelector('.bios-red-vrednost');
            if (vEl) postaviVrednost(vEl, red);
        }
    }

    function azuriraj() {
        if (mreza) {
            svi('.sp-sw', mreza).forEach(function (b) {
                b.classList.toggle('aktivan', b.getAttribute('data-hex').toLowerCase() === trenutna.toLowerCase());
            });
        }
        if (pregledUzorak) {
            pregledUzorak.style.background = trenutna;
            pregledUzorak.textContent = 'PRIMENA ' + trenutna.toUpperCase();
        }
        if (pregledHex) pregledHex.textContent = trenutna.toUpperCase();
    }

    otvoriSidePanel({
        naslov: gx ? 'BOJA FOSFORA / IZGLED TEME' : 'BOJA AKCENTA',
        fokus: '.gxb-sv',
        render: function (sadrzaj, footer) {
            hsvBirac = napraviHsvBirac(sadrzaj, trenutna, function (hex) {
                upisi(hex);
                azuriraj();
            });

            var sekP = document.createElement('div');
            sekP.className = 'sp-sekcija';
            sekP.textContent = 'PRESETI';
            sadrzaj.appendChild(sekP);

            mreza = document.createElement('div');
            mreza.className = 'sp-boje';
            preseti.forEach(function (p) {
                var b = document.createElement('button');
                b.type = 'button';
                b.className = 'sp-sw';
                b.setAttribute('data-hex', p.hex);
                b.style.background = p.hex;
                b.title = p.naziv + ' / ' + p.hex.toUpperCase();
                b.setAttribute('aria-label', p.naziv + ' ' + p.hex.toUpperCase());
                var n = document.createElement('span');
                n.className = 'sp-sw-naziv';
                n.textContent = p.naziv;
                b.appendChild(n);
                b.addEventListener('click', function () {
                    if (hsvBirac) hsvBirac.setHex(p.hex);
                });
                mreza.appendChild(b);
            });
            sadrzaj.appendChild(mreza);

            var pregled = document.createElement('div');
            pregled.className = 'sp-pregled';
            pregledUzorak = document.createElement('div');
            pregledUzorak.className = 'sp-pregled-uzorak';
            pregledHex = document.createElement('span');
            pregledHex.className = 'sp-hex';
            pregled.appendChild(pregledUzorak);
            pregled.appendChild(pregledHex);
            sadrzaj.appendChild(pregled);

            var napomena = document.createElement('span');
            napomena.className = 'bios-dialog-napomena';
            napomena.textContent = gx
                ? radna && radna.codeTheme
                    ? 'Promena boje se VIDI ODMAH na temi iza BIOS-a (F10 čuva).'
                    : 'Boja/efekti se vide po uključenju code teme (F10 čuva).'
                : 'Boja akcenta se primenjuje na temu čuvanjem (F10).';
            sadrzaj.appendChild(napomena);

            var hint = document.createElement('span');
            hint.className = 'bios-side-hint';
            hint.innerHTML = '<kbd>ESC</kbd> Nazad &middot; promene odmah';
            footer.appendChild(hint);
            var dugmeZ = document.createElement('button');
            dugmeZ.type = 'button';
            dugmeZ.className = 'bios-dugme bios-dugme-glavni';
            dugmeZ.textContent = 'Zatvori';
            dugmeZ.addEventListener('click', zatvoriSidePanel);
            footer.appendChild(dugmeZ);

            azuriraj();
        }
    });
}

function prikaziDialog(podaci) {
    var dij = dom('biosDialog');
    if (!dij) return;
    dom('biosDialogNaslov').textContent = podaci.naslov || 'BIOS';
    dom('biosDialogSadrzaj').innerHTML = podaci.html || '';

    var kont = dom('biosDialogDugmad');
    kont.innerHTML = '';
    dijalogDugmad = [];
    (podaci.dugmad || []).forEach(function (d) {
        var b = document.createElement('button');
        b.className = 'bios-dugme' + (d.klasa ? ' ' + d.klasa : '');
        b.setAttribute('type', 'button');
        b.textContent = d.tekst;
        b.addEventListener('click', function () {
            if (!d.drzi) zatvoriDijalog();
            if (typeof d.onEnter === 'function') d.onEnter();
        });
        kont.appendChild(b);
        dijalogDugmad.push(b);
    });

    dij.removeAttribute('hidden');
    dialogOtvoren = true;

    if (typeof podaci.pripremi === 'function') {
        try {
            podaci.pripremi(dom('biosDialogSadrzaj'));
        } catch (e) {}
    }

    var cilj = null;
    if (typeof podaci.fokus === 'number') {
        cilj = dijalogDugmad[podaci.fokus] || null;
    } else if (podaci.fokus === 'sadrzaj') {
        cilj = dom('biosDialogSadrzaj').querySelector('input, button') || dijalogDugmad[0] || null;
    } else {
        cilj = kont.querySelector('.bios-dugme-glavni') || dijalogDugmad[0] || null;
    }
    if (cilj) cilj.focus();
}

function zatvoriDijalog() {
    var dij = dom('biosDialog');
    if (dij) dij.setAttribute('hidden', '');
    dialogOtvoren = false;
    dijalogDugmad = [];

    var f = redElement(izabraniId) || document.querySelector('#biosNav .bios-nav-dugme.aktivan');
    if (f && otvorenFlag) f.focus();
}

function rukujDijalogTaster(dog, izUnosa) {
    var k = dog.key || '';
    if (k === 'Escape' || k === 'Esc') {
        dog.preventDefault();
        if (dijalogDugmad.length) dijalogDugmad[dijalogDugmad.length - 1].click();
        return;
    }
    if (k === 'Enter') {
        dog.preventDefault();
        var a = document.activeElement;
        if (a && dijalogDugmad.indexOf(a) !== -1) {
            a.click();
            return;
        }
        var glavni = null;
        dijalogDugmad.forEach(function (b) {
            if (!glavni && b.className.indexOf('bios-dugme-glavni') !== -1) glavni = b;
        });
        (glavni || dijalogDugmad[0] || { click: function () {} }).click();
        return;
    }
    if (k === 'Tab') {
        dog.preventDefault();
        var fokusabilni = svi('.bios-dialog-kutija button, .bios-dialog-kutija input', dom('biosDialog'));
        if (!fokusabilni.length) return;
        var i = fokusabilni.indexOf(document.activeElement);
        var sled;
        if (dog.shiftKey) sled = i <= 0 ? fokusabilni.length - 1 : i - 1;
        else sled = i === -1 || i === fokusabilni.length - 1 ? 0 : i + 1;
        fokusabilni[sled].focus();
        return;
    }
    if (!izUnosa && (k === ' ' || k === 'Spacebar')) {
        dog.preventDefault();
        var sp = document.activeElement;
        if (sp && dijalogDugmad.indexOf(sp) !== -1) sp.click();
        return;
    }
    if (!izUnosa && (k === 'ArrowLeft' || k === 'ArrowRight')) {
        dog.preventDefault();
        if (!dijalogDugmad.length) return;
        var j = dijalogDugmad.indexOf(document.activeElement);
        var n;
        if (j === -1) n = k === 'ArrowRight' ? 0 : dijalogDugmad.length - 1;
        else
            n =
                k === 'ArrowRight'
                    ? (j + 1) % dijalogDugmad.length
                    : (j - 1 + dijalogDugmad.length) % dijalogDugmad.length;
        dijalogDugmad[n].focus();
        return;
    }
    if (!izUnosa) dog.preventDefault();
}

function dialogOdbijen() {
    prikaziDialog({
        naslov: 'PRISTUP ODBIJEN',
        html: 'CODE modul je zaključan.<br>Pronađite tajni kod...<br><span class="bios-dialog-napomena">(napomena: pokušajte nešto otkucati)</span>',
        dugmad: [{ tekst: 'RAZUMEM', klasa: 'bios-dugme-glavni' }]
    });
}

function pomocDijalog() {
    prikaziDialog({
        naslov: 'POMOĆ',
        html:
            '<ul class="bios-pomoc">' +
            '<li><kbd>↑</kbd><kbd>↓</kbd> izbor stavke</li>' +
            '<li><kbd>←</kbd><kbd>→</kbd> promena kategorije</li>' +
            '<li><kbd>+</kbd><kbd>−</kbd> promena vrednosti</li>' +
            '<li><kbd>Enter</kbd> izmeni / potvrdi stavku</li>' +
            '<li><kbd>Home</kbd><kbd>End</kbd> prva / poslednja kategorija</li>' +
            '<li><kbd>Tab</kbd> sledeća kategorija</li>' +
            '<li><kbd>F1</kbd> pomoć</li>' +
            '<li><kbd>F9</kbd> podrazumevana podešavanja</li>' +
            '<li><kbd>F10</kbd> sačuvaj i izađi</li>' +
            '<li><kbd>ESC</kbd> izlaz</li>' +
            '</ul>',
        dugmad: [{ tekst: 'Zatvori', klasa: 'bios-dugme-glavni' }]
    });
}
