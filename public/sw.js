// BenneKOM service worker: maakt de app installeerbaar, werkt offline voor de tools en toont pushmeldingen.
const CACHE = 'bennekom-v5';
const IMG = 'bennekom-img-v1'; // verkleinde foto's, blijft bewaard bij een nieuwe versie van de app
const SHELL = ['/', '/tools', '/icons/icon-192.png'];
// oudste verkleinde foto's opruimen, zodat de opslag op de telefoon niet blijft groeien
const trim = (c, max) => c.keys().then((keys) => keys.length > max && Promise.all(keys.slice(0, keys.length - max).map((k) => c.delete(k))));

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== IMG).map((k) => caches.delete(k)))));
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
  // verkleinde foto's (/_next/image): per adres altijd hetzelfde, dus uit de opslag
  if (url.pathname === '/_next/image') {
    e.respondWith(caches.open(IMG).then((c) => c.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok) { c.put(e.request, res.clone()); trim(c, 400); }
      return res;
    }))));
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
  // Pagina's: netwerk eerst, maar bij een trage verbinding niet blijven wachten.
  // Na 2,5 seconden de bewaarde versie tonen (als die er is); de nieuwe wordt op de achtergrond alsnog bewaard.
  const net = fetch(e.request).then((res) => put(e.request, res));
  e.waitUntil(net.catch(() => {}));
  e.respondWith(new Promise((resolve) => {
    let done = false;
    const fallback = () => caches.match(e.request).then((r) => r || (e.request.mode === 'navigate' ? caches.match('/') : null));
    const timer = setTimeout(() => fallback().then((r) => { if (r && !done) { done = true; resolve(r); } }), 2500);
    net.then((res) => { if (!done) { done = true; clearTimeout(timer); resolve(res); } })
      .catch(() => { clearTimeout(timer); fallback().then((r) => { if (!done) { done = true; resolve(r || Response.error()); } }); });
  }));
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
