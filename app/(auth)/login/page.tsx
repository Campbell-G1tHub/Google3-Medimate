import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/layout/site-header"
import { auth } from "@/lib/auth"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
	title: "Log in | MediMate",
}

export default async function LoginPage() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (session) {
		redirect("/dashboard")
	}

	return (
		<>
			<SiteHeader />
			<main className="flex flex-1 justify-center px-4 py-10 sm:py-16">
				<LoginForm />
			</main>
		</>
	)
}
