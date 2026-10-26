'use strict';
// Minimalisticki store: jedno centralno stanje, dispatch menja stanje, subscribe obavestava pretplatnike. Smanjuje oslanjanje na window.App.
// Radi i u pregledacu (window.Store) i u Node.js (module.exports).
var Store = (function () {
    let trenutno = null;
    const akcije = Object.create(null);
    const pretplatnici = new Set();

    // ===== JAVNI API =====
    const api = {
        init(pocetnoStanje) {
            trenutno = pocetnoStanje;
            return api;
        },
        getStanje() {
            return trenutno;
        },
        registruj(tip, handler) {
            akcije[tip] = handler;
        },
        dispatch(akcija) {
            if (!akcija || typeof akcija.type !== 'string') return trenutno;
            const handler = akcije[akcija.type];
            if (typeof handler === 'function') {
                handler(trenutno, akcija.payload);
            }
            pretplatnici.forEach(slusac => {
                try { slusac(trenutno, akcija); } catch (e) { }
            });
            return trenutno;
        },
        subscribe(slusac) {
            pretplatnici.add(slusac);
            return () => pretplatnici.delete(slusac);
        }
    };

    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (typeof window !== 'undefined') window.Store = api;
    return api;
})();
