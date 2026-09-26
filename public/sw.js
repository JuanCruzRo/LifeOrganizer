// Minimal service worker: it exists so the app is installable and can show
// notifications. It deliberately does NOT cache app code, to avoid serving
// stale builds after a deploy.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes("/app") && "focus" in client) return client.focus();
      }
      return self.clients.openWindow("/app");
    })
  );
});
