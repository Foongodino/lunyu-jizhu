const CACHE='lunyu-teaching-v5-4';
const FILES=['./','./index.html','./manifest.webmanifest','./assets/style.css','./assets/app.js','./data/lunyu.json','./assets/chinese_projector_bg.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
