import type { Metadata } from "next"
import { AuthShell } from "@/components/auth/auth-shell"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const metadata: Metadata = {
	title: "Create account | Medimate",
}

export default function SignUpPage() {
	return (
		<AuthShell title="Create your Medimate account" compact showFooter={false}>
			<SignUpForm />
		</AuthShell>
	)
}
