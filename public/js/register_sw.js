/**
 * Service Registration.
 */

navigator.serviceWorker.register('./sw.js').then((registration) => {
    console.log('Registered service worker.');

    if (!navigator.serviceWorker.controller) {
        return;
    }

    if (registration.waiting) {
        navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }

    if (registration.installing) {
        navigator.serviceWorker.addEventListener('statechange', () => {
            if (navigator.serviceWorker.controller.state == 'installed') {
                navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
            }
        });
    }

    registration.addEventListener('updatefound', () => {
        navigator.serviceWorker.addEventListener('statechange', () => {
            if (navigator.serviceWorker.controller.state == 'installed') {
                navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
            }
        });
    });

}).catch(() => {
    console.log('Failed to register service worker');
});

var refreshing;
navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
})

navigator.serviceWorker.ready.then((serviceWorkerReg) => {    
    return serviceWorkerReg.sync.register('first-sync');
});
