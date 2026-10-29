# Server za login i sinhronizaciju: Skolska Informacija v2.1

Ovaj folder sadrži ceo "backend" Skolske Informacije: **jedan Node.js fajl bez ijedne npm zavisnosti**.
Namerno je tako: projekt se drži principa da svako ko zna osnove web razvoja može da ga čita i menja,
a da radi na bilo kom računaru gde se instalira Node.js, uključujući stari uređaj kućni server.

Za produkcijsko postavljanje (server koji se sam diže posle butovanja, backup, Caddy HTTPS,
reset lozinke) pogledaj **`deploy/README.md`**: kompletan vodič za stari uređaj.

## Brzi start (pipremi drugi uređaj)

1. Instaliraj [Node.js LTS](https://nodejs.org) (verzija 16 ili novija).
2. Otvori terminal u folderu projekta i pokreni:

   ```bash
   node server/server.js
   ```

3. U konzoli će ispisati adrese, npr:

   ```text
   ==========================================================
     Skolska Informacija v2.1: server pokrenut
     Lokalno:    http://localhost:8080/
     U mreži:    http://192.168.1.20:8080/
   ==========================================================
   ```

4. Na uređaju otvori `http://localhost:8080/`, a na telefonu (isti Wi-Fi) `http://192.168.1.20:8080/`.
   Aplikacija se učitava sa servera i sama zna adresu, pa prijava radi odmah.

Skraćenica: `npm run server` (isto što i gornja komanda).

### Promena porta ili adrese

```bash
PORT=9000 node server/server.js            # drugi port
HOST=127.0.0.1 node server/server.js       # samo sa tog računara (ne u mreži)
```

### Pokretanje u pozadini i pri butovanju uređaja

- **Linux (preporuka)**: systemd servis iz `deploy/skolska-info.service`.
  Uputstvo korak po korak je u `deploy/README.md`.
- **Windows**: NSSM servis ili najjednostavnije `pokreni-server.bat` sa sadržajem
  `node server\server.js` u Startup folder (Win+R, pa `shell:startup`).

### Ograničenja koja treba znati

- Najviše **50 naloga** (podesivo `MAX_KORISNIKA` u server.js). Server vraća grešku
  `previseKorisnika` kad se popuni. Za kućnu upotrebu više nego dovoljno.
- Najviše **2 MB po zahtevu** (`MAX_TELO`), što je i realna granica beleški.
- Ako upis na disk padne (pun disk, read-only), server vraća grešku 500 i **vraća
  memoriju na staro stanje**, pa disk i server ostaju usklađeni. Isto važi i za
  registraciju: ako upis tokena padne posle upisa naloga, vraća se i nalog
  (rollback oba), tako da korisnik može odmah da ponovi registraciju.
- Zaustavljanje ide preko SIGINT i SIGTERM signala (systemd šalje SIGTERM):
  server prvo regularno zatvori otvorene veze, pa izađe najkasnije posle 5 sekundi.

## Šta server čuva na disku

Sve ostaje unutar ovog foldera, nema baze i nema clouda:

```text
server/
├── server.js               # ceo server (HTTP + API + statički fajlovi)
├── podaci-korisnici.json   # nalozi: { ime, so, hes, napravljeno }
├── tokeni.json             # prijavni tokeni sa rokom trajanja (30 dana)
└── podaci/
    └── <ime>.json          # podaci korisnika: { azurirano, hash, podaci }
```

- **Backup = kopiranje foldera.** Iskopiraj `server/` na USB i gotovo. Za dnevni
  automatski backup vidi `deploy/backup.sh` (Linux) i `deploy/backup.bat` (Windows).
- Korisnički JSON fajl je **istog formata** kao izvoz iz BIOS-a, Podaci, pa se po
  potrebi može ručno uvesti.
- Ako želiš da "odjaviš sve uređaje" nekog korisnika, obriši njegove tokene iz
  `tokeni.json` (ili ceo fajl) i restartuj server.

## API (za radoznale)

| Metod | Putanja           | Auth  | Opis |
|-------|-------------------|-------|------|
| GET   | `/api/zdravo`     | ne    | provera da li server živi |
| POST  | `/api/registracija` | ne | nov nalog `{ ime, lozinka }` → `{ token }` |
| POST  | `/api/prijava`    | ne    | prijava → `{ token, ime }` |
| POST  | `/api/odjava`     | da    | poništava token |
| GET   | `/api/nalog`      | da    | info o nalogu (veličina podataka, poslednja izmena) |
| GET   | `/api/podaci`     | da    | `{ azurirano, hash, podaci }` ili `404` ako nema |
| PUT   | `/api/podaci`     | da    | čuva `{ podaci, osnoviHash, forsiraj }`; pri neusklađenom hešu vraća `409 Sukob` sa serverskim primerkom |

Autorizacija ide kroz zaglavlje `Authorization: Bearer <token>`.

## Bezbednost, pročitaj ovo

- Lozinke **nikad** ne idu na disk u čitljivom obliku: čuva se `scrypt` heš sa slučajnom solju; poređenje je konstantno-vremensko.
- Tokeni su nasumičnih 32 bajta i traju 30 dana; server ih sama briše po isteku.
- Prijava/registracija su ograničeni na **10 pokušaja po IP-u na 10 minuta**.
- `server/` folder se **nikad ne servira** spolja: statički deo servira samo aplikaciju.
- CORS je otvoren da aplikacija može da se poveže i sa `file://` ili druge adrese.
- Saobraćaj je **običan HTTP**. U kućnoj mreži to je OK, ali **ne otvaraj port ka internetu**
  bez HTTPS proxy-ja (npr. Caddy, vidi `deploy/Caddyfile`), jer token putuje nešifrovano.
- Ako server dela više ljudi kojima ne veruješ potpuno, razmisli o HTTPS-u ili VPN-u
  (WireGuard/Tailscale) umesto otvaranja porta.

## Reset zaboravljene lozinke

Server namerno nema "zaboravio sam lozinku" na daljinu (kućni server, nema slanja mejla).
Reset se radi direktno na uređaju:

1. Zaustavi server.
2. Otvori `server/podaci-korisnici.json` i obriši ceo red korisnika cija se lozinka zaboravila
   (red sa njegovim `ime`, `so`, `hes`, `napravljeno`).
3. Podaci korisnika ostaju netaknuti u `server/podaci/<ime>.json`.
4. Pokreni server ponovo. Korisnik se registruje sa istim imenom i novom lozinkom, a pri
   prvoj sinhronizaciji aplikacija nudi spajanje sa postojećim podacima na serveru.

Detalji i alternativa: `deploy/README.md`, sekcija 4.

## Česta pitanja

**Prijava ne radi sa GitHub Pages stranice.** Pregledač blokira `http://` pozive sa `https://` stranice (mixed content). Rešenje: otvori aplikaciju sa adrese servera (`http://ip:port`) ili sa diska. Tada možeš da navedeš adresu servera u modalu naloga, Podešavanja servera.

**Server se vratio, a podaci se ne sinhronizuju.** Pritisni dugme naloga u zaglavlju, pa "Sinhronizuj sada", ili Ctrl+K, pa "Sinhronizuj sa serverom". Ako je do sukoba došlo, dijalog će ponuditi izbor (zadrži lokalne, zadrži serverske, spoji).

**Hoću da počnem ispočetka sa podacima nekog korisnika.** Obriši `podaci/<ime>.json` i restartuj server; nalog ostaje, prva sledeća sinhronizacija pošalje svežije lokalne podatke (uz dijalog ako ima razlike).

**Koliko korisnika i podataka izdrži?** Server drži sve u fajlovima i radi sa kratkim JSON porukama, pa za kućnu upotrebu (par korisnika, par stotina beleški) više nego dovoljno, čak i na jako starom gvožđu. Granica od 50 naloga štiti disk od punjenja.
