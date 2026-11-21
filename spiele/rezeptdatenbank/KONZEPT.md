# Kinder-Rezeptdatenbank – Konzept (Planungsstand)

> **Status: reine Planung, keine Implementierung und keine Verknüpfung in der Kinder-Startseite.**
>
> Die derzeitige Seite `spiele/rezepte.html` zeigt weiterhin das Rezept „Kulleraugen backen“ wahlweise in normaler oder Pokémon-Version. Sie bleibt unverändert. Auch `spiele/index.html` und die allgemeine HBG-Tools-Startseite bleiben unverändert.

## 1. Ziel und Grundprinzip

Eine sehr einfache, barrierearme Rezeptsammlung für Kinder im Grundschulalter, besonders auf Tablets. Die Rezepte sollen auch bei langsamer Verbindung schnell angezeigt werden und ohne Login funktionieren. **Text ist der Standard; Bilder sind eine freiwillige Ergänzung**. Ein Rezept kann vollständig ohne Bild auskommen.

**Technischer Vorschlag:** Statische HTML/CSS/JavaScript-Oberfläche + einzelne Rezeptdateien als JSON im GitHub-Repository. Vercel liefert die Website und die Dateien aus. In der ersten Ausbaustufe sind weder Datenbankserver noch Benutzerkonten, Backend, Cloud-TTS, KI-Dienst oder externe API erforderlich.

## 2. Kinderoberfläche

### Übersicht
- Titel „Meine Rezeptküche“, Suchfeld, einfache Kategorien wie „Backen“, „Kochen“, „Ohne Herd“.
- Kacheln mit Rezeptname, Symbol/Emoji, ungefährer Zubereitungszeit; **kein Bildzwang**.
- Wenige Schaltflächen; große Touchflächen (mindestens 48 × 48 CSS-Pixel), ausreichend Abstand, deutlicher Kontrast.
- Kein komplexes Menü, keine Werbung, keine Accounts.
- Responsiv für Tablet im Hoch- und Querformat sowie Mobilgeräte.
- Eine optionale Filterfunktion „Mit Hilfe von Erwachsenen“ / „Ohne Herd“ ist möglich; sie ersetzt keine Aufsicht.

### Rezeptansicht
1. **Übersicht:** Titel, Zeit, Portionen/Stückzahl, Zutaten, kurzer Sicherheitshinweis.
2. **Zutaten:** gut lesbare Zeilen, auf Wunsch mit Häkchen zum Abhaken. Bei Bedarf vollständige Zutatenliste während der Zubereitung zugänglich halten.
3. **Schritte:** Ein Schritt pro großer Ansicht mit Nummer, kurzer Überschrift, verständlichem Text in **Du-Form**, Schaltflächen „Zurück“ und „Weiter“.
4. **Vorlesen:** Lautsprecher-Schaltfläche unmittelbar beim aktuellen Schritt.
5. **Bilder:** Wenn vorhanden, ein komprimiertes Foto oder eine Grafik im Rezept bzw. bei einem einzelnen schwierigen Arbeitsschritt. Fehlt das Bild, bleibt die Textansicht vollständig.
6. **Abschluss:** „Fertig!“ mit Option, zurück zur Sammlung zu gehen.

**Sprache:** kurze Sätze, klare Verben, einfache Fachwörter; pro Schritt möglichst nur eine zusammenhängende Handlung. Sicherheitsanweisungen deutlich kennzeichnen, insbesondere Backofen, Herd, heiße Flüssigkeiten und scharfe Messer. Ein Erwachsener ist bei entsprechenden Aufgaben erforderlich.

## 3. Text-to-Speech (TTS)

**MVP:** `window.speechSynthesis` / `SpeechSynthesisUtterance` (Web Speech API).

- Kind tippt auf **„Vorlesen“**; kein automatisches Abspielen und kein permanentes Mikrofon.
- Gesprochen wird standardmäßig **nur der sichtbare Schritt**, optional die Zutatenliste.
- Sprache `de-DE`, bevorzugt eine verfügbare deutsche Stimme; sonst transparent darauf hinweisen, dass Vorlesen auf dem Gerät gerade nicht zur Verfügung steht.
- Optional ein einfacher Regler für das Sprechtempo; Standard normal bis leicht verlangsamt.
- Beim Schrittwechsel oder erneutem Vorlesen wird die laufende Ausgabe beendet (`cancel()`), damit nichts durcheinander gesprochen wird.
- Für die erste Version besser nur **Vorlesen / Stoppen / Erneut vorlesen** statt komplizierter Pause-/Fortsetzen-Logik; diese kann auf mobilen Browsern unterschiedlich funktionieren.
- Stimme und Offline-Fähigkeit hängen vom Browser, Betriebssystem und den installierten Sprachpaketen ab. **Offline-TTS nicht zusichern.**
- Text bleibt immer sichtbar und lesbar, auch wenn Vorlesen nicht funktioniert.
- Keine Audio-Dateien im Repository speichern; kein kostenpflichtiger TTS-API-Schlüssel nötig.

Referenzen:
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API

## 4. Datenmodell und Dateistruktur

Vorgeschlagene spätere Struktur (noch nicht angelegt):

```text
spiele/
  rezepte.html                 # bisherige URL; bei späterer Freigabe zum App-Einstieg ausbauen
  rezeptdatenbank/
    KONZEPT.md                 # dieses Dokument
    app.css
    app.js
    data/
      index.json               # kompakte Übersicht aller Rezepte
      kulleraugen.json
      weitere-rezepte.json
    bilder/                    # optional, nur optimierte Bilder
      kulleraugen.webp
```

Für jedes Rezept ein JSON-Datensatz; **Darstellung und Inhalte werden getrennt**. Beispiel **nur zur Illustration des Formats**, noch keine vollständige Rezeptdatei:

```json
{
  "id": "kulleraugen",
  "title": "Kulleraugen",
  "icon": "🍪",
  "categories": ["Backen", "Kekse"],
  "timeMinutes": null,
  "yield": null,
  "image": null,
  "ingredients": [
    { "quantity": "250 g", "name": "Mehl" },
    { "quantity": "100 g", "name": "Zucker" }
  ],
  "steps": [
    {
      "title": "Teig machen",
      "text": "Gib die Zutaten in eine Schüssel. Knete alles zu einem Teig.",
      "needsAdult": false,
      "image": null
    },
    {
      "title": "Ofen vorbereiten",
      "text": "Lass dir von einem Erwachsenen beim heißen Backofen helfen.",
      "needsAdult": true,
      "image": null
    }
  ],
  "safetyNote": "Beim heißen Ofen und beim heißen Gelee hilft ein Erwachsener.",
  "tags": ["Kinderrezept"]
}
```

Bei einer Umsetzung müssen Zutaten, Mengen, Reihenfolge, Zeiten und Arbeitsschritte **vollständig gegen die jeweilige Rezeptquelle** geprüft werden; keine automatische stillschweigende Ergänzung. Die bereits vorhandene Kulleraugen-Anleitung verzichtet bewusst auf Arbeitsschritte mit Eiweiß und Mandeln.

Optional später: Portionsumrechnung, Allergene (nur redaktionell geprüft), Favoriten, Bildunterschriften, Alters-/Hilfebedarf. **Nicht** im MVP.

## 5. Bilder und Vercel-Ressourcen

- Nur bei echtem didaktischen Mehrwert Bilder einsetzen. Ein Symbol genügt für die Rezeptübersicht.
- Wenn Bilder genutzt werden: WebP oder AVIF, passend skaliert, zunächst z. B. 800–1200 Pixel Kantenlänge, möglichst klein komprimiert. Nicht als Base64 in HTML/JSON einbetten.
- Nur das aktuell benötigte Bild laden (lazy loading); weitere Bilder erst beim Öffnen des Rezepts.
- Keine riesigen Vollseiten-Rezeptgrafiken für jedes Rezept. Die bestehende Kulleraugen-Bildseite bleibt jedoch vorerst erhalten.
- Bei Wachstum: Größe und Zahl der Assets sowie den tatsächlichen Transfer im Vercel-Dashboard beobachten; das Kontingent hängt von Nutzung/Plan ab. Textdateien sind verglichen mit Bildern meist sehr klein.
- Keine externe Bildspeicherung oder Cloud-Datenbank nötig; erst bei konkretem Bedarf neu entscheiden.

Referenzen:
- https://vercel.com/docs/limits
- https://vercel.com/docs/manage-cdn-usage

## 6. Datenschutz, Robustheit und Zugänglichkeit

- Kein Login, keine personenbezogenen Daten, kein Rezept-Upload durch Kinder.
- Zutaten-Häkchen und aktueller Schritt können lokal im Browser gespeichert werden (optional, z. B. `localStorage`). Keine serverseitige Speicherung.
- Klare Tastaturbedienbarkeit, sichtbare Fokusmarkierung, native HTML-Buttons, aussagekräftige Alternativtexte zu optionalen Bildern.
- TTS ist Zusatzhilfe, keine Voraussetzung.
- Text statt Bildtext: Zutaten und Schritte bleiben markierbar, zoombar, vorlesbar und auch bei Ladefehlern erhalten.
- Optional später ein druckfreundlicher Modus und Offline-Caching als PWA, **nicht Teil der ersten Version**.

## 7. Pflege neuer Rezepte

**Erste Version:** Eine Lehrkraft ergänzt eine geprüfte JSON-Datei und den Eintrag in `index.json` per GitHub. Eine einfache Validierung prüft Pflichtfelder. Keine Verwaltungsoberfläche und kein Editor mit Schreibrechten im Kinderbrowser.

**Später möglich:** Separater, nur für Erwachsene erreichbarer Rezept-Editor, der JSON exportiert oder Änderungen nach kontrolliertem Review in GitHub überführt. Nicht vorziehen; zuerst reale Nutzung mit wenigen Rezepten testen.

## 8. Migrations- und Entwicklungsphasen

1. **Jetzt:** Konzept im Repo ablegen, noch keine neue App und keine Navigation verändern.
2. **Prototyp (später nach Freigabe):** 1 textbasiertes Kulleraugen-Rezept, ohne Bildzwang, mit Zutaten, Schrittanzeige und TTS. Separat testen, z. B. unter `spiele/rezeptdatenbank/`, ohne Kinderstartseiten-Link.
3. **Praxistest:** Vorlesen auf den tatsächlichen Tablets, Lesbarkeit, Touch-Bedienung, Zeiten und Sicherheitshinweise prüfen.
4. **Kleine Sammlung:** Einige weitere geprüfte Rezepte, Suchfeld und Kategorien.
5. **Freischaltung (erst nach ausdrücklicher Entscheidung):** Bisherige `spiele/rezepte.html` bei Bedarf als zentralen Einstieg nutzen und vorhandene Verlinkungen berücksichtigen. Alte Bildvarianten können als zusätzliche Ansicht bestehen bleiben.

## 9. Offene Designentscheidungen für die nächste Besprechung

- Soll ein Kind bei der Zubereitung auf Wunsch **Zutaten und aktuellen Schritt gleichzeitig** sehen?
- Welche Kategorien sind sinnvoll (Backen, Kochen, Ohne Herd, Snacks, Getränke)?
- Soll die App eine **Ein-Schritt-Ansicht** als Standard haben und eine **Gesamtansicht** zum Drucken anbieten?
- Ist eine alternative Pokémon-Optik für alle Rezepte überhaupt erwünscht oder soll sie auf das vorhandene Kulleraugen-Bild begrenzt bleiben?
- Welche Tablet-Browser werden tatsächlich eingesetzt? Für TTS müssen diese auf den Geräten getestet werden.

---

**Wichtig:** Dieses Dokument beschreibt nur das Zielbild und Vorschläge. Es wurde keine neue Benutzeroberfläche veröffentlicht und keine bestehende Seite verändert.
