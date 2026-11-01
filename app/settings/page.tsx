import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SettingsPageContent } from "@/components/settings/settings-page"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function parsePreferences(value: string | undefined) {
	if (!value) return []
	try {
		const parsed: unknown = JSON.parse(value)
		return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : []
	} catch {
		return []
	}
}

export default async function SettingsPage() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) redirect("/login")
	const settings = await prisma.volunteerNotificationSettings.findUnique({
		where: { volunteerId: session.user.id },
	})
	return (
		<SettingsPageContent
			initialSettings={{
				appNotifications: settings?.appNotifications ?? true,
				opportunityNotifications: settings?.opportunityNotifications ?? true,
				newsletterNotifications: settings?.newsletterNotifications ?? true,
				preferences: parsePreferences(settings?.preferences),
			}}
		/>
	)
}
