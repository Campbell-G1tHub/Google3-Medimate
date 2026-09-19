import { AuthShell } from "@/components/auth/auth-shell"
import { OneTimeLoginForm } from "@/components/auth/one-time-login-form"
import { redirect } from "next/navigation"


interface PageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OneTimeLoginPage({ searchParams }: PageProps) {

	const params = await searchParams
	const email = params.email as string ?? null;

	if (!email) {
		redirect("/login")
	}

	return (
		<AuthShell
			title="Enter your one-time code"
			description={`If you have an active account with Medimate, a 6-digit one-time code has been sent to ${email} to verify it's you`}
		>
			<OneTimeLoginForm email={email} />
		</AuthShell>
	)
}
