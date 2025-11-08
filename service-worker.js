const CACHE_NAME = 'perekuson-v1.4';
const urlsToCache = [
  './',
  './index.html',
  './login.html', 
  './register.html',
  './style.css',
  './js/auth.js',
  './js/admin.js',
  './js/app.js',
  './js/main.js',
  './js/register.js',
  './js/login.js',
  './icon.png',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});