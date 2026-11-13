# Plan 🐾

Eine ruhige, übersichtliche To-do-App mit Babytieren zum Sammeln. Sie läuft als Web-App auf dem iPhone, ohne App Store.

## Was die App kann

- **Listen** mit eigenen Kategorien. Jede Kategorie hat eine Farbe und ein eigenes Babytier.
- **💛 Wichtig** wird gelb markiert und **✓ Erledigt** grün, wie mit Textmarker auf dem Zettel.
- **Kleine Schritte:** Jede Aufgabe lässt sich in Mini-Schritte zerlegen. Jeder Schritt zählt.
- **☀️ Für heute:** 1–3 Sachen aussuchen statt die ganze Liste anzustarren.
- **🎯 Nur eine Sache:** zeigt eine einzige Aufgabe groß an. Man kann sie „kleiner machen“ oder „was anderes“ wählen.
- **⏳ 5-Minuten-Starthilfe:** ein sanfter Timer nach dem Motto „nur kurz anfangen“.
- **Babytiere:** Nach 3 Haken (einstellbar) schlüpft ein Tier, oft mit Häkelmütze, Häkelschal oder Häkelblume.
  Es gibt Pinguin-Küken, Fohlen, Steinböckchen, Hundewelpe, Kätzchen, Häschen, Fuchsbaby, Eisbärbaby, Highland-Kälbchen, Entenküken, Tigerbaby und Otterbaby (sammelt Steine).
  Name, Fell und Outfit lassen sich jederzeit ändern.
- **Tierwiese:** eine Landschaft zum Wischen mit 40 Gebieten zum Freischalten (Wald, Berge, Gletscher, Fjord, Vulkaninsel …) und 440 Plätzen.
  Jeder Haken gibt 1 🪨 Kiesel. Im Wiesen-Laden gibt es über 80 Sachen: Sternbilder für den Himmel, Bäume, Brunnen, Flüsse, Nordlicht, Bücherei, Schokohäuschen und mehr.
  Sie richtet sich nach Tageszeit und Jahreszeit, und ab und zu taucht ein Fundstück auf.
- **Kein Druck:** keine roten Fristen, keine Streaks, Tiere gehen nie verloren.
- **Ruhemodus** (ohne Animationen), **3 Textgrößen** und **8 kräftige Farbthemen** (Meer, Himmel, Gipfel, Türkis, Wald, Herbst, Sonne, Nacht).
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

## Erweitern, ohne etwas kaputt zu machen

Alle gespeicherten Daten hängen an **festen IDs** (Tiere, Gadgets, Gebiete, Plätze) und nie an Positionen in Listen.
Deshalb gelten diese Regeln:

1. **IDs nie ändern oder wiederverwenden.** Namen und Aussehen darfst du jederzeit ändern, die `id` nicht.
2. **Neues immer anhängen:**
   - Tier: `animals.js` → `KINDS`
   - Gadget: `world.js` → Liste `G` (mit `group`, `price`, `d`; Himmels-Gadgets mit `sky: true`)
   - Gebiet: `world.js` → `REGIONS`. Es erscheint dann als nächstes Gebiet zum Freischalten.
   - Gebietstyp (Aussehen): `world.js` → `BIOME` und `region()`
   - Fundstück: `world.js` → `FINDS`
3. **Datenformat geändert?** In `app.js` `SCHEMA` um 1 erhöhen und in `MIGRATIONS` einen Schritt ergänzen.
   Alte Backups werden beim Laden Schritt für Schritt umgestellt.
4. **Nichts wird stillschweigend gelöscht:** Unbekannte IDs, z. B. aus einem Backup einer neueren Version, bleiben gespeichert und werden nur nicht angezeigt.
5. Nach jeder Änderung die Versionsnummer in `sw.js` erhöhen.

**Karten:** Die Wiese ist als „Karte“ gespeichert (`state.world.maps`). Darin stehen die freigeschalteten Gebiete, die Plätze und die Fundstücke.
Eine volle Karte kann später archiviert werden (`archived: true`) und eine neue begonnen werden.
Die gekauften Gadgets (`state.inv`), die Kiesel und die Tiere gehören der Person, nicht der Karte, und ziehen deshalb mit um.
