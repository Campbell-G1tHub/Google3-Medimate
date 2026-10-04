import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { getEnabledSocialProviders } from "@/lib/oauth-providers"

export const metadata: Metadata = {
	title: "Create account | MediMate",
}

interface SignUpPageProps {
	searchParams: Promise<{
		error?: string
	}>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
	const params = await searchParams

	return (
		<AuthShell title="Create your MediMate account" compact>
			<SignUpForm
				enabledSocialProviders={getEnabledSocialProviders()}
				oauthError={params.error === "oauth"}
			/>
		</AuthShell>
	)
}
