import { z } from "zod"
import { VOLUNTEER_INTEREST_OPTIONS } from "@/lib/validation/onboarding"

export const ANNOUNCEMENT_TYPE_OPTIONS = [
	{ value: "GENERAL", label: "General" },
	{ value: "OPPORTUNITY", label: "Opportunity" },
	{ value: "NEWSLETTER", label: "Newsletter" },
] as const

export type AnnouncementType = (typeof ANNOUNCEMENT_TYPE_OPTIONS)[number]["value"]

const LINKABLE_TYPES: readonly AnnouncementType[] = ["OPPORTUNITY", "NEWSLETTER"]

export const ALL_VOLUNTEERS = "all"

// Groups are the interests volunteers pick during onboarding
export const SEND_TO_OPTIONS = [
	{ value: ALL_VOLUNTEERS, label: "All volunteers" },
	...VOLUNTEER_INTEREST_OPTIONS,
] as const

const GROUP_VALUES = new Set<string>(VOLUNTEER_INTEREST_OPTIONS.map((option) => option.value))

const httpUrl = z.url({ protocol: /^https?$/ })

export const announcementSchema = z
	.object({
		type: z.enum(["GENERAL", "OPPORTUNITY", "NEWSLETTER"], "Choose an announcement type"),
		subject: z
			.string("Enter a subject")
			.trim()
			.min(1, "Enter a subject")
			.max(150, "Keep the subject under 150 characters"),
		message: z
			.string("Enter a message")
			.trim()
			.min(1, "Enter a message")
			.max(5000, "Keep the message under 5000 characters"),
		link: z.string().trim().optional(),
		sendTo: z
			.array(z.string(), "Choose who to send this to")
			.min(1, "Choose who to send this to"),
	})
	.superRefine((values, ctx) => {
		const link = values.link ?? ""

		if (values.type === "NEWSLETTER" && !link) {
			ctx.addIssue({ code: "custom", path: ["link"], message: "Enter the newsletter link" })
		} else if (link && !LINKABLE_TYPES.includes(values.type)) {
			ctx.addIssue({
				code: "custom",
				path: ["link"],
				message: "General announcements cannot include a link",
			})
		} else if (link && !httpUrl.safeParse(link).success) {
			ctx.addIssue({
				code: "custom",
				path: ["link"],
				message: "Enter a full link starting with https://",
			})
		}

		if (values.sendTo.some((value) => value !== ALL_VOLUNTEERS && !GROUP_VALUES.has(value))) {
			ctx.addIssue({ code: "custom", path: ["sendTo"], message: "Choose a listed group" })
		}
	})
	.transform(({ link, sendTo, ...values }) => {
		const sendToAll = sendTo.includes(ALL_VOLUNTEERS)

		return {
			...values,
			link: link || undefined,
			sendToAll,
			groups: sendToAll ? [] : [...new Set(sendTo)],
		}
	})

export type AnnouncementFormValues = z.input<typeof announcementSchema>
export type AnnouncementInput = z.output<typeof announcementSchema>

export function describeAudience(sendTo: readonly string[]) {
	if (sendTo.includes(ALL_VOLUNTEERS)) {
		return "all volunteers"
	}

	const labels = VOLUNTEER_INTEREST_OPTIONS.filter((option) => sendTo.includes(option.value)).map(
		(option) => option.label,
	)

	if (labels.length > 2) {
		return `${labels.length} volunteer groups`
	}

	return labels.join(" and ")
}

// When sent, `userId` must match the signed-in user
export const listNotificationsSchema = z.object({
	userId: z.uuid("User ID must be a UUID").optional(),
})

// Omitting `notificationIds` marks every notification as read
export const markReadSchema = z.object({
	userId: z.uuid("User ID must be a UUID").optional(),
	notificationIds: z.array(z.uuid("Notification IDs must be UUIDs")).max(100).optional(),
})

export const pushSubscriptionSchema = z.object({
	endpoint: httpUrl,
	keys: z.object({
		p256dh: z.string().min(1),
		auth: z.string().min(1),
	}),
})

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>
