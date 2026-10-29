// Školska Informacija: server za login i sinhronizaciju (v2.1)
// Namerno bez ijedne npm zavisnosti: koristi samo ugrađene module Node.js (http, crypto, fs, path).
// Namena: rad na starom laptopu kućnom serveru. Pokretanje:  node server/server.js
//   PORT  : port servera (podrazumevano 8080)
//   HOST  : adresa na kojoj sluša (podrazumevano 0.0.0.0, tj. sve mrežne kartice)
//
// Šta server radi:
//   1) Servira samu web aplikaciju (statičke fajlove iz korena projekta). Otvorite
//      http://<ip-laptopa>:<port>/ na bilo kom uređaju u mreži.
//   2) REST API za naloge: registracija, prijava, odjava, info o nalogu.
//   3) Čuva podatke svakog korisnika u posebnom JSON fajlu: server/podaci/<ime>.json
//
// Bezbednost:
//   - Lozinke se NIKAD ne čuvaju u izvornom obliku: scrypt heš sa slučajnom soli (crypto.scryptSync).
//   - Prijava vraća nasumični token (32 bajta) koji važi 30 dana; tokeni stoje u server/tokeni.json.
//   - Poređenje heševa je konstantno-vremensko (timingSafeEqual).
//   - Ograničenje brzine prijava: najviše 10 neuspešnih pokušaja po IP-u na 10 minuta.
//   - CORS je otvoren (Access-Control-Allow-Origin: *) da aplikacija može da priča sa serverom
//     i kad se otvara preko file:// ili sa druge adrese.
//   - Saobraćaj je običan HTTP: za kućnu mrežu je to prihvatljivo; lozinke su hešovane, ali
//     token putuje otvoreno. Ne izlažite server internetu bez HTTPS proxy-ja (npr. Caddy/nginx).
//
// Struktura na disku (sve unutar server/):
//   server/server.js             : ovaj fajl
//   server/podaci-korisnici.json : nalozi { ime, so, hes, napravljeno }
//   server/tokeni.json           : aktivni tokeni { token: { ime, istice } }
//   server/podaci/<ime>.json     : podaci korisnika { azurirano, hash, podaci }

'use strict';

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ===== PODEŠAVANJA =====
const PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const KOREN = path.join(__dirname, '..');            // koren projekta (app + server)
const FOLDER_PODACI = path.join(__dirname, 'podaci');
const FAJL_KORISNICI = path.join(__dirname, 'podaci-korisnici.json');
const FAJL_TOKENI = path.join(__dirname, 'tokeni.json');

const VERZIJA = '2.1';
const MAX_TELO = 2 * 1024 * 1024;                    // 2 MB granica JSON tela
const TRAJANJE_TOKENA_MS = 30 * 24 * 60 * 60 * 1000; // 30 dana
const MAX_KORISNIKA = 50;                            // gornja granica broja naloga (zaštita diska)

// ===== SKLADIŠTE =====
if (!fs.existsSync(FOLDER_PODACI)) fs.mkdirSync(FOLDER_PODACI, { recursive: true });

// Čitanje JSON fajla sa povratnom vrednošćom ako ne postoji ili je neispravan.
function citajJson(putanja, podrazumevano) {
    try {
        return JSON.parse(fs.readFileSync(putanja, 'utf8'));
    } catch (e) {
        return podrazumevano;
    }
}

// Upis JSON fajla preko privremenog fajla i zamene (atomično koliko god može).
// Ako disk nije dostupan, baca grešku koju rukovalac vraća kao 500.
function pisiJson(putanja, objekat) {
    const tmp = putanja + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(objekat, null, 2), 'utf8');
    fs.renameSync(tmp, putanja); // atomična zamena koliko god može
}

let korisnici = citajJson(FAJL_KORISNICI, { korisnici: [] });
let tokeni = citajJson(FAJL_TOKENI, {});

function sacuvajKorisnike() { pisiJson(FAJL_KORISNICI, korisnici); }
function sacuvajTokene() { pisiJson(FAJL_TOKENI, tokeni); }

// Čišćenje isteklih tokena pri pokretanju i na sat.
// Ako upis na disk padne, stanje u memoriji se vraća sa diska (disk je izvor istine).
function ocistiTokene() {
    const sad = Date.now();
    let promena = false;
    for (const t of Object.keys(tokeni)) {
        if (!tokeni[t] || !tokeni[t].istice || tokeni[t].istice < sad) {
            delete tokeni[t];
            promena = true;
        }
    }
    if (promena) {
        try {
            sacuvajTokene();
        } catch (g) {
            tokeni = citajJson(FAJL_TOKENI, {});
            console.error('[server] upis tokena pao, stanje vraćeno sa diska:', g.message);
        }
    }
}
ocistiTokene();
setInterval(ocistiTokene, 60 * 60 * 1000).unref();

// ===== LOZINKE I TOKENI =====
// Napomena: scryptSync blokira glavnu nit na oko 100 ms po hešu. Za par korisnika
// u kućnoj mreži to je neprimetno. Ako prijave ikad postanu vidno spore, prebaci
// na asihroni crypto.scrypt ili smanji N u opcijama.
// Heš lozinke sa soli (scrypt). Heš se čuva, lozinka nikad.
function hesLozinke(lozinka, so) {
    return crypto.scryptSync(String(lozinka), so, 64).toString('hex');
}

// Poređenje dva heša u konstantnom vremenu, da vreme odgovora ne odaje sadržaj.
function bezbednoJednako(a, b) {
    const ba = Buffer.from(String(a), 'utf8');
    const bb = Buffer.from(String(b), 'utf8');
    if (ba.length !== bb.length) {
        // poređenje uvek iste dužine da vreme ne odaje dužinu
        return crypto.timingSafeEqual(ba, ba) && false;
    }
    return crypto.timingSafeEqual(ba, bb);
}

// Traženje korisnika po imenu (imena su mala slova).
function nadjiKorisnika(ime) {
    const norm = String(ime || '').toLowerCase();
    return korisnici.korisnici.find(k => k.ime === norm) || null;
}

// Novi prijavni token za korisnika i upis u tokeni.json.
function noviToken(ime) {
    const token = crypto.randomBytes(32).toString('hex');
    tokeni[token] = { ime, istice: Date.now() + TRAJANJE_TOKENA_MS };
    try {
        sacuvajTokene();
    } catch (g) {
        // Upis pao: vrati memoriju na staro stanje da ne lažemo da je token izdat.
        delete tokeni[token];
        throw g;
    }
    return token;
}

// Izvlači korisničko ime iz Authorization zaglavlja ako je token važeći.
function tokenNalog(zahtev) {
    const zaglavlje = zahtev.headers['authorization'] || '';
    const m = /^Bearer\s+([0-9a-f]{64})$/i.exec(String(zaglavlje).trim());
    if (!m) return null;
    const t = tokeni[m[1].toLowerCase()];
    if (!t || t.istice < Date.now()) return null;
    return t.ime;
}

// ===== OGRANIČENJE BRZINE (prijava/registracija) =====
const pokusaji = new Map(); // ip -> [vremenske oznake]
// Ograničenje brzine: najviše 10 pokušaja po IP-u u prozoru od 10 minuta.
function dozvoliPokusaj(ip) {
    const sad = Date.now();
    const prozor = 10 * 60 * 1000; // 10 min
    const lista = (pokusaji.get(ip) || []).filter(x => sad - x < prozor);
    if (lista.length >= 10) {
        pokusaji.set(ip, lista);
        return false;
    }
    lista.push(sad);
    pokusaji.set(ip, lista);
    return true;
}

// Čišćenje mape pokusaja na 10 minuta: briše IP adrese bez svežih pokušaja,
// da mapa ne raste bez granice ako server ikad izađe na internet.
setInterval(() => {
    const sad = Date.now();
    for (const [ip, lista] of pokusaji) {
        const sveze = lista.filter(x => sad - x < 10 * 60 * 1000);
        if (sveze.length) pokusaji.set(ip, sveze);
        else pokusaji.delete(ip);
    }
}, 10 * 60 * 1000).unref();

// ===== VALIDACIJA =====
// Forma korisničkog imena: 3 do 24 znaka, mala slova, cifre i _ - .
function ispravnoIme(ime) {
    return typeof ime === 'string' && /^[a-z0-9_\-.]{3,24}$/.test(ime);
}
// Forma lozinke: 6 do 128 znakova.
function ispravnaLozinka(lozinka) {
    return typeof lozinka === 'string' && lozinka.length >= 6 && lozinka.length <= 128;
}

// ===== KANONIČKI JSON I HASH =====
// Isti algoritam koristi i klijent (nalog.js): rekurzivno sortiranje ključeva pa stringify,
// pa FNV-1a hash. Koristi se SAMO za detekciju izmena/sukoba, ne za bezbednost.
function kanonickiJson(vrednost) {
    if (vrednost === null || typeof vrednost !== 'object') return JSON.stringify(vrednost);
    if (Array.isArray(vrednost)) return '[' + vrednost.map(kanonickiJson).join(',') + ']';
    const kljucevi = Object.keys(vrednost).sort();
    return '{' + kljucevi.map(k => JSON.stringify(k) + ':' + kanonickiJson(vrednost[k])).join(',') + '}';
}

// FNV-1a hash teksta (brz, dovoljan za detekciju izmena, ne za bezbednost).
function fnv1a(tekst) {
    let h = 0x811c9dc5;
    for (let i = 0; i < tekst.length; i++) {
        h ^= tekst.charCodeAt(i);
        h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
}

// Hash svih podataka korisnika (isti algoritam kao u klijentu).
function hashPodataka(podaci) {
    try {
        return fnv1a(kanonickiJson(podaci));
    } catch (e) {
        return null;
    }
}

// ===== FAJL PODATAKA KORISNIKA =====
// Putanja do JSON fajla sa podacima korisnika (ime je već validirano).
function putanjaPodataka(ime) {
    // ime je već validirano (bez .. i /), ali za svaki slučaj:
    if (!ispravnoIme(ime)) return null;
    return path.join(FOLDER_PODACI, ime + '.json');
}

// Čitanje dokumenta sa podacima korisnika (null ako ga nema).
function procitajPodatke(ime) {
    const p = putanjaPodataka(ime);
    if (!p) return null;
    return citajJson(p, null);
}

// Upis dokumenta sa podacima korisnika: vreme, hash i sami podaci.
function zapisiPodatke(ime, podaci) {
    const p = putanjaPodataka(ime);
    if (!p) return null;
    const dokument = {
        azurirano: new Date().toISOString(),
        hash: hashPodataka(podaci),
        podaci
    };
    pisiJson(p, dokument);
    return dokument;
}

// ===== ODGOVORI =====
// Slanje JSON odgovora sa ispravnim zaglavljima.
function posaljiJson(odgovor, kod, objekat) {
    const telo = JSON.stringify(objekat);
    odgovor.writeHead(kod, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(telo),
        'Cache-Control': 'no-store'
    });
    odgovor.end(telo);
}

// Slanje JSON odgovora u obliku greške { greska: poruka }.
function posaljiGresku(odgovor, kod, poruka, extra) {
    posaljiJson(odgovor, kod, Object.assign({ greska: poruka }, extra || {}));
}

// CORS zaglavlja: dozvoljeni metodi i zaglavlja sa bilo kog izvora.
function postaviCORS(odgovor) {
    odgovor.setHeader('Access-Control-Allow-Origin', '*');
    odgovor.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    odgovor.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    odgovor.setHeader('Access-Control-Max-Age', '86400');
}

// Čitanje JSON tela zahteva sa granicom veličine (MAX_TELO).
function citajTelo(zahtev) {
    return new Promise((resolve, reject) => {
        let velicina = 0;
        const delovi = [];
        zahtev.on('data', (deo) => {
            velicina += deo.length;
            if (velicina > MAX_TELO) {
                reject({ kod: 413, poruka: 'teloPreveliko' });
                zahtev.destroy();
                return;
            }
            delovi.push(deo);
        });
        zahtev.on('end', () => {
            if (!delovi.length) return resolve(null);
            try {
                resolve(JSON.parse(Buffer.concat(delovi).toString('utf8')));
            } catch (e) {
                reject({ kod: 400, poruka: 'losJson' });
            }
        });
        zahtev.on('error', () => reject({ kod: 400, poruka: 'losZahtev' }));
    });
}

// ===== STATIČKI FAJLOVI =====
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.md': 'text/plain; charset=utf-8',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.map': 'application/json'
};

// Serviranje statičkog fajla iz korena projekta. Nepoznate putanje vraćaju index.html.
// server/ folder je zabranjen: tu su nalozi, tokeni i podaci korisnika.
function serviriFajl(odgovor, relativnaPutanja) {
    let cista = relativnaPutanja.split('?')[0];
    if (cista === '/' || cista === '') cista = '/index.html';

    let dekodirana;
    try {
        dekodirana = decodeURIComponent(cista);
    } catch (e) {
        dekodirana = cista;
    }

    const resena = path.normalize(path.join(KOREN, dekodirana));

    // Ne sme da pobegne izvan korena projekta niti da dira server/ folder (tu su nalozi i tokeni).
    const unutarKorena = resena === KOREN || resena.startsWith(KOREN + path.sep);
    const dirujeServer = resena === path.join(KOREN, 'server') || resena.startsWith(path.join(KOREN, 'server') + path.sep);
    if (!unutarKorena || dirujeServer) {
        odgovor.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        odgovor.end('403 Zabranjeno');
        return;
    }

    fs.stat(resena, (greska, stat) => {
        if (greska || !stat.isFile()) {
            // Sve nepoznate putanje vraćaju aplikaciju (sve je na jednoj stranici).
            const index = path.join(KOREN, 'index.html');
            fs.readFile(index, (g2, sadrzaj) => {
                if (g2) {
                    odgovor.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                    odgovor.end('404 Nije pronađeno');
                    return;
                }
                odgovor.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-cache' });
                odgovor.end(sadrzaj);
            });
            return;
        }

        const ext = path.extname(resena).toLowerCase();
        const tip = MIME[ext] || 'application/octet-stream';
        // HTML uvek sveže (nova verzija), ostalo može da se kešira jedan dan.
        const kes = ext === '.html' ? 'no-cache' : 'public, max-age=86400';
        fs.readFile(resena, (g, sadrzaj) => {
            if (g) {
                odgovor.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                odgovor.end('500 Greška servera');
                return;
            }
            odgovor.writeHead(200, { 'Content-Type': tip, 'Cache-Control': kes });
            odgovor.end(sadrzaj);
        });
    });
}

// ===== API RUKOVAOCI =====
// Glavni rukovalac API zahteva: zdravo, registracija, prijava, odjava, nalog, podaci.
async function apiRukovalac(zahtev, odgovor, url) {
    const putanja = url.pathname.replace(/\/+$/, '') || '/';
    const ip = (zahtev.socket && zahtev.socket.remoteAddress) || '?';

    // ----- Zdravo (provera dostupnosti, bez prijave) -----
    if (putanja === '/api/zdravo' && zahtev.method === 'GET') {
        posaljiJson(odgovor, 200, { odgovor: 'zdravo', vreme: new Date().toISOString(), verzija: VERZIJA });
        return;
    }

    // ----- Registracija -----
    if (putanja === '/api/registracija' && zahtev.method === 'POST') {
        if (!dozvoliPokusaj(ip)) return posaljiGresku(odgovor, 429, 'previsePokusaja');
        const telo = await citajTelo(zahtev);
        if (!telo || typeof telo !== 'object') return posaljiGresku(odgovor, 400, 'losZahtev');

        const ime = String(telo.ime || '').trim().toLowerCase();
        const lozinka = String(telo.lozinka || '');

        if (!ispravnoIme(ime)) return posaljiGresku(odgovor, 400, 'loseIme');
        if (!ispravnaLozinka(lozinka)) return posaljiGresku(odgovor, 400, 'losaLozinka');
        if (nadjiKorisnika(ime)) return posaljiGresku(odgovor, 409, 'imeZauzeto');
        if (korisnici.korisnici.length >= MAX_KORISNIKA) return posaljiGresku(odgovor, 503, 'previseKorisnika');

        const so = crypto.randomBytes(16).toString('hex');
        korisnici.korisnici.push({
            ime,
            so,
            hes: hesLozinke(lozinka, so),
            napravljeno: new Date().toISOString()
        });
        try {
            sacuvajKorisnike();
        } catch (g) {
            // Upis pao (pun disk, read-only...): vrati memoriju na staro stanje.
            korisnici.korisnici.pop();
            console.error('[server] upis korisnika pao:', g.message);
            return posaljiGresku(odgovor, 500, 'diskGreska');
        }
        // Nalog i token se upisuju kao jedna celina: ako upis tokena padne,
        // vracamo i nalog (rollback oba), da registracija moze cisto da se ponovi.
        let token;
        try {
            token = noviToken(ime);
        } catch (g) {
            korisnici.korisnici.pop();
            try {
                sacuvajKorisnike();
            } catch (g2) {
                // I rollback je pao: disk je izvor istine, pa izlazimo.
                // systemd ce podici server ponovo i ucitati stanje sa diska.
                console.error('[server] rollback naloga pao, izlazim:', g2.message);
                process.exit(1);
            }
            console.error('[server] upis tokena pao pri registraciji, nalog vracen:', g.message);
            return posaljiGresku(odgovor, 500, 'diskGreska');
        }
        console.log(`[nalog] registrovan: ${ime} (${ip})`);
        posaljiJson(odgovor, 201, { token, ime });
        return;
    }

    // ----- Prijava -----
    if (putanja === '/api/prijava' && zahtev.method === 'POST') {
        if (!dozvoliPokusaj(ip)) return posaljiGresku(odgovor, 429, 'previsePokusaja');
        const telo = await citajTelo(zahtev);
        if (!telo || typeof telo !== 'object') return posaljiGresku(odgovor, 400, 'losZahtev');

        const ime = String(telo.ime || '').trim().toLowerCase();
        const lozinka = String(telo.lozinka || '');
        const korisnik = nadjiKorisnika(ime);

        if (!korisnik || !bezbednoJednako(hesLozinke(lozinka, korisnik.so), korisnik.hes)) {
            return posaljiGresku(odgovor, 401, 'losiKredencijali');
        }

        console.log(`[nalog] prijava: ${ime} (${ip})`);
        try {
            posaljiJson(odgovor, 200, { token: noviToken(ime), ime: korisnik.ime });
        } catch (g) {
            console.error('[server] upis tokena pao pri prijavi:', g.message);
            posaljiGresku(odgovor, 500, 'diskGreska');
        }
        return;
    }

    // ----- Od ovde se traži prijava -----
    const imeNaloga = tokenNalog(zahtev);
    if (!imeNaloga) return posaljiGresku(odgovor, 401, 'nijePrijavljen');

    // ----- Odjava -----
    if (putanja === '/api/odjava' && zahtev.method === 'POST') {
        const zaglavlje = String(zahtev.headers['authorization'] || '').trim();
        const m = /^Bearer\s+([0-9a-f]{64})$/i.exec(zaglavlje);
        if (m) {
            const kljuc = m[1].toLowerCase();
            const obrisan = tokeni[kljuc];
            delete tokeni[kljuc];
            try {
                sacuvajTokene();
            } catch (g) {
                // Upis pao: vrati token da disk i memorija ostanu usklađeni.
                if (obrisan) tokeni[kljuc] = obrisan;
                console.error('[server] upis tokena pao pri odjavi:', g.message);
                return posaljiGresku(odgovor, 500, 'diskGreska');
            }
        }
        console.log(`[nalog] odjava: ${imeNaloga}`);
        posaljiJson(odgovor, 200, { ok: true });
        return;
    }

    // ----- Info o nalogu -----
    if (putanja === '/api/nalog' && zahtev.method === 'GET') {
        const k = nadjiKorisnika(imeNaloga);
        const dokument = procitajPodatke(imeNaloga);
        let velicinaKB = 0;
        if (dokument) {
            try { velicinaKB = Math.max(1, Math.round(fs.statSync(putanjaPodataka(imeNaloga)).size / 1024)); } catch (e) { }
        }
        posaljiJson(odgovor, 200, {
            ime: imeNaloga,
            napravljeno: k ? k.napravljeno : null,
            azurirano: dokument ? dokument.azurirano : null,
            velicinaKB,
            imaPodatke: !!dokument
        });
        return;
    }

    // ----- Čitanje podataka korisnika -----
    if (putanja === '/api/podaci' && zahtev.method === 'GET') {
        const dokument = procitajPodatke(imeNaloga);
        if (!dokument) return posaljiGresku(odgovor, 404, 'nemaPodataka');
        posaljiJson(odgovor, 200, {
            azurirano: dokument.azurirano,
            hash: dokument.hash,
            podaci: dokument.podaci
        });
        return;
    }

    // ----- Čuvanje podataka korisnika -----
    if (putanja === '/api/podaci' && zahtev.method === 'PUT') {
        const telo = await citajTelo(zahtev);
        if (!telo || typeof telo !== 'object' || !telo.podaci || typeof telo.podaci !== 'object') {
            return posaljiGresku(odgovor, 400, 'losZahtev');
        }
        if (!telo.podaci.settings || !Array.isArray(telo.podaci.schedule) || !Array.isArray(telo.podaci.notes)) {
            return posaljiGresku(odgovor, 400, 'losaStruktura');
        }

        const postojeci = procitajPodatke(imeNaloga);
        const forsiraj = telo.forsiraj === true;

        if (postojeci && !forsiraj) {
            const osnoviHash = telo.osnoviHash || null;
            if (!osnoviHash || osnoviHash !== postojeci.hash) {
                // Sukob: server je u međuvremenu menjao sa druge strane.
                return posaljiGresku(odgovor, 409, 'sukob', {
                    azurirano: postojeci.azurirano,
                    hash: postojeci.hash,
                    podaci: postojeci.podaci
                });
            }
        }

        const dokument = zapisiPodatke(imeNaloga, telo.podaci);
        console.log(`[podaci] sačuvano za: ${imeNaloga} (hash ${dokument.hash})`);
        posaljiJson(odgovor, 200, { azurirano: dokument.azurirano, hash: dokument.hash });
        return;
    }

    posaljiGresku(odgovor, 404, 'nepoznato');
}

// ===== GLAVNI SERVER =====
// Glavni HTTP server: /api/* ide na API, ostalo na statičke fajlove.
const server = http.createServer((zahtev, odgovor) => {
    const url = new URL(zahtev.url, `http://${zahtev.headers.host || 'localhost'}`);

    if (url.pathname.startsWith('/api/')) {
        postaviCORS(odgovor);
        if (zahtev.method === 'OPTIONS') {
            odgovor.writeHead(204);
            odgovor.end();
            return;
        }
        apiRukovalac(zahtev, odgovor, url).catch((g) => {
            if (g && g.kod) posaljiGresku(odgovor, g.kod, g.poruka);
            else {
                console.error('[server] greška:', g);
                posaljiGresku(odgovor, 500, 'serverGreska');
            }
        });
        return;
    }

    serviriFajl(odgovor, url.pathname);
});

server.listen(PORT, HOST, () => {
    const adrese = [];
    try {
        const os = require('os');
        const mreze = os.networkInterfaces();
        Object.keys(mreze).forEach(ime => {
            mreze[ime].forEach(m => {
                if (m.family === 'IPv4' && !m.internal) adrese.push(m.address);
            });
        });
    } catch (e) { }

    console.log('==========================================================');
    console.log(`  Školska Informacija v${VERZIJA}: server pokrenut`);
    console.log(`  Lokalno:    http://localhost:${PORT}/`);
    adrese.forEach(a => console.log(`  U mreži:    http://${a}:${PORT}/`));
    if (!adrese.length) console.log('  (nema detektovanih mrežnih adresa)');
    console.log('  Zaustavljanje: Ctrl+C');
    console.log('  Nalozi i podaci se čuvaju u server/ folderu.');
    console.log('==========================================================');
});

// ===== ZAUSTAVLJANJE =====
// Ctrl+C (SIGINT) i systemd (SIGTERM): otvorene veze se regularno zatvore,
// pa tek onda proces izlazi. Ako nesto nece da se zatvori u roku od 5 sekundi,
// izlazimo i to (upisi na disk su sinhroni i kratki, pa nema sta da se prekine).
function zaustaviServer(signal) {
    console.log(`\n[server] ${signal}, zaustavljanje`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', () => zaustaviServer('SIGINT'));
process.on('SIGTERM', () => zaustaviServer('SIGTERM'));
