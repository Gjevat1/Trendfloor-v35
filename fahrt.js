const Fahrt=(()=>{let fr=null;
const size=()=>{if(fr&&fr.isConnected)fr.style.height=Math.max(320,innerHeight-fr.getBoundingClientRect().top)+'px'};
addEventListener('resize',size);
return{open(r,t){r.innerHTML='<iframe id="fbf" src="fahrt.html" allow="geolocation; web-share" style="display:block;width:100%;border:0;background:#2b2b2b"></iframe>';fr=r.firstChild;size();setTimeout(size,80);setTimeout(size,400)},
back(){try{const d=fr&&fr.contentWindow&&fr.contentWindow.document.querySelector('dialog');if(d&&d.open){d.close();return true}}catch(e){}return false}}})();
