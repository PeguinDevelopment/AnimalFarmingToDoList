# Plan 🐾

Eine ruhige, übersichtliche To-do-App mit Babytieren zum Sammeln.
Wer Aufgaben abhakt, lässt Babytiere schlüpfen und gestaltet nach und nach eine eigene Landschaft.

Plan ist eine **Progressive Web App (PWA)**: Sie läuft im Browser, lässt sich auf iPhone, iPad, Android und dem Desktop wie eine normale App installieren und funktioniert danach auch offline.
Es gibt keinen Account und keinen Server, alle Daten bleiben auf dem Gerät.

> Wie man die App veröffentlicht und auf Geräten installiert, steht in **[DEPLOY.md](DEPLOY.md)**.

## Funktionen

**Aufgaben**
- Listen mit eigenen Kategorien, jede mit Farbe und eigenem Babytier
- **Wichtig** wird gelb hinterlegt, **erledigt** grün, wie mit einem Textmarker
- **Mini-Schritte:** Aufgaben lassen sich in kleine Schritte zerlegen, und jeder Schritt zählt
- **Für heute:** 1–3 Aufgaben auswählen statt die ganze Liste vor sich zu haben
- **Eine Sache:** zeigt nur eine Aufgabe, mit „Kleiner machen“ und „Was anderes“
- **5-Minuten-Starthilfe:** ein sanfter Timer zum Anfangen
- „Rückgängig“ nach jedem Abhaken und Löschen
- Pro Liste sind höchstens 6 offene Aufgaben sichtbar, der Rest ist eingeklappt

**Babytiere**
- 12 Tierarten mit mehreren Fellfarben, z. B. Pinguin-Küken, Steinböckchen, Highland-Kälbchen und Otterbaby
- Nach einer einstellbaren Zahl von Haken schlüpft ein Tier aus einem Ei
- Zubehör wie Häkelmütze, Häkelschal, Buch oder Schokolade; Name, Fell und Outfit sind frei änderbar
- Jedes Tier hat einen festen Platz auf der Wiese und kann versetzt werden; Tiere überlappen sich nie

**Tierwiese**
- Eine Landschaft zum Wischen mit **40 Gebieten** in 17 Landschaftstypen, z. B. Wald, Gletscher, Fjord, Moor oder Vulkaninsel
- Jeder Haken bringt 1 🪨 Kiesel. Damit werden Gebiete freigeschaltet und Dinge im **Wiesen-Laden** gekauft. Vor jedem Kauf zeigt ein Fenster eine Vorschau und den Preis.
- Über 120 Dinge im Laden, z. B. 45 Baum- und Straucharten, Brunnen, Flüsse, Sternbilder, Nordlicht und Bücherei
- 440 Deko-Plätze (am Boden und am Himmel) und 720 Tierplätze
- Tag und Nacht sowie die Jahreszeiten folgen der echten Uhrzeit und dem Datum
- Ab und zu liegt ein Fundstück auf der Wiese

**Belohnungen ohne Druck**
- **Tagesgeschenk:** Kiesel beim ersten Öffnen am Tag, ein neuer Tag beginnt um 6 Uhr
- **Schatztruhe** nach 7 gesammelten Tagen. Die Tage müssen nicht aufeinander folgen. In der Truhe wählt man einen Wunsch-Gutschein oder ein exklusives Premium-Sternbild.
- Keine Fristen, keine Streaks, nichts geht verloren

**Bedienung**
- 8 Farbthemen, darunter ein Nachtmodus
- 3 Textgrößen
- Ruhemodus ohne Animationen; die Einstellung „Bewegung reduzieren“ des Systems wird automatisch beachtet
- Große Tippflächen und eine vorhersehbare Navigation

## Technik

- Reines HTML, CSS und JavaScript, **ohne Abhängigkeiten und ohne Build-Schritt**
- Alle Grafiken werden als SVG im Code gezeichnet, es gibt keine Bilddateien außer den App-Icons
- Daten liegen im `localStorage` des Browsers; ein Service Worker sorgt für den Offline-Betrieb
- Gesamtgröße etwa 300 KB

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst der Seite |
| `app.js` | App-Logik: Aufgaben, Belohnungen, Ansichten, Speicherstand und Migrationen |
| `animals.js` | Babytiere, Zubehör und Namen |
| `world.js` | Tierwiese: Gebiete, Landschaft, Gadgets, Sternbilder und Fundstücke |
| `styles.css` | Gestaltung und Farbthemen |
| `sw.js` | Service Worker für den Offline-Betrieb |
| `manifest.webmanifest`, `icons/` | Angaben und Icons für die Installation |

## Lokal starten

Im Projektordner einen einfachen Webserver starten, zum Beispiel:

```bash
python -m http.server 8000
```

Danach `http://localhost:8000` öffnen. Ein Doppelklick auf `index.html` funktioniert auch, dann allerdings ohne Offline-Modus.

In den Einstellungen gibt es einen versteckten Debug-Bereich: Tippt man fünfmal schnell auf „Mit 💛 gemacht“, erscheint er. Dort lassen sich alle Daten löschen, vorher wird automatisch ein Backup gespeichert.

## Daten, Backup und Import

- **Backup speichern** (Einstellungen) erstellt eine JSON-Datei mit allen Aufgaben, Tieren, Kieseln, der Wiese und den Einstellungen.
- **Backup laden** bietet zwei Möglichkeiten: „Alles übernehmen“, z. B. für ein neues Gerät, oder „Nur die Tiere dazuholen“.
- Über denselben Knopf lassen sich auch **Aufgabenlisten importieren**. Das Format sieht so aus:

```json
{
  "type": "pfoetchenplan-liste",
  "lists": [
    {
      "name": "Uni",
      "tasks": [
        { "title": "Hausarbeit gliedern", "important": true },
        { "title": "Literatur suchen", "done": true },
        { "title": "Umzug", "subtasks": ["Kisten holen", "Ummelden"] }
      ]
    }
  ]
}
```

Fehlt eine Liste in der App, wird sie angelegt. Bereits erledigte Aufgaben zählen dabei gleich für die Babytiere.
Persönliche Listen gehören in den Ordner `import/`, der per `.gitignore` aus dem Repository herausgehalten wird.

## Erweitern, ohne etwas kaputt zu machen

Alle gespeicherten Daten hängen an **festen IDs** (Tiere, Gadgets, Gebiete, Plätze) und nie an Positionen in Listen. Deshalb gilt:

1. **IDs nie ändern oder wiederverwenden.** Namen und Aussehen dürfen sich ändern, die `id` nicht.
2. **Neues immer anhängen:**

   | Neues … | Datei | Stelle |
   |---|---|---|
   | Tier | `animals.js` | `KINDS` |
   | Gadget | `world.js` | Liste `G` (mit `group`, `price`, `d`; Himmels-Gadgets mit `sky: true`) |
   | Premium-Sternbild | `world.js` | `PREMIUM` |
   | Gebiet | `world.js` | `REGIONS`; es erscheint als nächstes Gebiet zum Freischalten |
   | Landschaftstyp | `world.js` | `BIOME` und `region()` |
   | Fundstück | `world.js` | `FINDS` |

3. **Datenformat geändert?** In `app.js` `SCHEMA` um 1 erhöhen und in `MIGRATIONS` einen Schritt ergänzen. Alte Speicherstände und Backups werden dann beim Laden Schritt für Schritt umgestellt.
4. **Nichts wird stillschweigend gelöscht.** Unbekannte IDs, z. B. aus einem Backup einer neueren Version, bleiben gespeichert und werden nur nicht angezeigt.
5. **Nach jeder Änderung** die Versionsnummer `VERSION` in `sw.js` erhöhen, damit installierte Apps die neue Fassung laden.

**Karten:** Die Wiese ist als „Karte“ gespeichert (`state.world.maps`). Eine Karte enthält die freigeschalteten Gebiete, die Deko-Plätze, die Tierplätze und die Fundstücke.
Eine volle Karte lässt sich später archivieren (`archived: true`) und durch eine neue ersetzen.
Gekaufte Gadgets (`state.inv`), Kiesel und Tiere gehören dabei nicht der Karte, sondern der Person, und ziehen deshalb mit um.

**Belohnungen:** Jede Aufgabe und jeder Mini-Schritt bringt nur beim **ersten** Abhaken einen Punkt.
Neue Tiere tragen `welcomed: false`, bis ihr Schlüpf-Fenster bestätigt wurde. Dadurch geht auch nach einem Neuladen kein Schlüpfen verloren.
