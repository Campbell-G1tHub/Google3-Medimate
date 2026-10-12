"use client"

import { useCallback, useEffect, useState } from "react"

const SUBSCRIPTION_API = "/api/volunteers/dashboard/push-subscription"
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""

export type PushStatus = "loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed"

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
	const rawData = window.atob(base64)
	return Uint8Array.from(rawData, (char) => char.charCodeAt(0))
}

function isPushSupported() {
	return (
		Boolean(VAPID_PUBLIC_KEY) &&
		"serviceWorker" in navigator &&
		"PushManager" in window &&
		"Notification" in window
	)
}

export function usePushSubscription() {
	const [status, setStatus] = useState<PushStatus>("loading")
	const [isBusy, setIsBusy] = useState(false)

	useEffect(() => {
		if (!isPushSupported()) {
			setStatus("unsupported")
			return
		}

		navigator.serviceWorker
			.register("/sw.js", { scope: "/", updateViaCache: "none" })
			.then((registration) => registration.pushManager.getSubscription())
			.then((subscription) => {
				if (Notification.permission === "denied") {
					setStatus("denied")
				} else {
					setStatus(subscription ? "subscribed" : "unsubscribed")
				}
			})
			.catch(() => setStatus("unsupported"))
	}, [])

	const subscribe = useCallback(async () => {
		setIsBusy(true)
		try {
			const permission = await Notification.requestPermission()
			if (permission !== "granted") {
				setStatus(permission === "denied" ? "denied" : "unsubscribed")
				return
			}

			const registration = await navigator.serviceWorker.ready
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
			})

			const response = await fetch(SUBSCRIPTION_API, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(subscription),
			})

			if (!response.ok) {
				await subscription.unsubscribe()
				setStatus("unsubscribed")
				return
			}

			setStatus("subscribed")
		} catch {
			setStatus("unsubscribed")
		} finally {
			setIsBusy(false)
		}
	}, [])

	const unsubscribe = useCallback(async () => {
		setIsBusy(true)
		try {
			const registration = await navigator.serviceWorker.ready
			const subscription = await registration.pushManager.getSubscription()

			if (subscription) {
				await fetch(SUBSCRIPTION_API, {
					method: "DELETE",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ endpoint: subscription.endpoint }),
				})
				await subscription.unsubscribe()
			}

			setStatus("unsubscribed")
		} finally {
			setIsBusy(false)
		}
	}, [])

	return { status, isBusy, subscribe, unsubscribe }
}
