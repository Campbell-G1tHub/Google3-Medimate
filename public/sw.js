/** @type {ServiceWorkerGlobalScope} */
const sw = self

sw.addEventListener("push", (event) => {
	if (!event.data) {
		return
	}

	const data = event.data.json()

	event.waitUntil(
		Promise.all([
			sw.registration.showNotification(data.title, {
				body: data.body,
				icon: data.icon || "/icon-192x192.png",
				badge: "/icon-192x192.png",
				data: { url: data.url || "/home" },
			}),
			sw.clients
				.matchAll({ type: "window" })
				.then((clients) =>
					clients.forEach((client) => client.postMessage({ type: "notification-received" })),
				),
		]),
	)
})

sw.addEventListener("notificationclick", (event) => {
	event.notification.close()

	const url = new URL(event.notification.data?.url || "/home", sw.location.origin).href

	event.waitUntil(
		sw.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
			const existing = clients.find((client) => client.url === url)
			if (existing) {
				return existing.focus()
			}
			return sw.clients.openWindow(url)
		}),
	)
})
