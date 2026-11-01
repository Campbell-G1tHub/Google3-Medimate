import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type NotificationSettingsInput = {
	appNotifications?: boolean
	opportunityNotifications?: boolean
	newsletterNotifications?: boolean
	preferences?: string[]
}

function isValidInput(value: unknown): value is NotificationSettingsInput {
	if (!value || typeof value !== "object") return false
	const input = value as Record<string, unknown>
	return (
		(input.appNotifications === undefined || typeof input.appNotifications === "boolean") &&
		(input.opportunityNotifications === undefined ||
			typeof input.opportunityNotifications === "boolean") &&
		(input.newsletterNotifications === undefined ||
			typeof input.newsletterNotifications === "boolean") &&
		(input.preferences === undefined ||
			(Array.isArray(input.preferences) &&
				input.preferences.every((item) => typeof item === "string")))
	)
}

function parsePreferences(value: string | undefined) {
	if (!value) return []
	try {
		const parsed: unknown = JSON.parse(value)
		return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : []
	} catch {
		return []
	}
}

export async function PUT(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers })
	if (!session) return Response.json({ error: "Authentication is required." }, { status: 401 })
	const input: unknown = await request.json().catch(() => null)
	if (!isValidInput(input)) return Response.json({ error: "Invalid settings." }, { status: 400 })

	const existing = await prisma.volunteerNotificationSettings.findUnique({
		where: { volunteerId: session.user.id },
	})
	const preferences = input.preferences ?? parsePreferences(existing?.preferences)
	const settings = await prisma.volunteerNotificationSettings.upsert({
		where: { volunteerId: session.user.id },
		create: {
			volunteerId: session.user.id,
			appNotifications: input.appNotifications ?? true,
			opportunityNotifications: input.opportunityNotifications ?? true,
			newsletterNotifications: input.newsletterNotifications ?? true,
			preferences: JSON.stringify(preferences),
		},
		update: {
			...(input.appNotifications === undefined ? {} : { appNotifications: input.appNotifications }),
			...(input.opportunityNotifications === undefined
				? {}
				: { opportunityNotifications: input.opportunityNotifications }),
			...(input.newsletterNotifications === undefined
				? {}
				: { newsletterNotifications: input.newsletterNotifications }),
			...(input.preferences === undefined ? {} : { preferences: JSON.stringify(preferences) }),
		},
	})

	return Response.json({ settings: { ...settings, preferences } })
}
