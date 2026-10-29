# Vodic za produkciju: uređaj kao server

Ovaj folder sadrzi sve sto treba da uređaj postane pouzdan kucni server za
Skolsku Informaciju: nadzor procesa, Caddy proxy, backup i reset lozinke.
Sve komande su za terminal (Linux) ili PowerShell/CMD (Windows).

Sadrzaj foldera:

| Fajl                  | Namena |
|-----------------------|--------|
| `skolska-info.service`| systemd servis za Linux: sam podize server posle butovanja i restartuje ga ako padne |
| `caddy-skolska.service` | systemd servis za Caddy proxy: isto nadziranje, port 80 ka Node na 8080 |
| `Caddyfile`           | podesenje Caddy proxy-ja: slusa na portu 80 svih adresa, bez hardkodovane IP |
| `backup.sh`           | dnevni backup na Linux-u (cron) |
| `backup.bat`          | dnevni backup na Windows-u (Task Scheduler) |

## Windows 10 ili Linux?

Linux prvi put? Debian 12 "netinst" ili Ubuntu Server LTS su dobri izbori.
Instalacija traje oko 20 minuta, od tebe trazi samo ime korisnika i lozinku.
Posle sve radi kroz SSH (kucas `ssh korisnik@ip-uređaja` sa glavnog racunara),
a ekran uređaja uopste ne mora da bude ukljucen.

Ako Windows 10: sve ispod radi i na Windows-u (Caddy i Node imaju Windows verzije),
samo umesto systemd-a koristi NSSM (vidi sekciju o nadzoru). To je legitimna
opcija, samo malo vise podesavanja.

## 1. Nadzor procesa: server mora uvek da radi

### Linux (systemd, preporuceno)

1. Preimenuj/uredi `skolska-info.service`: promeni `WorkingDirectory`, `User`,
   `Group` i `ExecStart` na svoje vrednosti (putanja do projekta, tvoje ime, `which node`).
2. Onda:

   ```bash
   sudo cp deploy/skolska-info.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now skolska-info
   ```

3. Provera:

   ```bash
   systemctl status skolska-info    # treba da pise: active (running)
   journalctl -u skolska-info -f    # logovi u zivo (izadji sa Ctrl+C)
   ```

Od sada: uređaj se pali -> server se sam dize. Server padne -> systemd ga
restartuje za 5 sekundi. Nista ne moras da diras.

### Windows (NSSM)

1. Skini NSSM sa https://nssm.cc (mali exe, bez instalacije).
2. PowerShell kao administrator:

   ```powershell
   nssm install SkolskaInfo "C:\Program Files\nodejs\node.exe" "C:\putanja\do\school-information\server\server.js"
   nssm set SkolskaInfo AppDirectory "C:\putanja\do\school-information"
   nssm set SkolskaInfo Start SERVICE_AUTO_START
   nssm start SkolskaInfo
   ```

3. Logovi: `nssm log SkolskaInfo` ili Windows Event Viewer.

## 2. Backup: jedini pravi zastita od crknog diska

Svi podaci zive u `server/` folderu (`podaci-korisnici.json`, `tokeni.json`,
`podaci/<ime>.json`). Ako disk umre bez backup-a, nema nista.

Pravila koja vazе:

- **Kopija na isti disk** je bolje od nista, ali ne cuva od crknog diska.
- **Kopija na USB** ili na drugi racunar u mrezi je prava zastita.
- Jednostavna 3-2-1 varijanta za kucnu upotrebu: 1 kopija na uređaju
  (server/ folder), 1 na USB-u, 1 na cloud (opciono).

### Linux (cron + backup.sh)

```bash
# rucna proba (kopija ide u ~/backup-skolska-info):
./deploy/backup.sh

# dnevno u 02:30 na USB:
crontab -e
# dodaj liniju (promeni putanju USB-a):
30 2 * * * /home/korisnik/school-information/deploy/backup.sh /media/korisnik/USB >> /home/korisnik/backup.log 2>&1
```

Skripta cuva poslednjih 14 dnevnih kopija (moze vise: drugi argument).

### Windows (Task Scheduler + backup.bat)

1. Promeni u `backup.bat` liniju `CELISHTE` na slovo svog USB diska.
2. Task Scheduler -> Create Basic Task -> Daily 02:30 -> pokreni `backup.bat`.

### Provera backup-a (uradi jednom, pa svaka 2-3 meseca)

Kopiraj folder sa backup-a na bilo koji racunar, pokreni `node server/server.js`
unutar njega (folder projekta sa server.js mora postojati), prijavi se i
proveri da su podaci tu. Backup koji nikad nije proban nije backup.

## 3. Caddy: prava adresa (i HTTPS ako izlazi na internet)

Caddy stoji ispred Node servera i daje mu pravu adresu (port 80 umesto
`ip:8080`), a sa imenom domena i HTTPS (sertifikat sam trazi i obnavlja).
Caddyfile slusa na portu 80 na svim adresama racunara, pa sajt nastavlja da
radi i kad uređaj promeni IP adresu (DHCP).

1. Instaliraj Caddy: https://caddyserver.com/docs/install
2. Probno pokretanje: `caddy run --config deploy/Caddyfile` (u prvom planu,
   zaustavlja se sa Ctrl+C).
3. Za produkciju stavi Caddy pod systemd, da sajt ne zavisi od toga da li je
   neko prijavljen na uređaju. Postoje dva puta:

   **Put A: standalone Caddy (zip sa sajta, bez apt servisa).** Iskopiraj servis:

   ```bash
   # prvo promeni u fajlu User i putanju do Caddyfile-a na svoje vrednosti
   sudo cp deploy/caddy-skolska.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now caddy-skolska
   systemctl status caddy-skolska
   ```

   **Put B: Caddy iz apt repozitorijuma.** Apt instalacija vec dolazi sa svojim
   caddy servisom koji cita /etc/caddy/Caddyfile, pa je dovoljno:

   ```bash
   sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
   sudo systemctl enable --now caddy
   ```

   Bitno: samo jedan od ova dva servisa sme da radi u isto vreme, jer se
   otimaju za port 80.

Od sada: uređaj se pali -> Caddy se sam dize -> sajt zivi na http://<ip-uređaja>
(bez porta). Caddy padne -> systemd ga restartuje za 5 sekundi.

Za pristup sa interneta: na ruteru prosledi port 80 i 443 na IP uređaja, pa
otkomentarisi Varijantu 2 u Caddyfile-u (besplatno DuckDNS ime).
**Ne otvaraj port 8080 direktno**: Node server radi obican HTTP, token bi
putovao otvoreno kroz internet. Sa Caddy-jem ispred (HTTPS), saobracaj je
sifrovan do uređaja. Za HTTPS unutar kucne mreze vidi kratku napomenu u
samom Caddyfile-u (tls internal).

## 4. Reset zaboravljene lozinke (rucno, bez API-ja)

Server namerno nema "zaboravio sam lozinku" na daljinu (kuca servera, nema
mail servisa). Reset se radi direktno na uređaju, u folderu projekta:

1. Zaustavi server (`sudo systemctl stop skolska-info` na Linux-u /
   `nssm stop SkolskaInfo` na Windows-u).
2. Otvori `server/podaci-korisnici.json` i obrisi ceo red korisnika cija
   lozinka se resetuje (red izgleda kao `{ "ime": ..., "so": ..., "hes": ..., "napravljeno": ... }`).
3. Podaci korisnika ostaju netaknuti u `server/podaci/<ime>.json`.
4. Pokreni server ponovo.
5. Korisnik se registruje ponovo sa istim imenom i novom lozinkom, pa pri
   prvoj sinhronizaciji aplikacija ponudi spajanje sa podacima koji su vec
   na serveru (isti dijalog sukoba kao i inace: zadrzi lokalne / serverske / spoji).

Alternativa (brza i prljava): obrisati samo tokeni.json znaci odjava svih
uređaja, ali to ne menja lozinku.

## 5. checklist pre produkcije

- [ ] Server radi posle butovanja uređaja (systemd/NSSM testiran)
- [ ] Caddy radi kao servis (systemctl status caddy-skolska ili caddy)
- [ ] Backup se pravi dnevno i probao sam vratiti iz backup-a
- [ ] uređaj ima staticku IP adresu u mrezi (podeseno na ruteru po MAC adresi)
- [ ] Ako server izlazi na internet: Caddy sa HTTPS ispred, port 8080 zatvoren
- [ ] (opciono) `apt install unattended-upgrades` na Linux-u: bezbednosne zakrpe bez mog uplitanja
