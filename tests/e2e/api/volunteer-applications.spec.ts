import type { APIRequestContext } from "@playwright/test"
import { expect, test } from "../fixtures/api"
import {
	getApplication,
	getUserId,
	setApplicationStatus,
	setApplicationSubmittedAt,
} from "../fixtures/db"

const SEARCH_API = "/api/admin/volunteer-applications/search"
const REVIEW_API = "/api/admin/volunteer-applications/review"
const DETAIL_API = (id: string) => `/api/admin/volunteer-applications/${id}`
const LIST_NOTIFICATIONS_API = "/api/volunteers/dashboard/inbox/list-notifications"
const UNKNOWN_ID = "00000000-0000-4000-8000-000000000000"

const DAY_MS = 86_400_000

type Summary = { id: string; fullName: string; email: string; status: string }

// Every test user's name starts with "E2E", which keeps searches clear of other dev data.
async function searchNames(api: APIRequestContext, body: object) {
	const response = await api.post(SEARCH_API, { data: { query: "e2e", ...body } })
	expect(response.status()).toBe(200)
	return ((await response.json()).applications as Summary[]).map((app) => app.fullName)
}

test.beforeEach(async () => {
	await setApplicationStatus("pendingVolunteer", "PENDING")
	await setApplicationSubmittedAt("boardVolunteer", new Date(Date.now() - 3 * DAY_MS))
	await setApplicationSubmittedAt("fundraisingVolunteer", new Date(Date.now() - 2 * DAY_MS))
	await setApplicationSubmittedAt("pendingVolunteer", new Date(Date.now() - DAY_MS))
})

test.afterAll(async () => {
	await setApplicationStatus("pendingVolunteer", "PENDING")
})

test.describe("access", () => {
	test("rejects signed-out callers", async ({ apiAs }) => {
		const api = await apiAs(null)
		expect((await api.post(SEARCH_API, { data: {} })).status()).toBe(401)
		expect((await api.post(REVIEW_API, { data: {} })).status()).toBe(401)
	})

	test("rejects volunteers, approved or not", async ({ apiAs }) => {
		const { id } = await getApplication("pendingVolunteer")

		for (const user of ["boardVolunteer", "pendingVolunteer"] as const) {
			const api = await apiAs(user)
			expect((await api.post(SEARCH_API, { data: {} })).status()).toBe(403)
			expect((await api.get(DETAIL_API(id))).status()).toBe(403)
			expect(
				(await api.post(REVIEW_API, { data: { applicationId: id, decision: "APPROVED" } })).status(),
			).toBe(403)
		}
	})
})

test.describe("POST /api/admin/volunteer-applications/search", () => {
	test("finds an applicant by every word of their name", async ({ apiAs }) => {
		const api = await apiAs("admin")
		expect(await searchNames(api, { query: "e2e pending" })).toEqual(["E2E Pending Volunteer"])
	})

	test("finds an applicant by email", async ({ apiAs }) => {
		const api = await apiAs("admin")
		expect(await searchNames(api, { query: "E2E-BOARD@medimate" })).toEqual([
			"E2E Board Volunteer",
		])
	})

	test("filters by status", async ({ apiAs }) => {
		const api = await apiAs("admin")
		expect(await searchNames(api, { status: "PENDING" })).toEqual(["E2E Pending Volunteer"])
		expect(await searchNames(api, { status: "APPROVED" })).toEqual([
			"E2E Fundraising Volunteer",
			"E2E Board Volunteer",
		])
	})

	test("sorts newest first by default, oldest first, or by name", async ({ apiAs }) => {
		const api = await apiAs("admin")
		const newest = ["E2E Pending Volunteer", "E2E Fundraising Volunteer", "E2E Board Volunteer"]

		expect(await searchNames(api, {})).toEqual(newest)
		expect(await searchNames(api, { sort: "oldest" })).toEqual([...newest].reverse())
		expect(await searchNames(api, { sort: "name" })).toEqual([
			"E2E Board Volunteer",
			"E2E Fundraising Volunteer",
			"E2E Pending Volunteer",
		])
	})

	test("rejects unknown filters", async ({ apiAs }) => {
		const api = await apiAs("admin")
		const response = await api.post(SEARCH_API, { data: { status: "MAYBE", sort: "random" } })
		const body = await response.json()

		expect(response.status()).toBe(400)
		expect(body.fieldErrors.status).toBeDefined()
		expect(body.fieldErrors.sort).toBeDefined()
	})
})

test.describe("GET /api/admin/volunteer-applications/[applicationId]", () => {
	test("returns the application in the onboarding form's shape", async ({ apiAs }) => {
		const { id } = await getApplication("pendingVolunteer")
		const api = await apiAs("admin")
		const response = await api.get(DETAIL_API(id))
		const { application } = await response.json()

		expect(response.status()).toBe(200)
		expect(application).toMatchObject({
			id,
			fullName: "E2E Pending Volunteer",
			status: "PENDING",
			reviewedAt: null,
			answers: {
				firstName: "E2E",
				lastName: "Pending Volunteer",
				email: "e2e-pending@medimate.test",
				dateOfBirth: "1995-01-01",
				frequency: "weekly",
				agreementAccepted: "yes",
				policeCheckConsent: "yes",
				referralSources: ["other"],
				newsletterOptIn: false,
			},
		})
	})

	test("returns 400 for a malformed ID and 404 for an unknown one", async ({ apiAs }) => {
		const api = await apiAs("admin")
		expect((await api.get(DETAIL_API("not-a-uuid"))).status()).toBe(400)
		expect((await api.get(DETAIL_API(UNKNOWN_ID))).status()).toBe(404)
	})
})

test.describe("POST /api/admin/volunteer-applications/review", () => {
	test("approving records the reviewer and unlocks the app", async ({ apiAs }) => {
		const { id } = await getApplication("pendingVolunteer")
		const admin = await apiAs("admin")
		const volunteer = await apiAs("pendingVolunteer")

		expect((await volunteer.post(LIST_NOTIFICATIONS_API, { data: {} })).status()).toBe(403)

		const response = await admin.post(REVIEW_API, {
			data: { applicationId: id, decision: "APPROVED" },
		})

		expect(response.status()).toBe(200)
		expect((await response.json()).status).toBe("APPROVED")

		const application = await getApplication("pendingVolunteer")
		expect(application.status).toBe("APPROVED")
		expect(application.reviewed_by_id).toBe(await getUserId("admin"))
		expect(application.reviewed_at).not.toBeNull()

		expect((await volunteer.post(LIST_NOTIFICATIONS_API, { data: {} })).status()).toBe(200)
	})

	test("rejecting keeps the volunteer locked out", async ({ apiAs }) => {
		const { id } = await getApplication("pendingVolunteer")
		const admin = await apiAs("admin")

		const response = await admin.post(REVIEW_API, {
			data: { applicationId: id, decision: "REJECTED" },
		})

		expect(response.status()).toBe(200)
		expect((await getApplication("pendingVolunteer")).status).toBe("REJECTED")

		const volunteer = await apiAs("pendingVolunteer")
		expect((await volunteer.post(LIST_NOTIFICATIONS_API, { data: {} })).status()).toBe(403)
	})

	test("refuses to change a decision that was already made", async ({ apiAs }) => {
		const { id } = await getApplication("pendingVolunteer")
		const admin = await apiAs("admin")

		await admin.post(REVIEW_API, { data: { applicationId: id, decision: "APPROVED" } })
		const second = await admin.post(REVIEW_API, {
			data: { applicationId: id, decision: "REJECTED" },
		})

		expect(second.status()).toBe(409)
		expect((await second.json()).status).toBe("APPROVED")
		expect((await getApplication("pendingVolunteer")).status).toBe("APPROVED")
	})

	test("validates the request", async ({ apiAs }) => {
		const { id } = await getApplication("pendingVolunteer")
		const admin = await apiAs("admin")

		const badDecision = await admin.post(REVIEW_API, {
			data: { applicationId: id, decision: "MAYBE" },
		})
		expect(badDecision.status()).toBe(400)
		expect((await badDecision.json()).fieldErrors.decision).toBeDefined()

		const unknown = await admin.post(REVIEW_API, {
			data: { applicationId: UNKNOWN_ID, decision: "APPROVED" },
		})
		expect(unknown.status()).toBe(404)
	})
})
