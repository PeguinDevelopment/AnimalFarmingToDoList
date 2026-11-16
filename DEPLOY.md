# Deployment: Plan auf Apple- und Android-Geräte bringen

Plan ist eine Web-App (PWA). Damit sie sich installieren lässt und offline läuft, muss sie **einmal über HTTPS erreichbar** sein.
Danach wird sie auf dem Gerät wie eine normale App installiert. Ein App Store, ein Developer-Account oder ein Build-Schritt sind dafür nicht nötig.

## 1. Online stellen

Hochgeladen werden alle Dateien im Projektordner **außer** `import/` und `.git/`.

### Variante A: GitHub Pages

1. Das Repository auf GitHub pushen. Der Ordner `import/` wird durch `.gitignore` nicht hochgeladen.
2. Auf GitHub unter **Settings → Pages** als Quelle **„Deploy from a branch“** wählen, dann Branch `main` und Ordner `/ (root)`.
3. Nach ein bis zwei Minuten ist die App unter `https://<benutzername>.github.io/<repository>/` erreichbar.

### Variante B: Netlify (ohne Git)

1. Auf <https://app.netlify.com/drop> einen kostenlosen Account anlegen.
2. Den Projektordner per Drag & Drop hochladen. Den Ordner `import/` vorher herausnehmen.
3. Netlify vergibt eine Adresse wie `https://irgendwas.netlify.app`. Den Namen kann man in den Site-Einstellungen ändern.

### Variante C: eigener Webserver

Jeder Webserver, der statische Dateien über **HTTPS** ausliefert, funktioniert. Die App benutzt nur relative Pfade und läuft deshalb auch in einem Unterordner.

### Lokal testen (ohne Installation)

```bash
python -m http.server 8000
```

- Am Rechner: `http://localhost:8000`
- Auf dem Handy im selben WLAN: `http://<IP-des-Rechners>:8000`

Über `http://` ohne HTTPS lässt sich die App zwar ansehen, aber **nicht installieren**, und es gibt keinen Offline-Modus. Zum echten Testen deshalb Variante A oder B verwenden.

## 2. Auf Apple-Geräten installieren

### iPhone und iPad

1. Die HTTPS-Adresse in **Safari** öffnen.
2. Unten bzw. oben auf **Teilen** (□↑) tippen.
3. **„Zum Home-Bildschirm“** wählen. Den Namen kann man dabei ändern.
4. Die App erscheint mit eigenem Icon auf dem Home-Bildschirm, startet im Vollbild und läuft auch offline.

Unbedingt **installieren**, statt die App nur in Safari zu benutzen: Safari kann die Daten normaler Webseiten löschen, wenn sie einige Tage nicht besucht wurden. Bei installierten Apps passiert das nicht.

### Mac

- Die App funktioniert in jedem Browser.
- In Safari kann man sie über **Ablage → „Zum Dock hinzufügen“** als eigene App ins Dock legen (ab macOS Sonoma).

## 3. Auf Android installieren

1. Die HTTPS-Adresse in **Chrome** öffnen.
2. Oben rechts auf das Menü **⋮** tippen.
3. **„App installieren“** bzw. **„Zum Startbildschirm hinzufügen“** wählen.
4. Die App erscheint im App-Drawer und auf dem Startbildschirm, startet im Vollbild und läuft offline.

Andere Browser wie Samsung Internet, Edge oder Firefox bieten die Installation ähnlich über ihr Menü an.

## 4. Updates veröffentlichen

1. Änderungen am Code vornehmen.
2. In `sw.js` die Versionsnummer erhöhen, z. B. `const VERSION = 'plan-v6';` → `'plan-v7'`.
3. Neu hochladen bzw. pushen.

Installierte Apps holen sich die neue Version beim nächsten Öffnen mit Internetverbindung. Manchmal muss die App dafür einmal komplett geschlossen und neu geöffnet werden. Die gespeicherten Daten bleiben bei Updates erhalten.

## 5. Daten und Gerätewechsel

Die Daten liegen **nur auf dem jeweiligen Gerät**. iPhone, Android-Handy und Rechner haben jeweils ihren eigenen Stand, und es gibt keine automatische Synchronisierung.

**Daten auf ein anderes Gerät übertragen:**
1. Auf dem alten Gerät: **Einstellungen → „Backup speichern“**. Auf dem iPhone z. B. in iCloud Drive sichern oder per AirDrop senden, auf Android in „Dateien“ oder Google Drive.
2. Auf dem neuen Gerät die App installieren und öffnen.
3. **Einstellungen → „Backup oder Liste laden“** → Datei wählen → **„Alles übernehmen“**.

Regelmäßige Backups sind empfehlenswert, weil die Daten sonst nur an einer Stelle existieren.

## 6. Häufige Probleme

| Problem | Lösung |
|---|---|
| Kein „Zum Home-Bildschirm“ auf dem iPhone | Die Seite muss in **Safari** geöffnet sein. Chrome und andere Browser können das auf dem iPhone nicht. |
| Kein „App installieren“ auf Android | Die Seite muss über **HTTPS** laufen. Über `http://` oder eine IP-Adresse geht es nicht. |
| Nach einem Update ist noch die alte Version zu sehen | Prüfen, ob `VERSION` in `sw.js` erhöht wurde. Dann die App ganz schließen und neu öffnen. |
| Daten sind plötzlich weg | Wurde die App nur im Browser statt installiert benutzt? Dann das letzte Backup laden. |
| Backup-Datei lässt sich nicht auswählen | Auf dem iPhone die Datei zuerst in der App „Dateien“ ablegen, z. B. in iCloud Drive, und dann von dort auswählen. |
