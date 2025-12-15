self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  self.registration.showNotification(data.title || "Luma Reminder", {
    body: data.body,
    icon: "/icon.png",   // optional
    badge: "/icon.png"  // optional
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/")
  );
});
