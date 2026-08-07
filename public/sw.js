// Service worker mínimo: solo cachea el icono/manifest del arranque para que la app
// instalada abra con su identidad visual. Los datos NUNCA se cachean: siempre a red.
const CACHE = 'finanzas-shell-v1';
const ESTATICOS = ['/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ESTATICOS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const esEstatico = e.request.method === 'GET' && ESTATICOS.includes(url.pathname);
  if (!esEstatico) return; // todo lo demás (páginas y Supabase) va directo a la red
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
