import pg from "pg"
import { TEST_USERS, type TestUserKey } from "./users"

export const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	allowExitOnIdle: true,
})

export async function getUserId(user: TestUserKey) {
	const { rows } = await pool.query<{ id: string }>("SELECT id FROM volunteers WHERE email = $1", [
		TEST_USERS[user].email,
	])
	if (!rows[0]) {
		throw new Error(`Test user ${user} has not been seeded`)
	}
	return rows[0].id
}

async function testUserIds() {
	return Promise.all((Object.keys(TEST_USERS) as TestUserKey[]).map(getUserId))
}

/** Removes every announcement and notification involving the test users. */
export async function resetAnnouncements() {
	const ids = await testUserIds()
	await pool.query(
		`DELETE FROM notifications
		 WHERE volunteer_id = ANY($1::uuid[])
		    OR post_id IN (SELECT id FROM posts WHERE author_id = ANY($1::uuid[]))`,
		[ids],
	)
	await pool.query("DELETE FROM posts WHERE author_id = ANY($1::uuid[])", [ids])
}

interface SeedNotification {
	subject: string
	message?: string
	type?: "GENERAL" | "OPPORTUNITY" | "NEWSLETTER"
	link?: string
	read?: boolean
}

/** Inserts announcements from the test admin straight into one user's inbox. */
export async function seedNotifications(user: TestUserKey, notifications: SeedNotification[]) {
	const [adminId, volunteerId] = await Promise.all([getUserId("admin"), getUserId(user)])

	for (const [index, notification] of notifications.entries()) {
		const createdAt = new Date(Date.now() - index * 60_000)
		const { rows } = await pool.query<{ id: string }>(
			`INSERT INTO posts (author_id, type, title, body, link, created_at)
			 VALUES ($1, $2::"AnnouncementType", $3, $4, $5, $6) RETURNING id`,
			[
				adminId,
				notification.type ?? "GENERAL",
				notification.subject,
				notification.message ?? `${notification.subject} message`,
				notification.link ?? null,
				createdAt,
			],
		)
		await pool.query(
			"INSERT INTO notifications (post_id, volunteer_id, read_at, created_at) VALUES ($1, $2, $3, $4)",
			[rows[0].id, volunteerId, notification.read ? createdAt : null, createdAt],
		)
	}
}

export async function getNotifications(user: TestUserKey) {
	const { rows } = await pool.query<{ id: string; subject: string; read_at: Date | null }>(
		`SELECT n.id, p.title AS subject, n.read_at
		 FROM notifications n JOIN posts p ON p.id = n.post_id
		 WHERE n.volunteer_id = $1
		 ORDER BY n.created_at DESC`,
		[await getUserId(user)],
	)
	return rows
}

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED"

export async function getApplication(user: TestUserKey) {
	const { rows } = await pool.query<{
		id: string
		status: ApplicationStatus
		reviewed_by_id: string | null
		reviewed_at: Date | null
	}>(
		'SELECT id, status, reviewed_by_id, reviewed_at FROM "VolunteerInformation" WHERE volunteer_id = $1',
		[await getUserId(user)],
	)
	if (!rows[0]) {
		throw new Error(`Test user ${user} has no application`)
	}
	return rows[0]
}

/** Sets an application's status and clears any earlier review. */
export async function setApplicationStatus(user: TestUserKey, status: ApplicationStatus) {
	await pool.query(
		`UPDATE "VolunteerInformation"
		 SET status = $2::"ApplicationStatus", reviewed_at = NULL, reviewed_by_id = NULL
		 WHERE volunteer_id = $1`,
		[await getUserId(user), status],
	)
}

export async function setApplicationSubmittedAt(user: TestUserKey, submittedAt: Date) {
	await pool.query('UPDATE "VolunteerInformation" SET created_at = $2 WHERE volunteer_id = $1', [
		await getUserId(user),
		submittedAt,
	])
}
