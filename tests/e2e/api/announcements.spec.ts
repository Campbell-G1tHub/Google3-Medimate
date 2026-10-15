import { type APIRequestContext, expect, request, test } from "@playwright/test"
import { getNotifications, getUserId, resetAnnouncements, seedNotifications } from "../fixtures/db"
import { storageStatePath, type TestUserKey } from "../fixtures/users"

const SEND_API = "/api/admin/send-announcement"
const LIST_API = "/api/volunteers/dashboard/inbox/list-notifications"
const MARK_READ_API = "/api/volunteers/dashboard/inbox/mark-read"

const validAnnouncement = {
	type: "GENERAL",
	subject: "Warehouse open day",
	message: "Come and help sort donations this Saturday.",
	sendTo: ["board-member"],
}

let contexts: APIRequestContext[] = []

async function apiAs(user: TestUserKey | null, baseURL: string) {
	const context = await request.newContext({
		baseURL,
		storageState: user ? storageStatePath(user) : undefined,
	})
	contexts.push(context)
	return context
}

test.beforeEach(async () => {
	await resetAnnouncements()
})

test.afterEach(async () => {
	await Promise.all(contexts.map((context) => context.dispose()))
	contexts = []
})

test.describe("POST /api/admin/send-announcement", () => {
	test("rejects signed-out callers", async ({ baseURL }) => {
		const api = await apiAs(null, baseURL!)
		const response = await api.post(SEND_API, { data: validAnnouncement })
		expect(response.status()).toBe(401)
	})

	test("rejects volunteers who are not admins", async ({ baseURL }) => {
		const api = await apiAs("boardVolunteer", baseURL!)
		const response = await api.post(SEND_API, { data: validAnnouncement })
		expect(response.status()).toBe(403)
	})

	test("requires a link for newsletters", async ({ baseURL }) => {
		const api = await apiAs("admin", baseURL!)
		const response = await api.post(SEND_API, {
			data: { ...validAnnouncement, type: "NEWSLETTER" },
		})

		expect(response.status()).toBe(400)
		expect((await response.json()).fieldErrors.link).toContain("Enter the newsletter link")
	})

	test("rejects a link on general announcements", async ({ baseURL }) => {
		const api = await apiAs("admin", baseURL!)
		const response = await api.post(SEND_API, {
			data: { ...validAnnouncement, link: "https://medicalpantry.org/news" },
		})

		expect(response.status()).toBe(400)
		expect((await response.json()).fieldErrors.link).toBeDefined()
	})

	test("rejects empty fields and unknown groups", async ({ baseURL }) => {
		const api = await apiAs("admin", baseURL!)
		const response = await api.post(SEND_API, {
			data: { type: "GENERAL", subject: " ", message: "", sendTo: ["not-a-group"] },
		})
		const body = await response.json()

		expect(response.status()).toBe(400)
		expect(body.fieldErrors.subject).toBeDefined()
		expect(body.fieldErrors.message).toBeDefined()
		expect(body.fieldErrors.sendTo).toBeDefined()
	})

	test("notifies only volunteers in the chosen group", async ({ baseURL }) => {
		const api = await apiAs("admin", baseURL!)
		const response = await api.post(SEND_API, { data: validAnnouncement })
		const body = await response.json()

		expect(response.status()).toBe(200)
		expect(body.success).toBe(true)
		expect(body.recipientCount).toBeGreaterThanOrEqual(1)

		expect((await getNotifications("boardVolunteer")).map((n) => n.subject)).toEqual([
			validAnnouncement.subject,
		])
		expect(await getNotifications("fundraisingVolunteer")).toHaveLength(0)
		expect(await getNotifications("admin")).toHaveLength(0)
	})

	test("skips volunteers who are not approved yet", async ({ baseURL }) => {
		const api = await apiAs("admin", baseURL!)
		const response = await api.post(SEND_API, { data: { ...validAnnouncement, sendTo: ["all"] } })

		expect(response.status()).toBe(200)
		expect(await getNotifications("boardVolunteer")).toHaveLength(1)
		expect(await getNotifications("pendingVolunteer")).toHaveLength(0)
	})

	test("accepts a newsletter with a link", async ({ baseURL }) => {
		const api = await apiAs("admin", baseURL!)
		const response = await api.post(SEND_API, {
			data: {
				...validAnnouncement,
				type: "NEWSLETTER",
				link: "https://medicalpantry.org/newsletter",
				sendTo: ["fundraising"],
			},
		})

		expect(response.status()).toBe(200)
		expect(await getNotifications("fundraisingVolunteer")).toHaveLength(1)
		expect(await getNotifications("boardVolunteer")).toHaveLength(0)
	})
})

test.describe("POST /api/volunteers/dashboard/inbox/list-notifications", () => {
	test("rejects signed-out callers", async ({ baseURL }) => {
		const api = await apiAs(null, baseURL!)
		const response = await api.post(LIST_API, { data: {} })
		expect(response.status()).toBe(401)
	})

	test("returns the caller's notifications and unread count", async ({ baseURL }) => {
		await seedNotifications("boardVolunteer", [
			{ subject: "Newest" },
			{ subject: "Older", read: true },
		])
		const api = await apiAs("boardVolunteer", baseURL!)
		const response = await api.post(LIST_API, {
			data: { userId: await getUserId("boardVolunteer") },
		})
		const body = await response.json()

		expect(response.status()).toBe(200)
		expect(body.unreadCount).toBe(1)
		expect(body.notifications.map((n: { announcement: { subject: string } }) => n.announcement.subject)).toEqual(
			["Newest", "Older"],
		)
	})

	test("refuses to list another user's notifications", async ({ baseURL }) => {
		const api = await apiAs("boardVolunteer", baseURL!)
		const response = await api.post(LIST_API, {
			data: { userId: await getUserId("fundraisingVolunteer") },
		})
		expect(response.status()).toBe(403)
	})

	test("blocks volunteers whose application is still pending", async ({ baseURL }) => {
		const api = await apiAs("pendingVolunteer", baseURL!)
		const response = await api.post(LIST_API, { data: {} })

		expect(response.status()).toBe(403)
		expect((await response.json()).error).toBe(
			"Your volunteer application has not been approved yet.",
		)
	})
})

test.describe("POST /api/volunteers/dashboard/inbox/mark-read", () => {
	test("marks selected notifications as read", async ({ baseURL }) => {
		await seedNotifications("boardVolunteer", [{ subject: "First" }, { subject: "Second" }])
		const [first] = await getNotifications("boardVolunteer")
		const api = await apiAs("boardVolunteer", baseURL!)

		const response = await api.post(MARK_READ_API, { data: { notificationIds: [first.id] } })

		expect(response.status()).toBe(200)
		expect((await response.json()).unreadCount).toBe(1)
	})

	test("marks everything as read when no IDs are sent", async ({ baseURL }) => {
		await seedNotifications("boardVolunteer", [{ subject: "First" }, { subject: "Second" }])
		const api = await apiAs("boardVolunteer", baseURL!)

		const response = await api.post(MARK_READ_API, { data: {} })

		expect((await response.json()).unreadCount).toBe(0)
		expect((await getNotifications("boardVolunteer")).every((n) => n.read_at !== null)).toBe(true)
	})

	test("cannot mark another user's notifications", async ({ baseURL }) => {
		await seedNotifications("fundraisingVolunteer", [{ subject: "Not yours" }])
		const [theirs] = await getNotifications("fundraisingVolunteer")
		const api = await apiAs("boardVolunteer", baseURL!)

		await api.post(MARK_READ_API, { data: { notificationIds: [theirs.id] } })

		expect((await getNotifications("fundraisingVolunteer"))[0].read_at).toBeNull()
	})
})
