"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient, signIn } from "@/lib/auth-client"

export function OneTimeLoginForm() {
	const router = useRouter()
	const [email, setEmail] = useState("")
	const [codeSent, setCodeSent] = useState(false)
	const [error, setError] = useState("")
	const [message, setMessage] = useState("")
	const [pending, setPending] = useState(false)

	async function sendCode(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setMessage("")
		setPending(true)

		const result = await authClient.emailOtp.sendVerificationOtp({
			email,
			type: "sign-in",
		})
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "Unable to send a one-time code.")
			return
		}

		setCodeSent(true)
		setMessage("If the account exists, a one-time code has been sent.")
	}

	async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setPending(true)

		const form = new FormData(event.currentTarget)
		const result = await signIn.emailOtp({
			email,
			otp: String(form.get("otp") ?? "").trim(),
		})
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "The code is invalid or has expired.")
			return
		}

		router.push("/account")
		router.refresh()
	}

	return (
		<>
			<FormAlert message={error} />
			<FormAlert message={message} type="success" />

			{!codeSent ? (
				<form className="space-y-4" onSubmit={sendCode}>
					<Input
						label="Email address"
						name="email"
						type="email"
						autoComplete="email"
						placeholder="alex@example.com"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>
					<Button type="submit" fullWidth loading={pending}>
						Send one-time code
					</Button>
				</form>
			) : (
				<form className="space-y-4" onSubmit={verifyCode}>
					<p className="text-sm text-base-content/65">
						Enter the six-digit code sent to <strong>{email}</strong>.
					</p>
					<Input
						label="One-time code"
						name="otp"
						autoComplete="one-time-code"
						inputMode="numeric"
						minLength={6}
						maxLength={6}
						placeholder="000000"
						required
					/>
					<Button type="submit" fullWidth loading={pending}>
						Sign in
					</Button>
					<button
						type="button"
						className="btn btn-ghost w-full"
						onClick={() => {
							setCodeSent(false)
							setMessage("")
						}}
					>
						Use a different email
					</button>
				</form>
			)}

			<p className="text-center text-sm">
				<Link href="/login" className="font-semibold text-secondary hover:underline">
					Sign in with password
				</Link>
			</p>
		</>
	)
}
