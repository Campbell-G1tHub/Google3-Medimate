import { prisma } from "@/lib/prisma"
import type { AnnouncementInput } from "@/lib/validation/announcement"
import { VOLUNTEER_INTEREST_OPTIONS } from "@/lib/validation/onboarding"

const NOTIFICATION_PAGE_SIZE = 50

/** Saves the post and one notification per recipient. author is never a recipient */
export async function createAnnouncement(authorId: string, input: AnnouncementInput) {
	// Onboarding names each VolunteerGroup after its interest label
	const groupNames = VOLUNTEER_INTEREST_OPTIONS.filter((option) =>
		input.groups.includes(option.value),
	).map((option) => option.label)

	return prisma.$transaction(async (tx) => {
		const groups = await Promise.all(
			groupNames.map((name) =>
				tx.volunteerGroup.upsert({ where: { name }, update: {}, create: { name } }),
			),
		)

		const recipients = await tx.volunteer.findMany({
			where: {
				id: { not: authorId },
				onboardingCompleted: true,
				...(input.sendToAll
					? {}
					: {
							volunteerGroupPreferences: {
								some: { groupId: { in: groups.map((group) => group.id) } },
							},
						}),
			},
			select: { id: true },
		})

		const post = await tx.post.create({
			data: {
				authorId,
				type: input.type,
				title: input.subject,
				body: input.message,
				link: input.link,
				sendToAll: input.sendToAll,
				targetGroups: { create: groups.map((group) => ({ groupId: group.id })) },
			},
		})

		const recipientIds = recipients.map((recipient) => recipient.id)

		await tx.notification.createMany({
			data: recipientIds.map((volunteerId) => ({ postId: post.id, volunteerId })),
		})

		return { post, recipientIds }
	})
}

export function countUnreadNotifications(volunteerId: string) {
	return prisma.notification.count({ where: { volunteerId, readAt: null } })
}

export async function listNotifications(volunteerId: string) {
	const [notifications, unreadCount] = await Promise.all([
		prisma.notification.findMany({
			where: { volunteerId },
			orderBy: { createdAt: "desc" },
			take: NOTIFICATION_PAGE_SIZE,
			include: { post: true },
		}),
		countUnreadNotifications(volunteerId),
	])

	return {
		unreadCount,
		notifications: notifications.map((notification) => ({
			id: notification.id,
			readAt: notification.readAt?.toISOString() ?? null,
			createdAt: notification.createdAt.toISOString(),
			announcement: {
				id: notification.post.id,
				type: notification.post.type,
				subject: notification.post.title,
				message: notification.post.body,
				link: notification.post.link,
			},
		})),
	}
}

export type NotificationItem = Awaited<ReturnType<typeof listNotifications>>["notifications"][number]

/** volunteer's own notifications box, no IDs means marks all as read */
export async function markNotificationsRead(volunteerId: string, notificationIds?: string[]) {
	await prisma.notification.updateMany({
		where: {
			volunteerId,
			readAt: null,
			...(notificationIds ? { id: { in: notificationIds } } : {}),
		},
		data: { readAt: new Date() },
	})

	return countUnreadNotifications(volunteerId)
}
