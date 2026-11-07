const Zeit=(()=>{
const KEY='tf_zeit_v1';
const DEF={entries:[],projects:[],lf:[],step:15,mu:{},cars:[],lastCar:'',set:{name:'Xhevat',mail:'',own:'',hasCar:false,car:''},units:['Stk','m','m²','lfm','Pkg','Karton','Sack','Rolle','Eimer','Kanister','Liter','kg'],std:{md:{start:'07:00',end:'16:00',pf:'12:00',pt:'13:00'},fr:{start:'07:00',end:'14:00',pf:'',pt:''}},
tasks:['Altbelag entfernen','Untergrund vorbereiten','Spachteln','Schleifen','Grundieren','Vinyl verlegen','Parkett verlegen','Laminat verlegen','Teppich verlegen','Sockelleisten montieren','Versiegeln / Lackieren','Malerarbeiten','Material laden','Aufräumen / Reinigung'],
colleagues:[],materials:['Schleifpapier','Lack','Grundierung','Spachtelmasse','Vinylboden','Parkett','Laminat','Sockelleisten','Kleber']};
let D=load(),view='menu',root,titleEl,S={};
function load(){let d=JSON.parse(JSON.stringify(DEF));try{Object.assign(d,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}[['Urlaub',900001,'urlaub'],['Krankenstand',900002,'krank'],['Feiertag',900003,'feiertag']].forEach(a=>{if(!d.projects.some(p=>p.id===a[1]))d.projects.push({id:a[1],name:a[0],nr:'',client:'',addr:'',tel:'',wb:{name:1,client:0,addr:0,tel:0},kind:a[2]})});d.lf=d.lf||[];return d}
function fixPause(){let ch=false;D.entries.forEach(e=>{if(e.pm||!e.start||!e.end||!(+e.pause>0))return;const x=dt(e.date).getDay()===5?D.std.fr:D.std.md;if(x.pf&&x.pt&&+e.pause===tm(x.pt)-tm(x.pf)&&pFit(e)===0){e.pause=0;ch=true}});if(ch)save()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){alert('Speichern nicht möglich!')}}
const p2=n=>String(n).padStart(2,'0'),esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const iso=d=>d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate());
const dt=s=>new Date(s+'T12:00:00');
const TAGE=['So','Mo','Di','Mi','Do','Fr','Sa'],MON=['Jänner','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const fd=s=>{const d=dt(s);return TAGE[d.getDay()]+'. '+p2(d.getDate())+'.'+p2(d.getMonth()+1)+'.'+String(d.getFullYear()).slice(2)};
const tm=t=>{const[a,b]=t.split(':');return +a*60+ +b},ft=m=>p2(Math.floor(m/60))+':'+p2(m%60);
const hrs=e=>Math.max(0,tm(e.end)-tm(e.start)-(+e.pause||0))/60;
const fh=h=>(Math.round(h*100)/100).toString().replace('.',',')+' h';
const addD=(s,n)=>{const d=dt(s);d.setDate(d.getDate()+n);return iso(d)};
const kw=s=>{const d=dt(s);d.setDate(d.getDate()+3-((d.getDay()+6)%7));const y=new Date(d.getFullYear(),0,4);return 1+Math.round(((d-y)/864e5-3+((y.getDay()+6)%7))/7)};
const monday=s=>addD(s,-((dt(s).getDay()+6)%7));
const on=s=>D.entries.filter(e=>e.date===s).sort((a,b)=>a.start.localeCompare(b.start));
const pname=id=>{const p=D.projects.find(x=>x.id===id);return p?(p.nr?p.nr+' · ':'')+(p.name||p.addr||''):''};
const stdFor=d=>{const x=dt(d).getDay()===5?D.std.fr:D.std.md;return{start:x.start,end:x.end,pause:x.pf&&x.pt?tm(x.pt)-tm(x.pf):0}};
const pFit=e=>{const x=dt(e.date).getDay()===5?D.std.fr:D.std.md;if(!(x.pf&&x.pt))return 0;return Math.max(0,Math.min(tm(x.pt),tm(e.end))-Math.max(tm(x.pf),tm(e.start)))};
const isAbs=id=>{const p=D.projects.find(x=>x.id===id);return !!(p&&p.kind)};
function reloadDay(nav){let e=S.e;if(!e)return false;let ch=false;
const x=e.projectId?D.entries.find(q=>q.date===e.date&&q.projectId===e.projectId&&q.id!==e.id):null;
if(x){S.e=JSON.parse(JSON.stringify(x));return true}
if(nav&&e.id){const n=newEntry(e.date);n.projectId=e.projectId;n.auto=e.auto;S.e=e=n;ch=true}
if(isAbs(e.projectId)){const s=stdFor(e.date);Object.assign(e,{start:s.start,end:s.end,pause:s.pause,tasks:[],colleagues:[],material:[]});ch=true}
if(!e.id&&(e.tasks.length||e.colleagues.length)){e.tasks=[];e.colleagues=[];ch=true}
return ch}
const mrow=(e,m)=>({d:e.date,n:m.name,q:String(m.qty||''),u:m.unit||'',r:'',w:[D.set.name].filter(Boolean)});
function flushMat(){const e=S.e;if(!e||!e.projectId||typeof Mat==='undefined')return;(e.material||[]).forEach(m=>{if(!m.sync){Mat.add(e.projectId,mrow(e,m));m.sync=1}})}
function migrateMat(){if(D.migMat||typeof Mat==='undefined')return;D.entries.forEach(x=>{if(!x.projectId||!x.material)return;x.material.forEach(m=>{if(m.sync)return;const l=Mat.rows(x.projectId);if(!l.some(r=>r.d===x.date&&r.n===m.name&&String(r.q||'')===String(m.qty||'')&&(r.u||'')===(m.unit||'')))Mat.add(x.projectId,mrow(x,m));m.sync=1})});D.migMat=1;save()}
const fdl=s=>{const q=dt(s);return TAGE[q.getDay()]+'., '+p2(q.getDate())+'.'+p2(q.getMonth()+1)+'.'+q.getFullYear()};
function wbQuota(e){const ne=1+D.entries.filter(x=>x.date===e.date&&x.id!==e.id).length,g=dt(e.date).getDay(),base=(g===0||g===6)?2:4,n=Math.max(ne,base);return Math.max(1,Math.floor(n/ne))}
const SOLL=[0,8,8,8,8,7,0],URLAUBSTAGE=24;
const absKind=e=>{const p=D.projects.find(x=>x.id===e.projectId);return p&&p.kind?p.kind:'arbeit'};
function statDef(){return{y:String(new Date().getFullYear()),m:'',w:'',p:'',a:'me',d:''}}
function statCalc(f){const me=D.set.name||'Ich',today=iso(new Date());
const inP=e=>{if(f.d)return e.date===f.d;if(f.y&&e.date.slice(0,4)!==f.y)return false;if(f.m&&+e.date.slice(5,7)!==+f.m)return false;if(f.w&&kw(e.date)!==+f.w)return false;return true};
const sel=D.entries.filter(e=>inP(e)&&(!f.p||String(e.projectId)===String(f.p))&&(f.a==='me'||f.a==='all'||(e.colleagues||[]).includes(f.a)));
const wt=e=>f.a==='all'?1+(e.colleagues||[]).length:1;
const cat={arbeit:{h:0,d:new Set()},urlaub:{h:0,d:new Set()},krank:{h:0,d:new Set()},feiertag:{h:0,d:new Set()}},byP={},byW={};
sel.forEach(e=>{const h=hrs(e),k=absKind(e);cat[k].h+=h*wt(e);cat[k].d.add(e.date);byP[e.projectId]=(byP[e.projectId]||0)+h*wt(e);byW[me]=(byW[me]||0)+h;(e.colleagues||[]).forEach(c=>{byW[c]=(byW[c]||0)+h})});
const total=cat.arbeit.h+cat.urlaub.h+cat.krank.h+cat.feiertag.h;
let soll=null;if(f.a==='me'&&!f.p&&(f.d||f.y)){soll=0;const add=s=>{if(s<=today)soll+=SOLL[dt(s).getDay()]};if(f.d)add(f.d);else{for(let d=dt(f.y+'-01-01');d.getFullYear()===+f.y;d.setDate(d.getDate()+1)){const s=iso(d);if(f.m&&+s.slice(5,7)!==+f.m)continue;if(f.w&&kw(s)!==+f.w)continue;add(s)}}}
let yr=null;if(f.y){const ys=D.entries.filter(e=>e.date.slice(0,4)===f.y),pick=k=>{const l=ys.filter(e=>absKind(e)===k);return{d:new Set(l.map(e=>e.date)).size,h:l.reduce((s,e)=>s+hrs(e),0)}};yr={urlaub:pick('urlaub'),krank:pick('krank'),feiertag:pick('feiertag')}}
return{me,sel,cat,byP,byW,total,soll,yr}}
function rStat(){const f=S.f||(S.f=statDef()),r=statCalc(f),days=c=>c.d.size;
const yrs=[...new Set(D.entries.map(e=>e.date.slice(0,4)).concat([String(new Date().getFullYear())]))].sort().reverse();
const names=[...new Set(D.entries.flatMap(e=>e.colleagues||[]))].sort();
const o=(v,t,c)=>`<option value="${esc(v)}" ${String(c)===String(v)?'selected':''}>${esc(t)}</option>`;
const sc=(id,lab,opts)=>`<label>${lab}</label><select id="st-${id}">${opts}</select>`;
const kws=Array.from({length:53},(_,i)=>o(i+1,'KW '+(i+1),f.w)).join('');
const row=(a,b)=>`<div class="zrow" style="justify-content:space-between;padding:3px 0"><span>${a}</span><b>${b}</b></div>`;
const L={arbeit:'Arbeit',urlaub:'Urlaub',krank:'Krankenstand',feiertag:'Feiertag'};
const catRows=Object.keys(L).filter(k=>r.cat[k].h>0).map(k=>row(L[k]+' ('+days(r.cat[k])+(days(r.cat[k])===1?' Tag':' Tage')+')',fh(r.cat[k].h))).join('');
const diff=r.soll===null?'':r.total-r.soll,sollRow=r.soll===null?'':row('Soll'+(f.d?'':' bis heute'),fh(r.soll))+row(diff>=0?'Überstunden':'Minusstunden',(diff>0?'+':'')+fh(diff));
const pl=Object.keys(r.byP).sort((a,b)=>r.byP[b]-r.byP[a]).map(id=>row(esc(pname(+id)||'—'),fh(r.byP[id]))).join('');
const wl=Object.keys(r.byW).sort((a,b)=>r.byW[b]-r.byW[a]).map(n=>row(esc(n),fh(r.byW[n]))).join('');
const y=r.yr,yrCard=y?`<div class="zcard"><b>Jahr ${esc(f.y)}</b>`+row('Urlaub genommen',y.urlaub.d+' von '+URLAUBSTAGE+' Tagen ('+fh(y.urlaub.h)+')')+row('Urlaub übrig',Math.max(0,URLAUBSTAGE-y.urlaub.d)+' Tage')+row('Krankenstand',y.krank.d+(y.krank.d===1?' Tag':' Tage')+' ('+fh(y.krank.h)+')')+row('Feiertage',y.feiertag.d+(y.feiertag.d===1?' Tag':' Tage')+' ('+fh(y.feiertag.h)+')')+'</div>':'';
const list=r.sel.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,80).map(e=>`<div class="zcard"><b>${fdl(e.date)}</b> · ${esc(pname(e.projectId)||'—')} · ${fh(hrs(e))}${(e.tasks||[]).length?'<br><small>'+esc(e.tasks.join(', '))+'</small>':''}</div>`).join('');
return`<div class="zc"><div class="zcard">
${sc('y','Jahr',o('','Alle Jahre',f.y)+yrs.map(v=>o(v,v,f.y)).join(''))}
${sc('m','Monat',o('','Alle Monate',f.m)+MON.map((n,i)=>o(i+1,n,f.m)).join(''))}
${sc('w','Kalenderwoche',o('','Alle KW',f.w)+kws)}
${sc('p','Baustelle',o('','Alle Baustellen',f.p)+D.projects.map(p=>o(p.id,pname(p.id)||p.name,f.p)).join(''))}
${sc('a','Arbeiter',o('me',r.me+' (ich)',f.a)+o('all','Alle Arbeiter zusammen',f.a)+names.map(n=>o(n,n,f.a)).join(''))}
<label>Tag</label><input type="date" id="st-d" value="${esc(f.d)}">
<button class="zb l" style="margin-top:8px;width:100%" data-a="st-reset">Filter zurücksetzen</button></div>
<div class="zcard"><div style="font-size:1.3rem;font-weight:700">Gesamt: ${fh(r.total)}</div>${f.a==='all'?'<small>alle Arbeiter zusammengerechnet</small>':''}${catRows}${sollRow}</div>
${yrCard}${pl?'<div class="zcard"><b>Nach Baustelle</b>'+pl+'</div>':''}${wl&&Object.keys(r.byW).length>1?'<div class="zcard"><b>Nach Arbeiter</b>'+wl+'</div>':''}
${list?'<b>Einträge</b>'+list:'<div class="zcard">Keine Einträge für diese Auswahl.</div>'}</div>`}
function newEntry(date){date=date||iso(new Date());return Object.assign({id:0,date,projectId:(D.lastProj&&D.projects.some(p=>p.id===D.lastProj&&!p.done&&!p.kind))?D.lastProj:'',wbt:[],auto:(D.set.hasCar?D.set.car:D.lastCar)||'',tasks:[],colleagues:[],material:[],note:''},stdFor(date))}
const css=document.createElement('style');css.textContent=`
.zc{display:flex;flex-direction:column;gap:10px;padding-top:12px}
.zc label{font-weight:700;font-size:.9rem;color:#0659AA;margin-top:6px}
.dtbox{position:relative;flex:1;display:flex;align-items:center;padding:10px;border:1px solid #b9c4d2;border-radius:10px;background:#fff;font:inherit;min-height:44px}.dtbox span{pointer-events:none}.zc .dtbox input{position:absolute;inset:0;width:100%;height:100%;opacity:0;padding:0;border:0}
.zc input,.zc select,.zc textarea{font:inherit;padding:10px;border:1px solid #b9c4d2;border-radius:10px;background:#fff;min-width:0;width:100%}
.zrow{display:flex;gap:8px;align-items:center}
.zb{border:0;background:#0659AA;color:#fff;border-radius:10px;min-width:44px;height:44px;font-size:1.1rem;font-weight:700;padding:0 12px}
.zb.g{background:#2e8b3e}.zb.r{background:#c0392b}.zb.l{background:#8a95a3}
.zmenu{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.zt{border:0;border-radius:16px;color:#fff;font-weight:700;font-size:1.1rem;padding:22px 6px;background:linear-gradient(#3f86d0,#0659AA);box-shadow:0 3px 8px rgba(0,0,0,.25);display:flex;flex-direction:column;align-items:center;gap:8px}
.zt span{font-size:2.6rem;line-height:1}.zt.w{grid-column:1/3}
.ztime{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.zs{background:#fff;border-radius:12px;padding:6px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.15);display:flex;flex-direction:column;gap:4px}
.zs small{color:#5b6572;font-weight:700}.zs b{font-size:1.5rem}.zs .zb{width:100%;height:40px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{border:1px solid #0659AA;background:#fff;color:#0659AA;border-radius:20px;padding:9px 14px;font-size:.95rem}
.chip.on{background:#0659AA;color:#fff}.chip.add{border-style:dashed}
.zsum{background:#e5f4ea;border-radius:10px;padding:10px;font-weight:700;text-align:center;color:#1b6b2e}
.zcard{background:#fff;border-radius:12px;padding:12px;box-shadow:0 1px 4px rgba(0,0,0,.15);line-height:1.4}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal .h{text-align:center;font-size:.75rem;font-weight:700;color:#5b6572}
.cd{background:#fff;border:2px solid transparent;border-radius:10px;min-height:54px;padding:4px 0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;font-size:.95rem}
.cd.t{border-color:#1DB14C}.cd.s{background:#0659AA;color:#fff}.cd.o{opacity:.35}
.dots{display:flex;gap:3px;height:9px}.dots i{width:8px;height:8px;border-radius:50%;background:#e06f1f}.cd.s .dots i{background:#fff}
.wk{display:flex;align-items:center;gap:10px;background:#fff;border:2px solid transparent;border-radius:10px;padding:12px}
.wk.s{background:#0659AA;color:#fff}.wk.t{border-color:#1DB14C}.wk .dots{flex:1}.wk.s .dots i{background:#fff}
.mo{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:50;display:flex;align-items:flex-end;justify-content:center}.mb{background:#fff;width:100%;max-width:560px;max-height:88%;border-radius:18px 18px 0 0;padding:14px;display:flex;flex-direction:column;gap:10px}.mb input{font:inherit;padding:10px;border:1px solid #b9c4d2;border-radius:10px}.ml{overflow:auto;flex:1;display:flex;flex-direction:column;gap:6px;min-height:120px}.mr{text-align:left;border:1px solid #b9c4d2;background:#fff;border-radius:10px;padding:10px 12px;font:inherit}.mqr{margin:-2px 0 4px;padding-left:12px}.mqr input,.mqr select{padding:8px!important}.mr.on{background:#e5f0fb;border-color:#0659AA;font-weight:700}
.seg{display:flex;gap:6px}.seg button{flex:1}
.zh{display:flex;align-items:center;gap:12px;border:0;background:#fff;border-radius:14px;padding:16px 14px;box-shadow:0 1px 4px rgba(0,0,0,.15);font:inherit;text-align:left;width:100%}.zh .zi{font-size:1.6rem}.zh .zn{font-weight:700;flex:1}.zh small{color:#5b6572}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.sgrid label{margin:0;display:flex;flex-direction:column;gap:4px;font-size:.85rem}
.lb{max-height:48vh;overflow:auto;background:#fff;border:1px solid #9aa5b1;border-radius:10px}.li{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid #e3e7ec;background:#fff;padding:10px 12px;font:inherit;min-height:40px}.li:active{background:#dbeafe}
.pv{border-collapse:collapse;table-layout:fixed;width:831px;font-size:13px}.pv th{border:2px solid #000;padding:4px 2px;background:#fff}.pv tbody{border:2px solid #000}.pv td{border-left:1px solid #000;border-right:1px solid #000;border-bottom:1px dotted #777;padding:2px 4px;height:30px;overflow:hidden;word-break:break-word}.pv tr:last-child td{border-bottom:0}.pv td:last-child{border-bottom:0}
.zst{border-radius:12px;padding:12px 14px;font-weight:700;text-align:center;border:2px solid}.zst.o{background:#fff1e0;color:#9a4f0a;border-color:#f0a24b}.zst.b{background:#e3f0fd;color:#0659AA;border-color:#6fa8e6}.zst.g{background:#e5f4ea;color:#1b6b2e;border-color:#6cbf80}
.ztr{display:flex;align-items:center;gap:10px;background:#fff;border-radius:12px;padding:10px 12px;box-shadow:0 1px 4px rgba(0,0,0,.15)}.ztr b{font-size:1.35rem}
.ztoast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);padding:12px 18px;border-radius:12px;font-weight:700;color:#fff;z-index:99999;box-shadow:0 4px 14px rgba(0,0,0,.35);max-width:88%;text-align:center;transition:opacity .4s}
`;document.head.appendChild(css);
const stepper=(k,l)=>`<div class="zs"><small>${l}</small><button class="zb" data-a="up" data-k="${k}">▲</button><b>${k==='pause'?S.e.pause+' min':S.e[k]}</b><button class="zb" data-a="dn" data-k="${k}">▼</button></div>`;
const chips=(list,sel,k)=>`<div class="chips">${list.map(v=>`<button class="chip ${sel.includes(v)?'on':''}" data-a="tog" data-k="${k}" data-v="${esc(v)}">${esc(v)}</button>`).join('')}<button class="chip add" data-a="addlist" data-k="${k}">+ neu</button></div>`;
const TIT={material:'Material wählen',tasks:'Tätigkeiten wählen',colleagues:'Arbeitskollegen wählen'};
function picker(k,txt){const sel=S.e[k],mat=k==='material',pr=mat&&typeof Mat!=='undefined'&&S.e.projectId?Mat.rows(S.e.projectId):[],pend=mat?sel.map((v,i)=>({v,i})).filter(x=>!x.v.sync):[],cnt=mat?pr.length+pend.length:sel.length,show=S.show&&S.show[k],btn=mat?cnt+' Pos.':cnt+' gewählt';
const row=(t,b)=>`<div class="zrow" style="justify-content:space-between;padding:3px 0"><span>• ${t}</span><span style="display:flex;gap:6px">${b}</span></div>`;
const xb=(a,x)=>`<button class="zb r" style="height:34px;min-width:38px" data-a="${a}" ${x}>✕</button>`;
const fm=r=>esc(r.n+(r.q?' – '+r.q+' '+(r.u||''):''))+(r.d?' <small>('+r.d.slice(8,10)+'.'+r.d.slice(5,7)+'.)</small>':'');
let body='';
if(mat){body=pr.map((r,i)=>row(fm(r),`<button class="zb" style="height:34px;min-width:38px" data-a="mr-edit" data-i="${i}">✎</button>`+xb('mr-del',`data-i="${i}"`))).join('')+(pend.length?`<div style="font-weight:700;margin-top:6px">Neu (wird beim Speichern übernommen)</div>`+pend.map(x=>row(esc(x.v.name+(x.v.qty?' – '+x.v.qty+' '+(x.v.unit||''):'')),xb('rm',`data-k="${k}" data-i="${x.i}"`))).join(''):'')}
else if(k==='tasks'){const q=wbQuota(S.e),wb=S.e.wbt||[],cn=sel.filter(x=>wb.includes(x)).length;body=`<div style="font-weight:700;margin-bottom:4px;${cn>q?'color:#c0392b':''}">Im Wochenbericht: ${cn} von ${q} Zeilen</div><small>Kästchen antippen = Tätigkeit kommt in den Wochenbericht.</small>`+sel.map((v,i)=>row(esc(v),`<button class="zb ${wb.includes(v)?'g':'l'}" style="height:34px;min-width:38px" data-a="wbt" data-i="${i}">${wb.includes(v)?'☑':'☐'}</button>`+xb('rm',`data-k="${k}" data-i="${i}"`))).join('')}
else body=sel.map((v,i)=>row(esc(v),xb('rm',`data-k="${k}" data-i="${i}"`))).join('');
return`<div class="zrow"><button class="zb" style="flex:1" data-a="pick" data-k="${k}">${txt}</button><button class="zb ${cnt?'g':'l'}" style="min-width:96px" data-a="shw" data-k="${k}">${btn} ${show?'▴':'▾'}</button></div>`+(show&&body?`<div class="zcard">${body}</div>`:'')}
function meModal(){const r=(typeof Mat!=='undefined'&&Mat.rows(S.e.projectId)[S.me.i])||{};return`<div class="mo"><div class="mb"><b>${esc(r.n||'')}</b><div class="zrow mqr"><input id="me-q" inputmode="decimal" placeholder="Menge" value="${esc(S.me.q)}"><select id="me-u">${D.units.map(u=>`<option ${u===S.me.u?'selected':''}>${esc(u)}</option>`).join('')}</select></div><div class="zrow"><button class="zb l" style="flex:1" data-a="mr-x">Abbrechen</button><button class="zb g" style="flex:1" data-a="mr-ok">Übernehmen</button></div></div></div>`}
function matModal(){const sel=S.e.material,q=(S.pick.q||'').toLowerCase();
return`<div class="mo"><div class="mb"><b>Material wählen</b><input id="pk-q" placeholder="🔍 Suchen" value="${esc(S.pick.q||'')}"><div class="ml">${D.materials.filter(v=>v.toLowerCase().includes(q)).map(v=>{const i=sel.findIndex(m=>m.name===v),on=i>=0;return`<button class="mr ${on?'on':''}" data-a="mtog" data-v="${esc(v)}">${on?'☑':'☐'} ${esc(v)}</button>`+(on?`<div class="zrow mqr"><input id="mq-${i}" inputmode="decimal" placeholder="Menge" value="${esc(sel[i].qty)}"><select id="mu-${i}">${D.units.map(u=>`<option ${u===sel[i].unit?'selected':''}>${esc(u)}</option>`).join('')}</select></div>`:'')}).join('')||'<div class="zcard">Noch keine Einträge – mit „+ neu“ anlegen.</div>'}</div><div class="zrow"><button class="zb" style="flex:1" data-a="addlist" data-k="materials">+ neu</button><button class="zb g" style="flex:2;height:48px" data-a="fin">Fertig (${sel.length})</button></div></div></div>`}
function modal(){if(S.tm)return tmModal();if(S.me)return meModal();if(S.pick&&S.pick.k==='material'&&!S.pm)return matModal();if(S.pm)return'<div class="mo"><div class="mb">'+pform(S.p)+'</div></div>';if(!S.pick)return'';const k=S.pick.k,q=(S.pick.q||'').toLowerCase(),sel=S.e[k];
return`<div class="mo"><div class="mb"><b>${TIT[k]}</b><input id="pk-q" placeholder="🔍 Suchen" value="${esc(S.pick.q||'')}"><div class="ml">${D[k].filter(v=>v.toLowerCase().includes(q)).map(v=>`<button class="mr ${sel.includes(v)?'on':''}" data-a="tog" data-k="${k}" data-v="${esc(v)}">${sel.includes(v)?'☑':'☐'} ${esc(v)}</button>`).join('')||'<div class="zcard">Noch keine Einträge – mit „+ neu“ anlegen.</div>'}</div><div class="zrow"><button class="zb" style="flex:1" data-a="addlist" data-k="${k}">+ neu</button><button class="zb g" style="flex:2;height:48px" data-a="fin">Fertig (${sel.length})</button></div></div></div>`}
function rMenu(){return`<div class="zmenu">
<button class="zt" data-a="go" data-v="write"><span>⏱</span>Stunden schreiben</button>
<button class="zt" data-a="go" data-v="over"><span>📅</span>Übersicht</button>
<button class="zt" data-a="go" data-v="proj"><span>📁</span>Projekte &amp; Lieferanten</button>
<button class="zt" data-a="go" data-v="week"><span>📄</span>Wochenbericht</button>
<button class="zt" data-a="go" data-v="stat"><span>📊</span>Auswertung</button>
<button class="zt w" data-a="go" data-v="plc"><span>⚙</span>Einstellungen</button></div>`}
function rWrite(){const e=S.e,st=stLine(e),ps=D.projects.filter(p=>!p.done||p.id===e.projectId);
return`<div class="zc">
<div class="zrow"><button class="zb" data-a="dprev">◀</button><div class="dtbox"><span>${fdl(e.date)}</span><input type="date" id="f-date" value="${e.date}"></div><button class="zb" data-a="dnext">▶</button></div>
<div class="zst ${st[0]}">${st[1]}</div>
<label>Projekt</label><div class="zrow"><select id="f-proj"><option value="">– kein Projekt –</option>${ps.map(p=>`<option value="${p.id}" ${p.id===e.projectId?'selected':''}>${esc(pname(p.id))}</option>`).join('')}</select><button class="zb" data-a="newproj">+</button></div>
${isAbs(e.projectId)?`<div class="zsum">${esc(pname(e.projectId))}: ${fh(hrs(e))} (Sollstunden, automatisch)</div>`:`${D.set.hasCar?'':`<label>Auto (Kennzeichen)</label><div class="zrow"><select id="f-car"><option value="">– kein Auto –</option>${(D.cars.includes(e.auto)||!e.auto?D.cars:D.cars.concat(e.auto)).map(c=>`<option ${c===e.auto?'selected':''}>${esc(c)}</option>`).join('')}</select><button class="zb" data-a="newcar">+</button></div>`}
<div class="zrow"><label style="flex:1">Zeit</label><button class="zb g" data-a="std">Standard</button></div><div class="ztr"><div style="flex:1"><b>${e.run?e.start+' – läuft':e.start+' – '+e.end}</b><br><small>${e.run?'Arbeitszeit wird bei „Ende“ berechnet':'Pause '+e.pause+' min · Arbeitszeit '+fh(hrs(e))}</small></div><button class="zb" data-a="tedit">✎ Ändern</button></div>
<div class="zrow"><button class="zb ${e.run?'l':'g'}" style="flex:1;height:48px" data-a="tstart">▶ Start</button><button class="zb ${e.run?'r':'l'}" style="flex:1;height:48px" data-a="tend">■ Ende</button></div>
<label>Tätigkeiten</label>${picker('tasks','Tätigkeiten wählen')}
<label>Arbeitskollegen</label>${picker('colleagues','Kollegen wählen')}
<label>Material</label>${picker('material','Material wählen')}
`}
<label>Notiz</label><textarea id="f-note" rows="3">${esc(e.note)}</textarea>
<button class="zb ${st[0]==='g'?'l':'g'}" style="height:52px" data-a="save">${st[0]==='g'?'✔ Gespeichert':'💾 Speichern'}</button>
${e.id?'<button class="zb r" style="height:48px" data-a="del" data-i="'+e.id+'">🗑 Löschen</button>':''}</div>${modal()}`}
function rOver(){const t=iso(new Date()),c=S.cur,sel=S.sel;let h='<div class="zc">';
h+=`<div class="seg"><button class="zb ${S.mode==='month'?'':'l'}" data-a="mode" data-v="month">Monat</button><button class="zb ${S.mode==='week'?'':'l'}" data-a="mode" data-v="week">Woche</button></div>`;
const dots=s=>'<div class="dots">'+on(s).slice(0,3).map(()=>'<i></i>').join('')+'</div>';
if(S.mode==='month'){const d=dt(c),y=d.getFullYear(),m=d.getMonth(),lead=(new Date(y,m,1).getDay()+6)%7,n=new Date(y,m+1,0).getDate();
h+=`<div class="zrow"><button class="zb" data-a="nav" data-v="-1">◀</button><b style="flex:1;text-align:center">${MON[m]} ${y}</b><button class="zb" data-a="nav" data-v="1">▶</button></div><div class="cal">`+['Mo','Di','Mi','Do','Fr','Sa','So'].map(x=>`<div class="h">${x}</div>`).join('')+'<div></div>'.repeat(lead);
for(let i=1;i<=n;i++){const s=y+'-'+p2(m+1)+'-'+p2(i);h+=`<button class="cd ${s===t?'t':''} ${s===sel?'s':''}" data-a="sel" data-v="${s}"><span>${i}</span>${dots(s)}</button>`}
h+='</div>'}else{const mo=monday(c);h+=`<div class="zrow"><button class="zb" data-a="nav" data-v="-1">◀</button><b style="flex:1;text-align:center">KW ${kw(mo)} · ${fd(mo).slice(4)} – ${fd(addD(mo,6)).slice(4)}</b><button class="zb" data-a="nav" data-v="1">▶</button></div>`;
for(let i=0;i<7;i++){const s=addD(mo,i),tot=on(s).reduce((a,e)=>a+hrs(e),0);h+=`<button class="wk ${s===t?'t':''} ${s===sel?'s':''}" data-a="sel" data-v="${s}"><b style="min-width:92px;text-align:left">${fd(s)}</b>${dots(s)}<span>${tot?fh(tot):''}</span></button>`}}
const es=on(sel);h+=`<label style="color:#0659AA;font-weight:700">${fd(sel)} · ${es.length?fh(es.reduce((a,e)=>a+hrs(e),0)):'keine Einträge'}</label>`;
es.forEach(e=>{h+=`<div class="zcard"><b>${e.start}–${e.end}</b> (Pause ${e.pause} min) · ${fh(hrs(e))}<br>${e.projectId?'📁 '+esc(pname(e.projectId))+'<br>':''}${e.auto?'🚗 '+esc(e.auto)+'<br>':''}${e.tasks.length?'🔨 '+esc(e.tasks.join(', '))+'<br>':''}${e.colleagues.length?'👥 '+esc(e.colleagues.join(', '))+'<br>':''}${e.material.length?'🧰 '+esc(e.material.map(m=>m.name+(m.qty?' ('+m.qty+' '+(m.unit||'')+')':'')).join(', '))+'<br>':''}${e.note?'📝 '+esc(e.note)+'<br>':''}<div class="zrow" style="margin-top:8px"><button class="zb" style="flex:1" data-a="edit" data-i="${e.id}">✎ Bearbeiten</button><button class="zb r" data-a="del" data-i="${e.id}">🗑</button></div></div>`});
return h+`<button class="zb g" style="height:48px" data-a="newfor">+ Eintrag für diesen Tag</button></div>`}
function pform(p){return`<div class="zc" style="gap:8px;padding-top:0"><b>${p.id?'Projekt bearbeiten':'Neues Projekt'}</b>
<input id="p-name" placeholder="Projektname (nur bei Privatkunden)" value="${esc(p.name)}">
<input id="p-nr" inputmode="numeric" maxlength="6" placeholder="Projektnummer (6 Zahlen)" value="${esc(p.nr)}">
<input id="p-cl" placeholder="Auftraggeber" value="${esc(p.client)}">
<input id="p-ad" placeholder="Adresse (Straße, PLZ Ort)" value="${esc(p.addr||'')}">
<input id="p-tel" inputmode="tel" placeholder="Telefon (Kunde)" value="${esc(p.tel||'')}">
<b style="font-size:.9rem">Im Wochenbericht anzeigen:</b><div class="zrow" style="flex-wrap:wrap;gap:6px">${[['name','Projektname'],['client','Kunde'],['addr','Adresse'],['tel','Telefon']].map(([k,t])=>`<label style="display:flex;align-items:center;gap:6px;margin:0"><input type="checkbox" id="wb-${k}" style="width:22px;height:22px" ${Object.assign({name:1,client:1,addr:1,tel:0},p.wb||{})[k]?'checked':''}>${t}</label>`).join('')}</div>
${!p.id&&typeof Todo!=='undefined'&&Todo.enabled()?'<b style="font-size:.9rem">Arbeitsschritte für die To-do-Liste:</b>'+Todo.groups().map(g=>{const n=g.items.filter(t=>(p.steps||[]).includes(t.id)).length,op=(p.open||{})[g.cat];return'<button class="zb '+(n?'g':'l')+'" style="width:100%;margin-top:6px;height:46px;display:flex;justify-content:space-between;align-items:center;padding:0 14px" data-a="pgrp" data-c="'+esc(g.cat)+'"><span>'+(op?'▾ ':'▸ ')+esc(g.cat)+'</span><span style="font-weight:400">'+(n?n+' gewählt':g.items.length+' Schritte')+'</span></button>'+(op?g.items.map(t=>'<label style="display:flex;align-items:center;gap:8px;margin:2px 0 2px 8px"><input type="checkbox" id="ps-'+t.id+'" style="width:22px;height:22px" '+((p.steps||[]).includes(t.id)?'checked':'')+'>'+esc(t.name)+'</label>').join(''):'')}).join(''):''}
<div class="zrow"><button class="zb g" style="flex:1" data-a="psave">💾 Speichern</button>${p.id||S.pm?'<button class="zb l" data-a="pcancel">Abbrechen</button>':''}</div></div>`}
function retModal(){const r=S.ret;
return`<div class="mo"><div class="mb"><b>Baustelle abschließen</b><small>Das Projekt wird dadurch <b>nicht gelöscht</b>, sondern nur aus der Liste ausgeblendet. Du findest es unter „Abgeschlossene anzeigen“ wieder und kannst es mit „Öffnen“ zurückholen. Alle Einträge und das Material bleiben erhalten.</small><small>Welches Material wurde nicht mehr gebraucht und geht zurück?</small><div class="ml">${r.rows.map((x,i)=>`<div class="zcard"><b>${esc(x.name)}</b>${x.used?'<br><small>eingetragen: '+esc(x.used)+'</small>':''}<div class="zrow" style="margin-top:6px"><input id="rq-${i}" inputmode="decimal" placeholder="zurück: Menge" value="${esc(x.qty)}"><span>${esc(x.unit)}</span><button class="zb r" data-a="rrm" data-i="${i}">✕</button></div></div>`).join('')||'<div class="zcard">Noch kein Material eingetragen – unten hinzufügen oder gleich abschließen.</div>'}</div>
<select id="rt-sel">${D.materials.map(m=>`<option ${m===r.ms?'selected':''}>${esc(m)}</option>`).join('')}</select>
<div class="zrow"><input id="rt-qty" inputmode="decimal" placeholder="Menge" value="${esc(r.mq||'')}"><select id="rt-unit">${D.units.map(u=>`<option ${u===r.mu?'selected':''}>${esc(u)}</option>`).join('')}</select><button class="zb g" data-a="radd">+</button></div>
<div class="zrow"><button class="zb l" data-a="rcancel">Abbrechen</button><button class="zb g" style="flex:1;height:48px" data-a="rsave">✔ Abschließen</button></div></div></div>`}
const PT={kunden:'Kunden',mat:'Material',tank:'Tankstelle',werk:'Werkstatt'};
const gpsAddr=()=>new Promise((res,rej)=>{if(!navigator.geolocation)return rej();navigator.geolocation.getCurrentPosition(async p=>{try{const j=await(await fetch('https://nominatim.openstreetmap.org/reverse?format=json&accept-language=de&lat='+p.coords.latitude+'&lon='+p.coords.longitude)).json(),a=j.address||{};const s=[a.road,a.house_number].filter(Boolean).join(' '),o=[a.postcode,a.city||a.town||a.village||a.municipality].filter(Boolean).join(' ');res([s,o].filter(Boolean).join(', ')||j.display_name||'')}catch(e){res(p.coords.latitude.toFixed(5)+', '+p.coords.longitude.toFixed(5))}},rej,{enableHighAccuracy:true,timeout:15000})});
function rLfForm(){const c=S.sp;return`<div class="zc"><div class="zcard" style="display:flex;flex-direction:column;gap:8px"><b>${c.id?'Lieferant bearbeiten':'Neuer Lieferant'}</b><label>Art</label><select id="lf-t">${['mat','tank','werk'].map(k=>`<option value="${k}" ${k===c.t?'selected':''}>${PT[k]}</option>`).join('')}</select><input id="lf-n" placeholder="Name" value="${esc(c.n)}"><input id="lf-a" placeholder="Adresse (Straße, PLZ Ort)" value="${esc(c.a)}"><button class="zb l" data-a="lfgps">📍 Standort als Adresse</button><input id="lf-tel" inputmode="tel" placeholder="Telefon" value="${esc(c.tel)}"><textarea id="lf-info" rows="3" placeholder="Notiz (optional)">${esc(c.info)}</textarea><div class="zrow"><button class="zb g" style="flex:1;height:52px" data-a="lfsave">💾 Speichern</button><button class="zb l" style="height:52px" data-a="lfcancel">Abbrechen</button></div>${c.id?'<button class="zb r" style="height:48px" data-a="lfdel">🗑 Löschen</button>':''}</div></div>`}
function rProj(){S.pt=S.pt||'kunden';const f=(S.q||'').toLowerCase();
const tabs=`<div class="seg">${Object.keys(PT).map(k=>`<button class="zb ${S.pt===k?'':'l'}" data-a="ptab" data-v="${k}">${PT[k]}</button>`).join('')}</div>`;
if(S.pv==='form')return S.pt==='kunden'?`<div class="zc"><div class="zcard">${pform(S.p)}</div></div>${S.ret?retModal():''}`:rLfForm();
if(S.pt!=='kunden'){const L=D.lf.filter(x=>x.t===S.pt&&(x.n+' '+(x.a||'')+' '+(x.tel||'')+' '+(x.info||'')).toLowerCase().includes(f)).sort((a,b)=>a.n.localeCompare(b.n,'de'));
return`<div class="zc">${tabs}<input id="p-q" placeholder="🔍 Suchen" value="${esc(S.q||'')}"><button class="zb g" style="height:48px" data-a="lfnew">+ Neuer Lieferant (${PT[S.pt]})</button>${L.map(c=>`<div class="zcard"><div class="zrow"><div style="flex:1"><b>${esc(c.n)}</b>${c.a?`<br><small>📍 ${esc(c.a)}</small>`:''}</div><button class="zb l" style="height:38px" data-a="lfedit" data-i="${c.id}">✎</button></div>${c.tel?`<div style="margin-top:6px">📞 ${esc(c.tel)}</div>`:''}${c.info?`<div style="margin-top:4px"><small>${esc(c.info)}</small></div>`:''}${c.tel?`<div class="zrow" style="margin-top:8px"><a class="zb g" style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;flex:1" href="tel:${esc(String(c.tel).replace(/[^\d+]/g,''))}">📞 Anrufen</a></div>`:''}</div>`).join('')||`<div class="zcard">Noch keine Einträge bei „${PT[S.pt]}“.</div>`}</div>`}
const list=D.projects.filter(x=>(S.all||!x.done)&&(pname(x.id)+' '+x.client+' '+(x.addr||'')).toLowerCase().includes(f)).sort((a,b)=>b.id-a.id);
return`<div class="zc">${tabs}<input id="p-q" placeholder="🔍 Suchen" value="${esc(S.q||'')}"><button class="zb g" style="height:48px" data-a="pnew">+ Neues Projekt</button>
<button class="chip ${S.all?'on':''}" data-a="pall">Abgeschlossene anzeigen</button>
${list.map(x=>`<div class="zcard zrow"><div style="flex:1"><b>${esc(x.name||x.addr||'')}</b><br><small>${esc(x.nr)} ${esc(x.client)}${x.name&&x.addr?' · '+esc(x.addr):''}${x.tel?' · <a href="tel:'+esc(x.tel)+'">☎ '+esc(x.tel)+'</a>':''}${x.done?' · abgeschlossen':''}</small>${x.returns&&x.returns.length?'<br><small>↩ Zurück: '+esc(x.returns.map(r=>r.name+' '+r.qty+' '+r.unit).join(', '))+'</small>':''}</div><button class="zb" data-a="pedit" data-i="${x.id}">✎</button><button class="zb l" data-a="pdone" data-i="${x.id}">${x.done?'↩ Öffnen':'✔ Abschließen'}</button></div>`).join('')||'<div class="zcard">Noch keine Projekte.</div>'}</div>${S.ret?retModal():''}`}
function rWeek(){return rWeek0()+(S.prev?prevModal():'')+(S.rc?rcModal():'')}
function rWeek0(){const mo=S.wk,days=[0,1,2,3,4,5,6].map(i=>addD(mo,i));let tot=0;
const rows=days.map(s=>{const es=on(s),h=es.reduce((a,e)=>a+hrs(e),0);tot+=h;return`<div class="zcard"><b>${fd(s)}</b> ${es.length?'· '+fh(h):'<small>–</small>'}${es.map(e=>`<br><small>${e.start}–${e.end} · ${esc(pname(e.projectId)||'ohne Projekt')}${e.auto?' · 🚗 '+esc(e.auto):''}</small>`).join('')}</div>`}).join('');
return`<div class="zc"><div class="zrow"><button class="zb" data-a="wnav" data-v="-1">◀</button><b style="flex:1;text-align:center">KW ${kw(mo)} · ${fd(mo).slice(4)} – ${fd(addD(mo,6)).slice(4)}</b><button class="zb" data-a="wnav" data-v="1">▶</button></div>
<label>Name</label><input id="w-name" value="${esc(D.set.name)}">
<div class="zsum">Woche gesamt: ${fh(tot)}</div>${rows}
<button class="zb l" style="height:50px" data-a="wprev">👁 Vorschau</button><button class="zb g" style="height:52px" data-a="wsend">✉ Per E-Mail senden</button>${S.wnote?'<div class="zcard"><small>'+esc(S.wnote)+'</small></div>':''}</div>`}
const WC=[['Datum',14],['Tag',10],['Kundenname',56],['Ob-Nr',18],['Std.',14],['von-bis',28],['Mittagspause',28],['Arbeitsbeschreibung',80],['Auto',29]],WCEN=[0,1,3,4,5,6];
const wpr=e=>{const p=+e.pause||0;if(!p)return'';const x=dt(e.date).getDay()===5?D.std.fr:D.std.md;let s=x.pf?tm(x.pf):720;s=Math.max(tm(e.start),Math.min(s,tm(e.end)-p));return ft(s)+'  -  '+ft(s+p)};
const wbText=p=>{const w=Object.assign({name:1,client:1,addr:1,tel:0},p.wb||{});return[w.client&&p.client,w.name&&p.name,w.addr&&p.addr,w.tel&&p.tel].filter(Boolean).filter((v,i,a)=>a.findIndex(q=>String(q).trim().toLowerCase()===String(v).trim().toLowerCase())===i).join(', ')};
let _wm=null;
const wrapT=txt=>{if(!txt)return[];try{if(!_wm){_wm=new window.jspdf.jsPDF();_wm.setFont('helvetica','normal');_wm.setFontSize(8.5)}return _wm.splitTextToSize(txt,WC[7][1]-3)}catch(x){return(txt.match(/.{1,45}(\s|$)/g)||[txt]).map(v=>v.trim())}};
function wkData(mo){return[0,1,2,3,4,5,6].map(i=>{const s=addD(mo,i),es=on(s),base=i>=5?2:4,n=Math.max(es.length,base),k=es.length?Math.max(1,Math.floor(n/es.length)):1,q=dt(s),rows=[],N=Math.max(n,es.length*k);
const au=x=>x.auto||(D.set.hasCar?D.set.car||'':'');
for(let r=0;r<N;r++){const ei=es.length?Math.floor(r/k):-1,e=ei>=0&&ei<es.length?es[ei]:null,j=e?r-ei*k:0,t=['',TAGE[q.getDay()],'','','','','','',''];if(r===0)t[0]=p2(q.getDate());
if(e){const p=D.projects.find(x=>x.id===e.projectId);
if(j===0){t[2]=p?wbText(p):'';t[3]=p?p.nr:'';t[4]=ft(Math.round(hrs(e)*60));t[5]=e.start+'  -  '+e.end;t[6]=wpr(e);if(ei===0||au(e)!==au(es[ei-1]))t[8]=au(e)}
const sel=(e.wbt||[]).filter(x=>e.tasks.includes(x)),TL=sel.length?sel:e.tasks.slice(0,k),L=TL.slice();if(e.note){if(L.length)L[L.length-1]+=' - '+e.note;else L.push(e.note)}t[7]=j<k-1?(L[j]||''):L.slice(k-1).join(', ')}
rows.push(t)}return rows})}
function buildPdf(mo){const{jsPDF}=window.jspdf,d=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'}),th=dt(addD(mo,3)),C=WC,cen=WCEN,W=277,x0=10,data=wkData(mo),TOP=26,HH=7,LIM=202;let y=0;
const LV=[[8.5,3.6,2.6,6.4],[8,3.3,2.2,5.8],[7.5,3.1,2,5.3],[7,2.9,1.7,4.8],[6.5,2.7,1.5,4.4]];
const lay=L=>{d.setFont('helvetica','normal');d.setFontSize(L[0]);let tot=0;const days=data.map(day=>{const rows=day.map(t=>{const Ls=t.map((v,k)=>d.splitTextToSize(String(v),C[k][1]-3));return{L:Ls,h:Math.max(L[3],Math.max(...Ls.map(a=>a.length))*L[1]+L[2])}});tot+=rows.reduce((a,r)=>a+r.h,0);return rows});return{days,tot}};
let L=LV[LV.length-1],R=null;for(const l of LV){const r=lay(l);if(TOP+HH+r.tot<=LIM){L=l;R=r;break}}if(!R)R=lay(L);const OFF=Math.max(0,(210-(TOP+HH+R.tot+6)-7)/2);
const hdr=()=>{let x=x0;d.setFont('helvetica','bold');d.setFontSize(8.5);d.setLineWidth(.6);C.forEach(c=>{d.rect(x,y,c[1],HH,'S');d.text(c[0],x+c[1]/2,y+4.8,{align:'center'});x+=c[1]});y+=HH;d.setFont('helvetica','normal')};
d.setFont('helvetica','bold');d.setFontSize(16);d.text('ARBEITSEINTEILUNG',148.5,11+OFF,{align:'center'});
d.setFont('helvetica','normal');d.setFontSize(10);d.text('Name: '+D.set.name,x0,20+OFF);d.text('Kalenderwoche: '+kw(mo),85,20+OFF);d.text('Monat: '+MON[th.getMonth()],150,20+OFF);d.text('Jahr: '+th.getFullYear(),x0+W,20+OFF,{align:'right'});
y=TOP+OFF;hdr();d.setFontSize(L[0]);d.setLineHeightFactor(L[1]/(L[0]*0.3528));
R.days.forEach(rows=>{const dh=rows.reduce((a,r)=>a+r.h,0);if(y+dh>LIM){d.addPage();y=12;hdr();d.setFontSize(L[0])}
const top=y,by=(L[3]+L[0]*0.3528*0.72)/2;
rows.forEach((Rw,r)=>{let x=x0;Rw.L.forEach((a,k)=>{const c=cen.includes(k);d.text(a,c?x+C[k][1]/2:x+1.5,y+by,{align:c?'center':'left'});x+=C[k][1]});
if(r<rows.length-1){d.setLineWidth(.2);d.setLineDashPattern([.5,.7],0);d.line(x0,y+Rw.h,x0+W-C[8][1],y+Rw.h);d.setLineDashPattern([],0)}y+=Rw.h});
d.setLineWidth(.2);let x=x0;C.slice(0,-1).forEach(c=>{x+=c[1];d.line(x,top,x,top+dh)});
d.setLineWidth(.6);d.rect(x0,top,W,dh,'S')});
const n=new Date();d.setFontSize(8);d.text('Erstellt am: von '+D.set.name+'    '+p2(n.getDate())+'.'+p2(n.getMonth()+1)+'.'+n.getFullYear()+' '+p2(n.getHours())+':'+p2(n.getMinutes())+' Uhr',x0+W,Math.min(y+5,206),{align:'right'});return d}
function prevModal(){const mo=S.wk,th=dt(addD(mo,3));
const head='<tr>'+WC.map(c=>`<th style="width:${c[1]*3}px">${c[0]}</th>`).join('')+'</tr>';
const body=wkData(mo).map(rows=>'<tbody>'+rows.map(t=>'<tr>'+t.map((v,k)=>`<td style="text-align:${WCEN.includes(k)?'center':'left'}">${esc(v)}</td>`).join('')+'</tr>').join('')+'</tbody>').join('');
return`<div class="mo"><div class="mb" style="height:96%;max-height:96%"><b style="text-align:center">ARBEITSEINTEILUNG</b><small>Name: ${esc(D.set.name)} · KW ${kw(mo)} · ${MON[th.getMonth()]} ${th.getFullYear()}</small><div style="overflow:auto;flex:1"><table class="pv"><thead>${head}</thead>${body}</table></div><div class="zrow"><button class="zb l" data-a="wprevx">Schließen</button><button class="zb g" style="flex:1" data-a="wsend">✉ Senden</button></div></div></div>`}
function pdfInfo(){const mo=S.wk,th=dt(addD(mo,3)),k=kw(mo);return{k,name:'Arbeitseinteilung KW'+k+' '+th.getFullYear()+'.pdf',subj:'Arbeitseinteilung KW '+k+' - '+D.set.name,body:'Hallo,\n\nanbei meine Arbeitseinteilung für KW '+k+' ('+fd(mo).slice(4)+' - '+fd(addD(mo,6)).slice(4)+').\n\nLG '+D.set.name}}
function wpdf(send,to){const T=to||mailList();if(!window.jspdf)return alert('PDF-Baustein fehlt (jspdf.min.js).');const f=pdfInfo(),d=buildPdf(S.wk);
if(!send){d.save(f.name);S.wnote='PDF gespeichert: '+f.name;return render()}
const file=new File([d.output('blob')],f.name,{type:'application/pdf'});
if(navigator.canShare&&navigator.canShare({files:[file]})){if(T.length&&navigator.clipboard)navigator.clipboard.writeText(T.join(', ')).catch(()=>{});S.wnote=T.length?(T.length>1?'E-Mail-Adressen':'E-Mail-Adresse')+' kopiert – im Feld „An“ einfügen.':'';navigator.share({files:[file],title:f.subj,text:f.body}).catch(()=>{});render()}
else{d.save(f.name);S.wnote='PDF gespeichert. Mail-Programm öffnet sich – PDF bitte anhängen.';render();location.href='mailto:'+T.map(encodeURIComponent).join(',')+'?'+(D.set.own?'cc='+encodeURIComponent(D.set.own)+'&':'')+'subject='+encodeURIComponent(f.subj)+'&body='+encodeURIComponent(f.body)}}
const SV={std:['Standardzeiten','⏰'],tasks:['Tätigkeiten','🔨'],materials:['Material','🧰'],colleagues:['Arbeitskollegen','👥'],units:['Einheiten','📏'],cars:['Kennzeichen','🚗'],me:['Name & E-Mail','✉'],fb:['Rückmeldung','🔔']};
const mailList=()=>String(D.set.mail||'').split(/[\s,;]+/).filter(Boolean),EM=/^\S+@\S+\.\S+$/;
const svInfo=k=>k==='std'?D.std.md.start+'–'+D.std.md.end:k==='cars'&&D.set.hasCar?(D.set.car||'eigenes Auto'):k==='me'?(D.set.name||''):k==='fb'?(D.vib!==0?'Vibration an':'Vibration aus')+(D.snd?' · Ton an':''):String(D[k].length);
function rPlc(){if(S.sv==='std')return rStd();if(S.sv==='me')return rMe();if(S.sv==='fb')return rFb();if(S.sv)return rList(S.sv);
return'<div class="zc">'+Object.keys(SV).map(k=>`<button class="zh" data-a="sv" data-v="${k}"><span class="zi">${SV[k][1]}</span><span class="zn">${SV[k][0]}</span><small>${esc(svInfo(k))}</small><span>›</span></button>`).join('')+'</div>'}
function stdBlock(k,label){const x=D.std[k],h=Math.max(0,tm(x.end)-tm(x.start)-(x.pf&&x.pt?tm(x.pt)-tm(x.pf):0))/60;
return`<div class="zcard"><b>${label}</b><div class="sgrid"><label>Beginn<input type="time" id="sd-${k}-start" value="${x.start}"></label><label>Ende<input type="time" id="sd-${k}-end" value="${x.end}"></label><label>Pause von<input type="time" id="sd-${k}-pf" value="${x.pf}"></label><label>Pause bis<input type="time" id="sd-${k}-pt" value="${x.pt}"></label></div>
${(x.pf&&!x.pt)||(!x.pf&&x.pt)?'<small style="color:#c0392b">Bitte „von“ und „bis“ der Pause eintragen.</small>':''}
<div class="zsum" id="sdsum-${k}" style="margin-top:8px">Arbeitszeit: ${fh(h)}</div><button class="zb l" style="margin-top:8px;width:100%" data-a="nopause" data-k="${k}">Keine Pause</button></div>`}
function rStd(){return`<div class="zc">${stdBlock('md','Montag – Donnerstag')}${stdBlock('fr','Freitag')}<small>Diese Zeiten trägt der Button „Standard“ im Tagesbericht ein und sie gelten für neue Einträge.</small></div>`}
function rcModal(){const L=mailList();return`<div class="mo"><div class="mb"><b>Empfänger wählen</b><div class="ml">${L.map((m,i)=>`<button class="li" data-a="rtog" data-i="${i}">${S.rc.includes(m)?'☑ ':'☐ '}${esc(m)}</button>`).join('')||'<div class="li">Noch keine Adresse gespeichert.</div>'}</div><div class="zrow"><input id="m-new" type="email" inputmode="email" placeholder="weitere Adresse" value="${esc(S.mn||'')}" autocomplete="off"><button class="zb g" data-a="madd">+</button></div><div class="zrow"><button class="zb l" data-a="rx">Abbrechen</button><button class="zb g" style="flex:1" data-a="rsend">✉ Senden</button></div></div></div>`}
function mailBox(){const L=mailList();return L.map((m,i)=>`<div class="zrow"><span style="flex:1;word-break:break-all">${esc(m)}</span><button class="zb r" data-a="mdel" data-i="${i}">✕</button></div>`).join('')+`<div class="zrow"><input id="m-new" type="email" inputmode="email" placeholder="neue Adresse" value="${esc(S.mn||'')}" autocomplete="off"><button class="zb g" data-a="madd">+</button></div>`}
function rMe(){return`<div class="zc"><div class="zcard"><label style="margin-top:0">Name (erscheint im Wochenbericht)</label><input id="s-name" value="${esc(D.set.name)}" autocomplete="name"><label>Meine E-Mail (Arbeiter, einmal)</label><input id="s-own" type="email" inputmode="email" placeholder="ich@beispiel.at" value="${esc(D.set.own||'')}"><small>Du bekommst den Wochenbericht als Kopie (CC).</small><label>Empfänger des Wochenberichts</label>${mailBox()}<small>Mit „+“ weitere Adresse hinzufügen, mit ✕ entfernen.</small></div></div>`}
function carBox(){return`<label class="zcard zrow" style="gap:10px;align-items:center"><input type="checkbox" id="s-hascar" ${D.set.hasCar?'checked':''} style="width:26px;height:26px;flex:none"><span style="flex:1">Ich habe ein eigenes Auto</span></label>`}
function rList(k){if(k==='cars'&&D.set.hasCar)return`<div class="zc">${carBox()}<div class="zcard"><label style="margin-top:0">Mein Kennzeichen</label><input id="s-car" placeholder="VL 123 AB" autocapitalize="characters" value="${esc(D.set.car||'')}"><small>Wird bei jedem Eintrag und im Wochenbericht automatisch übernommen. Beim Stunden schreiben gibt es dann kein Kennzeichen-Feld.</small></div></div>`;
return(k==='cars'?`<div class="zc">${carBox()}<small>Ohne eigenes Auto wählst du das Kennzeichen beim Stunden schreiben aus dieser Liste.</small></div>`:'')+rList0(k)+(S.le!=null?listModal():'')}
function listModal(){const k=S.sv,i=S.le;return`<div class="mo"><div class="mb"><b>Bearbeiten</b><input id="l-edit" value="${esc(S.lv)}" autocomplete="off"><div class="zrow"><button class="zb r" data-a="ldel" data-i="${i}">Löschen</button><button class="zb l" data-a="lx">Abbrechen</button><button class="zb g" style="flex:1" data-a="lsave">Speichern</button></div>${k==='units'&&i>0?`<button class="zb l" data-a="lup" data-i="${i}">▲ Nach oben (Vorauswahl)</button>`:''}</div></div>`}
function rList0(k){const q=(S.lq||'').toLowerCase(),L=D[k],ph={tasks:'Neue Tätigkeit',materials:'Neues Material',colleagues:'Name des Kollegen',units:'Neue Einheit (z. B. Bund)',cars:'Kennzeichen (z. B. VL 123 AB)'}[k];
const rows=L.map((v,i)=>[v,i]).filter(x=>x[0].toLowerCase().includes(q));
return`<div class="zc"><div class="zrow"><input id="l-new" placeholder="${ph}" value="${esc(S.ln||'')}" autocomplete="off"><button class="zb g" data-a="ladd">+</button></div>
<input id="l-q" placeholder="🔍 Suchen" value="${esc(S.lq||'')}">
<small>${rows.length===L.length?L.length+' Einträge':rows.length+' von '+L.length+' Einträgen'} · Antippen zum Bearbeiten oder Löschen</small>
<div class="lb">${rows.map(([v,i])=>`<button class="li" data-a="ledit" data-i="${i}">${esc(v)}</button>`).join('')||'<div class="li">Keine Einträge.</div>'}</div>
${k==='units'?'<small>Die oberste Einheit ist die Vorauswahl bei neuem Material.</small>':'<button class="zb l" data-a="lsort">A–Z sortieren</button>'}
<small>Änderungen gelten für neue Einträge, bereits gespeicherte Stunden bleiben unverändert.</small></div>`}
const T={week:'Wochenbericht',menu:'Zeiterfassung',write:'Stunden schreiben',over:'Übersicht',proj:'Projekte & Lieferanten',stat:'Auswertung',plc:'Einstellungen'};
function render(){titleEl.textContent=view==='plc'&&S.sv?SV[S.sv][0]:T[view];root.innerHTML={menu:rMenu,write:rWrite,over:rOver,proj:rProj,week:rWeek,stat:rStat,plc:rPlc}[view]();window.scrollTo(0,0)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&view==='write'&&S.e&&S.opened&&S.opened!==iso(new Date())){S.e=newEntry();reloadDay();S.opened=iso(new Date());render()}});
function go(v){view=v;if(v==='stat')S.f=S.f||statDef();if(v==='plc'){S.sv=null;S.lq='';S.ln=''}if(v==='week')S.wk=S.wk||monday(iso(new Date()));S.pick=null;S.pm=false;S.ret=null;S.prev=false;S.le=null;S.rc=null;S.tm=false;S.ended=0;S.snapId=null;if(v==='write'&&!S.e){S.e=newEntry();reloadDay()}if(v==='write')restoreRun();if(v==='write'){S.opened=iso(new Date());migrateMat()}if(v==='over'){S.mode=S.mode||'month';S.sel=S.sel||iso(new Date());S.cur=S.sel}if(v==='proj'){S.p={id:0,name:'',nr:'',client:'',addr:'',tel:'',wb:{name:1,client:1,addr:1,tel:0}};S.q='';S.pv='list';S.pt=S.pt||'kunden'}render()}
const nowM=()=>{const n=new Date();return Math.min(1439,Math.round((n.getHours()*60+n.getMinutes())/D.step)*D.step)};
function fb(msg,kind,col){try{if(D.vib!==0&&navigator.vibrate)navigator.vibrate(kind===2?[70,80,70]:60)}catch(x){}
if(D.snd){try{const A=window.AudioContext||window.webkitAudioContext,c=new A(),o=c.createOscillator(),g=c.createGain();o.frequency.value=kind===2?660:880;g.gain.value=.08;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+(kind===2?.25:.15));setTimeout(()=>c.close(),600)}catch(x){}}
if(!msg)return;const t=document.createElement('div');t.className='ztoast';t.style.background=col||'#2e8b3e';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>{t.style.opacity='0'},2200);setTimeout(()=>t.remove(),2700)}
function stLine(e){if(e.id&&S.snapId!==e.id){S.snap=JSON.stringify(e);S.snapId=e.id}
if(e.run)return['b','▶ Läuft seit '+e.start];
if(e.id&&JSON.stringify(e)===S.snap)return['g','✔ Gespeichert · '+e.start+'–'+e.end+' · '+fh(hrs(e))];
if(S.ended)return['o','■ Beendet '+e.end+' · noch nicht gespeichert'];
return['o','● Noch nicht gespeichert']}
function restoreRun(){if(!D.run)return;if(D.run.date!==iso(new Date())){D.run=null;save();return}if(S.e&&!S.e.id&&S.e.date===D.run.date){S.e.start=D.run.start;S.e.run=1}}
function tmModal(){const e=S.e;return`<div class="mo"><div class="mb"><b>Zeit ändern</b><div class="ztime">${stepper('start','Von')}${stepper('end','Bis')}${stepper('pause','Pause')}</div><div class="chips">${[0,30,45,60].map(v=>`<button class="chip ${+e.pause===v?'on':''}" data-a="pset" data-v="${v}">Pause ${v}</button>`).join('')}</div><div class="zsum">Arbeitszeit: ${fh(hrs(e))}</div><button class="zb g" style="height:48px" data-a="tok">Fertig</button></div></div>`}
function rFb(){return`<div class="zc"><div class="zcard"><b>Rückmeldung</b><br><small>Kurze Rückmeldung beim Speichern, Start und Ende.</small><div class="zrow" style="margin-top:10px"><button class="zb ${D.vib!==0?'g':'l'}" style="flex:1" data-a="fbt" data-k="vib">📳 Vibration: ${D.vib!==0?'An':'Aus'}</button><button class="zb ${D.snd?'g':'l'}" style="flex:1" data-a="fbt" data-k="snd">🔔 Ton: ${D.snd?'An':'Aus'}</button></div><button class="zb l" style="width:100%;margin-top:10px" data-a="fbtest">Testen</button></div></div>`}
function adj(k,d){const e=S.e,s=D.step;if(k==='pause'){e.pause=Math.max(0,+e.pause+d*s);e.pm=1}else{e[k]=ft(Math.min(1439,Math.max(0,tm(e[k])+d*s)));if(!e.pm)e.pause=pFit(e)}}
function act(a,b,el){const e=S.e;
if(a==='go')return go(b.v);
if(a==='wprev'){S.prev=true;return render()}
if(a==='wprevx'){S.prev=false;return render()}
if(a==='sv'){S.sv=b.v;S.lq='';S.ln='';S.le=null;return render()}
if(a==='nopause'){const x=D.std[b.k];x.pf='';x.pt='';save();return render()}
if(a==='ladd'){const k=S.sv;let v=(S.ln||'').trim();if(k==='cars')v=v.toUpperCase();if(!v)return;if(D[k].some(x=>x.toLowerCase()===v.toLowerCase()))return alert('„'+v+'“ gibt es schon.');D[k].push(v);S.ln='';save();render();const n=document.getElementById('l-new');if(n)n.focus();return}
if(a==='ledit'){S.le=+b.i;S.lv=D[S.sv][S.le];return render()}if(a==='madd'){const v=(S.mn||'').trim();if(!v)return;if(!EM.test(v))return alert('Bitte eine gültige E-Mail-Adresse eingeben.');const L=mailList();if(L.some(x=>x.toLowerCase()===v.toLowerCase()))return alert('Diese Adresse gibt es schon.');L.push(v);if(S.rc)S.rc.push(v);D.set.mail=L.join('\n');S.mn='';save();const y=scrollY;render();scrollTo(0,y);const n=document.getElementById('m-new');if(n)n.focus();return}
if(a==='mdel'){const L=mailList();L.splice(+b.i,1);D.set.mail=L.join('\n');save();const y=scrollY;render();scrollTo(0,y);return}
if(a==='lx'){S.le=null;return render()}
if(a==='lsave'){const k=S.sv,i=S.le,old=D[k][i];let v=(S.lv||'').trim();if(k==='cars')v=v.toUpperCase();if(!v||v===old){S.le=null;return render()}if(D[k].some((x,j)=>j!==i&&x.toLowerCase()===v.toLowerCase()))return alert('„'+v+'“ gibt es schon.');D[k][i]=v;
if(k==='materials'&&D.mu[old]){D.mu[v]=D.mu[old];delete D.mu[old]}
if(k==='units')Object.keys(D.mu).forEach(m=>{if(D.mu[m]===old)D.mu[m]=v});
if(k==='cars'&&D.lastCar===old)D.lastCar=v;
S.le=null;save();return render()}
if(a==='ldel'){const k=S.sv,i=+b.i,v=D[k][i];if(k==='units'&&D.units.length<=1)return alert('Mindestens eine Einheit muss bleiben.');if(!confirm('„'+v+'“ aus der Liste löschen?\nBereits gespeicherte Einträge bleiben unverändert.'))return;D[k].splice(i,1);
if(k==='materials')delete D.mu[v];
if(k==='units')Object.keys(D.mu).forEach(m=>{if(D.mu[m]===v)delete D.mu[m]});
if(k==='cars'&&D.lastCar===v)D.lastCar='';
S.le=null;save();return render()}
if(a==='lsort'){D[S.sv].sort((x,y)=>x.localeCompare(y,'de'));save();return render()}
if(a==='lup'){S.le=null;const L=D.units,i=+b.i;if(i>0){[L[i-1],L[i]]=[L[i],L[i-1]];save()}return render()}
if(a==='wnav'){S.wk=addD(S.wk,7*+b.v);S.wnote='';return render()}
if(a==='wpdf')return wpdf(false);
if(a==='wsend'){S.rc=mailList().slice();S.mn='';return render()}
if(a==='rx'){S.rc=null;return render()}
if(a==='rtog'){const m=mailList()[+b.i],k=S.rc.indexOf(m);k<0?S.rc.push(m):S.rc.splice(k,1);return render()}
if(a==='rsend'){const to=S.rc.slice();S.rc=null;return wpdf(true,to)}
if(a==='up'||a==='dn'){adj(b.k,a==='up'?1:-1);return render()}
if(a==='now'){const n=new Date(),m=Math.round((n.getHours()*60+n.getMinutes())/D.step)*D.step;e[b.k]=ft(Math.min(1439,m));if(!e.pm)e.pause=pFit(e);return render()}
if(a==='dprev'||a==='dnext'){e.date=addD(e.date,a==='dprev'?-1:1);reloadDay(true);return render()}
if(a==='tog'){const l=e[b.k],i=l.indexOf(b.v);i<0?l.push(b.v):l.splice(i,1);if(S.pick&&el){const on=i<0;el.classList.toggle('on',on);el.textContent=(on?'☑ ':'☐ ')+b.v;document.querySelector('[data-a=fin]').textContent='Fertig ('+l.length+')';return}return render()}
if(a==='mtog'){const l=e.material,i=l.findIndex(m=>m.name===b.v),st=(document.querySelector('.ml')||{}).scrollTop||0;if(i<0)l.push({name:b.v,qty:'',unit:D.mu[b.v]||D.units[0]});else l.splice(i,1);render();const m2=document.querySelector('.ml');if(m2)m2.scrollTop=st;if(i<0){const q=document.getElementById('mq-'+(l.length-1));if(q)q.focus()}return}
if(a==='pick'){S.pick={k:b.k,q:''};return render()}
if(a==='st-reset'){S.f=statDef();return render()}
if(a==='wbt'){const t=e.tasks[+b.i];e.wbt=e.wbt||[];const j=e.wbt.indexOf(t);if(j>=0)e.wbt.splice(j,1);else e.wbt.push(t);return render()}
if(a==='mr-edit'){const r=Mat.rows(e.projectId)[+b.i];if(!r)return;S.me={i:+b.i,q:String(r.q||''),u:r.u||''};return render()}
if(a==='mr-x'){S.me=null;return render()}
if(a==='mr-ok'){const q=((document.getElementById('me-q')||{}).value||'').trim(),u=(document.getElementById('me-u')||{}).value||'';Mat.set(e.projectId,S.me.i,{q,u});S.me=null;return render()}
if(a==='mr-del'){if(!confirm('Diese Materialposition löschen?'))return;Mat.del(e.projectId,+b.i);return render()}
if(a==='fin'){if(S.pick&&S.pick.k==='material')flushMat();S.pick=null;return render()}
if(a==='shw'){S.show=S.show||{};S.show[b.k]=!S.show[b.k];return render()}
if(a==='rm'){e[b.k].splice(+b.i,1);return render()}
if(a==='addlist'){const t={tasks:'Neue Tätigkeit:',colleagues:'Name des Arbeitskollegen:',materials:'Neues Material:'}[b.k],v=(prompt(t)||'').trim();if(!v)return;if(!D[b.k].includes(v))D[b.k].push(v);if(b.k!=='materials')e[b.k].push(v);else if(!e.material.some(m=>m.name===v))e.material.push({name:v,qty:'',unit:D.mu[v]||D.units[0]});save();return render()}
if(a==='madd'){const n=document.getElementById('m-sel').value;if(!n)return;e.material.push({name:n,qty:(S.mq||'').trim(),unit:document.getElementById('m-unit').value});S.mq='';return render()}
if(a==='mdel'){e.material.splice(+b.i,1);return render()}
if(a==='newproj'){S.p={id:0,name:'',nr:'',client:'',addr:'',tel:'',wb:{name:1,client:1,addr:1,tel:0}};S.pm=true;return render()}
if(a==='newcar'){const v=(prompt('Kennzeichen (z. B. VL 123 AB):')||'').trim().toUpperCase();if(!v)return;if(!D.cars.includes(v))D.cars.push(v);e.auto=v;save();return render()}
if(a==='std'){Object.assign(e,stdFor(e.date));e.pm=0;e.run=0;D.run=null;S.ended=0;return render()}
if(a==='tedit'){S.tm=true;return render()}
if(a==='tok'){S.tm=false;return render()}
if(a==='pset'){e.pause=+b.v;e.pm=1;return render()}
if(a==='tstart'){if(e.run){fb('Läuft schon seit '+e.start,1,'#0659AA');return}e.start=ft(nowM());e.run=1;S.ended=0;if(!e.pm)e.pause=pFit(e);D.run={date:e.date,start:e.start};save();fb('▶ Gestartet '+e.start,2,'#0659AA');return render()}
if(a==='tend'){const m=nowM();if(m<=tm(e.start)){alert('„Ende“ liegt nicht nach „Start“. Bitte die Zeit mit „Ändern“ einstellen.');return}e.end=ft(m);e.run=0;D.run=null;S.ended=1;if(!e.pm)e.pause=pFit(e);save();fb('■ Beendet '+e.end+' · '+fh(hrs(e))+' – jetzt speichern',2,'#e06f1f');return render()}
if(a==='fbt'){if(b.k==='vib')D.vib=D.vib===0?1:0;else D.snd=D.snd?0:1;save();return render()}
if(a==='fbtest'){fb('✔ So fühlt sich die Rückmeldung an',1);return}
if(a==='save'){if(e.run)return alert('Die Zeit läuft noch. Bitte zuerst „■ Ende“ drücken.');if(D.set.hasCar&&D.set.car&&!e.auto)e.auto=D.set.car;D.lastCar=e.auto||D.lastCar;if(!e.tasks.length&&!isAbs(e.projectId))return alert('Bitte mindestens eine Tätigkeit wählen (nur bei Urlaub und Krankenstand nicht nötig).');if(tm(e.end)<=tm(e.start))return alert('„Bis“ muss nach „Von“ liegen.');flushMat();delete e.run;if(D.run&&D.run.date===e.date)D.run=null;if(!isAbs(e.projectId))D.lastProj=e.projectId;if(!e.id){e.id=Date.now();D.entries.push(e)}else D.entries=D.entries.map(x=>x.id===e.id?e:x);save();S.sel=e.date;S.e=null;fb('✔ Gespeichert · '+(pname(e.projectId)||'ohne Projekt')+' · '+e.start+'–'+e.end+' · '+fh(hrs(e)),1);go('over');return}
if(a==='edit'){S.e=JSON.parse(JSON.stringify(D.entries.find(x=>x.id==b.i)));return go('write')}
if(a==='del'){if(!confirm('Eintrag wirklich löschen?'))return;D.entries=D.entries.filter(x=>x.id!=b.i);save();S.e=null;return go('over')}
if(a==='newfor'){S.e=newEntry(S.sel);return go('write')}
if(a==='mode'){S.mode=b.v;return render()}
if(a==='sel'){S.sel=b.v;return render()}
if(a==='nav'){const n=+b.v;if(S.mode==='month'){const d=dt(S.cur);d.setDate(1);d.setMonth(d.getMonth()+n);S.cur=iso(d)}else S.cur=addD(S.cur,7*n);return render()}
if(a==='psave'){const p=S.p,nm=(p.name||'').trim(),ad=(p.addr||'').trim(),nr=(p.nr||'').trim(),cl=(p.client||'').trim();if(!nm)return alert('Bitte Projektnamen eingeben.');if(nr&&!/^\d{6}$/.test(nr))return alert('Die Projektnummer hat genau 6 Zahlen.');let id=p.id;if(id)D.projects=D.projects.map(x=>x.id===id?Object.assign(x,{name:nm,nr,client:cl,addr:ad,tel:(p.tel||'').trim(),wb:p.wb}):x);else{id=Date.now();D.projects.push({id,name:nm,nr,client:cl,addr:ad,tel:(p.tel||'').trim(),wb:p.wb,done:false,returns:[]});if(p.steps&&p.steps.length&&typeof Todo!=='undefined')Todo.addToProject(id,p.steps)}save();if(S.pm){S.pm=false;S.e.projectId=id;return render()}return go('proj')}
if(a==='pcancel'){if(S.pm){S.pm=false;return render()}return go('proj')}
if(a==='pedit'){S.p=Object.assign({addr:'',tel:''},D.projects.find(x=>x.id==b.i));S.p.wb=Object.assign({name:1,client:1,addr:1,tel:0},S.p.wb||{});S.pv='form';return render()}
if(a==='pdone'){const p=D.projects.find(x=>x.id==b.i);if(p.done){p.done=false;save();return render()}
const m={};D.entries.filter(x=>x.projectId===p.id).forEach(x=>x.material.forEach(t=>{const k=t.name+'|'+(t.unit||'');const q=parseFloat(String(t.qty).replace(',','.'));const o=m[k]||(m[k]={name:t.name,unit:t.unit||'',sum:0,ok:true});if(isNaN(q))o.ok=false;else o.sum+=q}));
S.ret={id:p.id,mq:'',rows:Object.values(m).map(o=>({name:o.name,unit:o.unit,qty:'',used:o.ok?(Math.round(o.sum*100)/100+' '+o.unit).trim():'siehe Einträge'}))};return render()}
if(a==='rrm'){S.ret.rows.splice(+b.i,1);return render()}
if(a==='radd'){const n=document.getElementById('rt-sel').value,u=document.getElementById('rt-unit').value;if(!n)return;S.ret.rows.push({name:n,unit:u,qty:(S.ret.mq||'').trim(),used:''});S.ret.mq='';return render()}
if(a==='rcancel'){S.ret=null;return render()}
if(a==='rsave'){const p=D.projects.find(x=>x.id===S.ret.id);p.returns=S.ret.rows.filter(x=>(x.qty||'').trim()).map(x=>({name:x.name,qty:x.qty.trim(),unit:x.unit}));p.done=true;S.ret=null;save();alert('Projekt abgeschlossen. Es ist nicht gelöscht: Unter „Abgeschlossene anzeigen“ findest du es wieder.');return render()}
if(a==='pgrp'){S.p.open=S.p.open||{};S.p.open[b.c]=!S.p.open[b.c];const y=scrollY;render();scrollTo(0,y);return}
if(a==='pall'){S.all=!S.all;return render()}
if(a==='ptab'){S.pt=b.v;S.q='';S.pv='list';return render()}
if(a==='pnew'){S.p={id:0,name:'',nr:'',client:'',addr:'',tel:'',wb:{name:1,client:1,addr:1,tel:0}};S.pv='form';return render()}
if(a==='lfnew'){S.sp={id:0,t:S.pt,n:'',a:'',tel:'',info:''};S.pv='form';return render()}
if(a==='lfedit'){S.sp=Object.assign({info:''},D.lf.find(x=>x.id==b.i));S.pv='form';return render()}
if(a==='lfcancel'){S.pv='list';return render()}
if(a==='lfsave'){const c=S.sp,n=(c.n||'').trim();if(!n)return alert('Bitte einen Namen eingeben.');c.n=n;c.a=(c.a||'').trim();c.tel=(c.tel||'').trim();c.info=(c.info||'').trim();if(c.id)D.lf=D.lf.map(x=>x.id===c.id?c:x);else{c.id=Date.now();D.lf.push(c)}S.pt=c.t;save();S.pv='list';fb('✔ Gespeichert: '+c.n,1);return render()}
if(a==='lfdel'){if(!confirm('Lieferant wirklich löschen? Bereits gespeicherte Fahrten bleiben unverändert.'))return;D.lf=D.lf.filter(x=>x.id!==S.sp.id);save();S.pv='list';return render()}
if(a==='lfgps'){gpsAddr().then(s=>{if(s){S.sp.a=s;const y=scrollY;render();scrollTo(0,y)}}).catch(()=>alert('Standort nicht verfügbar. Bitte die Adresse eintippen.'));return}}
function onIn(ev){const i=ev.target.id,v=ev.target.value;
if(i&&i.slice(0,3)==='st-'){S.f=S.f||statDef();S.f[i.slice(3)]=v;render()}else if(i==='f-date'&&v){S.e.date=v;reloadDay(true);render()}else if(i==='f-proj'){S.e.projectId=v?+v:'';reloadDay();render()}else if(i==='f-note')S.e.note=v;else if(i==='f-car')S.e.auto=v;else if(i==='w-name'){D.set.name=v;save()}else if(i==='w-mail'){D.set.mail=v;save()}else if(i==='m-qty')S.mq=v;else if(i==='m-sel')S.ms=v;
else if(i&&i.slice(0,3)==='lf-'&&S.sp)S.sp[i.slice(3)]=v;else if(i==='p-name')S.p.name=v;else if(i==='p-nr'){S.p.nr=v.replace(/\D/g,'').slice(0,6);ev.target.value=S.p.nr}else if(i==='p-ad')S.p.addr=v;else if(i==='p-tel')S.p.tel=v;else if(i==='m-unit')S.mu=v;else if(i.startsWith('mq-'))S.e.material[+i.slice(3)].qty=v;else if(i.startsWith('mu-')){const m=S.e.material[+i.slice(3)];m.unit=v;D.mu[m.name]=v;save()}else if(i==='rt-sel')S.ret.ms=v;else if(i==='rt-unit')S.ret.mu=v;else if(i==='rt-qty')S.ret.mq=v;else if(i.startsWith('rq-'))S.ret.rows[+i.slice(3)].qty=v;else if(i==='p-cl')S.p.client=v;
else if(i==='s-hascar'){if(ev.type!=='change')return;D.set.hasCar=ev.target.checked;save();render()}
else if(i==='s-car'){if(ev.type!=='change')return;D.set.car=v.trim().toUpperCase();ev.target.value=D.set.car;save()}
else if(i.startsWith('ps-')){if(ev.type!=='change')return;const sp=S.p;sp.steps=sp.steps||[];const tid=i.slice(3),k=sp.steps.indexOf(tid);if(ev.target.checked){if(k<0)sp.steps.push(tid)}else if(k>=0)sp.steps.splice(k,1)}
else if(i.startsWith('wb-')){if(ev.type!=='change')return;S.p.wb=Object.assign({name:1,client:1,addr:1,tel:0},S.p.wb||{});S.p.wb[i.slice(3)]=ev.target.checked?1:0}
else if(i==='m-new')S.mn=v;
else if(i==='l-edit')S.lv=v;
else if(i==='l-new')S.ln=v;
else if(i==='l-q'){S.lq=v;render();const q=document.getElementById('l-q');q.focus();q.setSelectionRange(v.length,v.length)}
else if(i==='s-name'){if(ev.type!=='change')return;const t=v.trim();if(t){D.set.name=t;save()}else{alert('Bitte einen Namen eingeben.')}ev.target.value=D.set.name}
else if(i==='s-own'){if(ev.type!=='change')return;const t=v.trim();if(t&&!EM.test(t)){alert('Bitte eine gültige E-Mail-Adresse eingeben.');ev.target.value=D.set.own||'';return}D.set.own=t;save()}
else if(i==='s-mail'){if(ev.type!=='change')return;const L=v.split(/[\s,;]+/).filter(Boolean),bad=L.filter(x=>!EM.test(x));if(bad.length){alert('Ungültige Adresse: '+bad.join(', '));ev.target.value=D.set.mail;return}D.set.mail=L.join('\n');ev.target.value=D.set.mail;save()}
else if(i.startsWith('sd-')){if(ev.type!=='change')return;const[,k,f]=i.split('-'),x=D.std[k],o=Object.assign({},x),q=id=>document.getElementById(id);
if(!v&&(f==='start'||f==='end')){ev.target.value=o[f];return}
x[f]=v;if(f==='pf'&&v&&o.pf&&x.pt&&tm(v)>=tm(x.pt))x.pt=ft(Math.min(1439,tm(v)+tm(o.pt)-tm(o.pf)));
let bad=tm(x.end)<=tm(x.start)?'„Ende“ muss nach „Beginn“ liegen.':'';
if(!bad&&x.pf&&x.pt&&(tm(x.pt)<=tm(x.pf)||tm(x.pf)<tm(x.start)||tm(x.pt)>tm(x.end)))bad='Die Pause muss innerhalb der Arbeitszeit liegen („bis“ nach „von“).';
if(bad){Object.assign(x,o);alert(bad);['start','end','pf','pt'].forEach(g=>q('sd-'+k+'-'+g).value=x[g]);return}
save();['pf','pt'].forEach(g=>q('sd-'+k+'-'+g).value=x[g]);q('sdsum-'+k).textContent='Arbeitszeit: '+fh(Math.max(0,tm(x.end)-tm(x.start)-(x.pf&&x.pt?tm(x.pt)-tm(x.pf):0))/60)}
else if(i==='pk-q'){S.pick.q=v;render();const q=document.getElementById('pk-q');q.focus();q.setSelectionRange(v.length,v.length)}
else if(i==='p-q'){S.q=v;const pos=v.length;render();const q=document.getElementById('p-q');q.focus();q.setSelectionRange(pos,pos)}}
return{open(r,t){fixPause();root=r;titleEl=t;if(!r._z){r._z=1;r.addEventListener('click',ev=>{const b=ev.target.closest('[data-a]');if(b)act(b.dataset.a,b.dataset,b)});r.addEventListener('input',onIn);r.addEventListener('change',onIn);r.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&ev.target.id==='l-new'){ev.preventDefault();act('ladd',{},ev.target)}if(ev.key==='Enter'&&ev.target.id==='m-new'){ev.preventDefault();act('madd',{},ev.target)}if(ev.key==='Enter'&&ev.target.id==='l-edit'){ev.preventDefault();act('lsave',{},ev.target)}})}view='menu';S={};render()},
_fix:()=>fixPause(),_pdf:()=>{S.wk=S.wk||monday(iso(new Date()));return buildPdf(S.wk)},_wk:w=>{S.wk=monday(w)},save(){save()},data(){return D},back(){if(S.tm){S.tm=false;render();return true}if(S.rc){S.rc=null;render();return true}if(S.le!=null){S.le=null;render();return true}if(S.prev){S.prev=false;render();return true}if(S.pm){S.pm=false;render();return true}if(S.ret){S.ret=null;render();return true}if(S.pick){S.pick=null;render();return true}if(view==='proj'&&S.pv==='form'){S.pv='list';render();return true}if(view==='plc'&&S.sv){S.sv=null;render();return true}if(view==='menu')return false;if(view==='write'&&S.e&&S.e.id){S.e=null;go('over')}else{S.e=null;go('menu')}return true}}})();
