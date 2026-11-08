import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AdminPanel } from "@/components/admin/admin-panel"
import { AppShell } from "@/components/layout/app-shell"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/roles"

export const metadata: Metadata = {
	title: "Admin | MediMate",
}

export default async function AdminPage() {
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
			<AdminPanel />
		</AppShell>
	)
}
