import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
	title: "Create account | MediMate",
}

export default function SignUpPage() {
	return (
		<AuthShell title="Create your MediMate account" compact>
			<SignUpForm />
		</AuthShell>
	)
}
