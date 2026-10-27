const CACHE='maak-assets-v3.0';
const BASE=new URL('./',self.registration.scope);
const ASSETS=['./','./index.html','./styles.css','./roadmap.css','./src/roadmap.js','./src/data.js','./src/core.js','./src/app.js','./icon.svg','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(p=>new URL(p,BASE).href))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('werkstatt-assets-')||k.startsWith('maak-assets-'))&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(fetch(e.request).then(r=>{if(r.ok){const r2=r.clone();caches.open(CACHE).then(c=>c.put(e.request,r2))}return r}).catch(()=>caches.match(e.request))) });
