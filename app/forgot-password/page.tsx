import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
	title: "Forgot password | MediMate",
}

export default function ForgotPasswordPage() {
	return (
		<AuthShell
			title="Reset your password"
			description="Choose a secure email link or a one-time reset code."
		>
			<ForgotPasswordForm />
		</AuthShell>
	)
}
