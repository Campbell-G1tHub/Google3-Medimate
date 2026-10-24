import { type APIRequestContext, type FullConfig, request } from "@playwright/test"
import { pool } from "./fixtures/db"
import { storageStatePath, TEST_PASSWORD, TEST_USERS, type TestUserKey } from "./fixtures/users"

const SERVER_READY_TIMEOUT_MS = 180_000

async function waitForServer(baseURL: string) {
	const deadline = Date.now() + SERVER_READY_TIMEOUT_MS

	while (Date.now() < deadline) {
		const response = await fetch(`${baseURL}/login`).catch(() => null)
		if (response && response.status < 500) {
			return
		}
		await new Promise((resolve) => setTimeout(resolve, 2_000))
	}

	throw new Error(`The app at ${baseURL} did not start within ${SERVER_READY_TIMEOUT_MS / 1000}s`)
}

/** Deletes test users from earlier runs so sign-up starts clean. */
async function removeTestUsers() {
	const emails = Object.values(TEST_USERS).map((user) => user.email)
	const { rows } = await pool.query<{ id: string }>(
		"SELECT id FROM volunteers WHERE email = ANY($1::text[])",
		[emails],
	)
	const ids = rows.map((row) => row.id)

	await pool.query(
		`DELETE FROM notifications
		 WHERE volunteer_id = ANY($1::uuid[])
		    OR post_id IN (SELECT id FROM posts WHERE author_id = ANY($1::uuid[]))`,
		[ids],
	)
	await pool.query("DELETE FROM posts WHERE author_id = ANY($1::uuid[])", [ids])
	await pool.query("DELETE FROM notification_permissions WHERE volunteer_id = ANY($1::uuid[])", [ids])
	await pool.query("DELETE FROM volunteer_group_preferences WHERE volunteer_id = ANY($1::uuid[])", [
		ids,
	])
	await pool.query("DELETE FROM sessions WHERE user_id = ANY($1::uuid[])", [ids])
	await pool.query("DELETE FROM accounts WHERE user_id = ANY($1::uuid[])", [ids])
	await pool.query("DELETE FROM verifications WHERE identifier LIKE ANY($1::text[])", [
		emails.map((email) => `%${email}%`),
	])
	await pool.query("DELETE FROM volunteers WHERE id = ANY($1::uuid[])", [ids])
}

async function signUp(api: APIRequestContext, key: TestUserKey) {
	const user = TEST_USERS[key]
	const response = await api.post("/api/auth/sign-up/email", {
		data: { name: user.name, email: user.email, password: TEST_PASSWORD },
	})

	if (!response.ok()) {
		throw new Error(`Sign up failed for ${key}: ${response.status()} ${await response.text()}`)
	}
}

/** Skips email verification and onboarding, then applies the role and groups. */
async function prepareUser(key: TestUserKey) {
	const user = TEST_USERS[key]
	const { rows } = await pool.query<{ id: string }>(
		`UPDATE volunteers
		 SET email_verified = true, onboarding_completed = true, role = $2::"volunteerRole"
		 WHERE email = $1
		 RETURNING id`,
		[user.email, user.role],
	)
	const userId = rows[0].id

	for (const groupName of user.groups) {
		const group = await pool.query<{ id: string }>(
			`INSERT INTO volunteer_groups (name) VALUES ($1)
			 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
			 RETURNING id`,
			[groupName],
		)
		await pool.query(
			"INSERT INTO volunteer_group_preferences (volunteer_id, group_id) VALUES ($1, $2)",
			[userId, group.rows[0].id],
		)
	}
}

async function signIn(baseURL: string, key: TestUserKey) {
	const context = await request.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
	const response = await context.post("/api/auth/sign-in/email", {
		data: { email: TEST_USERS[key].email, password: TEST_PASSWORD },
	})

	if (!response.ok()) {
		throw new Error(`Sign in failed for ${key}: ${response.status()} ${await response.text()}`)
	}

	await context.storageState({ path: storageStatePath(key) })
	await context.dispose()
}

export default async function globalSetup(config: FullConfig) {
	const baseURL = config.projects[0].use.baseURL ?? "http://localhost:3000"
	const keys = Object.keys(TEST_USERS) as TestUserKey[]

	await waitForServer(baseURL)
	await removeTestUsers()

	const api = await request.newContext({ baseURL, extraHTTPHeaders: { origin: baseURL } })
	for (const key of keys) {
		await signUp(api, key)
		await prepareUser(key)
	}
	await api.dispose()

	for (const key of keys) {
		await signIn(baseURL, key)
	}
}
