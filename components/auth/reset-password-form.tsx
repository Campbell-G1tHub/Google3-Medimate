"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resetPassword } from "@/lib/auth-client"

interface ResetPasswordFormProps {
	invalidToken?: boolean
	token?: string
}

export function ResetPasswordForm({ invalidToken, token }: ResetPasswordFormProps) {
	const router = useRouter()
	const [error, setError] = useState("")
	const [pending, setPending] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")

		if (!token) {
			setError("This password reset link is invalid or has expired.")
			return
		}

		const form = new FormData(event.currentTarget)
		const password = String(form.get("password") ?? "")
		const confirmPassword = String(form.get("confirmPassword") ?? "")

		if (password !== confirmPassword) {
			setError("Passwords do not match.")
			return
		}

		setPending(true)
		const result = await resetPassword({ newPassword: password, token })
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "This password reset link is invalid or has expired.")
			return
		}

		router.push("/login?reset=true")
	}

	return (
		<>
			<FormAlert
				message={
					invalidToken || !token ? "This password reset link is invalid or has expired." : error
				}
			/>

			{token && !invalidToken ? (
				<form className="space-y-4" onSubmit={handleSubmit}>
					<Input
						label="New password"
						name="password"
						type="password"
						autoComplete="new-password"
						minLength={8}
						hint="Use at least 8 characters."
						required
					/>
					<Input
						label="Confirm new password"
						name="confirmPassword"
						type="password"
						autoComplete="new-password"
						minLength={8}
						required
					/>
					<Button type="submit" fullWidth loading={pending}>
						Update password
					</Button>
				</form>
			) : (
				<Link href="/forgot-password" className="btn btn-primary w-full">
					Request a new reset link
				</Link>
			)}
		</>
	)
}
