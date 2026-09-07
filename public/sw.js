self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Обсидик оставил послание ❤️",
    body: "уруру ❤️",
    url: "/",
  };

  try {
    if (event.data) {
      data = {
        ...data,
        ...event.data.json(),
      };
    }
  } catch (error) {
    console.error("Push data error:", error);
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Для Кэссички ❤️",
      {
        body: data.body || "",
        icon: "/icon-192.png",
        badge: "/icon-192.png",

        // Без звука и вибрации
        silent: true,

        tag: data.tag || `kessichka-${Date.now()}`,
        renotify: false,

        data: {
          url: data.url || "/",
        },
      }
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
