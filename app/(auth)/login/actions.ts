"use server"

import { APIError } from "better-auth/api"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export interface LoginState {
	error?: string
	fieldErrors?: {
		email?: string
		password?: string
	}
}

export async function logIn(_previousState: LoginState, formData: FormData): Promise<LoginState> {
	const email = String(formData.get("email") ?? "")
		.trim()
		.toLowerCase()
	const password = String(formData.get("password") ?? "")
	const rememberMe = formData.get("rememberMe") === "on"

	const fieldErrors: NonNullable<LoginState["fieldErrors"]> = {}

	if (!email) {
		fieldErrors.email = "Enter your email address."
	}
	if (!password) {
		fieldErrors.password = "Enter your password."
	}
	if (fieldErrors.email || fieldErrors.password) {
		return { fieldErrors }
	}

	try {
		await auth.api.signInEmail({
			body: { email, password, rememberMe },
			headers: await headers(),
		})
	} catch (error) {
		if (error instanceof APIError && error.body?.code === "EMAIL_NOT_VERIFIED") {
			return { error: "Verify your email address before logging in. Check your inbox for the link." }
		}

		return { error: "Incorrect email or password." }
	}

	redirect("/dashboard")
}
