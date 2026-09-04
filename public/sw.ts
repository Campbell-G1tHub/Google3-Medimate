const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon-512x512.png',
      badge: '/icon-512x512.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(sw.registration.showNotification(data.title, options))
  }
})

sw.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('Notification click received.')
  event.notification.close()
  event.waitUntil(sw.clients.openWindow('http://localhost:3000')) // DOTHIS: change url (what URL to show on click)
})