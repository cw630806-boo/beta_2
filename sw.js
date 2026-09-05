const CACHE_NAME = 'youssef-bjj-v7';
const urlsToCache = [
  'index.html',
  'course.html',
  'admin.html',
  'packages.html',
  'payment.html',
  'style.css',
  'app.js',
  'admin.js',
  'theme.js',
  'firebase-init.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // نضيف كل ملف على حدة: إذا نقص ملف واحد (مثلاً أيقونة لم تُرفع بعد)
      // ما يوقفش التنصيب كاملاً كيما كان يصير مع cache.addAll()
      return Promise.all(
        urlsToCache.map(url =>
          cache.add(url).catch(err => console.warn('SW: تعذر تخزين', url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});