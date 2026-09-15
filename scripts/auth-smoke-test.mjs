import "dotenv/config"
import { createEmailVerificationToken } from "better-auth/api"

const appUrl = process.env.AUTH_TEST_APP_URL ?? "http://localhost:3000"
const mailpitUrl = process.env.AUTH_TEST_MAILPIT_URL ?? "http://localhost:8025"
const email = `auth-smoke-${Date.now()}@medimate.local`
const originalPassword = "MediMate-test-password-2026"
const linkResetPassword = "MediMate-link-reset-2026"
const otpResetPassword = "MediMate-otp-reset-2026"
const authSecret = process.env.BETTER_AUTH_SECRET
const socialProviders = [
	{
		id: "google",
		enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
		authorizationHost: "accounts.google.com",
	},
	{
		id: "facebook",
		enabled: Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
		authorizationHost: "www.facebook.com",
	},
]

function assert(condition, message) {
	if (!condition) {
		throw new Error(message)
	}
}

async function request(path, { body, cookie, redirect = "follow" } = {}) {
	return fetch(`${appUrl}${path}`, {
		method: body ? "POST" : "GET",
		headers: {
			...(body ? { "content-type": "application/json" } : {}),
			...(cookie ? { cookie } : {}),
			origin: appUrl,
		},
		body: body ? JSON.stringify(body) : undefined,
		redirect,
	})
}

async function responseBody(response) {
	const text = await response.text()

	try {
		return JSON.parse(text)
	} catch {
		return text
	}
}

async function expectSuccess(response, label) {
	const body = await responseBody(response)
	assert(response.ok, `${label} failed (${response.status}): ${JSON.stringify(body)}`)
	return body
}

async function expectFailure(response, label) {
	const body = await responseBody(response)
	assert(!response.ok, `${label} unexpectedly succeeded: ${JSON.stringify(body)}`)
	return body
}

function cookiesFrom(response) {
	const values = response.headers.getSetCookie?.() ?? []
	return values.map((value) => value.split(";", 1)[0]).join("; ")
}

async function waitForEmail(subject, extractValue) {
	for (let attempt = 0; attempt < 30; attempt += 1) {
		const search = await fetch(
			`${mailpitUrl}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
		)

		if (search.ok) {
			const result = await search.json()

			for (const message of result.messages ?? []) {
				if (!message.ID) {
					continue
				}

				const messageResponse = await fetch(`${mailpitUrl}/api/v1/message/${message.ID}`)
				const messageBody = await messageResponse.json()

				if (messageBody.Subject === subject) {
					const value = extractValue(messageBody.Text ?? "")

					if (value) {
						return value
					}
				}
			}
		}

		await new Promise((resolve) => setTimeout(resolve, 500))
	}

	throw new Error(`No ${subject} email arrived for ${email}`)
}

function urlFromEmail(text) {
	return text.match(/https?:\/\/\S+/)?.[0]
}

function otpFromEmail(text) {
	return text.match(/\b\d{6}\b/)?.[0]
}

function incorrectOtp(otp) {
	const finalDigit = Number(otp.at(-1))
	return `${otp.slice(0, -1)}${(finalDigit + 1) % 10}`
}

console.log("RUNNING SMOKE TESTS")

for (const provider of socialProviders.filter(({ enabled }) => enabled)) {
	console.log(`SOCIAL TEST: ${provider.id} should create an OAuth authorization URL`)
	const result = await expectSuccess(
		await request("/api/auth/sign-in/social", {
			body: {
				provider: provider.id,
				callbackURL: "/account",
				errorCallbackURL: "/login",
				disableRedirect: true,
			},
		}),
		`${provider.id} social sign in`,
	)
	const authorizationUrl = result?.url ? new URL(result.url) : undefined
	assert(authorizationUrl, `${provider.id} did not return an authorization URL`)
	assert(
		authorizationUrl.hostname === provider.authorizationHost,
		`${provider.id} returned the wrong authorization host`,
	)
	assert(
		authorizationUrl.searchParams.get("redirect_uri") ===
			`${appUrl}/api/auth/callback/${provider.id}`,
		`${provider.id} returned the wrong OAuth callback URL`,
	)
}

console.log("TEST 1: Hitting email sign up endpoint should succeed")
await expectSuccess(
	await request("/api/auth/sign-up/email", {
		body: { name: "Auth Smoke Test", email, password: originalPassword },
	}),
	"sign up",
)

console.log("TEST 2: Email sign in before verification should fail")
await expectFailure(
	await request("/api/auth/sign-in/email", { body: { email, password: originalPassword } }),
	"sign in before verification",
)

console.log("TEST 3: Sign in should fail if password is incorrect")
await expectFailure(
	await request("/api/auth/sign-in/email", {
		body: { email, password: "incorrect-password" },
	}),
	"sign in with incorrect password",
)

console.log("TEST 4: Verification should fail if token has expired")
assert(authSecret, "BETTER_AUTH_SECRET is required to test expired verification links")
const expiredToken = await createEmailVerificationToken(authSecret, email, undefined, -60)
const expiredVerification = await expectFailure(
	await request(`/api/auth/verify-email?token=${expiredToken}`),
	"expired email verification",
)
assert(expiredVerification?.code === "TOKEN_EXPIRED", "expired link returned the wrong error")

const verificationUrl = await waitForEmail("Verify your MediMate email address", urlFromEmail)
const verificationResponse = await fetch(verificationUrl, { redirect: "manual" })
assert(
	verificationResponse.ok || verificationResponse.status === 302,
	`email verification failed (${verificationResponse.status})`,
)

const firstSignIn = await request("/api/auth/sign-in/email", {
	body: { email, password: originalPassword },
})
await expectSuccess(firstSignIn, "sign in after verification")

const firstCookie = cookiesFrom(firstSignIn)
assert(firstCookie, "sign in did not return a session cookie")

const firstSession = await expectSuccess(
	await request("/api/auth/get-session", { cookie: firstCookie }),
	"get session",
)
assert(firstSession?.user?.email === email, "session belongs to the wrong user")

await expectSuccess(
	await request("/api/auth/sign-out", { body: {}, cookie: firstCookie }),
	"sign out",
)

console.log("TEST 9: get-session endpoint should succeed and return nothing if signed out")
const signedOutSession = await expectSuccess(
	await request("/api/auth/get-session", { cookie: firstCookie }),
	"get session after sign out",
)
assert(!signedOutSession, "session is still active after sign out")

await expectSuccess(
	await request("/api/auth/request-password-reset", {
		body: { email, redirectTo: "/reset-password" },
	}),
	"request password reset link",
)

const passwordResetUrl = await waitForEmail("Reset your MediMate password", urlFromEmail)
const resetCallback = await fetch(passwordResetUrl, { redirect: "manual" })
assert(
	resetCallback.status === 302,
	`password reset link did not redirect (${resetCallback.status})`,
)

const resetLocation = resetCallback.headers.get("location")
const resetToken = resetLocation ? new URL(resetLocation, appUrl).searchParams.get("token") : null
assert(resetToken, "password reset redirect did not contain a token")

await expectSuccess(
	await request("/api/auth/reset-password", {
		body: { newPassword: linkResetPassword, token: resetToken },
	}),
	"reset password with link",
)

await expectFailure(
	await request("/api/auth/reset-password", {
		body: { newPassword: "MediMate-reused-token-2026", token: resetToken },
	}),
	"reuse consumed password reset link",
)

await expectFailure(
	await request("/api/auth/sign-in/email", { body: { email, password: originalPassword } }),
	"sign in with old password after link reset",
)

await expectSuccess(
	await request("/api/auth/sign-in/email", { body: { email, password: linkResetPassword } }),
	"sign in after link password reset",
)

await expectSuccess(
	await request("/api/auth/email-otp/send-verification-otp", {
		body: { email, type: "sign-in" },
	}),
	"request one-time login code",
)

const signInOtp = await waitForEmail("Your MediMate one-time login code", otpFromEmail)

await expectFailure(
	await request("/api/auth/sign-in/email-otp", {
		body: { email, otp: incorrectOtp(signInOtp) },
	}),
	"sign in with incorrect one-time code",
)

const otpSignIn = await request("/api/auth/sign-in/email-otp", {
	body: { email, otp: signInOtp },
})
await expectSuccess(otpSignIn, "sign in with one-time code")

const otpCookie = cookiesFrom(otpSignIn)
assert(otpCookie, "one-time login did not return a session cookie")
await expectSuccess(
	await request("/api/auth/get-session", { cookie: otpCookie }),
	"get one-time login session",
)
await expectSuccess(
	await request("/api/auth/sign-out", { body: {}, cookie: otpCookie }),
	"sign out one-time login session",
)

await expectFailure(
	await request("/api/auth/sign-in/email-otp", { body: { email, otp: signInOtp } }),
	"reuse consumed one-time code",
)

await expectSuccess(
	await request("/api/auth/email-otp/request-password-reset", { body: { email } }),
	"request password reset code",
)

const passwordResetOtp = await waitForEmail("Your MediMate password reset code", otpFromEmail)
await expectSuccess(
	await request("/api/auth/email-otp/reset-password", {
		body: { email, otp: passwordResetOtp, password: otpResetPassword },
	}),
	"reset password with one-time code",
)

await expectFailure(
	await request("/api/auth/sign-in/email", { body: { email, password: linkResetPassword } }),
	"sign in with old password after code reset",
)

const finalSignIn = await request("/api/auth/sign-in/email", {
	body: { email, password: otpResetPassword },
})
await expectSuccess(finalSignIn, "sign in after code password reset")

const finalCookie = cookiesFrom(finalSignIn)
await expectSuccess(
	await request("/api/auth/sign-out", { body: {}, cookie: finalCookie }),
	"final sign out",
)

console.log(`Authentication smoke test passed for ${email}`)
