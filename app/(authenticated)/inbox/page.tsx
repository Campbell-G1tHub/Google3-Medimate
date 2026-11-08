import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { InboxList } from "@/components/inbox/inbox-list"
import { AppShell } from "@/components/layout/app-shell"
import { listNotifications } from "@/lib/announcements"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/roles"

export default async function InboxPage() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session) {
		redirect("/login")
	}

	const { notifications } = await listNotifications(session.user.id)

	return (
		<AppShell
			user={{
				name: session.user.name,
				email: session.user.email,
				isAdmin: isAdmin(session.user),
			}}
			title="Inbox"
		>
			<InboxList initialNotifications={notifications} />
		</AppShell>
	)
}
