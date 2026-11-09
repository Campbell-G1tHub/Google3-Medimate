"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { FormAlert } from "@/components/auth/form-alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient, requestPasswordReset } from "@/lib/auth-client"
import { Separator } from "../ui"

type PendingAction = "reset-password" | "send-otp" | null

export function ForgotPasswordForm() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [pending, setPending] = useState<PendingAction>(null);

	const handleSubmit = async (event: React.SubmitEvent) => {
		event.preventDefault();
		setError("");

		const resetPasswordButtonClicked = event.nativeEvent.submitter?.id === "reset-password";
		setPending(resetPasswordButtonClicked ? "reset-password" : "send-otp");

		try {
			if (resetPasswordButtonClicked) {
				// Emails a reset link that leads back to the /reset-password token form.
				const result = await requestPasswordReset({
					email,
					redirectTo: "/reset-password",
				});

				if (result.error) {
					setError(result.error.message ?? "Unable to send the reset link. Please try again.");
					return;
				}

				router.push(`/forgot-password/confirm-reset?email=${encodeURIComponent(email)}`);
				return;
			}

			const result = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "sign-in",
			});

			if (result.error) {
				setError(result.error.message ?? "Unable to send the one-time code. Please try again.");
				return;
			}

			router.push(`/one-time-login?email=${encodeURIComponent(email)}`);
		} catch {
			// Network failure or an aborted request: never leave the user on a stuck spinner.
			setError("Something went wrong. Please check your connection and try again.");
		} finally {
			setPending(null);
		}
	}

	return (
		<>
			<FormAlert message={error} />

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
					disabled={pending === "send-otp"}
					loading={pending === "reset-password"}
				>
					Reset Password
				</Button>
				<Separator label="OR" />
				<Button
					type="submit"
					id="send-otp"
					variant="accent"
					className="rounded-full border-none font-bold shadow-none"
					disabled={pending === "reset-password"}
					loading={pending === "send-otp"}
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
