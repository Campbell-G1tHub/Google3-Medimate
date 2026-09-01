import "dotenv/config"
import { createEmailVerificationToken } from "better-auth/api"

const appUrl = process.env.AUTH_TEST_APP_URL ?? "http://localhost:3000"
const mailpitUrl = process.env.AUTH_TEST_MAILPIT_URL ?? "http://localhost:8025"
const email = `auth-smoke-${Date.now()}@medimate.local`
const password = "MediMate-test-password-2026"
const authSecret = process.env.BETTER_AUTH_SECRET

function assert(condition, message) {
	if (!condition) {
		throw new Error(message)
	}
}

async function request(path, { body, cookie, redirect = "follow" } = {}) {
	const response = await fetch(`${appUrl}${path}`, {
		method: body ? "POST" : "GET",
		headers: {
			...(body ? { "content-type": "application/json" } : {}),
			...(cookie ? { cookie } : {}),
			origin: appUrl,
		},
		body: body ? JSON.stringify(body) : undefined,
		redirect,
	})

	return response
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

async function waitForVerificationUrl() {
	for (let attempt = 0; attempt < 30; attempt += 1) {
		const search = await fetch(
			`${mailpitUrl}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
		)

		if (search.ok) {
			const result = await search.json()
			const message = result.messages?.[0]

			if (message?.ID) {
				const messageResponse = await fetch(`${mailpitUrl}/api/v1/message/${message.ID}`)
				const messageBody = await messageResponse.json()
				const url = messageBody.Text?.match(/https?:\/\/\S+\/api\/auth\/verify-email\?\S+/)?.[0]

				if (url) {
					return url
				}
			}
		}

		await new Promise((resolve) => setTimeout(resolve, 500))
	}

	throw new Error(`No verification email arrived for ${email}`)
}

console.log("RUNNING SMOKE TESTS")

console.log("TEST 1: Hitting email sign up endpoint should succeed");
await expectSuccess(
	await request("/api/auth/sign-up/email", {
		body: { name: "Auth Smoke Test", email, password },
	}),
	"sign up",
)

console.log("TEST 2: Email sign in before verification should fail");
await expectFailure(
	await request("/api/auth/sign-in/email", { body: { email, password } }),
	"sign in before verification",
)

console.log("TEST 3: Sign in should fail if password is incorrect");
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

console.log("TEST 5: Sign in should fail if verification expires")
await expectFailure(
	await request("/api/auth/sign-in/email", { body: { email, password } }),
	"sign in after expired verification",
)

console.log("TEST 6: Sign in after verification should succeed")
const verificationUrl = await waitForVerificationUrl()
const verificationResponse = await fetch(verificationUrl, { redirect: "manual" })
assert(
	verificationResponse.ok || verificationResponse.status === 302,
	`email verification failed (${verificationResponse.status})`,
)

const signInResponse = await request("/api/auth/sign-in/email", {
	body: { email, password },
})
await expectSuccess(signInResponse, "sign in after verification")


console.log("TEST 7: get-session endpoint should succeed and return the correct user")
const cookie = cookiesFrom(signInResponse)
assert(cookie, "sign in did not return a session cookie")

const session = await expectSuccess(
	await request("/api/auth/get-session", { cookie }),
	"get session",
)
assert(session?.user?.email === email, "session belongs to the wrong user")

console.log("TEST 8: Signing out should succeed")
await expectSuccess(await request("/api/auth/sign-out", { body: {}, cookie }), "sign out")

console.log("TEST 9: get-session endpoint should succeed and return nothing if signed out")
const signedOutSession = await expectSuccess(
	await request("/api/auth/get-session", { cookie }),
	"get session after sign out",
)
assert(!signedOutSession, "session is still active after sign out")

console.log(`Authentication smoke test passed for ${email}`)
