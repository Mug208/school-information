// VirusTema: glavni motor tranzicije, javni API window.VTema.
'use strict';
    // ===== TRANZICIJA =====
    function tranzicija(novicode, primeni) {
        var smer = 0;
        if (novicode && !trenutnocode) smer = 1;
        else if (!novicode && trenutnocode) smer = -1;

        if (!smer || prviProlaz || zauzeto || !animUkljucena ||
            !pripremiSlojeve()) {
            prviProlaz = false;
            trenutnocode = !!novicode;
            skramblId++;
            if (!novicode) DomRengen.sakrij();
            return false;
        }

        zauzeto = true;
        trenutnocode = !!novicode;
        if (smer === 1) zarazi(primeni);
        else ozivi(primeni);
        return true;
    }

    // ===== INICIJALIZACIJA I JAVNI API =====
    function vInit() {
        if (!pripremiSlojeve()) {
            document.addEventListener('DOMContentLoaded', vInit, { once: true });
            return;
        }
        DomRengen.ukljuci();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', vInit, { once: true });
    } else {
        vInit();
    }

    window.VirusTema = {
        tranzicija: tranzicija,
        zarazi: zarazi,
        ozivi: ozivi,
        DomRengen: DomRengen,

        animacija: animacija,

        efektiPanel: efektiPanel
    };
