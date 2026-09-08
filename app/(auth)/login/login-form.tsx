"use client"

import Link from "next/link"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { SocialButton } from "@/components/ui/social-button"
import { type LoginState, logIn } from "./actions"

const initialState: LoginState = {}

function SubmitButton() {
	const { pending } = useFormStatus()

	return (
		<Button type="submit" variant="accent" loading={pending} className="w-40 rounded-full">
			Log in
		</Button>
	)
}

export function LoginForm() {
	const [state, formAction] = useActionState(logIn, initialState)

	return (
		<div className="w-full max-w-sm">
			<h1 className="text-center text-xl font-bold sm:text-2xl">Log in to your Medimate account</h1>

			<form action={formAction} className="mt-6 flex flex-col gap-3" noValidate>
				<Input
					label="Email"
					name="email"
					type="email"
					placeholder="Email address"
					autoComplete="email"
					inputMode="email"
					required
					error={state.fieldErrors?.email}
				/>
				<PasswordInput
					label="Password"
					labelHidden
					name="password"
					placeholder="Password"
					autoComplete="current-password"
					required
					error={state.fieldErrors?.password}
				/>

				<div className="flex flex-wrap items-center justify-between gap-2">
					<label className="label cursor-pointer gap-2 text-base-content">
						<input type="checkbox" name="rememberMe" className="checkbox checkbox-sm" />
						Remember me
					</label>
					<Link href="/forgot-password" className="link link-info text-sm">
						Forgot password
					</Link>
				</div>

				{state.error && (
					<div role="alert" className="alert alert-error text-sm">
						{state.error}
					</div>
				)}

				<div className="mt-2 flex justify-center">
					<SubmitButton />
				</div>
			</form>

			<div className="divider text-sm font-semibold">OR</div>

			<div className="flex flex-col gap-2">
				<SocialButton label="Continue with Apple" />
				<SocialButton label="Continue with Google" />
				<SocialButton label="Continue with Facebook" />
			</div>

			<p className="mt-6 text-center text-sm">
				Don&rsquo;t have an account?{" "}
				<Link href="/signup" className="link link-info">
					Sign up
				</Link>
			</p>
		</div>
	)
}
