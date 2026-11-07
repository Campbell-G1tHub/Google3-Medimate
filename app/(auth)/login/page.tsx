import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { getEnabledSocialProviders } from "@/lib/oauth-providers"

export const metadata: Metadata = {
	title: "Sign in | MediMate",
}

interface LoginPageProps {
	searchParams: Promise<{
		error?: string
		reset?: string
		verified?: string
	}>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const params = await searchParams

	return (
		<AuthShell title="Login to your MediMate account">
			<LoginForm
				enabledSocialProviders={getEnabledSocialProviders()}
				oauthError={Boolean(params.error)}
				passwordReset={params.reset === "true"}
				verified={params.verified === "true"}
			/>
		</AuthShell>
	)
}
