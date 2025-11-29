/* =========================================
    SERVICE WORKER CHUẨN 2025
    - Cache index + css + js để chạy offline
    - KHÔNG cache icons / manifest
    - Network-first cho tất cả asset còn lại
   ========================================= */

const CACHE = "sr-cache-v2";

const FILES = [
  "index.html",
  "style.css",
  "app.js",
];

/* CÀI ĐẶT CACHE */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting(); // cập nhật ngay
});

/* KÍCH HOẠT */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim(); // áp dụng ngay lập tức
});

/* FETCH */
self.addEventListener("fetch", event => {
  const req = event.request;

  // Chỉ cache GET
  if (req.method !== "GET") return;

  // NETWORK FIRST
  event.respondWith(
    fetch(req)
      .then(res => {
        // Nếu là file offline quan trọng → lưu vào cache
        if (FILES.includes(new URL(req.url).pathname.replace("/", ""))) {
          caches.open(CACHE).then(cache => cache.put(req, res.clone()));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
