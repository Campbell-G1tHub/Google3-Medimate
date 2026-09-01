import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const metadata: Metadata = {
	title: "Reset password | Medimate",
}

interface ResetPasswordPageProps {
	searchParams: Promise<{
		error?: string
		token?: string
	}>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
	const params = await searchParams

	return (
		<AuthShell
			title="Choose a new password"
			description="Use a strong password you do not use elsewhere."
		>
			<ResetPasswordForm token={params.token} invalidToken={params.error === "INVALID_TOKEN"} />
		</AuthShell>
	)
}
