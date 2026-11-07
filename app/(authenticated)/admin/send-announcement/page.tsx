import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AnnouncementForm } from "@/components/admin/announcement-form"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/roles"
import { AppShell } from "@/components/layout/app-shell"

export const metadata: Metadata = {
	title: "Send announcements | MediMate",
}

export default async function SendAnnouncementPage() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session || !isAdmin(session?.user)) {
		redirect("/home")
	}

	return (
		<AppShell
			user={{
				name: session.user.name,
				email: session.user.email,
				isAdmin: isAdmin(session.user),
			}}
			title="Admin"
		>
			<div className="w-full">
				<div className="px-5 py-6 sm:px-8">
					<AnnouncementForm />
				</div>
			</div>

		</AppShell>
	)
}
