"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { SocialAuthButtons, type SocialProvider } from "@/components/auth/social-auth-buttons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/auth-client"
import { PasswordVisibilityIcon } from "./password-visibility-icon"

interface LoginFormProps {
	enabledSocialProviders: SocialProvider[]
	oauthError?: boolean
	passwordReset?: boolean
	verified?: boolean
}

export function LoginForm({
	enabledSocialProviders,
	oauthError,
	passwordReset,
	verified,
}: LoginFormProps) {
	const router = useRouter()
	const [error, setError] = useState("")
	const [pending, setPending] = useState(false)
	const [formData, setFormData] = useState<{
		email: string
		password: string
		rememberMe: boolean
	}>({
		email: "",
		password: "",
		rememberMe: false,
	})
	const [passwordVisible, setPasswordVisible] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setPending(true)

		const result = await signIn.email({
			email: formData.email.trim(),
			password: formData.password,
			rememberMe: formData.rememberMe,
		})
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "Unable to sign in. Check your email and password.")
			return
		}

		router.push("/account")
		router.refresh()
		setFormData({ email: "", password: "", rememberMe: false })
	}

	return (
		<>
			<FormAlert
				message={
					error || (oauthError ? "Social sign-in was not completed. Please try again." : undefined)
				}
			/>
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
				<div className="mx-auto space-y-2">
					<Input
						label="Email"
						name="email"
						type="email"
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						autoComplete="email"
						placeholder="Email address"
						className="border-neutral/30 bg-base-100 px-2  font-normal focus:border-secondary focus:outline-none"
						labelClassName="pb-1 text-sm"
						required
					/>
					<Input
						label="Password"
						name="password"
						type={passwordVisible ? "text" : "password"}
						autoComplete="current-password"
						placeholder="Password"
						value={formData.password}
						onChange={(e) => setFormData({ ...formData, password: e.target.value })}
						className="border-neutral/30 bg-base-100 px-2 font-normal focus:border-secondary focus:outline-none"
						labelClassName="sr-only"
						endAdornment={
							<button
								type="button"
								onClick={() => setPasswordVisible((visible) => !visible)}
								className="text-neutral/55 hover:cursor-pointer"
								aria-label={passwordVisible ? "Hide password" : "Show password"}
							>
								<PasswordVisibilityIcon visible={passwordVisible} />
							</button>
						}
						required
					/>
				</div>

				<div className="flex items-center justify-between gap-4 text-sm">
					<label className="flex cursor-pointer items-center gap-3 ">
						<input
							name="rememberMe"
							type="checkbox"
							checked={formData.rememberMe}
							onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
							className="checkbox size-6 border-neutral/70 bg-base-100"
						/>
						<span>Remember me</span>
					</label>
					<Link href="/forgot-password" className="font-normal text-secondary text-sm underline">
						Forgot password?
					</Link>
				</div>

				<div className="flex justify-center pt-1">
					<Button
						type="submit"
						variant="accent"
						loading={pending}
						className="w-40 rounded-full border-none font-bold shadow-none"
					>
						<span className="font-bold">Log in</span>
					</Button>
				</div>
			</form>
			<div className="divider text-sm font-semibold">OR</div>

			<div className="mx-auto mt-12 max-w-[18.5rem]">
				<SocialAuthButtons
					action="Continue"
					enabledProviders={enabledSocialProviders}
					onError={setError}
				/>
			</div>

			<p className="mt-4 text-center text-neutral text-base">
				Don&apos;t have an account?{" "}
				<Link href="/sign-up" className="font-normal text-secondary underline">
					Sign up
				</Link>
			</p>
		</>
	)
}
