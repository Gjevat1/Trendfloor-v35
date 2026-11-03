const Kontakt=(()=>{
const KEY='tf_kontakte_v1',GR=['Büro','Montage'];
let D={list:[]},view='list',root,titleEl,S={tab:'Alle',q:'',c:null};
try{D=Object.assign(D,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){alert('Speichern nicht möglich!')}};
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const num=t=>String(t||'').replace(/[^\d+]/g,'');
const A='display:inline-flex;align-items:center;justify-content:center;text-decoration:none;';
function rList(){const q=S.q.toLowerCase();
const l=D.list.filter(c=>(S.tab==='Alle'||c.group===S.tab)&&(c.name+' '+c.role+' '+c.phone+' '+c.mail+' '+c.info).toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'de'));
return`<div class="zc"><div class="seg">${['Alle'].concat(GR).map(t=>`<button class="zb ${S.tab===t?'':'l'}" data-a="tab" data-v="${t}">${t}</button>`).join('')}</div>
<input id="k-q" placeholder="🔍 Suchen" value="${esc(S.q)}">
<button class="zb g" style="height:48px" data-a="new">+ Neuer Kontakt</button>
${l.map(c=>`<div class="zcard"><div class="zrow"><div style="flex:1"><b>${esc(c.name)}</b> <small>· ${esc(c.group)}${c.role?' · '+esc(c.role):''}</small></div><button class="zb l" style="height:38px" data-a="edit" data-i="${c.id}">✎</button></div>
${c.phone?`<div style="margin-top:6px">📞 ${esc(c.phone)}</div>`:''}${c.mail?`<div>✉ ${esc(c.mail)}</div>`:''}${c.info?`<div style="margin-top:4px"><small>${esc(c.info)}</small></div>`:''}
<div class="zrow" style="margin-top:8px">${c.phone?`<a class="zb g" style="${A}flex:1" href="tel:${num(c.phone)}">📞 Anrufen</a>`:''}${c.mail?`<a class="zb" style="${A}flex:1" href="mailto:${esc(c.mail)}">✉ E-Mail</a>`:''}</div></div>`).join('')||'<div class="zcard">Noch keine Kontakte.</div>'}</div>`}
function rForm(){const c=S.c;
return`<div class="zc"><label>Name</label><input id="k-name" value="${esc(c.name)}">
<label>Gruppe</label><select id="k-group">${GR.map(g=>`<option ${g===c.group?'selected':''}>${g}</option>`).join('')}</select>
<label>Funktion (optional)</label><input id="k-role" placeholder="z. B. Bauleiter, Parkettleger" value="${esc(c.role)}">
<label>Telefon</label><input id="k-phone" inputmode="tel" placeholder="+43 …" value="${esc(c.phone)}">
<label>E-Mail</label><input id="k-mail" inputmode="email" value="${esc(c.mail)}">
<label>Info (optional)</label><textarea id="k-info" rows="3">${esc(c.info)}</textarea>
<button class="zb g" style="height:52px" data-a="save">💾 Speichern</button>${c.id?`<button class="zb r" style="height:48px" data-a="del">🗑 Löschen</button>`:''}</div>`}
function render(){titleEl.textContent=view==='list'?'Kontakte & Infos':(S.c.id?'Kontakt bearbeiten':'Neuer Kontakt');root.innerHTML=view==='list'?rList():rForm();window.scrollTo(0,0)}
function act(a,b){
if(a==='tab'){S.tab=b.v;return render()}
if(a==='new'){S.c={id:0,name:'',group:S.tab==='Montage'?'Montage':'Büro',role:'',phone:'',mail:'',info:''};view='form';return render()}
if(a==='edit'){S.c=Object.assign({},D.list.find(x=>x.id==b.i));view='form';return render()}
if(a==='save'){const c=S.c;if(!c.name.trim())return alert('Bitte einen Namen eingeben.');c.name=c.name.trim();if(c.id)D.list=D.list.map(x=>x.id===c.id?c:x);else{c.id=Date.now();D.list.push(c)}save();view='list';return render()}
if(a==='del'){if(!confirm('Kontakt wirklich löschen?'))return;D.list=D.list.filter(x=>x.id!==S.c.id);save();view='list';return render()}}
function onIn(ev){const i=ev.target.id,v=ev.target.value;
if(i==='k-q'){S.q=v;render();const q=document.getElementById('k-q');q.focus();q.setSelectionRange(v.length,v.length)}
else if(i.startsWith('k-')&&S.c)S.c[i.slice(2)]=v}
return{open(r,t){root=r;titleEl=t;if(!r._k){r._k=1;r.addEventListener('click',ev=>{const b=ev.target.closest('[data-a]');if(b)act(b.dataset.a,b.dataset)});r.addEventListener('input',onIn);r.addEventListener('change',onIn)}view='list';S.q='';S.tab='Alle';render()},
back(){if(view==='form'){view='list';render();return true}return false}}})();
