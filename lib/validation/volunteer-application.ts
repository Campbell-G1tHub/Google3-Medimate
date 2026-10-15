import { z } from "zod"

export const APPLICATION_STATUS_OPTIONS = [
	{ value: "PENDING", label: "Pending" },
	{ value: "APPROVED", label: "Approved" },
	{ value: "REJECTED", label: "Rejected" },
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUS_OPTIONS)[number]["value"]

export const APPLICATION_SORT_OPTIONS = [
	{ value: "newest", label: "Newest first" },
	{ value: "oldest", label: "Oldest first" },
	{ value: "name", label: "Name A-Z" },
] as const

export type ApplicationSort = (typeof APPLICATION_SORT_OPTIONS)[number]["value"]

export const searchApplicationsSchema = z.object({
	query: z.string().trim().max(100, "Keep the search under 100 characters").optional(),
	status: z.enum(["PENDING", "APPROVED", "REJECTED"], "Choose a listed status").optional(),
	sort: z.enum(["newest", "oldest", "name"], "Choose a listed sort order").default("newest"),
})

export type SearchApplicationsInput = z.output<typeof searchApplicationsSchema>

export const applicationIdSchema = z.uuid("Application ID must be a UUID")

export const reviewApplicationSchema = z.object({
	applicationId: applicationIdSchema,
	decision: z.enum(["APPROVED", "REJECTED"], "Decision must be APPROVED or REJECTED"),
})
