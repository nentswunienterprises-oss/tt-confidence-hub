self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  const payload = event.data.json();
  const title = payload.title || "Territorial Tutoring";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/tt-logo.png",
    badge: payload.badge || "/favicon.png",
    image: payload.image,
    data: {
      url: payload.url || "/operational/tutor/gateway",
      primaryActionUrl: payload.primaryActionUrl || payload.url || "/operational/tutor/gateway",
    },
    tag: payload.tag || "tt-update",
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: "open",
        title: payload.primaryActionLabel || "Open App",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") {
    return;
  }

  const destination = event.action === "open"
    ? event.notification.data?.primaryActionUrl || event.notification.data?.url || "/operational/tutor/gateway"
    : event.notification.data?.url || "/operational/tutor/gateway";

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
