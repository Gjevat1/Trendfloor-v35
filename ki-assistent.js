/* Trendfloor KI-Assistent v003
   Neu: echte KI-Anbindung über deinen eigenen Cloudflare-Server (kostenloses Kontingent).
   Die App ändert weiterhin keine Daten. Es liegt kein KI-Schlüssel in der App,
   nur Server-Adresse und Zugangscode (unter dem Zahnrad im Assistenten).
   Ohne Server oder ohne Internet antwortet weiter die lokale Stichwort-Version.
*/
const TrendfloorKI = (() => {
  'use strict';
  let root, titleEl, history = [], focusInput = false, busy = false, showCfg = false;

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { return {}; } };
  const data = () => ({
    zeit: read('tf_zeit_v1'),
    regie: read('tf_regie_v1'),
    material: read('tf_mat_v1'),
    fahrt: read('tf_fahrt_v1'),
    todo: read('tf_todo_v1'),
    kontakte: read('tf_kontakte_v1')
  });

  /* ---------- Hilfsfunktionen ---------- */
  const isIso = s => /^\d{4}-\d{2}-\d{2}/.test(String(s || ''));
  const dateDE = s => { if (!isIso(s)) return s ? String(s) : '–'; const p = String(s).slice(0, 10).split('-'); return p[2] + '.' + p[1] + '.' + p[0]; };
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; };
  const fmtH = h => (Math.round(h * 100) / 100).toString().replace('.', ',') + ' h';
  const txt = v => (typeof v === 'string' || typeof v === 'number') ? String(v) : '';
  const projectLabel = p => [p.nr, p.name || p.addr || p.client || 'Projekt'].filter(Boolean).join(' · ');
  const timeMin = s => { const m = /^(\d{1,2}):(\d{2})/.exec(String(s || '')); return m ? (+m[1]) * 60 + (+m[2]) : null; };

  const dateOf = e => { const v = e.date ?? e.datum ?? e.d ?? e.day; return isIso(v) ? String(v).slice(0, 10) : ''; };

  /* Stunden eines Eintrags: erst feste Stundenfelder, sonst Beginn/Ende minus Pause */
  const hoursOf = e => {
    for (const k of ['hours', 'h', 'stunden', 'std']) {
      if (e[k] !== undefined && e[k] !== '' && e[k] !== null && isFinite(parseFloat(String(e[k]).replace(',', '.')))) return num(e[k]);
    }
    const a = timeMin(e.start ?? e.von ?? e.from ?? e.begin), b = timeMin(e.end ?? e.bis ?? e.to ?? e.ende);
    if (a !== null && b !== null) { let m = b - a; if (m < 0) m += 1440; m -= num(e.pause ?? e.break ?? 0); return Math.max(0, m / 60); }
    return null;
  };

  const projectOf = (e, projects) => {
    const v = e.projectId ?? e.project ?? e.pid ?? e.proj ?? e.p;
    if (v === undefined || v === null || v === '') return null;
    return projects.find(p => p.id === v || p.nr === v || p.name === v) || null;
  };

  const periods = () => {
    const n = new Date(), t = iso(n), wd = (n.getDay() + 6) % 7;
    const mon = new Date(n); mon.setDate(n.getDate() - wd);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const m = t.slice(0, 7);
    return { heute: [t, t, 'Heute'], woche: [iso(mon), iso(sun), 'Diese Woche'], monat: [m + '-01', m + '-31', 'Dieser Monat'] };
  };

  const entriesIn = (entries, from, to) => entries.filter(e => { const d = dateOf(e); return d && d >= from && d <= to; });
  const sumHours = list => list.reduce((s, e) => s + (hoursOf(e) || 0), 0);
  const anyHours = entries => entries.some(e => hoursOf(e) !== null);

  /* Summe aller Felder mit bestimmtem Namen, auch in verschachtelten Daten */
  const sumKey = (o, names) => {
    let s = 0, found = false;
    (function walk(x) {
      if (Array.isArray(x)) x.forEach(walk);
      else if (x && typeof x === 'object') for (const k of Object.keys(x)) {
        if (names.includes(k.toLowerCase()) && typeof x[k] !== 'object' && isFinite(parseFloat(String(x[k]).replace(',', '.')))) { s += num(x[k]); found = true; }
        else walk(x[k]);
      }
    })(o);
    return found ? s : null;
  };

  /* ---------- Übersicht ---------- */
  function summary() {
    const d = data(), z = d.zeit || {}, projects = Array.isArray(z.projects) ? z.projects : [], entries = Array.isArray(z.entries) ? z.entries : [];
    const reports = Array.isArray(d.regie.reports) ? d.regie.reports : [];
    const mats = d.material.s || {}, trips = Array.isArray(d.fahrt.tage) ? d.fahrt.tage : [], todos = d.todo.proj || {};
    const real = projects.filter(p => !p.kind);
    return { d, projects: real.length, projectsList: real, allProjects: projects, entries, reports, trips,
      materialProjects: Object.keys(mats).length, todoProjects: Object.keys(todos).length };
  }

  /* ---------- Antworten ---------- */
  function hoursAnswer(s, text) {
    if (!s.entries.length) return 'In der Zeiterfassung sind noch keine Einträge gespeichert.';
    if (!anyHours(s.entries)) return 'Ich habe ' + s.entries.length + ' Zeiteinträge gefunden, kann darin aber keine Stundenfelder erkennen. Schreib „Struktur“, dann zeige ich dir die Feldnamen, und ich passe die Auswertung an.';
    const P = periods();
    const key = /heute/.test(text) ? 'heute' : /woche/.test(text) ? 'woche' : /monat/.test(text) ? 'monat' : null;
    const perProject = /projekt|baustelle/.test(text);
    if (!key && !perProject) {
      return ['heute', 'woche', 'monat'].map(k => '• ' + P[k][2] + ': ' + fmtH(sumHours(entriesIn(s.entries, P[k][0], P[k][1])))).join('\n')
        + '\n\nFür eine Aufteilung nach Projekten frag z. B. „Stunden pro Projekt diese Woche“.';
    }
    const [from, to, label] = P[key || 'monat'];
    const list = entriesIn(s.entries, from, to), total = sumHours(list);
    if (!perProject) return label + ': ' + fmtH(total) + ' in ' + list.length + (list.length === 1 ? ' Eintrag.' : ' Einträgen.');
    const groups = {};
    list.forEach(e => {
      const p = projectOf(e, s.allProjects), k = p ? projectLabel(p) : 'ohne erkanntes Projekt';
      groups[k] = (groups[k] || 0) + (hoursOf(e) || 0);
    });
    const rows = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 15);
    return rows.length ? label + ' nach Projekt (gesamt ' + fmtH(total) + '):\n' + rows.map(r => '• ' + r[0] + ': ' + fmtH(r[1])).join('\n') : label + ': keine Einträge.';
  }

  function projectAnswer(s, matches) {
    return matches.slice(0, 5).map(p => {
      const mine = s.entries.filter(e => { const q = projectOf(e, s.allProjects); return q && q === p; });
      const h = mine.length && anyHours(mine) ? ', ' + fmtH(sumHours(mine)) + ' gebucht' : '';
      const lines = ['🏗 ' + projectLabel(p), p.client ? 'Kunde: ' + p.client : '', p.addr ? 'Adresse: ' + p.addr : '', 'Zeiteinträge: ' + mine.length + h].filter(Boolean);
      return lines.join('\n');
    }).join('\n\n');
  }

  function regieAnswer(s) {
    if (!s.reports.length) return 'Im Regiebericht-Modul sind keine Berichte gespeichert.';
    const sorted = s.reports.slice().sort((a, b) => dateOf(b).localeCompare(dateOf(a))).slice(0, 5);
    const title = r => txt(r.projekt) || txt(r.project) || txt(r.baustelle) || txt(r.name) || txt(r.title) || txt(r.nr) || 'Bericht';
    return 'Im Regiebericht-Modul sind ' + s.reports.length + ' Berichte gespeichert. Die letzten:\n' + sorted.map(r => '• ' + dateDE(dateOf(r)) + ' · ' + title(r)).join('\n');
  }

  function kmAnswer(s) {
    if (!s.trips.length) return 'Im Fahrtenbuch sind keine Tage gespeichert.';
    const km = sumKey(s.trips, ['km', 'kilometer', 'strecke']);
    return (s.trips.length === 1 ? 'Im Fahrtenbuch ist 1 Tagesdatensatz gespeichert.' : 'Im Fahrtenbuch sind ' + s.trips.length + ' Tagesdatensätze gespeichert.') + (km !== null ? '\nSumme der erfassten Kilometer: ' + (Math.round(km * 10) / 10).toString().replace('.', ',') + ' km' : '\nKilometerfelder konnte ich nicht erkennen. Schreib „Struktur“ und ich zeige dir die Feldnamen.');
  }

  function shapeAnswer(s) {
    const keysOf = o => (o && typeof o === 'object') ? Object.keys(o).slice(0, 14).join(', ') : '–';
    const parts = [];
    for (const [name, obj] of Object.entries(s.d)) {
      if (!obj || typeof obj !== 'object' || !Object.keys(obj).length) { parts.push(name + ': leer'); continue; }
      const sub = Object.entries(obj).map(([k, v]) => {
        if (Array.isArray(v)) return '  ' + k + ' (Liste, ' + v.length + '): ' + keysOf(v[0]);
        if (v && typeof v === 'object') return '  ' + k + ' (Objekt, ' + Object.keys(v).length + ' Schlüssel)';
        return '  ' + k;
      }).slice(0, 8);
      parts.push(name + ':\n' + sub.join('\n'));
    }
    return 'Datenstruktur (nur Feldnamen, keine Inhalte):\n' + parts.join('\n');
  }

  function answer(q) {
    const s = summary(), text = String(q || '').toLowerCase().trim();

    if (/^(hilfe|help|\?)$|was kannst|funktionen/.test(text))
      return 'Ich lese deine lokal gespeicherten Trendfloor-Daten und fasse sie zusammen. Du kannst fragen:\n• „Übersicht“\n• „Stunden heute / diese Woche / diesen Monat“\n• „Stunden pro Projekt“\n• einen Projektnamen oder eine Projektnummer\n• „Regieberichte“, „Material“, „Fahrtenbuch“, „Aufgaben“\n• „Struktur“ (zeigt Feldnamen der Daten)\nIch ändere nichts. Mit eingerichteter KI-Verbindung (Zahnrad oben) kannst du auch ganz frei fragen.';

    if (/struktur|felder|diagnose/.test(text)) return shapeAnswer(s);

    const matches = s.projectsList.filter(p => [p.nr, p.name, p.addr, p.client].some(v => { const t = txt(v).toLowerCase(); return t.length >= 3 && text.includes(t); }));
    if (matches.length && !/stunden pro projekt/.test(text)) return projectAnswer(s, matches);

    if (/übersicht|status|zusammenfassung/.test(text)) {
      const P = periods(), h = anyHours(s.entries);
      return 'Deine lokale Trendfloor-Übersicht:\n• Projekte: ' + s.projects + '\n• Zeiteinträge: ' + s.entries.length
        + (h ? '\n• Stunden diese Woche: ' + fmtH(sumHours(entriesIn(s.entries, P.woche[0], P.woche[1]))) + '\n• Stunden dieser Monat: ' + fmtH(sumHours(entriesIn(s.entries, P.monat[0], P.monat[1]))) : '')
        + '\n• Regieberichte: ' + s.reports.length + '\n• Material-Projekte: ' + s.materialProjects + '\n• Fahrtenbuch-Tage: ' + s.trips.length + '\n• To-do-Projekte: ' + s.todoProjects;
    }
    if (/stunde|zeit|arbeitszeit|woche|monat|heute/.test(text)) return hoursAnswer(s, text);
    if (/projekt|baustelle/.test(text)) {
      const ps = s.projectsList;
      return ps.length ? (ps.length === 1 ? 'Du hast 1 gespeichertes Projekt:\n' : 'Du hast ' + ps.length + ' gespeicherte Projekte:\n') + ps.slice(0, 30).map(p => '• ' + projectLabel(p)).join('\n') + (ps.length > 30 ? '\n… und ' + (ps.length - 30) + ' weitere' : '') + '\n\nSchreib einen Projektnamen oder eine Nummer für Details.' : 'Ich finde derzeit keine gespeicherten Baustellenprojekte in der Zeiterfassung.';
    }
    if (/regie|bericht/.test(text)) return regieAnswer(s);
    if (/material|schein/.test(text))
      return 'Im Materialschein sind Daten zu ' + s.materialProjects + ' Projekten vorhanden. Die einzelnen Positionen können wir mit der nächsten Ausbaustufe gezielt durchsuchen.';
    if (/fahrt|kilometer|km/.test(text)) return kmAnswer(s);
    if (/todo|to-do|aufgabe/.test(text))
      return 'Die To-do-Liste enthält Daten für ' + s.todoProjects + ' Projekte. In dieser Version nehme ich noch keine Änderungen an Aufgaben vor.';
    return 'Das habe ich nicht verstanden. Probier z. B. „Übersicht“, „Stunden diese Woche“, „Stunden pro Projekt“ oder einen Projektnamen. „Hilfe“ zeigt alle Möglichkeiten. Für freie Fragen richte oben unter dem Zahnrad die KI-Verbindung ein.';
  }

  /* ---------- KI-Verbindung ---------- */
  const CFG_KEY = 'tf_ki_cfg_v1';
  const getCfg = () => { const c = read(CFG_KEY); return { url: txt(c.url).trim(), code: txt(c.code).trim() }; };
  const setCfg = c => { try { localStorage.setItem(CFG_KEY, JSON.stringify(c)); } catch (_) {} };
  const aiReady = () => { const c = getCfg(); return /^https:\/\//i.test(c.url) && !!c.code; };

  const slim = (o, max) => {
    const s = JSON.stringify(o, (k, v) => typeof v === 'string' && v.length > 60 ? v.slice(0, 60) + '…' : v);
    return s && s.length > max ? s.slice(0, max) + '…' : (s || '');
  };

  /* Eintrag auf einfache Felder reduzieren, Projekt und Stunden ergänzen */
  const flat = (e, projects) => {
    const o = {};
    for (const [k, v] of Object.entries(e || {})) {
      if (v === null || ['string', 'number', 'boolean'].includes(typeof v)) o[k] = typeof v === 'string' && v.length > 60 ? v.slice(0, 60) + '…' : v;
    }
    const p = projectOf(e || {}, projects); if (p) o.projekt = projectLabel(p);
    const h = hoursOf(e || {}); if (h !== null) o.stunden = Math.round(h * 100) / 100;
    return o;
  };

  /* Kompakte Datenauswahl, die mit der Frage an die KI geht */
  function buildContext() {
    const s = summary(), P = periods(), now = new Date();
    const wd = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const ctx = {
      heute: iso(now) + ' (' + wd[now.getDay()] + ')',
      anzahl: { projekte: s.projects, zeiteintraege: s.entries.length, regieberichte: s.reports.length, fahrtenbuch_tage: s.trips.length, material_projekte: s.materialProjects, todo_projekte: s.todoProjects },
      projekte: s.projectsList.slice(0, 40).map(p => ({ nr: p.nr, name: p.name, kunde: p.client, adresse: p.addr }))
    };
    if (anyHours(s.entries)) {
      ctx.stunden_summen = {};
      ['heute', 'woche', 'monat'].forEach(k => { ctx.stunden_summen[P[k][2]] = Math.round(sumHours(entriesIn(s.entries, P[k][0], P[k][1])) * 100) / 100; });
    }
    const since = iso(new Date(now.getTime() - 60 * 864e5));
    ctx.zeiteintraege_letzte_60_tage = s.entries.filter(e => dateOf(e) >= since)
      .sort((a, b) => dateOf(b).localeCompare(dateOf(a))).slice(0, 80).map(e => flat(e, s.allProjects));
    ctx.regieberichte_letzte = s.reports.slice().sort((a, b) => dateOf(b).localeCompare(dateOf(a))).slice(0, 10).map(r => flat(r, s.allProjects));
    ctx.fahrtenbuch_letzte = s.trips.slice(-15).map(t => slim(t, 300));
    let str = JSON.stringify(ctx);
    while (str.length > 14000 && ctx.zeiteintraege_letzte_60_tage.length > 5) {
      ctx.zeiteintraege_letzte_60_tage.length = Math.floor(ctx.zeiteintraege_letzte_60_tage.length * 0.8);
      str = JSON.stringify(ctx);
    }
    return ctx;
  }

  async function callKI(q, prior) {
    const c = getCfg(), ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 30000);
    try {
      const r = await fetch(c.url, {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json', 'X-Trendfloor-Code': c.code },
        body: JSON.stringify({
          question: q,
          history: prior.filter(m => !m.pending).map(m => ({ role: m.who === 'Du' ? 'user' : 'assistant', content: String(m.text).slice(0, 600) })),
          context: buildContext()
        })
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) throw new Error('Der Zugangscode stimmt nicht.');
      if (!r.ok || !j.answer) throw new Error(j.error || ('Serverfehler ' + r.status));
      return j.answer;
    } finally { clearTimeout(timer); }
  }

  const errText = err => err && err.name === 'AbortError' ? 'Zeitüberschreitung, der Server hat nicht rechtzeitig geantwortet.'
    : (err && /failed to fetch|networkerror|load failed/i.test(err.message || '') ? 'Keine Verbindung zum Server. Prüfe Internet und Server-Adresse.' : (err && err.message) || 'Unbekannter Fehler.');

  const safeLocal = q => { try { return answer(q); } catch (_) { return 'Beim Lesen der Daten ist ein Fehler aufgetreten. Schreib „Struktur“, dann sehen wir, was in den gespeicherten Daten steht.'; } };
  const trimHistory = () => { if (history.length > 24) history = history.slice(-24); };

  /* ---------- Oberfläche ---------- */
  function render() {
    if (!root) return;
    const c = getCfg(), ready = aiReady();
    const inp = 'width:100%;box-sizing:border-box;border:1px solid #cbd5df;border-radius:10px;padding:10px;font:inherit;margin-top:4px';
    root.innerHTML = `
      <section class="tfki" style="display:flex;flex-direction:column;gap:12px;padding:12px 0;color:#202b38">
        <div style="background:#eef5ff;border:1px solid #c9dcf5;border-radius:14px;padding:13px">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <b style="font-size:1.08rem">🤖 Dein Trendfloor Assistent</b>
            <button class="zb" type="button" id="tfki-cfg-btn" aria-label="Einstellungen" style="min-width:44px">⚙</button>
          </div>
          <div style="font-size:.88rem;margin-top:5px">${ready ? '🟢 KI verbunden' : '⚪ Offline-Modus · KI noch nicht eingerichtet'} · Version v003</div>
          <div style="font-size:.84rem;margin-top:5px;color:#536273">Deine Daten bleiben unverändert. Ich lese nur.</div>
        </div>
        ${showCfg ? `
        <div style="background:#fff;border:1px solid #e0e6ed;border-radius:14px;padding:13px;font-size:.9rem">
          <b>KI-Verbindung</b>
          <label style="display:block;margin-top:8px">Server-Adresse<input id="tfki-url" type="text" autocomplete="off" placeholder="https://trendfloor-ki.dein-name.workers.dev" value="${esc(c.url)}" style="${inp}"></label>
          <label style="display:block;margin-top:8px">Zugangscode<input id="tfki-code" type="password" autocomplete="off" placeholder="${c.code ? 'gespeichert (leer lassen = behalten)' : 'dein Zugangscode'}" style="${inp}"></label>
          <div style="font-size:.8rem;color:#536273;margin-top:8px">Bei Fragen an die KI werden die dafür nötigen Daten (Projekte, letzte Einträge) an deinen eigenen Cloudflare-Server geschickt.</div>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
            <button class="zb g" type="button" id="tfki-save">Speichern und testen</button>
            <button class="zb" type="button" id="tfki-clear">Verbindung entfernen</button>
          </div>
        </div>` : ''}
        <div style="display:flex;flex-wrap:wrap;gap:7px">
          <button class="zb" data-ki="übersicht">📊 Gesamtübersicht</button>
          <button class="zb" data-ki="Projekte anzeigen">🏗 Projekte</button>
          <button class="zb" data-ki="Stunden heute">🕒 Heute</button>
          <button class="zb" data-ki="Stunden diese Woche">🗓 Woche</button>
          <button class="zb" data-ki="Stunden pro Projekt diesen Monat">⏱ Pro Projekt</button>
          <button class="zb" data-ki="Regieberichte">📝 Regieberichte</button>
          <button class="zb" data-ki="Materialschein">📦 Material</button>
          <button class="zb" data-ki="Fahrtenbuch Kilometer">🚗 Fahrten</button>
          <button class="zb" data-ki="To-do Aufgaben">✅ Aufgaben</button>
          <button class="zb" data-ki="Struktur">🔎 Struktur</button>
        </div>
        <div id="tfki-chat" style="min-height:180px;max-height:48vh;overflow:auto;background:#f7f9fc;border:1px solid #e0e6ed;border-radius:14px;padding:12px">
          <div style="background:#fff;border:1px solid #e2e8ef;border-radius:12px;padding:10px;margin-bottom:9px">Hallo! Ich bin dein Trendfloor Assistent. ${ready ? 'Frag mich einfach frei, zum Beispiel: „Wie viele Stunden waren es diese Woche auf Müller?“' : 'Tippe auf eine Schaltfläche oder schreib „Hilfe“. Für freie Fragen richte oben unter ⚙ die KI-Verbindung ein.'}</div>
          ${history.map(m => '<div style="background:' + (m.who === 'Du' ? '#e7f1ff' : '#fff') + ';border:1px solid #e2e8ef;border-radius:12px;padding:10px;margin:8px 0;white-space:pre-line' + (m.pending ? ';color:#536273' : '') + '"><b>' + esc(m.who) + '</b><br>' + esc(m.text) + '</div>').join('')}
        </div>
        <form id="tfki-form" style="display:flex;gap:8px">
          <input id="tfki-input" autocomplete="off" placeholder="Frage Xhevat, er weiß alles" style="flex:1;min-width:0;border:1px solid #cbd5df;border-radius:12px;padding:12px;font:inherit">
          <button class="zb g" type="submit" style="min-width:76px">Senden</button>
        </form>
      </section>`;
    const chat = root.querySelector('#tfki-chat'); if (chat) chat.scrollTop = chat.scrollHeight;
    root.querySelectorAll('[data-ki]').forEach(b => b.addEventListener('click', () => ask(b.dataset.ki, true)));
    const form = root.querySelector('#tfki-form');
    if (form) form.addEventListener('submit', e => { e.preventDefault(); const i = root.querySelector('#tfki-input'); if (i && i.value.trim()) { focusInput = true; ask(i.value.trim(), false); } });
    const cb = root.querySelector('#tfki-cfg-btn'); if (cb) cb.addEventListener('click', () => { showCfg = !showCfg; render(); });
    const sv = root.querySelector('#tfki-save');
    if (sv) sv.addEventListener('click', () => {
      const old = getCfg(), url = (root.querySelector('#tfki-url').value || '').trim(), code = (root.querySelector('#tfki-code').value || '').trim() || old.code;
      setCfg({ url, code }); showCfg = false;
      if (aiReady()) ask('Sag kurz Hallo und nenne mir, wie viele Projekte du siehst.', false);
      else { history.push({ who: 'Trendfloor', text: 'Die Server-Adresse muss mit https:// beginnen, und der Zugangscode darf nicht leer sein.' }); render(); }
    });
    const cl = root.querySelector('#tfki-clear'); if (cl) cl.addEventListener('click', () => { setCfg({}); showCfg = false; render(); });
    if (focusInput) { focusInput = false; const i = root.querySelector('#tfki-input'); if (i) i.focus(); }
  }

  async function ask(q, forceLocal) {
    if (busy) return;
    const useAI = !forceLocal && aiReady() && !/^(hilfe|help|\?|struktur)$/i.test(q.trim());
    if (!useAI) { history.push({ who: 'Du', text: q }, { who: 'Trendfloor', text: safeLocal(q) }); trimHistory(); render(); return; }
    const prior = history.slice(-6);
    busy = true;
    history.push({ who: 'Du', text: q }, { who: 'Trendfloor', text: 'Ich denke nach …', pending: true });
    render();
    let a;
    try { a = await callKI(q, prior); }
    catch (err) { a = 'Die KI ist gerade nicht erreichbar: ' + errText(err) + '\n\nOffline-Antwort:\n' + safeLocal(q); }
    busy = false;
    const m = history.find(x => x.pending); if (m) { m.text = a; delete m.pending; }
    trimHistory(); render();
  }

  return { open(r, t) { root = r; titleEl = t; history = []; showCfg = false; busy = false; render(); }, back() { return false; } };
})();
