import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
	title: "Verify your email | MediMate",
}

interface PageProps {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
	const params = await searchParams
	const email = (params.email as string) ?? null

	if (!email) {
		redirect("/login")
	}

	return (
		<AuthShell
			title="Verify your email"
			description={`A 6-digit verification code has been sent to ${email}. Enter it below to verify your email address.`}
		>
			<VerifyEmailForm email={email} />
		</AuthShell>
	)
}
