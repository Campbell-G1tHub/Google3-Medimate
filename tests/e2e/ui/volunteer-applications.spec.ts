import { expect, type Page, test } from "@playwright/test"
import { getApplication, setApplicationStatus } from "../fixtures/db"
import { storageStatePath, TEST_PASSWORD, TEST_USERS } from "../fixtures/users"

const APPLICATIONS_PAGE = "/dashboard/admin/volunteer-applications"
const APPLICANT = "E2E Pending Volunteer"

async function expectNoHorizontalScroll(page: Page) {
	const overflows = await page.evaluate(
		() => document.documentElement.scrollWidth > document.documentElement.clientWidth,
	)
	expect(overflows).toBe(false)
}

async function openApplicant(page: Page) {
	await page.goto(APPLICATIONS_PAGE)
	await page.getByRole("searchbox", { name: "Search by name or email" }).fill("e2e pending")
	await expect(page.getByRole("listitem")).toHaveCount(1)
	await page.getByRole("button", { name: `Review ${APPLICANT}'s application` }).click()

	const review = page.getByRole("dialog", { name: "Review Volunteer Application" })
	await expect(review.getByRole("heading", { name: `${APPLICANT}'s Application` })).toBeVisible()
	return review
}

test.beforeEach(async () => {
	await setApplicationStatus("pendingVolunteer", "PENDING")
})

test.afterAll(async () => {
	await setApplicationStatus("pendingVolunteer", "PENDING")
})

test.describe("applicant waiting for review", () => {
	test.use({ storageState: storageStatePath("pendingVolunteer") })

	test("is sent to the application status page", async ({ page }) => {
		await page.goto("/home")

		await expect(page).toHaveURL(/\/application-status$/)
		await expect(
			page.getByRole("heading", { name: "Medical Pantry Volunteer Application Form Submitted" }),
		).toBeVisible()
		await expect(page.getByRole("img", { name: /Medical Pantry volunteers/ })).toBeVisible()
		await expectNoHorizontalScroll(page)
	})

	test("sees that a rejected application was unsuccessful", async ({ page }) => {
		await setApplicationStatus("pendingVolunteer", "REJECTED")
		await page.goto("/dashboard/admin/volunteer-applications")

		await expect(page).toHaveURL(/\/application-status$/)
		await expect(
			page.getByRole("heading", { name: "Medical Pantry Volunteer Application Unsuccessful" }),
		).toBeVisible()
	})

	// Signs in with a fresh session so signing out does not end the shared one.
	test("can go back to login", async ({ browser, baseURL }) => {
		const context = await browser.newContext({ baseURL, storageState: undefined })
		const signIn = await context.request.post("/api/auth/sign-in/email", {
			data: { email: TEST_USERS.pendingVolunteer.email, password: TEST_PASSWORD },
			headers: { origin: baseURL! },
		})
		expect(signIn.ok()).toBe(true)

		const page = await context.newPage()
		await page.goto("/application-status")
		await page.getByRole("button", { name: "Back to login" }).click()

		await expect(page).toHaveURL(/\/login$/)
		await page.goto("/home")
		await expect(page).toHaveURL(/\/login$/)
		await context.close()
	})
})

test.describe("admin reviewing applications", () => {
	test.use({ storageState: storageStatePath("admin") })

	test("lists, searches and filters applications", async ({ page }) => {
		await page.goto(APPLICATIONS_PAGE)
		await expect(page.getByRole("heading", { name: "Search applications" })).toBeVisible()

		await page.getByRole("searchbox", { name: "Search by name or email" }).fill("e2e")
		await page.getByRole("combobox", { name: "Filter by status" }).selectOption("PENDING")

		const rows = page.getByRole("listitem")
		await expect(rows).toHaveCount(1)
		await expect(rows.first()).toContainText(APPLICANT)
		await expect(rows.first()).toContainText("Pending")

		await page.getByRole("combobox", { name: "Filter by status" }).selectOption("APPROVED")
		await expect(rows.filter({ hasText: APPLICANT })).toHaveCount(0)
		await expect(rows.filter({ hasText: "E2E Board Volunteer" })).toHaveCount(1)

		await expectNoHorizontalScroll(page)
	})

	test("shows the application read-only", async ({ page }) => {
		const review = await openApplicant(page)

		const firstName = review.getByPlaceholder("First Name").first()
		await expect(firstName).toHaveValue("E2E")
		await expect(firstName).toBeDisabled()
		await expect(review.getByRole("radio", { name: "Yes I agree" })).toBeChecked()
		await expect(review.getByRole("checkbox", { name: "Other" })).toBeChecked()
		await expect(review.getByTitle("Medical Pantry Volunteer Agreement")).toHaveCount(0)

		await review.getByRole("button", { name: "Close" }).click()
		await expect(review).toBeHidden()
	})

	test("approves an application", async ({ page }) => {
		const review = await openApplicant(page)
		await review.getByRole("button", { name: "Approve", exact: true }).click()

		const confirm = page.getByRole("dialog", { name: "Approve Application?" })
		await expect(confirm).toContainText(`You're about to approve the application for "${APPLICANT}"`)
		await confirm.getByRole("button", { name: "Approve", exact: true }).click()

		const done = page.getByRole("dialog", { name: "Application Approved" })
		await expect(done).toContainText(`"${APPLICANT}" is now a volunteer and can access MediMate`)
		await done.getByRole("button", { name: "Done" }).click()

		await expect(review).toBeHidden()
		await expect(page.getByRole("listitem").filter({ hasText: APPLICANT })).toContainText(
			"Approved",
		)
		expect((await getApplication("pendingVolunteer")).status).toBe("APPROVED")
	})

	test("cancelling keeps the application pending, then rejects it", async ({ page }) => {
		const review = await openApplicant(page)
		await review.getByRole("button", { name: "Reject", exact: true }).click()

		const confirm = page.getByRole("dialog", { name: "Reject Application?" })
		await confirm.getByRole("button", { name: "Cancel" }).click()
		await expect(confirm).toBeHidden()
		expect((await getApplication("pendingVolunteer")).status).toBe("PENDING")

		await review.getByRole("button", { name: "Reject", exact: true }).click()
		await confirm.getByRole("button", { name: "Reject", exact: true }).click()

		const done = page.getByRole("dialog", { name: "Application Rejected" })
		await expect(done).toContainText(`Volunteer application for "${APPLICANT}" has been rejected.`)
		await done.getByRole("button", { name: "Done" }).click()

		expect((await getApplication("pendingVolunteer")).status).toBe("REJECTED")
	})

	test("does not offer a decision on a reviewed application", async ({ page }) => {
		await setApplicationStatus("pendingVolunteer", "APPROVED")
		const review = await openApplicant(page)

		await expect(review).toContainText("This application was approved")
		await expect(review.getByRole("button", { name: "Approve", exact: true })).toHaveCount(0)
		await expect(review.getByRole("button", { name: "Reject", exact: true })).toHaveCount(0)
	})
})
