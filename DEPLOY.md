# Installation: AnimalFarmingToDoList auf Apple- und Android-Geräten

AnimalFarmingToDoList ist eine Web-App (PWA) und liegt auf GitHub Pages:

**<https://peguindevelopment.github.io/AnimalFarmingToDoList/>**

Die **Feen-Edition FeenwaldToDoList** (rosa Pastell, Fabelwesen, Feenwald) liegt direkt daneben:

**<https://peguindevelopment.github.io/AnimalFarmingToDoList/feen/>**

Von dort wird sie auf dem Gerät wie eine normale App installiert. Ein App Store ist dafür nicht nötig. Nach der Installation hat sie ein eigenes Icon, startet im Vollbild und läuft auch offline.

Die Installation funktioniert für beide Editionen genau gleich, nur mit der jeweiligen Adresse. Beide Apps können gleichzeitig auf einem Gerät installiert sein: Die Feen-Edition hat das Einhorn-Icon und eigene, getrennte Daten.

## 1. Apple

### iPhone und iPad

1. In **Safari** öffnen: **<https://peguindevelopment.github.io/AnimalFarmingToDoList/>**
2. Auf **Teilen** (□↑) tippen. Auf dem iPhone ist der Knopf unten, auf dem iPad oben.
3. **„Zum Home-Bildschirm“** wählen. Den Namen kann man dabei ändern.
4. Die App erscheint mit dem Pinguin-Icon auf dem Home-Bildschirm.

Feen-Edition: dieselben Schritte mit **<https://peguindevelopment.github.io/AnimalFarmingToDoList/feen/>**. Sie erscheint mit dem Einhorn-Icon.

Es muss **Safari** sein: Chrome und andere Browser können auf dem iPhone keine Web-Apps zum Home-Bildschirm hinzufügen.

Die App bitte **installieren** und nicht nur in Safari benutzen. Safari kann die Daten normaler Webseiten löschen, wenn sie einige Tage nicht besucht wurden. Bei installierten Apps passiert das nicht.

### Mac

1. In Safari öffnen: **<https://peguindevelopment.github.io/AnimalFarmingToDoList/>**
2. **Ablage → „Zum Dock hinzufügen“** wählen (ab macOS Sonoma). Dann liegt die App als eigenes Programm im Dock.

Die App funktioniert auch ohne Installation in jedem Browser.

## 2. Android

1. In **Chrome** öffnen: **<https://peguindevelopment.github.io/AnimalFarmingToDoList/>**
2. Oben rechts auf das Menü **⋮** tippen.
3. **„App installieren“** bzw. **„Zum Startbildschirm hinzufügen“** wählen.
4. Die App erscheint mit dem Pinguin-Icon im App-Drawer und auf dem Startbildschirm.

Feen-Edition: dieselben Schritte mit **<https://peguindevelopment.github.io/AnimalFarmingToDoList/feen/>**. Sie erscheint mit dem Einhorn-Icon.

Wichtig ist die Adresse mit **`github.io`**. Unter `github.com` liegt nur der Quellcode, und Chrome würde dort GitHub selbst installieren statt der App.
Ob die richtige Seite offen ist, erkennt man daran, dass oben „AnimalFarmingToDoList“ bzw. „FeenwaldToDoList“ steht.

Andere Browser wie Samsung Internet, Edge oder Firefox bieten die Installation ähnlich über ihr Menü an.

## 3. Updates veröffentlichen

1. Änderungen am Code vornehmen.
2. In `sw.js` die Versionsnummer erhöhen, z. B. `const VERSION = 'plan-v7';` → `'plan-v8'`.
3. Auf `main` pushen. GitHub Pages veröffentlicht die neue Version nach ein bis zwei Minuten.

Installierte Apps holen sich die neue Version beim nächsten Öffnen mit Internetverbindung. Manchmal muss die App dafür einmal komplett geschlossen und neu geöffnet werden. Die gespeicherten Daten bleiben bei Updates erhalten.

## 4. Daten und Gerätewechsel

Die Daten liegen **nur auf dem jeweiligen Gerät**. iPhone, Android-Handy und Rechner haben jeweils ihren eigenen Stand, und es gibt keine automatische Synchronisierung.

**Daten auf ein anderes Gerät übertragen:**
1. Auf dem alten Gerät: **Einstellungen → „Backup speichern“**. Auf dem iPhone z. B. in iCloud Drive sichern oder per AirDrop senden, auf Android in „Dateien“ oder Google Drive.
2. Auf dem neuen Gerät die App installieren und öffnen.
3. **Einstellungen → „Backup oder Liste laden“** → Datei wählen → **„Alles übernehmen“**.

Regelmäßige Backups sind empfehlenswert, weil die Daten sonst nur an einer Stelle existieren.

## 5. Häufige Probleme

| Problem | Lösung |
|---|---|
| Kein „Zum Home-Bildschirm“ auf dem iPhone | Die Seite muss in **Safari** geöffnet sein. Chrome und andere Browser können das auf dem iPhone nicht. |
| Chrome installiert GitHub statt der App | Die falsche Adresse war offen (`github.com`). Die installierte App entfernen und die Adresse mit `github.io` öffnen. |
| Kein „App installieren“ auf Android | Die Seite muss über **HTTPS** laufen. Über `http://` oder eine IP-Adresse geht es nicht. |
| Nach einem Update ist noch die alte Version zu sehen | Prüfen, ob `VERSION` in `sw.js` erhöht wurde. Dann die App ganz schließen und neu öffnen. |
| Daten sind plötzlich weg | Wurde die App nur im Browser statt installiert benutzt? Dann das letzte Backup laden. |
| „Dieses Backup gehört zur anderen App-Version“ | Backups der Tier- und der Feen-Edition sind getrennt. Die Datei in der App laden, aus der sie stammt. |
| Backup-Datei lässt sich nicht auswählen | Auf dem iPhone die Datei zuerst in der App „Dateien“ ablegen, z. B. in iCloud Drive, und dann von dort auswählen. |

## 6. Lokal testen

Im Projektordner einen einfachen Webserver starten:

```bash
python -m http.server 8000
```

- Am Rechner: `http://localhost:8000`, Feen-Edition: `http://localhost:8000/feen/`
- Auf dem Handy im selben WLAN: `http://<IP-des-Rechners>:8000`

Über `http://` ohne HTTPS lässt sich die App ansehen und ausprobieren, aber **nicht installieren**, und es gibt keinen Offline-Modus.
Lokale Testdaten sind getrennt von den Daten der installierten App.
