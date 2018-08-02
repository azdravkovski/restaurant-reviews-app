var CACHE = "restaurant-cache";
var urlsCache = [
  "/",
  "/index.html",
  "/restaurant.html",
  "/public/css/styles.css",
  "/public/js/dbhelper-min.js",
  "/public/js/main-min.js",
  "/public/js/restaurant_info-min.js",
  "/public/js/register_sw-min.js",
  "/node_modules/idb/lib/idb.js",
  "/public/images/1.webp",
  "/public/images/2.webp",
  "/public/images/3.webp",
  "/public/images/4.webp",
  "/public/images/5.webp",
  "/public/images/6.webp",
  "/public/images/7.webp",
  "/public/images/8.webp",
  "/public/images/9.webp",
  "/public/images/10.webp"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE).then(function(cache) {
      console.log("Cache started");
      return cache.addAll(urlsCache);
    })
  );
});

self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.filter(function(cacheName) {
					return cacheName.startsWith('restaurant-') && cacheName != CACHE;
				}).map(function(cacheName) {
					return caches.delete(cacheName);
				})    
			);
		})
	);
});


self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then(response => {
			if (response) {
				// console.log('Found in cache:', event.request.url);
				return response;
			}
			// console.log('Network request for ', event.request.url);
			return fetch(event.request).then(networkResponse => {
				if (networkResponse.status === 404) {
					// console.log(networkResponse.status);
					return;
				}
				return caches.open(CACHE).then(cache => {
					cache.put(event.request.url, networkResponse.clone());
					// console.log('Fetched and cached', event.request.url);
					return networkResponse;
				})
			})
		}).catch(error => {
			console.log('Error:', error);
			return;
		})
	);
});

self.addEventListener('message', (event) => {
    console.log(event);
	
    if (event.data.action === 'skipWaiting') {
       self.skipWaiting();
    }
});
