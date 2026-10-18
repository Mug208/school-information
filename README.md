# Školski sistem (Školska Informacija v2.01)

Školski Informacija je potpuno samostalan Informacioni sistem namenjeno za učenike(poput mene): raspored časova, kalendar sa događajima i beleške, sve u jednom preglednom interfejsu. Aplikacija radi u bilo kom modernom pregledaču, ne zahteva instalaciju, server ni bazu podataka, a svi podaci ostaju lokalno na vašem računaru.

Projekat je napisan samo u HTML, CSS i JavaScriptu, bez ikakvih frameworka, bundlera ili npm zavisnosti. Dovoljno je otvoriti `index.html` ili preko linka "https://mug208.github.io/skolski-sistem/".

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

<img width="806" height="703" alt="image" src="https://github.com/user-attachments/assets/11561cf2-9227-4356-9ccd-ae4c323fb47e" />


### Kalendar
- Mesečni kalendar u kome svaki datum sa beleškama nose vizuelnu oznaku.
- Klik na datum otvara bočni panel sa beleškama za taj dan i dugmetom za dodavanje nove.
- Kartica sa nadolazećim događajima i obaveštenja u obliku zvona sa brojačem u zaglavlju.
- Prečica za skok na tekući datum dostupna iz komandne palete.

<img width="777" height="711" alt="image" src="https://github.com/user-attachments/assets/dc2b2e1c-6f2a-4e5f-933f-1db4a1b8078d" />


### Beleške
- Šest tipova beleški: kontrolni, pismeni, blic, prezentacija, domaći i ostalo, svaki sa svojom bojom.
- Filteri po tipu sa živim brojačima, polje za pretragu po naslovu i sadržaju.
- Zakačivanje (pin) važnih beleški, označavanje kao završeno i traka napretka.
- Svaka beleška može biti vezana za predmet i datum.

<img width="779" height="703" alt="image" src="https://github.com/user-attachments/assets/1e1d52db-3bf1-42fa-8db9-051391aed5ee" />


### BIOS podešavanja
- Namerno retro, terminalski stilizovan utility za sva podešavanja sistema, otvara se tasterom DEL.
- Šest kategorija: Glavno, Predmeti, Smene, Efekti, Podaci i Izlaz.
- Kompletna kontrola sa tastature, animacija pri pokretanju (boot sekvenca) i upozorenje ako pokušate da izađete sa nesačuvanim izmenama.
- Fabrička podešavanja se mogu vratiti bez brisanja rasporeda, beleški i predmeta.

<img width="1333" height="707" alt="image" src="https://github.com/user-attachments/assets/41c8b678-c40c-4c78-af97-0b186eeda1db" />

<img width="1332" height="692" alt="image" src="https://github.com/user-attachments/assets/6648cd29-20da-4744-b31c-690a5f5841d2" />

<img width="1335" height="706" alt="image" src="https://github.com/user-attachments/assets/9595ec89-d7e4-4019-b7e5-9d4df1ebef04" />

<img width="1331" height="707" alt="image" src="https://github.com/user-attachments/assets/8c8b5277-3730-4032-9251-7d50559d23f7" />

<img width="1337" height="695" alt="image" src="https://github.com/user-attachments/assets/d37cc119-3254-4bec-b01b-2513f285fd93" />


### Komandna paleta
- Otvara se sa Ctrl+K i nudi sve akcije aplikacije na jednom mestu: navigaciju, dane nedelje, beleške, alate, izvoz podataka i temu.
- Pretraga radi po nazivu, kategoriji i ključnim rečima, strelicama se bira komanda, Enter izvršava.

<img width="914" height="660" alt="image" src="https://github.com/user-attachments/assets/5f5b83de-7843-48ce-986f-f1e65511ada2" />

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


## Pokretanje

Ne postoji proces instalacije ni build korak.

Može pokrenuti preko linka "https://mug208.github.io/skolski-sistem/" ili preko fajlova:

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

Svi podaci čuvaju se u localStorage pregledača pod ključem `skolski-info-podaci`. Ništa se ne šalje na internet i aplikacija funkcioniše potpuno offline.

Struktura sačuvanog JSON dokumenta:

```json
{
  "settings": {
    "schoolName": "Smart Gimnazija",
    "className": "IV-3",
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

## Struktura projekta

```text
skolski-sistem/
├── index.html          # Jedina HTML stranica, učitava sve module
├── osnova/             # Jezgro: podaci, stanje, pomoćne funkcije, skladište, App API
├── zaglavlje/          # Zaglavlje sa navigacijom, zvonom i statusnom trakom
├── kocke               # Za pronalaženje tajne teme
├── raspored/           # Tab rasporeda (desktop tabela i mobilni pregled)
├── kalendar/           # Tab kalendara
├── beleske/            # Tab beleški sa filterima
├── unos/               # Biraci predmeta sa pretragom (za modale)
├── modal/              # Modalni dijalozi: čas, grupna izmena, beleška, predmet
├── toast/              # Sistemska obaveštenja u uglu ekrana
├── komande/            # Komandna paleta (Ctrl+K)
├── podnozje/           # Podnožje sa prečicama i statusom
├── responsivno/        # Preklopcima usmerena responzivna pravila
├── tema/               # Logika svetle i tamne teme i aktivacija tajni
├── smene/              # Režimi smena i rotacija
├── dogadjaji/          # Nadolazeći događaji i obaveštenja
├── c-tema/             # CODE tema: motor, efekti, kiša znakova, boje
├── v-tema/             # VirusTema: animirane tranzicije između tema
├── bios/               # BIOS utility: redovi, navigacija, boot, dijalozi
└── dugmad/             # Stilovi dugmića
```

Konvencija imenovanja: svaki folder je samostalan modul sa svojim JS i CSS fajlovima. Datoteke sa sufiksom `-c.css` (na primer `bios-c.css`, `c-osnova.css`) sadrže stilove za CODE varijantu tog modula. Skripte se učitavaju redosledom definisanim na dnu `index.html`, bez modula u ES smislu kao kod react-a, pa globalni objekti služe kao javni API:

- `window.App`: pristup podacima, podešavanjima, temi, izvozu i statistici.
- `window.BIOS`: otvaranje i stanje BIOS utilityja.
- `window.KomandnaPaleta`: otvaranje i zatvaranje komandne palete.
- `window.VTema` i `window.codeEngine`: motori animacija i efekata.

## Tehničke napomene

- Ukupno oko 15 400 linija koda u 19 modula, bez ijedne spoljne JavaScript biblioteke.
- Jedina spoljna zavisnost su Google fontovi Inter i JetBrains Mono, učitani sa CDN-a uz rezervne sistemske fontove radi efikasnosti.
- Interfejs je prilagođen ekranima svih veličina: tabela na desktopu, pregled po danu na mobilnom, posebno mobilni meni i biraci, ukratko dodato je responsivnost za sve ekrane.
- Ikonice po principu emoji ili ASCII zamene, tako da su u stripujućim režimima čitke, bez slika ~i bez mučenja~.
- Sadržaj prati "Accessible Rich Internet Applications" uloge i oznake za čitače ekrana (dialog, listbox, search, progressbar).
- Postoji poseban stil za štampu koji priprema celu nedelju, ili izabrani dan na jednom listu.
- Podaci se serializuju u JSON pri svakoj izmeni, sa zaštitom od oštećenog sadržaja: aplikacija uvek pada na podrazumevane vrednosti umesto da se sruši.
- Podržani su svi savremeni pregledači (Chrome, Firefox, Edge, Safari) jer se koriste samo standardni API pregledača: localStorage, FileReader, Blob i URL.

## Nadogradnja

Projekat je namerno držan u vanilin JavaScriptu da ostane čitljiv i modifikovao ga svako ko zna osnove web razvoja. Tipične izmene:

- Novi predmeti se dodaju u BIOS-u pod kategorijom Predmeti, sa bojom i nastavnikom.
- Trajanje časova i odmora podešavaju se u BIOS-u pod Glavno.
- Vremena automatske teme i sati promene smena menjaju se isto tamo.
- Za nove komande u paleti dodajte objekat u funkciju `kpRegistar` u `komande/komande.js`.

Ako menjate strukturu podataka, obavezno ažurirajte normalizaciju u `osnova/skladiste.js`, jer ona garantuje da stari sačuvani podaci ostanu kompatibilni sa novom verzijom.
