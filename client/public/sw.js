self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  const payload = event.data.json();
  const title = payload.title || "Territorial Tutoring";
  const options = {
    body: payload.body || "",
    data: {
      url: payload.url || "/operational/tutor/gateway",
    },
    tag: payload.tag || "tt-update",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destination = event.notification.data?.url || "/operational/tutor/gateway";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.focus();
          client.navigate(destination);
          return;
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(destination);
      }
    }),
  );
});
