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
      settings: { appName: 'Plan', theme: 'meer', calm: false, size: 'm', perBaby: 3, collapsed: {}, showDone: {}, showMore: {}, impOpen: false, tipClosed: false },
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
    world.maps = world.maps.map(m => ({ ...newMap(), ...m, slots: m.slots || {}, finds: m.finds || [], unlocked: m.unlocked?.length ? m.unlocked : [...Wd.START_REGIONS] }));
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
  let state = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { toast('Speichern hat nicht geklappt 😕'); }
  }

  const ui = { view: 'heute', sheet: null, overlay: null, focus: null, timer: null, hatchQueue: [], addDraft: '', addCat: null, addImp: false, addToday: false, confirm: null, refocus: null,
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
  function startPlacing(gid) {
    ui.placing = gid; ui.edit = true;
    if (ui.sheet) { ui.sheet = null; $('#sheet-layer').hidden = true; }
    ui.view = 'tiere';
    render();
  }
  // Zu einem Gebiet scrollen (über die Kachel-Position, nicht über feste Pixel)
  function scrollWorldTo(regionId, smooth) {
    const wrap = $('#world-wrap'), tile = wrap && wrap.querySelector(`.w-region[data-r="${regionId}"]`);
    if (!tile) return;
    const x = tile.offsetLeft - (wrap.clientWidth - tile.clientWidth) / 2;
    wrap.scrollTo({ left: Math.max(0, x), behavior: smooth ? 'smooth' : 'auto' });
    ui.worldX = Math.max(0, x);
  }

  // ---------- Belohnungen ----------
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
      ui.hatchQueue.push(a.id);
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
    else toast(cheer(), () => { state = snap; save(); refresh(); });
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
    else if (s.done) toast(cheer(autoDone ? 'Alle Schritte geschafft – Aufgabe erledigt! 🎉' : 'Mini-Schritt geschafft 🐾'),() => { state = snap; save(); refresh(); });
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
        <button class="pill" data-action="shop">🛍️ Laden</button>
        <button class="pill ${ui.edit ? 'on' : ''}" data-action="w-edit">${ui.edit ? '✓ Fertig' : '✏️ Gestalten'}</button>
      </div>
      ${ui.placing ? `<div class="place-banner">Tippe auf einen ${Wd.byId[ui.placing]?.sky ? '✨ Himmelsplatz' : 'freien Platz'} für <b>${esc(Wd.byId[ui.placing]?.name || '')}</b>
        <button class="link" data-action="place-cancel">Abbrechen</button></div>` : ''}
      <div class="world-wrap" id="world-wrap">${Wd.world({
        map: curMap(), owned: ownedLand(),
        edit: ui.edit, placing: ui.placing, animals: state.animals.map(a => ({ id: a.id, svg: A.draw(a.kind, a.look) })),
      })}</div>
      <div class="region-chips">${shownRegions().map(g => {
        const locked = !curMap().unlocked.includes(g.id);
        return `<button class="rchip ${locked ? 'locked' : ''}" data-action="w-go" data-r="${g.id}">${locked ? '🔒 ' : ''}${esc(g.name)}</button>`;
      }).join('')}</div>
      <p class="hint" style="margin:6px 4px 12px">← Wischen zum Erkunden · Tiere antippen · ${openCount()}/${Wd.REGIONS.length} Gebiete offen</p>
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
      <p class="footer-note">Mit 💛 gemacht</p>`;
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
      wrap.addEventListener('scroll', () => { ui.worldX = wrap.scrollLeft; }, { passive: true });
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
        <p class="pebble-big">🪨 <b>${state.pebbles || 0}</b> Kiesel <span class="muted">· jeder Haken = 1 Kiesel</span></p>
        ${p ? `<div class="unlock-card">
            <div><b>🗺️ Neues Gebiet: ${esc(p.name)}</b><br><span class="muted">${openCount()}/${Wd.REGIONS.length} Gebiete offen · 11 neue Plätze</span></div>
            <button class="big-btn ${state.pebbles >= price ? 'primary' : ''}" data-action="w-unlock" ${state.pebbles >= price ? '' : 'disabled'}>🪨 ${price}</button>
          </div>` : '<p class="muted">Du hast alle 40 Gebiete entdeckt! 🌍</p>'}
        <div class="shop-tabs">${Object.entries(Wd.GROUPS).map(([k, v]) => `<button class="chip ${ui.shopGroup === k ? 'on' : ''}" style="padding:6px 12px" data-action="shop-group" data-g="${k}">${v}</button>`).join('')}</div>
        <div class="shop-grid">${items.map(g => {
          const own = state.inv[g.id] || 0, free = available(g.id), land = g.group === 'land';
          const can = state.pebbles >= g.price && !(land && own);
          return `<div class="shop-item">
            <div class="shop-prev">${Wd.preview(g.id)}</div>
            <b>${esc(g.name)}</b>
            <small class="muted">${land ? esc(g.info || '') : own ? `${own}× gekauft${free ? ` · ${free} in der Kiste` : ''}` : g.sky ? 'für den Himmel' : '&nbsp;'}</small>
            ${land && own ? '<span class="owned">✓ auf der Karte</span>'
              : `<button class="buy ${can ? '' : 'off'}" data-action="buy" data-id="${g.id}" ${can ? '' : 'disabled'}>🪨 ${g.price}</button>`}
            ${!land && free ? `<button class="link" data-action="place" data-id="${g.id}">Platzieren</button>` : ''}
          </div>`;
        }).join('')}</div>`;
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

  function showNextHatch() {
    if (!$('#hatch').hidden || !ui.hatchQueue.length) return;
    const a = state.animals.find(x => x.id === ui.hatchQueue.shift());
    if (!a) return showNextHatch();
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
        <div class="born">${A.draw(a.kind, a.look)}</div>
        <div class="shell shell-bot">${egg}</div>
        <div class="shell shell-top">${egg}</div>
        <div class="burst"><span>✨</span><span>⭐</span><span>✨</span><span>💛</span><span>⭐</span></div>
      </div>
      <div class="hatch-text"><h2>Überraschung!</h2>
        <p>Ein <b>${esc(A.KINDS[a.kind]?.baby)}</b> ist da! 💛<br><span class="muted">${esc(A.ACCS[a.look.acc]?.crochet ? 'Es trägt sogar etwas Gehäkeltes 🧶' : 'Es freut sich riesig über dich.')}</span></p>
        <label for="hatch-name"><b>Wie soll es heißen?</b></label>
        <div class="name-row"><input id="hatch-name" type="text" value="${esc(a.name)}" maxlength="24"><button data-action="hatch-dice" aria-label="Anderer Name">🎲</button></div>
        <button class="big-btn primary" data-action="hatch-ok">Willkommen!</button>
      </div></div>`;
  }
  function closeHatch() {
    const el = $('#hatch');
    const a = state.animals.find(x => x.id === el.dataset.id);
    const name = $('#hatch-name')?.value.trim();
    if (a && name) a.name = name;
    save();
    el.hidden = true; el.innerHTML = '';
    refresh();
    if (ui.hatchQueue.length) setTimeout(showNextHatch, 250);
    else if (ui.unlock) toast(cheer());
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
  async function exportData() {
    const data = JSON.stringify({ type: 'pfoetchenplan-backup', exportedAt: new Date().toISOString(), state }, null, 1);
    const name = `plan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([data], name, { type: 'application/json' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Plan-Backup' });
        return;
      }
    } catch (e) { if (e.name === 'AbortError') return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
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
    nav: el => { ui.view = el.dataset.view; closeAllForNav(); render(); scrollTo(0, 0); },
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
      toast('Aufgabe gelöscht', () => { state = snap; save(); refresh(); });
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
    buy: el => {
      const g = Wd.byId[el.dataset.id];
      if (!g || state.pebbles < g.price) return;
      if (g.group === 'land' && state.inv[g.id]) return;
      state.pebbles -= g.price;
      state.inv[g.id] = (state.inv[g.id] || 0) + 1;
      save();
      if (g.group === 'land') { renderSheet(); render(); toast(`${g.name} ist jetzt auf deiner Karte! 🏞️`); return; }
      startPlacing(g.id);
      toast(`${g.name} gekauft! Tippe auf einen ${g.sky ? '✨ Himmelsplatz' : 'freien Platz'}.`);
    },
    place: el => startPlacing(el.dataset.id),
    'place-cancel': () => { ui.placing = null; render(); },
    'w-unlock': () => {
      const m = curMap(), next = Wd.nextRegion(m.unlocked);
      if (!next) return;
      const price = Wd.regionPrice(openCount());
      if (state.pebbles < price) { toast(`Dafür brauchst du ${price} 🪨 – noch ${price - state.pebbles} Haken!`); return; }
      state.pebbles -= price; m.unlocked.push(next.id);
      save();
      if (ui.sheet) closeSheet();
      ui.view = 'tiere'; render();
      scrollWorldTo(next.id);
      toast(`Neues Gebiet entdeckt: ${next.name}! 🗺️`);
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
      toast('Kategorie gelöscht', () => { state = snap; save(); refresh(); });
    },
    export: () => exportData(),
    import: () => $('#file-in').click(),
    'import-replace': () => { if (pendingImport) { state = migrate(pendingImport); pendingImport = null; save(); } closeSheet(); toast('Backup geladen 💾'); },
    'import-animals': () => {
      const have = new Set(state.animals.map(a => a.id));
      const neu = (pendingImport?.animals || []).filter(a => a && A.KINDS[a.kind] && !have.has(a.id));
      state.animals.push(...neu);
      state.animals.sort((a, b) => (a.bornAt || 0) - (b.bornAt || 0));
      pendingImport = null; save(); closeSheet();
      toast(neu.length ? `${neu.length} Tiere sind umgezogen 🐾` : 'Diese Tiere wohnen schon alle hier 🙂');
    },
    'clear-done': () => {
      const n = state.tasks.filter(t => t.done).length;
      if (!n) { toast('Es gibt nichts aufzuräumen ✨'); return; }
      const snap = clone(state);
      state.tasks = state.tasks.filter(t => !t.done);
      save(); render();
      toast(`${n} erledigte Aufgaben aufgeräumt 🧹`, () => { state = snap; save(); refresh(); });
    },
  };

  function closeAllForNav() {
    if (ui.sheet) { ui.sheet = null; $('#sheet-layer').hidden = true; }
  }

  document.addEventListener('click', ev => {
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
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !ui.sheet) render(); });

  // ---------- Start ----------
  render();
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
