import fs from 'node:fs';

// Einmaliger, wiederholbar sicherer Patch für die Abschlussfolie des Workshops.
const file = 'neue5-digitales.html';
const html = fs.readFileSync(file, 'utf8');
const markerStart = '<script id="slideData" type="application/json">';
const markerEnd = '</script>';
const start = html.indexOf(markerStart);
if (start < 0) throw new Error('slideData-Block nicht gefunden');
const jsonStart = start + markerStart.length;
const end = html.indexOf(markerEnd, jsonStart);
if (end < 0) throw new Error('Ende des slideData-Blocks nicht gefunden');

const slides = JSON.parse(html.slice(jsonStart, end));
const title = 'KI-Anreicherung: Mission Wassertropfen';

const newSlide = {
  title,
  cls: '',
  section: false,
  html: `<div class="kicker green">Abschlussbeispiel · Anreicherung durch KI</div>
<h2 class="slide-title">Aus einer Lernaufgabe wird eine erlebbare Mission</h2>
<div class="grid grid-2">
  <div class="mini-card accent-left sage">
    <h3>Der Iterationsprozess</h3>
    <p>Aus einer ersten Idee für eine geführte 3D-Reise entstand schrittweise ein funktionsfähiger Prototyp. Nach jedem Test wurden konkrete Rückmeldungen eingearbeitet: zuerst Technik und Bedienung, dann sichtbarer Einstieg und Schrumpfen, schließlich der vollständige Wasserkreislauf als einzelne erlebbare Stationen mit Insel, Wolke, Regen, Bach, Fluss, Grundwasser und Rückkehr ins Meer.</p>
  </div>
  <div class="mini-card accent-left slate">
    <h3>Aufwand</h3>
    <p><strong>164 Wörter</strong> in acht kurzen Folgeprompts nach dem ersten Konzept</p>
    <p style="margin-top:10px;"><strong>15 Minuten netto</strong> eigene Arbeitszeit<br><span style="color:var(--col-text-muted);">plus Rechenzeit von ChatGPT</span></p>
  </div>
</div>
<div class="merksatz"><strong>Anreicherung bedeutet hier:</strong> Ein abstrakter Sachtext wird nicht ersetzt, sondern durch Perspektivwechsel, Animation, Sprache, Untertitel und eine geführte Erfahrung zugänglicher gemacht.</div>
<div style="display:flex;justify-content:center;margin-top:18px;">
  <a href="https://mission-wassertropfen.vercel.app" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:10px;background:var(--col-rust);color:#fff;text-decoration:none;font-weight:700;box-shadow:var(--shadow);">Mission Wassertropfen öffnen ↗</a>
</div>`
};

const existing = slides.findIndex((slide) => slide.title === title);
if (existing >= 0) slides[existing] = newSlide;
else slides.push(newSlide);

const updated = html.slice(0, jsonStart) + JSON.stringify(slides) + html.slice(end);
fs.writeFileSync(file, updated);
console.log(`Folie "${title}" ${existing >= 0 ? 'aktualisiert' : 'angehängt'}.`);
