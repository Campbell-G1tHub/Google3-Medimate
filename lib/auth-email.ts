import nodemailer from "nodemailer"

function requiredEnvironmentVariable(name: string) {
	const value = process.env[name]

	if (!value) {
		throw new Error(`${name} is required to send authentication emails`)
	}

	return value
}

export async function sendVerificationEmail(email: string, verificationUrl: string) {
	const port = Number(process.env.SMTP_PORT ?? "587")
	const secure = process.env.SMTP_SECURE === "true"
	const user = process.env.SMTP_USER
	const password = process.env.SMTP_PASSWORD

	if (!Number.isInteger(port) || port <= 0) {
		throw new Error("SMTP_PORT must be a positive integer")
	}
	if (Boolean(user) !== Boolean(password)) {
		throw new Error("SMTP_USER and SMTP_PASSWORD must be set together")
	}

	const transporter = nodemailer.createTransport({
		host: requiredEnvironmentVariable("SMTP_HOST"),
		port,
		secure,
		auth: user && password ? { user, pass: password } : undefined,
	})

	await transporter.sendMail({
		from: requiredEnvironmentVariable("AUTH_EMAIL_FROM"),
		to: email,
		subject: "Verify your MediMate email address",
		text: `Verify your MediMate email address by opening this link:\n\n${verificationUrl}\n\nIf you did not create this account, you can ignore this email.`,
	})
}
