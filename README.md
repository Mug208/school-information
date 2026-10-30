# <img width="40" height="40" alt="Mug208SI" src="https://github.com/user-attachments/assets/2cb1723a-764f-40b1-9a26-ed26d429df00" /> Školski sistem (Školska Informacija v2.1)

Školski Informacija je potpuno samostalan Informacioni sistem namenjeno za učenike(poput mene): raspored časova, kalendar sa događajima i beleške, sve u jednom preglednom interfejsu. Aplikacija radi u bilo kom modernom pregledaču, ne zahteva instalaciju, server ni bazu podataka, a svi podaci ostaju lokalno na vašem računaru.

Projekat je napisan samo u HTML, CSS i JavaScriptu, bez ikakvih frameworka, bundlera ili npm zavisnosti. Dovoljno je otvoriti `index.html` ili preko linka "https://mug208.github.io/school-information/" i sa serverom(pristup login sistemom) "https://school-information.duckdns.org/".

Pre proketanja link sa serverom, treba pažnja da ovaj server pristupa maksimalno 50 korisnika(kasnije ću uveličavati granicu ako je sve stabilno), i server može ponekad da padne u nekom trenutku, molimo vas da ne zloupotrebite ovo, iako sam namestio ograničenje koliko naloga po minuti može da se napravi, da ne napravite više od jedan naloga. Preporučeno je da sačuvate lozinku negde sigurno da ne zaboravite, jer još nisam implementirao log in za emailom, to ću gledati kasnije da uradim, pa možete preko emaila da izmenite lozinku(ako nađem taj način), u svakom sigurnosti, sa sada obrisaču nalog koji vidim da je dugo nije aktivan

## Novo u verziji 2.1

- **Login i sinhronizacija podataka**: priložen server bez ijedne zavisnosti (`server/server.js`) namenjen starom laptopu. Kad server i internet rade, korisnik se prijavljuje i dobija **svoj JSON fajl na serveru**: podaci se automatski šalju i preuzimaju.
- **Offline-first**: bez servera aplikacija radi kao i ranije, prijava nije potrebna. Statusna oznaka u zaglavlju upozorava na server koji je pao i na nesinhronizovane izmene; JSON backup i dalje stoji u BIOS-u, Podaci.
- **Rešavanje sukoba**: ako su podaci menjani i lokalno i na serveru, dijalog nudi tri izbora: zadrži lokalne, zadrži serverske ili **spoji** (unija beleški, časova i predmeta bez duplikata).
- **Upozorenja protiv gubitka**: odjava sa nesinhronizovanim izmenama traži potvrdu, napuštanje stranice sa nesinhronizovanim izmenama pita da li ste sigurni, a pad servera izbacuje upozorenje sa podsetnikom na JSON backup.
- **Spremno za produkciju**: `deploy/` folder donosi systemd servis (server se sam diže posle butovanja i restartuje posle pada), Caddy podesenje za HTTPS, dnevne backup skripte za Linux i Windows i uputstvo za reset zaboravljene lozinke (`deploy/README.md`).
- **Napomena za otvaranje sa diska**: podešavanja servera objašnjavaju da aplikacija otvorena direktno sa diska (`file://`) ne može sama da prepozna adresu servera, pa se adresa unosi ručno.

## Šta ču kasnije dodati (W.I.P.):

- **README.md na engleskom jeziku**, imače jedan PROCITAJME.md na srpskom jeziku i README.md na engleskom kasnije
- **Restyle**: Van podešavanja, gledaću da izmenim dizajn web aplikacije jer izgleda previše moderno, pogotovo u rasporedu, sa sada nisam ismislio kako da to izmenim i već sam razmišljao mesecima kako bi bio više prilagođen dizajn u odnosu ostalih

## Funkcionalnosti

### Raspored časova
- Tabela za pet dana u nedelji sa konfigurabilnim brojem časova (podrazumevano 7).
- Odvojeni rasporedi za jutarnju i popodnevnu smenu.
- Klik na bilo koji čas otvara modal za izmenu: predmet, kabinet, dan i redni broj časa.
- Klik na dan u zaglavlju ističe celu kolonu, radi i na mobilnom.
- Pretraga predmeta (taster S) sa mogućnošću unosa više predmeta odjednom, razdvojenih zarezom.
- Višestruki izbor časova (taster M) za grupnu izmenu ili brisanje više časova odjednom.
- Štampa cele nedelje preko dugmeta za štampu, sa zaglavljem koje sadrži naziv škole i razred.
- Na mobilnim uređajima tabelu zamenjuje pregled jednog dana sa biračem dana i strelicama za kretanje.

<img width="1305" height="1004" alt="{9CEB3EEC-35AC-47C4-918B-6AE69938DFEE}" src="https://github.com/user-attachments/assets/7eb02b8d-fbc4-4883-a957-0c0acb17bbce" />

### Kalendar
- Mesečni kalendar u kome svaki datum sa beleškama nose vizuelnu oznaku.
- Klik na datum otvara bočni panel sa beleškama za taj dan i dugmetom za dodavanje nove.
- Kartica sa nadolazećim događajima i obaveštenja u obliku zvona sa brojačem u zaglavlju.
- Prečica za skok na tekući datum dostupna iz komandne palete.

<img width="1300" height="1014" alt="{0F4DA9EA-A05C-40E1-9E3F-3F9907F70352}" src="https://github.com/user-attachments/assets/dd4a7804-463e-493b-b2d1-b7f9ff1a6744" />

### Beleške
- Šest tipova beleški: kontrolni, pismeni, blic, prezentacija, domaći i ostalo, svaki sa svojom bojom.
- Filteri po tipu sa živim brojačima, polje za pretragu po naslovu i sadržaju.
- Zakačivanje (pin) važnih beleški, označavanje kao završeno i traka napretka.
- Svaka beleška može biti vezana za predmet i datum.

<img width="1322" height="1031" alt="{6F66A719-C2FB-4AB1-8219-17C4CAA42047}" src="https://github.com/user-attachments/assets/ec29a5a2-9e29-4acb-ad1d-35694f5d89af" />

### BIOS podešavanja
- Namerno retro, terminalski stilizovan utility za sva podešavanja sistema, otvara se tasterom DEL.
- Šest kategorija: Glavno, Predmeti, Smene, Efekti, Podaci i Izlaz.
- Kompletna kontrola sa tastature, animacija pri pokretanju (boot sekvenca) i upozorenje ako pokušate da izađete sa nesačuvanim izmenama.
- Fabrička podešavanja se mogu vratiti bez brisanja rasporeda, beleški i predmeta.

<img width="1333" height="707" alt="image" src="https://github.com/user-attachments/assets/41c8b678-c40c-4c78-af97-0b186eeda1db" />

<img width="1332" height="692" alt="image" src="https://github.com/user-attachments/assets/6648cd29-20da-4744-b31c-690a5f5841d2" />

<img width="1868" height="1032" alt="{65487719-D0AE-417F-97BB-86A356E47F10}" src="https://github.com/user-attachments/assets/9542eecf-bf41-42e2-b056-83c0cc8e7178" />

<img width="1331" height="707" alt="image" src="https://github.com/user-attachments/assets/8c8b5277-3730-4032-9251-7d50559d23f7" />

<img width="1337" height="695" alt="image" src="https://github.com/user-attachments/assets/d37cc119-3254-4bec-b01b-2513f285fd93" />


### Komandna paleta
- Otvara se sa Ctrl+K i nudi sve akcije aplikacije na jednom mestu: navigaciju, dane nedelje, beleške, alate, izvoz podataka i temu.
- Pretraga radi po nazivu, kategoriji i ključnim rečima, strelicama se bira komanda, Enter izvršava.

<img width="1318" height="884" alt="{0DAB8585-E23A-4DDC-B9BE-080D49A660D1}" src="https://github.com/user-attachments/assets/0e03186d-7606-4f93-8166-6d839a828144" />

### Smene
- Dve smene sa podesivim vremenima početka (podrazumevano jutarnja u 07:15 i popodnevna u 14:00).
- Tri režima rada: ručno biranje smene, automatska promena po satu i rotacija.
- Rotacija može biti nedeljna, mesečna, polugodišnja ili godišnja, sa podesivim datumom sidra, danom promene i početnom smenom.
- Statusna traka u zaglavlju uživo prikazuje tekuću smenu, da li je čas u toku, datum i sat.

<img width="1333" height="703" alt="image" src="https://github.com/user-attachments/assets/6076c435-8912-47d6-8488-67d10f737533" />

### Teme
- Svetla i tamna tema sa prečicom T i animiranom tranzicijom između njih.
- Automatska tema koja menja svetlu i tamnu varijantu prema dobu dana (podesivi satovi).
- Prilagodljiva boja akcenta aplikacije.
- Posebna code tema (SPOILER: opisana niže u sekciji o tajnama) sa CRT efektima: kiša, sken linije, treperenje, korupcija ekrana i invertovanje.

<img width="1332" height="696" alt="image" src="https://github.com/user-attachments/assets/16655ad6-00e2-4522-a8b1-2ef65df993fd" />

### Šta je novo
- Pri prvom otvaranju aplikacije iskače prozor sa pregledom izmena u tekućoj verziji.
- Prozor se prikazuje samo jednom po verziji: kada ga zatvorite, ista poruka se više ne pojavljuje.
- Kada stigne nova verzija (nov sadržaj), prozor se vraća svima koji tu verziju još nisu videli.
- Ručno ga uvek možete otvoriti iz komandne palete (Ctrl+K → „Šta je novo u ovoj verziji”).
- Sadržaj se menja na jednom mestu, u `novine/novine.js`.
<img width="1221" height="890" alt="image" src="https://github.com/user-attachments/assets/d957bf6b-0836-4514-adcc-cebd8124e854" />

### Login i registracija(Samo preko "https://school-information.duckdns.org/" i ako server aktivan)
- Registracija: u modalu naloga izaberi „Registracija", upiši ime i lozinku. Nalog se pravi na serveru, a lozinka se čuva samo kao scrypt heš, nikad u čitljivom obliku.
- Prijava: isto ime i lozinku unosiš na bilo kom uređaju u mreži. Posle prijave podaci se povlače sa servera i čuvaju na nalogu.
- Odjava: dugme „Odjava" u modalu naloga. Ako ima nesinhronizovanih izmena, aplikacija prvo pita da li si siguran

<img width="289" height="450" alt="image" src="https://github.com/user-attachments/assets/0a0e103b-caa4-43bf-8f7b-84f016809d4e" />

<img width="289" height="450" alt="image" src="https://github.com/user-attachments/assets/7707886a-8126-4e9c-896d-f59be84db4f6" />

## Podešavanja servera

- Modal naloga ima dugme „Podešavanja servera" sa jednim poljem: adresom servera.
- Ostavljeno prazno: aplikacija koristi adresu sa koje je otvorena. Tako radi kad si je otvorio sa samog servera, npr. http://192.168.1.20:8080; adresa se prepozna sama.
- Ručni unos: potreban samo kad otvaraš aplikaciju sa diska (index.html duplim klikom) ili sa GitHub Pages. Tada adresa ne može da se prepozna automatski, pa je upiši ovde, npr. http://192.168.1.20:8080.
- Sa Caddy na portu 80: adresa ide bez porta, npr. http://192.168.1.20.
- Adresa se pamti u pregledaču (localStorage), zasebno za svaki uređaj. Na novom uređaju se unosi jednom.
- Ispod polja stoji status veze, pa odmah vidiš da li je adresa dobra: „Server radi i dostupan je" ili „Server nije dostupan".

<img width="290" height="558" alt="image" src="https://github.com/user-attachments/assets/03b40316-5753-4003-8858-e9e17cfd0319" />

<img width="290" height="558" alt="image" src="https://github.com/user-attachments/assets/9190e568-31d2-49f3-a41d-e2221e9723ae" />

<img width="266" height="508" alt="image" src="https://github.com/user-attachments/assets/c02709ec-24c3-403d-a083-5fdae64e3075" />

## Pokretanje

Ne postoji proces instalacije ni build korak.

Može pokrenuti preko linka "https://mug208.github.io/school-information/" i za serverom "https://school-information.duckdns.org/" ili preko fajlova:

1. Preuzmite .zip fajla celog ove web aplikacije.
2. Raspakujte i otvorite folder "skolski-sistem V2.01"
3. Otvorite fajl `index.html` duplim klikom, i volia, web aplikacija se otvario.

Internet veza je potrebna samo za učitavanje Google fontova (Inter i JetBrains Mono). Bez interneta aplikacija normalno radi, uz sistemske rezervne fontove, pa internet nije neophodno u ovoj web aplikaciji.

## Prečice

| Taster | Akcija |
|--------|--------|
| 1 | Raspored časova |
| 2 | Kalendar |
| 3 | Beleške |
| S | Pretraga predmeta u rasporedu (zarez za više predmeta) |
| M | Višestruki izbor časova za grupnu izmenu |
| N | Nova beleška (u tabu Beleške) |
| / | Pretraga beleški |
| T | Promena teme |
| Ctrl+K | Komandna paleta |
| DEL | BIOS podešavanja |
| ? | Spisak svih prečica |
| ESC | Zatvaranje pretrage, palete, modala ili BIOS-a |

Unutar BIOS-a koriste se sopstvene prečice: Gore/Dole za izbor stavke, Levo/Desno za promenu kategorije, Plus/Minus za promenu vrednosti, Enter za izmenu, F1 za pomoć, F9 za podrazumevane vrednosti i F10 za čuvanje i izlaz.

<img width="241" height="280" alt="image" src="https://github.com/user-attachments/assets/b402a25e-daa5-408f-98d3-e910b2cf031e" />


## Tajne i CODE tema

Spoiler:

Aplikacija sadrži namerno skriven CODE modul koji otključava terminalski izgled u stilu starih monohromatskih monitora. Otključava se pronalaženjem pet malih kockica sa slovima C, O, D, E i S, strogo tim redosledom. Sledeća kockica se ne prikazuje dok se prethodna ne pronađe. Svaka kockica nalazi se u drugoj kategoriji aplikacije (raspored, kalendar, BIOS, beleške i modal), a raspored kategorija i tačna mesta nasumično se određuju pri prvom pokretanju i trajno čuvaju u localStorage pod ključem `skolski-info-kocke`. Klik na kockicu pokreće kratku CODE animaciju, a nakon petog slova tema se aktivira.

Nakon otključavanja, CODE tema se uključuje i isključuje otkucavanjem sekvence `codes` bilo gde u aplikaciji (van polja za unos), komandom u komandnoj paleti ili u BIOS-u. Dugme za promenu teme (i taster T) u CODE temi ne vraća običnu temu, već kruži kroz tri CODE varijante: `[D]` tamna, `[S]` svetla i `[A]` automatska. U BIOS-u, kategorija Efekti nudi izbor boje fosfora (zelena, plava, cijan, žuta, crvena, magenta, bela ili prilagođeni heks kod), jačinu efekata od 1 do 10 i pojedinačne efekte: kišu znakova, sken linije, treperenje, korupciju i invertovanje ekrana. Tranzicija između normalne i CODE teme praćena je animacijom zaraze i 

<img width="955" height="715" alt="image" src="https://github.com/user-attachments/assets/c9b9dbfa-f352-4b56-8ec7-557057feeb1f" />

<img width="858" height="714" alt="image" src="https://github.com/user-attachments/assets/e7ca0e98-ff2d-49d7-b28f-4c4b3a097074" />


## Podaci i privatnost

Svi podaci čuvaju se u localStorage pregledača pod ključem `skolski-info-podaci`. Aplikacija funkcioniše potpuno offline.

Struktura sačuvanog JSON dokumenta:

```json
{
  "settings": {
    "schoolName": "Smart Gimnazija",
    "className": "IV-3",
    "language": "en",
    "theme": "dark",
    "periodsCount": 7,
    "periodDuration": 45,
    "subjects": [{ "id": "1", "name": "Srpski jezik", "color": "#ef4444", "teacher": "" }],
    "shifts": {
      "jutarnja": { "name": "Jutarnja smena", "startTime": "07:15", "bigBreakAfterPeriod": 3 },
      "popodnevna": { "name": "Popodnevna smena", "startTime": "14:00", "bigBreakAfterPeriod": 2 }
    }
  },
  "schedule": [
    { "id": "a1b2", "day": 0, "period": 1, "shift": "jutarnja", "subjectId": "2", "room": "301" }
  ],
  "notes": [
    { "id": "c3d4", "title": "Kontrolni iz matematike", "content": "Nedelja dana", "type": "kontrolni", "date": "2026-10-19", "subjectId": "2", "completed": false, "pinned": true }
  ]
}
```

Polje `day` koristi vrednosti 0 do 4 za ponedeljak do petka, `period` je redni broj časa, a `shift` određuje kojoj smeni stavka pripada.

BIOS kategorija Podaci nudi izvoz u JSON fajl (naziv u formatu `skolska-informacija-DD-MM-YYYY.json`), uvoz iz fajla u dva režima: potpuna zamena podataka ili spajanje samo novih beleški bez duplikata, kao i reset svih podataka. Isti alati dostupni su i kroz komandnu paletu. Uz to, BIOS prikazuje statistiku: broj predmeta, beleški, stavki rasporeda i veličinu zauzeća u kilobajtima.

<img width="592" height="18" alt="image" src="https://github.com/user-attachments/assets/59139d6d-0a80-4261-a488-96e01dda67b8" />

Pošto localStorage pripada pregledaču i profilu, redovno izvozite backup, posebno pre čišćenja istorije pregledača ili prelaska na drugi računar.

## Login i sinhronizacija (v2.1)

Od verzije 2.1 aplikacija ima **option** login sistem sa sinhronizacijom podataka. Ključna reč je *option*: ako ne pokrenete server i ne prijavite se, aplikacija radi potpuno isto kao i v2.03 , svi podaci ostaju u localStorage pregledača.

### Kako radi

- **Server dostupan + internet** → možeš da se registruješ/prijaviš. Svaki korisnik dobija **svoj JSON fajl** na serveru (`server/podaci/<ime>.json`), potpuno istog formata kao izvoz iz BIOS-a. Izmene se automatski šalju na server par sekundi posle svakog čuvanja, tako da kada koristite preko drugi uređaja, možete se ulogovati i volia, sve podaci če vam se vratiti koji je poslednji put sačuvan.

<img width="275" height="158" alt="image" src="https://github.com/user-attachments/assets/4b306ba8-7e92-4cec-b1d0-9c1a8a179581" />

- **Server nedostupan / bez interneta** → prijava nije moguća, ali **nije ni potrebna**: aplikacija nastavlja da radi oflajn, podaci se čuvaju lokalno. Zaglavlje prikazuje upozorenje „Server nedostupan , čuvam lokalno", a na pad servera iskoči obaveštenje sa podsetnikom da izvezeš JSON backup (BIOS → Podaci) dok se server ne vrati.
- **Server se vrati** → automatska sinhronizacija preuzima/šalje podatke bez tvog posla.
- **Sukob** (podaci menjani i ovde i na drugom uređaju) → dijalog nudi izbor:
  1. **Zadrži lokalne** , tvoji podaci sa ovog uređaja prebrisaju serverski primerak,
  2. **Zadrži serverske** , serverski primerak prebriše lokalne izmene,
  3. **Spoji** , bezbedan izbor: beleške, časovi i predmeti se spajaju po ID-ju bez duplikata, podešavanja se uzimaju sa novije strane,
  4. **Kasnije** , sinhronizacija se odlaže, izmene ostaju lokalno (sa upozorenjem).

### Pokretanje servera

Jedini uslov: [Node.js](https://nodejs.org) verzija 16 ili novija (LTS). Bez ijedne npm zavisnosti, bez baze , čisti Node.

```bash
# u folderu projekta
node server/server.js

# ili drugi port:
PORT=9000 node server/server.js
```

Server na konzoli ispisuje adrese na kojima sluša, npr:

```text
  Lokalno:    http://localhost:8080/
  U mreži:    http://192.168.1.20:8080/
```

Otvori tu adresu na bilo kom uređaju u kućnoj mreži (telefon, drugi računar) , aplikacija se učitava direktno sa servera i adresa se sama podesi. Ako aplikaciju otvaraš sa GitHub Pages ili sa diska (`index.html` duplim klikom), u modalu naloga klikni „Podešavanja servera" i upiši adresu, npr. `http://192.168.1.20:8080`.

Nalozi, tokeni i podaci korisnika čuvaju se u `server/` folderu:

```text
server/
├── server.js               # ceo server (bez zavisnosti)
├── podaci-korisnici.json   # nalozi: ime + scrypt heš + so (nikad čista lozinka)
├── tokeni.json             # prijavni tokeni (važe 30 dana)
└── podaci/
    └── mug208.json         # podaci korisnika, jedan JSON fajl po korisniku
```

Backup je trivijalan: iskopiraj `server/` folder na USB. Obrisani token = odjava svih uređaja koji ga koriste.

### Spremanje za produkciju (server koji radi non-stop)

Da uređaj postane pravi kućni server: server koji se **sam diže posle butovanja** i **sam restartuje ako padne** (systemd servis), **dnevni backup** na USB ili drugi uređaj, **Caddy** ispred servera za HTTPS ako ikad izađe na internet i uputstvo za **reset zaboravljene lozinke**.

Sve to je u `deploy/` folderu, sa uputstvom korak po korak za Linux i Windows: **`deploy/README.md`**.

### Gde se šta nalazi u aplikaciji

- **Zaglavlje** , dugme sa ikonicom naloga: statusna tačka (zelena = sinhronizovano, žuta = nesinhronizovane izmene, siva = server nedostupan) i statusni čip uz smenu („Sinhronizovano 14:32" i sl.).
- **Modal naloga** , prijava, registracija, pregled naloga (poslednja sinhronizacija, veličina podataka), sinhronizacija sada i odjava.
- **BIOS → Podaci** , nova sekcija „Nalog i sinhronizacija": status, poslednja sinhronizacija, prijava/odjava, sinhronizacija sada, automatska sinhronizacija (uključena/isključena) i adresa servera.
- **Komandna paleta (Ctrl+K)** , komande „Nalog / prijava", „Sinhronizuj sa serverom" i „Odjavi se".

### Tehničke napomene o sinhronizaciji

- Detekcija sukoba radi preko **kanonickog heša** (FNV-1a) podataka: server čuva heš poslednje sačuvane verzije, klijent šalje heš na kome je zasnovao svoje izmene; ako se ne poklapaju, server odgovara `409 Sukob` sa svojim primerkom i frontend prikazuje dijalog. 
- Token (nasumičnih 32 bajta) stoji u localStorage ključu `skolski-info-token`, adresa servera u `skolski-info-server`, a metadata sinhronizacije u `skolski-info-sinhro` , **niko od njih ne ide u izvozni JSON**, tako da format izvoza ostaje identičan starim verzijama.
- Lozinke se hešuju `scrypt`-om sa slučajnom solju, poređenje je konstantno-vremensko, prijava je ograničena na 10 pokušaja po IP-u na 10 minuta.
- Saobraćaj je običan HTTP , za kućnu mrežu u redu. **Ne izlaži server internetu** bez HTTPS proxy-ja (Caddy/nginx), jer token putuje otvoreno.
- Upozorenje: sa HTTPS stranice (GitHub Pages) pregledač **blokira** pozive ka `http://` serveru (mixed content). Zato za prijavu koristi aplikaciju otvorenu sa adrese servera, ili `index.html` sa diska.

## Struktura projekta

```text
skolski-sistem/
├── index.html          # Jedina HTML stranica, učitava sve module
├── osnova/             # Jezgro: podaci, stanje, store, logika, ikonice, skladište, App API
├── nalog/              # Login, registracija i sinhronizacija sa serverom
├── server/             # Node server bez zavisnosti: nalozi, tokeni, JSON fajl po korisniku
├── deploy/             # Produkcija: systemd servis, Caddyfile, backup skripte, vodic
├── testovi/            # Node.js testovi
├── zaglavlje/          # Zaglavlje sa navigacijom, zvonom i statusnom trakom
├── kocke               # Za pronalaženje tajne teme
├── raspored/           # Tab rasporeda (desktop tabela i mobilni pregled)
├── kalendar/           # Tab kalendara
├── beleske/            # Tab beleški sa filterima
├── unos/               # Biraci predmeta sa pretragom (za modale)
├── modal/              # Modalni dijalozi: čas, grupna izmena, beleška, predmet
├── novine/             # Prozor „Šta je novo” i zapamćena viđena verzija
├── toast/              # Sistemska obaveštenja u uglu ekrana
├── komande/            # Komandna paleta (Ctrl+K)
├── novine/             # Za prikaz "Šta je novo" modal kada se ažurira web aplikacija
├── podnozje/           # Podnožje sa prečicama i statusom
├── responsivno/        # Preklopcima usmerena responzivna pravila
├── tema/               # Logika svetle i tamne teme i aktivacija tajni
├── smene/              # Režimi smena i rotacija
├── dogadjaji/          # Nadolazeći događaji i obaveštenja
├── c-tema/             # CODE tema: motor, efekti, kiša znakova, boje
├── v-tema/             # VirusTema: animirane tranzicije između tema(Nije zapravo virus)
├── bios/               # BIOS utility: redovi, navigacija, boot, dijalozi
└── dugmad/             # Stilovi dugmića
```

Konvencija imenovanja: svaki folder je samostalan modul sa svojim JS i CSS fajlovima. Datoteke sa sufiksom `-c.css` (na primer `bios-c.css`, `c-osnova.css`) sadrže stilove za CODE varijantu tog modula. Skripte se učitavaju redosledom definisanim na dnu `index.html`, bez modula u ES smislu kao kod react-a, pa globalni objekti služe kao javni API:

- `window.App`: pristup podacima, podešavanjima, temi, izvozu i statistici.
- `window.Store`: centralni store, jedno mesto za stanje aplikacije.
- `window.Logika`: čiste funkcije bez DOM-a, testabilne u Node.js.
- `window.BIOS`: otvaranje i stanje BIOS utility-a.
- `window.KomandnaPaleta`: otvaranje i zatvaranje komandne palete.
- `window.Novine`: otvaranje prozora „Šta je novo” (`otvori`, `zatvori`, `zaboravi`).
- `window.VTema` i `window.codeEngine`: motori animacija i efekata.

## Arhitektura

### Centralni store

`osnova/store.js` je minimalistički store po Redux: jedno stanje, `dispatch(akcija)` menja stanje kroz registrovane akcije, `subscribe(slušaoc)` obaveštava pretplatnike. Stanje iz `osnova/stanje.js` živi u njemu, a globalne promenljive `podaciAplikacije` i `stanje` su samo most za stari kod. Novi kod umesto direktne dodele koristi `Store.dispatch`, pa je tok promena vidljiv na jednom mestu. Postojeće akcije: `PODACI_ZAMENI`, `TAB_PROMENI`, `DATUM_IZABERI`, `SMENA_POSTAVI`. Nove akcije se dodaju sa `Store.registruj(tip, handler)`.

### Čista logika i testiranje

`osnova/logika.js` sadrži funkcije bez DOM-a i bez globalnog stanja: formatiranje datuma i vremena, proračun vremena časova i odmora, određivanje smene po režimu rada. Sve funkcije primaju argumente i vraćaju rezultat, pa se testiraju bez pregledača. Testovi su u `testovi/test-logika.mjs` i pokreću se sa `npm test` ili `node testovi/test-logika.mjs`, ili preko terminalu vsc `npm.cmd test`.

### ES moduli (Sa upotrebu u buduće)

Novi moduli se postepeno pišu kao ES moduli. Pošto pregledači blokiraju module preko `file://` protokola, glavne skripte ostaju "klasične" i aplikacija i dalje radi duplim klikom na `index.html`. Na dnu `index.html` je ESM most koji preko `http` i `https` uvozi `osnova/dijagnostika.js`, pravi ES modul za praćenje akcija store-a u konzoli (uključi se sa `localStorage` ključem `skolski-info-dijagnostika=1`). Kad projekat radi samo preko servera, ostali moduli se prebacuju na `import` jedan po jedan.

### Konvencija CSS imena

Svaki CSS fajl na vrhu ima komentar sa rezervisanim prefiksom modula (na primer `.toast-`, `.kp-`, `.bios-`, `.vt-`, `.kk-`). Nova klasa u modulu obavezno nosi prefiks modula, čime se sprečavaju kolizije imena i curenje stilova između modula. Za varijante i stanja koristi se BEM obrazac `blok__element--modifikator` gde je prirodno. Fajlovi sa sufiksom `-c.css` prepisuju klase svog modula za CODE temu i učitavaju se posle osnovnih.


## Tehničke napomene

- Ukupno oko 17 000 linija koda u 20 modula, bez ijedne spoljne JavaScript biblioteke.
- Jedina spoljna zavisnost su Google fontovi Inter i JetBrains Mono, učitani sa CDN-a uz rezervne sistemske fontove radi efikasnosti.
- Interfejs je prilagođen ekranima svih veličina: tabela na desktopu, pregled po danu na mobilnom, side-meni na telefonu, kompaktan kalendar na uskim ekranima i dodiru prilagođeni biraci.
- Višejezičnost: engleski (podrazumevan) i srpski, preko `osnova/jezici.js` statički tekstovi koriste `data-i18n` atribute, a dinamički pozivaju `t('kljuc')`.
- Sopstveni set ikonica umesto emoji: crteži na mreži 24 x 24 u `osnova/ikone.js`, ugrađeni u dokument kao SVG simboli, pa rade i offline i pri otvaranju preko `file://`. Boju uzimaju iz `currentColor`, pa sami prate svetlu/tamnu temu i izabranu boju akcenta. U CODE temi se crteži sklanjaju i prikazuje se ASCII zamena iz `data-a`, tako da terminal ostaje čitak bez slika ~i bez mučenja~.
- Sadržaj prati "Accessible Rich Internet Applications" uloge i oznake za čitače ekrana (dialog, listbox, search, progressbar).
- Postoji poseban stil za štampu koji priprema celu nedelju, ili izabrani dan na jednom listu.
- Podaci se serializuju u JSON pri svakoj izmeni, sa zaštitom od oštećenog sadržaja: aplikacija uvek pada na podrazumevane vrednosti umesto da se sruši.
- Podržani su svi savremeni pregledači (Chrome, Firefox, Edge, Zen, itd da ne nabrojavam...) jer se koriste samo standardni API pregledača: localStorage, FileReader, Blob i URL.

## Nadogradnja

Projekat je namerno držan u vanila JavaScriptu da ostane čitljiv i modifikovao ga svako ko zna osnove web razvoja. Tipične izmene:

- Novi predmeti se dodaju u BIOS-u pod kategorijom Predmeti, sa bojom i nastavnikom.
- Trajanje časova i odmora podešavaju se u BIOS-u pod Glavno.
- Vremena automatske teme i sati promene smena menjaju se isto tamo.
- Za nove komande u paleti dodajte objekat u funkciju `kpRegistar` u `komande/komande.js`.
- Za novu verziju prozora „Šta je novo” izmene `NOVINE_VERZIJA` i `NOVINE_STAVKE` u `novine/novine.js` i prozor će se sam prikazati svima koji tu verziju nisu videli.
- Za nove ikonice dodato crtež u `IKONE` u `osnova/ikone.js`, pa je pozivan sa `ikonica('naziv', 'ASCII zamena')`.

Ako menjate strukturu podataka, obavezno ažurirajte normalizaciju u `osnova/skladiste.js`, jer ona garantuje da stari sačuvani podaci ostanu kompatibilni sa novom verzijom.
