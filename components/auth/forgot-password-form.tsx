"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient, requestPasswordReset } from "@/lib/auth-client"

type ResetMethod = "link" | "otp"

export function ForgotPasswordForm() {
	const router = useRouter()
	const [method, setMethod] = useState<ResetMethod>("link")
	const [email, setEmail] = useState("")
	const [codeSent, setCodeSent] = useState(false)
	const [error, setError] = useState("")
	const [message, setMessage] = useState("")
	const [pending, setPending] = useState(false)

	const [OTPResetFormData, setOTPResetFormData] = useState<{ otp: string, password: string, confirmPassword: string }>({
		otp: "",
		password: "",
		confirmPassword: ""
	})

	function changeMethod(nextMethod: ResetMethod) {
		setMethod(nextMethod)
		setCodeSent(false)
		setError("")
		setMessage("")
		setEmail("")
	}

	async function sendReset(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setMessage("")
		setPending(true)

		const result =
			method === "link"
				? await requestPasswordReset({ email, redirectTo: "/reset-password" })
				: await authClient.emailOtp.requestPasswordReset({ email })
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "Unable to send password reset instructions.")
			return
		}

		if (method === "otp") {
			setCodeSent(true)
			setMessage("If the account exists, a reset code has been sent.")
			return
		}

		setMessage("If the account exists, a password reset link has been sent.")
		setEmail("")
	}

	async function resetWithCode(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError("")
		setPending(true)

		const form = new FormData(event.currentTarget)
		const password = String(form.get("password") ?? "")
		const confirmPassword = String(form.get("confirmPassword") ?? "")

		if (password !== confirmPassword) {
			setPending(false)
			setError("Passwords do not match.")
			return
		}

		const result = await authClient.emailOtp.resetPassword({
			email,
			otp: String(form.get("otp") ?? "").trim(),
			password,
		})
		setPending(false)

		if (result.error) {
			setError(result.error.message ?? "The code is invalid or has expired.")
			return
		}

		router.push("/login?reset=true")
	}

	function handleOTPResetFormChange(event: React.ChangeEvent<HTMLInputElement>) {
		setOTPResetFormData({ ...OTPResetFormData, [event.target.name]: event.target.value })
	}

	return (
		<>
			<div role="tablist" className="tabs tabs-box w-full">
				<button
					type="button"
					role="tab"
					className={`tab flex-1 ${method === "link" ? "tab-active" : ""}`}
					onClick={() => changeMethod("link")}
				>
					Email link
				</button>
				<button
					type="button"
					role="tab"
					className={`tab flex-1 ${method === "otp" ? "tab-active" : ""}`}
					onClick={() => changeMethod("otp")}
				>
					One-time code
				</button>
			</div>

			<FormAlert message={error} />
			<FormAlert message={message} type="success" />

			{!codeSent ? (
				<form className="space-y-4" onSubmit={sendReset}>
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
						Send {method === "link" ? "reset link" : "reset code"}
					</Button>
				</form>
			) : (
				<form className="space-y-4" onSubmit={resetWithCode}>
					<Input
						label="Reset code"
						name="otp"
						autoComplete="one-time-code"
						inputMode="numeric"
						minLength={6}
						maxLength={6}
						placeholder="000000"
						value={OTPResetFormData.otp}
						onChange={handleOTPResetFormChange}
						required
					/>
					<Input
						label="New password"
						name="password"
						type="password"
						autoComplete="new-password"
						minLength={8}
						value={OTPResetFormData.password}
						onChange={handleOTPResetFormChange}
						required
					/>
					<Input
						label="Confirm new password"
						name="confirmPassword"
						type="password"
						autoComplete="new-password"
						value={OTPResetFormData.confirmPassword}
						onChange={handleOTPResetFormChange}
						minLength={8}
						required
					/>
					<Button type="submit" fullWidth loading={pending}>
						Reset password
					</Button>
				</form>
			)}

			<p className="text-center text-sm">
				<Link href="/login" className="font-semibold text-secondary hover:underline">
					Back to sign in
				</Link>
			</p>
		</>
	)
}
