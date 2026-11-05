import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/auth-guards"

/**
 * Layout for every page that requires a session. `proxy.ts` already redirects these routes,
 * so the guard here is a fallback in case the shell is ever mounted outside its matcher.
 */
export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session) {
		redirect("/login")
	}

	return (
		<AppShell
			user={{
				name: session.user.name,
				email: session.user.email,
				isAdmin: isAdmin(session.user),
			}}
		>
			{children}
		</AppShell>
	)
}
