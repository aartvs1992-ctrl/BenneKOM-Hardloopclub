// BenneKOM service worker: maakt de app installeerbaar, werkt offline voor de tools en toont pushmeldingen.
const CACHE = 'bennekom-v4';
const SHELL = ['/', '/tools', '/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// Snel schakelen tussen schermen:
// - code van de app (/_next/static, vaste namen per versie): uit de opslag, anders ophalen
// - clubfoto's en iconen: meteen uit de opslag tonen en op de achtergrond verversen
// - pagina's: netwerk eerst; zonder verbinding de laatst bewaarde versie
// API-verzoeken en video's (worden in stukjes geladen) nooit via de opslag.
const put = (req, res) => { if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; };

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  if (/\.(mp4|mov|webm)$/i.test(url.pathname) || e.request.headers.has('range')) return;

  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => put(e.request, res))));
    return;
  }
  if (/^\/(club|media|icons)\//.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then((hit) => {
      const fresh = fetch(e.request).then((res) => put(e.request, res)).catch(() => hit);
      if (hit) { e.waitUntil(fresh); return hit; }
      return fresh;
    }));
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then((res) => put(e.request, res))
      .catch(() => caches.match(e.request).then((r) => r || caches.match('/')))
  );
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: 'BenneKOM', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'BenneKOM', {
    body: d.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    data: { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ('focus' in c) { c.navigate(url); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});
