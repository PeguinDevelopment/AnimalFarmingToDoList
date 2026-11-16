(() => {
  'use strict';
  const A = window.Animals;
  const Wd = window.World;
  const KEY = 'pfoetchenplan-v1';
  const $ = s => document.querySelector(s);

  // ---------- Helfer ----------
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const MAX_VISIBLE = 6; // so viele offene Aufgaben pro Liste, der Rest ist eingeklappt
  const COLORS = ['#084a85', '#1e88e5', '#1d3f9e', '#00897b', '#0e9fb0', '#2e9e44', '#5f8f1a', '#d35400', '#b23a12', '#b8860b'];
  const THEMES = [
    { id: 'meer', name: 'Meer', a: '#cfe5f7', b: '#0b6fb8', meta: '#eef5fb' },
    { id: 'himmel', name: 'Himmel', a: '#cde4fb', b: '#1677d6', meta: '#edf6ff' },
    { id: 'gipfel', name: 'Gipfel', a: '#ffffff', b: '#1d3f9e', meta: '#f4f7fc' },
    { id: 'tuerkis', name: 'Türkis', a: '#c6ece9', b: '#00857f', meta: '#ebf8f7' },
    { id: 'wald', name: 'Wald', a: '#cdeccf', b: '#23843a', meta: '#eef7ee' },
    { id: 'herbst', name: 'Herbst', a: '#2e9e44', b: '#c44d12', meta: '#f3f6f1' },
    { id: 'sonne', name: 'Sonne', a: '#1e88e5', b: '#f0a500', meta: '#f2f7fb' },
    { id: 'nacht', name: 'Nacht', a: '#0d1a2e', b: '#3cc8e8', meta: '#0d1a2e' },
  ];
  const CHEERS = ['Geschafft! 🌿', 'Super gemacht! ✨', 'Ein Haken mehr 💛', 'Yay! 🎉', 'Jeder Haken zählt 🍀',
    'Stark! 💪', 'Das war ein Schritt nach vorn 🐾', 'Gut gemacht – auch kleine Dinge sind Dinge 💛',
    'Wieder ein Stück den Berg hoch ⛰️', 'Erledigt! Zeit für ein Stück Schokolade? 🍫'];
  const TAGLINES = ['Eins nach dem anderen. Du musst heute nicht alles schaffen.', 'Kleine Schritte zählen genauso.',
    'Such dir was Kleines aus – das reicht für den Anfang.', 'Pausen sind auch produktiv. 🌿',
    'Deine Tierchen freuen sich über jeden Haken.', 'Du machst das gut. Wirklich.',
    'Jeder Berg wird Schritt für Schritt bestiegen. ⛰️', 'Auch kleine Bäche werden zu Flüssen. 💧',
    'Ein Kapitel nach dem anderen. 📖', 'Kurz durchatmen wie im Wald. 🌲'];

  /* ---------- Zustand ----------
     Regeln, damit Backups & Erweiterungen nie etwas kaputt machen:
     1. Alles hängt an festen IDs (Tiere, Gadgets, Gebiete, Plätze) – nie an Positionen in Listen.
     2. Bei Änderungen am Datenformat SCHEMA erhöhen und in migrate() einen neuen Schritt ergänzen.
     3. Unbekannte Felder/IDs (z. B. aus einem Backup einer neueren Version) werden mitgespeichert,
        nur nicht angezeigt – nie gelöscht. */
  const SCHEMA = 2;
  const newMap = (name = 'Meine Wiese') => ({
    id: 'm' + uid(), name, createdAt: Date.now(), archived: false,
    unlocked: [...Wd.START_REGIONS],  // freigeschaltete Gebiete (IDs)
    slots: {},                        // Platz-ID → Gadget-ID
    finds: [],                        // Fundstücke {id, type, region, x, y}
    animalSpots: {},                  // Tier-ID → selbst gewählter Tierplatz (z. B. "wald:af3")
  });
  function defaultState() {
    const m = newMap();
    return {
      v: 1, schema: SCHEMA,
      categories: [
        { id: 'uni', name: 'Uni', color: '#084a85', animal: 'pinguin' },
        { id: 'therapie', name: 'Therapie', color: '#00897b', animal: 'steinbock' },
        { id: 'umzug', name: 'Umzug', color: '#d35400', animal: 'hochland' },
        { id: 'sonstiges', name: 'Sonstiges', color: '#2e9e44', animal: 'hund' },
        { id: 'vorlesung', name: 'In der Vorlesung', color: '#1d3f9e', animal: 'hase' },
      ],
      tasks: [],
      animals: [],
      progress: {},
      checks: 0,
      pebbles: 0,          // Kiesel – Währung für den Wiesen-Laden
      inv: {},             // gekaufte Gadgets: { id: Anzahl } – gehören der Person, nicht der Karte
      world: { active: m.id, maps: [m] },  // Karten (später archivierbar), eine ist aktiv
      daily: { last: null, days: 0, chests: 0 }, // Tagesgeschenk: gesammelte Tage bis zur Truhe (keine Serie nötig)
      vouchers: 0,         // Wunsch-Gutscheine aus der Schatztruhe
      settings: { appName: 'Plan', theme: 'meer', calm: false, size: 'm', perBaby: 3, collapsed: {}, showDone: {}, showMore: {}, impOpen: false, tipClosed: false, introSeen: false },
    };
  }
  // Schrittweise Umstellung alter Speicherstände/Backups auf das aktuelle Format
  const MIGRATIONS = {
    // 1 → 2: Wiese als „Karte“ mit Gebiets-IDs statt Positionsnummern
    2: s => {
      const ids = Wd.REGIONS.map(r => r.id);
      const m = newMap();
      if (typeof s.regions === 'number') m.unlocked = ids.slice(0, Math.max(4, s.regions));
      Object.entries(s.slots || {}).forEach(([k, g]) => {
        const old = /^r(\d+)([bfs]\d)$/.exec(k);
        m.slots[old && ids[+old[1]] ? `${ids[+old[1]]}:${old[2]}` : k] = g;
      });
      m.finds = (s.finds || []).map(f => f.region ? f : { ...f, region: ids[Math.floor((f.x || 0) / Wd.RW)] || ids[0], x: (f.x || 0) % Wd.RW });
      if (Array.isArray(s.owned)) s.inv = Object.fromEntries(s.owned.map(id => [id, 1]));
      delete s.regions; delete s.slots; delete s.finds; delete s.owned;
      s.world = s.world || { active: m.id, maps: [m] };
      return s;
    },
  };
  function migrate(s) {
    for (let v = (s.schema || 1) + 1; v <= SCHEMA; v++) if (MIGRATIONS[v]) s = MIGRATIONS[v](s);
    s.schema = Math.max(s.schema || 1, SCHEMA);
    const d = defaultState();
    const world = s.world && Array.isArray(s.world.maps) && s.world.maps.length ? s.world : d.world;
    world.maps = world.maps.map(m => ({ ...newMap(), ...m, slots: m.slots || {}, finds: m.finds || [], animalSpots: m.animalSpots || {}, unlocked: m.unlocked?.length ? m.unlocked : [...Wd.START_REGIONS] }));
    if (!world.maps.some(m => m.id === world.active)) world.active = world.maps[0].id;
    return {
      ...d, ...s, world,
      settings: (st => ({ ...st, theme: THEMES.some(t => t.id === st.theme) ? st.theme : 'meer' }))({ ...d.settings, ...(s.settings || {}) }),
      progress: s.progress || {},
      animals: (s.animals || []).map(a => a.kind === 'kuh' ? { ...a, kind: 'hochland', look: { ...a.look, fur: 0 } } : a),
      checks: s.checks ?? (s.tasks || []).reduce((n, t) => n + (t.rewarded ? 1 : 0) + (t.subtasks || []).filter(x => x.rewarded).length, 0),
      pebbles: s.pebbles ?? s.checks ?? 0,
      inv: s.inv || {},
      tasks: (s.tasks || []).map(t => ({ subtasks: [], note: '', ...t })),
      categories: (s.categories && s.categories.length ? s.categories : d.categories)
        .map(c => c.color === '#0b6fb8' ? { ...c, color: '#084a85' } : c) // altes Uni-Blau → dunkler
        .map(c => {
          // Alte Standard-Tiere auf die neue Reihenfolge umstellen – nur wenn nie selbst geändert
          const OLD = { therapie: 'hase', umzug: 'hund', sonstiges: 'katze', vorlesung: 'pferd' };
          const NEW = { therapie: 'steinbock', umzug: 'hochland', sonstiges: 'hund', vorlesung: 'hase' };
          if (OLD[c.id] && (c.animal === OLD[c.id] || c.animal === 'kuh')) return { ...c, animal: NEW[c.id] };
          return c; // unbekannte Tiere bleiben gespeichert, angezeigt wird ersatzweise der Pinguin
        }),
    };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v === 1) return migrate(s);
    } catch (e) { /* frischer Start */ }
    return defaultState();
  }
  // Repariert Zählerstände (z. B. nach manuell bearbeiteten Backups): nie negativ, nie NaN
  function sanitizeRewards(s) {
    const n = v => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0);
    Object.keys(s.progress || {}).forEach(k => { s.progress[k] = n(s.progress[k]); });
    s.pebbles = n(s.pebbles); s.checks = n(s.checks); s.vouchers = n(s.vouchers);
    s.tasks.forEach(t => {
      if (t.done && !t.rewarded && t.doneAt == null) t.rewarded = true;          // alte Daten: erledigt = schon belohnt
      (t.subtasks || []).forEach(x => { if (x.done && x.rewarded == null) x.rewarded = true; });
    });
    return s;
  }
  let state = sanitizeRewards(load());
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { toast('Speichern hat nicht geklappt 😕'); }
  }

  const ui = { view: 'heute', sheet: null, overlay: null, focus: null, timer: null, addDraft: '', addCat: null, addImp: false, addToday: false, confirm: null, refocus: null,
    edit: false, placing: null, worldX: 0, shopGroup: 'land' };

  const catById = id => state.categories.find(c => c.id === id);
  const taskById = id => state.tasks.find(t => t.id === id);
  const kindOf = cat => A.KINDS[cat?.animal] || A.KINDS.pinguin;
  const latestOfKind = kind => [...state.animals].reverse().find(a => a.kind === kind);
  const mini = (kind, look) => A.draw(kind, look || { fur: 0, acc: 'keins' });

  // ---------- Wiese: Inventar ----------
  const ownedLand = () => Object.keys(state.inv).filter(id => Wd.byId[id]?.group === 'land' && state.inv[id] > 0);
  const curMap = () => state.world.maps.find(m => m.id === state.world.active) || state.world.maps[0];
  // Gadgets auf allen Karten (auch archivierten) zählen als „verbaut“
  const placedCount = gid => state.world.maps.reduce((n, m) => n + Object.values(m.slots).filter(x => x === gid).length, 0);
  const available = gid => (state.inv[gid] || 0) - placedCount(gid);
  const openCount = () => curMap().unlocked.filter(id => Wd.regionById[id]).length;
  const shownRegions = () => {
    const open = Wd.REGIONS.filter(r => curMap().unlocked.includes(r.id));
    const next = Wd.nextRegion(curMap().unlocked);
    return next ? [...open, next] : open;
  };
  // Bezahlen: mit Kieseln oder mit einem Wunsch-Gutschein
  function pay(price, voucher) {
    if (voucher) { if ((state.vouchers || 0) < 1) return false; state.vouchers--; return true; }
    if ((state.pebbles || 0) < price) return false;
    state.pebbles -= price; return true;
  }
  function doUnlock(voucher) {
    const m = curMap(), next = Wd.nextRegion(m.unlocked);
    if (!next) return;
    if (!pay(Wd.regionPrice(openCount()), voucher)) return;
    m.unlocked.push(next.id);
    save();
    if (ui.sheet) closeSheet();
    ui.view = 'tiere'; render();
    scrollWorldTo(next.id, true);
    toast(`Neues Gebiet entdeckt: ${next.name}! 🗺️`);
  }
  function purchase(voucher) {
    const arg = ui.sheet?.arg;
    if (!arg) return;
    if (arg.kind === 'region') { doUnlock(voucher); return; }
    const g = Wd.byId[arg.id];
    if (!g || g.premium) return;
    if (g.group === 'land' && state.inv[g.id]) return;
    if (!pay(g.price, voucher)) return;
    state.inv[g.id] = (state.inv[g.id] || 0) + 1;
    save();
    if (g.group === 'land') { closeSheet(); toast(`${g.name} ist jetzt auf deiner Karte! 🏞️`); return; }
    startPlacing(g.id);
    toast(`${g.name} ${voucher ? 'mit Gutschein geholt' : 'gekauft'}! Tippe auf einen ${g.sky ? '✨ Himmelsplatz' : 'freien Platz'}.`);
  }

  // ---------- Einführung (beim ersten Öffnen; im Karo-Heft-Stil) ----------
  const miniRow = (title, cls, sub) => `<div class="task ${cls}" style="--cat:#084a85">
    <span class="check" aria-hidden="true">${CHECK}</span>
    <span class="task-main"><span class="task-title"><span class="hl">${title}</span></span>${sub || ''}</span></div>`;
  const INTRO = [
    { title: 'Willkommen bei Plan', art: () => `<div class="intro-art big">${A.draw('pinguin', { fur: 0, acc: 'muetze', color: '#00a5a0' })}</div>`,
      points: ['Deine To-do-Liste: <mark>ruhig, übersichtlich</mark> und mit Babytieren.', 'Auf den nächsten Seiten siehst du kurz, was die App kann.', 'Du kannst jederzeit auf <b>Überspringen</b> tippen.'] },
    { title: 'Aufgaben eintragen', art: () => `<div class="intro-art list">
        ${miniRow('Literatur lesen', 'is-imp')}${miniRow('Mail schreiben', 'is-done')}
        ${miniRow('Kisten packen', '', '<span class="task-sub"><span class="mini-bar"><i style="width:50%"></i></span>2/4 Schritte</span>')}</div>`,
      points: ['Listen wie <b>Uni</b> oder <b>Umzug</b>, jede mit eigener Farbe.', '<mark>Wichtig</mark> wird gelb markiert, <mark class="g">erledigt</mark> grün.', 'Große Aufgaben teilst du in <b>kleine Schritte</b>. Jeder Schritt zählt.'] },
    { title: 'Für heute', art: () => `<div class="intro-art list">
        <p class="intro-label">☀️ Für heute</p>${miniRow('Fragebogen ausfüllen', 'is-imp')}${miniRow('Wäsche waschen', '')}
        <div class="intro-btn">🎯 Mit einer Sache anfangen</div></div>`,
      points: ['Such dir <mark>1 bis 3 Sachen</mark> für heute aus. Mehr musst du nicht.', '<b>Eine Sache</b> zeigt dir nur eine einzige Aufgabe.', '<b>5 Minuten anfangen</b> hilft, wenn der Start schwerfällt.'] },
    { title: 'Babytiere', art: () => `<div class="intro-art row"><div class="intro-egg">${A.egg('#00a5a0')}</div><span class="intro-arrow">→</span><div class="intro-egg">${A.draw('steinbock', { fur: 0, acc: 'schal', color: '#1e88e5' })}</div></div>`,
      points: ['Jeder Haken zählt. Nach <mark>3 Haken</mark> schlüpft ein Babytier.', 'Du gibst ihm einen Namen und suchst ihm einen Platz aus.', 'Tiere gehen <b>nie</b> verloren.'] },
    { title: 'Deine Tierwiese', art: () => `<div class="intro-art map">${Wd.regionPreview('wald', [])}</div>`,
      points: ['Jeder Haken bringt dir <mark>1 🪨 Kiesel</mark>.', 'Damit schaltest du neue Gebiete frei und holst dir Bäume, Brunnen und Sternbilder.', 'Vor jedem Kauf siehst du eine Vorschau und den Preis.'] },
    { title: 'Jeden Tag ein Geschenk', art: () => `<div class="intro-art row"><span class="intro-pebbles">🪨 +2</span><span class="intro-arrow">…</span><div class="intro-chest">${Wd.chest(false)}</div></div>`,
      points: ['Beim ersten Öffnen am Tag bekommst du <mark>Kiesel geschenkt</mark>.', 'Nach 7 Tagen gibt es eine <b>Schatztruhe</b>.', 'Die Tage müssen nicht hintereinander sein. Pausen sind okay.'] },
    { title: 'So, wie es dir guttut', art: () => `<div class="intro-art row swatches-row">${THEMES.slice(0, 6).map(t => `<i style="--a:${t.a};--b:${t.b}"></i>`).join('')}</div>`,
      points: ['In den <b>Einstellungen</b> wählst du Farben, Textgröße und den Ruhemodus.', 'Kein Druck: keine Fristen, keine Serien, die abreißen.', 'Mach ab und zu ein <mark>Backup</mark>. 💾'] },
  ];
  function showIntro(page = 0) {
    ui.introPage = Math.max(0, Math.min(INTRO.length - 1, page));
    const p = INTRO[ui.introPage], last = ui.introPage === INTRO.length - 1, el = $('#intro');
    el.hidden = false;
    el.innerHTML = `<div class="intro-wrap">
      <div class="intro-top"><span class="muted">${ui.introPage + 1} von ${INTRO.length}</span>
        ${last ? '' : '<button class="link" data-action="intro-done">Überspringen</button>'}</div>
      <article class="intro-page" aria-live="polite">
        <div class="intro-head"><h1>${p.title}</h1><div class="checker"></div></div>
        ${p.art()}
        <ul class="intro-points">${p.points.map(x => `<li>${x}</li>`).join('')}</ul>
      </article>
      <div class="intro-dots" aria-hidden="true">${INTRO.map((_, i) => `<span class="${i === ui.introPage ? 'on' : ''}"></span>`).join('')}</div>
      <div class="intro-nav">
        ${ui.introPage ? '<button class="big-btn" data-action="intro-prev">← Zurück</button>' : '<span></span>'}
        <button class="big-btn primary" data-action="${last ? 'intro-done' : 'intro-next'}">${last ? 'Los geht\'s! 🐾' : 'Weiter →'}</button>
      </div></div>`;
  }
  function closeIntro() {
    state.settings.introSeen = true; save();
    const el = $('#intro'); el.hidden = true; el.innerHTML = '';
    render();
    setTimeout(() => { if (pendingHatches().length) showNextHatch(); else checkDaily(); }, 250);
  }
  // Wischen in der Einführung
  let introX = null;
  document.addEventListener('touchstart', ev => { if (ev.target.closest('#intro')) introX = ev.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', ev => {
    if (introX == null || $('#intro').hidden) return;
    const dx = ev.changedTouches[0].clientX - introX; introX = null;
    if (Math.abs(dx) > 60) showIntro(ui.introPage + (dx < 0 ? 1 : -1));
  });

  // ---------- Tagesgeschenk & Schatztruhe ----------
  // Ein „Geschenk-Tag“ beginnt um 6 Uhr – nach Mitternacht zählt noch der alte Tag.
  const GIFT_AMOUNTS = [2, 2, 3, 3, 4, 4];             // Tag 1–6, Tag 7 = Truhe
  // Eigene kleine Symbole statt Emojis (die sind auf dem iPhone rot/rosa)
  const ICON_CHEST = `<svg class="ico" viewBox="-44 -40 88 68" aria-hidden="true"><rect x="-40" y="-12" width="80" height="36" rx="5" fill="#a0694a"/><rect x="-40" y="-12" width="8" height="36" fill="#f2b01e"/><rect x="32" y="-12" width="8" height="36" fill="#f2b01e"/><path d="M-42 -12 Q0 -44 42 -12 Z" fill="#8a5236"/><path d="M-42 -12 Q0 -44 42 -12" stroke="#f2b01e" stroke-width="5" fill="none"/><rect x="-7" y="-18" width="14" height="16" rx="3" fill="#f2b01e"/></svg>`;
  const ICON_TICKET = `<svg class="ico" viewBox="0 0 40 26" aria-hidden="true"><path d="M3 3 H37 V9 a4 4 0 0 0 0 8 V23 H3 V17 a4 4 0 0 0 0 -8 Z" fill="#f2b01e"/><path d="M27 4 V22" stroke="#fff" stroke-width="1.6" stroke-dasharray="2.4 2"/><path d="M10 13 l2.4 -5 l2.4 5 l-2.4 5 Z" fill="#fff"/></svg>`;
  const giftDay = () => dayKey(Date.now() - 6 * 3600e3);
  function checkDaily() {
    if (state.daily.last === giftDay()) return;
    if (!$('#intro').hidden || !state.settings.introSeen) return;
    if (!$('#hatch').hidden || pendingHatches().length || !$('#gift').hidden) return;
    showGift();
  }
  function showGift(opened) {
    const d = state.daily, n = d.days % 7, isChest = n === 6, el = $('#gift');
    el.hidden = false;
    if (opened) {
      const free = Wd.GADGETS.filter(g => g.premium && !state.inv[g.id]);
      if (!ui.giftPrem || !free.some(g => g.id === ui.giftPrem)) ui.giftPrem = free.length ? pick(free).id : null;
      const prem = ui.giftPrem && Wd.byId[ui.giftPrem];
      el.innerHTML = `<div class="ov-inner gift">
        <div class="chest-box open">${Wd.chest(true)}</div>
        <h2 class="center">Die Schatztruhe ist offen! ✨</h2>
        <p class="center muted">Such dir aus, was du möchtest:</p>
        <button class="gift-choice" data-action="gift-pick" data-k="voucher">
          <span class="gc-icon">${ICON_TICKET}</span><span><b>Wunsch-Gutschein</b><small>Ein Teil oder ein neues Gebiet aus dem Laden – gratis, egal wie teuer.</small></span></button>
        ${prem ? `<button class="gift-choice" data-action="gift-pick" data-k="premium">
          <span class="gc-sky">${Wd.preview(prem.id)}</span><span><b>${esc(prem.name)}</b><small>Exklusiv – gibt es nur in der Schatztruhe. Für deinen Himmel.</small></span></button>` : ''}
      </div>`;
      return;
    }
    const cells = [...Array(7)].map((_, i) => `<div class="gift-cell ${i < n ? 'done' : ''} ${i === n ? 'today' : ''}">
      <span>${i === 6 ? ICON_CHEST : '🪨'}</span><b>${i === 6 ? 'Truhe' : '+' + GIFT_AMOUNTS[i]}</b><small>Tag ${i + 1}</small></div>`).join('');
    el.innerHTML = `<div class="ov-inner gift">
      <h2 class="center">${isChest ? 'Heute gibt es die Schatztruhe! ✨' : 'Dein Tagesgeschenk 🎁'}</h2>
      <p class="center muted">Schön, dass du da bist. 💛</p>
      <div class="gift-row">${cells}</div>
      <div class="gift-big">${isChest ? `<div class="chest-box">${Wd.chest(false)}</div>` : `<span class="pebble-pop">🪨 +${GIFT_AMOUNTS[n]}</span>`}</div>
      <p class="hint center">Komm an 7 Tagen vorbei – egal ob hintereinander oder mit Pausen. Dann öffnest du eine Schatztruhe.</p>
      <button class="big-btn primary" data-action="gift-claim">${isChest ? 'Schatztruhe öffnen' : 'Einsammeln'}</button>
    </div>`;
  }
  function closeGift() { const el = $('#gift'); el.hidden = true; el.innerHTML = ''; render(); }

  function startPlacing(gid) {
    ui.placing = gid; ui.edit = true;
    if (ui.sheet) { ui.sheet = null; $('#sheet-layer').hidden = true; }
    ui.view = 'tiere';
    render();
  }
  // Zu einem Gebiet scrollen (über die Kachel-Position, nicht über feste Pixel)
  // (SVG-Elemente haben kein offsetLeft – deshalb über getBoundingClientRect)
  function scrollWorldTo(regionId, smooth) {
    const wrap = $('#world-wrap'), tile = wrap && wrap.querySelector(`.w-region[data-r="${regionId}"]`);
    if (!tile) return;
    const t = tile.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    const x = Math.max(0, wrap.scrollLeft + (t.left - w.left) - (w.width - t.width) / 2);
    wrap.scrollTo({ left: x, behavior: smooth && !state.settings.calm ? 'smooth' : 'auto' });
    ui.worldX = x;
    markRegionChip(regionId);
  }
  // Knopf des Gebiets hervorheben, das gerade in der Mitte der Karte ist
  function markRegionChip(id) {
    document.querySelectorAll('.rchip').forEach(b => b.classList.toggle('on', b.dataset.r === id));
    const on = document.querySelector('.rchip.on');
    if (on) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function regionInView() {
    const wrap = $('#world-wrap');
    if (!wrap) return null;
    const mid = wrap.getBoundingClientRect().left + wrap.clientWidth / 2;
    const tile = [...wrap.querySelectorAll('.w-region')].find(t => { const r = t.getBoundingClientRect(); return r.left <= mid && r.right >= mid; });
    return tile ? tile.dataset.r : null;
  }

  /* ---------- Belohnungen ----------
     Absicherung (wichtig!):
     - Jede Aufgabe / jeder Mini-Schritt gibt nur beim ERSTEN Abhaken einen Punkt (Merker „rewarded“).
       Ent-abhaken nimmt nichts weg, erneutes Abhaken gibt nichts doppelt.
     - „Rückgängig“ stellt den alten Stand her, aber ein schon geschlüpftes Tier wird NIE entfernt.
     - Kaputte Zählerstände werden beim Laden repariert (sanitizeRewards). */
  function restore(snap) {
    const keep = state.animals.filter(a => !snap.animals.some(b => b.id === a.id));
    state = snap;
    if (keep.length) state.animals.push(...keep);
    save(); refresh();
  }
  function award(catId) {
    const cat = catById(catId);
    if (!cat) return null;
    state.checks = (state.checks || 0) + 1;
    state.pebbles = (state.pebbles || 0) + 1;
    // Ab und zu ein Fundstück auf der Wiese
    if (Math.random() < .12) {
      const f = Wd.randomFind(curMap().unlocked);
      curMap().finds.push({ id: uid(), type: f.type, region: f.region, x: f.x, y: f.y });
      ui.unlock = `Fundstück! ${f.name.charAt(0).toUpperCase() + f.name.slice(1)} liegt jetzt auf deiner Wiese 🔍`;
    }
    state.progress[catId] = (state.progress[catId] || 0) + 1;
    if (state.progress[catId] >= state.settings.perBaby) {
      state.progress[catId] = 0;
      const a = { id: uid(), kind: cat.animal, look: A.randomLook(cat.animal), name: A.randomName(), catName: cat.name, bornAt: Date.now() };
      state.animals.push(a);
      a.welcomed = false;    // → Schlüpf-Fenster ist fällig
      return a;
    }
    return null;
  }

  function completeTask(t) {
    t.done = true; t.doneAt = Date.now();
    let hatched = null;
    if (!t.rewarded) { t.rewarded = true; hatched = award(t.catId); }
    return hatched;
  }

  function toggleTask(id, ev) {
    const t = taskById(id); if (!t) return;
    const snap = clone(state);
    if (t.done) {
      t.done = false; t.doneAt = null;
      save(); refresh();
      toast('Wieder offen – kein Problem.');
      return;
    }
    const hatched = completeTask(t);
    save(); refresh();
    celebrate(ev);
    if (hatched) showNextHatch();
    else toast(cheer(), () => { restore(snap); });
  }

  function cheer(fallback) {
    if (ui.unlock) { const n = ui.unlock; ui.unlock = null; return n; }
    return fallback || pick(CHEERS);
  }

  function toggleSub(taskId, subId, ev) {
    const t = taskById(taskId); if (!t) return;
    const s = t.subtasks.find(x => x.id === subId); if (!s) return;
    const snap = clone(state);
    s.done = !s.done;
    let hatched = null, autoDone = false;
    if (s.done) {
      s.doneAt = Date.now();
      if (!s.rewarded) { s.rewarded = true; hatched = award(t.catId); }
      if (!t.done && t.subtasks.every(x => x.done)) { hatched = completeTask(t) || hatched; autoDone = true; }
      celebrate(ev);
    }
    save(); refresh();
    if (hatched) showNextHatch();
    else if (s.done) toast(cheer(autoDone ? 'Alle Schritte geschafft – Aufgabe erledigt! 🎉' : 'Mini-Schritt geschafft 🐾'),() => { restore(snap); });
  }

  // ---------- Rendering ----------
  function applySettings() {
    const s = state.settings, root = document.documentElement;
    root.dataset.theme = s.theme;
    root.dataset.size = s.size;
    document.body.classList.toggle('calm', !!s.calm);
    const th = THEMES.find(t => t.id === s.theme) || THEMES[0];
    document.querySelector('meta[name="theme-color"]').setAttribute('content', th.meta);
    document.title = s.appName || 'Plan';
  }

  function renderTop() {
    const date = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#top').innerHTML = `<span class="brand-name">${esc(state.settings.appName || 'Plan')}</span><span class="brand-date">${esc(date)}</span>`;
    let ch = document.querySelector('.checker');
    if (!ch) { ch = document.createElement('div'); ch.className = 'checker'; $('#top').after(ch); }
  }

  function taskRow(t, opts = {}) {
    const cat = catById(t.catId) || {};
    const subs = t.subtasks || [];
    const sd = subs.filter(s => s.done).length;
    return `<div class="task ${t.done ? 'is-done' : ''} ${t.important ? 'is-imp' : ''}" style="--cat:${cat.color}">
      <button class="check" data-action="toggle" data-id="${t.id}" aria-label="${t.done ? 'Wieder öffnen' : 'Abhaken'}: ${esc(t.title)}">${CHECK}</button>
      <button class="task-main" data-action="open-task" data-id="${t.id}">
        <span class="task-title"><span class="hl">${esc(t.title)}</span></span>
        ${opts.showCat ? `<span class="task-cat">${esc(cat.name)}</span>` : ''}
        ${subs.length ? `<span class="task-sub"><span class="mini-bar"><i style="width:${Math.round(sd / subs.length * 100)}%"></i></span>${sd}/${subs.length} Schritte</span>` : ''}
      </button>
      ${t.today && !t.done && !opts.showCat ? '<span class="sun" title="Für heute">☀️</span>' : ''}
      ${opts.showCat ? `<span class="row-animal" title="${esc(kindOf(cat).baby)}">${mini(cat.animal, latestOfKind(cat.animal)?.look)}</span>` : ''}
    </div>`;
  }

  function paws(catId) {
    const n = state.settings.perBaby, p = state.progress[catId] || 0;
    let h = '';
    for (let i = 0; i < n; i++) h += `<span class="paw ${i < p ? 'on' : ''}"></span>`;
    return h;
  }

  function nextBabyText(cat) {
    const left = state.settings.perBaby - (state.progress[cat.id] || 0);
    return `noch ${left}× abhaken bis zum nächsten ${kindOf(cat).baby}`;
  }

  function viewHeute() {
    const h = new Date().getHours();
    const greet = h < 5 ? 'Hallo, Nachteule' : h < 11 ? 'Guten Morgen' : h < 17 ? 'Hallo du' : h < 22 ? 'Guten Abend' : 'Hallo, Nachteule';
    const last = state.animals[state.animals.length - 1];
    const mascot = last ? A.draw(last.kind, last.look) : A.draw('pinguin', { fur: 0, acc: 'muetze', color: '#00a5a0' });
    const tk = dayKey();
    const doneToday = state.tasks.reduce((n, t) => n + (t.done && t.doneAt && dayKey(t.doneAt) === tk ? 1 : 0)
      + (t.subtasks || []).filter(s => s.done && s.doneAt && dayKey(s.doneAt) === tk).length, 0);
    const todayOpen = state.tasks.filter(t => t.today && !t.done);
    const todayDone = state.tasks.filter(t => t.today && t.done && t.doneAt && dayKey(t.doneAt) === tk).length;
    const imp = state.tasks.filter(t => t.important && !t.done && !t.today);
    const impOpen = !!state.settings.impOpen;
    // Spruch wechselt nur einmal am Tag, nicht bei jedem Antippen
    const dayNum = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 864e5);
    const tagline = TAGLINES[dayNum % TAGLINES.length];

    // Kategorie, die dem nächsten Tier am nächsten ist
    let best = null;
    state.categories.forEach(c => {
      const p = state.progress[c.id] || 0;
      if (!best || p > (state.progress[best.id] || 0)) best = c;
    });

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;

    return `
      ${isIOS && !standalone && !state.settings.tipClosed ? `<div class="card install-tip">
        <b>Tipp:</b> Tippe unten in Safari auf <b>Teilen</b> (□↑) und dann auf <b>„Zum Home-Bildschirm“</b> – dann ist die App wie eine richtige App da. 📲
        <button class="x" data-action="close-tip" aria-label="Tipp schließen">✕</button></div>` : ''}
      <section class="hello">
        <div class="mascot">${mascot}</div>
        <div><h1>${greet}</h1><p class="muted">${esc(tagline)}</p></div>
      </section>

      <div class="sec-head"><h2>☀️ Für heute</h2>${todayOpen.length ? '<button class="link" data-action="pick-today">ändern</button>' : ''}</div>
      ${todayOpen.length ? `<div class="card list-card">${todayOpen.map(t => taskRow(t, { showCat: true })).join('')}</div>`
        : `<div class="card empty">
            <p>${todayDone ? 'Alles für heute geschafft. 🎉<br>Du darfst jetzt Pause machen.' : 'Such dir 1–3 Sachen für heute aus.<br>Mehr musst du nicht.'}</p>
            <button class="big-btn soft" data-action="pick-today">${todayDone ? '☀️ Noch etwas aussuchen' : '☀️ Für heute aussuchen'}</button>
            ${!todayDone && state.tasks.some(t => !t.done) ? '<button class="link" data-action="focus">Oder: 🎯 Gib mir einfach eine Sache</button>' : ''}</div>`}
      ${todayOpen.length ? '<button class="big-btn primary" data-action="focus">🎯 Mit einer Sache anfangen</button>' : ''}

      <div class="quiet-line">
        <span>✓ <b>${doneToday}</b> heute geschafft</span>
        ${best ? `<span class="quiet-paws" style="--cat:${best.color}" title="${esc(nextBabyText(best))}">${mini(best.animal)}${paws(best.id)}</span>` : ''}
      </div>

      ${imp.length ? `<button class="fold-btn" data-action="imp-open" aria-expanded="${impOpen}">
          <span>💛 Wichtig</span><span class="muted">${imp.length} ${impOpen ? '▾' : '▸'}</span></button>
        ${impOpen ? `<div class="card list-card">${imp.slice(0, state.settings.impAll ? imp.length : MAX_VISIBLE).map(t => taskRow(t, { showCat: true })).join('')}
          ${imp.length > MAX_VISIBLE ? `<button class="more-btn" data-action="imp-all">
            ${state.settings.impAll ? 'Weniger anzeigen ▴' : `${imp.length - MAX_VISIBLE} weitere anzeigen ▾`}</button>` : ''}</div>` : ''}` : ''}
    `;
  }

  function viewListen() {
    const s = state.settings;
    return `
      <button class="big-btn primary" data-action="add">＋ Aufgaben eintragen</button>
      ${state.categories.map(c => {
        const open = state.tasks.filter(t => t.catId === c.id && !t.done);
        const done = state.tasks.filter(t => t.catId === c.id && t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
        const col = s.collapsed[c.id];
        const last = latestOfKind(c.animal);
        return `<section class="cat ${col ? 'collapsed' : ''}" style="--cat:${c.color}">
          <button class="cat-head" data-action="collapse" data-cat="${c.id}" aria-expanded="${!col}">
            <span class="cat-animal">${mini(c.animal, last?.look)}</span>
            <span class="cat-name">${esc(c.name)}</span>
            <span class="cat-count">${open.length} offen</span><span class="chev">▾</span>
          </button>
          ${col ? '' : `<div class="cat-body">
            <div class="paws">${paws(c.id)} <span>${esc(nextBabyText(c))}</span></div>
            ${open.slice(0, s.showMore[c.id] ? open.length : MAX_VISIBLE).map(t => taskRow(t)).join('')}
            ${open.length > MAX_VISIBLE ? `<button class="more-btn" data-action="show-more" data-cat="${c.id}">
              ${s.showMore[c.id] ? 'Weniger anzeigen ▴' : `${open.length - MAX_VISIBLE} weitere anzeigen ▾`}</button>` : ''}
            <form class="quick" data-form="quick" data-cat="${c.id}">
              <input type="text" name="t" data-key="quick-${c.id}" placeholder="+ Aufgabe hinzufügen" enterkeyhint="done" autocomplete="off" aria-label="Neue Aufgabe in ${esc(c.name)}">
            </form>
            ${done.length ? `<button class="done-toggle" data-action="show-done" data-cat="${c.id}">✓ ${done.length} geschafft ${s.showDone[c.id] ? '▾' : '▸'}</button>
              ${s.showDone[c.id] ? done.map(t => taskRow(t)).join('') : ''}` : ''}
          </div>`}
        </section>`;
      }).join('')}
      <button class="ghost-btn" data-action="new-cat">＋ Neue Kategorie</button>`;
  }

  function viewTiere() {
    const kinds = Object.keys(A.KINDS);
    const counts = {};
    state.animals.forEach(a => counts[a.kind] = (counts[a.kind] || 0) + 1);
    const animals = [...state.animals].reverse();
    return `
      <h1 class="view-title">Tierwiese ⛰️</h1>
      <div class="world-bar">
        <span class="pebbles" aria-label="${state.pebbles || 0} Kiesel">🪨 <b>${state.pebbles || 0}</b></span>
        <button class="pebbles" data-action="gift-info" aria-label="Tage bis zur Schatztruhe">🎁 <b>${state.daily.days % 7}/7</b></button>
        ${state.vouchers > 0 ? `<span class="pebbles" aria-label="${state.vouchers} Wunsch-Gutscheine">${ICON_TICKET} <b>${state.vouchers}</b></span>` : ''}
        <button class="pill" data-action="shop">🛍️ Laden</button>
        <button class="pill ${ui.edit ? 'on' : ''}" data-action="w-edit">${ui.edit ? '✓ Fertig' : '✏️ Gestalten'}</button>
      </div>
      ${ui.moving ? (() => {
        const ma = state.animals.find(x => x.id === ui.moving);
        return `<div class="place-banner move">
          <div><b>Tippe auf einen 🐾-Platz für ${esc(ma?.name || '')}.</b><br>
          <small>Steht dort schon ein Tier, tauschen die beiden ihre Plätze. Wischen zeigt weitere Gebiete.</small></div>
          <button class="link" data-action="move-cancel">Abbrechen</button></div>`;
      })() : ''}
      ${ui.placing ? `<div class="place-banner">Tippe auf einen ${Wd.byId[ui.placing]?.sky ? '✨ Himmelsplatz' : 'freien Platz'} für <b>${esc(Wd.byId[ui.placing]?.name || '')}</b>
        <button class="link" data-action="place-cancel">Abbrechen</button></div>` : ''}
      <div class="world-wrap" id="world-wrap">${Wd.world({
        map: curMap(), owned: ownedLand(),
        edit: ui.edit, placing: ui.placing, moving: ui.moving, animals: state.animals.map(a => ({ id: a.id, svg: A.draw(a.kind, a.look) })),
      })}</div>
      <div class="region-chips">${shownRegions().map(g => {
        const locked = !curMap().unlocked.includes(g.id);
        return `<button class="rchip ${locked ? 'locked' : ''}" data-action="w-go" data-r="${g.id}">${locked ? '🔒 ' : ''}${esc(g.name)}</button>`;
      }).join('')}</div>
      <p class="hint" style="margin:6px 4px 12px">← Wischen zum Erkunden · Tiere antippen · ${openCount()}/${Wd.REGIONS.length} Gebiete offen</p>
      ${(() => {
        const over = state.animals.length - Wd.animalCapacity(openCount());
        return over > 0 ? `<p class="hint" style="margin:-6px 4px 12px">🏡 ${over} Babytier${over > 1 ? 'e kuscheln' : ' kuschelt'} gerade im Tierhaus. Mit jedem neuen Gebiet gibt es ${Wd.SPOTS_PER_REGION} Plätze mehr auf der Wiese.</p>` : '';
      })()}
      <p class="muted" style="margin:0 4px 14px">${state.animals.length ? `${state.animals.length} Babytiere wohnen schon hier.` : 'Noch ist die Wiese leer – hak etwas ab, dann kommt das erste Babytier!'}</p>
      <div class="card">
        ${state.categories.map(c => `<div class="prog-row" style="--cat:${c.color}">${mini(c.animal)}
          <div><b>${esc(c.name)}</b> <span class="muted">→ ${esc(kindOf(c).baby)}</span>
          <div class="paws">${paws(c.id)}<span>${esc(nextBabyText(c).replace(/ bis zum.*/, ''))}</span></div></div></div>`).join('')}
      </div>
      ${animals.length ? `<div class="sec-head"><h2>Deine Babytiere</h2></div>
        <div class="meadow">${animals.map(a => `<button class="critter" data-action="open-animal" data-id="${a.id}">
          ${A.draw(a.kind, a.look)}<span>${esc(a.name)}</span><small>${esc(A.KINDS[a.kind]?.baby || '')}</small></button>`).join('')}</div>` : ''}
      <div class="sec-head"><h2>Sammelalbum</h2><span class="muted">${kinds.filter(k => counts[k]).length}/${kinds.length}</span></div>
      <div class="card"><div class="album">${kinds.map(k => `<div class="album-item ${counts[k] ? '' : 'missing'}">
        ${mini(k, latestOfKind(k)?.look)}<b>${esc(A.KINDS[k].baby)}</b><small>${counts[k] ? counts[k] + '×' : 'noch nicht da'}</small></div>`).join('')}</div>
        <p class="hint" style="margin-top:12px">Andere Tiere bekommst du, indem du in <b>Einstellen → Kategorien</b> einer Liste ein anderes Tier gibst.</p>
      </div>`;
  }

  function viewEinstellungen() {
    const s = state.settings;
    return `
      <h1 class="view-title">Einstellen ⚙️</h1>
      <div class="card">
        <h3 style="margin-bottom:8px">Name der App</h3>
        <input class="field" type="text" data-input="appName" value="${esc(s.appName)}" maxlength="24" aria-label="Name der App">
      </div>
      <div class="card">
        <h3 style="margin-bottom:10px">Farbthema</h3>
        <div class="themes">${THEMES.map(t => `<button class="theme-btn ${s.theme === t.id ? 'on' : ''}" data-action="theme" data-id="${t.id}" style="--a:${t.a};--b:${t.b}"><i></i>${t.name}</button>`).join('')}</div>
      </div>
      <div class="card">
        <div class="set-row"><div><b>Ruhemodus</b><p>Keine Animationen, kein Konfetti, kein wackelndes Ei.</p></div>
          <button class="switch ${s.calm ? 'on' : ''}" data-action="calm" role="switch" aria-checked="${!!s.calm}" aria-label="Ruhemodus"></button></div>
        <div class="set-row"><div><b>Textgröße</b></div>
          <div class="seg">${[['s', 'A'], ['m', 'A'], ['l', 'A']].map(([k, l], i) => `<button class="${s.size === k ? 'on' : ''}" data-action="size" data-id="${k}" style="font-size:${.8 + i * .2}rem" aria-label="Text ${k === 's' ? 'klein' : k === 'm' ? 'mittel' : 'groß'}">${l}</button>`).join('')}</div></div>
        <div class="set-row"><div><b>Babytier nach …</b><p>So oft abhaken, bis ein neues Babytier kommt.</p></div>
          <div class="stepper"><button data-action="per" data-d="-1" aria-label="weniger">−</button><b>${s.perBaby}</b><button data-action="per" data-d="1" aria-label="mehr">+</button></div></div>
      </div>
      <div class="card">
        <h3 style="margin-bottom:4px">Kategorien</h3>
        <p class="hint">Antippen, um Name, Farbe und Tier zu ändern.</p>
        ${state.categories.map(c => `<button class="cat-line" data-action="edit-cat" data-id="${c.id}" style="--cat:${c.color}">${mini(c.animal)}<b>${esc(c.name)}</b><span class="muted">${esc(kindOf(c).baby)}</span><span class="dot"></span></button>`).join('')}
        <button class="ghost-btn" data-action="new-cat">＋ Neue Kategorie</button>
      </div>
      <div class="card">
        <h3 style="margin-bottom:4px">Daten</h3>
        <p class="hint">Alles bleibt nur auf diesem Gerät gespeichert – ohne Account, ohne Cloud. Mach ab und zu ein Backup. 💾</p>
        <button class="big-btn soft" data-action="export">💾 Backup speichern (Aufgaben + ${state.animals.length} Tiere)</button>
        <button class="big-btn soft" data-action="import">📥 Backup oder Liste laden</button>
        <p class="hint"><b>Neues Handy?</b> Hier „Backup speichern“ → Datei in iCloud Drive sichern oder per AirDrop schicken → auf dem neuen Handy die App öffnen und „Backup laden“. Alle Tiere ziehen mit um. 🐾</p>
        <button class="big-btn danger-soft" data-action="clear-done">🧹 Erledigte Aufgaben aufräumen</button>
      </div>
      ${ui.debug ? `<div class="card debug-card">
        <h3 style="margin-bottom:4px">🛠️ Debug</h3>
        <button class="big-btn soft" data-action="intro-open">📖 Einführung jetzt zeigen</button>
        <button class="big-btn soft" data-action="intro-reset">🔁 Einführung beim nächsten Start wieder zeigen</button>
        <p class="hint">Nur zum Testen. Vor dem Löschen wird automatisch ein Backup gespeichert.</p>
        ${ui.debugBackedUp
          ? `<p><b>✓ Backup gespeichert.</b> Jetzt wirklich alles löschen? Aufgaben, Tiere, Kiesel, Wiese und Einstellungen sind dann weg.</p>
             <button class="big-btn danger" data-action="debug-wipe">Ja, jetzt alles löschen</button>
             <button class="big-btn" data-action="debug-cancel">Abbrechen</button>`
          : `<button class="big-btn danger-soft" data-action="debug-backup">🗑️ Daten löschen (mit Backup)</button>`}
      </div>` : ''}
      <p class="footer-note" data-action="secret-tap">Mit 💛 gemacht</p>`;
  }

  const VIEWS = { heute: viewHeute, listen: viewListen, tiere: viewTiere, einstellungen: viewEinstellungen };

  function render() {
    applySettings();
    renderTop();
    $('#view').innerHTML = VIEWS[ui.view]();
    document.querySelectorAll('#nav button').forEach(b => {
      const on = b.dataset.view === ui.view;
      b.classList.toggle('on', on);
      b.setAttribute('aria-current', on ? 'page' : 'false');
    });
    // Wiese: Scrollposition nach dem Neuzeichnen beibehalten
    const wrap = $('#world-wrap');
    if (wrap) {
      wrap.scrollLeft = ui.worldX || 0;
      let raf = 0;
      wrap.addEventListener('scroll', () => {
        ui.worldX = wrap.scrollLeft;
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; const id = regionInView(); if (id) document.querySelectorAll('.rchip').forEach(b => b.classList.toggle('on', b.dataset.r === id)); });
      }, { passive: true });
      const id = regionInView();
      if (id) document.querySelectorAll('.rchip').forEach(b => b.classList.toggle('on', b.dataset.r === id));
    }
    restoreFocus($('#view'));
  }

  // Setzt den Cursor nach dem Neuzeichnen zurück ins passende Eingabefeld
  function restoreFocus(scope) {
    if (!ui.refocus || !scope) return;
    const el = scope.querySelector(`[data-key="${ui.refocus}"]`);
    if (el) { ui.refocus = null; el.focus(); }
  }

  function refresh({ sheet = true } = {}) {
    render();
    if (sheet && ui.sheet) renderSheet();
    if (ui.overlay) renderOverlay();
  }

  // ---------- Sheets ----------
  function openSheet(name, arg) {
    ui.sheet = { name, arg }; ui.confirm = null;
    $('#sheet-layer').hidden = false;
    renderSheet();
    $('.sheet').scrollTop = 0;
  }
  function closeSheet() {
    ui.sheet = null; ui.confirm = null;
    $('#sheet-layer').hidden = true;
    render();
  }
  function renderSheet() {
    const fn = SHEETS[ui.sheet.name];
    const html = fn && fn(ui.sheet.arg);
    if (html == null) return closeSheet();
    $('#sheet-body').innerHTML = html;
    restoreFocus($('#sheet-body'));
  }

  const catChips = (sel, action) => state.categories.map(c =>
    `<button class="chip ${c.id === sel ? 'on' : ''}" style="--cat:${c.color}" data-action="${action}" data-cat="${c.id}">${mini(c.animal)}${esc(c.name)}</button>`).join('');

  const SHEETS = {
    task(id) {
      const t = taskById(id); if (!t) return null;
      return `
        <h2>Aufgabe</h2>
        <textarea class="title-input" data-input="title" data-id="${t.id}" rows="2" aria-label="Titel">${esc(t.title)}</textarea>
        <div class="toggles">
          <button class="pill ${t.done ? 'on done' : ''}" data-action="toggle" data-id="${t.id}">✓ ${t.done ? 'Erledigt' : 'Abhaken'}</button>
          <button class="pill ${t.important ? 'on imp' : ''}" data-action="t-imp" data-id="${t.id}">💛 Wichtig</button>
          <button class="pill ${t.today ? 'on' : ''}" data-action="t-today" data-id="${t.id}">☀️ Für heute</button>
        </div>
        <h3>Kleine Schritte</h3>
        <p class="hint" style="margin-top:-4px">Zu groß? Teil es in Mini-Schritte. Jeder Schritt zählt fürs Babytier. 🐾</p>
        <div style="--cat:${catById(t.catId)?.color}">
        ${t.subtasks.map(s => `<div class="sub ${s.done ? 'is-done' : ''}">
          <button class="check sm" data-action="sub-toggle" data-id="${t.id}" data-sub="${s.id}" aria-label="Schritt abhaken">${CHECK}</button>
          <input type="text" value="${esc(s.title)}" data-input="sub-title" data-id="${t.id}" data-sub="${s.id}" aria-label="Schritt">
          <button class="icon-btn" data-action="sub-del" data-id="${t.id}" data-sub="${s.id}" aria-label="Schritt löschen">✕</button>
        </div>`).join('')}</div>
        <form data-form="sub-add" data-id="${t.id}" style="margin-top:6px">
          <input type="text" name="t" data-key="sub-add" placeholder="+ Mini-Schritt hinzufügen" enterkeyhint="done" autocomplete="off">
        </form>
        <h3>Kategorie</h3>
        <div class="chips">${catChips(t.catId, 't-cat')}</div>
        <h3>Notiz</h3>
        <textarea data-input="note" data-id="${t.id}" rows="3" placeholder="Telefonnummer, Link, was dir hilft …">${esc(t.note)}</textarea>
        <div class="sheet-actions">
          ${!t.done ? `<button class="big-btn soft" data-action="timer" data-id="${t.id}">⏳ Nur 5 Minuten anfangen</button>` : ''}
          <button class="big-btn danger-soft" data-action="t-del" data-id="${t.id}">Aufgabe löschen</button>
        </div>`;
    },

    add() {
      if (!ui.addCat || !catById(ui.addCat)) ui.addCat = state.categories[0]?.id;
      return `
        <h2>Aufgaben eintragen</h2>
        <p class="hint">Schreib einfach alles auf, was im Kopf rumschwirrt. <b>Jede Zeile wird eine Aufgabe.</b></p>
        <textarea data-input="dump" data-key="dump" rows="6" placeholder="Mail an …&#10;Wäsche waschen&#10;Oma anrufen">${esc(ui.addDraft)}</textarea>
        <h3>In welche Liste?</h3>
        <div class="chips">${catChips(ui.addCat, 'add-cat')}</div>
        <div class="toggles" style="margin-top:14px">
          <button class="pill ${ui.addImp ? 'on imp' : ''}" data-action="add-imp">💛 Wichtig</button>
          <button class="pill ${ui.addToday ? 'on' : ''}" data-action="add-today">☀️ Für heute</button>
        </div>
        <div class="sheet-actions"><button class="big-btn primary" data-action="add-save">Hinzufügen</button></div>`;
    },

    pickToday() {
      const n = state.tasks.filter(t => t.today && !t.done).length;
      const groups = state.categories.map(c => {
        const ts = state.tasks.filter(t => t.catId === c.id && !t.done).sort((a, b) => (b.important ? 1 : 0) - (a.important ? 1 : 0));
        if (!ts.length) return '';
        return `<div class="pick-group" style="--cat:${c.color}">${esc(c.name)}</div>` + ts.map(t =>
          `<button class="pick ${t.today ? 'on' : ''}" data-action="pick" data-id="${t.id}" aria-pressed="${!!t.today}">
            <span class="sunbox">☀️</span><span class="${t.important ? 'is-imp' : ''}"><span class="hl">${esc(t.title)}</span></span></button>`).join('');
      }).join('');
      return `
        <h2>Was ist heute dran?</h2>
        <p class="hint">1–3 Sachen reichen völlig. ${n > 3 ? '<b>Mehr geht auch – aber weniger ist oft leichter. 💛</b>' : ''}</p>
        <p><b>☀️ ${n} ausgewählt</b></p>
        ${groups || '<p class="muted">Gerade gibt es keine offenen Aufgaben. 🎉</p>'}
        <div class="sticky-bottom"><button class="big-btn primary" data-action="close-sheet">Fertig</button></div>`;
    },

    cat(id) {
      const c = catById(id); if (!c) return null;
      const count = state.tasks.filter(t => t.catId === id).length;
      const confirming = ui.confirm === 'cat-' + id;
      return `
        <h2>Kategorie</h2>
        <input class="field" type="text" value="${esc(c.name)}" data-input="cat-name" data-id="${c.id}" maxlength="30" aria-label="Name der Kategorie">
        <h3>Farbe</h3>
        <div class="swatches">${COLORS.map(col => `<button class="swatch ${c.color === col ? 'on' : ''}" style="--c:${col}" data-action="cat-color" data-id="${c.id}" data-color="${col}" aria-label="Farbe ${col}"></button>`).join('')}</div>
        <h3>Welches Babytier kommt hier?</h3>
        <div class="animal-grid">${Object.entries(A.KINDS).map(([k, v]) => `<button class="animal-pick ${c.animal === k ? 'on' : ''}" data-action="cat-animal" data-id="${c.id}" data-kind="${k}">${mini(k)}${esc(v.baby)}</button>`).join('')}</div>
        <p class="hint" style="margin-top:10px">Schon gesammelte Tiere bleiben natürlich auf der Wiese.</p>
        ${state.categories.length > 1 ? `<div class="sheet-actions"><button class="big-btn danger-soft" data-action="cat-del" data-id="${c.id}">
          ${confirming ? `Wirklich löschen? ${count ? `(${count} Aufgaben werden mitgelöscht)` : ''}` : 'Kategorie löschen'}</button></div>` : ''}`;
    },

    animal(id) {
      const a = state.animals.find(x => x.id === id); if (!a) return null;
      const k = A.KINDS[a.kind];
      return `
        <div class="center" data-action="hop" style="cursor:pointer">${A.draw(a.kind, a.look, { cls: 'big-animal' })}</div>
        <input class="field" type="text" value="${esc(a.name)}" data-input="animal-name" data-id="${a.id}" maxlength="24" style="text-align:center;font-weight:800;font-size:1.2rem" aria-label="Name">
        <div class="row2" style="margin-top:10px">
          <button class="big-btn soft" data-action="show-on-map" data-id="${a.id}">🗺️ Auf der Karte zeigen</button>
          <button class="big-btn soft" data-action="move-animal" data-id="${a.id}">📍 Woanders hinsetzen</button>
        </div>
        <p class="center muted">${esc(k?.baby || '')} · ${esc(k?.furs[a.look.fur]?.name || '')}<br>da seit ${new Date(a.bornAt).toLocaleDateString('de-DE')} · aus „${esc(a.catName || '')}“</p>
        <h3>Fell</h3>
        <div class="chips">${(k?.furs || []).map((f, i) => `<button class="chip ${a.look.fur === i ? 'on' : ''}" style="padding:6px 14px" data-action="a-fur" data-id="${a.id}" data-i="${i}">${esc(f.name)}</button>`).join('')}</div>
        ${a.kind === 'otter' ? `<h3>Lieblingsstein</h3>
        <div class="chips">${A.STONES.map((st, i) => `<button class="chip ${(a.look.stone || 0) === i ? 'on' : ''}" style="padding:6px 14px" data-action="a-stone" data-id="${a.id}" data-i="${i}"><span class="stone-dot" style="background:${st.c}"></span>${esc(st.name)}</button>`).join('')}</div>` : ''}
        <h3>Anziehen</h3>
        <div class="chips">${Object.entries(A.ACCS).map(([key, v]) => `<button class="chip ${a.look.acc === key ? 'on' : ''}" style="padding:6px 14px" data-action="a-acc" data-id="${a.id}" data-acc="${key}">${v.crochet ? '🧶 ' : ''}${esc(v.label)}</button>`).join('')}</div>
        ${a.look.acc !== 'keins' && a.look.acc !== 'bluemchen' ? `<h3>Farbe</h3>
        <div class="swatches">${A.ACC_COLORS.map(col => `<button class="swatch ${a.look.color === col ? 'on' : ''}" style="--c:${col}" data-action="a-color" data-id="${a.id}" data-color="${col}" aria-label="Farbe"></button>`).join('')}</div>` : ''}
        <div class="sheet-actions"><button class="big-btn primary" data-action="close-sheet">Fertig</button></div>`;
    },

    shop() {
      const p = Wd.nextRegion(curMap().unlocked);
      const price = Wd.regionPrice(openCount());
      const items = Wd.GADGETS.filter(g => g.group === ui.shopGroup);
      return `
        <h2>Wiesen-Laden 🛍️</h2>
        <p class="pebble-big">🪨 <b>${state.pebbles || 0}</b> Kiesel <span class="muted">· jeder Haken = 1 Kiesel</span>
          ${state.vouchers > 0 ? `<br>${ICON_TICKET} <b>${state.vouchers}</b> Wunsch-Gutschein${state.vouchers > 1 ? 'e' : ''} <span class="muted">· bei jedem Kauf einlösbar</span>` : ''}</p>
        ${p ? `<div class="unlock-card">
            <div><b>🗺️ Neues Gebiet: ${esc(p.name)}</b><br><span class="muted">${openCount()}/${Wd.REGIONS.length} Gebiete offen · 11 neue Plätze</span></div>
            <button class="big-btn ${state.pebbles >= price ? 'primary' : ''}" data-action="w-unlock">🪨 ${price}</button>
          </div>` : '<p class="muted">Du hast alle 40 Gebiete entdeckt! 🌍</p>'}
        <div class="shop-tabs">${Object.entries(Wd.GROUPS).map(([k, v]) => `<button class="chip ${ui.shopGroup === k ? 'on' : ''}" style="padding:6px 12px" data-action="shop-group" data-g="${k}">${v}</button>`).join('')}</div>
        <div class="shop-grid">${items.map(g => {
          const own = state.inv[g.id] || 0, free = available(g.id), land = g.group === 'land';
          const can = state.pebbles >= g.price && !(land && own);
          return `<div class="shop-item">
            <div class="shop-prev">${Wd.preview(g.id)}</div>
            <b>${esc(g.name)}</b>
            <small class="muted">${land ? esc(g.info || '') : g.premium ? (free ? `${free} in der Kiste` : own ? 'steht am Himmel' : 'golden & exklusiv') : own ? `${own}× gekauft${free ? ` · ${free} in der Kiste` : ''}` : g.sky ? 'für den Himmel' : '&nbsp;'}</small>
            ${g.premium ? `<span class="owned">${own ? '🌟 aus deiner Truhe' : ICON_CHEST + ' nur aus der Truhe'}</span>`
              : land && own ? '<span class="owned">✓ auf der Karte</span>'
              : `<button class="buy ${can ? '' : 'off'}" data-action="buy" data-id="${g.id}">🪨 ${g.price}</button>`}
            ${!land && free ? `<button class="link" data-action="place" data-id="${g.id}">Platzieren</button>` : ''}
          </div>`;
        }).join('')}</div>`;
    },

    // Kauf-Bestätigung: Vorschau, Preis, Kiesel vorher/nachher – erst dann wird bezahlt
    confirmBuy(arg) {
      const have = state.pebbles || 0;
      let title, prev, price, info, okLabel;
      if (arg.kind === 'region') {
        const next = Wd.nextRegion(curMap().unlocked);
        if (!next) return null;
        price = Wd.regionPrice(openCount());
        title = `Neues Gebiet: ${next.name}`;
        prev = `<div class="buy-prev region">${Wd.regionPreview(next.id, ownedLand())}</div>`;
        info = '11 neue Plätze: 8 am Boden und 3 am Himmel ✨';
        okLabel = 'freischalten';
      } else {
        const g = Wd.byId[arg.id];
        if (!g) return null;
        price = g.price; title = g.name;
        prev = `<div class="buy-prev">${Wd.preview(g.id)}</div>`;
        info = g.group === 'land' ? `Erscheint automatisch: ${g.info || ''}` : g.sky ? 'Kommt an einen Himmelsplatz ✨' : 'Kommt auf einen freien Platz auf deiner Wiese';
        okLabel = 'kaufen';
      }
      const left = have - price, ok = left >= 0;
      return `
        <h2>${esc(title)}</h2>
        ${prev}
        <p class="center muted" style="margin:6px 0 12px">${esc(info)}</p>
        <div class="price-box">
          <div><span>Kostet</span><b>🪨 ${price}</b></div>
          <div><span>Du hast</span><b>🪨 ${have}</b></div>
          <div><span>Danach</span><b class="${ok ? '' : 'neg'}">${ok ? '🪨 ' + left : '–'}</b></div>
        </div>
        ${ok ? `<button class="big-btn primary" data-action="buy-ok">Ja, für ${price} 🪨 ${okLabel}</button>`
          : `<p class="center"><b>Dir fehlen noch ${-left} Kiesel</b> – das sind ${-left} Haken. Du schaffst das! 🐾</p>`}
        ${state.vouchers > 0 ? `<button class="big-btn gold" data-action="buy-voucher">${ICON_TICKET} Mit Gutschein gratis holen (${state.vouchers} übrig)</button>` : ''}
        <button class="big-btn" data-action="buy-cancel">${ok ? 'Abbrechen' : 'Zurück'}</button>`;
    },

    slot(id) {
      const sl = Wd.slotById[id]; if (!sl) return null;
      const cur = curMap().slots[id];
      const options = Wd.GADGETS.filter(g => g.group !== 'land' && !!g.sky === sl.sky && available(g.id) > 0);
      return `
        <h2>${sl.sky ? '✨ Himmelsplatz' : '📍 Platz'} · ${esc(Wd.regionById[sl.region]?.name || '')}</h2>
        ${cur ? `<div class="slot-cur"><div class="shop-prev">${Wd.preview(cur)}</div><div><b>${esc(Wd.byId[cur]?.name || '')}</b><br>
          <button class="big-btn" data-action="slot-clear" data-slot="${id}" style="margin-top:8px">↩︎ Zurück in die Kiste</button></div></div>` : '<p class="muted">Dieser Platz ist noch frei.</p>'}
        <h3>${options.length ? 'Aus deiner Kiste hierhin stellen' : 'Deine Kiste ist leer'}</h3>
        <div class="shop-grid">${options.map(g => `<button class="shop-item pick-item" data-action="slot-put" data-slot="${id}" data-id="${g.id}">
          <div class="shop-prev">${Wd.preview(g.id)}</div><b>${esc(g.name)}</b><small class="muted">${available(g.id)}× in der Kiste</small></button>`).join('')}</div>
        <div class="sheet-actions"><button class="big-btn soft" data-action="shop">🛍️ Zum Laden</button></div>`;
    },

    confirmImport() {
      const b = pendingImport || {};
      return `<h2>Backup laden</h2>
        <p>Im Backup: <b>${(b.tasks || []).length} Aufgaben</b> und <b>${(b.animals || []).length} Babytiere</b>.</p>
        ${(b.schema || 1) > SCHEMA ? '<p class="hint"><b>Hinweis:</b> Das Backup stammt aus einer neueren App-Version. Es geht nichts verloren, aber manche neuen Sachen siehst du erst nach einem App-Update.</p>' : ''}
        <button class="big-btn primary" data-action="import-replace">Alles übernehmen</button>
        <p class="hint" style="margin-top:-4px">Ersetzt, was gerade hier ist (${state.tasks.length} Aufgaben, ${state.animals.length} Tiere). Perfekt fürs neue Handy.</p>
        <button class="big-btn soft" data-action="import-animals">🐾 Nur die Tiere dazuholen</button>
        <p class="hint" style="margin-top:-4px">Deine Aufgaben bleiben, die Tiere aus dem Backup ziehen zusätzlich ein.</p>
        <button class="big-btn" data-action="close-sheet">Abbrechen</button>`;
    },
  };

  // ---------- Fokus, Timer, Schlüpfen ----------
  function focusPool() {
    const open = state.tasks.filter(t => !t.done && !(ui.focus?.skipped || []).includes(t.id));
    const pools = [open.filter(t => t.today), open.filter(t => t.important), open];
    return pools.find(p => p.length) || [];
  }
  function startFocus() {
    ui.focus = { skipped: [], id: null };
    const p = focusPool();
    ui.focus.id = p.length ? pick(p).id : null;
    ui.overlay = 'focus';
    renderOverlay();
  }
  function renderOverlay() {
    drawOverlay();
    restoreFocus($('#overlay'));
  }
  function drawOverlay() {
    const el = $('#overlay');
    if (!ui.overlay) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    if (ui.overlay === 'focus') {
      const t = ui.focus.id && taskById(ui.focus.id);
      if (!t || t.done) {
        const p = focusPool();
        if (t && t.done) { ui.focus.id = p.length ? pick(p).id : null; return renderOverlay(); }
        el.innerHTML = `<div class="ov-inner"><button class="ov-close" data-action="ov-close" aria-label="Schließen">✕</button>
          <div class="focus-card center">${A.draw('katze', { fur: 0, acc: 'muetze', color: '#a8d8c8' }, { cls: 'big' })}
          <h1>Nichts mehr offen! 🎉</h1><p class="muted">Zeit für eine Pause. Du hast sie dir verdient.</p></div>
          <button class="big-btn primary" data-action="ov-close">Schön!</button></div>`;
        return;
      }
      const cat = catById(t.catId) || {};
      const next = t.subtasks.find(s => !s.done);
      const look = latestOfKind(cat.animal)?.look;
      el.innerHTML = `<div class="ov-inner">
        <button class="ov-close" data-action="ov-close" aria-label="Schließen">✕</button>
        <div class="focus-card" style="--cat:${cat.color}">
          ${A.draw(cat.animal, look, { cls: 'big' })}
          <div><span class="task-cat" style="--cat:${cat.color}">${esc(cat.name)}</span></div>
          <h1 class="${t.important ? 'is-imp' : ''}"><span class="hl">${esc(t.title)}</span></h1>
          ${next && !ui.focus.split ? `<div class="next-step">Nächster Mini-Schritt:<b>${esc(next.title)}</b>
            <button class="pill" data-action="focus-sub" data-id="${t.id}" data-sub="${next.id}">✓ Schritt geschafft</button></div>` : ''}
          ${ui.focus.split ? `<div class="split-box">
            <p><b>Was wäre der allerkleinste erste Schritt?</b><br>
            <span class="muted">z. B. „Datei öffnen“, „Nummer raussuchen“, „Kiste holen“</span></p>
            ${t.subtasks.length ? `<ol class="split-list">${t.subtasks.map(s => `<li class="${s.done ? 'is-done' : ''}">${esc(s.title)}</li>`).join('')}</ol>` : ''}
            <form data-form="sub-add" data-id="${t.id}">
              <input type="text" name="t" data-key="focus-sub-add" placeholder="${t.subtasks.length ? 'Und danach …?' : 'Erster Mini-Schritt …'}" enterkeyhint="done" autocomplete="off" aria-label="Mini-Schritt">
            </form>
            <button class="big-btn primary" data-action="focus-split-done" style="margin-top:10px">Fertig – los geht's</button>
          </div>` : ''}
        </div>
        <button class="big-btn primary" data-action="toggle" data-id="${t.id}">✓ Geschafft!</button>
        <button class="big-btn soft" data-action="timer" data-id="${t.id}">⏳ Nur 5 Minuten anfangen</button>
        <div class="row2">
          <button class="big-btn" data-action="focus-smaller" data-id="${t.id}">✂️ Kleiner machen</button>
          <button class="big-btn" data-action="focus-skip">↻ Was anderes</button>
        </div></div>`;
      return;
    }
    if (ui.overlay === 'timer') {
      const tm = ui.timer, t = taskById(tm.id);
      const left = timerLeft();
      const C = 2 * Math.PI * 92;
      const finished = left <= 0;
      el.innerHTML = `<div class="ov-inner">
        <button class="ov-close" data-action="timer-close" aria-label="Schließen">✕</button>
        <div class="center"><p class="muted">Nur kurz anfangen mit:</p><h2>${esc(t?.title || '')}</h2></div>
        <div class="timer-ring"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="92" fill="none" stroke="var(--line)" stroke-width="12"/>
          <circle id="ring" cx="100" cy="100" r="92" fill="none" stroke="var(--accent)" stroke-width="12" stroke-linecap="round"
          stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - left / tm.total)}"/></svg><div class="t" id="tleft">${fmt(left)}</div></div>
        ${finished ? `<div class="center"><h2>Du hast angefangen! 🎉</h2><p>Das war der schwerste Teil. Weitermachen oder Pause – beides ist okay.</p></div>
          <button class="big-btn primary" data-action="toggle" data-id="${tm.id}">✓ Aufgabe ist fertig</button>
          <button class="big-btn soft" data-action="timer-again">⏳ Noch 5 Minuten</button>
          <button class="big-btn" data-action="timer-close">Pause machen</button>`
        : `<div class="chips" style="justify-content:center;margin-bottom:14px">${[2, 5, 10, 15].map(m => `<button class="chip ${tm.total === m * 60000 ? 'on' : ''}" style="padding:6px 16px" data-action="timer-set" data-m="${m}">${m} Min</button>`).join('')}</div>
          <button class="big-btn soft" data-action="timer-pause">${tm.pausedLeft != null ? '▶︎ Weiter' : '⏸ Pause'}</button>
          <button class="big-btn" data-action="timer-close">Aufhören</button>`}
      </div>`;
    }
  }
  const fmt = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const timerLeft = () => ui.timer.pausedLeft != null ? ui.timer.pausedLeft : ui.timer.end - Date.now();

  let tick = null;
  function startTimer(id, min = 5) {
    ui.timer = { id, total: min * 60000, end: Date.now() + min * 60000, pausedLeft: null, from: ui.overlay };
    ui.overlay = 'timer';
    clearInterval(tick);
    tick = setInterval(() => {
      if (ui.overlay !== 'timer' || !ui.timer) return clearInterval(tick);
      const left = timerLeft();
      if (left <= 0) { clearInterval(tick); renderOverlay(); return; }
      const r = $('#ring'), tl = $('#tleft');
      if (r) r.setAttribute('stroke-dashoffset', 2 * Math.PI * 92 * (1 - left / ui.timer.total));
      if (tl) tl.textContent = fmt(left);
    }, 500);
    renderOverlay();
  }
  function closeTimer() {
    clearInterval(tick);
    const back = ui.timer?.from === 'focus' ? 'focus' : null;
    ui.timer = null; ui.overlay = back;
    renderOverlay(); render();
  }

  /* Schlüpf-Warteschlange steckt im Speicherstand: jedes neue Tier hat welcomed:false,
     bis sein Schlüpf-Fenster bestätigt wurde. Übersteht Neuladen, schnelles Tippen und „Rückgängig“. */
  const pendingHatches = () => state.animals.filter(a => a.welcomed === false);
  function showNextHatch() {
    if (!$('#hatch').hidden || ui.moving) return;
    const a = pendingHatches()[0];
    if (!a) return;
    const cat = state.categories.find(c => c.name === a.catName);
    const el = $('#hatch');
    // Kein „Rückgängig“ während des Schlüpfens
    $('#toast').classList.remove('show'); ui.undo = null;
    const egg = A.egg(cat?.color);
    el.hidden = false;
    el.dataset.id = a.id;
    el.innerHTML = `<div class="ov-inner">
      <div class="hatch-stage">
        <div class="hatch-ground"></div>
        <div class="born-clip"><div class="born">${A.draw(a.kind, a.look)}</div></div>
        <div class="shell shell-bot left">${egg}</div>
        <div class="shell shell-bot right">${egg}</div>
        <div class="shell shell-top">${egg}</div>
        <div class="burst"><span>✨</span><span>⭐</span><span>✨</span><span>💛</span><span>⭐</span></div>
      </div>
      <div class="hatch-text"><h2>Überraschung!</h2>
        <p>Ein <b>${esc(A.KINDS[a.kind]?.baby)}</b> ist da! 💛<br><span class="muted">${esc(A.ACCS[a.look.acc]?.crochet ? 'Es trägt sogar etwas Gehäkeltes 🧶' : 'Es freut sich riesig über dich.')}</span></p>
        <label for="hatch-name"><b>Wie soll es heißen?</b></label>
        <div class="name-row"><input id="hatch-name" type="text" value="${esc(a.name)}" maxlength="24"><button data-action="hatch-dice" aria-label="Anderer Name">🎲</button></div>
        <p class="where-q"><b>Wo soll es wohnen?</b></p>
        <button class="big-btn primary choice" data-action="hatch-pick">📍 Ich suche einen Platz aus
          <small>Danach tippst du auf der Karte auf einen freien Pfoten-Platz.</small></button>
        <button class="big-btn soft choice" data-action="hatch-ok">🎲 Die App sucht einen Platz aus
          <small>Du kannst den Platz später jederzeit ändern.</small></button>
      </div></div>`;
    // Knöpfe erst antippbar, wenn sie sichtbar sind (nach der Animation bzw. sofort im Ruhemodus)
    el.classList.remove('ready');
    const calm = state.settings.calm || matchMedia('(prefers-reduced-motion: reduce)').matches;
    clearTimeout(ui.readyT);
    ui.readyT = setTimeout(() => el.classList.add('ready'), calm ? 150 : 2400);
  }
  // mode 'pick' = selbst einen Platz aussuchen, sonst setzt die App das Tier automatisch hin
  function closeHatch(mode) {
    const el = $('#hatch');
    if (!el.classList.contains('ready')) return;   // Knöpfe erst nach der Animation (kein versehentliches Antippen)
    const a = state.animals.find(x => x.id === el.dataset.id);
    const name = $('#hatch-name')?.value.trim();
    if (a && name) a.name = name;
    if (a) a.welcomed = true;
    save();
    el.hidden = true; el.innerHTML = ''; el.classList.remove('ready');
    if (mode === 'pick' && a) { startMoving(a.id, true); return; } // nächstes Tier kommt nach dem Platzieren
    afterHatch();
  }
  function afterHatch() {
    refresh();
    if (pendingHatches().length) setTimeout(showNextHatch, 250);
    else { if (ui.unlock) toast(cheer()); setTimeout(checkDaily, 400); }
  }
  // Tier-Versetzen-Modus: zeigt nur die Pfoten-Plätze
  function startMoving(id, fresh) {
    ui.moving = id; ui.movingFresh = !!fresh;
    ui.edit = false; ui.placing = null;
    if (ui.sheet) { ui.sheet = null; $('#sheet-layer').hidden = true; }
    ui.view = 'tiere';
    render();
    const m = curMap();
    const cur = Wd.placeAnimals(m, state.animals).find(p => p.id === id);
    const target = fresh ? (Wd.freeAnimalSpot(m, state.animals)?.reg || cur?.reg) : cur?.reg;
    if (target) scrollWorldTo(target);
    $('#world-wrap')?.scrollIntoView({ block: 'center' });
  }
  function endMoving() {
    const fresh = ui.movingFresh;
    ui.moving = null; ui.movingFresh = false;
    if (fresh) afterHatch(); else render();
  }

  // ---------- Toast & Effekte ----------
  let toastT = null;
  function toast(msg, undo) {
    const el = $('#toast');
    el.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button data-action="undo">Rückgängig</button>' : ''}`;
    ui.undo = undo || null;
    el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => { el.classList.remove('show'); ui.undo = null; }, undo ? 5000 : 2600);
  }
  function celebrate(ev) {
    if (state.settings.calm || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const x = ev?.clientX || innerWidth / 2, y = ev?.clientY || innerHeight / 2;
    const fx = $('#fx');
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = pick(['💛', '✨', '🍀', '⭐', '🐾', '🍫', '💧', '🌲']);
      s.style.left = (x - 11 + (Math.random() * 40 - 20)) + 'px';
      s.style.top = (y - 11) + 'px';
      s.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      s.style.animationDelay = (i * 40) + 'ms';
      fx.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
  }

  // ---------- Import / Export ----------
  // Gibt true zurück, wenn das Backup gespeichert/geteilt wurde (false = abgebrochen)
  async function exportData(prefix = 'plan-backup') {
    const data = JSON.stringify({ type: 'pfoetchenplan-backup', exportedAt: new Date().toISOString(), state }, null, 1);
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const name = `${prefix}-${stamp}.json`;
    const file = new File([data], name, { type: 'application/json' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Plan-Backup' });
        return true;
      }
    } catch (e) { if (e.name === 'AbortError') return false; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return true;
  }

  let pendingImport = null;
  function handleImport(text) {
    let data;
    try { data = JSON.parse(text); } catch (e) { toast('Die Datei konnte ich nicht lesen 😕'); return; }
    if (data.type === 'pfoetchenplan-backup' && data.state) {
      pendingImport = data.state;
      openSheet('confirmImport');
      return;
    }
    if (data.type === 'pfoetchenplan-liste' && Array.isArray(data.lists)) {
      let n = 0;
      data.lists.forEach(l => {
        let c = state.categories.find(x => x.name.toLowerCase() === String(l.name).toLowerCase());
        if (!c) {
          c = { id: uid(), name: l.name, color: l.color || pick(COLORS), animal: A.KINDS[l.animal] ? l.animal : 'pinguin' };
          state.categories.push(c);
        }
        (l.tasks || []).forEach(t => {
          const task = {
            id: uid(), catId: c.id, title: t.title, note: t.note || '', important: !!t.important, today: false,
            done: false, rewarded: false, createdAt: Date.now(),
            subtasks: (t.subtasks || []).map(s => ({ id: uid(), title: s.title || s, done: !!s.done, rewarded: !!s.done, doneAt: s.done ? Date.now() : null })),
          };
          state.tasks.push(task);
          if (t.done) { completeTask(task); task.doneAt = 0; } // zählt nicht als "heute"
          n++;
        });
      });
      save(); refresh();
      ui.unlock = null;
      toast(`${n} Aufgaben übernommen 📋`);
      showNextHatch();
      return;
    }
    toast('Das ist kein Backup und keine Liste für diese App 🤔');
  }

  // ---------- Aktionen ----------
  const act = {
    nav: el => {
      // Wer beim Versetzen die Ansicht wechselt, bricht ab – das Tier behält seinen Platz,
      // und wartende Schlüpf-Fenster kommen trotzdem.
      if (ui.moving) { ui.moving = null; const fresh = ui.movingFresh; ui.movingFresh = false; if (fresh) setTimeout(showNextHatch, 250); }
      ui.view = el.dataset.view; closeAllForNav(); render(); scrollTo(0, 0);
    },
    toggle: (el, ev) => toggleTask(el.dataset.id, ev),
    'open-task': el => openSheet('task', el.dataset.id),
    'close-sheet': () => closeSheet(),
    collapse: el => { const c = state.settings.collapsed; c[el.dataset.cat] = !c[el.dataset.cat]; save(); render(); },
    'show-more': el => { const s = state.settings.showMore; s[el.dataset.cat] = !s[el.dataset.cat]; save(); render(); },
    'imp-all': () => { state.settings.impAll = !state.settings.impAll; save(); render(); },
    'imp-open': () => { state.settings.impOpen = !state.settings.impOpen; save(); render(); },
    'show-done': el => { const s = state.settings.showDone; s[el.dataset.cat] = !s[el.dataset.cat]; save(); render(); },
    'close-tip': () => { state.settings.tipClosed = true; save(); render(); },
    add: () => { ui.addDraft = ''; ui.addImp = false; ui.addToday = false; openSheet('add'); setTimeout(() => $('[data-key="dump"]')?.focus(), 50); },
    'add-cat': el => { ui.addCat = el.dataset.cat; renderSheet(); },
    'add-imp': () => { ui.addImp = !ui.addImp; renderSheet(); },
    'add-today': () => { ui.addToday = !ui.addToday; renderSheet(); },
    'add-save': () => {
      const lines = ui.addDraft.split('\n').map(l => l.replace(/^\s*[-•*·]\s*/, '').trim()).filter(Boolean);
      if (!lines.length) { toast('Schreib erst etwas auf ✏️'); return; }
      lines.forEach(title => state.tasks.push({ id: uid(), catId: ui.addCat, title, note: '', important: ui.addImp, today: ui.addToday, done: false, subtasks: [], createdAt: Date.now() }));
      ui.addDraft = '';
      save(); closeSheet();
      toast(lines.length === 1 ? 'Aufgabe eingetragen 📝' : `${lines.length} Aufgaben eingetragen 📝`);
    },
    'pick-today': () => openSheet('pickToday'),
    pick: el => { const t = taskById(el.dataset.id); if (t) { t.today = !t.today; save(); refresh(); } },
    't-imp': el => { const t = taskById(el.dataset.id); t.important = !t.important; save(); refresh(); },
    't-today': el => { const t = taskById(el.dataset.id); t.today = !t.today; save(); refresh(); },
    't-cat': el => { const t = taskById(ui.sheet.arg); t.catId = el.dataset.cat; save(); refresh(); },
    't-del': el => {
      const snap = clone(state);
      state.tasks = state.tasks.filter(t => t.id !== el.dataset.id);
      save(); closeSheet();
      toast('Aufgabe gelöscht', () => { restore(snap); });
    },
    'sub-toggle': (el, ev) => toggleSub(el.dataset.id, el.dataset.sub, ev),
    'sub-del': el => { const t = taskById(el.dataset.id); t.subtasks = t.subtasks.filter(s => s.id !== el.dataset.sub); save(); refresh(); },
    focus: () => startFocus(),
    'focus-skip': () => {
      ui.focus.split = false;
      ui.focus.skipped.push(ui.focus.id);
      let p = focusPool();
      if (!p.length) { ui.focus.skipped = [ui.focus.id]; p = focusPool(); }
      if (!p.length) { toast('Das ist gerade die einzige offene Aufgabe 🙂'); ui.focus.skipped = []; return; }
      ui.focus.id = pick(p).id; renderOverlay();
    },
    'focus-sub': (el, ev) => toggleSub(el.dataset.id, el.dataset.sub, ev),
    'focus-smaller': () => { ui.focus.split = true; ui.refocus = 'focus-sub-add'; renderOverlay(); },
    'focus-split-done': () => { ui.focus.split = false; renderOverlay(); },
    'ov-close': () => { ui.overlay = null; ui.focus = null; renderOverlay(); render(); },
    timer: el => { if (ui.sheet) { ui.sheet = null; $('#sheet-layer').hidden = true; } startTimer(el.dataset.id); },
    'timer-set': el => startTimer(ui.timer.id, +el.dataset.m),
    'timer-again': () => startTimer(ui.timer.id, 5),
    'timer-pause': () => {
      const tm = ui.timer;
      if (tm.pausedLeft != null) { tm.end = Date.now() + tm.pausedLeft; tm.pausedLeft = null; }
      else tm.pausedLeft = tm.end - Date.now();
      renderOverlay();
    },
    'timer-close': () => closeTimer(),
    'hatch-dice': () => { $('#hatch-name').value = A.randomName(); },
    'hatch-ok': () => closeHatch(),
    undo: () => { if (ui.undo) { ui.undo(); ui.undo = null; $('#toast').classList.remove('show'); } },
    'open-animal': el => openSheet('animal', el.dataset.id),
    hop: el => { const s = el.querySelector('svg'); s.classList.remove('hop-now'); void s.offsetWidth; s.classList.add('hop-now'); },
    'a-fur': el => { const a = state.animals.find(x => x.id === el.dataset.id); a.look.fur = +el.dataset.i; save(); refresh(); },
    // --- Wiese & Laden ---
    shop: () => { if (ui.sheet?.name === 'shop') return; openSheet('shop'); },
    'shop-group': el => { ui.shopGroup = el.dataset.g; renderSheet(); },
    // Kaufen & Freischalten öffnen immer erst die Bestätigung
    buy: el => { ui.buyFrom = ui.sheet?.name || null; openSheet('confirmBuy', { kind: 'gadget', id: el.dataset.id }); },
    'buy-cancel': () => { if (ui.buyFrom === 'shop') openSheet('shop'); else closeSheet(); },
    'buy-ok': () => purchase(false),
    'buy-voucher': () => purchase(true),
    'gift-claim': () => {
      const d = state.daily, n = d.days % 7;
      if (n === 6) { showGift(true); return; }
      const amt = GIFT_AMOUNTS[n];
      state.pebbles = (state.pebbles || 0) + amt;
      d.days = n + 1; d.last = giftDay();
      save(); closeGift();
      toast(`+${amt} Kiesel 🪨 – noch ${6 - n} ${6 - n === 1 ? 'Tag' : 'Tage'} bis zur Schatztruhe`);
    },
    'gift-pick': el => {
      const d = state.daily;
      d.days = 0; d.last = giftDay(); d.chests = (d.chests || 0) + 1;
      if (el.dataset.k === 'premium' && ui.giftPrem) {
        const id = ui.giftPrem;
        state.inv[id] = (state.inv[id] || 0) + 1;
        ui.giftPrem = null;
        save(); $('#gift').hidden = true; $('#gift').innerHTML = '';
        startPlacing(id);
        toast(`${Wd.byId[id].name} gehört dir! Tippe auf einen ✨ Himmelsplatz.`);
        return;
      }
      state.vouchers = (state.vouchers || 0) + 1;
      save(); closeGift();
      toast('Wunsch-Gutschein erhalten! ✨ Im Laden kannst du ihn bei jedem Kauf einlösen.');
    },
    'gift-info': () => toast(`🎁 ${state.daily.days % 7}/7 Tage gesammelt – noch ${7 - state.daily.days % 7} bis zur Schatztruhe`),
    place: el => startPlacing(el.dataset.id),
    'place-cancel': () => { ui.placing = null; render(); },
    'w-unlock': () => {
      if (!Wd.nextRegion(curMap().unlocked)) return;
      ui.buyFrom = ui.sheet?.name || null;
      openSheet('confirmBuy', { kind: 'region' });
    },
    'w-edit': () => { ui.edit = !ui.edit; if (!ui.edit) ui.placing = null; render(); },
    'w-go': el => {
      const r = el.dataset.r;
      if (!curMap().unlocked.includes(r)) { openSheet('shop'); return; }
      scrollWorldTo(r, true);
    },
    'w-slot': el => {
      const id = el.dataset.slot;
      if (ui.placing) {
        const sl = Wd.slotById[id], g = Wd.byId[ui.placing];
        if (!sl || !g || !!g.sky !== sl.sky) return;
        if (curMap().slots[id]) { toast('Der Platz ist schon belegt – such dir einen freien aus.'); return; }
        curMap().slots[id] = ui.placing;
        ui.placing = null;
        save(); render();
        toast(`${g.name} steht jetzt auf deiner Wiese ✨`);
        return;
      }
      openSheet('slot', id);
    },
    'w-gadget': el => {
      if (ui.edit || ui.placing) { act['w-slot'](el); return; }
      const g = Wd.byId[curMap().slots[el.dataset.slot]];
      if (g) toast(g.name);
    },
    'w-animal': el => {
      const a = state.animals.find(x => x.id === el.dataset.id);
      if (!a) return;
      el.classList.remove('hop-now'); void el.getBBox(); el.classList.add('hop-now');
      toast(`${a.name} · ${A.KINDS[a.kind]?.baby || ''} 💛`);
    },
    'w-find': el => {
      const f = curMap().finds.find(x => x.id === el.dataset.id);
      const d = f && Wd.findById[f.type];
      if (d) toast(`Fundstück: ${d.name} 🔍`);
    },
    'slot-clear': el => { delete curMap().slots[el.dataset.slot]; save(); refresh(); },
    'slot-put': el => { if (available(el.dataset.id) > 0) { curMap().slots[el.dataset.slot] = el.dataset.id; save(); } closeSheet(); },
    'a-stone': el => { const a = state.animals.find(x => x.id === el.dataset.id); a.look.stone = +el.dataset.i; save(); refresh(); },
    'a-acc': el => { const a = state.animals.find(x => x.id === el.dataset.id); a.look.acc = el.dataset.acc; save(); refresh(); },
    // Tier auf der Karte suchen: zur Wiese, zum Gebiet scrollen, Tier mittig zeigen und aufleuchten lassen
    'show-on-map': el => {
      const a = state.animals.find(x => x.id === el.dataset.id);
      if (!a) return;
      ui.sheet = null; $('#sheet-layer').hidden = true;
      ui.edit = false; ui.placing = null; ui.view = 'tiere';
      render();
      const g = document.querySelector(`.w-anim[data-id="${a.id}"]`), wrap = $('#world-wrap');
      if (!wrap) return;
      if (!g) { toast(`${a.name} kuschelt gerade im Tierhaus 🏡 – mit einem neuen Gebiet ist wieder Platz.`); return; }
      scrollWorldTo(g.closest('.w-region').dataset.r);
      requestAnimationFrame(() => {
        const ar = g.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
        if (ar.width) wrap.scrollLeft += (ar.left + ar.width / 2) - (wr.left + wr.width / 2);
        ui.worldX = wrap.scrollLeft;
        wrap.scrollIntoView({ block: 'center', behavior: state.settings.calm ? 'auto' : 'smooth' });
        g.classList.add('spot');
        setTimeout(() => g.classList.remove('spot'), 4200);
      });
      toast(`Hier ist ${a.name}! 💛`);
    },
    'a-color': el => { const a = state.animals.find(x => x.id === el.dataset.id); a.look.color = el.dataset.color; save(); refresh(); },
    theme: el => { state.settings.theme = el.dataset.id; save(); render(); },
    calm: () => { state.settings.calm = !state.settings.calm; save(); render(); },
    size: el => { state.settings.size = el.dataset.id; save(); render(); },
    per: el => { const s = state.settings; s.perBaby = Math.min(5, Math.max(1, s.perBaby + +el.dataset.d)); save(); render(); },
    'edit-cat': el => openSheet('cat', el.dataset.id),
    'new-cat': () => {
      const used = state.categories.map(c => c.animal);
      const free = Object.keys(A.KINDS).filter(k => !used.includes(k));
      const c = { id: uid(), name: 'Neue Liste', color: pick(COLORS), animal: free.length ? pick(free) : 'pinguin' };
      state.categories.push(c); save(); render();
      openSheet('cat', c.id);
      setTimeout(() => { const i = $('[data-input="cat-name"]'); i?.focus(); i?.select(); }, 60);
    },
    'cat-color': el => { catById(el.dataset.id).color = el.dataset.color; save(); refresh(); },
    'cat-animal': el => { catById(el.dataset.id).animal = el.dataset.kind; save(); refresh(); },
    'cat-del': el => {
      const id = el.dataset.id;
      if (ui.confirm !== 'cat-' + id) { ui.confirm = 'cat-' + id; renderSheet(); return; }
      const snap = clone(state);
      state.categories = state.categories.filter(c => c.id !== id);
      state.tasks = state.tasks.filter(t => t.catId !== id);
      save(); closeSheet();
      toast('Kategorie gelöscht', () => { restore(snap); });
    },
    export: () => exportData(),
    import: () => $('#file-in').click(),
    'import-replace': () => { if (pendingImport) { state = sanitizeRewards(migrate(pendingImport)); pendingImport = null; save(); } closeSheet(); toast('Backup geladen 💾'); },
    'import-animals': () => {
      const have = new Set(state.animals.map(a => a.id));
      const neu = (pendingImport?.animals || []).filter(a => a && A.KINDS[a.kind] && !have.has(a.id));
      state.animals.push(...neu);
      state.animals.sort((a, b) => (a.bornAt || 0) - (b.bornAt || 0));
      pendingImport = null; save(); closeSheet();
      toast(neu.length ? `${neu.length} Tiere sind umgezogen 🐾` : 'Diese Tiere wohnen schon alle hier 🙂');
    },
    // --- Einführung ---
    'intro-next': () => showIntro(ui.introPage + 1),
    'intro-prev': () => showIntro(ui.introPage - 1),
    'intro-done': () => closeIntro(),
    'intro-open': () => showIntro(0),
    'intro-reset': () => { state.settings.introSeen = false; save(); toast('Beim nächsten Öffnen der App kommt die Einführung wieder.'); },
    // --- Tiere versetzen ---
    'hatch-pick': () => closeHatch('pick'),
    'move-animal': el => startMoving(el.dataset.id, false),
    'move-cancel': () => endMoving(),
    'w-aspot': el => {
      if (!ui.moving) return;
      const m = curMap(), id = ui.moving, spot = el.dataset.spot;
      const now = Wd.placeAnimals(m, state.animals);
      const mine = now.find(p => p.id === id), occ = now.find(p => p.spot === spot);
      if (occ && occ.id !== id) {
        // Tauschen: das andere Tier bekommt meinen bisherigen Platz (oder sucht sich automatisch einen)
        if (mine) m.animalSpots[occ.id] = mine.spot; else delete m.animalSpots[occ.id];
      }
      m.animalSpots[id] = spot;
      save();
      const a = state.animals.find(x => x.id === id);
      endMoving();
      const g = document.querySelector(`.w-anim[data-id="${id}"]`);
      if (g) { g.classList.add('spot'); setTimeout(() => g.classList.remove('spot'), 2500); }
      toast(`${a?.name || 'Dein Tier'} wohnt jetzt hier 🏡`);
    },
    // Versteckt: 5× schnell auf „Mit 💛 gemacht“ tippen
    'secret-tap': () => {
      const now = Date.now();
      ui.taps = (ui.taps || []).filter(t => now - t < 3000).concat(now);
      if (ui.taps.length >= 5 && !ui.debug) { ui.debug = true; ui.taps = []; render(); toast('Debug-Bereich freigeschaltet 🛠️'); }
    },
    'debug-backup': async () => {
      const ok = await exportData('plan-backup-vor-loeschen');
      if (!ok) { toast('Backup abgebrochen – es wurde nichts gelöscht.'); return; }
      ui.debugBackedUp = true; render();
    },
    'debug-cancel': () => { ui.debugBackedUp = false; render(); },
    'debug-wipe': () => {
      if (!ui.debugBackedUp) return;
      try { localStorage.removeItem(KEY); } catch (e) { /* egal */ }
      location.reload();
    },
    'clear-done': () => {
      const n = state.tasks.filter(t => t.done).length;
      if (!n) { toast('Es gibt nichts aufzuräumen ✨'); return; }
      const snap = clone(state);
      state.tasks = state.tasks.filter(t => !t.done);
      save(); render();
      toast(`${n} erledigte Aufgaben aufgeräumt 🧹`, () => { restore(snap); });
    },
  };

  function closeAllForNav() {
    if (ui.sheet) { ui.sheet = null; $('#sheet-layer').hidden = true; }
  }

  // Am PC: Mausrad scrollt die Gebietsleiste seitwärts …
  document.addEventListener('wheel', ev => {
    const row = ev.target.closest('.region-chips');
    if (row && Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) { row.scrollLeft += ev.deltaY; ev.preventDefault(); }
  }, { passive: false });
  // … und die Karte lässt sich mit gedrückter Maus ziehen (am Handy wischt man ohnehin)
  let drag = null, dragMoved = false;
  document.addEventListener('mousedown', ev => {
    const w = ev.target.closest('#world-wrap');
    if (w && ev.button === 0) { drag = { w, x: ev.clientX, left: w.scrollLeft }; dragMoved = false; }
  });
  document.addEventListener('mousemove', ev => {
    if (!drag) return;
    const dx = ev.clientX - drag.x;
    if (Math.abs(dx) > 5) dragMoved = true;
    if (dragMoved) drag.w.scrollLeft = drag.left - dx;
  });
  document.addEventListener('mouseup', () => { drag = null; });

  document.addEventListener('click', ev => {
    if (dragMoved && ev.target.closest('#world-wrap')) { dragMoved = false; return; } // Ziehen ist kein Antippen
    const el = ev.target.closest('[data-action]');
    if (!el) return;
    const fn = act[el.dataset.action];
    if (fn) { ev.preventDefault(); fn(el, ev); }
  });

  document.addEventListener('submit', ev => {
    const f = ev.target.closest('[data-form]');
    if (!f) return;
    ev.preventDefault();
    const input = f.querySelector('input[name="t"]');
    const title = input.value.trim();
    if (!title) return;
    if (f.dataset.form === 'quick') {
      state.tasks.push({ id: uid(), catId: f.dataset.cat, title, note: '', important: false, today: false, done: false, subtasks: [], createdAt: Date.now() });
      ui.refocus = 'quick-' + f.dataset.cat;
      save(); render();
    } else if (f.dataset.form === 'sub-add') {
      const t = taskById(f.dataset.id);
      t.subtasks.push({ id: uid(), title, done: false });
      ui.refocus = ui.overlay === 'focus' && !ui.sheet ? 'focus-sub-add' : 'sub-add';
      save(); refresh();
    }
  });

  // Live-Eingaben: speichern, ohne das Sheet neu zu zeichnen (Fokus bleibt)
  document.addEventListener('input', ev => {
    const el = ev.target;
    const k = el.dataset.input;
    if (!k) return;
    const v = el.value;
    if (k === 'dump') { ui.addDraft = v; return; }
    if (k === 'appName') { state.settings.appName = v; save(); applySettings(); renderTop(); return; }
    if (k === 'title') { const t = taskById(el.dataset.id); if (t) t.title = v.replace(/\n/g, ' '); }
    if (k === 'note') { const t = taskById(el.dataset.id); if (t) t.note = v; }
    if (k === 'sub-title') { const s = taskById(el.dataset.id)?.subtasks.find(x => x.id === el.dataset.sub); if (s) s.title = v; }
    if (k === 'cat-name') { const c = catById(el.dataset.id); if (c) c.name = v; }
    if (k === 'animal-name') { const a = state.animals.find(x => x.id === el.dataset.id); if (a) a.name = v; }
    save(); render();
  });

  // Enter im Titel = fertig (kein Zeilenumbruch)
  document.addEventListener('keydown', ev => {
    if (!$('#intro').hidden) {
      if (ev.key === 'ArrowRight') showIntro(ui.introPage + 1);
      if (ev.key === 'ArrowLeft') showIntro(ui.introPage - 1);
      if (ev.key === 'Escape') closeIntro();
      return;
    }
    if (ev.key === 'Enter' && ev.target.dataset?.input === 'title') { ev.preventDefault(); ev.target.blur(); }
    if (ev.key === 'Enter' && ev.target.id === 'hatch-name') { ev.preventDefault(); closeHatch(); }
    if (ev.key === 'Escape') {
      if (!$('#hatch').hidden) closeHatch();
      else if (ui.sheet) closeSheet();
      else if (ui.overlay === 'timer') closeTimer();
      else if (ui.overlay) act['ov-close']();
    }
  });

  $('#file-in').addEventListener('change', ev => {
    const f = ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    f.text().then(handleImport);
  });

  // Nach Mitternacht oder beim Zurückkommen: Datum & Zählung aktualisieren
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    if (!ui.sheet) render();
    checkDaily(); // neuer Tag (ab 6 Uhr) → Tagesgeschenk
  });

  // ---------- Start ----------
  render();
  // Beim Start: zuerst noch nicht begrüßte Babytiere zeigen, dann das Tagesgeschenk
  setTimeout(() => {
    if (!state.settings.introSeen) showIntro(0);       // allererstes Öffnen: Einführung
    else if (pendingHatches().length) showNextHatch();
    else checkDaily();
  }, 300);
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
