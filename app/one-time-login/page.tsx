import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { OneTimeLoginForm } from "@/components/auth/one-time-login-form"

export const metadata: Metadata = {
	title: "One-time login | Medimate",
}

export default function OneTimeLoginPage() {
	return (
		<AuthShell
			title="Sign in with a code"
			description="We will email you a six-digit code that is valid for 10 minutes."
		>
			<OneTimeLoginForm />
		</AuthShell>
	)
}
