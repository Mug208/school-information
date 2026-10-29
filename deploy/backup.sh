#!/usr/bin/env bash
# Dnevni backup podataka Skolske Informacije: nalozi, tokeni i podaci svih korisnika.
# Sve sto skripta kopira je u server/ folderu projekta.
#
# Rucno pokretanje:
#   ./backup.sh                          (kopija ide u ~/backup-skolska-info)
#   ./backup.sh /media/korisnik/USB      (kopija na USB)
#
# Pokretanje iz cron-a svaki dan u 02:30 (na USB):
#   crontab -e   pa dodaj liniju:
#   30 2 * * * /home/korisnik/school-information/deploy/backup.sh /media/korisnik/USB >> /home/korisnik/backup.log 2>&1
#
# Svaki dan pravi novi folder sa datumom. Cuva se poslednjih 14 dana, stariji se brisu.
# Ako zelis vise dana:  ./backup.sh /putanja 30

set -euo pipefail

PROJEKAT="$(cd "$(dirname "$0")/.." && pwd)"
CELISHTE="${1:-$HOME/backup-skolska-info}"
DANAS="$(date +%F)"
CUVA_DANA="${2:-14}"

ODREDISTE="$CELISHTE/$DANAS"
mkdir -p "$ODREDISTE/podaci"

# Kopiranje naloga i tokena (ako postoje).
[ -f "$PROJEKAT/server/podaci-korisnici.json" ] && cp -a "$PROJEKAT/server/podaci-korisnici.json" "$ODREDISTE/" || true
[ -f "$PROJEKAT/server/tokeni.json" ] && cp -a "$PROJEKAT/server/tokeni.json" "$ODREDISTE/" || true

# Kopiranje podataka svih korisnika.
cp -a "$PROJEKAT/server/podaci/." "$ODREDISTE/podaci/"

# Brisanje starijih dnevnih kopija od CUVA_DANA dana.
# Obrazac '????-??-??' hvata samo foldere u obliku datuma (npr. 2026-10-28),
# pa slucajan folder sa drugacijim imenom u backup folderu nikad nece biti obrisan.
find "$CELISHTE" -mindepth 1 -maxdepth 1 -type d -name '????-??-??' -mtime +"$CUVA_DANA" -exec rm -rf {} +

echo "Backup zavrsen u: $ODREDISTE"
du -sh "$ODREDISTE" 2>/dev/null || true

# Podsetnik: ovo je kopija na isti disk. Za pravu sigurnost ubaci USB
# (kao argument iznad) ili drugi racunar u mrezi (ssh + rsync).
