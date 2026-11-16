/* Feen-Edition „Feenwald ToDoList“
   Wird VOR animals.js, world.js und app.js geladen (siehe feen/index.html) und ersetzt dort Inhalte:
   Wesen, Zubehör, Namen, Gebiete, Landschaft, Laden, Fundstücke, Farben, Texte und Einführung.
   Regeln wie überall: IDs nie ändern, Neues hinten anhängen. Die Feen-Edition hat eigene Daten (storageKey). */
window.EDITION = (function () {
  'use strict';
  const ROSA = '#f4a7c0', ROSE = '#e88aa8', FLIEDER = '#c9a7e8', LILA = '#b48ad8', HIMMEL = '#a8d8f0', MINZE = '#a8e0c8',
    PFIRSICH = '#ffd6a8', GOLD = '#f2d38a', PERLE = '#fff6fb', BLATT = '#7cc8a0', DBLATT = '#5aa888';

  // ======================= Wesen, Zubehör, Namen =======================
  function animals(H) {
    const { OL, INK, eyes, mouth, body, head, STD } = H;
    const blush = (y = 57, dx = 17) => `<ellipse cx="${50 - dx}" cy="${y}" rx="4.4" ry="2.6" fill="#ff8fb0" opacity=".5"/><ellipse cx="${50 + dx}" cy="${y}" rx="4.4" ry="2.6" fill="#ff8fb0" opacity=".5"/>`;
    const lashes = (y, dx) => `<path d="M${50 - dx - 3.6} ${y - 2.6} l-2 -2 M${50 + dx + 3.6} ${y - 2.6} l2 -2" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`;
    const sparkle = (x, y, s = 1, c = '#fff') => `<path d="M${x} ${y - 4 * s} L${x + 1.2 * s} ${y - 1.2 * s} L${x + 4 * s} ${y} L${x + 1.2 * s} ${y + 1.2 * s} L${x} ${y + 4 * s} L${x - 1.2 * s} ${y + 1.2 * s} L${x - 4 * s} ${y} L${x - 1.2 * s} ${y - 1.2 * s} Z" fill="${c}"/>`;
    const horseEars = (main) => `<path d="M33 30 L31 12 L44 23 Z" fill="${main}" ${OL} stroke-linejoin="round"/><path d="M34.5 26 L33.5 17 L40 23 Z" fill="#f8c8d8"/>
      <path d="M67 30 L69 12 L56 23 Z" fill="${main}" ${OL} stroke-linejoin="round"/><path d="M65.5 26 L66.5 17 L60 23 Z" fill="#f8c8d8"/>`;
    const horseFace = (f) => `<ellipse cx="50" cy="62" rx="15" ry="10.5" fill="${f.muzzle}"/>
      <ellipse cx="44.5" cy="63" rx="1.7" ry="2.3" fill="${INK}" opacity=".4"/><ellipse cx="55.5" cy="63" rx="1.7" ry="2.3" fill="${INK}" opacity=".4"/>
      <path d="M46 68 q4 2.5 8 0" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".7"/>
      ${eyes(46, 10.5)}${lashes(46, 10.5)}${blush(53, 20)}`;
    const featherWing = (side, col) => {
      const k = side < 0 ? 1 : -1, x0 = side < 0 ? 28 : 72;
      return `<path d="M${x0} 70 Q${x0 - 22 * k} 60 ${x0 - 20 * k} 40 Q${x0 - 12 * k} 50 ${x0 - 8 * k} 48 Q${x0 - 14 * k} 56 ${x0 - 4 * k} 58 Z" fill="${col}" ${OL}/>
        <path d="M${x0 - 16 * k} 46 q${4 * k} 6 ${10 * k} 8 M${x0 - 18 * k} 54 q${5 * k} 5 ${12 * k} 6" stroke="#fff" stroke-width="1" fill="none" opacity=".8"/>`;
    };

    const kinds = {
      einhorn: {
        label: 'Einhorn', baby: 'Einhornfohlen',
        furs: [
          { name: 'perlweiß', main: '#fdf8fb', mane: [ROSA, FLIEDER, HIMMEL], muzzle: '#fbe1ea', horn: GOLD },
          { name: 'rosé', main: '#fbe3ec', mane: [ROSE, '#f6c6d8', '#ffffff'], muzzle: '#f8d0dc', horn: GOLD },
          { name: 'lavendel', main: '#ece4f8', mane: [LILA, ROSA, '#ffe6f2'], muzzle: '#f4e4f0', horn: '#f6e3a8' },
          { name: 'mondsilber', main: '#e8edf4', mane: ['#9ab0d8', '#d8c8f0', '#ffffff'], muzzle: '#f0e4ee', horn: '#e6ecf6' },
        ],
        anchors: STD,
        draw: f => `
          <path d="M72 84 q14 0 14 14 M74 86 q10 4 8 14 M73 82 q16 -4 18 6" stroke="${f.mane[0]}" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M74 86 q10 4 8 14" stroke="${f.mane[1]}" stroke-width="3.4" fill="none" stroke-linecap="round"/>
          <circle cx="71" cy="38" r="6" fill="${f.mane[1]}"/><circle cx="74" cy="48" r="5.5" fill="${f.mane[0]}"/><circle cx="72" cy="58" r="5" fill="${f.mane[2]}"/>
          ${horseEars(f.main)}
          ${body(f.main, f.muzzle, '#d8c4d4')}
          ${head(f.main, 47, 26)}
          ${horseFace(f)}
          <path d="M46 25 L50 3 L54 25 Z" fill="${f.horn}" ${OL} stroke-linejoin="round"/>
          <path d="M47 20 l6 -2 M48 14 l4 -1.4 M49 8 l2.4 -0.8" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>
          <circle cx="40" cy="27" r="6" fill="${f.mane[0]}"/><circle cx="35" cy="33" r="4.6" fill="${f.mane[1]}"/><circle cx="59" cy="26" r="4.6" fill="${f.mane[2]}"/>
          ${sparkle(82, 20, .8, GOLD)}`,
      },
      drache: {
        label: 'Drache', baby: 'Drachenbaby',
        furs: [
          { name: 'minze', main: MINZE, belly: '#f8f2d8', wing: '#8fcfb4', spike: ROSA },
          { name: 'rosa', main: '#f6b8cc', belly: '#fff0e4', wing: '#ee9ab4', spike: FLIEDER },
          { name: 'flieder', main: '#cdb4ec', belly: '#f8eefc', wing: '#b89ae0', spike: GOLD },
          { name: 'himmelblau', main: '#a8cff0', belly: '#f0f6fc', wing: '#8fbbe4', spike: ROSA },
        ],
        anchors: STD,
        draw: f => `
          <path d="M28 68 Q8 52 12 34 Q20 46 25 44 Q22 54 31 57 Z" fill="${f.wing}" ${OL}/>
          <path d="M72 68 Q92 52 88 34 Q80 46 75 44 Q78 54 69 57 Z" fill="${f.wing}" ${OL}/>
          <path d="M72 86 q16 4 18 -10" stroke="${f.main}" stroke-width="6" fill="none" stroke-linecap="round"/>
          <path d="M87 77 l7 -7 l1 10 z" fill="${f.spike}"/>
          ${body(f.main, f.belly, f.main)}
          <path d="M42 78 h16 M43 84 h14 M45 90 h10" stroke="${f.main}" stroke-width="1.4" opacity=".7"/>
          <path d="M36 27 l-4 -11 l8 6 z M64 27 l4 -11 l-8 6 z" fill="#fff6dc" ${OL}/>
          ${head(f.main)}
          <path d="M45 22 l3 -6 l3 6 z M51 21 l3 -7 l3 7 z" fill="${f.spike}"/>
          <ellipse cx="50" cy="60" rx="13" ry="9" fill="${f.belly}"/>
          <circle cx="46" cy="58" r="1.3" fill="${INK}" opacity=".5"/><circle cx="54" cy="58" r="1.3" fill="${INK}" opacity=".5"/>
          ${mouth(62)}${eyes(47, 11)}${blush(55, 19)}`,
      },
      fee: {
        label: 'Fee', baby: 'Feenkind',
        furs: [
          { name: 'Rosenfee', hair: ROSE, dress: '#f6c6d8', wing: '#d8f0ff' },
          { name: 'Fliederfee', hair: '#9a7ac8', dress: '#e0d0f6', wing: '#fde6f2' },
          { name: 'Sonnenfee', hair: '#f2c35e', dress: '#fff0b8', wing: '#e8f6ff' },
          { name: 'Waldfee', hair: '#8a5a3c', dress: '#c8ecd4', wing: '#fff0f6' },
        ],
        anchors: { hat: [22, .9], neck: [66, 40, 60], bow: [66, 26], flower: [32, 30], hold: [36, 82] },
        draw: f => `
          <ellipse cx="27" cy="56" rx="14" ry="20" transform="rotate(-28 27 56)" fill="${f.wing}" stroke="#fff" stroke-width="1.6" opacity=".9"/>
          <ellipse cx="73" cy="56" rx="14" ry="20" transform="rotate(28 73 56)" fill="${f.wing}" stroke="#fff" stroke-width="1.6" opacity=".9"/>
          <ellipse cx="31" cy="77" rx="9" ry="12" transform="rotate(22 31 77)" fill="${f.wing}" stroke="#fff" stroke-width="1.4" opacity=".9"/>
          <ellipse cx="69" cy="77" rx="9" ry="12" transform="rotate(-22 69 77)" fill="${f.wing}" stroke="#fff" stroke-width="1.4" opacity=".9"/>
          <circle cx="50" cy="44" r="25" fill="${f.hair}"/>
          <path d="M34 98 L40 70 Q50 64 60 70 L66 98 Z" fill="${f.dress}" ${OL}/>
          <path d="M37 90 q13 5 26 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8"/>
          <ellipse cx="36" cy="80" rx="3.6" ry="6" fill="#ffe2d4" ${OL}/><ellipse cx="64" cy="80" rx="3.6" ry="6" fill="#ffe2d4" ${OL}/>
          <ellipse cx="44" cy="98" rx="4" ry="2.4" fill="${ROSE}"/><ellipse cx="56" cy="98" rx="4" ry="2.4" fill="${ROSE}"/>
          <circle cx="50" cy="46" r="21" fill="#ffe2d4" ${OL}/>
          <path d="M29 46 Q30 23 50 23 Q70 23 71 46 Q63 35 50 37 Q37 35 29 46 Z" fill="${f.hair}"/>
          <circle cx="50" cy="20" r="8" fill="${f.hair}"/>
          ${eyes(49, 8.5)}${lashes(49, 8.5)}${blush(55, 13)}${mouth(55)}
          ${sparkle(68, 86, .9, GOLD)}`,
      },
      greif: {
        label: 'Greif', baby: 'Greifenküken',
        furs: [
          { name: 'gold', head: '#fff6e8', body: '#f2c890', wing: '#e8b070', beak: '#f2b01e' },
          { name: 'schneeweiß', head: '#ffffff', body: '#e8e0f0', wing: '#d0c4e4', beak: GOLD },
          { name: 'rosé', head: '#fff4f6', body: '#f6c6d0', wing: '#e8a8b8', beak: GOLD },
        ],
        anchors: STD,
        draw: f => `
          <path d="M72 86 q14 -2 12 -16" stroke="${f.body}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="84" cy="69" r="4.4" fill="${f.wing}"/>
          ${featherWing(-1, f.wing)}${featherWing(1, f.wing)}
          ${body(f.body, f.head, '#e8c8a0')}
          ${head(f.head)}
          <path d="M45 23 q1 -11 6 -3 q3 -10 7 0" stroke="${f.wing}" stroke-width="3" fill="none" stroke-linecap="round"/>
          ${eyes(46, 10)}${lashes(46, 10)}
          <path d="M43 54 Q50 49 57 54 Q55 62 50 65 Q45 62 43 54 Z" fill="${f.beak}" ${OL}/>
          <path d="M47 61 q3 3 6 0" stroke="#c8902a" stroke-width="1.2" fill="none"/>
          ${blush(55, 19)}`,
      },
      phoenix: {
        label: 'Phönix', baby: 'Phönixküken',
        furs: [
          { name: 'Morgenrot', main: '#ffc0a8', flame: ['#ff8a7a', '#ffd27a'], wing: '#ffa894' },
          { name: 'Rosengold', main: '#f8cac4', flame: [ROSE, GOLD], wing: '#f0a8b0' },
          { name: 'Fliederglut', main: '#e2cbf2', flame: [LILA, ROSA], wing: '#cfb0e8' },
        ],
        anchors: { hat: [23, .85], neck: [63, 31, 69], bow: [62, 28], flower: [37, 29], hold: [50, 76] },
        draw: f => `
          <path d="M70 80 Q92 74 94 58 Q86 66 80 64 Q90 72 72 76 Z" fill="${f.flame[0]}"/>
          <path d="M70 84 Q90 86 96 74 Q86 80 78 78 Z" fill="${f.flame[1]}"/>
          <ellipse cx="40" cy="94" rx="6" ry="3" fill="${GOLD}"/><ellipse cx="60" cy="94" rx="6" ry="3" fill="${GOLD}"/>
          <ellipse cx="50" cy="74" rx="26" ry="20" fill="${f.main}" ${OL}/>
          <path d="M26 66 Q14 74 22 88 Q26 80 32 80 Q28 74 34 70 Z" fill="${f.wing}" ${OL}/>
          <path d="M74 66 Q86 74 78 88 Q74 80 68 80 Q72 74 66 70 Z" fill="${f.wing}" ${OL}/>
          <path d="M44 26 Q40 12 48 6 Q46 16 52 22 Q54 10 60 6 Q58 18 56 26 Z" fill="${f.flame[0]}"/>
          <path d="M47 26 Q46 18 50 14 Q50 20 53 24 Z" fill="${f.flame[1]}"/>
          <circle cx="50" cy="45" r="22" fill="${f.main}" ${OL}/>
          ${eyes(44, 9)}${lashes(44, 9)}
          <path d="M46 51 L54 51 L50 57 Z" fill="${GOLD}" ${OL} stroke-linejoin="round"/>
          ${blush(51, 15)}`,
      },
      pegasus: {
        label: 'Pegasus', baby: 'Pegasusfohlen',
        furs: [
          { name: 'Wolkenweiß', main: '#fbfbff', mane: '#cfe0f6', muzzle: '#f2e6f0', wing: '#ffffff' },
          { name: 'Himmelblau', main: '#dcecfb', mane: '#a8c8f0', muzzle: '#f0e8f4', wing: '#f4f9ff' },
          { name: 'Rosenwolke', main: '#fbe0e8', mane: ROSE, muzzle: '#f8d4de', wing: '#fff4f8' },
        ],
        anchors: STD,
        draw: f => `
          ${featherWing(-1, f.wing)}${featherWing(1, f.wing)}
          <path d="M72 84 q15 2 12 14" stroke="${f.mane}" stroke-width="6" fill="none" stroke-linecap="round"/>
          ${horseEars(f.main)}
          ${body(f.main, f.muzzle, '#c8c4dc')}
          ${head(f.main, 47, 26)}
          ${horseFace(f)}
          <path d="M41 22 q1 10 8 13 q0 -7 4 -9 q2 6 7 7 q-2 -11 -10 -13 q-5 -1 -9 2 z" fill="${f.mane}" ${OL}/>`,
      },
      kitsune: {
        label: 'Fuchsgeist', baby: 'Fuchsgeistchen',
        furs: [
          { name: 'Kirschblüte', main: '#f8c8d4', light: '#fff6f8', mark: '#e07a9a' },
          { name: 'Mondweiß', main: '#f4f2fa', light: '#ffffff', mark: LILA },
          { name: 'Lavendel', main: '#d8c4f0', light: '#f8f2fe', mark: ROSE },
        ],
        anchors: STD,
        draw: f => [-30, 10, 50].map(rot => `<ellipse cx="80" cy="76" rx="8" ry="17" transform="rotate(${rot} 72 88)" fill="${f.main}" ${OL}/>
            <ellipse cx="80" cy="62" rx="5" ry="5.5" transform="rotate(${rot} 72 88)" fill="${f.light}"/>`).join('') + `
          <path d="M26 36 L27 12 L46 25 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/><path d="M30 31 L31 19 L40 26 Z" fill="${f.light}"/>
          <path d="M74 36 L73 12 L54 25 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/><path d="M70 31 L69 19 L60 26 Z" fill="${f.light}"/>
          ${body(f.main, f.light, f.main)}
          ${head(f.main)}
          <path d="M23.4 52 Q36 46 50 56 Q64 46 76.6 52 Q74 74 50 75 Q26 74 23.4 52 Z" fill="${f.light}"/>
          <path d="M50 26 q-4 6 0 10 q4 -4 0 -10 z" fill="${f.mark}"/>
          ${eyes(48, 10)}${lashes(48, 10)}
          <ellipse cx="50" cy="57" rx="3" ry="2.2" fill="${INK}"/>
          ${mouth(59)}${blush(58, 18)}`,
      },
      mondhase: {
        label: 'Mondhase', baby: 'Mondhäschen',
        furs: [
          { name: 'Silber', main: '#eef0f8', inner: '#f6c6d8', belly: '#ffffff' },
          { name: 'Flieder', main: '#e2d4f4', inner: '#f8d0e0', belly: '#faf4fe' },
          { name: 'Nachtblau', main: '#b8c4e8', inner: '#f0c8e0', belly: '#eef0fa' },
        ],
        anchors: STD,
        draw: f => `
          <circle cx="74" cy="88" r="6" fill="#fff" ${OL}/>
          <ellipse cx="39" cy="20" rx="7.5" ry="17" transform="rotate(-10 39 20)" fill="${f.main}" ${OL}/>
          <ellipse cx="39" cy="21" rx="3.6" ry="12" transform="rotate(-10 39 21)" fill="${f.inner}"/>
          <ellipse cx="61" cy="20" rx="7.5" ry="17" transform="rotate(10 61 20)" fill="${f.main}" ${OL}/>
          <ellipse cx="61" cy="21" rx="3.6" ry="12" transform="rotate(10 61 21)" fill="${f.inner}"/>
          ${body(f.main, f.belly, f.main)}
          ${head(f.main)}
          <path d="M53 28 a6 6 0 1 0 0 10 a4.5 4.5 0 1 1 0 -10 z" fill="${GOLD}"/>
          ${eyes(49, 10)}${lashes(49, 10)}
          <ellipse cx="50" cy="55.5" rx="2.8" ry="2" fill="#f49ab4"/>
          ${mouth(57.3)}${blush(56, 17)}
          ${sparkle(24, 14, .8, GOLD)}${sparkle(80, 22, .6, GOLD)}`,
      },
      feenkatze: {
        label: 'Flügelkatze', baby: 'Flügelkätzchen',
        furs: [
          { name: 'Zuckerwatte', main: '#fbe0ea', belly: '#fff6f8', wing: [FLIEDER, HIMMEL] },
          { name: 'Cremeweiß', main: '#fdf6ec', belly: '#ffffff', wing: [ROSA, '#ffe08a'] },
          { name: 'Wolkengrau', main: '#d8d8e4', belly: '#f4f4f8', wing: [MINZE, ROSA] },
        ],
        anchors: STD,
        draw: f => `
          <path d="M50 66 Q22 40 16 58 Q14 72 50 70 Z" fill="${f.wing[0]}" stroke="#fff" stroke-width="1.6" opacity=".95"/>
          <path d="M50 66 Q78 40 84 58 Q86 72 50 70 Z" fill="${f.wing[0]}" stroke="#fff" stroke-width="1.6" opacity=".95"/>
          <path d="M50 70 Q26 74 26 86 Q36 92 50 74 Z" fill="${f.wing[1]}" stroke="#fff" stroke-width="1.4" opacity=".95"/>
          <path d="M50 70 Q74 74 74 86 Q64 92 50 74 Z" fill="${f.wing[1]}" stroke="#fff" stroke-width="1.4" opacity=".95"/>
          <circle cx="24" cy="56" r="2.6" fill="#fff"/><circle cx="76" cy="56" r="2.6" fill="#fff"/>
          <path d="M72 88 q16 -2 12 -18" stroke="${f.main}" stroke-width="6" fill="none" stroke-linecap="round"/>
          <path d="M27 38 L29 13 L47 25 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/><path d="M31 32 L32 19 L42 26 Z" fill="#f8c0d0"/>
          <path d="M73 38 L71 13 L53 25 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/><path d="M69 32 L68 19 L58 26 Z" fill="#f8c0d0"/>
          ${body(f.main, f.belly, f.main)}
          ${head(f.main)}
          ${eyes(49, 10)}${lashes(49, 10)}
          <path d="M47.6 55 h4.8 l-2.4 2.6 z" fill="#f49ab4" stroke="#f49ab4" stroke-linejoin="round"/>
          ${mouth(57.6)}
          <path d="M31 55 l-10 -2 M31 59 l-10 2 M69 55 l10 -2 M69 59 l10 2" stroke="${INK}" stroke-opacity=".3" stroke-width="1.2" stroke-linecap="round"/>
          ${blush(56, 17)}`,
      },
      pilzwichtel: {
        label: 'Pilzwichtel', baby: 'Pilzwichtelchen',
        furs: [
          { name: 'Rosenkappe', cap: ROSE, body: '#fff4ea' },
          { name: 'Fliederkappe', cap: LILA, body: '#fff6f0' },
          { name: 'Himmelskappe', cap: '#7fb8e0', body: '#fff8f2' },
        ],
        anchors: { hat: [8, .8], neck: [74, 32, 68], bow: [70, 22], flower: [30, 22], hold: [50, 84] },
        draw: f => `
          <ellipse cx="40" cy="95" rx="6" ry="3.2" fill="#c8a898"/><ellipse cx="60" cy="95" rx="6" ry="3.2" fill="#c8a898"/>
          <ellipse cx="50" cy="76" rx="22" ry="20" fill="${f.body}" ${OL}/>
          <ellipse cx="29" cy="76" rx="4" ry="7" fill="${f.body}" ${OL}/><ellipse cx="71" cy="76" rx="4" ry="7" fill="${f.body}" ${OL}/>
          <circle cx="50" cy="52" r="20" fill="${f.body}" ${OL}/>
          <path d="M14 44 Q16 10 50 8 Q84 10 86 44 Q70 38 50 39 Q30 38 14 44 Z" fill="${f.cap}" ${OL}/>
          <circle cx="32" cy="26" r="4.4" fill="#fff"/><circle cx="52" cy="18" r="5" fill="#fff"/><circle cx="70" cy="28" r="3.8" fill="#fff"/><circle cx="44" cy="33" r="2.6" fill="#fff"/>
          ${eyes(53, 8)}${lashes(53, 8)}${mouth(59.5)}${blush(59, 13)}`,
      },
      eule: {
        label: 'Eule', baby: 'Büchereulchen',
        furs: [
          { name: 'Haselnuss', main: '#d8b89c', face: '#fff3e8', wing: '#c49a7c', glasses: false },
          { name: 'Schneeeule', main: '#f6f4f8', face: '#ffffff', wing: '#e0dce8', glasses: false },
          { name: 'Professorin', main: '#c8b0e0', face: '#f8f0fe', wing: '#b098d0', glasses: true },
        ],
        anchors: { hat: [20, 1], neck: [70, 28, 72], bow: [68, 26], flower: [32, 26], hold: [50, 84] },
        draw: f => `
          <ellipse cx="40" cy="95" rx="5" ry="3" fill="${GOLD}"/><ellipse cx="60" cy="95" rx="5" ry="3" fill="${GOLD}"/>
          <ellipse cx="50" cy="66" rx="30" ry="31" fill="${f.main}" ${OL}/>
          <path d="M28 22 L36 36 L42 30 Z M72 22 L64 36 L58 30 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/>
          <ellipse cx="22" cy="72" rx="7" ry="16" transform="rotate(12 22 72)" fill="${f.wing}" ${OL}/>
          <ellipse cx="78" cy="72" rx="7" ry="16" transform="rotate(-12 78 72)" fill="${f.wing}" ${OL}/>
          <ellipse cx="50" cy="80" rx="15" ry="13" fill="${f.face}"/>
          <path d="M44 76 l3 3 l3 -3 M50 82 l3 3 l3 -3 M44 86 l3 3 l3 -3" stroke="${f.wing}" stroke-width="1.2" fill="none"/>
          <circle cx="39" cy="48" r="11" fill="${f.face}"/><circle cx="61" cy="48" r="11" fill="${f.face}"/>
          ${eyes(48, 11)}${lashes(48, 11)}
          ${f.glasses ? `<circle cx="39" cy="48" r="8" fill="none" stroke="${INK}" stroke-width="1.6"/><circle cx="61" cy="48" r="8" fill="none" stroke="${INK}" stroke-width="1.6"/><path d="M47 48 h6" stroke="${INK}" stroke-width="1.6"/>` : ''}
          <path d="M46 56 L54 56 L50 62 Z" fill="${GOLD}" ${OL} stroke-linejoin="round"/>
          ${blush(58, 18)}`,
      },
    };

    // ---- Zubehör (Anker wie in animals.js: hat, neck, bow, flower, hold) ----
    const hat = (a, inner) => { const [top, s] = a.hat; return `<g transform="translate(50 ${top}) scale(${s}) translate(-50 -21)">${inner}</g>`; };
    const holdAt = a => a.hold || [50, 82];
    const blossom = (x, y, c, r = 2.6) => [0, 72, 144, 216, 288].map(d => `<circle cx="${(x + Math.cos((d - 90) * Math.PI / 180) * r).toFixed(1)}" cy="${(y + Math.sin((d - 90) * Math.PI / 180) * r).toFixed(1)}" r="${r * .9}" fill="${c}"/>`).join('') + `<circle cx="${x}" cy="${y}" r="${r * .6}" fill="${GOLD}"/>`;
    const accs = {
      blumenkranz: { label: 'Blumenkranz', draw: (c, a) => hat(a, `<path d="M27 34 Q50 20 73 34" stroke="${BLATT}" stroke-width="2.4" fill="none"/>
          ${[[29, 32], [39, 26], [50, 24], [61, 26], [71, 32]].map(([x, y], i) => blossom(x, y, i % 2 ? '#fff' : c)).join('')}
          <path d="M33 29 l-3 -3 M45 24 l-1 -4 M66 28 l3 -3" stroke="${BLATT}" stroke-width="2" stroke-linecap="round"/>`) },
      krone: { label: 'Krönchen', draw: (c, a) => hat(a, `<path d="M38 31 L41 20 L46 27 L50 15 L54 27 L59 20 L62 31 Z" fill="${GOLD}" ${OL} stroke-linejoin="round"/>
          <rect x="37.5" y="29.5" width="25" height="4" rx="1.6" fill="${GOLD}" ${OL}/><circle cx="50" cy="23" r="2.6" fill="${c}"/>
          <circle cx="42" cy="31.5" r="1.2" fill="${c}"/><circle cx="58" cy="31.5" r="1.2" fill="${c}"/>`) },
      schleife: { label: 'Schleife', draw: (c, a) => { const [x, y] = a.bow; return `<path d="M${x} ${y} l-9 -5.5 q-2 5.5 0 11 Z M${x} ${y} l9 -5.5 q2 5.5 0 11 Z" fill="${c}" ${OL} stroke-linejoin="round"/><circle cx="${x}" cy="${y}" r="2.6" fill="${c}" ${OL}/>`; } },
      rose: { label: 'Rose', draw: (c, a) => { const [x, y] = holdAt(a); return `<path d="M${x} ${y + 8} v-12" stroke="${DBLATT}" stroke-width="1.8"/><path d="M${x} ${y + 2} q-6 -2 -7 2 q5 2 7 -2 Z" fill="${BLATT}"/>
          <circle cx="${x}" cy="${y - 6}" r="5.6" fill="${c}" ${OL}/><path d="M${x - 2.6} ${y - 6} a2.6 2.6 0 1 1 2.6 2.6 a1.4 1.4 0 1 1 -1 -1.8" stroke="#fff" stroke-width=".9" fill="none" opacity=".8"/>`; } },
      buch: { label: 'Märchenbuch', draw: (c, a) => { const [x, y] = holdAt(a); return `<g transform="translate(${x} ${y})"><path d="M-13 -6 L0 -3 L13 -6 L13 7 L0 10 L-13 7 Z" fill="${c}" ${OL}/>
          <path d="M-11 -4.5 L0 -1.8 V8 L-11 5.3 Z M11 -4.5 L0 -1.8 V8 L11 5.3 Z" fill="#fffaf0"/>${sparkle(7, 1, .5, GOLD)}</g>`; } },
      kristall: { label: 'Kristallanhänger', draw: (c, a) => { const [y, x1, x2] = a.neck; return `<path d="M${x1 + 8} ${y} Q50 ${y + 8} ${x2 - 8} ${y}" stroke="${GOLD}" stroke-width="1.2" fill="none"/>
          <path d="M50 ${y + 4} l4 4 l-4 8 l-4 -8 Z" fill="${c}" ${OL}/><path d="M50 ${y + 4} l-1.6 4 l1.6 8 Z" fill="#fff" opacity=".6"/>`; } },
      sternenstab: { label: 'Sternenstab', draw: (c, a) => { const [x, y] = holdAt(a); return `<path d="M${x - 8} ${y + 8} L${x + 6} ${y - 8}" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round"/>
          ${sparkle(x + 7, y - 10, 1.5, c)}${sparkle(x + 13, y - 16, .5, GOLD)}${sparkle(x + 1, y - 17, .4, '#fff')}`; } },
      umhang: { label: 'Umhang', draw: (c, a) => { const [y, x1, x2] = a.neck; return `<path d="M${x1 + 2} ${y} Q50 ${y + 6} ${x2 - 2} ${y} L${x2 + 2} ${y + 9} Q50 ${y + 16} ${x1 - 2} ${y + 9} Z" fill="${c}" ${OL}/>
          <circle cx="50" cy="${y + 4}" r="2.4" fill="${GOLD}" ${OL}/>`; } },
      perlenkette: { label: 'Perlenkette', draw: (c, a) => { const [y, x1, x2] = a.neck; let p = ''; for (let i = 0; i <= 8; i++) { const t = i / 8; p += `<circle cx="${(x1 + 6 + (x2 - x1 - 12) * t).toFixed(1)}" cy="${(y + 1 + 10 * t * (1 - t) * 2).toFixed(1)}" r="1.8" fill="#fff" stroke="${c}" stroke-width=".8"/>`; } return p; } },
      schmetterling: { label: 'Schmetterling', draw: (c, a) => { const [x, y] = a.bow; return `<path d="M${x} ${y} q-8 -8 -9 0 q1 7 9 0 Z M${x} ${y} q8 -8 9 0 q-1 7 -9 0 Z" fill="${c}" ${OL}/>
          <path d="M${x} ${y} q-5 5 -5 7 q4 0 5 -7 Z M${x} ${y} q5 5 5 7 q-4 0 -5 -7 Z" fill="#fff" ${OL}/><path d="M${x} ${y - 3} v7" stroke="${INK}" stroke-width="1.2"/>`; } },
    };

    const names = [
      'Glitzer', 'Funkel', 'Sternchen', 'Feenstaub', 'Schimmer', 'Flitter', 'Glöckchen', 'Tautropfen', 'Morgentau', 'Mondschein',
      'Silberlicht', 'Mondstein', 'Opal', 'Perle', 'Perlchen', 'Kristall', 'Amethyst', 'Rosenquarz', 'Saphir', 'Funkelstern',
      'Rosenblatt', 'Rosenknospe', 'Knospe', 'Blütenzauber', 'Kirschblüte', 'Pfirsichblüte', 'Lilienduft', 'Fliederchen', 'Lavendel', 'Schneeglöckchen',
      'Pusteblume', 'Gänseblümchen', 'Veilchen', 'Butterblume', 'Mohnblüte', 'Wolkenzucker', 'Zuckerwatte', 'Marzipan', 'Himbeere', 'Brombeerchen',
      'Honigtau', 'Zimtstern', 'Zuckerfee', 'Bonbon', 'Praline', 'Macaron', 'Baiser', 'Sahnehäubchen', 'Kandis', 'Schokokuss',
      'Elfchen', 'Wichtelchen', 'Koboldchen', 'Zauberkeks', 'Zauberfunke', 'Wunderkerze', 'Sternenkind', 'Mondkind', 'Traumfänger', 'Nebelchen',
      'Wölkchen', 'Seidenflügel', 'Libelle', 'Schmetterling', 'Glühwürmchen', 'Hummelchen', 'Marienkäferchen', 'Pünktchen', 'Tüpfelchen', 'Kringel',
      'Flauschi', 'Wuschel', 'Knuddel', 'Schnuffel', 'Purzel', 'Kuschel', 'Fluffi', 'Puschel', 'Löckchen', 'Knöpfchen',
      'Märchen', 'Seifenblase', 'Regenbogen', 'Sternschnuppe', 'Polarlicht', 'Mondsichel', 'Sonnenstrahl', 'Abendrot', 'Morgenröte', 'Frühlingswind',
      'Feder', 'Federchen', 'Silberfeder', 'Goldfunke', 'Zauberschnee', 'Eisblume', 'Schneeflocke', 'Kristallchen', 'Glimmer', 'Diamant',
    ];
    const egg = (color = ROSA) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="50" cy="95" rx="22" ry="3.5" fill="#6a3a5a" opacity=".08"/>
      <path d="M50 8 C28 8 18 44 18 62 C18 82 32 94 50 94 C68 94 82 82 82 62 C82 44 72 8 50 8 Z" fill="${PERLE}" ${OL}/>
      <path d="M22 50 Q50 40 78 50 M20 66 Q50 58 80 66" stroke="${color}" stroke-width="3" fill="none" opacity=".55"/>
      ${sparkle(38, 34, 1.2, color)}${sparkle(64, 76, 1, color)}${sparkle(60, 26, .7, GOLD)}${sparkle(34, 80, .6, GOLD)}
      <path class="crack" d="M22 56 l9 -6 l7 7 l8 -8 l8 8 l8 -7 l8 6 l8 -5" stroke="#6a3a5a" stroke-opacity=".5" stroke-width="1.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M34 20 q6 -6 12 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;

    return {
      kinds, accs, names, egg,
      accColors: [ROSA, FLIEDER, HIMMEL, MINZE, PFIRSICH, ROSE, LILA, GOLD],
      accPool: ['keins', 'blumenkranz', 'blumenkranz', 'krone', 'krone', 'schleife', 'rose', 'rose', 'buch', 'buch', 'kristall', 'sternenstab', 'umhang', 'perlenkette', 'schmetterling'],
    };
  }

  // ======================= Feenwelt: Gebiete, Landschaft, Laden, Fundstücke =======================
  function world(H) {
    const { RW, OL, DWOOD, WATER, flower, canopy, trunk, books, shelfBooks, prng, dots, decid, starfig } = H;
    const sp = (x, y, s = 1, c = '#fff') => `<path d="M${x} ${y - 4 * s} L${x + 1.2 * s} ${y - 1.2 * s} L${x + 4 * s} ${y} L${x + 1.2 * s} ${y + 1.2 * s} L${x} ${y + 4 * s} L${x - 1.2 * s} ${y + 1.2 * s} L${x - 4 * s} ${y} L${x - 1.2 * s} ${y - 1.2 * s} Z" fill="${c}"/>`;
    const PASTELL = [ROSA, FLIEDER, '#f8c8d8', '#d8c4f0', '#ffd6e4'];
    // ---- Bausteine der Landschaft ----
    const tree = (x, y, s, col, seed) => `<g transform="translate(${x} ${y}) scale(${s})">${trunk(22, 6, '#a88a98')}${canopy(0, -34, 16, 14, col, seed, 8)}</g>`;
    const mushroom = (x, y, s, cap) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-10" width="6" height="10" rx="2" fill="#fff4ea"/>
      <path d="M-11 -9 Q0 -24 11 -9 Z" fill="${cap}"/><circle cx="-4" cy="-14" r="1.6" fill="#fff"/><circle cx="4" cy="-12" r="1.3" fill="#fff"/></g>`;
    const crystal = (x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-10 0 L-12 -14 L-7 -22 L-3 -12 L-1 0 Z" fill="${col}" opacity=".9"/><path d="M-4 0 L-3 -26 L3 -36 L8 -26 L6 0 Z" fill="${col}"/>
      <path d="M3 -36 L3 0 L6 0 L8 -26 Z" fill="#fff" opacity=".35"/><path d="M5 0 L9 -16 L14 -12 L12 0 Z" fill="${col}" opacity=".85"/></g>`;
    const roseBush = (x, y, s, seed, n = 5) => `<g transform="translate(${x} ${y}) scale(${s})">${canopy(0, -10, 16, 10, '#5a9a78', seed, 7)}${dots(seed + 1, n, ROSE, 2.6, 0, -12, 13, 7)}${dots(seed + 2, Math.ceil(n / 2), '#fff0f6', 2, 0, -12, 13, 7)}</g>`;
    const cloud = (x, y, s, o = .95) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><ellipse cx="0" cy="4" rx="26" ry="8" fill="#fff"/><circle cx="-10" cy="-1" r="10" fill="#fff"/><circle cx="6" cy="-4" r="12" fill="#fff"/><circle cx="18" cy="2" r="8" fill="#fff"/></g>`;
    const castle = (x, y, s, wall = '#fbeef6', roof = LILA) => `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-26" y="-30" width="52" height="30" fill="${wall}"/><rect x="-34" y="-46" width="14" height="46" fill="${wall}"/><rect x="20" y="-46" width="14" height="46" fill="${wall}"/><rect x="-7" y="-56" width="14" height="30" fill="${wall}"/>
      <path d="M-36 -46 L-27 -64 L-18 -46 Z M18 -46 L27 -64 L36 -46 Z M-9 -56 L0 -74 L9 -56 Z" fill="${roof}"/>
      <path d="M-5 0 v-12 a5 5 0 0 1 10 0 v12 Z" fill="#c8a0c0"/><rect x="-29" y="-38" width="4" height="6" rx="2" fill="#ffe8a8"/><rect x="25" y="-38" width="4" height="6" rx="2" fill="#ffe8a8"/><rect x="-2" y="-48" width="4" height="6" rx="2" fill="#ffe8a8"/></g>`;
    // Pastell-Bach (statt kräftig blau)
    const creekP = (d, w) => `<path d="${d}" stroke="#bfe0f4" stroke-width="${w}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#fff" stroke-width="1.6" fill="none" stroke-dasharray="5 10" opacity=".9"/>`;
    const fireflies = (ctx, n, y0 = 150, y1 = 240) => { let s = ''; for (let i = 0; i < n; i++) { const x = ctx.X + ctx.r() * RW, y = y0 + ctx.r() * (y1 - y0); s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="4" fill="#fff6a8" opacity=".25"/><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="1.4" fill="#fffbd0"/>`; } return s; };
    const pastelTrees = (ctx, y = 184) => { let s = ''; for (let x = ctx.X + 18; x < ctx.X + RW - 10; x += 34 + ctx.r() * 16) s += ctx.winter ? `<g transform="translate(${x.toFixed(0)} ${y})">${trunk(22, 5, '#a88a98')}</g>${sp(x, y - 30, 1.2, '#fff')}` : tree(x.toFixed(0), y + ctx.r() * 4, .6 + ctx.r() * .3, PASTELL[Math.floor(ctx.r() * PASTELL.length)], Math.floor(ctx.r() * 999)); return s; };

    const biomes = {
      maerchenwald: { mid: pastelTrees, front: ctx => [40, 150, 300].map(dx => mushroom(ctx.X + dx, 230 + ctx.r() * 14, .9, [ROSE, LILA, '#7fb8e0'][Math.floor(ctx.r() * 3)])).join('') +
          (ctx.has('funkelbach') ? creekP(`M${ctx.X + 110} 176 Q${ctx.X + 60} 200 ${ctx.X + 140} 222 T${ctx.X + 90} 262`, 9) : ''),
        glow: ctx => ctx.night || ctx.has('gluehwuermchen') ? fireflies(ctx, ctx.night ? 14 : 6) : '' },
      rosengarten: { mid: ctx => { let s = ''; for (let x = ctx.X + 20; x < ctx.X + RW; x += 40) s += roseBush(x, 196, .9, Math.floor(x), ctx.has('rosenmeer') ? 9 : 5); return s + `<path d="M${ctx.X + 150} 214 V180 Q${ctx.X + 180} 150 ${ctx.X + 210} 180 V214" stroke="#fff" stroke-width="5" fill="none"/>` + dots(Math.floor(ctx.X), 10, ROSE, 2.4, ctx.X + 180, 172, 28, 14); },
        front: ctx => roseBush(ctx.X + 60, 246, 1, 7, ctx.has('rosenmeer') ? 10 : 6) + roseBush(ctx.X + 300, 248, 1.1, 9, ctx.has('rosenmeer') ? 10 : 6) },
      kristallhoehle: { back: ctx => `<ellipse cx="${ctx.X + 180}" cy="170" rx="44" ry="34" fill="#5a4a7a"/>` + crystal(ctx.X + 150, 176, 1, '#d8b8f8') + crystal(ctx.X + 210, 178, .8, '#f8c8e0'),
        mid: ctx => [30, 110, 260, 330].map((dx, i) => crystal(ctx.X + dx, 196 + (i % 2) * 6, .7 + (i % 2) * .3, [FLIEDER, ROSA, '#a8d8f0', '#e8d0ff'][i])).join(''),
        glow: ctx => ctx.night ? [30, 110, 150, 210, 260, 330].map(dx => `<circle cx="${ctx.X + dx}" cy="184" r="${ctx.has('kristallglanz') ? 16 : 10}" fill="#f0d8ff" opacity=".14"/>`).join('') : (ctx.has('kristallglanz') ? [110, 150, 210, 260].map(dx => `<path d="M${ctx.X + dx} 166 l1.4 3.6 l3.6 1.4 l-3.6 1.4 l-1.4 3.6 l-1.4 -3.6 l-3.6 -1.4 l3.6 -1.4 Z" fill="#fff"/>`).join('') : '') },
      feenteich: { mid: ctx => `<ellipse cx="${ctx.X + 180}" cy="192" rx="140" ry="15" fill="${ctx.winter ? '#e0ecf8' : '#bfe4f4'}"/>` +
          [100, 170, 240].map((dx, i) => `<ellipse cx="${ctx.X + dx}" cy="${190 + i}" rx="9" ry="3" fill="${BLATT}"/><circle cx="${ctx.X + dx + 3}" cy="${188 + i}" r="2.6" fill="${ROSA}"/>`).join('') +
          `<path d="M${ctx.X + 80} 190 q10 -3 20 0 M${ctx.X + 260} 194 q10 -3 20 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>` +
          (ctx.has('regenbogen') && !ctx.night ? `<path d="M${ctx.X + 40} 190 A140 120 0 0 1 ${ctx.X + 320} 190" fill="none" stroke-width="22" stroke="url(#feen-rainbow)" opacity=".55"/>` : '') + tree(ctx.X + 30, 186, .8, '#c8e8c0', 5),
        front: ctx => `<path d="M${ctx.X + 320} 250 v-22 M${ctx.X + 326} 250 v-28 M${ctx.X + 332} 250 v-18" stroke="${DBLATT}" stroke-width="2"/>`,
        glow: ctx => ctx.night ? fireflies(ctx, 10, 160, 210) : '' },
      bibliothek: { back: ctx => `<g transform="translate(${ctx.X + 230} 182)"><rect x="-18" y="-96" width="36" height="96" fill="#f6e8f2"/><path d="M-22 -96 L0 -124 L22 -96 Z" fill="${LILA}"/>
          ${[-80, -58, -36].map(y => `<rect x="-8" y="${y}" width="16" height="14" rx="7" fill="#ffe8a8"/>`).join('')}<path d="M-5 0 v-14 a5 5 0 0 1 10 0 v14 Z" fill="#c8a0c0"/></g>`,
        mid: ctx => tree(ctx.X + 40, 186, .7, '#f8c8d8', 11) + tree(ctx.X + 110, 188, .6, '#d8c4f0', 12),
        front: ctx => `<g transform="translate(${ctx.X + 80} 246)">${books(0, 0, 5)}</g><g transform="translate(${ctx.X + 290} 250)">${books(0, 0, 3)}</g>` },
      wolkenschloss: { hill: '#e8e4f6', ground: '#f4eef8',
        sky: ctx => cloud(ctx.X + 60, 60, 1) + cloud(ctx.X + 300, 40, .8),
        back: ctx => cloud(ctx.X + 190, 150, 2.4) + castle(ctx.X + 190, 146, 1.1),
        mid: ctx => cloud(ctx.X + 40, 196, 1.4) + cloud(ctx.X + 320, 200, 1.2) + (ctx.has('regenbogen') && !ctx.night ? `<path d="M${ctx.X + 10} 210 A170 140 0 0 1 ${ctx.X + 350} 210" fill="none" stroke-width="20" stroke="url(#feen-rainbow)" opacity=".5"/>` : '') },
      mondlichtung: { sky: ctx => `<circle cx="${ctx.X + 260}" cy="54" r="26" fill="#fff8e8" opacity="${ctx.night ? 1 : .55}"/><circle cx="${ctx.X + 270}" cy="48" r="4" fill="#f0e4d0" opacity=".6"/>`,
        mid: pastelTrees, front: ctx => { let s = ''; for (let i = 0; i < 18; i++) s += flower(Math.round(ctx.X + ctx.r() * RW), Math.round(220 + ctx.r() * 36), '#fff', 2.8); return s; },
        glow: ctx => ctx.night ? [60, 140, 220, 300].map(dx => `<circle cx="${ctx.X + dx}" cy="238" r="10" fill="#fff8d8" opacity=".08"/>`).join('') : '' },
      pilzdorf: { mid: ctx => [70, 200, 300].map((dx, i) => `<g transform="translate(${ctx.X + dx} 196) scale(${1 - i * .15})"><rect x="-12" y="-24" width="24" height="24" rx="4" fill="#fff4ea"/>
          <path d="M-26 -22 Q0 -58 26 -22 Z" fill="${[ROSE, LILA, '#7fb8e0'][i]}"/><circle cx="-10" cy="-34" r="3" fill="#fff"/><circle cx="8" cy="-40" r="3.4" fill="#fff"/>
          <path d="M-4 0 v-10 a4 4 0 0 1 8 0 v10 Z" fill="#c8a098"/><circle cx="7" cy="-14" r="3" fill="#ffe8a8"/></g>`).join(''),
        front: ctx => [40, 140, 260, 330].map(dx => mushroom(ctx.X + dx, 238 + ctx.r() * 12, .7, PASTELL[Math.floor(ctx.r() * 5)])).join(''),
        glow: ctx => ctx.night ? [70, 200, 300].map(dx => `<circle cx="${ctx.X + dx + 7}" cy="182" r="9" fill="#fff4b0" opacity=".3"/>`).join('') : '' },
      sternenwiese: { sky: ctx => [40, 120, 210, 300].map(dx => sp(ctx.X + dx, 30 + ctx.r() * 60, .9, ctx.night ? '#fff' : '#fff8fc')).join(''),
        front: ctx => { let s = ''; const n = ctx.has('funkelbach') ? 34 : 24; for (let i = 0; i < n; i++) s += flower(Math.round(ctx.X + ctx.r() * RW), Math.round(216 + ctx.r() * 40), PASTELL[i % 5], 2.4); return s + (ctx.has('funkelbach') ? creekP(`M${ctx.X + 150} 176 Q${ctx.X + 290} 192 ${ctx.X + 210} 216 T${ctx.X + 330} 262`, 8) : ''); } },
      zauberberg: { back: ctx => [100, 220].map(dx => crystal(ctx.X + dx, 120, 1.2, dx === 100 ? FLIEDER : ROSA)).join(''), mid: pastelTrees },
    };

    // ---- Gebiete (IDs nie ändern; Neues hinten anhängen) ----
    const regions = [
      ['maerchenwald', 'Märchenwald', 'maerchenwald'], ['rosengarten', 'Rosengarten', 'rosengarten'], ['kristallhoehle', 'Kristallhöhle', 'kristallhoehle'], ['feenteich', 'Feenteich', 'feenteich'],
      ['pilzdorf', 'Pilzdorf', 'pilzdorf'], ['bibliotheksturm', 'Bibliotheksturm', 'bibliothek'], ['sternenwiese', 'Sternenwiese', 'sternenwiese'], ['mondlichtung', 'Mondlichtung', 'mondlichtung'],
      ['wolkenschloss', 'Wolkenschloss', 'wolkenschloss'], ['zauberberg', 'Zauberberg', 'zauberberg'], ['glitzerbach', 'Glitzerbach', 'feenteich'], ['lavendelfeld', 'Lavendelfeld', 'sternenwiese'],
      ['elfenhain', 'Elfenhain', 'maerchenwald'], ['drachenfels', 'Drachenfels', 'zauberberg'], ['perlmuttbucht', 'Perlmuttbucht', 'feenteich'], ['dornroeschenhecke', 'Dornröschenhecke', 'rosengarten'],
      ['amethystgrotte', 'Amethystgrotte', 'kristallhoehle'], ['lesehain', 'Lesehain', 'bibliothek'], ['gluehwuermchenwald', 'Glühwürmchenwald', 'maerchenwald'], ['schmetterlingstal', 'Schmetterlingstal', 'sternenwiese'],
      ['sternenturm', 'Sternenturm', 'bibliothek'], ['nebelmoor', 'Nebelmoor', 'mondlichtung'], ['pilzkoenigreich', 'Pilzkönigreich', 'pilzdorf'], ['wolkenmeer', 'Wolkenmeer', 'wolkenschloss'],
      ['mondsteinhoehle', 'Mondsteinhöhle', 'kristallhoehle'], ['rosenschloss', 'Rosenschloss', 'rosengarten'], ['einhornwiese', 'Einhornwiese', 'sternenwiese'], ['regenbogenfaelle', 'Regenbogenfälle', 'feenteich'],
      ['silberwald', 'Silberwald', 'maerchenwald'], ['feenkoenigreich', 'Feenkönigreich', 'wolkenschloss'],
    ];

    // ---- Laden ----
    const g = (id, name, group, price, d, extra = {}) => ({ id, name, group, price, d, ...extra });
    const STAR = {
      einhorn: { n: 'Einhorn', s: [[-26, 10], [-14, 0], [0, -4], [10, -14], [24, -26], [12, 0], [16, 16], [-18, 18]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [1, 7]], big: [4] },
      drache: { n: 'Drache', s: [[-30, 14], [-18, 4], [-6, 10], [6, 0], [16, -10], [26, -4], [30, -16], [10, -24]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [4, 7]] },
      krone: { n: 'Krone', s: [[-22, 10], [-22, -8], [-10, 2], [0, -16], [10, 2], [22, -8], [22, 10]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]], big: [3] },
      rose: { n: 'Rose', s: [[0, -18], [-10, -10], [10, -10], [-8, 2], [8, 2], [0, 6], [0, 24], [-8, 16]], l: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [5, 6], [6, 7]], big: [0] },
      schloss: { n: 'Schloss', s: [[-24, 18], [-24, -6], [-12, -6], [-12, -18], [0, -26], [12, -18], [12, -6], [24, -6], [24, 18]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 0]] },
      schmetterling: { n: 'Schmetterling', s: [[0, -8], [0, 14], [-22, -18], [-18, 6], [22, -18], [18, 6]], l: [[0, 1], [0, 2], [2, 3], [3, 1], [0, 4], [4, 5], [5, 1]] },
      fee: { n: 'Fee', s: [[0, -24], [0, -10], [-8, 14], [8, 14], [-20, -18], [-18, 0], [20, -18], [18, 0]], l: [[0, 1], [1, 2], [1, 3], [2, 3], [1, 4], [4, 5], [5, 1], [1, 6], [6, 7], [7, 1]], big: [0] },
      zauberstab: { n: 'Zauberstab', s: [[-22, 20], [10, -12], [18, -22], [26, -12], [18, -2]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]], big: [2] },
    };
    const PREM = {
      p_einhornkoenigin: { n: 'Einhornkönigin', s: [[-28, 14], [-14, 2], [0, 0], [12, -12], [26, -28], [8, 4], [14, 20], [-20, 22], [16, -20], [20, -14]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [1, 7], [3, 8], [3, 9]], big: [4] },
      p_phoenix: { n: 'Phönix', s: [[0, -24], [0, 0], [-24, -10], [24, -10], [-12, 16], [0, 26], [12, 16]], l: [[0, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6]], big: [0] },
      p_feenkoenigin: { n: 'Feenkönigin', s: [[0, -28], [-6, -22], [6, -22], [0, -12], [-10, 16], [10, 16], [-22, -22], [-20, 0], [22, -22], [20, 0]], l: [[1, 0], [0, 2], [0, 3], [3, 4], [3, 5], [4, 5], [3, 6], [6, 7], [7, 3], [3, 8], [8, 9], [9, 3]], big: [0] },
      p_drachenherz: { n: 'Drachenherz', s: [[0, 22], [-20, 0], [-20, -14], [-8, -20], [0, -10], [8, -20], [20, -14], [20, 0]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]], big: [4] },
      p_rosenschloss: { n: 'Rosenschloss', s: [[-26, 18], [-26, -10], [-14, -20], [0, -30], [14, -20], [26, -10], [26, 18], [0, 4]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [3, 7]], big: [3, 7] },
      p_mondkrone: { n: 'Mondkrone', s: [[-18, -16], [-24, 2], [-12, 18], [8, 22], [22, 10], [-4, 2], [6, -10], [14, 2]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [5, 6], [6, 7]], big: [6] },
    };
    const gadgets = [
      // Zauberlandschaft (erscheint automatisch)
      g('funkelbach', 'Funkelbach', 'land', 12, null, { info: 'Bäche im Märchenwald und auf der Sternenwiese', icon: '💧' }),
      g('rosenmeer', 'Rosenmeer', 'land', 10, null, { info: 'lässt alle Rosengärten erblühen', icon: '🌹' }),
      g('kristallglanz', 'Kristallglanz', 'land', 14, null, { info: 'Kristalle leuchten hell', icon: '💎' }),
      g('gluehwuermchen', 'Glühwürmchen', 'land', 12, null, { info: 'tanzen in den Märchenwäldern', icon: '✨' }),
      g('regenbogen', 'Regenbogen', 'land', 16, null, { info: 'über Feenteichen und Wolkenschlössern', icon: '🌈' }),
      g('nordlicht', 'Feenlicht', 'land', 25, null, { info: 'schimmert nachts über den Himmel', icon: '🌌' }),
      g('milchstrasse', 'Sternenschleier', 'land', 18, null, { info: 'glitzert nachts quer über die Karte', icon: '🌠' }),
      // Himmel & Sternbilder
      ...Object.keys(STAR).map((k, i) => g('stern_' + k, 'Sternbild ' + STAR[k].n, 'himmel', 6 + (i % 4) * 2, c => starfig(STAR[k], c.tod === 'nacht', false), { sky: true })),
      ...Object.keys(PREM).map(k => g(k, 'Premium-Sternbild ' + PREM[k].n, 'premium', null, c => starfig(PREM[k], c.tod === 'nacht', true), { sky: true, premium: true })),
      g('schmetterlinge', 'Schmetterlinge', 'himmel', 4, () => [[-16, 0, ROSA], [6, -10, FLIEDER], [18, 6, HIMMEL]].map(([x, y, c]) => `<path d="M${x} ${y} q-6 -6 -7 0 q1 5 7 0 Z M${x} ${y} q6 -6 7 0 q-1 5 -7 0 Z" fill="${c}"/>`).join(''), { sky: true }),
      g('himmelslaternen', 'Himmelslaternen', 'himmel', 6, () => [[-16, 6], [2, -8], [18, 4]].map(([x, y]) => `<path d="M${x - 5} ${y - 8} h10 l-2 14 h-6 Z" fill="#ffd6a8"/><circle cx="${x}" cy="${y + 2}" r="9" fill="#fff0c0" opacity=".3"/>`).join(''), { sky: true }),
      g('wolke', 'Zuckerwolke', 'himmel', 3, () => cloud(0, 0, .9), { sky: true }),
      g('regenbogenstueck', 'Regenbogen', 'himmel', 8, () => `<path d="M-28 14 A28 28 0 0 1 28 14" fill="none" stroke="url(#feen-rainbow)" stroke-width="12"/>`, { sky: true }),
      g('sternschnuppe', 'Sternschnuppe', 'himmel', 5, () => `<path d="M-28 -12 L10 6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>${sp(14, 8, 1.6, '#ffe8a8')}`, { sky: true }),
      // Zauberbäume
      g('kirschbluete', 'Kirschblütenbaum', 'baeume', 6, c => c.sea === 'winter' ? trunk(36, 8, '#8a6a70') + dots(301, 8, '#fff', 2, 0, -46, 16, 10) : trunk(28, 8, '#8a6a70') + canopy(0, -44, 22, 18, '#f8c8d8', 301, 11) + dots(302, 10, '#ffffff', 1.8, 0, -44, 18, 14)),
      g('zauberbaum', 'Zauberbaum', 'baeume', 7, c => trunk(30, 8, '#9a7a98') + canopy(0, -46, 20, 20, '#d8c4f0', 311, 11) + (c.tod === 'nacht' ? dots(312, 8, '#fff6a8', 2.2, 0, -46, 16, 16) : dots(312, 6, '#fff', 1.6, 0, -46, 16, 16))),
      g('glyzinie', 'Glyzinie', 'baeume', 8, () => { let s = trunk(34, 7, '#8a6a70') + canopy(0, -48, 20, 10, '#9ad0a0', 321, 7); for (let i = -16; i <= 16; i += 5) s += `<path d="M${i} -44 v${18 + Math.abs(i) % 7}" stroke="${FLIEDER}" stroke-width="4" stroke-linecap="round"/>`; return s; }),
      g('silberbirke', 'Silberbirke', 'baeume', 5, c => `<rect x="-3" y="-46" width="6" height="46" fill="#f8f8fc" ${OL}/><path d="M-3 -34 h3 M0 -22 h3 M-3 -12 h2.5" stroke="#9a9ab0" stroke-width="1.4"/>` + (c.sea === 'winter' ? '' : canopy(0, -52, 13, 18, '#e0ecf0', 331, 9) + dots(332, 6, '#fff', 1.4, 0, -52, 10, 14))),
      g('lichterweide', 'Lichterweide', 'baeume', 9, c => { let s = trunk(36, 9, '#8a7a6a') + canopy(0, -46, 20, 9, '#b8dca8', 341, 7); for (let i = -18; i <= 18; i += 4) s += `<path d="M${i} -42 q${i / 6} 14 ${i / 5} ${30 - Math.abs(i) * .4}" stroke="#a8d098" stroke-width="2" fill="none"/>`; return s + dots(342, 10, c.tod === 'nacht' ? '#fff6a8' : '#ffe8f0', 1.8, 0, -28, 18, 14); }),
      g('herzbaum', 'Herzbaum', 'baeume', 8, () => trunk(28, 7, '#8a6a70') + `<path d="M0 -24 C-30 -42 -18 -70 0 -56 C18 -70 30 -42 0 -24 Z" fill="${ROSA}" ${OL}/>` + dots(351, 6, '#fff', 1.6, 0, -48, 12, 8)),
      g('mondbaum', 'Mondbaum', 'baeume', 10, () => trunk(30, 7, '#6a6a8a') + canopy(0, -46, 19, 18, '#8a9ad0', 361, 10) + [[-8, -50], [8, -40], [2, -58]].map(([x, y]) => `<path d="M${x} ${y} a4 4 0 1 0 0 6 a3 3 0 1 1 0 -6 z" fill="#fff8d8"/>`).join('')),
      g('apfelbluete', 'Apfelblütenbaum', 'baeume', 6, c => decid(c, { h: 20, tw: 7, bark: '#7a5a60', rx: 22, ry: 17, col: '#9ad09a', autumn: '#f0b878', spring: '#fbe0ea', seed: 371, n: 10, fork: true, extra: () => dots(372, 10, ROSE, 2, 0, -34, 18, 10) })),
      // Rosen
      g('rosenbusch', 'Rosenbusch', 'rosen', 4, () => roseBush(0, 0, 1.1, 401, 7)),
      g('rosenbogen', 'Rosenbogen', 'rosen', 12, () => `<path d="M-20 0 V-30 Q0 -56 20 -30 V0" stroke="#fff" stroke-width="4" fill="none"/>` + canopy(-20, -26, 6, 10, '#6aaa88', 411, 5) + canopy(20, -26, 6, 10, '#6aaa88', 412, 5) + canopy(0, -46, 14, 5, '#6aaa88', 413, 6) + dots(414, 12, ROSE, 2.4, 0, -36, 20, 14)),
      g('rosenlaube', 'Rosenlaube mit Bank', 'rosen', 14, () => `<rect x="-18" y="-12" width="36" height="4" rx="1.5" fill="#fff"/><rect x="-16" y="-8" width="3" height="8" fill="#e8d8e8"/><rect x="13" y="-8" width="3" height="8" fill="#e8d8e8"/>
        <path d="M-24 0 V-34 Q0 -60 24 -34 V0" stroke="#fff" stroke-width="3" fill="none"/>` + dots(421, 16, ROSE, 2.2, 0, -40, 22, 16) + dots(422, 8, '#fff0f6', 1.8, 0, -40, 22, 16)),
      g('rosenhecke', 'Rosenhecke', 'rosen', 6, () => canopy(0, -10, 28, 10, '#5a9a78', 431, 9) + dots(432, 12, ROSE, 2.4, 0, -12, 24, 7)),
      g('rosentopf', 'Rose im Topf', 'rosen', 3, () => `<path d="M-8 0 h16 l2 -12 h-20 Z" fill="#f0c8b8"/><path d="M0 -12 v-14" stroke="${DBLATT}" stroke-width="2"/><circle cx="0" cy="-28" r="6" fill="${ROSE}" ${OL}/>`),
      g('zauberrose', 'Zauberrose unter Glas', 'rosen', 12, () => `<path d="M-10 0 h20 v-4 h-20 Z" fill="#c8a0c0"/><path d="M-9 -4 V-30 a9 9 0 0 1 18 0 V-4 Z" fill="#e8f4fc" opacity=".55" stroke="#fff" stroke-width="1.2"/>
        <path d="M0 -6 v-14" stroke="${DBLATT}" stroke-width="1.6"/><circle cx="0" cy="-22" r="4.6" fill="#e05a8a"/>${sp(6, -30, .5, GOLD)}`),
      // Kristalle
      g('rosenquarz', 'Rosenquarz', 'kristalle', 4, () => crystal(0, 0, 1, ROSA)),
      g('amethyst', 'Amethyst', 'kristalle', 4, () => crystal(0, 0, 1, LILA)),
      g('bergkristall', 'Bergkristall', 'kristalle', 5, () => crystal(0, 0, 1.1, '#e8f4fc')),
      g('kristallsaeule', 'Kristallsäule', 'kristalle', 10, () => `<path d="M-8 0 L-8 -50 L0 -62 L8 -50 L8 0 Z" fill="#d8c8f8" ${OL}/><path d="M0 -62 L0 0 L8 0 L8 -50 Z" fill="#fff" opacity=".35"/>` + sp(-4, -40, .8, '#fff')),
      g('kristallbaum', 'Kristallbaum', 'kristalle', 14, () => trunk(30, 6, '#b0a0c8') + [[-14, -40], [0, -52], [14, -42], [-6, -32], [8, -30]].map(([x, y], i) => `<path d="M${x} ${y + 8} L${x - 5} ${y} L${x} ${y - 9} L${x + 5} ${y} Z" fill="${[ROSA, FLIEDER, HIMMEL, MINZE, '#f8e0ff'][i]}"/>`).join('')),
      g('mondstein', 'Leuchtender Mondstein', 'kristalle', 8, c => `${c.tod === 'nacht' ? '<circle cx="0" cy="-10" r="18" fill="#e8f0ff" opacity=".3"/>' : ''}<ellipse cx="0" cy="-8" rx="11" ry="9" fill="#e8eef8" ${OL}/><ellipse cx="-3" cy="-11" rx="4" ry="3" fill="#fff" opacity=".8"/>`),
      // Bücher
      g('buecherstapel', 'Bücherstapel', 'buecher', 3, () => books(0, 0, 5)),
      g('buecherregal', 'Bücherregal', 'buecher', 12, () => `<rect x="-16" y="-44" width="32" height="44" rx="2" fill="#c8a0c0"/><rect x="-12" y="-40" width="24" height="36" fill="#fbeef6"/>` + shelfBooks(-12, -40, 24, 12) + shelfBooks(-12, -28, 24, 12) + shelfBooks(-12, -16, 24, 12) + `<path d="M-12 -28 h24 M-12 -16 h24" stroke="#c8a0c0" stroke-width="1.6"/>`),
      g('lesesessel', 'Lesesessel', 'buecher', 10, () => `<rect x="-18" y="-28" width="8" height="22" rx="4" fill="${ROSE}"/><rect x="-16" y="-18" width="26" height="12" rx="4" fill="${ROSA}"/><rect x="8" y="-20" width="6" height="14" rx="3" fill="${ROSE}"/>
        <rect x="-14" y="-6" width="3" height="6" fill="#c8a0a0"/><rect x="7" y="-6" width="3" height="6" fill="#c8a0a0"/><rect x="19" y="-36" width="1.8" height="36" fill="#a890a8"/><path d="M14 -36 h12 l-3 -8 h-6 Z" fill="${GOLD}"/>`),
      g('schwebebuecher', 'Schwebende Bücher', 'buecher', 9, () => [[-12, -30, -15], [8, -44, 10], [-2, -58, -6]].map(([x, y, r], i) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M-9 -4 L0 -2 L9 -4 L9 4 L0 6 L-9 4 Z" fill="${[ROSE, LILA, '#7fb8e0'][i]}"/><path d="M-7 -3 L0 -1 V5 L-7 3 Z M7 -3 L0 -1 V5 L7 3 Z" fill="#fffaf0"/></g>`).join('') + sp(16, -22, .6, GOLD) + sp(-18, -48, .5, GOLD)),
      g('leseschaukel', 'Leseschaukel', 'buecher', 11, () => trunk(10, 6, '#8a6a70') + `<path d="M-24 -56 H24" stroke="#8a6a70" stroke-width="4"/><path d="M-12 -56 V-14 M12 -56 V-14" stroke="#c8b0c0" stroke-width="1.4"/><rect x="-14" y="-15" width="28" height="4" rx="1.5" fill="${ROSA}"/>` + books(0, -15, 2) + canopy(0, -64, 26, 10, '#a8d8b0', 461, 8)),
      // Feenhäuser
      g('pilzhaus', 'Pilzhaus', 'feenhaus', 14, () => `<rect x="-12" y="-24" width="24" height="24" rx="4" fill="#fff4ea"/><path d="M-26 -22 Q0 -58 26 -22 Z" fill="${ROSE}"/><circle cx="-10" cy="-34" r="3" fill="#fff"/><circle cx="8" cy="-40" r="3.4" fill="#fff"/>
        <path d="M-4 0 v-10 a4 4 0 0 1 8 0 v10 Z" fill="#c8a098"/><circle cx="7" cy="-14" r="3" fill="#ffe8a8"/>`),
      g('feentuer', 'Feentür im Baumstumpf', 'feenhaus', 7, () => `<path d="M-14 0 V-22 Q0 -30 14 -22 V0 Z" fill="#b08a78"/><ellipse cx="0" cy="-23" rx="14" ry="4" fill="#d8b8a0"/><path d="M-5 0 v-10 a5 5 0 0 1 10 0 v10 Z" fill="${LILA}"/><circle cx="3" cy="-5" r="1" fill="${GOLD}"/>`),
      g('tuermchen', 'Schlosstürmchen', 'feenhaus', 18, () => `<rect x="-10" y="-46" width="20" height="46" fill="#fbeef6" ${OL}/><path d="M-13 -46 L0 -70 L13 -46 Z" fill="${LILA}"/><path d="M0 -70 v-6" stroke="${GOLD}" stroke-width="1.4"/><path d="M0 -76 l6 2 l-6 2" fill="${ROSA}"/>
        <rect x="-4" y="-36" width="8" height="10" rx="4" fill="#ffe8a8"/><path d="M-5 0 v-12 a5 5 0 0 1 10 0 v12 Z" fill="#c8a0c0"/>`),
      g('teeparty', 'Teeparty', 'feenhaus', 10, () => `<ellipse cx="0" cy="-12" rx="22" ry="5" fill="#fff"/><rect x="-2" y="-12" width="4" height="12" fill="#e8d0e0"/>
        <path d="M-8 -16 a6 5 0 0 1 12 0 Z" fill="${ROSA}"/><path d="M4 -18 q4 -1 4 3" stroke="${ROSA}" stroke-width="1.4" fill="none"/><rect x="8" y="-17" width="6" height="4" rx="1" fill="${FLIEDER}"/><rect x="-16" y="-17" width="6" height="4" rx="1" fill="${MINZE}"/>`),
      g('laterne', 'Laterne', 'feenhaus', 5, c => `<rect x="-1.4" y="-40" width="2.8" height="40" fill="#8a7a9a"/><path d="M-6 -48 h12 l-2 10 h-8 Z" fill="${c.tod === 'nacht' ? '#fff0b0' : '#fff8e0'}" stroke="#8a7a9a" stroke-width="1.2"/>${c.tod === 'nacht' ? '<circle cx="0" cy="-43" r="12" fill="#fff6c0" opacity=".3"/>' : ''}`),
      // Magie
      g('feenring', 'Feenring aus Pilzen', 'magie', 6, () => [[-20, -2], [-12, -8], [0, -10], [12, -8], [20, -2], [-14, 4], [14, 4], [0, 6]].map(([x, y], i) => mushroom(x, y, .5, [ROSE, LILA, '#7fb8e0'][i % 3])).join('') + sp(0, -14, .8, GOLD)),
      g('zauberkessel', 'Zauberkessel', 'magie', 8, () => `<path d="M-14 -20 Q-16 0 0 0 Q16 0 14 -20 Z" fill="#6a5a7a"/><ellipse cx="0" cy="-20" rx="15" ry="4" fill="${MINZE}"/>
        <circle cx="-4" cy="-26" r="3" fill="${ROSA}" opacity=".8"/><circle cx="4" cy="-32" r="4" fill="${FLIEDER}" opacity=".7"/><circle cx="-2" cy="-40" r="5" fill="#fff" opacity=".6"/>`),
      g('portal', 'Feenportal', 'magie', 20, () => `<ellipse cx="0" cy="-26" rx="18" ry="26" fill="none" stroke="#e0d0f0" stroke-width="5"/><ellipse cx="0" cy="-26" rx="14" ry="22" fill="url(#feen-portal)"/>` + sp(-10, -40, .6, '#fff') + sp(8, -14, .5, '#fff')),
      g('glaskugel', 'Glaskugel', 'magie', 7, () => `<path d="M-8 0 h16 l-3 -6 h-10 Z" fill="${GOLD}"/><circle cx="0" cy="-16" r="11" fill="#e8f0fe" opacity=".8" stroke="#fff" stroke-width="1.4"/><circle cx="-3" cy="-19" r="3" fill="#fff" opacity=".9"/>` + sp(3, -14, .7, LILA)),
      g('zauberstein', 'Zauberstab im Stein', 'magie', 9, () => `<path d="M-14 0 Q-12 -14 0 -14 Q12 -14 14 0 Z" fill="#b8b0c8"/><path d="M0 -14 L4 -40" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>` + sp(5, -44, 1.3, ROSA)),
      // Wasser
      g('feenbrunnen', 'Feenbrunnen', 'wasser', 15, () => `<ellipse cx="0" cy="-4" rx="26" ry="7" fill="#f0e4f4"/><ellipse cx="0" cy="-6" rx="22" ry="5" fill="#bfe4f4"/><rect x="-3" y="-26" width="6" height="20" fill="#f0e4f4"/>
        <ellipse cx="0" cy="-26" rx="11" ry="3.5" fill="#f0e4f4"/><g class="splash"><path d="M0 -28 q-10 -14 -16 6 M0 -28 q10 -14 16 6 M0 -28 v-10" stroke="${WATER}" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>` + sp(0, -42, .7, ROSA)),
      g('seerosen', 'Seerosen', 'wasser', 6, () => `<ellipse cx="0" cy="-5" rx="30" ry="8" fill="#bfe4f4" stroke="#e0d0f0" stroke-width="2"/><ellipse cx="-12" cy="-6" rx="5" ry="2" fill="${BLATT}"/><ellipse cx="8" cy="-4" rx="6" ry="2.2" fill="${BLATT}"/><circle cx="9" cy="-5.5" r="2.2" fill="${ROSA}"/><circle cx="-11" cy="-7" r="1.8" fill="#fff"/>`),
      g('schwanenboot', 'Schwanenboot', 'wasser', 12, () => `<ellipse cx="0" cy="-2" rx="28" ry="4" fill="#bfe4f4"/><path d="M-20 -10 h30 l-4 8 h-22 Z" fill="#fff" ${OL}/><path d="M10 -10 q8 -2 6 -16 q-1 -6 4 -6 q4 0 3 4" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M23 -28 l4 1 l-4 1 Z" fill="#f2b01e"/>`),
      g('wunschbrunnen', 'Wunschbrunnen', 'wasser', 13, () => `<rect x="-14" y="-16" width="28" height="16" rx="3" fill="#e8dcf0" ${OL}/><path d="M-12 -16 V-38 M12 -16 V-38" stroke="#b08a98" stroke-width="2.4"/><path d="M-18 -36 L0 -48 L18 -36 Z" fill="${ROSA}"/><path d="M0 -36 v10" stroke="#8a7a9a"/><path d="M-3 -26 h6 v4 h-6 Z" fill="#c8a098"/>`),
      g('regenbogenfall', 'Regenbogen-Wasserfall', 'wasser', 16, () => `<path d="M-22 0 L-18 -42 L-4 -50 L10 -46 L20 -30 L24 0 Z" fill="#c8bcd8"/><path d="M-4 -48 h8 v48 h-8 Z" fill="${WATER}"/>
        <path d="M-26 -10 A26 26 0 0 1 26 -10" fill="none" stroke="url(#feen-rainbow)" stroke-width="7" opacity=".7"/><ellipse cx="0" cy="-2" rx="16" ry="3.5" fill="${WATER}"/>`),
    ];
    const groups = {
      land: '🌈 Zauberlandschaft', himmel: '✨ Himmel & Sternbilder', premium: '🌟 Premium', baeume: '🌸 Zauberbäume', rosen: '🌹 Rosen',
      kristalle: '💎 Kristalle', buecher: '📚 Bücher', feenhaus: '🍄 Feenhäuser', magie: '🪄 Magie', wasser: '💧 Wasser',
    };
    const finds = [
      { id: 'feenstaub', name: 'etwas Feenstaub', d: sp(-2, -6, .8, GOLD) + sp(3, -2, .5, ROSA) },
      { id: 'rosenblatt', name: 'ein Rosenblatt', d: `<path d="M0 0 Q-6 -6 0 -10 Q6 -6 0 0 Z" fill="${ROSE}"/>` },
      { id: 'kristallsplitter', name: 'ein Kristallsplitter', d: `<path d="M-3 0 L-2 -6 L0 -10 L3 -6 L3 0 Z" fill="${FLIEDER}" stroke="#a888c8" stroke-width=".6"/>` },
      { id: 'perle', name: 'eine Perle', d: '<circle cx="0" cy="-3.5" r="3.5" fill="#fff" stroke="#e0d0e8" stroke-width=".8"/><circle cx="-1.2" cy="-4.6" r="1" fill="#fff"/>' },
      { id: 'feder', name: 'eine Zauberfeder', d: `<path d="M-5 0 Q-3 -9 5 -10 Q2 -3 -5 0 Z" fill="${FLIEDER}"/><path d="M-5 0 L4 -9" stroke="#fff" stroke-width=".6"/>` },
      { id: 'gloeckchen', name: 'ein Feenglöckchen', d: `<path d="M-4 0 q0 -7 4 -7 q4 0 4 7 z" fill="${GOLD}"/><circle cx="0" cy="0.6" r="1.2" fill="#c8a040"/>` },
      { id: 'schmetterling', name: 'ein Schmetterling', d: `<path d="M0 -4 q-5 -5 -6 0 q1 4 6 0 Z M0 -4 q5 -5 6 0 q-1 4 -6 0 Z" fill="${ROSA}"/>` },
      { id: 'mondstein', name: 'ein Mondstein', d: '<ellipse cx="0" cy="-3.5" rx="4" ry="3.2" fill="#e8eef8" stroke="#c8d0e8" stroke-width=".6"/>' },
      { id: 'schluessel', name: 'ein goldener Schlüssel', d: `<circle cx="-3" cy="-4" r="2.4" fill="none" stroke="${GOLD}" stroke-width="1.2"/><path d="M-1 -4 h6 v2 M3 -4 v2" stroke="${GOLD}" stroke-width="1.2" fill="none"/>` },
      { id: 'herz', name: 'ein Kristallherz', d: `<path d="M0 0 C-7 -4 -5 -10 0 -6.5 C5 -10 7 -4 0 0 Z" fill="${ROSA}"/>` },
      { id: 'kleeblatt', name: 'ein Glücksklee', d: `<circle cx="-2" cy="-6" r="2.2" fill="${BLATT}"/><circle cx="2" cy="-6" r="2.2" fill="${BLATT}"/><circle cx="-2" cy="-2.5" r="2.2" fill="${BLATT}"/><circle cx="2" cy="-2.5" r="2.2" fill="${BLATT}"/>` },
    ];

    return {
      regions, biomes, gadgets, groups, finds,
      defs: '<linearGradient id="feen-rainbow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4a7c0"/><stop offset=".25" stop-color="#ffd6a8"/><stop offset=".5" stop-color="#fff0a8"/><stop offset=".75" stop-color="#a8e0c8"/><stop offset="1" stop-color="#c9a7e8"/></linearGradient>' +
        '<radialGradient id="feen-portal"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#f4c8e8"/><stop offset="1" stop-color="#b48ad8"/></radialGradient>',
      biomeHeights: { maerchenwald: [105, 150], rosengarten: [115, 150], kristallhoehle: [70, 120], feenteich: [110, 150], bibliothek: [100, 145],
        wolkenschloss: [60, 110], mondlichtung: [110, 150], pilzdorf: [110, 150], sternenwiese: [120, 155], zauberberg: [25, 80] },
      sky: { tag: ['#b9a3e8', '#f3b6d6', '#ffe6f0'], morgen: ['#c9b6f0', '#ffd1e1', '#fff0d9'], abend: ['#6d5ba8', '#e88bb5', '#ffc9a8'], nacht: ['#1d1438', '#3b2a6b', '#6a4a9a'] },
      land: {
        fruehling: { hill: '#b8e0b8', ground: '#cfeac4', leaf: ['#f8c8d8', '#d8c4f0'] },
        sommer: { hill: '#a8d8a8', ground: '#c2e6b4', leaf: ['#9ad09a', '#b8e0a8'] },
        herbst: { hill: '#dcc4dc', ground: '#f2dce6', leaf: ['#f0a8b8', '#f2c890', '#d8a0c8', '#e8b8a0'] },
        winter: { hill: '#f0eaf8', ground: '#faf6fc', leaf: [] },
      },
      colors: {
        far: '#dcd0f0', farNight: '#4a3a7a', mount: '#c3b3e3', mountNight: '#3a2f66', sun: '#fff0c0', moon: '#fff8e8',
        path: '#f6e8f2', pathWinter: '#efe6f6', sprinkle: ['#fff', ROSA], night: '#1d1438', skyPreview: '#3b2a6b',
        lockFill: '#fdf2f8', lockStroke: ROSE, lockText: '#b0507a', currency: '💎', spotIcon: '✨', aurora1: '#f4a7c0', aurora2: '#b48ad8',
      },
    };
  }


  // ======================= App: Name, Texte, Themen, Start, Einführung =======================
  function intro(I) {
    const { introAnimal, miniRow, coverSvg, welcomeScene, Wd, A } = I;
    return [
      { title: 'Willkommen im Feenwald!', art: () => welcomeScene({
          region: 'maerchenwald', owned: ['gluehwuermchen'], hero: ['einhorn', 'blumenkranz', ROSA], eggColor: ROSA, hello: 'Hallo! ✨', hearts: ['💗', '✨', '💗'],
          back: [['drache', 'krone', LILA, 62], ['eule', 'buch', ROSE, 132], ['pegasus', 'keins', '', 228], ['kitsune', 'schleife', FLIEDER, 298]],
          front: [['fee', 'keins', '', 38], ['mondhase', 'kristall', HIMMEL, 106], ['phoenix', 'krone', GOLD, 254], ['feenkatze', 'perlenkette', ROSA, 322]],
        }),
        points: ['Hier wird aus jedem Haken ein kleiner <mark>Zauber</mark>.', 'Keine langweilige To-do-Liste: Fabelwesen, ein eigenes Märchenreich, Schatztruhen und noch viel mehr.', 'Produktiv sein und dabei träumen. <b>Deine Zauberwesen warten schon auf dich!</b> ✨'] },
      { title: 'Erschaffe dein Märchenreich.', art: () => `<div class="intro-art map">${coverSvg(Wd.regionPreview('wolkenschloss', ['regenbogen', 'nordlicht', 'milchstrasse']))}
          <div class="map-crew">${introAnimal('drache', 'krone', LILA)}${introAnimal('einhorn', 'blumenkranz', ROSA)}${introAnimal('fee', 'keins', '')}</div></div>`,
        points: ['Jeder Haken bringt dir <mark>1 💎 Kristall</mark>.', 'Damit holst du dir Rosenbögen, Kristalle, Pilzhäuser und Sternbilder und schaltest neue Gebiete frei: vom Märchenwald bis zum Wolkenschloss.', 'Deine Zauberwesen ziehen dort ein, und <b>du bestimmst</b>, wer wo wohnt.'] },
      { title: 'Loslegen in 60 Sekunden.', art: () => `<div class="intro-art list starter">
          <div class="mini-cat"><span>${introAnimal('einhorn', 'keins', '')}</span><b>Allgemein</b><small>2 offen</small></div>
          ${miniRow('Buch zurückbringen', 'is-imp')}${miniRow('Blumen gießen', '')}
          <div class="mini-add">+ Aufgabe hinzufügen</div></div>`,
        points: ['<b>1.</b> Unter <b>Listen</b> legst du Kategorien an, zum Beispiel <mark>Studium</mark> oder <mark>Zuhause</mark>. Jede bekommt eine Farbe und ein Zauberwesen.', '<b>2.</b> Unter <b>＋ Aufgaben eintragen</b> wird jede Zeile eine Aufgabe.', '<b>3.</b> Kreis antippen = erledigt. 💗 heißt wichtig, ✂️ teilt eine Aufgabe in kleine Schritte.'] },
      { title: 'Jeden Tag ein kleiner Zauber.', art: () => `<div class="intro-art gifts">
          <div class="gift-strip">${[2, 2, 3, 3, 4, 4].map((n, i) => `<span class="${i < 3 ? 'done' : ''}">💎<b>+${n}</b></span>`).join('')}<span class="chest-cell">${I.ICON_CHEST()}</span></div>
          <div class="gift-chest">${Wd.chest(true)}</div></div>`,
        points: ['Jeden Tag gibt es <mark>Kristalle geschenkt</mark>, einfach fürs Vorbeischauen.', 'Am 7. Tag öffnest du eine <b>Schatztruhe</b>: Wunsch-Gutschein oder goldenes Sternbild.', 'Pause gemacht? Kein Problem, <b>nichts verfällt</b>.'] },
      { title: 'Dein erstes Zauber-Ei wartet!', art: () => `<div class="intro-art loop">
          <div class="loop-tile"><span>📝</span><b>Eintragen</b></div><div class="loop-arrow">→</div>
          <div class="loop-tile"><span>✓</span><b>Abhaken</b></div>
          <div class="loop-arrow">↑</div><div></div><div class="loop-arrow">↓</div>
          <div class="loop-tile"><span class="loop-svg">${Wd.preview('pilzhaus')}</span><b>Reich wächst</b></div><div class="loop-arrow">←</div>
          <div class="loop-tile egg"><span class="loop-svg wobble">${A.egg(ROSA)}</span><b>Wesen schlüpft</b></div></div>`,
        points: ['Trag gleich deine <mark>erste Aufgabe</mark> ein, gern auch eine ganz kleine.', 'Drei Haken, und dein erstes Zauberwesen ist da. ✨', 'Farben, Schriftgröße und Ruhemodus findest du unter <b>Einstellen</b>.'] },
    ];
  }

  return {
    id: 'feen',
    appName: 'FeenwaldToDoList',
    nameHtml: 'Feenwald<wbr>ToDoList',
    storageKey: 'feenwald-v1',
    swPath: '../sw.js',          // gemeinsamer Offline-Cache für beide Editionen
    backupPrefix: 'feenwald-backup',
    text: {
      cur: 'Kristall', curN: 'Kristalle', curIcon: '💎', curDat: 'Kristallen',
      baby: 'Zauberwesen', babies: 'Zauberwesen', creature: 'Wesen', creatures: 'Wesen', creaturesDat: 'Wesen',
      world: 'Feenwald', worldIcon: '🧚', meadow: 'Lichtung', shop: 'Zauberladen', home: 'Feenhaus', spot: 'Sternen-Platz', spotIcon: '✨',
      paw: '✨', hello: 'Hallo! ✨', hatchHead: 'Zauberhaft!', chest: 'Schatztruhe', egg: 'Zauber-Ei',
    },
    themes: [
      { id: 'rosenquarz', name: 'Rosenquarz', a: '#fde4ee', b: '#d9638f', meta: '#fff5f9' },
      { id: 'flieder', name: 'Flieder', a: '#efe4fb', b: '#8e6cc8', meta: '#faf6ff' },
      { id: 'perlmutt', name: 'Perlmutt', a: '#e4f2f8', b: '#c0709f', meta: '#fbf8fc' },
      { id: 'pfirsichbluete', name: 'Pfirsichblüte', a: '#ffe6d8', b: '#d0706a', meta: '#fff7f2' },
      { id: 'minzzauber', name: 'Minzzauber', a: '#ddf3ea', b: '#4a9a84', meta: '#f5fcf9' },
      { id: 'mondschein', name: 'Mondschein', a: '#2a2045', b: '#e8a8d0', meta: '#1a1430' },
    ],
    colors: ['#e88aa8', '#b48ad8', '#7fb8e0', '#7cc8b0', '#f0a878', '#d8a040', '#c87898', '#9a8ae0', '#e07a9a', '#8ab8a0'],
    cheers: ['Zauberhaft! ✨', 'Ein Funke mehr 💫', 'Wie im Märchen 🌸', 'Geschafft, die Feen applaudieren 🧚', 'Ein Kapitel weiter 📖',
      'Du strahlst heller als jeder Kristall 💎', 'Rosen für dich 🌹', 'Jeder Haken ist ein kleiner Zauber 🪄', 'Wunderbar gemacht 💗', 'Das war magisch ✨'],
    taglines: ['Jeder kleine Schritt ist ein bisschen Magie.', 'Heute muss nicht alles verzaubert werden.', 'Ein Kapitel nach dem anderen. 📖',
      'Pausen sind wie Feenstaub: Sie geben neue Kraft.', 'Deine Zauberwesen freuen sich über jeden Haken.', 'Auch Rosen blühen nicht alle auf einmal. 🌹',
      'Du machst das wunderbar. Wirklich.', 'Kleine Wunder zählen genauso.'],
    sparks: ['✨', '💗', '🌸', '💫', '🌹', '🦋', '💎', '⭐'],
    categories: [
      { id: 'allgemein', name: 'Allgemein', color: '#e88aa8', animal: 'einhorn' },
      { id: 'zuhause', name: 'Zuhause', color: '#b48ad8', animal: 'drache' },
    ],
    starter: { id: 'start-einhorn', kind: 'einhorn', look: { fur: 0, acc: 'blumenkranz', color: ROSA, stone: 0 }, name: 'Glitzer', catName: 'Allgemein', spot: 'maerchenwald:af4' },
    animals, world, intro,
  };

})();
