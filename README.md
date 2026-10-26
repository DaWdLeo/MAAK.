# WERKSTATT – gemeinsamer Renovierungsplaner · Version 0.2

Eine vollständig statische, deutschsprachige Web-App für die Drei-Raum-Werkstatt. 20 gemeinsame Arbeitspakete / 49 Einzelmaßnahmen aus dem Renovierungsplan, vierwöchiger Orientierungsplan, Kalender, Material, Kosten und Einstimmigkeits-Abstimmungen.

## GitHub Pages (ohne Build oder Server)

1. Neues **öffentliches** Repository, z. B. `werkstatt-planer`, unter eurem GitHub-Konto erstellen. **Nur den Quellcode** aus diesem Ordner hochladen, keine exportierten JSON-Dateien, Namen oder Belege.
2. Ordnerinhalt so auf den Branch `main` legen, dass `index.html` im Repository-Hauptverzeichnis steht.
3. In `Settings → Pages → Build and deployment`: `Deploy from a branch`, `main`, `/(root)` auswählen und speichern.
4. Die App unter `https://<GitHub-Benutzername>.github.io/werkstatt-planer/` öffnen. Auf dem Smartphone über „Zum Startbildschirm hinzufügen“ installieren, falls vom Browser angeboten.
5. Jedes Mitglied wählt auf seinem Gerät seinen eigenen Namen unter „Aktiv als“ und importiert zunächst dasselbe aktuelle Änderungsprotokoll oder dieselbe Vollsicherung.

## Wichtiger Ablauf für drei Mitglieder

- **Neue oder geänderte Aufgaben** und **Beschaffungsanträge** werden erst nach drei Zustimmungen freigegeben. Die Zustimmung bezieht sich auf die exakte Revision mit den abgestimmten Aufgaben-, Zeit- und Kostenangaben.
- Nach jeder Arbeitssitzung Fortschritt, Arbeitsprotokolle, Verfügbarkeiten und ggf. Einkäufe ergänzen.
- Unter „Synchronisieren“ das **Änderungsprotokoll** als JSON exportieren und z. B. über WhatsApp teilen.
- Die anderen importieren das JSON über **Prüfen & zusammenführen**. Ereignisse haben IDs: erneuter Import erzeugt keine Doppelungen.
- **Alle bekannten Ereignisse** werden in jeder Änderungsdatei mitgegeben (nicht nur seit dem letzten Export). Das verhindert fehlende Vorgänger-Versionen und macht den Abgleich robuster.
- **Vollsicherung** regelmäßig separat speichern. Bei „Vollsicherung wiederherstellen“ wird erst ein Backup der lokalen Daten heruntergeladen; nur auf ausdrücklichen Wunsch werden die lokalen Daten ersetzt.
- Werden zwei Aufgaben-/Material-/Terminänderungen aus derselben Vorgängerversion erstellt, sind sie ein **Konflikt**. Unter „Synchronisieren“ wird eine Fassung ausgewählt. Die resultierende neue Version muss erneut freigegeben werden.
- Fotos und Belege werden **nicht** in der App gespeichert. Beleg-Dateinamen lassen sich in Notizen referenzieren, damit JSON klein und problemlos via WhatsApp austauschbar bleibt.

## Datenspeicherung & Sicherheit

- Lokal in **IndexedDB**, optionaler Offline-Zugriff nach erstem Besuch mittels Service Worker.
- Keine Server-Datenbank, kein automatischer Abgleich, keine Benutzer-Authentifizierung. Der aktive Name ist eine **Selbstauskunft**. Das 3/3-System ist ausschließlich eine vertrauensbasierte Organisationshilfe, kein revisionssicherer Identitätsnachweis.
- GitHub Pages ist öffentlich. **Keine Projekt-JSON-Dateien in das Repository pushen**; diese enthalten ggf. Namen, Ausgaben und Abstimmungsergebnisse.
- Browser-Daten können bei Cache-Löschung, in privatem Modus oder durch Systembereinigung verloren gehen. Regelmäßig JSON exportieren.
- Elektrische Arbeiten und prüfpflichtige Maßnahmen nur fachkundig ausführen bzw. prüfen lassen. Schimmel-/Schadstoffrisiken vor staubintensiver Renovierung abklären; die Zustimmung innerhalb der App ersetzt keine rechtlichen oder fachlichen Freigaben.
- Freigaben und materielle Budgets werden durch den Code geprüft, solange Änderungen ausschließlich regulär über die UI erfolgen. Manipulierte JSON-Dateien oder lokale Browser-Entwicklertools können diese Prüfungen umgehen.

## Lokaler Test

Da JavaScript-Module verwendet werden, nicht direkt die Datei per Doppelklick öffnen, sondern lokal im Ordner z. B. `python -m http.server 8000` ausführen und `http://localhost:8000` öffnen.

Reine Datenlogik testen mit `node --test tests/*.mjs`.

## Architekturskizze

- `src/data.js`: fest definierter Startplan; 20 Aufgabenpakete, 49 Schritte, 10 Materialposten, 4 Wochen Arbeitsrhythmus.
- `src/core.js`: revisionsbasierte Ereignislogik, 3/3-Freigabe, Dateiformatvalidierung, Konflikterkennung.
- `src/app.js`: Oberfläche, Ereignisse, IndexedDB, Import/Export.
- `sw.js`: Offline-Asset-Cache.

Stand: MVP v0.2, Oktober 2026.

### Beschaffungsstatus und Auslagen

Neben der 3/3-Freigabe gibt es für Material die Zustände „Bedarf“, „Geplant“, „Bestellt“, „Beschafft“ und „Vorhanden“. Bestellen und Beschaffen sind ohne drei Zustimmungen gesperrt. Alle Auslagen werden nach zahlendem Mitglied ausgewertet; eine Ausgabe über dem genehmigten Kostenrahmen wird abgewiesen. Arbeitseinsätze werden in **Kalenderstunden** und **Personenstunden** getrennt ausgewiesen.


## Neu in v0.2 – Freigabeanfragen an die drei Mitglieder

1. Eine Aufgabe, Material oder ein Kleinanzeigenangebot öffnen. Die **aktuelle Fassung** ist entscheidend.
2. **„Approval an Mitglieder senden“** wählen. Für jede Person wird eine adressierte WhatsApp-Nachricht mit Prüflink vorbereitet. Der Absender öffnet WhatsApp, wählt den Empfänger und sendet selbst.
3. Der Empfänger öffnet den Link. Die App vergleicht die **genaue Revisions-ID** mit dem lokalen Datenbestand. Falls die Fassung fehlt oder abweicht, wird die Zustimmung gesperrt und der Import der aktuellen JSON-Datei verlangt.
4. Mit dem eigenen Mitgliedsprofil **Zustimmen / Änderung vorschlagen / Ablehnen** wählen. Anschließend **„Stimme als JSON teilen“**, um das Änderungsprotokoll in der privaten WhatsApp-Gruppe zu veröffentlichen. Alle drei importieren die Protokolle.
5. Erst wenn im zusammengeführten Projektstand alle drei Stimmen für genau diese Version als **Ja** erfasst sind, ist die Freigabe erteilt. Jeder neue Änderungsstand lässt frühere Freigaben für diese Aufgabe/Material/Anzeige verfallen.

**Keine echte Adobe-Sign-Integration:** Es wird keine Nachricht automatisch verschickt, keine verbindliche elektronische Signatur erzeugt und keine Identität kryptografisch überprüft. Die WhatsApp-Nachricht und der Weblink sind lediglich eine persönliche Freigabeanforderung. Das System bleibt offline und vertrauensbasiert. Ohne gleichen aktuellen Datenstand können die Empfänger nicht direkt abstimmen.

## Neu in v0.2 – Kleinanzeigen / Preisvergleich

- Unter **Kleinanzeigen** können beliebig viele HTTPS-Links von `kleinanzeigen.de` erfasst werden.
- Pro Link sind **Angebotspreis, Versand- oder Abholkosten, Bezeichnung, Verkäufer/Ort, Status und Materialbezug** hinterlegt.
- Sortierung automatisch nach **Gesamtbetrag = Angebotspreis + eingegebene Zusatzkosten**; nicht verfügbare Angebote stehen hinten.
- Angebote können selbst 3/3-genehmigt werden. Ändert sich der Preis oder der Angebotsinhalt, wird eine neue Fassung mit neuer Abstimmung erstellt.
- Innerhalb eines Materialpostens werden seine Angebote ebenfalls nach Kosten angezeigt. Beim Erfassen einer Ausgabe lässt sich ein genehmigtes Angebot als Referenz wählen. Das Materialbudget und die Freigabe des Materialpostens bleiben zusätzlich verpflichtend.
- Kein Scraper: Angebote und Preise werden **nicht automatisch** von Kleinanzeigen abgerufen. Ein URL-Eintrag erfasst keine Anzeige offline und überprüft weder Preis noch Verfügbarkeit; diese müssen manuell geprüft und bei Änderungen aktualisiert werden. Bilder und Anzeigeninhalte werden nicht kopiert.

## Neu in v0.2 – Protokollgruppe in WhatsApp

Für die Dateisynchronisierung eine **private WhatsApp-Gruppe** mit ausschließlich den drei Mietern anlegen, etwa `WERKSTATT | PROTOKOLLE`. Die Gruppendateien gehören **nicht** in das öffentliche GitHub-Repository.

Nach jedem Arbeitseinsatz und vor gemeinsamen Beschlussfassungen unter **Synchronisieren → „Protokoll teilen“** die JSON-Datei über das systemeigene Teilen-Menü an diese Gruppe geben. Falls ein Browser das direkte Dateiteilen nicht unterstützt, wird die JSON-Datei lokal heruntergeladen und muss anschließend manuell als Dokument in der Gruppe versendet werden.

**Wichtig:** Ein offizieller WhatsApp-**Kanal** ist öffentlich, für einseitige Meldungen gedacht und nicht geeignet, um vertrauliche Projektdaten und JSON-Dateien unter drei Personen auszutauschen. **Eine private WhatsApp-Gruppe** ist der korrekte Ort.

## Datenformat und Updates

- Das vorhandene Datenformat (`schema: 1`) bleibt für ältere Aufgaben/Protokolle lesbar; neue `offer_revision`-Datensätze benötigen die App ab v0.2.
- Ein bestehender GitHub-Pages-Stand kann aktualisiert werden, indem die **App-Quelldateien** durch die Dateien dieser ZIP ersetzt werden. Die individuellen IndexedDB-Daten bleiben im gleichen Origin und Browser erhalten; dennoch **zuvor eine JSON-Vollsicherung** erstellen.
- Die App wird von GitHub Pages veröffentlicht, aber GitHub speichert oder verteilt eure JSON-Dateien **nicht**. Es gibt weder automatischen WhatsApp-Versand noch Hintergrundsynchronisation.
- Die Nutzung von Freigabelinks ist am sinnvollsten, sobald die Seite unter einer echten GitHub-Pages-URL veröffentlicht wurde. Vorher zeigen lokale Links nur auf den Rechner des Erstellers.

## Qualitätssicherung

23 automatisierte Node.js-Tests prüfen die ursprünglichen Kernregeln und neuen Kleinanzeigen-/Freigabeabläufe. Der vollständige End-to-End-Test in einem realen Browser war in der Entwicklungsumgebung aufgrund einer lokalen Zugriffssperre nicht möglich. Vor produktiver Nutzung auf den drei Smartphones bitte den Export/Import samt parallelen Stimmen einmal manuell durchspielen.
