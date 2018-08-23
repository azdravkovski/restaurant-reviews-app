const CACHE = "restaurant-cache";
const RUNTIME = 'runtime';
const urlsToCache = [
	"/",
	"index.html",
	"restaurant.html",
	"css/styles.css",
	"js/dbhelper.js",
	"js/main.js",
	"js/restaurant_info.js",
	"js/register_sw.js",
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

self.addEventListener("install", event => {
	event.waitUntil(
		caches.open(CACHE)
			.then(cache => {
				console.log("Cache started");
				return cache.addAll(urlsToCache);
			})
	);
});

self.addEventListener('activate', event => {
	console.log('activated sw');
	const currentCaches = [CACHE, RUNTIME];
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
		}).then(cachesToDelete => {
			return Promise.all(cachesToDelete.map(cacheToDelete => {
				return caches.delete(cacheToDelete);
			}));
		}).then(() => self.clients.claim())
	);
});


self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then(response => {
			if (response) {
				return response;
			}
			return fetch(event.request).then(networkResponse => {
				if (networkResponse.status === 404) {
					return;
				}
				return caches.open(RUNTIME).then(cache => {
					cache.put(event.request.url, networkResponse.clone());
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
