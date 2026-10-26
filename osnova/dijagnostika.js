// Pravi ES modul (koristi export). Uvozi se samo iz ESM mosta u
// index.html preko http i https, zato sto file:// blokira module.
export function pokreni(store) {
    if (!store || typeof store.subscribe !== 'function') return () => { };

    const ukljuceno = () => {
        try {
            return localStorage.getItem('skolski-info-dijagnostika') === '1';
        } catch (e) {
            return false;
        }
    };

    const prestani = store.subscribe((stanje, akcija) => {
        if (ukljuceno()) {
            console.log('[store]', akcija.type, akcija.payload);
        }
    });

    console.info('Dijagnostika store-a povezana. Ukljuci sa localStorage skolski-info-dijagnostika=1');
    return prestani;
}
