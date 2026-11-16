/* Babytiere als SVG – jedes Tier ist eine Funktion, neue Tiere einfach in KINDS ergänzen. */
(function () {
  'use strict';

  const INK = '#3a3347';
  const OL = 'stroke="rgba(58,51,71,.22)" stroke-width="1.6"';

  // ---------- kleine Bausteine ----------
  const eyes = (y = 50, dx = 10) =>
    [50 - dx, 50 + dx].map(x =>
      `<circle cx="${x}" cy="${y}" r="3.6" fill="${INK}"/><circle cx="${x + 1.2}" cy="${y - 1.3}" r="1.25" fill="#fff"/>`
    ).join('');

  const blush = (y = 57, dx = 17) =>
    `<ellipse cx="${50 - dx}" cy="${y}" rx="4.4" ry="2.6" fill="#ff8a50" opacity=".3"/>` +
    `<ellipse cx="${50 + dx}" cy="${y}" rx="4.4" ry="2.6" fill="#ff8a50" opacity=".3"/>`;

  const mouth = (y = 58) =>
    `<path d="M50 ${y} v1.6 M50 ${y + 1.6} q-2.4 2.5 -4.7 .2 M50 ${y + 1.6} q2.4 2.5 4.7 .2" stroke="${INK}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;

  const body = (main, belly, feet) =>
    `<ellipse cx="50" cy="80" rx="24" ry="17" fill="${main}" ${OL}/>` +
    `<ellipse cx="50" cy="83" rx="13" ry="10" fill="${belly}"/>` +
    `<ellipse cx="39" cy="94" rx="7" ry="4" fill="${feet || main}" ${OL}/>` +
    `<ellipse cx="61" cy="94" rx="7" ry="4" fill="${feet || main}" ${OL}/>`;

  const head = (main, cy = 48, r = 27) => `<circle cx="50" cy="${cy}" r="${r}" fill="${main}" ${OL}/>`;

  // Lieblingssteine der Otter
  const STONES = [
    { name: 'Kiesel', c: '#8fa3b8' }, { name: 'Sandstein', c: '#d9a066' }, { name: 'Jade', c: '#4fa77a' },
    { name: 'Türkisstein', c: '#2bb3b1' }, { name: 'Rostrot', c: '#b5532a' }, { name: 'Bergkristall', c: '#e3eef7' },
  ];

  // Standard-Ankerpunkte für Zubehör
  const STD = { hat: [21, 1], neck: [71, 28, 72], bow: [66, 27], flower: [33, 28] };

  // ---------- die Tiere ----------
  const KINDS = {
    pinguin: {
      label: 'Pinguin', baby: 'Pinguin-Küken',
      furs: [
        { name: 'flauschig grau', main: '#9aa3b5' },
        { name: 'nachtblau', main: '#56627f' },
        { name: 'eisblau', main: '#8fa7cf' },
      ],
      anchors: { hat: [26, 1], neck: [69, 22, 78], bow: [68, 32], flower: [32, 34] },
      draw: f => `
        <ellipse cx="36" cy="94" rx="7" ry="3.6" fill="#f6a04d"/>
        <ellipse cx="64" cy="94" rx="7" ry="3.6" fill="#f6a04d"/>
        <ellipse cx="21" cy="68" rx="6" ry="13" transform="rotate(22 21 68)" fill="${f.main}" ${OL}/>
        <ellipse cx="79" cy="68" rx="6" ry="13" transform="rotate(-22 79 68)" fill="${f.main}" ${OL}/>
        <path d="M49 30 q-3 -7 2 -10 M51 30 q4 -6 8 -4" stroke="${f.main}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="60" rx="30" ry="34" fill="${f.main}" ${OL}/>
        <path d="M50 42 C40 34 24 40 26 54 C28 68 42 72 50 72 C58 72 72 68 74 54 C76 40 60 34 50 42 Z" fill="#fff"/>
        <ellipse cx="50" cy="82" rx="17" ry="11" fill="#fff"/>
        ${eyes(52, 10)}${blush(60, 17)}
        <path d="M45.5 57 Q50 55.5 54.5 57 Q50 62.5 45.5 57 Z" fill="#f6a04d"/>`,
    },

    pferd: {
      label: 'Pferd', baby: 'Fohlen',
      furs: [
        { name: 'braun', main: '#be8a62', mane: '#6e4a35', muzzle: '#e6c3a5' },
        { name: 'Schimmel', main: '#f2efea', mane: '#bdb6c4', muzzle: '#f7dfe2' },
        { name: 'Fuchs mit Blesse', main: '#d9905a', mane: '#f3dcb5', muzzle: '#f2c9a8', blaze: true },
        { name: 'Palomino', main: '#e8c27c', mane: '#fff3d6', muzzle: '#f6dcc0' },
      ],
      anchors: STD,
      draw: f => `
        <path d="M72 84 q15 2 12 14" stroke="${f.mane}" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M33 30 L31 12 L44 23 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/>
        <path d="M34.5 26 L33.5 17 L40 23 Z" fill="#f5c6a5"/>
        <path d="M67 30 L69 12 L56 23 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/>
        <path d="M65.5 26 L66.5 17 L60 23 Z" fill="#f5c6a5"/>
        ${body(f.main, f.muzzle, '#7d6a63')}
        ${head(f.main, 47, 26)}
        ${f.blaze ? '<ellipse cx="50" cy="44" rx="3.6" ry="10" fill="#fff"/>' : ''}
        <ellipse cx="50" cy="62" rx="15" ry="10.5" fill="${f.muzzle}"/>
        <ellipse cx="44.5" cy="63" rx="1.7" ry="2.3" fill="${INK}" opacity=".45"/>
        <ellipse cx="55.5" cy="63" rx="1.7" ry="2.3" fill="${INK}" opacity=".45"/>
        <path d="M46 68 q4 2.5 8 0" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".7"/>
        ${eyes(46, 10.5)}${blush(53, 20)}
        <path d="M41 22 q1 10 8 13 q0 -7 4 -9 q2 6 7 7 q-2 -11 -10 -13 q-5 -1 -9 2 z" fill="${f.mane}" ${OL}/>`,
    },

    steinbock: {
      label: 'Steinbock', baby: 'Steinböckchen',
      furs: [
        { name: 'nussbraun', main: '#b59c80', belly: '#efe4d6', dark: '#6f5d4c' },
        { name: 'felsgrau', main: '#aaa49c', belly: '#ebe8e3', dark: '#635d57' },
        { name: 'sandhell', main: '#d8c4a6', belly: '#f7efe2', dark: '#8b7558' },
      ],
      anchors: STD,
      draw: f => `
        <ellipse cx="73" cy="81" rx="4" ry="3" fill="${f.dark}"/>
        <path d="M40 27 Q35 8 21 11 Q32 14 35 29 Z" fill="#9a8a74" ${OL} stroke-linejoin="round"/>
        <path d="M33.5 17 l3 -2 M30 13.6 l2.4 -2.6 M36 22 l3 -1.4" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M60 27 Q65 8 79 11 Q68 14 65 29 Z" fill="#9a8a74" ${OL} stroke-linejoin="round"/>
        <path d="M66.5 17 l-3 -2 M70 13.6 l-2.4 -2.6 M64 22 l-3 -1.4" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="23" cy="41" rx="10" ry="4.5" transform="rotate(-15 23 41)" fill="${f.main}" ${OL}/>
        <ellipse cx="24" cy="41" rx="5.5" ry="2.2" transform="rotate(-15 24 41)" fill="#f5c6a5"/>
        <ellipse cx="77" cy="41" rx="10" ry="4.5" transform="rotate(15 77 41)" fill="${f.main}" ${OL}/>
        <ellipse cx="76" cy="41" rx="5.5" ry="2.2" transform="rotate(15 76 41)" fill="#f5c6a5"/>
        ${body(f.main, f.belly, '#5f544c')}
        ${head(f.main)}
        <path d="M46.5 66 q3.5 11 7 0 z" fill="${f.dark}"/>
        <ellipse cx="50" cy="59" rx="11" ry="8" fill="${f.belly}"/>
        <path d="M47.5 56.4 h5 l-2.5 2.5 z" fill="${INK}" stroke="${INK}" stroke-linejoin="round"/>
        ${mouth(58.9)}
        ${eyes(48, 10)}${blush(56, 18)}`,
    },

    hund: {
      label: 'Hund', baby: 'Hundewelpe',
      furs: [
        { name: 'golden', main: '#ecc07a', ear: '#c98d45', snout: '#fbe8c8' },
        { name: 'schokobraun', main: '#b07f60', ear: '#7b5440', snout: '#e8cdb6' },
        { name: 'cremeweiß', main: '#f6ead4', ear: '#d6b48a', snout: '#fffaf0' },
        { name: 'mit Augenfleck', main: '#fbf6ee', ear: '#5b4a46', snout: '#fff', patch: '#8a6a58' },
        { name: 'grau', main: '#c3c2d0', ear: '#8e8ea3', snout: '#eeeef4' },
      ],
      anchors: STD,
      draw: f => `
        <path d="M72 84 q13 -3 11 -15" stroke="${f.main}" stroke-width="5" fill="none" stroke-linecap="round"/>
        ${body(f.main, f.snout)}
        ${head(f.main)}
        ${f.patch ? `<ellipse cx="61" cy="47" rx="7.5" ry="7" fill="${f.patch}"/>` : ''}
        <ellipse cx="26" cy="47" rx="8" ry="15" transform="rotate(18 26 47)" fill="${f.ear}" ${OL}/>
        <ellipse cx="74" cy="47" rx="8" ry="15" transform="rotate(-18 74 47)" fill="${f.ear}" ${OL}/>
        <ellipse cx="50" cy="60" rx="12" ry="8.5" fill="${f.snout}"/>
        <ellipse cx="50" cy="64.2" rx="2.3" ry="2.2" fill="#e8735a"/>
        <ellipse cx="50" cy="56" rx="3.8" ry="2.8" fill="${INK}"/>
        ${mouth(58.4)}
        ${eyes(48, 11)}${blush(56, 19)}`,
    },

    tiger: {
      label: 'Tiger', baby: 'Tigerbaby',
      furs: [
        { name: 'bengalorange', main: '#f28c28', light: '#fff8ef', stripes: '#3a2a26' },
        { name: 'goldtiger', main: '#f2b55a', light: '#fffaf0', stripes: '#b5652e' },
        { name: 'weißer Tiger', main: '#f6f5f2', light: '#ffffff', stripes: '#4a4a55' },
      ],
      anchors: STD,
      draw: f => `
        <path d="M72 86 q16 -1 13 -16" stroke="${f.main}" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <path d="M80.5 84 l2.5 -3 M84.5 77 l3 -.5" stroke="${f.stripes}" stroke-width="2" stroke-linecap="round"/>
        <circle cx="30" cy="28" r="8.5" fill="${f.main}" ${OL}/>
        <circle cx="30" cy="28.5" r="4.5" fill="${f.light}"/>
        <circle cx="70" cy="28" r="8.5" fill="${f.main}" ${OL}/>
        <circle cx="70" cy="28.5" r="4.5" fill="${f.light}"/>
        ${body(f.main, f.light)}
        <path d="M29 77 q4 2 7 0 M71 77 q-4 2 -7 0 M27.5 84 q4 2 7 0 M72.5 84 q-4 2 -7 0" stroke="${f.stripes}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        ${head(f.main)}
        <path d="M50 22 v6 M43 24 q1.6 3 0 6.5 M57 24 q-1.6 3 0 6.5" stroke="${f.stripes}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M24 44 h6 M23.6 50.5 h7 M76 44 h-6 M76.4 50.5 h-7" stroke="${f.stripes}" stroke-width="2.4" stroke-linecap="round"/>
        <ellipse cx="44" cy="60" rx="8" ry="6.5" fill="${f.light}"/>
        <ellipse cx="56" cy="60" rx="8" ry="6.5" fill="${f.light}"/>
        <ellipse cx="50" cy="65" rx="5" ry="3.5" fill="${f.light}"/>
        ${eyes(48, 10)}
        <path d="M47 55.5 h6 l-3 3 z" fill="#d9785a" stroke="#d9785a" stroke-linejoin="round"/>
        ${mouth(58.5)}
        <circle cx="42" cy="61" r=".8" fill="${INK}" opacity=".4"/><circle cx="44.5" cy="63.5" r=".8" fill="${INK}" opacity=".4"/>
        <circle cx="58" cy="61" r=".8" fill="${INK}" opacity=".4"/><circle cx="55.5" cy="63.5" r=".8" fill="${INK}" opacity=".4"/>
        ${blush(55, 19)}`,
    },

    otter: {
      label: 'Otter', baby: 'Otterbaby',
      furs: [
        { name: 'flussbraun', main: '#8d6447', light: '#ead8c4', dark: '#5e3f2c' },
        { name: 'schokobraun', main: '#6f4a35', light: '#dcc3a8', dark: '#47301f' },
        { name: 'haselnuss', main: '#b08562', light: '#f2e4d3', dark: '#7a5638' },
        { name: 'Seeotter', main: '#7a6a60', light: '#ece6de', dark: '#4f433c' },
      ],
      anchors: STD,
      draw: (f, l) => {
        const st = STONES[l.stone] || STONES[0];
        return `
        <path d="M70 88 q18 2 21 -9 q-8 5 -21 3 z" fill="${f.main}" ${OL} stroke-linejoin="round"/>
        <ellipse cx="17" cy="95" rx="5" ry="3.4" fill="#8fa3b8" ${OL}/>
        <ellipse cx="24.5" cy="96" rx="4" ry="2.8" fill="#d9a066" ${OL}/>
        <ellipse cx="20.5" cy="91" rx="3.6" ry="2.6" fill="#2bb3b1" ${OL}/>
        <circle cx="27" cy="38" r="5.5" fill="${f.main}" ${OL}/>
        <circle cx="27" cy="38" r="2.6" fill="${f.dark}"/>
        <circle cx="73" cy="38" r="5.5" fill="${f.main}" ${OL}/>
        <circle cx="73" cy="38" r="2.6" fill="${f.dark}"/>
        ${body(f.main, f.light, f.dark)}
        ${head(f.main, 48, 26)}
        <ellipse cx="50" cy="57" rx="19" ry="13" fill="${f.light}"/>
        ${eyes(46, 10)}
        <ellipse cx="50" cy="53" rx="4.6" ry="3.1" fill="${INK}"/>
        <ellipse cx="48.6" cy="52.2" rx="1.3" ry=".8" fill="#fff" opacity=".7"/>
        ${mouth(55.6)}
        <path d="M35 57 l-9 -1 M35 60 l-9 2 M65 57 l9 -1 M65 60 l9 2" stroke="${INK}" stroke-opacity=".3" stroke-width="1.1" stroke-linecap="round"/>
        ${blush(59, 20)}
        <ellipse cx="50" cy="74.5" rx="6" ry="4.6" fill="${st.c}" ${OL}/>
        <path d="M47.5 73 q1.5 -1.2 3.5 -.8" stroke="#fff" stroke-opacity=".7" stroke-width="1" fill="none" stroke-linecap="round"/>
        <ellipse cx="42.5" cy="75.5" rx="4.6" ry="3.6" fill="${f.main}" ${OL}/>
        <ellipse cx="57.5" cy="75.5" rx="4.6" ry="3.6" fill="${f.main}" ${OL}/>`;
      },
    },

    katze: {
      label: 'Katze', baby: 'Kätzchen',
      furs: [
        { name: 'rot getigert', main: '#f5b26f', belly: '#fde6c9', stripes: '#d98a45' },
        { name: 'grau', main: '#b3b3c4', belly: '#e9e9f1' },
        { name: 'creme', main: '#f4e4c6', belly: '#fff8ea' },
        { name: 'schneeweiß', main: '#fbfaf7', belly: '#ffffff' },
        { name: 'braun getigert', main: '#c9a07a', belly: '#f0dfcc', stripes: '#8e6747' },
      ],
      anchors: STD,
      draw: f => `
        <path d="M72 88 q16 -2 12 -18" stroke="${f.main}" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M27 38 L29 13 L47 25 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/>
        <path d="M31 32 L32 19 L42 26 Z" fill="#f5c6a5"/>
        <path d="M73 38 L71 13 L53 25 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/>
        <path d="M69 32 L68 19 L58 26 Z" fill="#f5c6a5"/>
        ${body(f.main, f.belly)}
        ${head(f.main)}
        ${f.stripes ? `<path d="M50 22 v7 M44 23 l1 6 M56 23 l-1 6" stroke="${f.stripes}" stroke-width="2.4" stroke-linecap="round"/>` : ''}
        ${eyes(49, 10)}
        <path d="M47.6 55 h4.8 l-2.4 2.6 z" fill="#d9785a" stroke="#d9785a" stroke-linejoin="round"/>
        ${mouth(57.6)}
        <path d="M31 55 l-10 -2 M31 59 l-10 2 M69 55 l10 -2 M69 59 l10 2" stroke="${INK}" stroke-opacity=".35" stroke-width="1.2" stroke-linecap="round"/>
        ${blush(56, 17)}`,
    },

    hase: {
      label: 'Hase', baby: 'Häschen',
      furs: [
        { name: 'weiß', main: '#fbf7f2', belly: '#ffffff' },
        { name: 'hellbraun', main: '#d2b094', belly: '#f3e4d6' },
        { name: 'grau', main: '#bdb8c6', belly: '#ecebf1' },
        { name: 'karamell', main: '#e9c99f', belly: '#fbefdd' },
      ],
      anchors: STD,
      draw: f => `
        <circle cx="74" cy="88" r="6" fill="#fff" ${OL}/>
        <ellipse cx="39" cy="20" rx="7.5" ry="17" transform="rotate(-10 39 20)" fill="${f.main}" ${OL}/>
        <ellipse cx="39" cy="21" rx="3.6" ry="12" transform="rotate(-10 39 21)" fill="#f5c6a5"/>
        <ellipse cx="61" cy="20" rx="7.5" ry="17" transform="rotate(10 61 20)" fill="${f.main}" ${OL}/>
        <ellipse cx="61" cy="21" rx="3.6" ry="12" transform="rotate(10 61 21)" fill="#f5c6a5"/>
        ${body(f.main, f.belly)}
        ${head(f.main)}
        ${eyes(49, 10)}
        <ellipse cx="50" cy="55.5" rx="2.8" ry="2" fill="#d9785a"/>
        ${mouth(57.3)}
        <rect x="48.5" y="60.4" width="3" height="3.2" rx=".8" fill="#fff" stroke="${INK}" stroke-opacity=".3" stroke-width=".8"/>
        ${blush(56, 17)}`,
    },

    fuchs: {
      label: 'Fuchs', baby: 'Fuchsbaby',
      furs: [
        { name: 'rotfuchs', main: '#f0955a', light: '#fff4e6', dark: '#5a4148' },
        { name: 'goldfuchs', main: '#f4b860', light: '#fff7e8', dark: '#6b5146' },
        { name: 'polarfuchs', main: '#eef0f6', light: '#ffffff', dark: '#9aa0b8' },
      ],
      anchors: STD,
      draw: f => `
        <ellipse cx="78" cy="80" rx="9" ry="17" transform="rotate(40 78 80)" fill="${f.main}" ${OL}/>
        <ellipse cx="87" cy="69" rx="5.5" ry="6" transform="rotate(40 87 69)" fill="${f.light}"/>
        <path d="M26 36 L27 12 L46 25 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/>
        <path d="M26.6 21 L27 12 L33.5 16.5 Z" fill="${f.dark}"/>
        <path d="M30 31 L31 19 L40 26 Z" fill="${f.light}"/>
        <path d="M74 36 L73 12 L54 25 Z" fill="${f.main}" ${OL} stroke-linejoin="round"/>
        <path d="M73.4 21 L73 12 L66.5 16.5 Z" fill="${f.dark}"/>
        <path d="M70 31 L69 19 L60 26 Z" fill="${f.light}"/>
        ${body(f.main, f.light, f.dark)}
        ${head(f.main)}
        <path d="M23.4 52 Q36 46 50 56 Q64 46 76.6 52 Q74 74 50 75 Q26 74 23.4 52 Z" fill="${f.light}"/>
        ${eyes(48, 10)}
        <ellipse cx="50" cy="57" rx="3.4" ry="2.5" fill="${INK}"/>
        ${mouth(59)}
        ${blush(58, 18)}`,
    },

    eisbaer: {
      label: 'Eisbär', baby: 'Eisbärbaby',
      furs: [
        { name: 'schneeweiß', main: '#fbf8f2', inner: '#efe2d3', snout: '#f3ece2' },
        { name: 'vanille', main: '#f7efdf', inner: '#e9d6bc', snout: '#fbf5ea' },
        { name: 'frostig', main: '#f2f6fb', inner: '#d9e3f0', snout: '#ffffff' },
      ],
      anchors: STD,
      draw: f => `
        <circle cx="74" cy="88" r="4.5" fill="${f.main}" ${OL}/>
        <circle cx="29" cy="28" r="8.5" fill="${f.main}" ${OL}/>
        <circle cx="29" cy="28" r="4.5" fill="${f.inner}"/>
        <circle cx="71" cy="28" r="8.5" fill="${f.main}" ${OL}/>
        <circle cx="71" cy="28" r="4.5" fill="${f.inner}"/>
        ${body(f.main, f.snout)}
        ${head(f.main)}
        ${eyes(47, 11)}
        <ellipse cx="50" cy="59" rx="11" ry="8" fill="${f.snout}" ${OL}/>
        <path d="M46.5 55 q3.5 -1.5 7 0 q-1 3.6 -3.5 3.6 q-2.5 0 -3.5 -3.6 z" fill="${INK}"/>
        ${mouth(58.6)}
        ${blush(55, 19)}`,
    },

    hochland: {
      label: 'Highland-Kuh', baby: 'Highland-Kälbchen',
      furs: [
        { name: 'rostrot', main: '#cf8152', fringe: '#b5683d', muzzle: '#e9b9a1' },
        { name: 'blond', main: '#e7bf85', fringe: '#d4a464', muzzle: '#f4d8c2' },
        { name: 'schoko', main: '#8a5a43', fringe: '#704532', muzzle: '#c9988a' },
        { name: 'creme', main: '#f1dfbf', fringe: '#e2c697', muzzle: '#f6dccf' },
      ],
      anchors: { hat: [20, 1.05], neck: [72, 28, 72], bow: [67, 26], flower: [32, 27] },
      draw: f => `
        <path d="M72 86 q12 0 12 -12" stroke="${f.main}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="84" cy="73" r="3.4" fill="${f.fringe}"/>
        ${body(f.main, f.fringe, '#6f5a52')}
        <path d="M30 30 q-10 -4 -8 -14 q4 6 11 8 z" fill="#f3e3bd" ${OL}/>
        <path d="M70 30 q10 -4 8 -14 q-4 6 -11 8 z" fill="#f3e3bd" ${OL}/>
        <ellipse cx="21" cy="45" rx="11" ry="6" transform="rotate(-20 21 45)" fill="${f.main}" ${OL}/>
        <ellipse cx="22" cy="45" rx="6" ry="3" transform="rotate(-20 22 45)" fill="${f.fringe}"/>
        <ellipse cx="79" cy="45" rx="11" ry="6" transform="rotate(20 79 45)" fill="${f.main}" ${OL}/>
        <ellipse cx="78" cy="45" rx="6" ry="3" transform="rotate(20 78 45)" fill="${f.fringe}"/>
        <circle cx="28" cy="57" r="8" fill="${f.main}" ${OL}/>
        <circle cx="72" cy="57" r="8" fill="${f.main}" ${OL}/>
        ${head(f.main, 49, 26)}
        <ellipse cx="50" cy="64" rx="14" ry="9" fill="${f.muzzle}"/>
        <ellipse cx="44.5" cy="64" rx="1.8" ry="2.4" fill="#a8746a"/>
        <ellipse cx="55.5" cy="64" rx="1.8" ry="2.4" fill="#a8746a"/>
        ${eyes(51, 10)}
        <path d="M24 46 Q22 26 40 22 Q50 16 60 22 Q78 26 76 46 Q72 52 68 46 Q64 54 59 47 Q55 55 50 48 Q45 55 41 47 Q36 54 32 46 Q28 52 24 46 Z" fill="${f.fringe}"/>
        <path d="M44 22 q2 -8 7 -6 q5 -5 7 3" stroke="${f.fringe}" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${blush(59, 20)}`,
    },

    ente: {
      label: 'Ente', baby: 'Entenküken',
      furs: [
        { name: 'sonnengelb', main: '#ffd84d', wing: '#f5c531' },
        { name: 'butterweich', main: '#ffe68f', wing: '#f7d466' },
        { name: 'aprikose', main: '#ffc86e', wing: '#f3b14e' },
      ],
      anchors: { hat: [23, 0.85], neck: [63, 31, 69], bow: [62, 28], flower: [37, 29] },
      draw: f => `
        <ellipse cx="40" cy="94" rx="7" ry="3.4" fill="#f59a3e"/>
        <ellipse cx="60" cy="94" rx="7" ry="3.4" fill="#f59a3e"/>
        <ellipse cx="50" cy="74" rx="26" ry="20" fill="${f.main}" ${OL}/>
        <ellipse cx="27" cy="74" rx="7" ry="11" transform="rotate(25 27 74)" fill="${f.wing}" ${OL}/>
        <ellipse cx="73" cy="74" rx="7" ry="11" transform="rotate(-25 73 74)" fill="${f.wing}" ${OL}/>
        <path d="M49 26 q-3 -9 3 -10 M51 26 q3 -8 9 -6" stroke="${f.main}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
        ${head(f.main, 45, 22)}
        ${eyes(44, 9)}
        <ellipse cx="50" cy="54.8" rx="6" ry="2.4" fill="#e07f2a"/>
        <ellipse cx="50" cy="52.5" rx="8.5" ry="3.6" fill="#f59a3e"/>
        ${blush(51, 15)}`,
    },
  };

  // ---------- Zubehör ----------
  const ACC_COLORS = ['#1e88e5', '#00a5a0', '#2e9e44', '#f2b01e', '#e8701a', '#1d3f9e', '#7cb342', '#b23a12'];

  const shade = (hex, f = 0.82) => {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(v * f));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  };

  const stitch = (x, y) => `M${x - 1.6} ${y} l1.6 2.2 l1.6 -2.2`;

  const ACCS = {
    keins: { label: 'ohne', draw: () => '' },
    muetze: {
      label: 'Häkelmütze', crochet: true,
      draw: (c, a) => {
        const [top, s] = a.hat;
        let st = '';
        [[17, 38, 62], [23, 32, 68], [29, 28, 72]].forEach(([y, x1, x2]) => {
          for (let x = x1; x <= x2; x += 6) st += stitch(x, y);
        });
        let rib = '';
        for (let x = 27; x <= 73; x += 3.5) rib += `M${x} 33.5 v5`;
        return `<g transform="translate(50 ${top}) scale(${s}) translate(-50 -21)">
          <path d="M25 37 Q24 12 50 11 Q76 12 75 37 Z" fill="${c}" ${OL}/>
          <path d="${st}" stroke="#fff" stroke-opacity=".55" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="24" y="32" width="52" height="8" rx="4" fill="${shade(c)}" ${OL}/>
          <path d="${rib}" stroke="#fff" stroke-opacity=".35" stroke-width="1" stroke-linecap="round"/>
          <circle cx="50" cy="10" r="5.5" fill="${c}" ${OL}/>
          <path d="M47.5 8.5 l1 1 M51 7.5 l1 1 M49.5 12 l1 1 M52.5 11 l1 1" stroke="#fff" stroke-opacity=".6" stroke-width="1" stroke-linecap="round"/>
        </g>`;
      },
    },
    schal: {
      label: 'Häkelschal', crochet: true,
      draw: (c, a) => {
        const [y, x1, x2] = a.neck;
        let st = '';
        for (let i = 1; i < 8; i++) {
          const t = i / 8;
          st += stitch(x1 + (x2 - x1) * t, y + 2 + 16 * t * (1 - t));
        }
        const fx = x2 - 14, fy = y + 9;
        return `
          <path d="M${fx} ${fy} l3 14 l7 -1.5 l-2 -13 Z" fill="${shade(c, .9)}" ${OL}/>
          <path d="M${fx + 3} ${fy + 14} l-.5 3.5 M${fx + 6.5} ${fy + 13.3} l0 3.5 M${fx + 9.5} ${fy + 12.6} l.5 3.5" stroke="${shade(c, .9)}" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M${x1} ${y} Q50 ${y + 8} ${x2} ${y} L${x2} ${y + 7} Q50 ${y + 15} ${x1} ${y + 7} Z" fill="${c}" ${OL}/>
          <path d="${st}" stroke="#fff" stroke-opacity=".6" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      },
    },
    haekelblume: {
      label: 'Häkelblume', crochet: true,
      draw: (c, a) => {
        const [x, y] = a.flower;
        let p = '';
        for (let i = 0; i < 5; i++) {
          const ang = (i * 72 - 90) * Math.PI / 180;
          const px = x + Math.cos(ang) * 4.8, py = y + Math.sin(ang) * 4.8;
          p += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.1" fill="${c}" ${OL}/>`;
          p += `<path d="M${(px - 1.6).toFixed(1)} ${(py + .2).toFixed(1)} q1.6 -2 3.2 0" stroke="#fff" stroke-opacity=".6" stroke-width=".9" fill="none"/>`;
        }
        return p + `<circle cx="${x}" cy="${y}" r="3.2" fill="#ffe08a" ${OL}/><circle cx="${x}" cy="${y}" r="1.4" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".8"/>`;
      },
    },
    schleife: {
      label: 'Schleife',
      draw: (c, a) => {
        const [x, y] = a.bow;
        return `<path d="M${x} ${y} l-9 -5.5 q-2 5.5 0 11 Z M${x} ${y} l9 -5.5 q2 5.5 0 11 Z" fill="${c}" ${OL} stroke-linejoin="round"/>
          <path d="M${x - 7} ${y - 2.5} q2 -1 3 .5 M${x + 4} ${y - 2} q2 -1.5 3 -.5" stroke="#fff" stroke-opacity=".7" stroke-width="1.1" fill="none" stroke-linecap="round"/>
          <circle cx="${x}" cy="${y}" r="2.6" fill="${shade(c)}" ${OL}/>`;
      },
    },
    bluemchen: {
      label: 'Gänseblümchen',
      draw: (c, a) => {
        const [x, y] = a.flower;
        let p = '';
        for (let i = 0; i < 8; i++) {
          p += `<ellipse cx="${x}" cy="${y - 4.6}" rx="1.9" ry="3.6" fill="#fff" stroke="rgba(58,51,71,.18)" stroke-width=".8" transform="rotate(${i * 45} ${x} ${y})"/>`;
        }
        return p + `<circle cx="${x}" cy="${y}" r="2.6" fill="#ffd34d"/>`;
      },
    },
    herz: {
      label: 'Herzchen',
      draw: (c, a) => {
        const [x, y] = a.bow;
        return `<path d="M${x} ${y + 5} C${x - 9} ${y - 1} ${x - 5} ${y - 8} ${x} ${y - 3} C${x + 5} ${y - 8} ${x + 9} ${y - 1} ${x} ${y + 5} Z" fill="${c}" ${OL}/>
          <path d="M${x - 4} ${y - 2.5} q1 -1.5 2.5 -1" stroke="#fff" stroke-opacity=".8" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
      },
    },
    halstuch: {
      label: 'Halstuch',
      draw: (c, a) => {
        const [y, x1, x2] = a.neck;
        return `<path d="M${x1 + 4} ${y} Q50 ${y + 6} ${x2 - 4} ${y} L50 ${y + 17} Z" fill="${c}" ${OL} stroke-linejoin="round"/>
          <circle cx="44" cy="${y + 5}" r="1.2" fill="#fff" opacity=".8"/><circle cx="56" cy="${y + 5}" r="1.2" fill="#fff" opacity=".8"/>
          <circle cx="50" cy="${y + 10}" r="1.2" fill="#fff" opacity=".8"/><circle cx="${x1 + 12}" cy="${y + 2.5}" r="1.1" fill="#fff" opacity=".8"/>
          <circle cx="${x2 - 12}" cy="${y + 2.5}" r="1.1" fill="#fff" opacity=".8"/>`;
      },
    },
    glocke: {
      label: 'Glöckchen',
      draw: (c, a) => {
        const [y, x1, x2] = a.neck;
        return `<path d="M${x1 + 3} ${y + 1} Q50 ${y + 8} ${x2 - 3} ${y + 1}" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
          <path d="M44.5 ${y + 12} q0 -7.5 5.5 -7.5 q5.5 0 5.5 7.5 z" fill="#f7cf5a" ${OL}/>
          <circle cx="50" cy="${y + 12.3}" r="1.6" fill="#c99a2e"/>
          <path d="M47.5 ${y + 7} q1 -1 2 -1" stroke="#fff" stroke-opacity=".8" stroke-width="1" fill="none" stroke-linecap="round"/>`;
      },
    },
  };

  const hold = a => a.hold || [50, 82];
  Object.assign(ACCS, {
    buch: {
      label: 'Buch 📖',
      draw: (c, a) => {
        const [x, y] = hold(a);
        return `<g transform="translate(${x} ${y})">
          <path d="M-13 -6 L0 -3 L13 -6 L13 7 L0 10 L-13 7 Z" fill="${c}" ${OL} stroke-linejoin="round"/>
          <path d="M-11 -4.5 L0 -1.8 V8 L-11 5.3 Z M11 -4.5 L0 -1.8 V8 L11 5.3 Z" fill="#fffaf0"/>
          <path d="M-9 -1.2 l7 1.7 M-9 2 l7 1.7 M9 -1.2 l-7 1.7 M9 2 l-7 1.7" stroke="${INK}" stroke-opacity=".25" stroke-width="1" stroke-linecap="round"/>
        </g>`;
      },
    },
    schoki: {
      label: 'Schokolade 🍫',
      draw: (c, a) => {
        const [x, y] = hold(a);
        return `<g transform="translate(${x} ${y}) rotate(-12)">
          <rect x="-8" y="-8" width="16" height="15" rx="1.6" fill="#7b4a32" ${OL}/>
          <path d="M-8 -3 h16 M0 -8 v6" stroke="#5c3424" stroke-width="1.2"/>
          <path d="M-5 -6.5 l2 0 M3 -6.5 l2 0" stroke="#a06a4c" stroke-width="1.2" stroke-linecap="round"/>
          <rect x="-8.8" y="0" width="17.6" height="8.5" rx="1.6" fill="${c}" ${OL}/>
          <path d="M-5 4 h10" stroke="#fff" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>
        </g>`;
      },
    },
  });
  KINDS.ente.anchors.hold = [50, 76];

  // Häkelsachen kommen etwas häufiger vor 🧶
  const ACC_POOL = ['keins', 'keins', 'muetze', 'muetze', 'schal', 'schal', 'haekelblume', 'haekelblume',
    'schleife', 'bluemchen', 'herz', 'halstuch', 'glocke', 'buch', 'buch', 'schoki', 'schoki'];

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  const firstKind = () => KINDS[Object.keys(KINDS)[0]];
  function randomLook(kind) {
    const k = KINDS[kind] || firstKind();
    return {
      fur: Math.floor(Math.random() * k.furs.length),
      stone: Math.floor(Math.random() * STONES.length),
      acc: pick(ACC_POOL),
      color: pick(ACC_COLORS),
    };
  }

  function draw(kind, look, opts = {}) {
    const k = KINDS[kind] || firstKind();   // unbekannte Art: erste Art der Edition als Ersatz
    const l = look || { fur: 0, acc: 'keins', color: ACC_COLORS[0] };
    const f = k.furs[l.fur] || k.furs[0];
    const acc = ACCS[l.acc] || ACCS.keins;
    const cls = opts.cls ? ` class="${opts.cls}"` : '';
    const title = opts.title ? `<title>${opts.title}</title>` : '';
    return `<svg${cls} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opts.title || k.baby}">${title}${k.draw(f, l)}${acc.draw(l.color, k.anchors)}</svg>`;
  }

  function egg(color = '#00a5a0') {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="50" cy="95" rx="22" ry="3.5" fill="#3a3347" opacity=".08"/>
      <path d="M50 8 C28 8 18 44 18 62 C18 82 32 94 50 94 C68 94 82 82 82 62 C82 44 72 8 50 8 Z" fill="#fffaf2" ${OL}/>
      <circle cx="38" cy="40" r="6" fill="${color}" opacity=".75"/>
      <circle cx="62" cy="58" r="8" fill="${color}" opacity=".75"/>
      <circle cx="40" cy="74" r="4.5" fill="${color}" opacity=".75"/>
      <circle cx="64" cy="30" r="3.5" fill="${color}" opacity=".75"/>
      <path class="crack" d="M22 56 l9 -6 l7 7 l8 -8 l8 8 l8 -7 l8 6 l8 -5" stroke="#3a3347" stroke-opacity=".5" stroke-width="1.8" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M34 20 q6 -6 12 -6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  // Nur süße Kosenamen – keine echten Vornamen, keine Gegenstände
  const NAMES = [
    'Krümel', 'Krümelchen', 'Mochi', 'Bohne', 'Böhnchen', 'Keks', 'Nugget', 'Muffin', 'Muffinchen', 'Erbse',
    'Erbschen', 'Tofu', 'Honig', 'Zimt', 'Zimtschnecke', 'Nudel', 'Pudding', 'Toffee', 'Kakao', 'Schoki',
    'Praline', 'Trüffel', 'Nougat', 'Karamell', 'Marzipan', 'Waffel', 'Plätzchen', 'Gummibärchen', 'Haselnuss', 'Haselnüsschen',
    'Mandel', 'Pistazie', 'Erdnuss', 'Bonbon', 'Knödel', 'Brezel', 'Vanille', 'Zuckerwatte', 'Marshmallow', 'Lebkuchen',
    'Kokos', 'Beere', 'Heidelbeere', 'Brombeere', 'Sesam', 'Kichererbse', 'Mohnschnecke', 'Zuckerschnute', 'Schokotröpfchen', 'Honigtöpfchen',
    'Pfannküchlein', 'Kekskrümel', 'Wuschel', 'Puschel', 'Flausch', 'Flauschi', 'Fussel', 'Bommel', 'Knuddel', 'Knuffel',
    'Kuschel', 'Schnuffel', 'Wusel', 'Purzel', 'Kuller', 'Tapsi', 'Hoppel', 'Pfötchen', 'Piepsi', 'Mümmel',
    'Mümmelchen', 'Flummi', 'Knöpfchen', 'Pünktchen', 'Tüpfelchen', 'Kringel', 'Schnupsi', 'Zottel', 'Fluffi', 'Stupsi',
    'Murmel', 'Klecks', 'Brummel', 'Pummel', 'Moppel', 'Muckel', 'Schnuckel', 'Plüschi', 'Strubbel', 'Löckchen',
    'Knirps', 'Wichtel', 'Schnurri', 'Wuffi', 'Bärli', 'Mausi', 'Piepmatz', 'Tüddel', 'Kuschelmuschel', 'Wackelpudding',
    'Purzelchen', 'Wölkchen', 'Flöckchen', 'Schneeflöckchen', 'Sternchen', 'Tröpfchen', 'Sprudel', 'Kieselchen', 'Moosi', 'Zapfi',
    'Pilzchen', 'Eichelchen', 'Butterblume', 'Hummel', 'Hummelchen', 'Kleeblatt', 'Gänseblümchen', 'Muschelchen', 'Perlchen', 'Glühwürmchen',
    'Marienkäferchen', 'Pusteblume', 'Herbstblättchen', 'Sonnenschein', 'Mondkind', 'Bücherwürmchen',
  ];

  /* ---------- Editionen ----------
     Eine Edition (window.EDITION, z. B. die Feen-Edition) kann Wesen, Zubehör, Farben, Namen und das Ei ersetzen.
     Ohne Edition bleibt alles wie oben definiert (Tier-Edition). */
  let eggFn = egg;
  const ED = window.EDITION;
  if (ED && ED.animals) {
    const H = { INK, OL, eyes, blush, mouth, body, head, STD, shade, stitch, hold };
    const e = ED.animals(H);
    if (e.kinds) { Object.keys(KINDS).forEach(k => delete KINDS[k]); Object.assign(KINDS, e.kinds); }
    if (e.accs) { Object.keys(ACCS).forEach(k => { if (k !== 'keins') delete ACCS[k]; }); Object.assign(ACCS, e.accs); }
    if (e.accPool) ACC_POOL.splice(0, ACC_POOL.length, ...e.accPool);
    if (e.accColors) ACC_COLORS.splice(0, ACC_COLORS.length, ...e.accColors);
    if (e.names) NAMES.splice(0, NAMES.length, ...e.names);
    if (e.egg) eggFn = e.egg;
  }

  window.Animals = { KINDS, ACCS, ACC_COLORS, STONES, draw, randomLook, egg: (...a) => eggFn(...a), NAMES, randomName: () => pick(NAMES) };
})();
