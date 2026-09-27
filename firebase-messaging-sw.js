// Service Worker für Push-Benachrichtigungen, wenn die App geschlossen oder im Hintergrund ist.
// Muss im Root der veröffentlichten Seite liegen, damit er die ganze Seite kontrollieren kann.
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');
importScripts('./config.js');

const CONFIG = self.MARKTZETTEL_CONFIG || {};

if (CONFIG.firebase && String(CONFIG.firebase.apiKey || '').indexOf('DEIN_') !== 0) {
  firebase.initializeApp(CONFIG.firebase);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || 'Marktzettel';
    const body = (payload.notification && payload.notification.body) || '';
    self.registration.showNotification(title, {
      body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'marktzettel-update',
      renotify: true
    });
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
