function receivePushNotification(event) {
  const { tag, url, title, text } = event.data.json()

  const options = {
    data: url,
    body: text,
    icon: "/assets/kirimin_icon.png",
    vibrate: [200, 100, 200],
    tag: tag,
    // image: "/assets/kirimin_icon.png",
    badge: "/assets/kirimin_icon.png",
    actions: [{ action: "Detail", title: "Open" }]
  }
  // @ts-expect-error no default for typescript
  event.waitUntil(self.registration.showNotification(title, options))
}

function openPushNotification(event) {
  event.notification.close()
  // @ts-expect-error no default for typescript
  event.waitUntil(clients.openWindow(event.notification.data))
}

self.addEventListener("push", receivePushNotification)
self.addEventListener("notificationclick", openPushNotification)
