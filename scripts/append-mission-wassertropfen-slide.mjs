import fs from 'node:fs';

const file = 'neue5-digitales.html';
let html = fs.readFileSync(file, 'utf8');
const title = 'KI-Anreicherung: Mission Wassertropfen';

function replaceJsonScript(source, id, updater) {
  const markerStart = `<script id="${id}" type="application/json">`;
  const markerEnd = '</script>';
  const start = source.indexOf(markerStart);
  if (start < 0) throw new Error(`${id}-Block nicht gefunden`);
  const jsonStart = start + markerStart.length;
  const end = source.indexOf(markerEnd, jsonStart);
  if (end < 0) throw new Error(`Ende des ${id}-Blocks nicht gefunden`);
  const data = JSON.parse(source.slice(jsonStart, end));
  const updated = updater(data);
  return source.slice(0, jsonStart) + JSON.stringify(updated) + source.slice(end);
}

const newSlide = {
  title,
  cls: '',
  section: false,
  html: `<div class="kicker green">Abschlussbeispiel · Anreicherung durch KI</div>
<h2 class="slide-title">Mission Wassertropfen: aus Text wird Erfahrung</h2>
<div class="grid grid-2">
  <div class="mini-card accent-left sage">
    <h3>Was wurde angereichert?</h3>
    <p>Aus der klassischen Aufgabe zum Wasserkreislauf wurde eine geführte 3D-Mission: Die Lernenden steigen sichtbar in die Aqua Explorer ein, schrumpfen, begleiten ein markiertes Wassermolekül und erleben Verdunstung, Wolkenbildung, Regen, Bach, Fluss, Grundwasser, Pflanzenaufnahme und Rückkehr ins Meer Schritt für Schritt.</p>
  </div>
  <div class="mini-card accent-left slate">
    <h3>Iterationsprozess</h3>
    <p>Der Prototyp entstand nicht in einem perfekten Erstwurf, sondern durch kurze Rückmeldeschleifen: erst Grundstruktur und Technik, dann Fehlerkorrektur, dann mehr Anschaulichkeit, schließlich ein fachlich klarerer Ablauf mit einzelnen Stationen statt einer bloßen Zusammenfassung.</p>
  </div>
</div>
<div class="grid grid-2" style="margin-top:14px;">
  <div class="mini-card accent-left">
    <h3>Prompt-Aufwand</h3>
    <p><strong>164 Wörter</strong> in acht kurzen Folgeprompts nach dem ersten Konzept.</p>
    <p style="margin-top:8px;"><strong>15 Minuten netto</strong> eigene Arbeitszeit<br><span style="color:var(--col-text-muted);">plus Rechenzeit von ChatGPT</span></p>
  </div>
  <div class="mini-card accent-left sage">
    <h3>Einordnung</h3>
    <p>KI ersetzt hier nicht das Lernen und nicht die Lehrkraft. Sie erweitert ein Lernangebot um Perspektivwechsel, Animation, Sprache, Untertitel und eine gemeinsame Gesprächsgrundlage.</p>
  </div>
</div>
<div class="merksatz"><strong>Anreicherung:</strong> Der fachliche Kern bleibt erhalten, aber Zugang, Darstellung und Motivation werden erweitert.</div>
<div style="display:flex;justify-content:center;margin-top:18px;">
  <a href="https://mission-wassertropfen.vercel.app" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:10px;background:var(--col-rust);color:#fff;text-decoration:none;font-weight:700;box-shadow:var(--shadow);">Mission Wassertropfen öffnen ↗</a>
</div>`
};

const voiceOver = `Zum Abschluss sehen wir Mission Wassertropfen als Beispiel für Anreicherung durch KI. Ausgangspunkt war eine klassische Lernaufgabe zum Wasserkreislauf. Daraus wurde in mehreren kurzen Iterationen eine geführte 3D-Erfahrung: Die Schülerinnen und Schüler steigen in die Aqua Explorer ein, schrumpfen, begleiten ein Wassermolekül und erleben die Stationen des Wasserkreislaufs nacheinander. Wichtig ist: Die KI ersetzt nicht den fachlichen Kern. Sie ergänzt Zugänge, Visualisierung, Sprache und Motivation. Für die aktuelle Version wurden nach dem ersten Konzept 164 Wörter in acht kurzen Folgeprompts genutzt. Die eigene Arbeitszeit lag bei etwa 15 Minuten netto, zusätzlich kam die Rechenzeit von ChatGPT hinzu.`;

let missionIndex = -1;
html = replaceJsonScript(html, 'slideData', (slides) => {
  missionIndex = slides.findIndex((slide) => slide.title === title);
  if (missionIndex >= 0) slides[missionIndex] = newSlide;
  else {
    slides.push(newSlide);
    missionIndex = slides.length - 1;
  }
  return slides;
});

html = replaceJsonScript(html, 'voData', (items) => {
  while (items.length <= missionIndex) items.push('');
  items[missionIndex] = voiceOver;
  return items;
});

html = html.replace('audio/folie-01.mp3 ... folie-16.mp3', 'audio/folie-01.mp3 ... folie-17.mp3');

fs.writeFileSync(file, html);
console.log(`Folie "${title}" ist jetzt Folie ${missionIndex + 1}; Voice-over nutzt audio/folie-${String(missionIndex + 1).padStart(2, '0')}.mp3.`);
