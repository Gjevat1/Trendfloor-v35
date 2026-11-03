/* Trendfloor – Regiebericht-Modul
   Liest Zeiterfassungsdaten aus tf_zeit_v1 und speichert Regieberichte separat.
   Bestehende Zeitdaten werden nicht verändert.
*/
const Regie = (() => {
  'use strict';
  const TIME_KEY = 'tf_zeit_v1';
  const KEY = 'tf_regie_v1';
  const DEF = { reports: [], nextNo: 1 };
  let root, titleEl, state = {};

  const $ = id => root.querySelector('#' + id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const readTime = () => { try { return JSON.parse(localStorage.getItem(TIME_KEY) || '{}'); } catch (_) { return {}; } };
  const readStore = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (_) { return {...DEF}; } };
  const store = readStore();
  const saveStore = () => localStorage.setItem(KEY, JSON.stringify(store));
  const timeData = () => (window.Zeit && Zeit.data) ? Zeit.data() : readTime();
  const whoOf = e => [...new Set([(timeData().set||{}).name].concat(e.colleagues||[]).filter(Boolean))];
  const opts = (list, cur) => (!cur || list.includes(cur) ? list : [cur].concat(list)).map(x => `<option ${x===cur?'selected':''}>${esc(x)}</option>`).join('');
  const dateDE = s => { if (!s) return ''; const p=s.split('-'); return p.length===3 ? `${p[2]}.${p[1]}.${p[0]}` : s; };
  const projectName = p => [p?.nr, p?.name || p?.addr || p?.client].filter(Boolean).join(' · ');
  const numberText = n => String(n).padStart(3,'0');
  const blankReport = () => ({
    id: Date.now(), number: numberText(store.nextNo++), projectId: '', from: today(), to: today(),
    rows: [], materials: [], placeDate: '', signatureMode: 'none', signatureName: '', signatureData: '', createdAt: new Date().toISOString()
  });
  const activeProject = () => timeData().projects || [];
  const sourceEntries = () => (timeData().entries || []).slice().sort((a,b) => String(a.date).localeCompare(String(b.date)));
  const reportRows = () => state.report.rows;
  const selectedEntryKeys = () => new Set(reportRows().map(r => String(r.sourceEntryId)));
  const selectedMaterialKeys = () => new Set(state.report.materials.map(m => String(m.sourceKey)));

  const css = `
  .rg{display:flex;flex-direction:column;gap:11px;padding-top:10px;color:#202b38}
  .rg label{font-weight:700;color:#31516f;font-size:.9rem;margin-top:3px}
  .rg input,.rg select,.rg textarea{font:inherit;width:100%;min-width:0;padding:10px;border:1px solid #b9c4d2;border-radius:9px;background:#fff;color:#1d2732}
  .rg textarea{resize:vertical}.rg .rrow{display:flex;gap:8px;align-items:center}.rg .rrow>*{min-width:0}
  .rg .rbtn{border:0;border-radius:10px;background:#0659aa;color:#fff;min-height:42px;padding:9px 13px;font-weight:700;font:inherit;cursor:pointer}
  .rg .rbtn.green{background:#2e8b3e}.rg .rbtn.grey{background:#788492}.rg .rbtn.red{background:#b83b35}
  .rg .panel{background:#fff;border:1px solid #d7dee7;border-radius:11px;padding:11px}
  .rg .section{background:#9bc2e6;color:#18334e;font-weight:800;padding:9px;border-radius:5px}
  .rg .hint{font-size:.8rem;color:#647386}.rg .list{display:flex;flex-direction:column;gap:7px;max-height:40vh;overflow:auto}
  .rg .pick{display:flex;align-items:flex-start;gap:9px;background:#fff;border:1px solid #d6dfe9;border-radius:9px;padding:9px;text-align:left;font:inherit;width:100%;color:#243447}
  .rg .pick input{width:20px;height:20px;flex:none;margin:1px 0 0}.rg .pick small{display:block;color:#647386;margin-top:3px}
  .rg .rowedit{display:grid;grid-template-columns:1fr 1fr 75px;gap:6px;background:#d9e1f2;padding:8px;border-radius:6px;margin-top:6px}
  .rg .rowedit .wide{grid-column:1/-1}.rg .matrow{display:grid;grid-template-columns:minmax(0,1fr) 70px 88px 36px;gap:5px;background:#d9e1f2;padding:7px;border-radius:6px;margin-top:6px}
  .rg .mini{font-size:.78rem;color:#596b7c}.rg .empty{padding:14px;text-align:center;color:#697889;background:#f5f7fa;border-radius:8px}
  .rg .two{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rg .toolbar{display:flex;gap:7px;flex-wrap:wrap}
  .rg .signature{border:1px dashed #7e8b99;border-radius:9px;background:#fff;overflow:hidden}
  .rg canvas{display:block;width:100%;height:155px;touch-action:none;background:#fff}
  .rg .signature-actions{display:flex;gap:8px;padding:7px;background:#f5f7fa}
  .rg .signature-actions button{flex:1}
  .rg .rt{width:100%;border-collapse:collapse;font-size:.88rem}.rg .rt th{background:#9bc2e6;padding:7px 6px;text-align:left}.rg .rt th:nth-child(1){width:24%}.rg .rt th:nth-child(2){width:20%}.rg .rt th:nth-child(3){width:10%}.rg .rt td{background:#d9e1f2;border-top:2px solid #fff;padding:8px 6px;height:36px;word-break:break-word;vertical-align:top}.rg .mt{background:#d9e1f2;border-top:2px solid #fff;padding:9px 6px;min-height:38px;font-size:.88rem}.rg .sigbox{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#9bc2e6;padding:12px;min-height:90px;border-radius:6px;align-items:center}
  @media(max-width:390px){.rg .matrow{grid-template-columns:minmax(0,1fr) 62px 78px 32px}.rg .rowedit{grid-template-columns:1fr 1fr 64px}}
  `;
  if (!document.getElementById('regie-style')) { const st=document.createElement('style'); st.id='regie-style'; st.textContent=css; document.head.appendChild(st); }

  function menu() {
    const list = store.reports.slice().sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
    return `<div class="rg">
      <div class="toolbar"><button class="rbtn green" data-rg="new">＋ Neuen Regiebericht</button></div>
      <div class="hint">Arbeitszeiten und Material werden einzeln aus der Zeiterfassung übernommen. Fertige Berichte bleiben separat gespeichert.</div>
      <label>Gespeicherte Regieberichte</label>
      ${list.length ? list.map(r=>`<div class="panel"><b>Regiebericht Nr. ${esc(r.number)}</b><div class="mini">${esc(r.projectLabel||'Kein Projekt')} · ${dateDE(r.from)} – ${dateDE(r.to)}</div><div class="toolbar" style="margin-top:8px"><button class="rbtn" data-rg="open" data-id="${r.id}">Öffnen</button><button class="rbtn grey" data-rg="printSaved" data-id="${r.id}">Drucken / PDF</button><button class="rbtn red" data-rg="deleteSaved" data-id="${r.id}">Löschen</button></div></div>`).join('') : '<div class="empty">Noch keine Regieberichte vorhanden.</div>'}
    </div>`;
  }
  const own = () => (timeData().set||{}).name || '';
  function importHtml(){const R=state.report,es=sourceEntries().filter(e=>e.date>=R.from&&e.date<=R.to&&(!R.projectId||String(e.projectId)===String(R.projectId))),chosen=selectedEntryKeys();
    return `<div class="panel"><div class="two"><div><label>Von</label><input type="date" id="rg-from" value="${esc(R.from)}"></div><div><label>Bis</label><input type="date" id="rg-to" value="${esc(R.to)}"></div></div><div class="list">${es.map(e=>{const key=String(e.id||e.date+'-'+e.start);return `<label class="pick"><input type="checkbox" data-rg-entry="${esc(key)}" ${chosen.has(key)?'checked':''}><span><b>${dateDE(e.date)} · ${esc(whoOf(e).join(', '))}</b><small>${esc(e.start||'')}–${esc(e.end||'')} · ${esc((e.tasks||[]).join(', ')||e.note||'')}</small></span></label>`;}).join('')||'<div class="empty">Keine Zeiteinträge gefunden.</div>'}</div><button class="rbtn" data-rg="addEntries">Ausgewählte übernehmen</button></div>`;}
  function dlgHtml(){const g=state.dlg,R=state.report,d=timeData();if(!g)return '';let h='';
    if(g.t==='row'){const r=R.rows[g.i];if(!r)return '';h=`<b>Regiearbeit</b><label>Datum</label><input type="date" id="rg-d" value="${esc(r.date)}"><label>Arbeiter</label><button class="rbtn grey" style="text-align:left" data-rg="pickWorker" data-index="${g.i}">${esc(r.worker||'Arbeiter wählen …')}</button><label>Stunden</label><input id="rg-h" inputmode="decimal" value="${esc(r.hours)}"><label>Tätigkeit</label><button class="rbtn grey" data-rg="pickTask" data-index="${g.i}">＋ Tätigkeit aus Liste</button><textarea id="rg-desc" rows="3">${esc(r.description)}</textarea><div class="rrow"><button class="rbtn red" data-rg="dlgDel">Löschen</button><button class="rbtn green" style="flex:1" data-rg="dlgOk">Fertig</button></div>`;}
    else if(g.t==='mat'){const m=R.materials[g.i];if(!m)return '';h=`<b>Material</b><button class="rbtn grey" style="text-align:left" data-rg="pickMat" data-index="${g.i}">${esc(m.name||'Material wählen …')}</button><div class="rrow"><input id="rg-mq" inputmode="decimal" placeholder="Menge" value="${esc(m.qty)}"><select id="rg-mu">${opts(d.units||['Stk'],m.unit)}</select></div><div class="rrow"><button class="rbtn red" data-rg="dlgDel">Löschen</button><button class="rbtn green" style="flex:1" data-rg="dlgOk">Fertig</button></div>`;}
    else if(g.t==='send'){const all=[...new Set(mailListR().concat(R.copyTo||[],state.ownAddr?[state.ownAddr]:[]))];h=`<b>E-Mail senden</b><div class="hint">Empfänger wählen. Kopie für Auftraggeber, Bauleiter oder Architekt: Adresse unten hinzufügen.</div><div class="ml">${all.map(x=>`<button class="li" data-rg="sTog" data-v="${esc(x)}">${state.sendSel.includes(x)?'☑ ':'☐ '}${esc(x)}</button>`).join('')||'<div class="li">Noch keine Adresse.</div>'}</div>${typeof Mat!=='undefined'&&Mat.count(R.projectId)>0?`<button class="li" data-rg="sMat">${state.sendMat?'☑ ':'☐ '}Materialschein dieses Projekts mitsenden</button>`:''}<div class="rrow"><input id="rg-cc" type="email" inputmode="email" placeholder="Adresse Auftraggeber / Bauleiter" value="${esc(state.cc||'')}"><button class="rbtn green" data-rg="sAdd">+</button></div><div class="rrow"><button class="rbtn grey" data-rg="dlgOk">Abbrechen</button><button class="rbtn green" style="flex:1" data-rg="sGo">✉ Senden</button></div>`;}
    else h=`<b>Unterschrift Auftraggeber</b><div class="toolbar"><button class="rbtn ${R.signatureMode==='draw'?'green':'grey'}" data-rg="sigMode" data-mode="draw">Mit Finger unterschreiben</button><button class="rbtn ${R.signatureMode==='name'?'green':'grey'}" data-rg="sigMode" data-mode="name">Name eintippen</button></div>${R.signatureMode==='name'?`<input id="rg-signatureName" value="${esc(R.signatureName)}" placeholder="Name des Auftraggebers">`:''}${R.signatureMode==='draw'?`<div class="signature"><canvas id="rg-signature"></canvas><div class="signature-actions"><button class="rbtn grey" data-rg="clearSignature">Unterschrift löschen</button></div></div>`:''}<button class="rbtn green" data-rg="dlgOk">Fertig</button>`;
    return `<div class="mo"><div class="mb rg">${h}</div></div>`;}
  function editor() {
    const R=state.report, d=timeData(), projects=d.projects||[], p=projects.find(x=>String(x.id)===String(R.projectId));
    const rowsH=Array.from({length:Math.max(22,R.rows.length)},(_,i)=>{const r=R.rows[i]||{};return `<tr data-rg="row" data-index="${i}"><td>${dateDE(r.date)}</td><td>${esc(r.worker||'')}</td><td>${esc(r.hours||'')}</td><td>${esc(r.description||'')}</td></tr>`;}).join('');
    const matH=Array.from({length:8},(_,i)=>{const m=R.materials[i];return `<div class="mt" data-rg="mrow" data-index="${i}">${m?esc(m.name)+(m.qty?' – '+esc(m.qty)+' '+esc(m.unit||''):''):''}</div>`;}).join('');
    const sig=R.signatureMode==='draw'&&R.signatureData?`<img src="${R.signatureData}" style="max-height:60px;max-width:100%">`:R.signatureMode==='name'&&R.signatureName?`<i style="font-size:1.3rem">${esc(R.signatureName)}</i>`:'<span class="hint">Hier tippen zum Unterschreiben</span>';
    const bar=`<div class="toolbar"><button class="rbtn grey" data-rg="menu">← Übersicht</button><button class="rbtn green" data-rg="save">💾 Speichern</button><button class="rbtn" data-rg="preview">👁 Vorschau</button><button class="rbtn" data-rg="print">📄 PDF</button><button class="rbtn" data-rg="send">✉ E-Mail senden</button></div>`;
    return `<div class="rg">${bar}${state.note?`<div class="panel hint">${esc(state.note)}</div>`:''}
      <div class="section">KOPF</div><div class="two"><div><label>Nummer</label><input id="rg-number" value="${esc(R.number)}"></div><div><label>Projekt</label><select id="rg-project"><option value="">– wählen –</option>${projects.map(x=>`<option value="${esc(x.id)}" ${String(x.id)===String(R.projectId)?'selected':''}>${esc(projectName(x))}</option>`).join('')}</select></div></div>
      <div class="panel"><div><b>Projektnr.:</b> ${esc(p?.nr||'–')} · <b>Kunde:</b> ${esc(p?.client||'–')}</div><div style="margin-top:4px"><b>Adresse:</b> ${esc(p?.addr||'–')}</div></div>
      <button class="rbtn grey" data-rg="toggleImp">${state.imp?'▲':'▼'} Arbeitszeiten aus der Zeiterfassung übernehmen</button>${state.imp?importHtml():''}
      <div class="section">REGIEARBEITEN</div><div class="hint">Zeile antippen: Datum öffnet den Kalender, Arbeiter und Tätigkeit die Listen.</div>
      <table class="rt"><thead><tr><th>Datum</th><th>Arbeiter</th><th>Std.</th><th>Tätigkeit</th></tr></thead><tbody>${rowsH}</tbody></table>
      <div class="section">MATERIALVERBRAUCH</div>${matH}
      <div class="section">ORT, DATUM UND UNTERSCHRIFT</div><input id="rg-placeDate" value="${esc(R.placeDate)}" placeholder="z. B. Villach, am 01.11.2026">
      <div class="sigbox" data-rg="sign"><div>${esc(R.placeDate)}</div><div style="text-align:center">${sig}</div></div>${bar}</div>${dlgHtml()}${state.view?`<div class="mo"><div class="mb rg" style="height:96%;max-height:96%;padding:6px"><div class="toolbar"><button class="rbtn grey" data-rg="pvX">← Zurück</button><button class="rbtn" data-rg="print">📄 PDF</button><button class="rbtn" data-rg="send">✉ Senden</button></div><div style="overflow:auto;flex:1;background:#dfe5ec"><iframe id="rg-pv" style="border:0;width:794px;height:1123px;background:#fff"></iframe></div></div></div>`:''}`;
  }
  function closeDlg(del){const g=state.dlg,R=state.report;state.dlg=null;if(g){if(g.t==='row'){const r=R.rows[g.i];if(r&&(del||(!r.hours&&!r.description)))R.rows.splice(g.i,1);}else if(g.t==='mat'){const m=R.materials[g.i];if(m&&(del||!m.name))R.materials.splice(g.i,1);}}render();}
  function drawSignature() {
    const c=$('rg-signature'); if(!c) return;
    const rect=c.getBoundingClientRect(), ratio=Math.max(1,window.devicePixelRatio||1);
    c.width=Math.max(1,Math.round(rect.width*ratio)); c.height=Math.max(1,Math.round(155*ratio));
    const ctx=c.getContext('2d'); ctx.scale(ratio,ratio); ctx.lineWidth=2.2; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle='#15283a';
    if(state.report.signatureData){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,rect.width,155);img.src=state.report.signatureData;}
    let drawing=false, moved=false;
    const point=e=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
    c.onpointerdown=e=>{drawing=true;moved=false;c.setPointerCapture(e.pointerId);const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y);};
    c.onpointermove=e=>{if(!drawing)return;const p=point(e);ctx.lineTo(p.x,p.y);ctx.stroke();moved=true;};
    const end=()=>{if(!drawing)return;drawing=false;if(moved)state.report.signatureData=c.toDataURL('image/png');};
    c.onpointerup=end;c.onpointercancel=end;c.onpointerleave=end;
  }
  function render() { titleEl.textContent='Regiebericht'; root.innerHTML=(state.report?editor():menu())+pickerHtml();if(state.view){const f=root.querySelector('#rg-pv');if(f){f.onload=()=>{try{f.style.height=f.contentDocument.documentElement.scrollHeight+'px';}catch(e){}};f.srcdoc=previewHtml();f.style.zoom=Math.min(1,(window.innerWidth-40)/794);}} if(state.report?.signatureMode==='draw') drawSignature(); }
  function newReport(){state.report=blankReport();state.editingId=null;render();}
  function loadReport(id){const r=store.reports.find(x=>String(x.id)===String(id));if(!r)return;state.report=JSON.parse(JSON.stringify(r));state.editingId=r.id;render();}
  function persist(){if(!state.report)return;const p=activeProject().find(x=>String(x.id)===String(state.report.projectId));state.report.projectLabel=p?projectName(p):'';if(state.editingId){const i=store.reports.findIndex(x=>String(x.id)===String(state.editingId));if(i>=0)store.reports[i]=JSON.parse(JSON.stringify(state.report));else store.reports.push(JSON.parse(JSON.stringify(state.report)));}else{store.reports.push(JSON.parse(JSON.stringify(state.report)));state.editingId=state.report.id;}saveStore();alert('Regiebericht wurde gespeichert.');}
  function addEntries(){const d=timeData(), picked=[...root.querySelectorAll('[data-rg-entry]:checked')].map(x=>x.dataset.rgEntry);if(!picked.length)return alert('Bitte zuerst Arbeitszeiteinträge auswählen.');if(state.report.rows.length>=22)return alert('Die Vorlage hat derzeit 22 Arbeitszeilen.');
    picked.forEach(key=>{const e=(d.entries||[]).find(x=>String(x.id||x.date+'-'+x.start)===key);if(!e)return;const start=String(e.start||'0:0').split(':'),end=String(e.end||'0:0').split(':');const mins=Math.max(0,(+end[0]*60+(+end[1]||0))-(+start[0]*60+(+start[1]||0))-(+e.pause||0));const hours=(mins/60).toString().replace('.',',');const w0=whoOf(e),workers=w0.length?w0:[''];const desc=(e.tasks||[]).join('; ')||e.note||'';workers.forEach(worker=>{if(state.report.rows.length<22)state.report.rows.push({date:e.date||'',worker,hours,description:desc,sourceEntryId:e.id||key});});});render();}
  function addMaterials(){const d=timeData(), picked=[...root.querySelectorAll('[data-rg-material]:checked')].map(x=>x.dataset.rgMaterial);if(!picked.length)return alert('Bitte zuerst Material auswählen.');picked.forEach(key=>{if(state.report.materials.length>=8)return;for(const e of d.entries||[]){const idx=(e.material||[]).findIndex((m,i)=>String(`${e.id||e.date}-${i}`)===key);if(idx>=0){const m=e.material[idx];state.report.materials.push({name:m.name||'',qty:m.qty||'',unit:m.unit||(d.units||['Stk'])[0],sourceKey:key});break;}}});if(state.report.materials.length>=8&&picked.length>8)alert('Es wurden maximal acht Materialpositionen übernommen.');render();}
  const EM = /^\S+@\S+\.\S+$/, mailListR = () => String((timeData().set||{}).mail||'').split(/[\s,;]+/).filter(Boolean);
  const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  async function makePdf(){
    if(!window.jspdf){ alert('PDF-Baustein fehlt (jspdf.min.js).'); return null; }
    const r=state.report, p=activeProject().find(x=>String(x.id)===String(r.projectId)), pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4'}), X=12, W=186;
    const fill=(x,y,w,h,c)=>{pdf.setFillColor(c[0],c[1],c[2]);pdf.rect(x,y,w,h,'F');};
    const G=[197,221,169], L=[226,239,211], H=[155,194,230], R=[217,225,242], C=[.10,.19,.09,.62].map(f=>f*W);
    const logo=(await loadImg('logo.jpg'))||(await loadImg('logo.png'))||(await loadImg('icons/logo.jpg')); const sig=r.signatureMode==='draw'&&r.signatureData?await loadImg(r.signatureData):null;
    if(logo){const hh=22,ww=Math.min(85,hh*logo.naturalWidth/logo.naturalHeight);pdf.addImage(logo,/\.png/i.test(logo.src)?'PNG':'JPEG',X,12,ww,hh);}
    pdf.setFont('helvetica','bold');pdf.setFontSize(14);pdf.text('B.T.S.-Trendfloor',X+W,17,{align:'right'});
    pdf.setFont('helvetica','normal');pdf.setFontSize(9);pdf.text('Raumausstattungs-GmbH',X+W,21.5,{align:'right'});
    pdf.setFontSize(6.5);pdf.text('FN 186383 v · UID-Nr: ATU 47757208 · DVR-Nr: 1028057',X+W,25.5,{align:'right'});
    pdf.setFontSize(8);['Auenweg 35 · Tel. 04242 33350-0','Gewerbepark Süd · Fax 04242 33350-20','A-9500 Villach','villach@bts-trendfloor.at · www.trendfloor.at'].forEach((t,k)=>pdf.text(t,X+W,29.5+k*3.6,{align:'right'}));
    pdf.setDrawColor(150);pdf.setLineWidth(.3);pdf.rect(X,40,W*.58,10,'S');pdf.setFontSize(13);const t0='Regiebericht-Nr.: ';pdf.text(t0,X+2,47);pdf.setFont('helvetica','bold');pdf.text(String(r.number||''),X+2+pdf.getTextWidth(t0),47);
    fill(X,53,W,10,G);pdf.setFontSize(13);pdf.text('REGIEARBEITEN',X+2,60.3);
    fill(X,64,W,9,L);pdf.setFontSize(9);pdf.setFont('helvetica','normal');pdf.text('Projekt-Nr.: ',X+2,69.6);pdf.setFont('helvetica','bold');pdf.text(String(p?.nr||''),X+2+pdf.getTextWidth('Projekt-Nr.: '),69.6);
    pdf.setFont('helvetica','normal');pdf.text('Bauvorhaben: ',X+W*.36,69.6);pdf.setFont('helvetica','bold');pdf.text(String(pdf.splitTextToSize([p?.client||p?.name||'',p?.addr||''].filter(Boolean).join(', '),W*.64-30)[0]||''),X+W*.36+pdf.getTextWidth('Bauvorhaben: '),69.6);
    let y=74;fill(X,y,W,8,H);pdf.setFont('helvetica','bold');pdf.setFontSize(9.5);let x=X;['Datum','Name des Arbeiters:','Stunden:','Arbeitsbeschreibung'].forEach((t,k)=>{pdf.text(t,x+1.5,y+5.4);x+=C[k];});y+=8;
    pdf.setFont('helvetica','normal');pdf.setFontSize(8.5);pdf.setDrawColor(255);pdf.setLineWidth(.4);
    let used=0;r.rows.forEach(q=>{used+=Math.max(1,Math.ceil(String(q.description||'').length/60));});
    const rows=r.rows.concat(Array.from({length:Math.max(0,22-used)},()=>({})));
    const hs=rows.map(q=>Math.max(5.5,pdf.splitTextToSize(String(q.description||''),C[3]-3).length*3.6+1.9)),extra=Math.min(2,Math.max(0,(286-(y+hs.reduce((a,c)=>a+c,0)+3+6.5+44+3+26))/rows.length));
    rows.forEach((q,ri)=>{const ln=pdf.splitTextToSize(String(q.description||''),C[3]-3),h=hs[ri]+extra;
      if(y+h>268){pdf.addPage();y=12;}
      fill(X,y,W,h,R);pdf.line(X,y,X+W,y);let cx=X;C.slice(0,3).forEach(w=>{cx+=w;pdf.line(cx,y,cx,y+h);});
      pdf.text(dateDE(q.date),X+1.5,y+3.9);pdf.text(String(pdf.splitTextToSize(String(q.worker||''),C[1]-3)[0]||''),X+C[0]+1.5,y+3.9);pdf.text(String(q.hours||''),X+C[0]+C[1]+C[2]/2,y+3.9,{align:'center'});
      ln.forEach((t,k)=>pdf.text(t,X+C[0]+C[1]+C[2]+1.5,y+3.9+k*3.6));y+=h;});
    y+=3;if(y+6.5+44+3+26>288){pdf.addPage();y=12;}
    fill(X,y,W,6.5,H);pdf.setFont('helvetica','bold');pdf.setFontSize(10);pdf.text('Materialverbrauch:',X+2,y+4.6);y+=6.5;pdf.setFont('helvetica','normal');pdf.setFontSize(9);
    for(let i=0;i<8;i++){const m=r.materials[i];fill(X,y,W,5.5,R);pdf.line(X,y,X+W,y);if(m&&m.name)pdf.text(m.name+(m.qty?' - '+m.qty+' '+(m.unit||''):''),X+2,y+3.9);y+=5.5;}
    y+=3;fill(X,y,W,26,H);const sx=X+W*.58,cx=sx+(X+W-sx)/2;pdf.setLineWidth(.6);pdf.line(sx,y,sx,y+26);pdf.line(sx,y+7,X+W,y+7);pdf.line(sx,y+21,X+W,y+21);
    pdf.setFontSize(9);pdf.text(r.placeDate||'........................................, am ........................................',X+4,y+20);
    pdf.setFontSize(7.5);pdf.text('Die Richtigkeit der obigen Angaben bestätigt:',cx,y+4.7,{align:'center'});pdf.text('Unterschrift Auftraggeber:',cx,y+24.5,{align:'center'});
    if(sig){const sc=Math.min(66/sig.naturalWidth,12/sig.naturalHeight),w=sig.naturalWidth*sc,h=sig.naturalHeight*sc;pdf.addImage(sig,'PNG',cx-w/2,y+14-h/2,w,h);}
    else if(r.signatureMode==='name'&&r.signatureName){pdf.setFont('times','italic');pdf.setFontSize(14);pdf.text(r.signatureName,cx,y+15.5,{align:'center'});}
    return pdf;
  }
  function fileName(){return 'Regiebericht_'+String(state.report.number||'')+'.pdf';}
  function printReport(){const nm=fileName();makePdf().then(d=>{if(d)d.save(nm);});}
  async function sharePdf(to,withMat){const r=state.report,nm=fileName(),p=activeProject().find(x=>String(x.id)===String(r.projectId)),own0=(timeData().set||{});
    const pdf=await makePdf();if(!pdf)return;const f=new File([pdf.output('blob')],nm,{type:'application/pdf'}),mm=withMat&&typeof Mat!=='undefined'?Mat.pdfFor(r.projectId):null,files=mm?[f,new File([mm.d.output('blob')],mm.nm,{type:'application/pdf'})]:[f],subj='Regiebericht '+r.number+(p?' – '+(p.nr||p.name||''):''),body='Regiebericht'+(mm?' und Materialschein':'')+' im Anhang.\n\n'+(own0.name||'');
    if(navigator.canShare&&navigator.canShare({files})){if(to.length&&navigator.clipboard)navigator.clipboard.writeText(to.join(', ')).catch(()=>{});state.note=to.length?'E-Mail-Adressen kopiert – im Feld „An“ einfügen.':'';render();navigator.share({files,title:subj,text:body}).catch(()=>{});}
    else{pdf.save(nm);if(mm)mm.d.save(mm.nm);state.note='PDF gespeichert. Mail-Programm öffnet sich – PDF bitte anhängen.';render();location.href='mailto:'+to.map(encodeURIComponent).join(',')+'?'+(own0.own?'cc='+encodeURIComponent(own0.own)+'&':'')+'subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);}}
  function previewHtml(){const r=state.report;if(!r)return;const p=activeProject().find(x=>String(x.id)===String(r.projectId));let used=0;r.rows.forEach(x=>{used+=Math.max(1,Math.ceil(String(x.description||'').length/60));});const rows=r.rows.concat(Array.from({length:Math.max(0,22-used)},()=>({})));const mats=Array.from({length:8},(_,i)=>r.materials[i]||{});const signature=r.signatureMode==='draw'&&r.signatureData?`<img class="sigimg" src="${r.signatureData}">`:r.signatureMode==='name'?`<span class="typed">${esc(r.signatureName)}</span>`:'';
    const html=`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Regiebericht ${esc(r.number)}</title><style>
    @page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#222;margin:0;padding:12mm;font-size:9pt}.page{width:186mm;position:relative}.top{height:29mm;display:flex;justify-content:space-between;align-items:flex-start}.brand{width:92mm;padding-top:2mm}.brand img{width:100%;max-height:25mm;object-fit:contain;object-position:left top}.company{text-align:right;font-size:9pt;line-height:1.25}.company b{font-size:16pt}.reportno{width:58%;border:1px solid #aaa;height:10mm;padding:1.5mm 3mm;font-size:15pt;margin:1mm 0 2mm}.green{background:#c5dda9;font-weight:bold;font-size:14pt;padding:1.5mm}.project{display:grid;grid-template-columns:36% 64%;background:#e2efd3;padding:1.5mm;margin-bottom:1.5mm}.headrow{display:grid;grid-template-columns:10% 19% 9% 62%;background:#9bc2e6;font-weight:bold}.headrow div{padding:1.5mm;border-right:1px solid white}.workrow{display:grid;grid-template-columns:10% 19% 9% 62%;min-height:5.5mm;background:#d9e1f2;border-top:1px solid white}.workrow div{padding:.7mm 1.2mm;border-right:1px solid white;overflow-wrap:anywhere}.workrow .hours{text-align:center}.mathead{background:#9bc2e6;font-weight:bold;padding:1.5mm;margin-top:3mm}.matrow{height:5.5mm;background:#d9e1f2;border-top:1px solid white;padding:1mm}.sign{display:grid;grid-template-columns:58% 42%;margin-top:3mm;min-height:26mm;background:#9bc2e6;border:1px solid white}.leftsign{display:flex;align-items:center;padding:2mm 10mm;font-size:9pt}.rightsign{border-left:2px solid white;display:flex;flex-direction:column}.confirm{height:6mm;text-align:center;border-bottom:2px solid white;font-size:8pt;padding:1mm}.sigarea{flex:1;display:flex;align-items:center;justify-content:center;position:relative}.siglabel{height:6mm;text-align:center;border-top:1px solid white;font-size:8pt;padding:1mm}.sigimg{max-width:90%;max-height:13mm;object-fit:contain}.typed{font-family:cursive;font-size:15pt}.muted{font-size:7pt;color:#444}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    </style></head><body><div class="page"><div class="top"><div class="brand"><img src="logo.jpg" onerror="var l=['logo.png','icons/logo.jpg','icons/logo.png'],i=+(this.dataset.i||0);if(i<l.length){this.dataset.i=i+1;this.src=l[i]}" alt="Trendfloor"></div><div class="company"><b>B.T.S.-Trendfloor</b><br>Raumausstattungs-GmbH<br><span class="muted">FN 186383 v · UID-Nr: ATU 47757208 · DVR-Nr: 0289057</span><br>Auenweg 35 · Tel. 04242 33350-0<br>Gewerbepark Süd · Fax 04242 33350-20<br>A-9500 Villach<br>villach@bts-trendfloor.at<br>www.trendfloor.at</div></div>
    <div class="reportno">Regiebericht-Nr.: <b>${esc(r.number)}</b></div><div class="green">REGIEARBEITEN</div><div class="project"><div>Projekt-Nr.: <b>${esc(p?.nr||'')}</b></div><div>Kunde / Bauvorhaben: <b>${esc(p?.client||p?.name||'')}</b><br>Adresse: ${esc(p?.addr||'')}</div></div>
    <div class="headrow"><div>Datum</div><div>Name des Arbeiters</div><div>Stunden</div><div>Arbeitsbeschreibung</div></div>
    ${rows.map(x=>`<div class="workrow"><div>${dateDE(x.date)}</div><div>${esc(x.worker||'')}</div><div class="hours">${esc(x.hours||'')}</div><div>${esc(x.description||'')}</div></div>`).join('')}
    <div class="mathead">Materialverbrauch:</div>${mats.map(x=>`<div class="matrow">${esc(x.name||'')}${x.qty?` – ${esc(x.qty)} ${esc(x.unit||'')}`:''}</div>`).join('')}
    <div class="sign"><div class="leftsign">${esc(r.placeDate||'') || '........................................, am ........................................'}</div><div class="rightsign"><div class="confirm">Die Richtigkeit der obigen Angaben bestätigt:</div><div class="sigarea">${signature}</div><div class="siglabel">Unterschrift Auftraggeber:</div></div></div>
    </div></body></html>`;
    return html;}
  function pickerHtml(){const p=state.pk;if(!p)return '';const d=timeData(),all=p.kind==='worker'?whoOf({}):p.kind==='task'?(d.tasks||[]):(d.materials||[]),L=all.filter(x=>x.toLowerCase().includes(p.q.toLowerCase()));
    return `<div class="mo"><div class="mb rg"><b>${p.kind==='worker'?'Arbeiter':p.kind==='task'?'Tätigkeit':'Material'} wählen</b><input id="rg-pq" placeholder="🔍 Suchen" value="${esc(p.q)}"><div class="ml">${L.map(x=>`<button class="li" data-rg="pkTog" data-v="${esc(x)}">${p.sel.includes(x)?'☑ ':'☐ '}${esc(x)}</button>`).join('')||'<div class="li">Keine Einträge.</div>'}</div><div class="rrow"><button class="rbtn grey" data-rg="pkX">Abbrechen</button><button class="rbtn green" style="flex:1" data-rg="pkOk">Fertig (${p.sel.length})</button></div></div></div>`;}
  function applyPick(){const p=state.pk,d=timeData(),R=state.report;state.pk=null;if(!p.sel.length)return render();
    if(p.kind==='worker'){const r=R.rows[p.idx];if(r){r.worker=p.sel[0];p.sel.slice(1).forEach((w,k)=>{if(R.rows.length<22)R.rows.splice(p.idx+1+k,0,Object.assign({},r,{worker:w}));});}}
    else if(p.kind==='task'){const r=R.rows[p.idx];if(r)r.description=[r.description?r.description.replace(/[;\s]+$/,''):''].concat(p.sel).filter(Boolean).join('; ');}
    else{const u=n=>(d.mu||{})[n]||(d.units||['Stk'])[0];p.sel.forEach((n,k)=>{if(k===0&&p.idx>=0&&R.materials[p.idx]){R.materials[p.idx].name=n;R.materials[p.idx].unit=u(n);}else if(R.materials.length<8)R.materials.push({name:n,qty:'',unit:u(n),sourceKey:''});});}
    render();}
  function act(a,b,ev){
    if(a==='new')return newReport(); if(a==='menu'){state.report=null;state.editingId=null;return render();}
    if(a==='open')return loadReport(b.id); if(a==='printSaved'){const old=state.report,oldId=state.editingId;loadReport(b.id);printReport();state.report=old;state.editingId=oldId;return render();}
    if(a==='deleteSaved'){if(!confirm('Diesen Regiebericht wirklich löschen?'))return;store.reports=store.reports.filter(x=>String(x.id)!==String(b.id));saveStore();return render();}
    if(a==='save')return persist(); if(a==='print'){persistSilently();return printReport();}
    if(a==='addEntries')return addEntries();if(a==='addMaterials')return addMaterials();
    if(a==='addBlankRow'){if(state.report.rows.length>=22)return alert('Maximal 22 Zeilen in dieser Vorlage.');state.report.rows.push({date:today(),worker:(timeData().set||{}).name||'',hours:'',description:'',sourceEntryId:''});return render();}
    if(a==='removeRow'){state.report.rows.splice(+b.index,1);return render();}if(a==='removeMat'){state.report.materials.splice(+b.index,1);return render();}
    if(a==='addBlankMat'){if(state.report.materials.length>=8)return alert('Maximal 8 Materialpositionen in dieser Vorlage.');state.report.materials.push({name:'',qty:'',unit:(timeData().units||['Stk'])[0],sourceKey:''});return render();}
    if(a==='toggleImp'){state.imp=!state.imp;return render();}
    if(a==='row'){const R=state.report,td=ev&&ev.target.closest?ev.target.closest('td'):null,k=td?td.cellIndex:-1;let i=+b.index;if(i>=R.rows.length){if(R.rows.length>=22)return alert('Maximal 22 Zeilen in dieser Vorlage.');i=R.rows.length;R.rows.push({date:today(),worker:own(),hours:'',description:'',sourceEntryId:''});}
      state.dlg={t:'row',i};if(k===1)state.pk={kind:'worker',idx:i,sel:[],q:''};if(k===3)state.pk={kind:'task',idx:i,sel:[],q:''};render();if(k===0)try{root.querySelector('#rg-d').showPicker();}catch(x){}return;}
    if(a==='mrow'){const R=state.report;let i=+b.index;if(i>=R.materials.length){i=R.materials.length;R.materials.push({name:'',qty:'',unit:(timeData().units||['Stk'])[0],sourceKey:''});}
      state.dlg={t:'mat',i};state.pk={kind:'mat',idx:i,sel:[],q:''};return render();}
    if(a==='sign'){state.dlg={t:'sign'};return render();}
    if(a==='preview'){state.view=true;return render();}
    if(a==='pvX'){state.view=false;return render();}
    if(a==='send'){state.view=false;state.dlg={t:'send'};state.sendSel=[...new Set(mailListR().concat(state.report.copyTo||[]))];state.cc='';state.sendMat=typeof Mat!=='undefined'&&Mat.count(state.report.projectId)>0;state.ownAddr=(timeData().set||{}).own||'';return render();}
    if(a==='sMat'){state.sendMat=!state.sendMat;return render();}
    if(a==='sTog'){const q=state.sendSel,i=q.indexOf(b.v);i<0?q.push(b.v):q.splice(i,1);return render();}
    if(a==='sAdd'){const v=(state.cc||'').trim();if(!v)return;if(!EM.test(v))return alert('Bitte eine gültige E-Mail-Adresse eingeben.');const R=state.report;R.copyTo=R.copyTo||[];if(!R.copyTo.includes(v)&&!mailListR().includes(v))R.copyTo.push(v);if(!state.sendSel.includes(v))state.sendSel.push(v);state.cc='';render();const n=root.querySelector('#rg-cc');if(n)n.focus();return;}
    if(a==='sGo'){const to=state.sendSel.slice();state.dlg=null;persistSilently();render();return sharePdf(to,state.sendMat);}
    if(a==='dlgOk')return closeDlg(false);if(a==='dlgDel')return closeDlg(true);
    if(a==='pickWorker'||a==='pickTask'||a==='pickMat'){state.pk={kind:a==='pickWorker'?'worker':a==='pickTask'?'task':'mat',idx:+b.index,sel:[],q:''};return render();}
    if(a==='pkX'){state.pk=null;return render();}
    if(a==='pkTog'){const s=state.pk.sel,i=s.indexOf(b.v);i<0?s.push(b.v):s.splice(i,1);return render();}
    if(a==='pkOk')return applyPick();
    if(a==='sigMode'){state.report.signatureMode=b.mode;return render();}if(a==='clearSignature'){state.report.signatureData='';drawSignature();return;}
  }
  function persistSilently(){if(!state.report)return;const p=activeProject().find(x=>String(x.id)===String(state.report.projectId));state.report.projectLabel=p?projectName(p):'';const i=store.reports.findIndex(x=>String(x.id)===String(state.report.id));if(i>=0)store.reports[i]=JSON.parse(JSON.stringify(state.report));else store.reports.push(JSON.parse(JSON.stringify(state.report)));state.editingId=state.report.id;saveStore();}
  function onInput(e){const t=e.target;if(!state.report)return;if(t.id==='rg-pq'){if(state.pk&&e.type==='input'){state.pk.q=t.value;render();const x=root.querySelector('#rg-pq');x.focus();x.setSelectionRange(t.value.length,t.value.length)}return;}
    if(t.id==='rg-number')state.report.number=t.value;
    else if(t.id==='rg-project'){state.report.projectId=t.value;render();}
    else if(t.id==='rg-from'){state.report.from=t.value;render();}
    else if(t.id==='rg-to'){state.report.to=t.value;render();}
    else if(state.dlg&&t.id==='rg-cc')state.cc=t.value;
    else if(state.dlg&&t.id==='rg-d'){const r=state.report.rows[state.dlg.i];if(r)r.date=t.value;}
    else if(state.dlg&&t.id==='rg-h'){const r=state.report.rows[state.dlg.i];if(r)r.hours=t.value;}
    else if(state.dlg&&t.id==='rg-desc'){const r=state.report.rows[state.dlg.i];if(r)r.description=t.value;}
    else if(state.dlg&&t.id==='rg-mq'){const m=state.report.materials[state.dlg.i];if(m)m.qty=t.value;}
    else if(state.dlg&&t.id==='rg-mu'){const m=state.report.materials[state.dlg.i];if(m)m.unit=t.value;}
    else if(t.id==='rg-placeDate')state.report.placeDate=t.value;
    else if(t.id==='rg-signatureName')state.report.signatureName=t.value;
    else if(t.dataset.rgRow!==undefined){const r=state.report.rows[+t.dataset.rgRow];if(r){if(t.dataset.field==='taskadd'){if(t.value&&e.type==='change'){r.description=(r.description?r.description.replace(/[;\s]+$/,'')+'; ':'')+t.value;render();}}else r[t.dataset.field]=t.value;}}
    else if(t.dataset.rgMat!==undefined){const m=state.report.materials[+t.dataset.rgMat];if(m){m[t.dataset.field]=t.value;if(t.dataset.field==='name'&&e.type==='change'){const u=(timeData().mu||{})[t.value];if(u)m.unit=u;render();}}}
  }
  function open(r,t){root=r;titleEl=t;state={report:null,editingId:null,dlg:null,imp:false};if(!root._regieBound){root._regieBound=true;root.addEventListener('click',e=>{const b=e.target.closest('[data-rg]');if(b)act(b.dataset.rg,b.dataset,e);});root.addEventListener('input',onInput);root.addEventListener('change',onInput);}render();}
  function back(){if(state.pk){state.pk=null;render();return true;}if(state.view){state.view=false;render();return true;}if(state.dlg){closeDlg(false);return true;}if(state.report){state.report=null;state.editingId=null;render();return true;}return false;}
  return {open,back};
})();
