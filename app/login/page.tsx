import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
	title: "Sign in | Medimate",
}

interface LoginPageProps {
	searchParams: Promise<{
		reset?: string
		verified?: string
	}>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const params = await searchParams

	return (
		<AuthShell title="Welcome back" description="Sign in to your Medimate volunteer account.">
			<LoginForm passwordReset={params.reset === "true"} verified={params.verified === "true"} />
		</AuthShell>
	)
}
