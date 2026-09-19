"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient, signUp } from "@/lib/auth-client"
import { PasswordVisibilityIcon } from "./password-visibility-icon"
import { Separator } from "../ui"

export function SignUpForm() {
	const router = useRouter()
	const [error, setError] = useState("")
	const [pending, setPending] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmation, setShowConfirmation] = useState(false)
	const [formData, setFormData] = useState<{ email: string, password: string, confirmPassword: string }>({
		email: "",
		password: "",
		confirmPassword: ""
	});

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")

		const email = formData.email.trim()
		const password = formData.password
		const confirmPassword = formData.confirmPassword

		if (password !== confirmPassword) {
			setError("Passwords do not match.")
			return
		}

		setPending(true)
		const result = await signUp.email({
			name: email.split("@")[0] || "MediMate volunteer",
			email,
			password,
			callbackURL: "/login?verified=true",
		})

		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "We could not create your account. Please try again.")
			return
		}

		void authClient.emailOtp.sendVerificationOtp({
			email: formData.email,
			type: "email-verification",
		})

		router.push(`/verify-email?email=${encodeURIComponent(email)}`)
	}

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		setFormData({ ...formData, [event.target.name]: event.target.value });
	}

	return (
		<div className="mx-auto max-w-[22rem]">
			<FormAlert message={error} />

			<form className="space-y-3" onSubmit={handleSubmit}>
				<Input
					label="Email"
					name="email"
					type="email"
					value={formData.email}
					onChange={handleChange}
					autoComplete="email"
					placeholder="Email address"
					labelClassName="pb-1 text-sm font-normal"
					required
				/>
				<Input
					label="Create a Password"
					name="password"
					type={showPassword ? "text" : "password"}
					autoComplete="new-password"
					value={formData.password}
					onChange={handleChange}
					minLength={8}
					placeholder="Password"
					labelClassName="pb-1 text-sm font-normal"
					endAdornment={
						<button
							type="button"
							onClick={() => setShowPassword((visible) => !visible)}
							className="text-neutral/55 hover:cursor-pointer"
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
					value={formData.confirmPassword}
					onChange={handleChange}
					autoComplete="new-password"
					minLength={8}
					placeholder="Retype Password"
					labelClassName="pb-1 text-sm font-normal"
					endAdornment={
						<button
							type="button"
							onClick={() => setShowConfirmation((visible) => !visible)}
							className="text-neutral/55 hover:cursor-pointer"
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
						className="rounded-full w-40 border-0 text-md font-bold shadow-none"
					>
						Sign up
					</Button>
				</div>
			</form>
			<Separator label="OR" />
			<SocialAuthButtons action="Sign up" />
			<p className="mt-4 text-center text-base text-neutral">
				Already have an account?{" "}
				<Link href="/login" className="font-normal text-secondary underline">
					Login
				</Link>
			</p>
		</div >
	)
}
