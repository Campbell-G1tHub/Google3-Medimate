"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/auth-client"

interface LoginFormProps {
	passwordReset?: boolean
	verified?: boolean
}

export function LoginForm({ passwordReset, verified }: LoginFormProps) {
	const router = useRouter()
	const [error, setError] = useState("")
	const [pending, setPending] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setPending(true)

		const form = new FormData(event.currentTarget)
		const result = await signIn.email({
			email: String(form.get("email") ?? "").trim(),
			password: String(form.get("password") ?? ""),
			rememberMe: form.get("rememberMe") === "on",
		})
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "Unable to sign in. Check your email and password.")
			return
		}

		router.push("/account")
		router.refresh()
	}

	return (
		<>
			<FormAlert message={error} />
			<FormAlert
				message={
					verified
						? "Email verified. You can now sign in."
						: passwordReset
							? "Password updated. Sign in with your new password."
							: undefined
				}
				type="success"
			/>

			<form className="space-y-4" onSubmit={handleSubmit}>
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
					autoComplete="current-password"
					required
				/>

				<div className="flex items-center justify-between gap-4 text-sm">
					<label className="label cursor-pointer gap-2 py-0">
						<input name="rememberMe" type="checkbox" className="checkbox checkbox-sm" />
						<span>Remember me</span>
					</label>
					<Link href="/forgot-password" className="font-semibold text-secondary hover:underline">
						Forgot password?
					</Link>
				</div>

				<Button type="submit" fullWidth loading={pending}>
					Sign in
				</Button>
			</form>

			<div className="divider text-xs text-base-content/45 uppercase">or</div>
			<Link href="/one-time-login" className="btn btn-outline btn-primary w-full">
				Use a one-time code
			</Link>

			<p className="text-center text-sm text-base-content/65">
				New to Medimate?{" "}
				<Link href="/sign-up" className="font-semibold text-secondary hover:underline">
					Create an account
				</Link>
			</p>
		</>
	)
}
