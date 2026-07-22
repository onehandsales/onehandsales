/* global self, URL */

self.addEventListener("push", (event) => {
  const payload = event.data
    ? event.data.json()
    : { title: "알림", body: "", targetPath: "/" };
  const title = payload.title || "알림";
  const options = {
    body: payload.body || "",
    data: {
      targetPath: payload.targetPath || "/app/notifications",
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetPath = event.notification.data?.targetPath || "/app/notifications";
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      (clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        return self.clients.openWindow(targetUrl);
      }
    )
  );
});
