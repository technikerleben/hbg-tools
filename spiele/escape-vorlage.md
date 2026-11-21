# Escape-Room-Vorlage: „Nachts im Dino-Museum“

Diese Datei beschreibt den Aufbau von `spiele/dino-museum.html`. Damit lassen sich neue Varianten mit anderem Thema und anderen Aufgaben bauen, ohne bei null anzufangen.

**Vorgehen:** Kopiere `dino-museum.html` unter neuem Namen (zum Beispiel `spiele/piraten-schiff.html`). Dann tauschst du **Inhalte**, **Texte** und die **3D-Kulisse** aus. Die **Spiellogik** (Fehlerschleife, Tipps, Sterne, Speichern, Vorlesen, Kamera, Vollbild) bleibt unverändert.

---

## 1. Spielprinzip (bleibt in jeder Variante gleich)

| Baustein | Funktion |
|---|---|
| Rahmengeschichte | Das Kind ist eingesperrt. Eine Belohnungsfigur (hier das T-Rex-Skelett) ist unvollständig, und jede gelöste Station bringt ein Teil zurück. Sind alle Teile da, öffnet sich der Ausgang. |
| 4 Stationen | Jede Station prüft genau **eine Kompetenz**. Die Reihenfolge wählt das Kind selbst. |
| Kurze Durchgänge | Pro Station 3–6 Aufgaben, insgesamt etwa 8–10 Minuten. |
| Festigen statt Erarbeiten | Es gibt keine Erklärphasen, nur kurze Erinnerungen an die Regel. |
| Fehlerschleife | **1. Fehler:** Tipp 1 erscheint. **2. Fehler:** Die richtige Lösung wird markiert, dazu Tipp 2, und die Aufgabe kommt **2 Aufgaben später erneut**. Das passiert höchstens zweimal, danach entfällt die Aufgabe. |
| Sterne | Pro Station: 0 Fehler = 3 Sterne, 1–2 Fehler = 2 Sterne, ab 3 Fehlern = 1 Stern. |
| Urkunde | Ein Kompetenzsatz („Ich kann …“) pro Station mit Sternen, Name des Kindes und Drucken-Knopf. |
| Wiederspielen | Jede Runde zieht neue Aufgaben aus einem Pool. Nach jedem Sieg gibt es eine **Sammelkarte** (10 Stück), die in der 3D-Szene als Ei auf dem Regal erscheint. |
| Selbstständigkeit | Vorlesen per Web Speech API: Der Lautsprecher-Knopf liest bei Bedarf vor, der Schalter „Vorlesen“ liest automatisch. Große Tippflächen, kein Zeitdruck, keine Sackgasse. |

---

## 2. Technik

- **Eine einzige HTML-Datei**, Deploy über GitHub (`technikerleben/hbg-tools`) und Vercel.
- Bibliotheken vom CDN, Versionen fest angegeben:
  - `three@0.160.0` als ES-Modul über die Importmap
  - `gsap@3.12.5` für Kamerafahrten und Animationen
  - `canvas-confetti@1.9.3`, und zwar die Datei `dist/confetti.browser.js`. Eine `.min.js` gibt es in diesem Paket nicht.
- Schriften von Google Fonts: **Fredoka** für Titel, **Andika** für Aufgaben (eine Leselernschrift).
- **Keine externen Bilder oder Modelle.** Alle 3D-Objekte entstehen im Code aus einfachen Grundformen, Texte in der 3D-Szene als Canvas-Textur.
- Töne entstehen synthetisch mit der Web Audio API, es gibt keine Audiodateien.
- **Robust:** Lädt three.js nicht oder fehlt WebGL, bekommt der Body die Klasse `no3d`. Das Spiel läuft dann über die Stationsknöpfe trotzdem weiter.
- Speicherstand liegt in `localStorage`.

---

## 3. Aufbau der Datei

Die Abschnitte sind im Code mit Kommentaren markiert.

```
<style>                      Farben (CSS-Variablen), HUD, Panel, Overlays, Druckansicht
<body>
  #scene                     3D-Canvas (vollflächig)
  #hud                       Titel, Fortschritt (#bones), Vorlesen, Töne, Vollbild, Sammlung
  #kiki                      Maskottchen mit Sprechblase (unten links)
  #chips                     4 Stationsknöpfe (unten rechts)
  #panel                     Aufgabenfenster rechts (Kopf, Fortschritt, #task)
  #start, #urk, #coll, #rot  Overlays: Start, Urkunde, Sammlung, "Tablet quer halten"
  <svg><defs>                Wiederverwendbare SVG-Formen: #dinoKiki, #boneShape, #sauro
<script type="module">
  /* Speicher */             KEY, store {name, col, runs, voice, sound}
  /* Ton & Vorlesen */       sfx.click/ok/no/done/bone/roar/door, say(), autoSay()
  /* Inhalte */              Wortlisten + ST-Array (die 4 Stationen)  <-- HIER TAUSCHEN
  /* 3D-Welt */              Objekt W als Schnittstelle zwischen Spiel und 3D
  /* Spielablauf */          newRun, openStation, renderTask, pick, next, finishStation,
                             renderFinished, closePanel, finale, Sammlung, Vollbild, Start
  /* 3D */                   Licht, Raum, Tür, Sammelregal, Belohnungsfigur, Stationen,
                             Staub, Kamera, Antippen, Animationsschleife
```

---

## 4. Stationen definieren: das `ST`-Array

Das ist der wichtigste Teil zum Anpassen. Jede Station ist ein Objekt:

```js
{
  name:  'Fossilien-Kiste',          // Name auf Knopf, 3D-Schild und Panel
  part:  'Schädel',                  // Belohnungsteil (Text im Abschlussdialog)
  skill: 'Ich erkenne Nomen …',      // Kompetenzsatz auf der Urkunde
  intro: 'Ist das Wort ein …?',      // Arbeitsanweisung (steht über jeder Aufgabe)

  make() { return [ /* Aufgaben-Objekte */ ] },
      // Wird zu Rundenbeginn aufgerufen. Zieht zufällig aus dem Pool.
      // Empfehlung: 3–6 Aufgaben. Mit shuffle(...) mischen.

  view(it, s) { return {
      q:    '<div class="fossil">Glück</div>',   // Aufgaben-HTML
      cls:  '' | 'three' | 'five',               // Raster der Antwortknöpfe: 2, 3 oder 5 (3+2)
      say:  'Text zum Vorlesen',
      opts: [ { v:'zeit', t:'Zeitbegriff', h:'<svg…>Zeitbegriff', c:'big zeit' }, … ]
        // v = Wert, t = Klartext für "Richtig ist: …", h = Knopf-HTML, c = CSS-Klassen
  }},

  right(it, s) { return 'zeit' },    // richtiger Wert (muss einem opts.v entsprechen)

  after(it, s) { … },                // OPTIONAL für mehrschrittige Aufgaben:
      // false zurückgeben = Aufgabe noch nicht fertig (nächster Teilschritt).
      // Der Teilschritt-Zähler steht in s.sub (wird bei Erfolg und Wiederholung auf 0 gesetzt).
      // Beispiel Station 3: Lücke 1 (s.sub===0), dann Lücke 2.

  hints(it, s) { return ['Tipp 1', 'Tipp 2'] },
      // Tipp 1 nach dem ersten Fehler und beim Tipp-Knopf,
      // Tipp 2 zusammen mit der gezeigten Lösung.

  done(it) { return { h:'<b>die</b> Hoffnung', s:'die Hoffnung' } }
      // Rückmeldung bei richtiger Lösung (h = HTML, s = optionaler Vorlesetext)
}
```

### Fertige Aufgabentypen (direkt wiederverwendbar)

| Station | Typ | Darstellung | Umbauideen |
|---|---|---|---|
| 1 | **Zuordnen in 2 Kategorien** | Wortkarte `.fossil` und zwei große Knöpfe `big` | Wortarten, Selbst-/Mitlaute, gerade/ungerade, Einzahl/Mehrzahl |
| 2 | **Auswahl aus 3 farbigen Optionen** | Eier `egg der/die/das` | Satzzeichen . ? !, drei Rechenergebnisse, drei Zeitformen |
| 3 | **Lückentext, zweischrittig** | `.sent` mit `fill(text, wort, 'act'|'fill')`, `{}` als Platzhalter | Verbformen, Präpositionen, Rechenschritte |
| 4 | **Ersetzen mit 5 Optionen** | `<mark>` markiert das Wort, Raster `five` | Pronomen, Wortfamilien, Gegenteile |

**Hilfen im Code:** `shuffle(arr)`, `fill(text, wort, klasse)`, Symbole `IC.hour/heart/one/many`.
CSS-Klassen für Texte: `.fossil` (große Wortkarte), `.sent` (Satz), `.gap` (leere Lücke), `mark` (gelbe Markierung), `.art-der/die/das` (Artikelfarben).

### Inhaltspools

Die Wortlisten stehen über dem `ST`-Array (`ZEIT`, `GEF`, `PAARE`, `PRON`). Neue Pools legst du genauso an. Achte bei `make()` darauf, dass die Mischung passt. In Station 2 wird zum Beispiel neu gezogen, bis alle drei Artikel vorkommen.

---

## 5. Texte und Thema anpassen (Checkliste)

1. **`<title>`** und **Startkarte** `#start`: Titel und Geschichte (2–3 Sätze).
2. **HUD-Titel** `#hud .name`.
3. **Kiki-Texte** im Spielablauf: Start (`$('#bStart').onclick`), nach jeder Station (`closePanel`), Finale (`finale`), Neustart (`bAgain`).
4. **`d_art(i)`**: Namen der Belohnungsteile mit Artikel und Verb („Der Schädel ist“, „Die Beine sind“).
5. **`renderFinished`**: Satz „Du hast den/die … gefunden!“. Die Artikel-Weiche ist dort fest codiert.
6. **Urkunde** `#urk`: Überschrift und Untertitel.
7. **Sammelkarten `DINOS`**: `[Name, Satz, Farbe]`. Der Satz wird mit „Er …“ eingeleitet, das ist bei anderem Geschlecht anzupassen. Die Silhouette ist die SVG-Form `#sauro` und sollte bei einem neuen Thema ausgetauscht werden.
8. **Maskottchen** `#dinoKiki` in `<defs>`: eigenes SVG mit `viewBox="0 0 120 100"`.
9. **`KEY`** im Speicher-Abschnitt **unbedingt ändern** (zum Beispiel `'piratenSchiff.v1'`), sonst teilen sich die Spiele Name und Sammlung.
10. **Farben**: CSS-Variablen in `:root` (`--night`, `--paper`, `--gold` …) und in der 3D-Szene `BG`, `wallM` sowie die Lichtfarben.
11. **Kinder-Startseite** `spiele/index.html`: Karte mit eigener Klasse und eigenen Farben ergänzen (Muster `.dino`).

---

## 6. 3D-Kulisse anpassen

Alles steht im Abschnitt `/* 3D */`. Grundbausteine:

```js
mesh(geometrie, material, x, y, z, parent = scene, schatten = true)  // erzeugt und platziert
M(farbe, {optionen})        // MeshStandardMaterial (matt)
B(farbe)                    // MeshBasicMaterial (leuchtet, ohne Licht)
canvasTex(w, h, (g,w,h)=>…) // Textur aus Canvas, für Schilder und Banner
V(x, y, z)                  // Vector3
```

**Achtung:** `position` darf bei three.js-Objekten nicht per `Object.assign` gesetzt werden, das wirft einen Fehler. Immer `m.position.set(...)` oder `.copy(...)` verwenden. Für Geisterteile gibt es die Hilfe `gm(geo, pos)`.

| Teil | Wo | Was anpassen |
|---|---|---|
| Raum | `// Boden, Wände` | Bodentextur (Canvas-Kacheln), Wandfarbe, Fenster, Mond, Banner-Text |
| Ausgang | `// Tür` | `leaves` (2 Türflügel, öffnen im Finale), `glow` (Licht dahinter), Schild „AUSGANG“ |
| Sammelregal | `// Sammelregal` | 10 Slots, `W.setCollection(col)` färbt die gesammelten |
| **Belohnungsfigur** | `// Skelett` | 4 Teilgruppen `parts[0..3]`. Jedes Teil wird erst als **Geist** (`ghostM`, halbtransparent) gebaut und bei Erfolg auf `boneM` umgestellt. `partOrigin[i]` ist der Zielpunkt der fliegenden Lichtkugel. |
| Stationen | `// Stationen` | Positionen `SP[0..3]`. Je Station: Sockel, Leuchtring, Punktlicht, Schild (`labelTex`), unsichtbarer Klickzylinder (`pickables`), dazu das Objekt im Block `if(i===n){…}` |
| Bewegung | `floaters` + `// Animation` | Wackeln und Schweben einzelner Objekte |

**Ideen für andere Themen** (Belohnungsfigur → 4 Teile):
- Piratenschiff: Schatzkarte in 4 Stücken, im Finale öffnet sich die Schatztruhe.
- Raumstation: 4 Energiekristalle für den Reaktor, im Finale öffnet sich die Luftschleuse.
- Zauberschule: 4 Teile eines Zauberstabs, im Finale öffnet sich das Portal.
- Zoo: 4 Schlüsselteile, im Finale öffnet sich das Tor.

### Schnittstelle `W` (Spiel ↔ 3D)

Diese Funktionen muss jede Kulisse anbieten. Ohne 3D sind sie leere Funktionen.

| Funktion | Aufgabe |
|---|---|
| `W.focus(i)` | Kamera fliegt zu Station `i` (Station links im Bild, Panel rechts) |
| `W.hub()` | Kamera zurück in die Hallenansicht, freie Kamera wieder an |
| `W.reveal(i)` | Lichtkugel fliegt von der Station zur Figur, Teil `i` wird sichtbar (Promise) |
| `W.setDone(i)` | Ring grün und Schild mit Häkchen |
| `W.finale(sfx)` | Finale-Szene, hier Augen leuchten, Brüllen, Tür öffnet sich (Promise) |
| `W.reset()` | Alles zurück für eine neue Runde |
| `W.setCollection(col)` | Sammelobjekte anzeigen |
| `W.onPick(i)` | wird vom Spiel gesetzt: Station in der 3D-Szene angetippt |

### Kamera

- `HUB` ist die Hallenansicht (Position `p`, Blickpunkt `l`).
- **Freie Kamera** (nur in der Halle): Wischen dreht um den Blickpunkt, mit Grenzen in `OR.ty` (±0,65) und `OR.tp` (−0,16 bis 0,28). Pinch oder Mausrad zoomt (`OR.td` von −4 bis 4).
- `free` und `flying` sperren die freie Kamera während Stationen, Kamerafahrten und Finale.
- Tippen unterscheidet sich vom Wischen durch eine Bewegung von weniger als 12 px.

---

## 7. Oberfläche (unverändert übernehmen)

- **Panel** rechts, so hoch wie der Inhalt. Schriftgrößen sind mit `clamp(…vh…)` an die Bildschirmhöhe gebunden, damit **nichts gescrollt** werden muss (getestet bei 1024×768, 1180×820 und 1366×1024).
- **Hinweisfeld `.msg`** sitzt **unter** den Antwortknöpfen (`msg show` = Tipp, `msg ok` = richtige Antwort). Es verdeckt nie die Knöpfe.
- Im Panel-Kopf stehen Tipp, Vorlesen und Schließen, darunter Fortschrittsbalken und „Noch X Aufgaben“.
- **Vollbild**: per Knopf im HUD und automatisch beim Start. Der Knopf wird ausgeblendet, wenn der Browser es nicht kann.
- Unter 1150 px Breite zeigt das HUD nur Symbole. Im Hochformat erscheint der Hinweis „Bitte Tablet quer halten“.
- Druckansicht (`@media print`) zeigt nur die Urkunde. In der Claude-Vorschau ist Drucken gesperrt, auf Vercel funktioniert es.

---

## 8. Neue Variante: Ablauf

1. `dino-museum.html` kopieren und neu benennen.
2. `KEY` ändern.
3. Pools und `ST`-Array mit neuen Aufgaben füllen, dabei die vier Aufgabentypen wiederverwenden oder abwandeln.
4. Texte nach Checkliste in Abschnitt 5.
5. Kulisse: Raumfarben, Stationsobjekte, Belohnungsfigur (4 Teile), Finale.
6. Testen: einmal komplett durchspielen, je Station absichtlich zweimal falsch antworten (Hinweis und Wiederholung prüfen) und die Urkunde ansehen.
7. Karte in `spiele/index.html` ergänzen, committen und pushen. Vercel deployt automatisch nach `https://hbg-tools.vercel.app/spiele/<name>.html`.

### Prompt-Vorlage für Claude

> Erstelle auf Basis von `spiele/dino-museum.html` und `spiele/escape-vorlage.md` eine neue Escape-Room-Variante.
> **Thema:** … (z. B. Piratenschiff)
> **Zielgruppe:** Klasse …, ein Kind allein, Tablet quer, Festigung (keine Neuerarbeitung)
> **Station 1–4 (je eine Kompetenz):** …
> **Belohnungsfigur mit 4 Teilen und Finale:** …
> **Sammelkarten:** … (10 Stück)
> Behalte Spiellogik, Fehlerschleife, Vorlesen, Kamera, Vollbild und Layout bei. Ändere `KEY`. Lege die Datei unter `spiele/<name>.html` in hbg-tools ab, ergänze die Karte auf `spiele/index.html`, pushe und gib mir den Vercel-Link.

---

## 9. Bekannte Fallstricke

- **iPad-Vollbild**: Safari unterstützt das nur eingeschränkt. Als Alternative die Seite über „Teilen → Zum Home-Bildschirm“ starten.
- **Internet nötig**, weil three.js, GSAP, Konfetti und die Schriften vom CDN kommen.
- **Vorlesestimme** hängt vom Gerät ab. Ist keine deutsche Stimme installiert, bleibt es still oder klingt falsch.
- Beim lokalen Testen mit Playwright laufen Klicks wegen der Software-Grafik sehr langsam. Besser per `page.evaluate(() => el.click())` klicken und CDN-Dateien per `page.route` aus `node_modules` ausliefern.
