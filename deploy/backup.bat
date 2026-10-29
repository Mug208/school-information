@echo off
rem Dnevni backup podataka Skolske Informacije na Windows-u (robocopy).
rem Kopira naloge, tokene i podatke svih korisnika iz server/ foldera.
rem
rem Rucno pokretanje: dvoklik na ovaj fajl.
rem Automatski svaki dan: Task Scheduler (Task Scheduler Library -> Create Basic Task):
rem   1. Trigger: Daily, npr. 02:30
rem   2. Action: Start a program -> ovaj backup.bat
rem
rem PROMENI: slovo diska ili putanju u CELISHTE na svoj USB ili drugi folder.
rem Napomena: robocopy /MIR pravi ogledalnu kopiju (brise fajlove kojih vise nema).
rem Datum kopije pamti se u ime fajlova ispod, a starije kopije idu u podfolder.

setlocal
set "PROJEKAT=%~dp0.."
set "CELISHTE=D:\skolska-info-backup"
set "DANAS=%DATE:~10,4%-%DATE:~7,2%-%DATE:~4,2%"

if not exist "%CELISHTE%" mkdir "%CELISHTE%"

rem Nalozi i tokeni sa datumom u imenu.
if exist "%PROJEKAT%\server\podaci-korisnici.json" copy /Y "%PROJEKAT%\server\podaci-korisnici.json" "%CELISHTE%\podaci-korisnici-%DANAS%.json" >nul
if exist "%PROJEKAT%\server\tokeni.json" copy /Y "%PROJEKAT%\server\tokeni.json" "%CELISHTE%\tokeni-%DANAS%.json" >nul

rem Podaci svih korisnika: ogledalna kopija u podfolder sa danasnjim datumom.
robocopy "%PROJEKAT%\server\podaci" "%CELISHTE%\podaci-%DANAS%" /MIR /R:2 /W:2 /NFL /NDL /NJH /NJS

rem Cuvanje samo poslednjih 14 dnevnih kopija (brise starije podaci-YYYY-MM-DD).
rem Obrazac "podaci-????-??-??" hvata samo foldere u obliku datuma, pa ostala
rem imena (npr. "podaci-20 stvari") ne dira.
forfiles /P "%CELISHTE%" /M "podaci-????-??-??" /D -14 /C "cmd /c if @isdir==TRUE rmdir /S /Q @path" 2>nul

rem Isto pravilo za naloge i tokene sa datumom u imenu (fajlovi, ne folderi).
forfiles /P "%CELISHTE%" /M "podaci-korisnici-????-??-??.json" /D -14 /C "cmd /c if @isdir==FALSE del /Q @path" 2>nul
forfiles /P "%CELISHTE%" /M "tokeni-????-??-??.json" /D -14 /C "cmd /c if @isdir==FALSE del /Q @path" 2>nul

echo.
echo Backup zavrsen u: %CELISHTE%
pause
