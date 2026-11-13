# Plan 🐾

Eine ruhige To-do-App mit Babytieren zum Sammeln. Sie ist läuft als Web-App auf dem iPhone, ohne App Store.

## Was die App kann

- **Listen** mit eigenen Kategorien. Jede Kategorie hat eine Farbe und ein eigenes Babytier.
- **💛 Wichtig** wird gelb markiert und **✓ Erledigt** grün, wie mit Textmarker auf dem Zettel.
- **Kleine Schritte:** Jede Aufgabe lässt sich in Mini-Schritte zerlegen. Jeder Schritt zählt.
- **☀️ Für heute:** 1–3 Sachen aussuchen statt die ganze Liste anzustarren.
- **🎯 Nur eine Sache:** zeigt eine einzige Aufgabe groß an. Man kann sie „kleiner machen“ oder „was anderes“ wählen.
- **⏳ 5-Minuten-Starthilfe:** ein sanfter Timer nach dem Motto „nur kurz anfangen“.
- **Babytiere:** Nach 3 Haken (einstellbar) schlüpft ein Tier, oft mit Häkelmütze, Häkelschal oder Häkelblume.
  Es gibt Pinguin-Küken, Fohlen, Steinböckchen, Hundewelpe, Kätzchen, Häschen, Fuchsbaby, Eisbärbaby, Highland-Kälbchen und Entenküken.
  Name, Fell und Outfit lassen sich jederzeit ändern.
- **Kein Druck:** keine roten Fristen, keine Streaks, Tiere gehen nie verloren.
- **Ruhemodus** (ohne Animationen), **3 Textgrößen** und **6 Farbthemen** inklusive Nachtmodus.
- **Rückgängig** nach jedem Abhaken und Löschen.

Alle Daten bleiben **nur auf dem iPhone**. Es gibt keinen Account und keine Cloud. Die ganze App ist kleiner als 200 KB.

## Auf ihr iPhone bringen

Die App muss einmal irgendwo online liegen, und zwar kostenlos. Danach funktioniert sie auch offline.

**Variante A: Netlify (am einfachsten)**
1. Auf https://app.netlify.com/drop einen kostenlosen Account anlegen.
2. Den Ordner `Todo` per Drag & Drop hochladen. **Vorher den Ordner `import/` herausnehmen**, denn er enthält ihre private Liste.
3. Du bekommst eine Adresse wie `https://irgendwas.netlify.app`. Den Namen kannst du in den Site-Einstellungen ändern.

**Variante B: GitHub Pages**
1. Das Repository auf GitHub pushen. `import/` steht in `.gitignore` und wird deshalb nicht hochgeladen.
2. Unter *Settings → Pages* den Branch `main` auswählen.

**Auf dem iPhone:**
1. Die Adresse in **Safari** öffnen. Es muss Safari sein, nicht Chrome.
2. Auf **Teilen** (□↑) und dann **„Zum Home-Bildschirm“** tippen. Den Namen kann man dabei frei wählen.
3. Fertig: Die App hat jetzt ein eigenes Icon und läuft im Vollbild.

## Ihre Liste vom Zettel übernehmen

`import/zettel.json` enthält ihre abgetippte Liste: Gelb ist als „wichtig“ markiert, Grün als „erledigt“.
1. Die Datei per AirDrop aufs iPhone schicken oder in iCloud Drive legen.
2. In der App: **Einstellen → „Backup oder Liste laden“ →** Datei auswählen.
3. Die erledigten Aufgaben bringen gleich ein paar Begrüßungs-Babytiere mit 🐣

Ein paar Wörter waren auf dem Foto schwer lesbar. Bei diesen Aufgaben steht in der Notiz „bitte prüfen“.

## Neues Handy / Backup

**Einstellen → „Backup speichern“** erstellt eine kleine Datei mit Aufgaben, **allen Tieren** (mit Namen und Outfit), dem Fortschritt und den Einstellungen.
Auf dem neuen Handy öffnet man die App und wählt **„Backup laden“**. Dort gibt es zwei Möglichkeiten: „Alles übernehmen“ oder „Nur die Tiere dazuholen“.

## Updates einspielen

Nach Änderungen am Code in `sw.js` die Versionsnummer erhöhen (`plan-v1` → `plan-v2`) und neu hochladen.
Die App holt sich die neue Version beim nächsten Öffnen mit Internet. Ihre Daten bleiben dabei erhalten.

## Neue Tiere hinzufügen

In `animals.js` unter `KINDS` einen neuen Eintrag anlegen: Name, Fellfarben und eine `draw`-Funktion mit SVG in einem 100×100-Raster.
Das neue Tier erscheint dann automatisch in der Auswahl.
