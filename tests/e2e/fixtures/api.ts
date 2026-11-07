import { type APIRequestContext, test as base, request } from "@playwright/test"
import { storageStatePath, type TestUserKey } from "./users"

type ApiAs = (user: TestUserKey | null) => Promise<APIRequestContext>

/** `apiAs` gives a request context signed in as a test user, or signed out for null. */
export const test = base.extend<{ apiAs: ApiAs }>({
	apiAs: async ({ baseURL }, use) => {
		const contexts: APIRequestContext[] = []

		await use(async (user) => {
			const context = await request.newContext({
				baseURL,
				storageState: user ? storageStatePath(user) : undefined,
			})
			contexts.push(context)
			return context
		})

		await Promise.all(contexts.map((context) => context.dispose()))
	},
})

export { expect } from "@playwright/test"
