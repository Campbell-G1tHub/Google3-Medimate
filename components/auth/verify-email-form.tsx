"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { Separator } from "../ui"
import Link from "next/link"

interface Props {
	email: string
}

export function VerifyEmailForm({ email }: Props) {
	const router = useRouter()
	const [otp, setOtp] = useState("")
	const [error, setError] = useState("")
	const [pending, setPending] = useState(false)

	async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setPending(true)

		const result = await authClient.emailOtp.verifyEmail({
			email,
			otp: otp.trim(),
		})
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "The code is invalid or has expired.")
			return
		}

		router.push("/login?verified=true")
		router.refresh()
	}

	async function resendOTP(event: React.MouseEvent<HTMLAnchorElement>) {
		event.preventDefault()
		await authClient.emailOtp.sendVerificationOtp({
			email: email,
			type: "email-verification",
		})
	}

	return (
		<>
			<FormAlert message={error} />

			<form className="space-y-4 flex flex-col items-center" onSubmit={verifyCode}>
				<Input
					label="Verification code"
					name="otp"
					autoComplete="one-time-code"
					inputMode="numeric"
					minLength={6}
					maxLength={6}
					placeholder="000000"
					value={otp}
					onChange={(event) => setOtp(event.target.value)}
					required
				/>
				<Button variant="accent" type="submit" className="rounded-full font-bold" loading={pending}>
					Verify email
				</Button>
				<Separator label="OR" />

				<Button to="/login" variant="accent" className="font-bold">Back to Login</Button>

				<div className="flex gap-1">
					<p className="font-bold">Can&apos;t find it?</p>

					{/* TODO: Add toast or notification */}
					<Link
						href="#"
						className={`underline hover:cursor-pointer text-secondary`}
						onClick={resendOTP}
					>
						Resend Code
					</Link>
				</div>
			</form>
		</>
	)
}
