self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : { title: "そだてnote", body: "今日の投稿をお忘れなく！" };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "そだてnote", {
      body: data.body ?? "今日の投稿をお忘れなく！",
      icon: "/icons/apple-touch-icon.png",
      badge: "/icons/apple-touch-icon.png",
      tag: "daily-reminder",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        return clients.openWindow("/");
      })
  );
});
