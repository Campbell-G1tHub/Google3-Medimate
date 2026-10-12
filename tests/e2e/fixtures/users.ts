import path from "node:path"

export const TEST_PASSWORD = "MediMate-e2e-password-2026"

export const TEST_USERS = {
	admin: {
		name: "E2E Admin",
		email: "e2e-admin@medimate.test",
		role: "ADMIN",
		groups: [],
	},
	boardVolunteer: {
		name: "E2E Board Volunteer",
		email: "e2e-board@medimate.test",
		role: "VOLUNTEER",
		groups: ["Board member"],
	},
	fundraisingVolunteer: {
		name: "E2E Fundraising Volunteer",
		email: "e2e-fundraising@medimate.test",
		role: "VOLUNTEER",
		groups: ["Fundraising"],
	},
} as const

export type TestUserKey = keyof typeof TEST_USERS

export function storageStatePath(user: TestUserKey) {
	return path.join(import.meta.dirname, "..", ".auth", `${user}.json`)
}
