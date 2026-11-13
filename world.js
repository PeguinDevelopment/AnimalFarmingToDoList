/* Die Tierwiese: breite Landschaft zum Wischen, Gadgets auf festen Plätzen (Boden + Himmel),
   Landschaft zum Freischalten, Tag/Nacht, Jahreszeiten, Fundstücke. */
(function () {
  'use strict';

  const RW = 360, H = 262;               // Breite eines Gebiets, Höhe der Welt
  const OL = 'stroke="rgba(20,35,58,.25)" stroke-width="1.2"';
  const WOOD = '#a0784f', DWOOD = '#7a5236', STONE = '#9aa6b2', DSTONE = '#6f7c8a', WATER = '#4fc3f7', DWATER = '#1ea7e1';
  const COLS = ['#1e88e5', '#00a5a0', '#f2b01e', '#2e9e44', '#e8701a', '#1d3f9e'];

  /* Gebiete. WICHTIG für Erweiterungen:
     - Die id eines Gebiets NIE ändern (gespeicherte Plätze hängen daran).
     - Neue Gebiete einfach hinten anhängen – sie erscheinen dann als nächstes Gebiet zum Freischalten.
     - biome bestimmt das Aussehen (siehe BIOME weiter unten). */
  const REGIONS = [
    ['wald', 'Wald', 'wald'], ['berge', 'Berge', 'berge'], ['gletscher', 'Gletscher', 'gletscher'], ['see', 'See', 'see'],
    ['flusstal', 'Flusstal', 'fluss'], ['blumenwiese', 'Blumenwiese', 'blumen'], ['herbstdorf', 'Herbstdorf', 'dorf'], ['kueste', 'Küste', 'kueste'],
    ['birkenhain', 'Birkenhain', 'birken'], ['alm', 'Alm', 'alm'], ['schlucht', 'Wasserfallschlucht', 'schlucht'], ['fjord', 'Fjord', 'fjord'],
    ['moor', 'Moor', 'moor'], ['polarmeer', 'Polarmeer', 'polar'], ['vulkaninsel', 'Vulkaninsel', 'vulkan'], ['seenplatte', 'Seenplatte', 'see'],
    ['tannenschnee', 'Tannenschnee', 'schneewald'], ['hochplateau', 'Hochplateau', 'alm'], ['canyon', 'Canyon', 'canyon'], ['leuchtturmbucht', 'Leuchtturmbucht', 'kueste'],
    ['kastanienallee', 'Kastanienallee', 'dorf'], ['mondtal', 'Mondtal', 'fluss'], ['sternenberg', 'Sternenberg', 'berge'], ['apfelgarten', 'Apfelgarten', 'blumen'],
    ['buecherdorf', 'Bücherdorf', 'dorf'], ['schokoladental', 'Schokoladental', 'fluss'], ['wollhuegel', 'Wollhügel', 'alm'], ['otterbach', 'Otterbach', 'fluss'],
    ['kiesbank', 'Kiesbank', 'see'], ['edelweissgipfel', 'Edelweißgipfel', 'gletscher'], ['nebelwald', 'Nebelwald', 'moor'], ['inselkette', 'Inselkette', 'insel'],
    ['gezeitenkueste', 'Gezeitenküste', 'kueste'], ['polarlichtebene', 'Polarlichtebene', 'polar'], ['tundra', 'Tundra', 'schneewald'], ['wolkenberg', 'Wolkenberg', 'berge'],
    ['quelltal', 'Quelltal', 'schlucht'], ['silberfluss', 'Silberfluss', 'fluss'], ['gaemsenpass', 'Gämsenpass', 'gletscher'], ['gipfelderwelt', 'Gipfel der Welt', 'gletscher'],
  ].map(([id, name, biome], i) => ({ id, name, biome, i }));
  const regionById = Object.fromEntries(REGIONS.map(r => [r.id, r]));
  const START_REGIONS = REGIONS.slice(0, 4).map(r => r.id);
  const regionPrice = openCount => 10 + Math.max(0, openCount - START_REGIONS.length) * 3;
  const nextRegion = unlocked => REGIONS.find(r => !unlocked.includes(r.id)) || null;

  // Plätze: pro Gebiet 4 hinten, 4 vorne, 3 am Himmel. IDs hängen am Gebiet (z. B. "wald:b0") – nie an der Reihenfolge.
  const SLOTS = [];
  REGIONS.forEach(reg => {
    const X = reg.i * RW;
    [45, 135, 225, 315].forEach((dx, i) => SLOTS.push({ id: `${reg.id}:b${i}`, x: X + dx, y: 206, s: .75, region: reg.id, sky: false }));
    [70, 160, 250, 340].forEach((dx, i) => SLOTS.push({ id: `${reg.id}:f${i}`, x: X + dx, y: 250, s: 1, region: reg.id, sky: false }));
    [[60, 36], [180, 70], [300, 44]].forEach(([dx, y], i) => SLOTS.push({ id: `${reg.id}:s${i}`, x: X + dx, y, s: 1, region: reg.id, sky: true }));
  });
  const slotById = Object.fromEntries(SLOTS.map(s => [s.id, s]));

  // ---------- Helfer ----------
  const flower = (x, y, c, r = 2.2) => {
    let p = '';
    for (let i = 0; i < 6; i++) p += `<ellipse cx="${x}" cy="${y - r}" rx="${r * .55}" ry="${r}" fill="${c}" transform="rotate(${i * 60} ${x} ${y})"/>`;
    return p + `<circle cx="${x}" cy="${y}" r="${r * .6}" fill="#f2b01e"/>`;
  };
  const fir = (x, y, s = 1, snow = false) =>
    `<rect x="${x - 2.5 * s}" y="${y - 8 * s}" width="${5 * s}" height="${8 * s}" fill="${DWOOD}"/>` +
    `<path d="M${x} ${y - 50 * s} L${x - 12 * s} ${y - 30 * s} H${x + 12 * s} Z M${x} ${y - 38 * s} L${x - 16 * s} ${y - 8 * s} H${x + 16 * s} Z" fill="#1d6b35"/>` +
    (snow ? `<path d="M${x} ${y - 50 * s} L${x - 5 * s} ${y - 42 * s} H${x + 5 * s} Z M${x} ${y - 38 * s} L${x - 6 * s} ${y - 27 * s} H${x + 6 * s} Z" fill="#fff"/>` : '');
  const books = (x, y, n = 4) => {
    let p = '';
    for (let i = 0; i < n; i++) p += `<rect x="${x - 7 + (i % 2) * 1.5}" y="${y - 4 * (i + 1)}" width="${14 - (i % 2) * 2}" height="3.6" rx=".8" fill="${COLS[i % COLS.length]}"/>`;
    return p;
  };
  const shelfBooks = (x0, y0, w, h) => {
    let p = '', x = x0 + 1, i = 0;
    while (x < x0 + w - 3) {
      const bw = 2.6 + (i % 3) * .6, bh = h - 2 - (i % 2) * 2;
      p += `<rect x="${x}" y="${y0 + h - bh}" width="${bw}" height="${bh}" fill="${COLS[i % COLS.length]}"/>`;
      x += bw + .6; i++;
    }
    return p;
  };
  // Laubfarbe je Jahreszeit (Herbstfarbe pro Baumart)
  const leaf = (c, autumn) => c.sea === 'herbst' ? autumn : c.sea === 'fruehling' ? '#7ccf5a' : '#2e9e44';
  const bare = (h = 40) => `<rect x="-3" y="${-h}" width="6" height="${h}" fill="${DWOOD}"/>
    <path d="M0 ${-h * .6} l-12 -14 M0 ${-h * .75} l11 -15 M0 ${-h} l-3 -10 M-8 ${-h * .6 - 9} l-4 -3" stroke="${DWOOD}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="-12" cy="${-h * .6 - 14}" r="2" fill="#fff"/><circle cx="11" cy="${-h * .75 - 15}" r="2" fill="#fff"/>`;
  const crown = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/><circle cx="${cx - r * .7}" cy="${cy + r * .45}" r="${r * .62}" fill="${c}"/><circle cx="${cx + r * .7}" cy="${cy + r * .4}" r="${r * .62}" fill="${c}"/>`;

  // ---------- Sternbilder (Koordinaten um den Platz zentriert) ----------
  const CONST = {
    grosserwagen: { n: 'Großer Wagen', s: [[-30, -5], [-15, -8], [-3, -4], [8, 0], [10, 14], [28, 16], [30, 2]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] },
    kleinerwagen: { n: 'Kleiner Wagen', s: [[-28, -14], [-16, -8], [-6, -6], [4, -2], [6, 8], [20, 10], [20, 0]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]], big: [0] },
    kassiopeia: { n: 'Kassiopeia', s: [[-28, -6], [-14, 8], [0, -2], [14, 10], [28, -8]], l: [[0, 1], [1, 2], [2, 3], [3, 4]] },
    orion: { n: 'Orion', s: [[-14, -20], [14, -18], [-5, 0], [0, -1], [5, -2], [-12, 20], [13, 22], [0, -28]], l: [[7, 0], [7, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6]], big: [0, 6] },
    schwan: { n: 'Schwan', s: [[0, -26], [0, -8], [0, 8], [0, 22], [-20, -4], [20, -12]], l: [[0, 1], [1, 2], [2, 3], [4, 1], [1, 5]], big: [0] },
    leier: { n: 'Leier', s: [[-6, -24], [0, -10], [9, -8], [11, 7], [2, 5]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]], big: [0] },
    loewe: { n: 'Löwe', s: [[-26, 12], [-22, -2], [-14, -14], [-4, -16], [-2, -4], [-10, 6], [18, -2], [28, 10]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [4, 6], [6, 7], [7, 0]], big: [0] },
    skorpion: { n: 'Skorpion', s: [[-28, -18], [-22, -12], [-18, -4], [-14, 4], [-6, 10], [4, 12], [14, 10], [22, 4], [24, -4], [19, -9]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]], big: [2] },
    zwillinge: { n: 'Zwillinge', s: [[-10, -24], [10, -22], [-12, 0], [8, 2], [-14, 20], [6, 22]], l: [[0, 2], [2, 4], [1, 3], [3, 5], [0, 1]], big: [0, 1] },
    pegasus: { n: 'Pegasus', s: [[-18, -12], [16, -14], [18, 14], [-16, 12], [-30, -22], [30, -24]], l: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 5]] },
    drache: { n: 'Drache', s: [[-30, 10], [-20, 2], [-8, 6], [2, -4], [10, -14], [20, -10], [26, -18], [30, -10]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 5]] },
    kreuz: { n: 'Kreuz des Südens', s: [[0, -22], [0, 20], [-14, 0], [13, -3], [5, 8]], l: [[0, 1], [2, 3]], big: [1] },
  };
  const constellation = (k, night) => {
    const c = CONST[k];
    let s = c.l.map(([a, b]) => `<line x1="${c.s[a][0]}" y1="${c.s[a][1]}" x2="${c.s[b][0]}" y2="${c.s[b][1]}"/>`).join('');
    s = `<g stroke="#cfe3ff" stroke-width=".9" opacity="${night ? .55 : .7}">${s}</g>`;
    c.s.forEach(([x, y], i) => {
      const r = (c.big || []).includes(i) ? 2.7 : 1.9;
      if (night) s += `<circle cx="${x}" cy="${y}" r="${r * 2.4}" fill="#fff" opacity=".18"/>`;
      s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${night ? '#fff' : '#eaf4ff'}"/>`;
    });
    if (night) s += `<text x="0" y="34" font-size="6.5" font-family="sans-serif" text-anchor="middle" fill="#cfe3ff" opacity=".75">${c.n}</text>`;
    return s;
  };

  // ---------- Gadgets ----------
  // group 'land' = Landschaft (erscheint automatisch), 'himmel' = Himmelsplätze, sonst Bodenplätze
  const G = [
    // --- Landschaft ---
    { id: 'waldbach', name: 'Waldbach', group: 'land', price: 12, info: 'Bäche in allen Waldgebieten' },
    { id: 'bergbach', name: 'Bergbach', group: 'land', price: 12, info: 'Bergbäche in Bergen, Almen & Gletschern' },
    { id: 'gletschersee', name: 'Gletschersee', group: 'land', price: 16, info: 'türkise Seen in allen Gletschergebieten' },
    { id: 'fluss', name: 'Großer Fluss', group: 'land', price: 20, info: 'breite Flüsse in allen Flusstälern' },
    { id: 'blumenmeer', name: 'Blumenmeer', group: 'land', price: 10, info: 'lässt alle Blumenwiesen blühen' },
    { id: 'nordlicht', name: 'Nordlicht', group: 'land', price: 25, info: 'tanzt nachts über den Himmel' },
    { id: 'milchstrasse', name: 'Milchstraße', group: 'land', price: 18, info: 'leuchtet nachts quer über die Karte' },
    // --- Himmel ---
    ...Object.keys(CONST).map((k, i) => ({ id: 'stern_' + k, name: 'Sternbild ' + CONST[k].n, group: 'himmel', price: 6 + (i % 4) * 2, sky: true, d: c => constellation(k, c.tod === 'nacht') })),
    { id: 'sternschnuppe', name: 'Sternschnuppe', group: 'himmel', price: 5, sky: true, d: () => `
      <path d="M-28 -12 L10 6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/><path d="M-14 -5 L10 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 0 L14 5 L19 6 L15 9 L16 14 L12 11 L8 14 L9 9 L5 6 L10 5 Z" fill="#ffe08a"/>` },
    { id: 'wolke', name: 'Schäfchenwolke', group: 'himmel', price: 3, sky: true, d: () => `
      <ellipse cx="0" cy="4" rx="24" ry="8" fill="#fff" opacity=".95"/><circle cx="-9" cy="-1" r="9" fill="#fff"/><circle cx="6" cy="-4" r="11" fill="#fff"/><circle cx="17" cy="2" r="7" fill="#fff"/>` },
    { id: 'ballon', name: 'Heißluftballon', group: 'himmel', price: 12, sky: true, d: () => `
      <path d="M-16 -8 C-16 -32 16 -32 16 -8 C16 4 6 10 4 14 H-4 C-6 10 -16 4 -16 -8 Z" fill="#1e88e5"/>
      <path d="M-6 -27 C-9 -14 -7 2 -3 14 H3 C7 2 9 -14 6 -27 C2 -29 -2 -29 -6 -27 Z" fill="#f2b01e"/>
      <path d="M-15 -14 C-8 -10 8 -10 15 -14" stroke="#00a5a0" stroke-width="3" fill="none"/>
      <path d="M-4 14 L-4 19 M4 14 L4 19" stroke="${DWOOD}"/><rect x="-5" y="19" width="10" height="7" rx="1" fill="${WOOD}"/>` },
    { id: 'drachen', name: 'Flugdrachen', group: 'himmel', price: 6, sky: true, d: () => `
      <path d="M0 -20 L12 -4 L0 14 L-12 -4 Z" fill="#00a5a0"/><path d="M0 -20 L0 14 M-12 -4 H12" stroke="#fff" stroke-width="1"/>
      <path d="M0 -20 L12 -4 L0 -4 Z" fill="#f2b01e"/>
      <path d="M0 14 q-6 8 0 14 q6 6 0 14" stroke="#14233a" stroke-width=".8" fill="none"/>
      <path d="M-3 22 l3 2 l3 -2 M-3 32 l3 2 l3 -2" stroke="#e8701a" stroke-width="2"/>` },
    { id: 'voegel', name: 'Vogelschwarm', group: 'himmel', price: 4, sky: true, d: () =>
      [[-18, -4], [-6, -10], [6, -2], [16, -12], [0, 8]].map(([x, y]) => `<path d="M${x - 5} ${y} q2.5 -3 5 0 q2.5 -3 5 0" stroke="#14233a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`).join('') },
    { id: 'komet', name: 'Komet', group: 'himmel', price: 10, sky: true, d: () => `
      <path d="M-30 -14 Q-6 -4 6 2" stroke="#9fd6f7" stroke-width="7" stroke-linecap="round" opacity=".35"/>
      <path d="M-22 -10 Q-4 -2 6 2" stroke="#e3f2ff" stroke-width="3" stroke-linecap="round" opacity=".7"/><circle cx="7" cy="2.5" r="4" fill="#fff"/>` },
    // --- Bäume ---
    { id: 'tanne', name: 'Große Tanne', group: 'baeume', price: 2, d: c => fir(0, 0, 1.2, c.sea === 'winter') },
    { id: 'birke', name: 'Birke', group: 'baeume', price: 4, d: c => c.sea === 'winter' ? bare(44).replace(DWOOD, '#f4f4f2') : `
      <rect x="-3" y="-44" width="6" height="44" fill="#f4f4f2" ${OL}/><path d="M-3 -34 h3 M0 -24 h3 M-3 -14 h2.5 M0 -6 h3" stroke="#3d4652" stroke-width="1.6"/>
      <ellipse cx="0" cy="-50" rx="13" ry="18" fill="${leaf(c, '#f2b01e')}"/>` },
    { id: 'eiche', name: 'Eiche', group: 'baeume', price: 6, d: c => c.sea === 'winter' ? bare(36) : `
      <rect x="-4" y="-30" width="8" height="30" fill="${DWOOD}"/>${crown(0, -44, 18, leaf(c, '#b5653a'))}` },
    { id: 'ahorn', name: 'Ahorn', group: 'baeume', price: 6, d: c => c.sea === 'winter' ? bare(40) : `
      <rect x="-3.5" y="-32" width="7" height="32" fill="${DWOOD}"/>${crown(0, -46, 16, leaf(c, '#d35400'))}` },
    { id: 'apfelbaum', name: 'Apfelbaum', group: 'baeume', price: 7, d: c => c.sea === 'winter' ? bare(34) : `
      <rect x="-3.5" y="-26" width="7" height="26" fill="${DWOOD}"/>${crown(0, -38, 15, leaf(c, '#c98a2e'))}
      ${c.sea === 'fruehling' ? '<circle cx="-6" cy="-44" r="2" fill="#fff"/><circle cx="6" cy="-38" r="2" fill="#fff"/><circle cx="-1" cy="-32" r="2" fill="#fff"/>'
        : '<circle cx="-7" cy="-42" r="2.4" fill="#d9381e"/><circle cx="6" cy="-37" r="2.4" fill="#d9381e"/><circle cx="-1" cy="-30" r="2.4" fill="#f2b01e"/>'}` },
    { id: 'weide', name: 'Trauerweide', group: 'baeume', price: 8, d: c => {
      const col = c.sea === 'winter' ? '#c9b48a' : leaf(c, '#e3b23c');
      let d = `<rect x="-3.5" y="-40" width="7" height="40" fill="${DWOOD}"/><ellipse cx="0" cy="-44" rx="18" ry="9" fill="${col}"/>`;
      for (let i = -16; i <= 16; i += 4) d += `<path d="M${i} -42 q${i > 0 ? 2 : -2} 14 ${i > 0 ? 1 : -1} 28" stroke="${col}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
      return d;
    } },
    { id: 'kiefer', name: 'Kiefer', group: 'baeume', price: 5, d: c => `
      <path d="M-2 0 Q-4 -30 1 -50 L4 -50 Q0 -30 3 0 Z" fill="${DWOOD}"/>
      <ellipse cx="-6" cy="-50" rx="12" ry="5" fill="#2f6b3a"/><ellipse cx="6" cy="-42" rx="11" ry="4.4" fill="#2f6b3a"/><ellipse cx="1" cy="-57" rx="9" ry="4" fill="#2f6b3a"/>
      ${c.sea === 'winter' ? '<path d="M-14 -53 h14 M-2 -60 h9 M-1 -45 h13" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' : ''}` },
    { id: 'laerche', name: 'Lärche', group: 'baeume', price: 5, d: c => c.sea === 'winter' ? bare(46) : `
      <rect x="-2" y="-10" width="4" height="10" fill="${DWOOD}"/>
      <path d="M0 -56 L-10 -34 H10 Z M0 -42 L-13 -10 H13 Z" fill="${leaf(c, '#f2b01e')}"/>` },
    { id: 'kastanienbaum', name: 'Kastanienbaum', group: 'baeume', price: 7, d: c => c.sea === 'winter' ? bare(38) : `
      <rect x="-4" y="-30" width="8" height="30" fill="${DWOOD}"/>${crown(0, -44, 17, leaf(c, '#e8701a'))}
      ${c.sea === 'fruehling' ? '<path d="M-8 -50 v-5 M5 -46 v-5 M-2 -38 v-5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>' : ''}` },
    // --- Brunnen ---
    { id: 'springbrunnen', name: 'Springbrunnen', group: 'brunnen', price: 15, d: () => `
      <ellipse cx="0" cy="-4" rx="26" ry="7" fill="#c9d3e0"/><ellipse cx="0" cy="-6" rx="22" ry="5" fill="${WATER}"/>
      <rect x="-3" y="-26" width="6" height="20" fill="#c9d3e0"/><ellipse cx="0" cy="-26" rx="11" ry="3.5" fill="#c9d3e0"/>
      <g class="splash"><path d="M0 -28 q-10 -14 -16 6 M0 -28 q10 -14 16 6 M0 -28 v-10" stroke="${WATER}" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>` },
    { id: 'fontaene', name: 'Großer Fontänenbrunnen', group: 'brunnen', price: 22, d: () => `
      <ellipse cx="0" cy="-4" rx="32" ry="8" fill="#c9d3e0"/><ellipse cx="0" cy="-6" rx="28" ry="5.5" fill="${WATER}"/>
      <rect x="-3" y="-24" width="6" height="18" fill="#c9d3e0"/><ellipse cx="0" cy="-24" rx="16" ry="4" fill="#c9d3e0"/><ellipse cx="0" cy="-25" rx="13" ry="2.6" fill="${WATER}"/>
      <rect x="-2" y="-38" width="4" height="13" fill="#c9d3e0"/><ellipse cx="0" cy="-38" rx="8" ry="2.6" fill="#c9d3e0"/>
      <g class="splash"><path d="M0 -40 v-10 M0 -42 q-8 -10 -12 12 M0 -42 q8 -10 12 12 M-14 -24 q-8 2 -10 16 M14 -24 q8 2 10 16" stroke="${WATER}" stroke-width="2" fill="none" stroke-linecap="round"/></g>` },
    { id: 'trinkbrunnen', name: 'Trinkbrunnen', group: 'brunnen', price: 6, d: () => `
      <rect x="-6" y="-30" width="12" height="30" rx="2" fill="${STONE}"/><path d="M6 -24 h6 v3" stroke="${DSTONE}" stroke-width="2.2" fill="none"/>
      <path d="M12 -20 v14" stroke="${WATER}" stroke-width="1.6" stroke-dasharray="2 2"/><ellipse cx="12" cy="-4" rx="6" ry="2" fill="${WATER}"/>` },
    { id: 'muschelbrunnen', name: 'Muschelbrunnen', group: 'brunnen', price: 12, d: () => `
      <rect x="-3" y="-16" width="6" height="16" fill="#c9d3e0"/>
      <path d="M-20 -16 Q0 -44 20 -16 Z" fill="#e3eef7" ${OL}/>
      <path d="M0 -16 L-14 -24 M0 -16 L-7 -32 M0 -16 L0 -35 M0 -16 L7 -32 M0 -16 L14 -24" stroke="#9fb6c9" stroke-width="1.2"/>
      <ellipse cx="0" cy="-16" rx="20" ry="4" fill="${WATER}"/>
      <g class="splash"><path d="M0 -36 v-8 M-3 -36 q-4 -6 -8 -2 M3 -36 q4 -6 8 -2" stroke="${WATER}" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>` },
    { id: 'sprudelstein', name: 'Sprudelstein', group: 'brunnen', price: 8, d: () => `
      <ellipse cx="0" cy="-3" rx="22" ry="5" fill="#8b97a5"/>
      <path d="M-12 -2 Q-13 -22 0 -24 Q13 -22 12 -2 Z" fill="${DSTONE}"/>
      <path d="M-10 -20 Q0 -28 10 -20 Q0 -14 -10 -20 Z" fill="${WATER}" opacity=".85"/>
      <g class="splash"><circle cx="0" cy="-27" r="3" fill="${WATER}"/><circle cx="-4" cy="-31" r="1.8" fill="${WATER}"/><circle cx="4" cy="-32" r="1.5" fill="${WATER}"/></g>` },
    { id: 'vogeltraenke', name: 'Vogeltränke', group: 'brunnen', price: 5, d: () => `
      <rect x="-3" y="-22" width="6" height="22" fill="#c9d3e0"/><ellipse cx="0" cy="-23" rx="15" ry="4" fill="#c9d3e0"/><ellipse cx="0" cy="-24" rx="12" ry="2.6" fill="${WATER}"/>
      <ellipse cx="9" cy="-29" rx="4.4" ry="3.2" fill="#1e88e5"/><circle cx="12" cy="-32" r="2.4" fill="#1e88e5"/><path d="M14 -32 l2.4 .6 l-2.4 .8" fill="#f2b01e"/>` },
    { id: 'wasserspiel', name: 'Wasserspiel', group: 'brunnen', price: 10, d: () => `
      <rect x="-26" y="-3" width="52" height="3" rx="1.5" fill="#c9d3e0"/>
      <g class="splash"><path d="M-16 -3 q-2 -18 -6 -2 M0 -3 v-26 M0 -29 q-4 2 -6 8 M0 -29 q4 2 6 8 M16 -3 q2 -18 6 -2" stroke="${WATER}" stroke-width="2" fill="none" stroke-linecap="round"/></g>` },
    // --- Berge ---
    { id: 'gipfelkreuz', name: 'Gipfelkreuz', group: 'berge', price: 6, d: () => `
      <path d="M-18 0 Q-10 -12 0 -13 Q10 -12 18 0 Z" fill="${STONE}"/>
      <rect x="-1.8" y="-46" width="3.6" height="34" fill="${DWOOD}"/><rect x="-10" y="-38" width="20" height="3.4" fill="${DWOOD}"/>
      <circle cx="0" cy="-36.3" r="2.2" fill="#f2b01e"/>` },
    { id: 'steinmann', name: 'Steinmännchen', group: 'berge', price: 3, d: () => `
      <ellipse cx="0" cy="-4" rx="12" ry="5" fill="#8b97a5"/><ellipse cx="1" cy="-12" rx="9" ry="4.2" fill="#a7b2bf"/>
      <ellipse cx="-1" cy="-19" rx="7" ry="3.6" fill="#7d8996"/><ellipse cx="0" cy="-25" rx="5" ry="3" fill="#b8c2cc"/>
      <ellipse cx=".5" cy="-30" rx="3.2" ry="2.2" fill="#8b97a5"/>` },
    { id: 'berghuette', name: 'Berghütte', group: 'berge', price: 18, d: () => `
      <rect x="12" y="-46" width="5" height="12" fill="${DSTONE}"/>
      <rect x="-24" y="-26" width="48" height="26" fill="${WOOD}"/><path d="M-24 -18 h48 M-24 -10 h48" stroke="${DWOOD}" stroke-width="1.2"/>
      <path d="M-30 -24 L0 -46 L30 -24 Z" fill="#6e3f2a"/><rect x="-5" y="-16" width="10" height="16" fill="#5a3a26"/>
      <rect x="-19" y="-21" width="9" height="8" fill="#ffe08a" stroke="#fff" stroke-width="1.2"/><rect x="10" y="-21" width="9" height="8" fill="#ffe08a" stroke="#fff" stroke-width="1.2"/>
      <rect x="-20" y="-13" width="11" height="3" fill="#2e9e44"/><rect x="9" y="-13" width="11" height="3" fill="#2e9e44"/>` },
    { id: 'wegweiser', name: 'Wanderwegweiser', group: 'berge', price: 5, d: () => `
      <rect x="-1.6" y="-40" width="3.2" height="40" fill="${DWOOD}"/>
      <path d="M-2 -38 h18 l4 3.5 l-4 3.5 h-18 Z" fill="#f2b01e"/><path d="M2 -28 h-18 l-4 3.5 l4 3.5 h18 Z" fill="#f2b01e"/>
      <path d="M-2 -18 h14 l3.5 3 l-3.5 3 h-14 Z" fill="#00a5a0"/>
      <path d="M1 -34.5 h11 M-15 -24.5 h11 M1 -15 h8" stroke="#fff" stroke-width="1" opacity=".8"/>` },
    { id: 'seilbahn', name: 'Seilbahn', group: 'berge', price: 20, d: () => `
      <path d="M-6 0 L-2 -50 L2 -50 L6 0 Z" fill="${DSTONE}"/><path d="M-36 -40 L36 -52" stroke="#3d4652" stroke-width="1.2"/>
      <rect x="-4" y="-53" width="8" height="4" fill="#3d4652"/><path d="M16 -48.6 v8" stroke="#3d4652" stroke-width="1.4"/>
      <rect x="8" y="-41" width="17" height="13" rx="3" fill="#1e88e5"/><rect x="10.5" y="-38.5" width="5" height="5" fill="#cfe9fb"/><rect x="17.5" y="-38.5" width="5" height="5" fill="#cfe9fb"/>` },
    { id: 'almbank', name: 'Alm-Bank', group: 'berge', price: 4, d: () => `
      <rect x="-16" y="-12" width="32" height="3.5" rx="1" fill="${WOOD}"/><rect x="-16" y="-20" width="32" height="3" rx="1" fill="${WOOD}"/>
      <rect x="-13" y="-20" width="2.6" height="20" fill="${DWOOD}"/><rect x="10.4" y="-20" width="2.6" height="20" fill="${DWOOD}"/>` },
    { id: 'edelweiss', name: 'Edelweiß', group: 'berge', price: 3, d: () => `
      <path d="M-8 0 v-8 M0 0 v-12 M8 0 v-7" stroke="#2e9e44" stroke-width="1.4"/>${flower(-8, -9, '#fff', 3)}${flower(0, -13, '#fff', 3.4)}${flower(8, -8, '#fff', 2.8)}` },
    { id: 'fernrohr', name: 'Aussichts-Fernrohr', group: 'berge', price: 7, d: () => `
      <rect x="-1.5" y="-22" width="3" height="22" fill="${DSTONE}"/><path d="M-8 0 L0 -6 L8 0" stroke="${DSTONE}" stroke-width="2" fill="none"/>
      <g transform="rotate(-18 0 -24)"><rect x="-12" y="-29" width="22" height="9" rx="3" fill="#1d3f9e"/><rect x="10" y="-30.5" width="4" height="12" rx="1.5" fill="#3d4652"/></g>` },
    // --- Wald ---
    { id: 'pilze', name: 'Pilzfamilie', group: 'wald', price: 3, d: () => `
      <rect x="-11" y="-8" width="5" height="8" fill="#f3ece2"/><path d="M-16 -7 Q-8.5 -20 -1 -7 Z" fill="#8a5a3c"/>
      <rect x="4" y="-6" width="4" height="6" fill="#f3ece2"/><path d="M0 -5 Q6 -15 12 -5 Z" fill="#b5653a"/>
      <rect x="-3" y="-4" width="3" height="4" fill="#f3ece2"/><path d="M-6 -3.5 Q-1.5 -10 3 -3.5 Z" fill="#a0694a"/>` },
    { id: 'baumhaus', name: 'Baumhaus', group: 'wald', price: 20, d: () => `
      <rect x="-5" y="-60" width="10" height="60" fill="${DWOOD}"/>${crown(0, -68, 20, '#2e9e44')}
      <rect x="-14" y="-48" width="28" height="18" fill="${WOOD}"/><path d="M-17 -47 L0 -60 L17 -47 Z" fill="#b23a12"/><rect x="-4" y="-44" width="8" height="8" fill="#ffe08a"/>
      <path d="M8 -30 L12 0 M14 -30 L18 0 M9 -24 h6 M10 -17 h6 M11 -10 h6 M12 -3 h6" stroke="#5a3a26" stroke-width="1.4"/>` },
    { id: 'hochsitz', name: 'Hochsitz', group: 'wald', price: 10, d: () => `
      <path d="M-14 0 L-10 -38 M14 0 L10 -38 M-12 -20 L12 -10 M12 -20 L-12 -10" stroke="${DWOOD}" stroke-width="2.4"/>
      <rect x="-13" y="-48" width="26" height="12" fill="${WOOD}"/><path d="M-16 -47 L0 -58 L16 -47 Z" fill="#4f7a34"/><rect x="-7" y="-46" width="14" height="5" fill="#3d2a1e"/>` },
    { id: 'haengematte', name: 'Hängematte', group: 'wald', price: 8, d: () => `
      <rect x="-26" y="-30" width="3.4" height="30" fill="${DWOOD}"/><rect x="22.6" y="-30" width="3.4" height="30" fill="${DWOOD}"/>
      <path d="M-23 -26 Q0 -6 23 -26 Q0 -14 -23 -26 Z" fill="#00a5a0"/>
      <path d="M-14 -17 l2 2 M-4 -13 l2 2 M6 -13 l2 2 M15 -17 l2 2" stroke="#fff" stroke-width="1" opacity=".7"/>` },
    { id: 'lagerfeuer', name: 'Lagerfeuer', group: 'wald', price: 6, d: () => `
      <ellipse cx="0" cy="-2" rx="16" ry="4" fill="#8b97a5"/><path d="M-12 -3 L10 -9 M-10 -9 L12 -3" stroke="${DWOOD}" stroke-width="4" stroke-linecap="round"/>
      <g class="flicker"><path d="M0 -28 C-8 -18 -9 -10 0 -6 C9 -10 8 -18 0 -28 Z" fill="#f2b01e"/><path d="M0 -20 C-4 -14 -4 -10 0 -8 C4 -10 4 -14 0 -20 Z" fill="#e8701a"/></g>` },
    { id: 'vogelhaus', name: 'Vogelhäuschen', group: 'wald', price: 5, d: () => `
      <rect x="-1.6" y="-34" width="3.2" height="34" fill="${DWOOD}"/><rect x="-9" y="-48" width="18" height="15" fill="${WOOD}"/>
      <path d="M-12 -46 L0 -56 L12 -46 Z" fill="#1d3f9e"/><circle cx="0" cy="-41" r="3" fill="#3d2a1e"/><rect x="-6" y="-35" width="12" height="2" fill="${DWOOD}"/>` },
    { id: 'holzstapel', name: 'Holzstapel', group: 'wald', price: 3, d: () =>
      [[-10, -5], [0, -5], [10, -5], [-5, -13.5], [5, -13.5], [0, -22]].map(([x, y]) =>
        `<circle cx="${x}" cy="${y}" r="5" fill="${WOOD}" stroke="${DWOOD}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="2" fill="none" stroke="${DWOOD}" stroke-width=".8"/>`).join('') },
    // --- Wasser ---
    { id: 'seerosen', name: 'Seerosenteich', group: 'wasser', price: 8, d: () => `
      <ellipse cx="0" cy="-5" rx="30" ry="8" fill="${DWATER}" stroke="#7d8996" stroke-width="2"/>
      <ellipse cx="-12" cy="-6" rx="5" ry="2" fill="#2e9e44"/><ellipse cx="8" cy="-4" rx="6" ry="2.2" fill="#2e9e44"/>
      <circle cx="9" cy="-5.5" r="1.8" fill="#fff"/><ellipse cx="18" cy="-7" rx="4" ry="1.6" fill="#2e9e44"/>` },
    { id: 'steg', name: 'Holzsteg', group: 'wasser', price: 6, d: () => `
      <ellipse cx="6" cy="-3" rx="30" ry="6" fill="${DWATER}"/><path d="M-30 -8 h40 v4 h-40 Z" fill="${WOOD}"/>
      <path d="M-22 -8 v4 M-14 -8 v4 M-6 -8 v4 M2 -8 v4" stroke="${DWOOD}"/>
      <rect x="6" y="-8" width="2.4" height="9" fill="${DWOOD}"/><rect x="-26" y="-8" width="2.4" height="8" fill="${DWOOD}"/>` },
    { id: 'ruderboot', name: 'Ruderboot', group: 'wasser', price: 10, d: () => `
      <ellipse cx="0" cy="-2" rx="28" ry="4" fill="${DWATER}"/>
      <path d="M-6 -12 L-26 -1 M6 -12 L26 -1" stroke="${DWOOD}" stroke-width="1.8"/>
      <path d="M-20 -10 h40 l-6 8 h-28 Z" fill="${WOOD}"/><path d="M-19 -10 h38" stroke="#fff" stroke-width="2"/>` },
    { id: 'segelboot', name: 'Segelboot', group: 'wasser', price: 12, d: () => `
      <ellipse cx="0" cy="-2" rx="28" ry="4" fill="${DWATER}"/><path d="M-18 -8 h36 l-6 7 h-24 Z" fill="#1d3f9e"/>
      <rect x="-1" y="-48" width="2" height="40" fill="${DWOOD}"/><path d="M2 -46 L20 -12 H2 Z" fill="#fff" ${OL}/><path d="M-2 -40 L-16 -12 H-2 Z" fill="#00a5a0"/>` },
    { id: 'bruecke', name: 'Brücke', group: 'wasser', price: 12, d: () => `
      <ellipse cx="0" cy="-1" rx="24" ry="3.5" fill="${DWATER}"/>
      <path d="M-34 0 Q0 -30 34 0 L34 -6 Q0 -36 -34 -6 Z" fill="${WOOD}"/>
      <path d="M-30 -14 Q0 -42 30 -14" stroke="${DWOOD}" stroke-width="2" fill="none"/>
      <path d="M-22 -16 v-8 M-11 -24 v-8 M0 -27 v-7 M11 -24 v-8 M22 -16 v-8" stroke="${DWOOD}" stroke-width="1.6"/>` },
    { id: 'wasserfall', name: 'Wasserfall-Felsen', group: 'wasser', price: 14, d: () => `
      <path d="M-22 0 L-18 -42 L-4 -50 L10 -46 L20 -30 L24 0 Z" fill="#7d8996"/>
      <path d="M-4 -48 h8 v48 h-8 Z" fill="${WATER}"/><path d="M-2 -40 v6 M2 -30 v6 M-1 -18 v6" stroke="#fff" stroke-width="1.4" opacity=".8"/>
      <ellipse cx="0" cy="-2" rx="16" ry="3.5" fill="${WATER}"/><circle cx="-8" cy="-4" r="2" fill="#fff" opacity=".8"/><circle cx="8" cy="-5" r="1.6" fill="#fff" opacity=".8"/>` },
    // --- Geographie ---
    { id: 'leuchtturm', name: 'Leuchtturm', group: 'geo', price: 18, d: () => `
      <path d="M-9 0 L-6 -50 L6 -50 L9 0 Z" fill="#fff" ${OL}/>
      <path d="M-8.4 -12 L8.4 -12 L7.8 -22 L-7.8 -22 Z M-7.2 -32 L7.2 -32 L6.6 -42 L-6.6 -42 Z" fill="#1e88e5"/>
      <rect x="-10" y="-51" width="20" height="2.4" fill="#3d4652"/><rect x="-7" y="-58" width="14" height="8" fill="#ffe08a"/>
      <path d="M-9 -58 L0 -66 L9 -58 Z" fill="#1d3f9e"/>` },
    { id: 'globus', name: 'Globus', group: 'geo', price: 9, d: () => `
      <path d="M-8 0 h16 l-3 -5 h-10 Z" fill="${DWOOD}"/><rect x="-1.2" y="-12" width="2.4" height="8" fill="${DWOOD}"/>
      <circle cx="0" cy="-26" r="14" fill="#1e88e5"/>
      <path d="M-8 -34 q4 -2 6 2 q-2 5 -6 4 Z M3 -30 q6 -3 8 3 q-3 6 -7 3 Z M-6 -22 q5 -1 6 4 q-4 2 -6 -1 Z" fill="#2e9e44"/>
      <path d="M-15 -26 a15 15 0 0 0 30 0" stroke="#b8860b" stroke-width="1.6" fill="none"/>` },
    { id: 'kompassrose', name: 'Kompassrose', group: 'geo', price: 5, d: () => `
      <ellipse cx="0" cy="-3" rx="22" ry="7" fill="#e3eef7" ${OL}/>
      <path d="M-20 -3 L0 -5 L20 -3 L0 -1 Z" fill="#1e88e5"/><path d="M0 -10 L3 -3 L0 4 L-3 -3 Z" fill="#1d3f9e"/><path d="M0 -10 L3 -3 L-3 -3 Z" fill="#e8701a"/>` },
    { id: 'wetterstation', name: 'Wetterstation', group: 'geo', price: 8, d: () => `
      <path d="M-8 0 L-6 -24 M8 0 L6 -24" stroke="${DWOOD}" stroke-width="2"/>
      <rect x="-10" y="-36" width="20" height="14" fill="#fff" stroke="${STONE}"/><path d="M-8 -32 h16 M-8 -28 h16" stroke="#c9d3e0"/>
      <rect x="-1" y="-50" width="2" height="14" fill="${DSTONE}"/><path d="M0 -50 l-9 -2 M0 -50 l9 -2 M0 -50 l0 -6" stroke="${DSTONE}" stroke-width="1.4"/>
      <circle cx="-9" cy="-52" r="2.2" fill="#1e88e5"/><circle cx="9" cy="-52" r="2.2" fill="#1e88e5"/><circle cx="0" cy="-56" r="2.2" fill="#1e88e5"/>` },
    { id: 'weltwegweiser', name: 'Wegweiser in die Welt', group: 'geo', price: 7, d: () => `
      <rect x="-1.6" y="-46" width="3.2" height="46" fill="${DWOOD}"/>
      <path d="M-1 -44 h24 l3 3 l-3 3 h-24 Z" fill="#1e88e5"/><path d="M1 -34 h-24 l-3 3 l3 3 h24 Z" fill="#2e9e44"/><path d="M-1 -24 h20 l3 3 l-3 3 h-20 Z" fill="#e8701a"/>
      <g font-size="4.2" font-family="sans-serif" font-weight="700" fill="#fff"><text x="1" y="-39.5">Tübingen</text><text x="-21" y="-29.5">Alpen</text><text x="1" y="-19.5">Meer</text></g>` },
    { id: 'zelt', name: 'Zelt', group: 'geo', price: 7, d: () => `
      <path d="M0 -32 v-6" stroke="${DWOOD}" stroke-width="1.6"/><path d="M0 -38 l7 2 l-7 2" fill="#f2b01e"/>
      <path d="M-24 0 L0 -32 L24 0 Z" fill="#00a5a0"/><path d="M0 -32 L-6 0 H6 Z" fill="#00857f"/>` },
    { id: 'teleskop', name: 'Sternwarte', group: 'geo', price: 16, d: () => `
      <rect x="-16" y="-22" width="32" height="22" fill="#e3eef7" ${OL}/><path d="M-18 -22 A18 18 0 0 1 18 -22 Z" fill="#9aa6b2"/>
      <rect x="-3" y="-40" width="6" height="16" fill="#1d3f9e" transform="rotate(30 0 -26)"/><rect x="-4" y="-12" width="8" height="12" fill="${DWOOD}"/>` },
    // --- Bücher ---
    { id: 'buecherbank', name: 'Bücherbank', group: 'buch', price: 8, d: () => `
      <rect x="-22" y="-14" width="44" height="5" rx="2" fill="${WOOD}"/><rect x="-20" y="-9" width="3" height="9" fill="${DWOOD}"/><rect x="17" y="-9" width="3" height="9" fill="${DWOOD}"/>
      ${books(-8, -14, 3)}` },
    { id: 'buecherschrank', name: 'Offener Bücherschrank', group: 'buch', price: 14, d: () => `
      <path d="M-19 -44 L0 -52 L19 -44 Z" fill="#14306f"/><rect x="-16" y="-44" width="32" height="44" rx="2" fill="#1d3f9e"/>
      <rect x="-12" y="-40" width="24" height="36" fill="#e3eef7"/>
      ${shelfBooks(-12, -40, 24, 12)}${shelfBooks(-12, -28, 24, 12)}${shelfBooks(-12, -16, 24, 12)}
      <path d="M-12 -28 h24 M-12 -16 h24" stroke="#1d3f9e" stroke-width="1.6"/>` },
    { id: 'leseecke', name: 'Leseecke', group: 'buch', price: 10, d: () => `
      <rect x="19" y="-36" width="1.8" height="36" fill="#3d4652"/><path d="M14 -36 h12 l-3 -8 h-6 Z" fill="#f2b01e"/>
      <rect x="-18" y="-28" width="8" height="22" rx="4" fill="#00857f"/><rect x="-16" y="-18" width="26" height="12" rx="4" fill="#00a5a0"/>
      <rect x="8" y="-20" width="6" height="14" rx="3" fill="#00857f"/><rect x="-14" y="-6" width="3" height="6" fill="${DWOOD}"/><rect x="7" y="-6" width="3" height="6" fill="${DWOOD}"/>
      <rect x="-6" y="-21" width="9" height="3" rx="1" fill="#e8701a"/>` },
    { id: 'bibliothek', name: 'Bibliothekshäuschen', group: 'buch', price: 22, d: () => `
      <rect x="-26" y="-34" width="52" height="34" fill="#e3eef7" ${OL}/><path d="M-30 -32 L0 -50 L30 -32 Z" fill="#1d3f9e"/>
      <rect x="-6" y="-18" width="12" height="18" fill="${DWOOD}"/><rect x="-21" y="-26" width="10" height="10" fill="#ffe08a"/><rect x="11" y="-26" width="10" height="10" fill="#ffe08a"/>
      <rect x="-13" y="-32" width="26" height="5.4" rx="1" fill="#f2b01e"/>
      <text x="0" y="-27.8" font-size="4.4" font-family="sans-serif" font-weight="800" text-anchor="middle" fill="#14233a">BÜCHEREI</text>` },
    { id: 'buecherstapel', name: 'Bücherstapel', group: 'buch', price: 3, d: () => books(0, 0, 5) },
    // --- Schokolade ---
    { id: 'kakaostand', name: 'Kakaostand', group: 'schoko', price: 10, d: () => {
      let aw = '';
      for (let i = 0; i < 5; i++) aw += `<rect x="${-22 + i * 8.8}" y="-50" width="8.8" height="8" fill="${i % 2 ? '#fff' : '#00a5a0'}"/><circle cx="${-17.6 + i * 8.8}" cy="-42" r="4.4" fill="${i % 2 ? '#fff' : '#00a5a0'}"/>`;
      return `<rect x="-18" y="-44" width="2.4" height="24" fill="${DWOOD}"/><rect x="15.6" y="-44" width="2.4" height="24" fill="${DWOOD}"/>${aw}
        <rect x="-20" y="-20" width="40" height="20" fill="#a0694a"/><rect x="-20" y="-22" width="40" height="3" fill="#6e3f2a"/>
        <rect x="-10" y="-28" width="6" height="6" rx="1" fill="#fff"/><rect x="2" y="-28" width="6" height="6" rx="1" fill="#fff"/>
        <path d="M-7 -30 q-1.5 -2 0 -4 M5 -30 q-1.5 -2 0 -4" stroke="#c9d3e0" stroke-width="1" fill="none"/>`;
    } },
    { id: 'schokobrunnen', name: 'Schokobrunnen', group: 'schoko', price: 16, d: () => `
      <ellipse cx="0" cy="-4" rx="22" ry="6" fill="#c9d3e0"/><ellipse cx="0" cy="-5" rx="18" ry="4" fill="#6e3f2a"/>
      <rect x="-2.5" y="-36" width="5" height="31" fill="#c9d3e0"/>
      <ellipse cx="0" cy="-22" rx="12" ry="3" fill="#8a5236"/><ellipse cx="0" cy="-34" rx="7" ry="2.2" fill="#8a5236"/>
      <path d="M-12 -22 q-2 8 -3 16 M12 -22 q2 8 3 16 M-7 -34 q-1 5 -2 11 M7 -34 q1 5 2 11" stroke="#6e3f2a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="-38" r="2.4" fill="#6e3f2a"/>` },
    { id: 'schokohaus', name: 'Schokohäuschen', group: 'schoko', price: 20, d: () => `
      <rect x="-20" y="-28" width="40" height="28" fill="#a0694a"/><path d="M-24 -26 L0 -46 L24 -26 Z" fill="#6e3f2a"/>
      <path d="M-24 -26 q3 4 6 0 q3 4 6 0 q3 4 6 0 q3 4 6 0 q3 4 6 0 q3 4 6 0 q3 4 6 0 q3 4 6 0" stroke="#fff" stroke-width="2" fill="none"/>
      <rect x="-6" y="-18" width="12" height="18" fill="#7b4a32"/><path d="M0 -18 v18 M-6 -12 h12 M-6 -6 h12" stroke="#5c3424"/>
      <rect x="-16" y="-22" width="7" height="7" fill="#ffe08a"/><rect x="9" y="-22" width="7" height="7" fill="#ffe08a"/>` },
    { id: 'pralinen', name: 'Pralinenkiste', group: 'schoko', price: 4, d: () => `
      <rect x="-14" y="-10" width="28" height="10" rx="2" fill="#1d3f9e"/><rect x="-14" y="-12" width="28" height="3" rx="1" fill="#f2b01e"/>
      <circle cx="-8" cy="-14" r="3" fill="#6e3f2a"/><circle cx="0" cy="-14.5" r="3" fill="#a0694a"/><circle cx="8" cy="-14" r="3" fill="#5c3424"/>` },
    // --- Häkeln ---
    { id: 'wollkorb', name: 'Wollkorb', group: 'haekeln', price: 4, d: () => `
      <circle cx="-6" cy="-15" r="6" fill="#1e88e5"/><circle cx="5" cy="-16" r="6.5" fill="#f2b01e"/><circle cx="0" cy="-21" r="5" fill="#2e9e44"/>
      <path d="M-10 -15 q4 -4 8 0 M1 -16 q4 -4 8 0 M-3 -21 q3 -3 6 0" stroke="#fff" stroke-width=".9" fill="none" opacity=".7"/>
      <path d="M8 -26 L16 -12 M12 -27 L14 -12" stroke="#c9d3e0" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M-14 -12 h28 l-3 12 h-22 Z" fill="${WOOD}"/><path d="M-13 -8 h26 M-12 -4 h24" stroke="${DWOOD}"/>` },
    { id: 'wimpel', name: 'Gehäkelte Wimpelkette', group: 'haekeln', price: 6, d: () => {
      let fl = '';
      for (let i = 0; i < 6; i++) {
        const t = .1 + i * .16, x = -29 + 58 * t, y = -34 + 20 * t * (1 - t);
        fl += `<path d="M${(x - 3.5).toFixed(1)} ${y.toFixed(1)} L${(x + 3.5).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + 8).toFixed(1)} Z" fill="${COLS[i % COLS.length]}"/>
          <path d="M${(x - 1.4).toFixed(1)} ${(y + 2).toFixed(1)} l1.4 1.8 l1.4 -1.8" stroke="#fff" stroke-width=".7" fill="none" opacity=".8"/>`;
      }
      return `<rect x="-30" y="-36" width="2.4" height="36" fill="${DWOOD}"/><rect x="27.6" y="-36" width="2.4" height="36" fill="${DWOOD}"/>
        <path d="M-29 -34 Q0 -24 29 -34" stroke="#3d4652" stroke-width=".9" fill="none"/>${fl}`;
    } },
    { id: 'picknick', name: 'Picknick auf Häkeldecke', group: 'haekeln', price: 8, d: () => {
      let q = '', k = 0;
      const P = (u, v) => [-30 + 50 * u + 10 * v, -2 - 12 * v];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
        const a = P(i / 3, j / 2), b = P((i + 1) / 3, j / 2), c = P((i + 1) / 3, (j + 1) / 2), d = P(i / 3, (j + 1) / 2);
        q += `<path d="M${a} L${b} L${c} L${d} Z" fill="${COLS[k++ % COLS.length]}" stroke="#fff" stroke-width=".8"/>`;
      }
      return q + `<rect x="8" y="-17" width="12" height="8" rx="1.5" fill="${WOOD}"/><path d="M9 -17 q5 -7 10 0" stroke="${DWOOD}" stroke-width="1.4" fill="none"/>`;
    } },
    { id: 'haekelbaum', name: 'Umhäkelter Baum', group: 'haekeln', price: 10, d: () => {
      let st = '';
      for (let i = 0; i < 7; i++) st += `<rect x="-5.5" y="${-44 + i * 5}" width="11" height="5" fill="${COLS[i % COLS.length]}"/><path d="M-3 ${-42 + i * 5} l1.2 1.5 l1.2 -1.5 M1.5 ${-42 + i * 5} l1.2 1.5 l1.2 -1.5" stroke="#fff" stroke-width=".6" fill="none" opacity=".8"/>`;
      return `<rect x="-5" y="-60" width="10" height="60" fill="${DWOOD}"/>${st}${crown(0, -68, 18, '#2e9e44')}`;
    } },
  ];
  const GROUPS = {
    land: '🏞️ Landschaft', himmel: '✨ Himmel & Sternbilder', baeume: '🌳 Bäume', brunnen: '⛲ Brunnen',
    berge: '⛰️ Berge', wald: '🌲 Wald', wasser: '💧 Wasser', geo: '🧭 Geographie', buch: '📚 Bücher', schoko: '🍫 Schokolade', haekeln: '🧶 Häkeln',
  };
  const byId = Object.fromEntries(G.map(g => [g.id, g]));

  // ---------- Fundstücke ----------
  const FINDS = [
    { id: 'muschel', name: 'eine Muschel', d: '<path d="M-5 0 Q0 -9 5 0 Z" fill="#f6c99a"/><path d="M0 0 L-3 -5 M0 0 L0 -6.5 M0 0 L3 -5" stroke="#c98a5a" stroke-width=".8"/>' },
    { id: 'kristall', name: 'ein Bergkristall', d: '<path d="M-4 0 L-3 -6 L0 -10 L3 -6 L4 0 Z" fill="#9fd6f7" stroke="#5aa9d6" stroke-width=".7"/><path d="M0 -10 V0" stroke="#fff" stroke-width=".7"/>' },
    { id: 'zapfen', name: 'ein Tannenzapfen', d: '<ellipse cx="0" cy="-4" rx="3.2" ry="5" fill="#8a5a3c"/><path d="M-2.5 -6 h5 M-3 -3.5 h6 M-2.5 -1 h5" stroke="#5c3a24" stroke-width=".8"/>' },
    { id: 'feder', name: 'eine Feder', d: '<path d="M-5 0 Q-3 -9 5 -10 Q2 -3 -5 0 Z" fill="#1e88e5"/><path d="M-5 0 L4 -9" stroke="#fff" stroke-width=".6"/>' },
    { id: 'klee', name: 'ein vierblättriges Kleeblatt', d: '<circle cx="-2" cy="-6" r="2.2" fill="#2e9e44"/><circle cx="2" cy="-6" r="2.2" fill="#2e9e44"/><circle cx="-2" cy="-2.5" r="2.2" fill="#2e9e44"/><circle cx="2" cy="-2.5" r="2.2" fill="#2e9e44"/><path d="M0 -3 q1 3 3 3" stroke="#1d6b35" stroke-width=".8" fill="none"/>' },
    { id: 'herzstein', name: 'ein Herzstein', d: '<path d="M0 0 C-7 -4 -5 -10 0 -6.5 C5 -10 7 -4 0 0 Z" fill="#9aa6b2" stroke="#6f7c8a" stroke-width=".6"/>' },
    { id: 'eichel', name: 'eine Eichel', d: '<ellipse cx="0" cy="-3.5" rx="3" ry="4" fill="#c9893d"/><path d="M-3.6 -6 Q0 -10 3.6 -6 Z" fill="#7a5236"/>' },
    { id: 'schnecke', name: 'ein Schneckenhaus', d: '<circle cx="0" cy="-4" r="4" fill="#e8a05a"/><path d="M0 -4 m-2.5 0 a2.5 2.5 0 1 1 2.5 2.5 a1.4 1.4 0 1 1 -1.2 -1.6" stroke="#b5653a" stroke-width=".8" fill="none"/>' },
    { id: 'perle', name: 'eine Glasperle', d: '<circle cx="0" cy="-3.5" r="3.5" fill="#00a5a0"/><circle cx="-1.2" cy="-4.8" r="1" fill="#fff" opacity=".8"/>' },
    { id: 'stern', name: 'ein Sternstein', d: '<path d="M0 -9 L2 -4.5 L6.5 -4 L3 -1 L4 3.5 L0 1 L-4 3.5 L-3 -1 L-6.5 -4 L-2 -4.5 Z" transform="scale(.75)" fill="#f2b01e"/>' },
    { id: 'kastanie', name: 'eine Kastanie', d: '<circle cx="0" cy="-3.6" r="3.6" fill="#7a3f1e"/><path d="M-3 -2 q3 2 6 0" stroke="#d9b48a" stroke-width="1.2" fill="none"/><circle cx="-1" cy="-5" r=".8" fill="#fff" opacity=".6"/>' },
  ];
  const findById = Object.fromEntries(FINDS.map(f => [f.id, f]));
  // Fundstück liegt in einem offenen Gebiet; x ist relativ zum Gebiet (0–360)
  function randomFind(unlocked) {
    const f = FINDS[Math.floor(Math.random() * FINDS.length)];
    const ids = (unlocked || START_REGIONS).filter(id => regionById[id]);
    const region = ids[Math.floor(Math.random() * ids.length)] || START_REGIONS[0];
    return { type: f.id, name: f.name, region, x: Math.round(20 + Math.random() * (RW - 40)), y: Math.round(253 + Math.random() * 6) };
  }

  // ---------- Tageszeit & Jahreszeit ----------
  const timeOfDay = h => h >= 21 || h < 6 ? 'nacht' : h < 9 ? 'morgen' : h < 17 ? 'tag' : 'abend';
  const season = m => m === 11 || m <= 1 ? 'winter' : m <= 4 ? 'fruehling' : m <= 7 ? 'sommer' : 'herbst';
  const SKY = {
    tag: ['#173a8f', '#3f8fe0', '#9fd6f7'], morgen: ['#3360b8', '#8fc4ee', '#ffe1ad'],
    abend: ['#1b2a66', '#e8784a', '#ffcf7a'], nacht: ['#050d1f', '#0f2350', '#1f3d74'],
  };
  const LAND = {
    fruehling: { hill: '#4caf50', ground: '#7ccf5a', leaf: ['#7ccf5a', '#5fbf4a'] },
    sommer: { hill: '#3fa34d', ground: '#6cc24a', leaf: ['#2e9e44', '#3fa34d'] },
    herbst: { hill: '#6a9a3a', ground: '#8fb04a', leaf: ['#e8701a', '#d35400', '#f2b01e', '#b23a12'] },
    winter: { hill: '#e6eef6', ground: '#f4f8fb', leaf: [] },
  };
  // Berghöhen je Gebietstyp (kleineres y = höher)
  const BIOME = {
    wald: [110, 150], schneewald: [70, 120], berge: [30, 90], gletscher: [15, 60], see: [90, 140], fluss: [100, 145],
    blumen: [120, 150], dorf: [100, 145], kueste: [130, 160], birken: [105, 145], alm: [80, 130], schlucht: [40, 80],
    fjord: [25, 70], moor: [120, 155], polar: [95, 140], vulkan: [125, 155], canyon: [125, 155], insel: [130, 160],
  };
  const rnd = seed => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

  // Gemeinsame Bausteine für Wasser im Hintergrund (Küste, Polar, Insel, Vulkan)
  const seaBand = (X, winter) => `<path d="M${X} 166 H${X + RW} V216 H${X} Z" fill="${winter ? '#9fd0ee' : DWATER}"/>
    <path d="M${X + 20} 180 q12 -4 24 0 M${X + 120} 192 q12 -4 24 0 M${X + 220} 178 q12 -4 24 0 M${X + 300} 198 q12 -4 24 0" stroke="#fff" stroke-width="1.8" fill="none" opacity=".75"/>`;
  const creek = (d, w, winter) => `<path d="${d}" stroke="${winter ? '#d4e9f6' : WATER}" stroke-width="${w}" fill="none" stroke-linecap="round"/>
    <path d="${d}" stroke="#fff" stroke-width="${w > 10 ? 2 : 1.4}" fill="none" stroke-dasharray="5 10" opacity=".8"/>`;

  function region(reg, c, owned, locked) {
    const X = reg.i * RW, b = reg.biome, r = rnd(reg.i * 97 + 13);
    const has = id => owned.has(id);
    const snowy = b === 'polar' || b === 'schneewald';
    const sea = snowy ? 'winter' : c.sea, winter = sea === 'winter';
    const land = LAND[sea], night = c.tod === 'nacht';
    let s = `<rect x="${X}" y="0" width="${RW}" height="${H}" fill="url(#wsky-${c.tod})"/>`;
    // Himmel: Sterne, Milchstraße, Nordlicht, Sonne/Mond
    if (night) {
      for (let i = 0; i < 20; i++) s += `<circle cx="${(X + r() * RW).toFixed(0)}" cy="${(r() * 130).toFixed(0)}" r="${(r() * 1.1 + .35).toFixed(1)}" fill="#fff" opacity="${(r() * .6 + .3).toFixed(2)}"/>`;
      if (has('milchstrasse')) {
        const yb = x => 75 + 35 * Math.sin(x / 700);
        let d = `M${X} ${yb(X).toFixed(1)}`;
        for (let x = X + 30; x <= X + RW; x += 30) d += ` L${x} ${yb(x).toFixed(1)}`;
        s += `<path d="${d}" stroke="#cfe3ff" stroke-width="38" fill="none" opacity=".12"/>`;
        for (let i = 0; i < 40; i++) { const x = X + r() * RW; s += `<circle cx="${x.toFixed(0)}" cy="${(yb(x) + (r() - .5) * 34).toFixed(0)}" r="${(r() * .9 + .3).toFixed(1)}" fill="#fff" opacity="${(r() * .5 + .3).toFixed(2)}"/>`; }
      }
      if (has('nordlicht')) for (let k = 0; k < 3; k++) {
        const ya = x => 38 + k * 14 + 12 * Math.sin(x / 180 + k) + 8 * Math.sin(x / 77 + k * 2);
        let d = `M${X} ${ya(X).toFixed(1)}`;
        for (let x = X + 20; x <= X + RW; x += 20) d += ` L${x} ${ya(x).toFixed(1)}`;
        s += `<path class="aurora" d="${d}" stroke="url(#aurora)" stroke-width="${44 - k * 10}" fill="none" opacity="${.8 - k * .2}"/>`;
      }
      if (reg.i === 1) s += `<circle cx="${X + 250}" cy="40" r="15" fill="#f3efd0"/><circle cx="${X + 257}" cy="35" r="13" fill="${SKY.nacht[0]}"/>`;
    } else if (reg.i === 1) s += `<circle cx="${X + 250}" cy="${c.tod === 'tag' ? 40 : 70}" r="18" fill="#ffd23f"/>`;

    // Berge mit festen Randhöhen, damit die Gebiete nahtlos aneinanderpassen
    const [hi, lo] = BIOME[b] || [100, 140];
    const pk = [60, 140, 220, 300].map(dx => [X + dx, Math.round(hi + r() * (lo - hi))]);
    const mount = b === 'canyon' ? '#b5653a' : night ? '#2f4366' : '#5f7ba3';
    s += `<path d="M${X} 128 ${pk.map(p => 'L' + p.join(' ')).join(' ')} L${X + RW} 128 V${H} H${X} Z" fill="${mount}"/>`;
    pk.filter(p => p[1] < 100 || snowy).forEach(([x, y]) => {
      const k = (winter ? 1.9 : 1) * (y < 60 ? 1.4 : 1);
      s += `<path d="M${x - 12 * k} ${y + 14 * k} L${x} ${y} L${x + 12 * k} ${y + 14 * k} L${x + 6 * k} ${y + 10 * k} L${x} ${y + 16 * k} L${x - 6 * k} ${y + 10 * k} Z" fill="#fff"/>`;
    });
    if (b === 'gletscher') pk.filter(p => p[1] < 65).forEach(([x, y]) =>
      s += `<path d="M${x - 6} ${y + 12} Q${x - 4} ${y + 60} ${x + 4} 165 L${x + 30} 165 Q${x + 18} ${y + 50} ${x + 8} ${y + 12} Z" fill="#e3f2fb" opacity=".95"/>`);
    if (b === 'vulkan') s += `<path d="M${X + 110} 175 L${X + 165} 70 L${X + 195} 70 L${X + 250} 175 Z" fill="${night ? '#3a3f52' : '#5a5f72'}"/>
      <ellipse cx="${X + 180}" cy="71" rx="15" ry="4" fill="#e8701a"/><g class="smoke"><circle cx="${X + 184}" cy="56" r="8" fill="#e3e8ef" opacity=".8"/><circle cx="${X + 194}" cy="42" r="10" fill="#e3e8ef" opacity=".6"/><circle cx="${X + 208}" cy="28" r="12" fill="#e3e8ef" opacity=".45"/></g>`;
    if (b === 'canyon') s += `<path d="M${X + 20} 175 V120 H${X + 90} V175 Z M${X + 200} 175 V100 H${X + 250} V138 H${X + 290} V175 Z" fill="#c96a3a"/>
      <path d="M${X + 20} 132 H${X + 90} M${X + 200} 116 H${X + 250} M${X + 250} 150 H${X + 290}" stroke="#e8894a" stroke-width="3"/>`;
    if (b === 'schlucht') s += `<path d="M${X} 128 L${X + 120} 60 L${X + 150} 200 L${X} 210 Z M${X + RW} 128 L${X + 230} 50 L${X + 205} 200 L${X + RW} 210 Z" fill="${DSTONE}"/>
      ${creek(`M${X + 178} 70 V196`, 12, winter)}<ellipse cx="${X + 178}" cy="200" rx="34" ry="7" fill="${winter ? '#d4e9f6' : WATER}"/>`;
    if (b === 'berge' || b === 'alm' || b === 'gletscher') if (has('bergbach')) s += creek(`M${pk[1][0]} ${pk[1][1] + 14} Q${pk[1][0] - 12} ${pk[1][1] + 60} ${pk[1][0] + 10} 150 T${pk[1][0] + 30} 212`, 5, winter);

    // Hügel bzw. Wasser im Hintergrund
    const hy = 160 + r() * 16;
    const hillCol = b === 'canyon' ? '#d9894a' : b === 'moor' ? '#4f7a46' : land.hill;
    s += `<path d="M${X} 172 Q${X + 90} ${hy.toFixed(0)} ${X + 180} 172 T${X + RW} 172 V${H} H${X} Z" fill="${hillCol}"/>`;
    if (b === 'kueste' || b === 'polar' || b === 'insel' || b === 'vulkan') s += seaBand(X, winter);
    if (b === 'fjord') s += `<path d="M${X + 120} 216 Q${X + 150} 180 ${X + 170} 150 L${X + 200} 150 Q${X + 220} 185 ${X + 260} 216 Z" fill="${DWATER}"/>`;
    if (b === 'polar') [[60, 196, 1.2], [180, 186, .8], [290, 200, 1]].forEach(([dx, y, k]) =>
      s += `<path d="M${X + dx - 22 * k} ${y} L${X + dx - 12 * k} ${y - 26 * k} L${X + dx} ${y - 18 * k} L${X + dx + 10 * k} ${y - 34 * k} L${X + dx + 24 * k} ${y} Z" fill="#f4f9fd"/><path d="M${X + dx - 2 * k} ${y - 18 * k} L${X + dx + 10 * k} ${y - 34 * k} L${X + dx + 8 * k} ${y} Z" fill="#cfe6f5"/>`);
    if (b === 'insel') [[90, 1], [260, .8]].forEach(([dx, k]) =>
      s += `<ellipse cx="${X + dx}" cy="192" rx="${40 * k}" ry="${9 * k}" fill="${land.hill}"/>${fir(X + dx - 10, 190, .5 * k, winter)}${fir(X + dx + 8, 190, .65 * k, winter)}`);
    if (b === 'see') {
      s += `<ellipse cx="${X + 180}" cy="190" rx="150" ry="14" fill="${winter ? '#d4e9f6' : DWATER}"/>`;
      s += `<path d="M${X + 80} 190 q10 -3 20 0 M${X + 180} 194 q10 -3 20 0 M${X + 260} 187 q10 -3 20 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/>`;
    }
    if (b === 'gletscher' && has('gletschersee')) s += `<ellipse cx="${X + 180}" cy="184" rx="110" ry="11" fill="${winter ? '#d4e9f6' : '#2bd0c8'}"/><path d="M${X + 110} 184 h30 M${X + 180} 188 h40" stroke="#fff" stroke-width="1.6" opacity=".7"/>`;
    if (b === 'moor') for (let i = 0; i < 5; i++) {
      const x = X + 30 + r() * 300, y = 186 + r() * 18;
      s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(18 + r() * 16).toFixed(0)}" ry="4" fill="#2f5d5c"/><path d="M${(x - 8).toFixed(0)} ${y.toFixed(0)} v-12 M${(x - 4).toFixed(0)} ${y.toFixed(0)} v-16 M${(x + 2).toFixed(0)} ${y.toFixed(0)} v-10" stroke="#5a7a3a" stroke-width="1.4"/>`;
    }

    // Bäume & Häuser im Hintergrund
    if (b === 'wald' || b === 'schneewald') for (let x = X + 12; x < X + RW - 8; x += 24 + r() * 10) s += fir(x, 182 + r() * 6, .7 + r() * .4, winter);
    if (b === 'berge' || b === 'alm' || b === 'fluss' || b === 'see') [X + 14, X + 40, X + RW - 30].forEach(x => s += fir(x, 180, .8, winter));
    if (b === 'birken') for (let x = X + 16; x < X + RW - 8; x += 30 + r() * 10) {
      const y = 184;
      s += `<rect x="${x - 2}" y="${y - 34}" width="4" height="34" fill="#f4f4f2"/><path d="M${x - 2} ${y - 26} h2 M${x} ${y - 16} h2" stroke="#3d4652" stroke-width="1.4"/>`;
      if (!winter) s += `<ellipse cx="${x}" cy="${y - 40}" rx="10" ry="14" fill="${c.sea === 'herbst' ? '#f2b01e' : land.leaf[0]}"/>`;
    }
    if (b === 'dorf' || b === 'blumen') for (let x = X + 20; x < X + RW - 10; x += 38 + r() * 18) {
      const y = 182 + r() * 4;
      s += `<rect x="${x - 2}" y="${y - 14}" width="4" height="14" fill="${DWOOD}"/>`;
      if (winter) s += `<path d="M${x} ${y - 14} l-7 -10 M${x} ${y - 16} l6 -11 M${x} ${y - 20} v-8" stroke="${DWOOD}" stroke-width="1.6"/><circle cx="${x}" cy="${y - 26}" r="2" fill="#fff"/>`;
      else {
        s += crown(x, y - 24, 12, land.leaf[Math.floor(r() * land.leaf.length)]);
        if (c.sea === 'fruehling' || b === 'blumen') s += `<circle cx="${x - 4}" cy="${y - 27}" r="1.6" fill="#fff"/><circle cx="${x + 5}" cy="${y - 22}" r="1.6" fill="#fff"/>`;
      }
    }
    if (b === 'dorf') [[110, '#1d3f9e'], [250, '#b23a12']].forEach(([dx, roof]) =>
      s += `<rect x="${X + dx - 14}" y="176" width="28" height="18" fill="#e3eef7"/><path d="M${X + dx - 17} 177 L${X + dx} 164 L${X + dx + 17} 177 Z" fill="${roof}"/><rect x="${X + dx - 3}" y="184" width="6" height="10" fill="${DWOOD}"/><rect x="${X + dx - 11}" y="180" width="5" height="5" fill="#ffe08a"/>`);
    if (b === 'alm') s += `<path d="M${X} 204 H${X + RW}" stroke="${WOOD}" stroke-width="1.6"/>` + [...Array(10)].map((_, i) => `<rect x="${X + 10 + i * 36}" y="196" width="2.4" height="10" fill="${DWOOD}"/>`).join('');

    // Vorderer Boden, Weg, Bäche
    const gy = 204 + r() * 10;
    const groundCol = b === 'canyon' ? '#e0a060' : b === 'moor' ? '#6f8f4a' : land.ground;
    s += `<path d="M${X} 214 Q${X + 90} ${gy.toFixed(0)} ${X + 180} 214 T${X + RW} 214 V${H} H${X} Z" fill="${groundCol}"/>`;
    s += `<path d="M${X} 238 Q${X + 90} ${(230 + r() * 8).toFixed(0)} ${X + 180} 238 T${X + RW} 238" stroke="${winter ? '#dbe6ef' : '#c9d3e0'}" stroke-width="7" fill="none" opacity=".8"/>`;
    if ((b === 'wald' || b === 'birken' || b === 'schneewald') && has('waldbach')) s += creek(`M${X + 110} 176 Q${X + 60} 200 ${X + 140} 222 T${X + 90} ${H}`, 9, winter);
    if (b === 'fluss') s += creek(`M${X + 150} 172 Q${X + 290} 192 ${X + 210} 216 T${X + 330} ${H}`, has('fluss') ? 20 : 8, winter);
    if (b === 'kueste' || b === 'vulkan') s += `<path d="M${X + 8} 216 q8 -12 18 -6 q6 -8 14 0 v6 Z M${X + 160} 218 q10 -14 22 -6 q6 -6 12 2 v4 Z" fill="${DSTONE}"/>`;

    // Streudetails je Jahreszeit + Blumen
    for (let i = 0; i < 16; i++) {
      const x = (X + r() * RW).toFixed(0), y = (218 + r() * 40).toFixed(0);
      if (sea === 'herbst') s += `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.4" fill="${land.leaf[i % land.leaf.length]}" transform="rotate(${(r() * 90).toFixed(0)} ${x} ${y})"/>`;
      else if (winter) s += `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`;
      else s += `<circle cx="${x}" cy="${y}" r="1.8" fill="${i % 3 ? '#fff' : '#f2b01e'}"/>`;
    }
    if (b === 'blumen' && !winter) {
      const n = has('blumenmeer') ? 80 : 22;
      for (let i = 0; i < n; i++) s += flower(Math.round(X + r() * RW), Math.round(216 + r() * 40), ['#fff', '#1e88e5', '#f2b01e', '#00a5a0'][i % 4], has('blumenmeer') ? 2.6 : 2);
    }
    if (night) s += `<rect x="${X}" y="140" width="${RW}" height="${H - 140}" fill="#0b1630" opacity=".3"/>`;

    // Schild mit Gebietsnamen
    const lw = reg.name.length * 5.6 + 16;
    s += `<g><rect x="${X + 8}" y="${H - 22}" width="${lw}" height="15" rx="7" fill="rgba(20,35,58,.5)"/><text x="${X + 16}" y="${H - 11}" font-size="9.5" font-family="sans-serif" font-weight="700" fill="#fff">${reg.name}</text></g>`;

    if (locked) {
      s += `<rect x="${X}" y="0" width="${RW}" height="${H}" fill="#eef5fb" opacity=".72"/>
        <g class="w-lock" data-action="w-unlock" data-r="${reg.i}">
          <rect x="${X + 70}" y="96" width="220" height="70" rx="16" fill="#fff" stroke="#1e88e5" stroke-width="2"/>
          <text x="${X + 180}" y="124" font-size="15" font-family="sans-serif" font-weight="800" text-anchor="middle" fill="#14233a">🔒 ${reg.name}</text>
          <text x="${X + 180}" y="148" font-size="12" font-family="sans-serif" font-weight="700" text-anchor="middle" fill="#0b6fb8">Für ${locked} 🪨 freischalten</text>
        </g>`;
    }
    return s;
  }

  function gadgetAt(slot, gid, c) {
    const g = byId[gid];
    if (!g || !g.d) return '';
    return `<g class="w-gadget ${g.sky ? 'w-sky' : ''}" data-action="w-gadget" data-slot="${slot.id}" transform="translate(${slot.x} ${slot.y}) scale(${slot.s})">${g.d(c)}</g>`;
  }

  /* o: { map:{unlocked:[regionIds], slots:{slotId:gadgetId}, finds:[{region,x,y,type,id}]},
          animals:[{id,svg}], owned:[landIds], edit, placing, now }
     Gibt HTML zurück: eine Kachel (eigenes SVG) pro Gebiet – so bleibt auch eine riesige Karte flüssig.
     Unbekannte IDs (z. B. aus neueren Backups) werden einfach übersprungen, nie gelöscht. */
  function world(o) {
    const now = o.now || new Date();
    const c = { tod: timeOfDay(now.getHours()), sea: season(now.getMonth()) };
    const owned = new Set(o.owned || []);
    const map = o.map || {};
    const placed = map.slots || {};
    const known = (map.unlocked || []).filter(id => regionById[id]);
    const unlocked = known.length ? known : START_REGIONS;
    const openRegs = REGIONS.filter(r => unlocked.includes(r.id));
    const next = nextRegion(unlocked);
    const shown = next ? [...openRegs, next] : openRegs;   // + 1 Vorschau-Gebiet im Nebel
    const placingSky = o.placing ? !!(byId[o.placing] || {}).sky : null;

    // Tiere gleichmäßig auf die offenen Gebiete verteilen
    const animalsIn = {};
    const wOpen = openRegs.length * RW;
    (o.animals || []).forEach((a, i) => {
      const gx = 30 + ((i * 263 + 40) % (wOpen - 60)), reg = openRegs[Math.floor(gx / RW)];
      const x = reg.i * RW + (gx % RW), y = 226 + ((i * 17) % 12);
      (animalsIn[reg.id] ||= []).push(`<g class="w-anim" data-action="w-animal" data-id="${a.id}" style="animation-delay:${((i * 1.7) % 9).toFixed(1)}s">${a.svg.replace('<svg', `<svg x="${x - 17}" y="${y - 32}" width="34" height="34"`)}</g>`);
    });

    const defs = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      ${Object.entries(SKY).map(([k, v]) => `<linearGradient id="wsky-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${v[0]}"/><stop offset=".55" stop-color="${v[1]}"/><stop offset="1" stop-color="${v[2]}"/></linearGradient>`).join('')}
      <linearGradient id="aurora" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3cf0c8" stop-opacity="0"/><stop offset=".5" stop-color="#3cf0c8" stop-opacity=".55"/><stop offset="1" stop-color="#1e88e5" stop-opacity="0"/></linearGradient>
    </defs></svg>`;

    const dispH = 300, dispW = Math.round(RW * dispH / H);
    let html = '';
    for (const reg of shown) {
      const locked = !unlocked.includes(reg.id);
      const sl = SLOTS.filter(x => x.region === reg.id);
      let s = region(reg, c, owned, false);
      if (!locked) {
        sl.filter(x => x.sky).forEach(x => { if (placed[x.id]) s += gadgetAt(x, placed[x.id], c); });
        sl.filter(x => !x.sky && x.s < 1).forEach(x => { if (placed[x.id]) s += gadgetAt(x, placed[x.id], c); });
        s += (animalsIn[reg.id] || []).join('');
        sl.filter(x => !x.sky && x.s === 1).forEach(x => { if (placed[x.id]) s += gadgetAt(x, placed[x.id], c); });
        (map.finds || []).filter(f => f.region === reg.id).forEach(f => {
          const d = findById[f.type];
          if (d) s += `<g class="w-find" data-action="w-find" data-id="${f.id}" transform="translate(${reg.i * RW + f.x} ${f.y})">${d.d}</g>`;
        });
        if (o.edit) sl.forEach(x => {
          if (placingSky !== null && placingSky !== x.sky) return;
          const full = !!placed[x.id];
          const cy = x.sky ? x.y : x.y - 16 * x.s;
          s += `<g class="w-slot ${full ? 'full' : 'empty'} ${o.placing && !full ? 'pulse' : ''}" data-action="w-slot" data-slot="${x.id}">
            <circle cx="${x.x}" cy="${cy}" r="${15 * x.s}" fill="rgba(255,255,255,${full ? .2 : .55})" stroke="#fff" stroke-width="2" stroke-dasharray="4 3"/>
            ${full ? '' : x.sky ? `<text x="${x.x}" y="${cy + 5}" font-size="14" text-anchor="middle">✨</text>`
              : `<path d="M${x.x - 6 * x.s} ${cy} h${12 * x.s} M${x.x} ${cy - 6 * x.s} v${12 * x.s}" stroke="#14233a" stroke-width="2.4" stroke-linecap="round"/>`}</g>`;
        });
      } else {
        s = region(reg, c, owned, regionPrice(unlocked.length));
      }
      html += `<svg class="w-region" data-r="${reg.id}" viewBox="${reg.i * RW} 0 ${RW} ${H}" width="${dispW}" height="${dispH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${reg.name}">${s}</svg>`;
    }
    return defs + `<div class="world-row">${html}</div>`;
  }

  function preview(gid) {
    const g = byId[gid];
    if (!g) return '';
    const c = { tod: 'nacht', sea: season(new Date().getMonth()) };
    if (g.group === 'land') {
      const ic = { waldbach: '🏞️', bergbach: '🏔️', gletschersee: '🧊', fluss: '🌊', blumenmeer: '🌼', nordlicht: '🌌', milchstrasse: '🌠' }[g.id] || '🏞️';
      return `<svg viewBox="0 0 40 40" aria-hidden="true"><text x="20" y="28" font-size="22" text-anchor="middle">${ic}</text></svg>`;
    }
    if (g.sky) return `<svg viewBox="-40 -38 80 80" aria-hidden="true"><rect x="-40" y="-38" width="80" height="80" rx="10" fill="#0f2350"/>${g.d(c)}</svg>`;
    return `<svg viewBox="-45 -90 90 95" aria-hidden="true">${g.d({ tod: 'tag', sea: c.sea })}</svg>`;
  }
  const previewFind = type => findById[type] ? `<svg viewBox="-8 -12 16 16" aria-hidden="true">${findById[type].d}</svg>` : '';

  window.World = {
    RW, H, GADGETS: G, GROUPS, SLOTS, slotById, REGIONS, regionById, START_REGIONS, regionPrice, nextRegion, FINDS, byId, findById,
    world, preview, previewFind, randomFind, timeOfDay, season,
  };
})();
