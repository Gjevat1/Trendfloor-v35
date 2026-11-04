const V='trendfloor-039';
const FILES=['./','index.html','zeit.js','kontakt.js','material.js','regie.js','jspdf.min.js','manifest.webmanifest','icon-192.png','icon-512.png','logo.jpg','zeit.png','mat.png','regie.png','fahrt.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('index.html'))));});
