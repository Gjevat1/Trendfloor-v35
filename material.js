const Mat=(()=>{
const KEY='tf_mat_v1';let M={s:{},done:{}},root,titleEl,S={q:'',pid:null,note:'',ed:null,pk:null};
try{M=Object.assign(M,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
M.done=M.done||{};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(M))}catch(e){alert('Speichern nicht möglich!')}};
const Z=()=>Zeit.data(),p2=n=>String(n).padStart(2,'0'),iso=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const dm=s=>{const[a,b,c]=s.split('-');return c+'.'+b+'.'+a};
const num=t=>parseFloat(String(t).replace(',','.')),fmt=n=>String(Math.round(n*100)/100).replace('.',',');
const pname=p=>[p.name,p.addr].filter(Boolean).join(', '),RW=28,rowsOf=id=>M.s[id]||(M.s[id]=[]);
function data(p){const rs=rowsOf(p.id),ds=rs.map(r=>r.d).sort(),rows=rs.map(r=>{const a=num(r.q),b=r.r?num(r.r):0,u=r.u||'';return{date:r.d,name:r.n,who:(r.w||[]).join(', '),out:r.q?r.q+' '+u:'',back:r.r?r.r+' '+u:'',use:r.q&&!isNaN(a)&&!isNaN(b)?fmt(a-b)+' '+u:''}});const zs=(Z().entries||[]).filter(e=>e.projectId===p.id).map(e=>e.date).sort();return{rows,start:zs[0]||ds[0]||'',end:M.done[p.id]||''}}
function detail(p){const d=data(p),n=Math.max(RW,d.rows.length);let tr='';for(let i=0;i<n;i++){const r=d.rows[i]||{};tr+=`<tr data-a="mt-row" data-i="${i}"><td>${r.date?dm(r.date):''}</td><td>${esc(r.name||'')}</td><td>${esc(r.out||'')}</td><td>${esc(r.back||'')}</td><td>${esc(r.use||'')}</td><td>${esc(r.who||'')}</td></tr>`}
return`<div class="zc"><div class="zcard"><b>Kunde:</b> ${esc(p.client||'')}<br><b>Objektnr.:</b> ${esc(p.nr||'')}<br><b>BVH:</b> ${esc(pname(p))}<br><b>Start:</b> ${d.start?dm(d.start):''} &nbsp; <b>Ende:</b> ${d.end?dm(d.end):''}</div><small>Zeile antippen zum Ausfüllen. Datum öffnet den Kalender, Bezeichnung die Materialliste.</small>
<div style="overflow:auto"><table class="pv" style="width:780px;table-layout:auto"><thead><tr>${['Datum','Bezeichnung','Ausgang','Retour','Verbrauch','Arbeiter'].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${tr}</tbody></table></div>
${M.done[p.id]?'<button class="zb l" style="height:50px" data-a="mt-reopen">↺ Projekt wieder öffnen</button>':'<button class="zb l" style="height:50px" data-a="mt-done">✔ Abgeschlossen</button>'}<button class="zb g" style="height:50px" data-a="mt-send">✉ Senden</button>${S.note?'<div class="zcard"><small>'+esc(S.note)+'</small></div>':''}</div>`}
function view(){const D=Z();if(S.pid){const p=D.projects.find(x=>x.id==S.pid);if(p)return detail(p)}
const q=S.q.toLowerCase(),L=D.projects.filter(p=>!p.kind&&(pname(p)+' '+p.nr+' '+p.client).toLowerCase().includes(q));
return`<div class="zc"><input id="mt-q" placeholder="🔍 Projekt suchen" value="${esc(S.q)}">${L.map(p=>`<button class="zh" data-a="mt-open" data-i="${p.id}"><span class="zn" style="text-align:left">${esc(pname(p))}<br><small>${esc(p.nr||'')} ${esc(p.client||'')}</small></span><small>${(M.s[p.id]||[]).length} Pos.</small><span>›</span></button>`).join('')||'<div class="zcard">Noch keine Projekte. Projekte legst du in der Zeiterfassung an.</div>'}</div>`}
function dlg(){const e=S.ed,r=e.r,D=Z(),ws=[...new Set([D.set.name].concat(D.colleagues))],old=e.i<rowsOf(S.pid).length;
if(!r.w.length)r.w.push(D.set.name);
if(S.pk)return`<div class="mo"><div class="mb"><b>Material wählen</b><input id="mt-pq" placeholder="🔍 Suchen" value="${esc(S.pk.q)}"><div class="ml">${D.materials.filter(m=>m.toLowerCase().includes(S.pk.q.toLowerCase())).map(m=>`<button class="li" data-a="mt-ptog" data-v="${esc(m)}">${S.pk.sel.includes(m)?'☑ ':'☐ '}${esc(m)}</button>`).join('')}</div><div class="zrow"><button class="zb l" data-a="mt-pcancel">Abbrechen</button><button class="zb g" style="flex:1" data-a="mt-pok">Fertig (${S.pk.sel.length})</button></div></div></div>`;
return`<div class="mo"><div class="mb"><b>${old?'Zeile bearbeiten':'Neue Zeile'}</b><label>Datum</label><input type="date" id="mt-d" value="${esc(r.d)}"><label>Material</label><button class="zb l" data-a="mt-pick" style="height:46px">${esc(r.n||'Material wählen …')}${e.extra.length?' + '+e.extra.length+' weitere':''}</button><div class="zrow"><input id="mt-qty" inputmode="decimal" placeholder="Menge" value="${esc(r.q)}"><select id="mt-u">${D.units.map(u=>`<option ${u===r.u?'selected':''}>${esc(u)}</option>`).join('')}</select></div><label>Retour (kann später eingetragen werden)</label><input id="mt-r" inputmode="decimal" placeholder="Retour-Menge" value="${esc(r.r)}"><label>Arbeiter</label>${r.w.map((w,k)=>`<div class="zrow"><select id="mt-w${k}">${ws.filter(x=>x===w||!r.w.includes(x)).map(x=>`<option ${x===w?'selected':''}>${esc(x)}</option>`).join('')}</select>${k?`<button class="zb r" data-a="mt-wdel" data-i="${k}">✕</button>`:''}</div>`).join('')}<div class="zrow">${old?'<button class="zb r" data-a="mt-del">Löschen</button>':''}<button class="zb l" data-a="mt-x">Abbrechen</button><button class="zb g" style="flex:1" data-a="mt-save">Speichern</button></div></div></div>`}
function render(){root.firstChild.innerHTML=view()+(S.ed?dlg():'');titleEl.textContent='Materialschein'}
function pdf(p){const{jsPDF}=window.jspdf,D=Z(),d=new jsPDF({unit:'mm',format:'a4'}),dt=data(p),X=10,W=190,RH=6.6,n=new Date(),C=[['Datum',24],['Art.-Nr. und Bezeichnung',62],['Ausgang',24],['Retour',22],['Verbrauch',24],['Arbeiter',34]];
const rows=dt.rows.slice();let first=true;
while(first||rows.length){let y;if(!first)d.addPage();
if(first){d.setFont('helvetica','normal');d.setFontSize(9);d.text('B.T.S.-Trendfloor Raumausstattungs-GmbH · Auenweg 35, 9500 Villach',X,12);d.setFont('helvetica','bold');d.setFontSize(24);d.text('MATERIALSCHEIN',X,27);
d.setFontSize(10.5);d.text('Kunde:',X,42);d.text('Objektnr.:',X,49);d.text('BVH:',X,56);d.text('Start',150,42);d.text('Ende',150,49);
d.setFont('helvetica','normal');d.text(p.client||'',X+28,42);d.text(p.nr||'',X+28,49);d.text([p.name,p.addr].filter(Boolean),X+28,56);
d.setFont('helvetica','bold');d.text(dt.start?dm(dt.start):'',165,42);d.text(dt.end?dm(dt.end):'',165,49);y=68}else y=14;
const cap=Math.floor((262-y-7)/RH),take=rows.splice(0,cap),total=first?cap:take.length,h0=y;
d.setLineWidth(.2);let x=X;d.setFont('helvetica','bold');d.setFontSize(9);C.forEach(c=>{d.text(c[0],x+c[1]/2,y+4.8,{align:'center'});x+=c[1]});y+=7;d.setFont('helvetica','normal');
for(let i=0;i<total;i++){const r=take[i];if(r){let x=X;[dm(r.date),r.name,r.out,r.back,r.use,r.who].forEach((t,k)=>{const c=k===0||(k>=2&&k<=4),L=d.splitTextToSize(String(t),C[k][1]-3).slice(0,2);d.setFontSize(L.length>1?7.5:9);
L.forEach((a,j)=>d.text(a,c?x+C[k][1]/2:x+1.5,y+(L.length>1?3+j*2.9:4.6),{align:c?'center':'left'}));x+=C[k][1]})}d.line(X,y+RH,X+W,y+RH);y+=RH}
x=X;C.slice(0,-1).forEach(c=>{x+=c[1];d.line(x,h0,x,y)});d.setLineWidth(.6);d.line(X,h0+7,X+W,h0+7);d.rect(X,h0,W,y-h0,'S');first=false}
d.setFontSize(10);d.setLineWidth(.3);d.setLineDashPattern([.4,.8],0);d.line(135,272,200,272);d.setLineDashPattern([],0);d.text('Unterschrift',167,278,{align:'center'});
d.setFontSize(9);d.text('Erstellt am '+p2(n.getDate())+'.'+p2(n.getMonth()+1)+'.'+n.getFullYear()+' '+p2(n.getHours())+':'+p2(n.getMinutes())+' von '+D.set.name,X,286);return d}
const fname=p=>'Materialschein_'+(p.nr||(p.name||p.addr||'Projekt').replace(/[^\wäöüÄÖÜß-]+/g,'_'))+'_'+iso(new Date())+'.pdf';
function send(p){if(!window.jspdf)return alert('PDF-Baustein fehlt (jspdf.min.js).');const D=Z(),d=pdf(p),nm='Materialschein_'+(p.nr||(p.name||p.addr||'Projekt').replace(/[^\wäöüÄÖÜß-]+/g,'_'))+'_'+iso(new Date())+'.pdf';
const file=new File([d.output('blob')],nm,{type:'application/pdf'}),to=String(D.set.mail||'').split(/[\s,;]+/).filter(Boolean),subj='Materialschein '+[p.nr,p.client||p.name||p.addr].filter(Boolean).join(' '),body='Materialschein im Anhang.\n\n'+D.set.name;
if(navigator.canShare&&navigator.canShare({files:[file]})){if(to.length&&navigator.clipboard)navigator.clipboard.writeText(to.join(', ')).catch(()=>{});S.note=to.length?'E-Mail-Adressen kopiert – im Feld „An“ einfügen.':'';navigator.share({files:[file],title:subj,text:body}).catch(()=>{});render()}
else{d.save(nm);S.note='PDF gespeichert. Mail-Programm öffnet sich – PDF bitte anhängen.';render();location.href='mailto:'+to.map(encodeURIComponent).join(',')+'?'+(D.set.own?'cc='+encodeURIComponent(D.set.own)+'&':'')+'subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body)}}
return{rows(id){return M.s[id]||[]},add(id,r){(M.s[id]=M.s[id]||[]).push(r);save()},set(id,i,p){const r=(M.s[id]||[])[i];if(r){Object.assign(r,p);save()}},del(id,i){const l=M.s[id]||[];if(i>=0&&i<l.length){l.splice(i,1);save()}},count(id){return(M.s[id]||[]).length},pdfFor(id){const p=Z().projects.find(x=>x.id==id);return p?{d:pdf(p),nm:fname(p)}:null},open(r,t){root=r;titleEl=t;S={q:'',pid:null,note:'',ed:null,pk:null};r.innerHTML='<div></div>';const m=r.firstChild;
m.onclick=ev=>{const b=ev.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,D=Z(),R=()=>rowsOf(S.pid),e=S.ed;
if(a==='mt-open'){S.pid=b.dataset.i;S.note='';scrollTo(0,0);render()}
else if(a==='mt-row'){const i=+b.dataset.i,rs=R(),c=ev.target.closest('td'),k=c?c.cellIndex:0,l=rs[rs.length-1];
S.ed={i,extra:[],r:i<rs.length?JSON.parse(JSON.stringify(rs[i])):{d:l?l.d:iso(new Date()),n:'',q:'',u:D.units[0]||'',r:'',w:[D.set.name]}};
if(k===1)S.pk={q:'',sel:[]};render();if(k===0)try{document.getElementById('mt-d').showPicker()}catch(x){}}
else if(a==='mt-x'){S.ed=null;S.pk=null;render()}
else if(a==='mt-pick'){S.pk={q:'',sel:[]};render()}
else if(a==='mt-ptog'){const s=S.pk.sel,i=s.indexOf(b.dataset.v);i<0?s.push(b.dataset.v):s.splice(i,1);render()}
else if(a==='mt-pcancel'){S.pk=null;render()}
else if(a==='mt-pok'){if(S.pk.sel.length){const[f,...o]=S.pk.sel;e.r.n=f;e.r.u=D.mu[f]||e.r.u;e.extra=o.map(n=>({d:e.r.d,n,q:'',u:D.mu[n]||D.units[0]||'',r:'',w:e.r.w.slice()}))}S.pk=null;render()}
else if(a==='mt-wadd'){const f=[...new Set([D.set.name].concat(D.colleagues))].find(x=>!e.r.w.includes(x));if(f)e.r.w.push(f);render()}
else if(a==='mt-wdel'){e.r.w.splice(+b.dataset.i,1);render()}
else if(a==='mt-save'){const r=e.r;if(!r.n)return alert('Bitte ein Material wählen.');if(!r.d)return alert('Bitte ein Datum wählen.');const u=document.getElementById('mt-u');if(u)r.u=u.value;const rs=R();e.extra.forEach(x=>{x.d=r.d;x.w=r.w.slice()});
if(e.i<rs.length){rs[e.i]=r;rs.splice(e.i+1,0,...e.extra)}else rs.push(r,...e.extra);rs.sort((x,y)=>x.d.localeCompare(y.d));S.ed=null;save();render()}
else if(a==='mt-del'){if(confirm('Zeile löschen?')){R().splice(e.i,1);S.ed=null;save();render()}}
else if(a==='mt-done'){if(confirm('Projekt als abgeschlossen markieren? Das heutige Datum wird als Ende übernommen.')){M.done[S.pid]=iso(new Date());save();render()}}
else if(a==='mt-reopen'){delete M.done[S.pid];save();render()}
else if(a==='mt-send'){const p=D.projects.find(x=>x.id==S.pid);if(p)send(p)}};
m.oninput=m.onchange=ev=>{const i=ev.target.id,v=ev.target.value,e=S.ed,inp=ev.type==='input';
if(i==='mt-q'){if(!inp)return;S.q=v;render();const x=document.getElementById('mt-q');x.focus();x.setSelectionRange(v.length,v.length)}
else if(i==='mt-pq'){if(!inp)return;S.pk.q=v;render();const x=document.getElementById('mt-pq');x.focus();x.setSelectionRange(v.length,v.length)}
else if(e&&i.startsWith('mt-w')){if(inp)return;e.r.w[+i.slice(4)]=v;render()}
else if(e&&i==='mt-d')e.r.d=v;else if(e&&i==='mt-qty')e.r.q=v.trim();else if(e&&i==='mt-r')e.r.r=v.trim();else if(e&&i==='mt-u')e.r.u=v};
render()},
back(){if(S.pk){S.pk=null;render();return true}if(S.ed){S.ed=null;render();return true}if(S.pid){S.pid=null;render();return true}return false}}})();
