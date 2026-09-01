import nodemailer from "nodemailer"

type OtpEmailType = "sign-in" | "email-verification" | "forget-password" | "change-email"

function requiredEnvironmentVariable(name: string) {
	const value = process.env[name]

	if (!value) {
		throw new Error(`${name} is required to send authentication emails`)
	}

	return value
}

function booleanEnvironmentVariable(name: string, fallback: boolean) {
	const value = process.env[name]

	if (value === undefined || value === "") {
		return fallback
	}
	if (value === "true") {
		return true
	}
	if (value === "false") {
		return false
	}

	throw new Error(`${name} must be either true or false`)
}

function smtpTransport() {
	const port = Number(process.env.SMTP_PORT ?? "587")
	const secure = booleanEnvironmentVariable("SMTP_SECURE", port === 465)
	const authRequired = booleanEnvironmentVariable("SMTP_AUTH_REQUIRED", true)
	const user = process.env.SMTP_USER
	const password = process.env.SMTP_PASSWORD

	if (!Number.isInteger(port) || port <= 0) {
		throw new Error("SMTP_PORT must be a positive integer")
	}
	if (Boolean(user) !== Boolean(password)) {
		throw new Error("SMTP_USER and SMTP_PASSWORD must be set together")
	}
	if (authRequired && (!user || !password)) {
		throw new Error(
			"SMTP authentication is required. Set SMTP_USER and SMTP_PASSWORD, or explicitly set SMTP_AUTH_REQUIRED=false for a local relay such as Mailpit.",
		)
	}

	return nodemailer.createTransport({
		host: requiredEnvironmentVariable("SMTP_HOST"),
		port,
		secure,
		auth: user && password ? { user, pass: password } : undefined,
	})
}

async function sendAuthenticationEmail({
	to,
	subject,
	text,
}: {
	to: string
	subject: string
	text: string
}) {
	try {
		await smtpTransport().sendMail({
			from: requiredEnvironmentVariable("AUTH_EMAIL_FROM"),
			to,
			subject,
			text,
		})
	} catch (error) {
		throw new Error("Unable to send the authentication email", { cause: error })
	}
}

export async function sendVerificationEmail(email: string, verificationUrl: string) {
	await sendAuthenticationEmail({
		to: email,
		subject: "Verify your MediMate email address",
		text: `Verify your MediMate email address by opening this link:\n\n${verificationUrl}\n\nThis link expires in one hour. If you did not create this account, you can ignore this email.`,
	})
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
	await sendAuthenticationEmail({
		to: email,
		subject: "Reset your MediMate password",
		text: `Reset your MediMate password by opening this link:\n\n${resetUrl}\n\nThis link expires in one hour. If you did not request a password reset, you can ignore this email.`,
	})
}

export async function sendOneTimePasswordEmail(email: string, otp: string, type: OtpEmailType) {
	const message = {
		"sign-in": {
			subject: "Your MediMate one-time login code",
			purpose: "sign in to MediMate",
		},
		"email-verification": {
			subject: "Your MediMate email verification code",
			purpose: "verify your MediMate email address",
		},
		"forget-password": {
			subject: "Your MediMate password reset code",
			purpose: "reset your MediMate password",
		},
		"change-email": {
			subject: "Your MediMate email change code",
			purpose: "change your MediMate email address",
		},
	}[type]

	await sendAuthenticationEmail({
		to: email,
		subject: message.subject,
		text: `Use this code to ${message.purpose}:\n\n${otp}\n\nThe code expires in 10 minutes and can only be used once. If you did not request this code, you can ignore this email.`,
	})
}
