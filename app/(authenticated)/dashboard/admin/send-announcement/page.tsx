import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AnnouncementForm } from "@/components/admin/announcement-form"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/auth-guards"

export const metadata: Metadata = {
	title: "Send announcements | MediMate",
}

export default async function SendAnnouncementPage() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!isAdmin(session?.user)) {
		redirect("/home")
	}

	return (
		<div className="w-full">
			<header className="flex items-center justify-between gap-3 border-b border-base-300 px-5 py-3 sm:px-8">
				<h1 className="text-3xl text-primary">Admin</h1>
				<NotificationBell />
			</header>
			<div className="px-5 py-6 sm:px-8">
				<AnnouncementForm />
			</div>
		</div>
	)
}
