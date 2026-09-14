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
	const [formData, setFormData] = useState<{ password: string, confirmPassword: string }>({
		password: "",
		confirmPassword: ""
	})

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")

		if (!token) {
			setError("This password reset link is invalid or has expired.")
			return
		}

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match.")
			return
		}

		setPending(true)
		const result = await resetPassword({ newPassword: formData.password, token })
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "This password reset link is invalid or has expired.")
			return
		}

		router.push("/login?reset=true")
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setFormData({ ...formData, [event.target.name]: event.target.value })
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
						value={formData.password}
						onChange={handleChange}
						required
					/>
					<Input
						label="Confirm new password"
						name="confirmPassword"
						type="password"
						autoComplete="new-password"
						minLength={8}
						value={formData.confirmPassword}
						onChange={handleChange}
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
