self.addEventListener('push', (event) => {
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
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.')
  event.notification.close()
  event.waitUntil(self.clients.openWindow('http://localhost:3000')) // DOTHIS: change url (what URL to show on click)
})