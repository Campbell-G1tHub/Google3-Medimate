"use client"

import Link from "next/link"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signUp } from "@/lib/auth-client"

export function SignUpForm() {
	const [error, setError] = useState("")
	const [message, setMessage] = useState("")
	const [pending, setPending] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmation, setShowConfirmation] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setMessage("")

		const form = new FormData(event.currentTarget)
		const email = String(form.get("email") ?? "").trim()
		const password = String(form.get("password") ?? "")
		const confirmPassword = String(form.get("confirmPassword") ?? "")

		if (password !== confirmPassword) {
			setError("Passwords do not match.")
			return
		}

		setPending(true)
		const result = await signUp.email({
			name: email.split("@")[0] || "Medimate volunteer",
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
		<div className="mx-auto max-w-[17.5rem]">
			<FormAlert message={error} />
			<FormAlert message={message} type="success" />

			<form className="space-y-3" onSubmit={handleSubmit}>
				<Input
					label="Email"
					name="email"
					type="email"
					autoComplete="email"
					placeholder="Email address"
					className="h-10 min-h-10 rounded-none border-neutral/30 bg-base-100 px-2 text-sm font-normal focus:border-secondary focus:outline-none"
					labelClassName="pb-1 text-sm font-normal"
					required
				/>
				<Input
					label="Create a Password"
					name="password"
					type={showPassword ? "text" : "password"}
					autoComplete="new-password"
					minLength={8}
					placeholder="Password"
					className="h-10 min-h-10 rounded-none border-neutral/30 bg-base-100 px-2 text-sm font-normal focus:border-secondary focus:outline-none"
					labelClassName="pb-1 text-sm font-normal"
					endAdornment={
						<button
							type="button"
							onClick={() => setShowPassword((visible) => !visible)}
							className="text-neutral/55"
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							<PasswordVisibilityIcon visible={showPassword} />
						</button>
					}
					required
				/>
				<Input
					label="Retype Password"
					name="confirmPassword"
					type={showConfirmation ? "text" : "password"}
					autoComplete="new-password"
					minLength={8}
					placeholder="Retype Password"
					className="h-10 min-h-10 rounded-none border-neutral/30 bg-base-100 px-2 text-sm font-normal focus:border-secondary focus:outline-none"
					labelClassName="pb-1 text-sm font-normal"
					endAdornment={
						<button
							type="button"
							onClick={() => setShowConfirmation((visible) => !visible)}
							className="text-neutral/55"
							aria-label={
								showConfirmation ? "Hide password confirmation" : "Show password confirmation"
							}
						>
							<PasswordVisibilityIcon visible={showConfirmation} />
						</button>
					}
					required
				/>
				<div className="flex justify-center pt-2">
					<Button
						type="submit"
						variant="accent"
						loading={pending}
						className="h-14 min-h-14 w-40 rounded-full border-0 text-lg font-bold shadow-none"
					>
						Sign up
					</Button>
				</div>
			</form>

			<div className="my-5 flex items-center gap-3 text-[0.65rem] font-semibold text-neutral">
				<span className="h-px flex-1 bg-neutral/50" />
				<span>OR</span>
				<span className="h-px flex-1 bg-neutral/50" />
			</div>

			<SocialAuthButtons action="Sign up" />

			<p className="mt-4 text-center text-xs text-neutral">
				Already have an account?{" "}
				<Link href="/login" className="font-normal text-secondary underline">
					Login
				</Link>
			</p>
		</div>
	)
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
	return (
		<svg
			aria-hidden="true"
			className="size-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
		>
			<path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
			<circle cx="12" cy="12" r="2.5" />
			{!visible ? <path d="m4 4 16 16" /> : null}
		</svg>
	)
}
