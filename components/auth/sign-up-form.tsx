"use client"

import Link from "next/link"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signUp } from "@/lib/auth-client"

export function SignUpForm() {
	const [error, setError] = useState("")
	const [message, setMessage] = useState("")
	const [pending, setPending] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setMessage("")

		const form = new FormData(event.currentTarget)
		const name = String(form.get("name") ?? "").trim()
		const email = String(form.get("email") ?? "").trim()
		const password = String(form.get("password") ?? "")
		const confirmPassword = String(form.get("confirmPassword") ?? "")

		if (password !== confirmPassword) {
			setError("Passwords do not match.")
			return
		}

		setPending(true)
		const result = await signUp.email({
			name,
			email,
			password,
			callbackURL: "/login?verified=true",
		})
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "We could not create your account. Please try again.")
			return
		}

		setMessage("Account created. Check your inbox and verify your email before signing in.")
		event.currentTarget.reset()
	}

	return (
		<>
			<FormAlert message={error} />
			<FormAlert message={message} type="success" />

			<form className="space-y-4" onSubmit={handleSubmit}>
				<Input
					label="Full name"
					name="name"
					autoComplete="name"
					placeholder="Alex Smith"
					required
				/>
				<Input
					label="Email address"
					name="email"
					type="email"
					autoComplete="email"
					placeholder="alex@example.com"
					required
				/>
				<Input
					label="Password"
					name="password"
					type="password"
					autoComplete="new-password"
					minLength={8}
					hint="Use at least 8 characters."
					required
				/>
				<Input
					label="Confirm password"
					name="confirmPassword"
					type="password"
					autoComplete="new-password"
					minLength={8}
					required
				/>
				<Button type="submit" fullWidth loading={pending}>
					Create account
				</Button>
			</form>

			<p className="text-center text-sm text-base-content/65">
				Already have an account?{" "}
				<Link href="/login" className="font-semibold text-secondary hover:underline">
					Sign in
				</Link>
			</p>
		</>
	)
}
