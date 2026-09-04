"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
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

			<form className="space-y-3" onSubmit={handleSubmit}>
				<div className="mx-auto max-w-[17.5rem] space-y-2">
					<Input
						label="Email"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="Email address"
						className="h-10 min-h-10 rounded-none border-neutral/30 bg-base-100 px-2 text-base font-normal focus:border-secondary focus:outline-none"
						labelClassName="pb-1 text-base font-normal"
						required
					/>
					<Input
						label="Password"
						name="password"
						type="password"
						autoComplete="current-password"
						placeholder="Password"
						className="h-10 min-h-10 rounded-none border-neutral/30 bg-base-100 px-2 text-base font-normal focus:border-secondary focus:outline-none"
						labelClassName="sr-only"
						required
					/>
				</div>

				<div className="flex items-center justify-between gap-4 text-sm sm:text-base">
					<label className="flex cursor-pointer items-center gap-3">
						<input
							name="rememberMe"
							type="checkbox"
							className="checkbox size-6 rounded-none border-neutral/70 bg-base-100"
						/>
						<span>Remember me</span>
					</label>
					<Link href="/forgot-password" className="font-normal text-secondary underline">
						Forgot password?
					</Link>
				</div>

				<div className="flex justify-center pt-1">
					<Button
						type="submit"
						variant="accent"
						loading={pending}
						className="h-14 min-h-14 w-40 rounded-full border-0 text-lg font-bold shadow-none"
					>
						Log in
					</Button>
				</div>
			</form>

			<p className="mt-11 text-center text-sm text-neutral sm:text-base">
				Don&apos;t have an account?{" "}
				<Link href="/sign-up" className="font-normal text-secondary underline">
					Sign up
				</Link>
			</p>

			<div className="mx-auto mt-12 max-w-[18.5rem]">
				<SocialAuthButtons action="Continue" />
			</div>
		</>
	)
}
