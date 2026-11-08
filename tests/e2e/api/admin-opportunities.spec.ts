import { type APIRequestContext, expect, request, test } from "@playwright/test"
import { getOpportunity, resetOpportunities, seedOpportunity } from "../fixtures/db"
import { storageStatePath, type TestUserKey } from "../fixtures/users"

const OPPORTUNITIES_API = "/api/admin/opportunities"

const opportunityApi = (id: string) => `${OPPORTUNITIES_API}/${id}`

const validEdit = {
	category: "Logistics",
	role: "Delivery driver",
	location: "Carlton",
	time: "2026-12-05T09:00",
	capacity: "8",
	description: "Deliver packed orders around Carlton",
	requirements: "Driver licence",
}

/** The instant the seeded opportunity starts at; the edit moves it a few days later. */
const SEEDED_START = new Date("2026-12-01T09:00:00Z")

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
	await resetOpportunities()
})

test.afterEach(async () => {
	await Promise.all(contexts.map((context) => context.dispose()))
	contexts = []
	await resetOpportunities()
})

test.describe("PATCH /api/admin/opportunities/[opportunityId]", () => {
	test("rejects signed-out callers", async ({ baseURL }) => {
		const id = await seedOpportunity({ title: "Sorting assistant" })
		const api = await apiAs(null, baseURL!)
		const response = await api.patch(opportunityApi(id), { data: validEdit })
		expect(response.status()).toBe(401)
	})

	test("rejects volunteers", async ({ baseURL }) => {
		const id = await seedOpportunity({ title: "Sorting assistant" })
		const api = await apiAs("fundraisingVolunteer", baseURL!)
		const response = await api.patch(opportunityApi(id), { data: validEdit })
		expect(response.status()).toBe(403)
	})

	test("rejects an id that is not a UUID", async ({ baseURL }) => {
		const api = await apiAs("admin", baseURL!)
		const response = await api.patch(opportunityApi("not-a-uuid"), { data: validEdit })
		expect(response.status()).toBe(400)
	})

	test("reports field errors for an incomplete payload", async ({ baseURL }) => {
		const id = await seedOpportunity({ title: "Sorting assistant" })
		const api = await apiAs("admin", baseURL!)
		const response = await api.patch(opportunityApi(id), {
			data: { ...validEdit, role: "", capacity: "0" },
		})
		expect(response.status()).toBe(400)

		const body = await response.json()
		expect(body.success).toBe(false)
		expect(body.fieldErrors.role).toBeTruthy()
		expect(body.fieldErrors.capacity).toBeTruthy()
	})

	test("returns 404 for an opportunity that does not exist", async ({ baseURL }) => {
		const api = await apiAs("admin", baseURL!)
		const response = await api.patch(opportunityApi(crypto.randomUUID()), { data: validEdit })
		expect(response.status()).toBe(404)
	})

	test("saves every edited field", async ({ baseURL }) => {
		const id = await seedOpportunity({ title: "Sorting assistant", startsAt: SEEDED_START })
		const api = await apiAs("admin", baseURL!)
		const response = await api.patch(opportunityApi(id), { data: validEdit })
		expect(response.status()).toBe(200)

		const body = await response.json()
		expect(body.success).toBe(true)
		expect(body.opportunity).toMatchObject({
			id,
			category: validEdit.category,
			role: validEdit.role,
			location: validEdit.location,
			capacity: Number(validEdit.capacity),
			description: validEdit.description,
			requirements: validEdit.requirements,
		})

		const stored = await getOpportunity(id)
		expect(stored.title).toBe(validEdit.role)
		expect(stored.location).toBe(validEdit.location)
		expect(stored.capacity).toBe(Number(validEdit.capacity))
		expect(stored.requirements).toBe(validEdit.requirements)
		expect(stored.status).toBe("OPEN")
		// `time` is submitted as local wall-clock, so compare the window rather than the zone.
		const startsAt = stored.starts_at?.getTime() ?? 0
		expect(startsAt).toBeGreaterThan(SEEDED_START.getTime())
		expect(startsAt - SEEDED_START.getTime()).toBeLessThan(7 * 86_400_000)
	})

	test("keeps the edited opportunity in the admin list", async ({ baseURL }) => {
		const id = await seedOpportunity({ title: "Sorting assistant" })
		const api = await apiAs("admin", baseURL!)
		await api.patch(opportunityApi(id), { data: validEdit })

		const response = await api.get(OPPORTUNITIES_API)
		const body = await response.json()
		const listed = body.opportunities.find((item: { id: string }) => item.id === id)
		expect(listed.role).toBe(validEdit.role)
	})
})

test.describe("DELETE /api/admin/opportunities/[opportunityId]", () => {
	test("rejects signed-out callers", async ({ baseURL }) => {
		const id = await seedOpportunity({ title: "Sorting assistant" })
		const api = await apiAs(null, baseURL!)
		const response = await api.delete(opportunityApi(id))
		expect(response.status()).toBe(401)
	})

	test("rejects volunteers", async ({ baseURL }) => {
		const id = await seedOpportunity({ title: "Sorting assistant" })
		const api = await apiAs("fundraisingVolunteer", baseURL!)
		const response = await api.delete(opportunityApi(id))
		expect(response.status()).toBe(403)
	})

	test("returns 404 for an opportunity that does not exist", async ({ baseURL }) => {
		const api = await apiAs("admin", baseURL!)
		const response = await api.delete(opportunityApi(crypto.randomUUID()))
		expect(response.status()).toBe(404)
	})

	test("cancels the opportunity and drops it from the admin list", async ({ baseURL }) => {
		const id = await seedOpportunity({ title: "Sorting assistant" })
		const api = await apiAs("admin", baseURL!)
		const response = await api.delete(opportunityApi(id))
		expect(response.status()).toBe(200)

		const stored = await getOpportunity(id)
		expect(stored.status).toBe("CANCELLED")

		const list = await api.get(OPPORTUNITIES_API)
		const body = await list.json()
		expect(body.opportunities.map((item: { id: string }) => item.id)).not.toContain(id)
	})

	test("refuses new sign-ups once the opportunity is cancelled", async ({ baseURL }) => {
		const id = await seedOpportunity({ title: "Sorting assistant" })
		const admin = await apiAs("admin", baseURL!)
		await admin.delete(opportunityApi(id))

		const volunteer = await apiAs("fundraisingVolunteer", baseURL!)
		const signUp = await volunteer.post(`/api/events/${id}/sign-up`)
		expect(signUp.status()).toBe(404)
	})
})
