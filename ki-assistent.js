/* Trendfloor KI-Assistent v001
   Erste, lokale und nur lesende Ausbaustufe.
   Es werden keine App-Daten verändert und keine Schlüssel im Browser gespeichert.
*/
const TrendfloorKI = (() => {
  'use strict';
  let root, titleEl, history = [];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) { return {}; } };
  const data = () => ({
    zeit: read('tf_zeit_v1'),
    regie: read('tf_regie_v1'),
    material: read('tf_mat_v1'),
    fahrt: read('tf_fahrt_v1'),
    todo: read('tf_todo_v1'),
    kontakte: read('tf_kontakte_v1')
  });
  const dateDE = s => { if(!s) return '–'; const p=String(s).split('-'); return p.length===3 ? p[2]+'.'+p[1]+'.'+p[0] : s; };
  const projectLabel = p => [p.nr,p.name||p.addr||p.client||'Projekt'].filter(Boolean).join(' · ');
  function summary() {
    const d=data(), z=d.zeit||{}, projects=z.projects||[], entries=z.entries||[];
    const reports=(d.regie.reports||[]), mats=d.material.s||{}, trips=d.fahrt.tage||[];
    const todos=d.todo.proj||{};
    const materialProjects=Object.keys(mats).length;
    const todoProjects=Object.keys(todos).length;
    return {projects:projects.filter(p=>!p.kind).length,entries:entries.length,reports:reports.length,
      materialProjects,trips:trips.length,todoProjects,projectsList:projects.filter(p=>!p.kind)};
  }
  function answer(q) {
    const d=data(), z=d.zeit||{}, s=summary(), text=String(q||'').toLowerCase();
    if(/hilfe|was kannst|funktionen|start/.test(text))
      return 'Ich kann in dieser ersten Ausbaustufe deine lokal gespeicherten Trendfloor-Daten lesen und einfache Übersichten anzeigen. Die sichere Verbindung zu einem KI-Modell wird als nächster Schritt eingerichtet. Bis dahin ändere ich nichts.';
    if(/projekt/.test(text)) {
      const ps=s.projectsList;
      return ps.length ? 'Du hast '+ps.length+' gespeicherte Projekte:\n'+ps.slice(0,30).map(p=>'• '+projectLabel(p)).join('\n') : 'Ich finde derzeit keine gespeicherten Baustellenprojekte in der Zeiterfassung.';
    }
    if(/stunde|zeit|arbeitszeit/.test(text))
      return 'In der Zeiterfassung sind '+s.entries+' Einträge gespeichert. Für eine genaue Auswertung nach Zeitraum oder Mitarbeiter brauche ich im nächsten Schritt die KI-Verbindung.';
    if(/regie|bericht/.test(text))
      return 'Im Regiebericht-Modul sind '+s.reports+' Berichte gespeichert. Ich lese diese derzeit nur aus und ändere keinen Bericht.';
    if(/material|schein/.test(text))
      return 'Im Materialschein sind Daten zu '+s.materialProjects+' Projekten vorhanden. Die einzelnen Positionen können wir mit der nächsten Ausbaustufe gezielt durchsuchen.';
    if(/fahrt|kilometer|km/.test(text))
      return 'Im Fahrtenbuch sind '+s.trips+' Tagesdatensätze gespeichert. Eine Kilometer-Auswertung folgt mit der sicheren KI-Verbindung.';
    if(/todo|aufgabe/.test(text))
      return 'Die To-do-Liste enthält Daten für '+s.todoProjects+' Projekte. In dieser Version nehme ich noch keine Änderungen an Aufgaben vor.';
    if(/übersicht|status|zusammenfassung/.test(text))
      return 'Deine lokale Trendfloor-Übersicht:\n• Projekte: '+s.projects+'\n• Zeiteinträge: '+s.entries+'\n• Regieberichte: '+s.reports+'\n• Material-Projekte: '+s.materialProjects+'\n• Fahrtenbuch-Tage: '+s.trips+'\n• To-do-Projekte: '+s.todoProjects;
    return 'Ich habe deine Frage erhalten. Die lokale Testversion kann bereits Projekte und Datenbereiche erkennen. Für freie Fragen, intelligente Auswertungen und das Erledigen von Aufgaben verbinden wir als nächsten Schritt ein KI-Modell über einen geschützten Server – ohne API-Schlüssel in der App.';
  }
  function render() {
    if(!root) return;
    root.innerHTML = `
      <section class="tfki" style="display:flex;flex-direction:column;gap:12px;padding:12px 0;color:#202b38">
        <div style="background:#eef5ff;border:1px solid #c9dcf5;border-radius:14px;padding:13px">
          <b style="font-size:1.08rem">🤖 Dein Trendfloor Assistent</b>
          <div style="font-size:.88rem;margin-top:5px">Teststufe v001 · lokaler, nur lesender Zugriff</div>
          <div style="font-size:.84rem;margin-top:5px;color:#536273">Deine Daten bleiben unverändert. Die echte KI-Verbindung wird sicher im nächsten Schritt ergänzt.</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:7px">
          <button class="zb" data-ki="übersicht">📊 Gesamtübersicht</button>
          <button class="zb" data-ki="Projekte anzeigen">🏗 Projekte</button>
          <button class="zb" data-ki="Zeiterfassung Stunden">🕒 Stunden</button>
          <button class="zb" data-ki="Regieberichte">📝 Regieberichte</button>
          <button class="zb" data-ki="Materialschein">📦 Material</button>
          <button class="zb" data-ki="Fahrtenbuch Kilometer">🚗 Fahrten</button>
          <button class="zb" data-ki="To-do Aufgaben">✅ Aufgaben</button>
        </div>
        <div id="tfki-chat" style="min-height:180px;max-height:48vh;overflow:auto;background:#f7f9fc;border:1px solid #e0e6ed;border-radius:14px;padding:12px">
          <div style="background:#fff;border:1px solid #e2e8ef;border-radius:12px;padding:10px;margin-bottom:9px">Hallo! Ich bin dein Trendfloor Assistent. Was möchtest du wissen? Tippe zum Beispiel auf „Gesamtübersicht“.</div>
          ${history.map(m=>'<div style="background:'+(m.who==='Du'?'#e7f1ff':'#fff')+';border:1px solid #e2e8ef;border-radius:12px;padding:10px;margin:8px 0;white-space:pre-line"><b>'+esc(m.who)+'</b><br>'+esc(m.text)+'</div>').join('')}
        </div>
        <form id="tfki-form" style="display:flex;gap:8px">
          <input id="tfki-input" autocomplete="off" placeholder="Frage an Trendfloor..." style="flex:1;min-width:0;border:1px solid #cbd5df;border-radius:12px;padding:12px;font:inherit">
          <button class="zb g" type="submit" style="min-width:76px">Senden</button>
        </form>
      </section>`;
    const chat=root.querySelector('#tfki-chat'); if(chat) chat.scrollTop=chat.scrollHeight;
    root.querySelectorAll('[data-ki]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.ki)));
    const form=root.querySelector('#tfki-form');
    if(form) form.addEventListener('submit',e=>{e.preventDefault();const i=root.querySelector('#tfki-input');if(i&&i.value.trim()){ask(i.value.trim());}});
  }
  function ask(q) {
    history.push({who:'Du',text:q},{who:'Trendfloor',text:answer(q)});
    if(history.length>24) history=history.slice(-24);
    render();
  }
  return {open(r,t){root=r;titleEl=t;history=[];render();},back(){return false;}};
})();
