// self.addEventListener("push", (event) => {
//   if (!event.data) return;

//   const data = event.data.json();

//   self.registration.showNotification(data.title || "Luma Reminder", {
//     body: data.body,
//     icon: "/icon.png",   // optional
//     badge: "/icon.png"  // optional
//   });
// });

// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();
//   event.waitUntil(
//     clients.openWindow("/")
//   );
// });


/* public/sw.js */

self.addEventListener("push", (event) => {
  event.waitUntil((async () => {
    if (!event.data) return;

    let data = {};
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }

    const title = data.title || "🔔 Luma Reminder";

    const options = {
      body: data.body || "You have a new reminder",
      icon: "/icon.png",
      badge: "/icon.png",
      vibrate: data.vibrate || [200, 100, 200],
      data: {
        url: data?.data?.url || "/",
        reminderId: data?.data?.reminderId
      },
      tag: data?.tag || "luma-reminder",   // prevents spam duplicates
      renotify: true
    };

    await self.registration.showNotification(title, options);
  })());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/";

  event.waitUntil((async () => {
    const allClients = await clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    // Focus existing tab if already open
    for (const client of allClients) {
      if (client.url.includes(targetUrl) && "focus" in client) {
        return client.focus();
      }
    }

    // Otherwise open new tab
    if (clients.openWindow) {
      return clients.openWindow(targetUrl);
    }
  })());
});
