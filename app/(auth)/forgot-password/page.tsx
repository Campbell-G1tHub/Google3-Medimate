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
			description="Enter your email address, and we'll either send a link to reset your password, or send you a one-time link to login."
		>
			<ForgotPasswordForm />
		</AuthShell>
	)
}
