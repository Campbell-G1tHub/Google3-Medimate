"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { Separator } from "../ui"

export function ForgotPasswordForm() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const handleSubmit = async (event: React.SubmitEvent) => {
		event.preventDefault();
		const resetPasswordButtonClicked = event.nativeEvent.submitter?.id === "reset-password"
		if (resetPasswordButtonClicked) {
			await authClient.requestPasswordReset({
				email: email,
				redirectTo: `${window.location.origin}/reset-password`,
			})
			router.push(`/forgot-password/confirm-reset?email=${email}`)
		}

		// await authClient.emailOtp.sendVerificationOtp({
		// 	email: email,
		// 	type: resetPasswordButtonClicked ? "forget-password" : "sign-in"
		// })

	}

	return (
		<>
			<form className="flex flex-col items-center" onSubmit={handleSubmit}>
				<Input
					label="Email"
					name="email"
					type="email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					autoComplete="email"
					placeholder="Email address"
					className="border-neutral/30 bg-base-100 px-2  font-normal focus:border-secondary focus:outline-none mb-4"
					labelClassName="pb-1 text-sm"
					required
				/>

				<Button
					type="submit"
					id="reset-password"
					variant="accent"
					className="rounded-full border-none font-bold shadow-none"
				>
					Reset Password
				</Button>
				<Separator label="OR" />
				<Button
					type="submit"
					id="send-otp"
					variant="accent"
					className="rounded-full border-none font-bold shadow-none"
				>
					Sign in with one-time code
				</Button>
			</form>
			<p className="mt-4 text-center text-sm">
				<Link href="/login" className="font-semibold text-secondary hover:underline">
					Back to sign in
				</Link>
			</p>
		</>
	)
}
