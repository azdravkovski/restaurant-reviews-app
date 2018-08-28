const CACHE = "restaurant-cache";
const RUNTIME = 'runtime';
const urlsToCache = [
	"/",
	"index.html",
	"restaurant.html",
	"public/css/styles.css",
	"public/js/dbhelper-min.js",
	"public/js/main-min.js",
	"public/js/restaurant_info-min.js",
	"public/js/register_sw-min.js",
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

self.addEventListener('fetch', event => {
  const storageUrl = event.request.url.split(/[?#]/)[0];

  if (storageUrl.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(storageUrl).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            return cache.put(storageUrl, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});


self.addEventListener('message', (event) => {
	console.log(event);

	if (event.data.action === 'skipWaiting') {
		self.skipWaiting();
	}
});
