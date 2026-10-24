import webpush, { WebPushError } from "web-push"
import { prisma } from "@/lib/prisma"
import type { PushSubscriptionInput } from "@/lib/validation/announcement"

export interface PushPayload {
	title: string
	body: string
	url?: string
}

let vapidConfigured: boolean | undefined

// Announcements still save when VAPID keys are missing
function configureVapid() {
	if (vapidConfigured !== undefined) {
		return vapidConfigured
	}

	const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
	const privateKey = process.env.VAPID_PRIVATE_KEY
	const subject = process.env.VAPID_SUBJECT

	if (!publicKey || !privateKey || !subject) {
		console.warn("Push notifications are disabled: VAPID keys or subject are not set.")
		vapidConfigured = false
		return vapidConfigured
	}

	webpush.setVapidDetails(subject, publicKey, privateKey)
	vapidConfigured = true
	return vapidConfigured
}

export async function savePushSubscription(volunteerId: string, subscription: PushSubscriptionInput) {
	const keys = { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth }

	await prisma.notification_Permission.upsert({
		where: { endpoint: subscription.endpoint },
		update: { volunteerId, ...keys },
		create: { volunteerId, endpoint: subscription.endpoint, ...keys },
	})
}

export async function removePushSubscription(volunteerId: string, endpoint: string) {
	await prisma.notification_Permission.deleteMany({ where: { volunteerId, endpoint } })
}

export async function sendPushToVolunteers(volunteerIds: string[], payload: PushPayload) {
	if (volunteerIds.length === 0 || !configureVapid()) {
		return { sent: 0, failed: 0 }
	}

	const subscriptions = await prisma.notification_Permission.findMany({
		where: { volunteerId: { in: volunteerIds } },
	})
	const body = JSON.stringify(payload)
	const expired: string[] = []

	const results = await Promise.allSettled(
		subscriptions.map(async (subscription) => {
			try {
				await webpush.sendNotification(
					{
						endpoint: subscription.endpoint,
						keys: { p256dh: subscription.p256dh, auth: subscription.auth },
					},
					body,
				)
			} catch (error) {
				if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
					expired.push(subscription.id)
				}
				throw error
			}
		}),
	)

	if (expired.length > 0) {
		await prisma.notification_Permission.deleteMany({ where: { id: { in: expired } } })
	}

	const failed = results.filter((result) => result.status === "rejected")
	for (const result of failed) {
		console.error("Failed to send push notification:", result.reason)
	}

	return { sent: results.length - failed.length, failed: failed.length }
}
