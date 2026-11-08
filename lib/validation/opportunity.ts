import { z } from "zod"

/**
 * The categories an admin can pick when creating an opportunity. Each label is also the
 * `VolunteerGroup.name` the event is filed under, so volunteers who prefer that group are
 * the ones notified about it.
 */
export const OPPORTUNITY_CATEGORY_OPTIONS = [
	{ value: "Warehouse", label: "Warehouse" },
	{ value: "Digital communications", label: "Digital communications" },
	{ value: "Logistics", label: "Logistics" },
	{ value: "Fundraising", label: "Fundraising" },
	{
		value: "Grant writing and Scientific Research",
		label: "Grant writing and Scientific Research",
	},
	{ value: "Hospital liaison or representative", label: "Hospital liaison or representative" },
	{ value: "Board member", label: "Board member" },
	{ value: "Community Engagement", label: "Community Engagement" },
	{ value: "Computer Science", label: "Computer Science" },
	{ value: "Industrial design", label: "Industrial design" },
	{ value: "Sustainability Research team", label: "Sustainability Research team" },
	{
		value: "Corporate Sponsorship and Partnerships team",
		label: "Corporate Sponsorship and Partnerships team",
	},
] as const

export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORY_OPTIONS)[number]["value"]

const CATEGORY_VALUES: ReadonlySet<string> = new Set(
	OPPORTUNITY_CATEGORY_OPTIONS.map((option) => option.value),
)

/** `Event.status` is a free-form varchar; these are the values the admin list knows about. */
export const OPPORTUNITY_STATUS_LABELS: Record<string, string> = {
	OPEN: "Active",
	PENDING_START: "Upcoming",
	IN_PROGRESS: "Active",
	ENDED: "Completed",
	CANCELLED: "Cancelled",
	DRAFT: "Draft",
}

export function describeOpportunityStatus(status: string) {
	return OPPORTUNITY_STATUS_LABELS[status] ?? status
}

export const OPPORTUNITY_DATE_FILTER_OPTIONS = [
	{ value: "Any time", label: "Any time" },
	{ value: "This week", label: "This week" },
	{ value: "This weekend", label: "This weekend" },
	{ value: "Next week", label: "Next week" },
	{ value: "This month", label: "This month" },
] as const

export const OPPORTUNITY_SORT_OPTIONS = [
	{ value: "newest", label: "Newest first" },
	{ value: "oldest", label: "Oldest first" },
] as const

export type OpportunitySort = (typeof OPPORTUNITY_SORT_OPTIONS)[number]["value"]

/**
 * `type="datetime-local"` submits `YYYY-MM-DDTHH:mm` with no zone. The ISO round trip rejects
 * impossible values the `Date` constructor would otherwise roll over (e.g. `2026-02-30T10:00`).
 */
function isLocalDateTime(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
		return false
	}

	const [datePart, timePart] = value.split("T")
	const [year, month, day] = datePart.split("-").map(Number)
	const [hour, minute] = timePart.split(":").map(Number)
	const parsed = new Date(year, month - 1, day, hour, minute)

	return (
		parsed.getFullYear() === year &&
		parsed.getMonth() === month - 1 &&
		parsed.getDate() === day &&
		parsed.getHours() === hour &&
		parsed.getMinutes() === minute
	)
}

export const createOpportunitySchema = z.object({
	category: z
		.string("Choose a category")
		.refine((value) => CATEGORY_VALUES.has(value), { message: "Choose a category" })
		.transform((value) => value as OpportunityCategory),
	role: z
		.string("Enter a role")
		.trim()
		.min(1, "Enter a role")
		.max(150, "Keep the role under 150 characters"),
	location: z
		.string("Enter a location")
		.trim()
		.min(1, "Enter a location")
		.max(200, "Keep the location under 200 characters"),
	time: z
		.string("Enter a date and time")
		.trim()
		.min(1, "Enter a date and time")
		.refine(isLocalDateTime, { message: "Enter a valid date and time" }),
	capacity: z
		.string("Enter a capacity")
		.trim()
		.min(1, "Enter a capacity")
		.regex(/^\d+$/, "Enter a whole number of volunteers")
		.refine((value) => Number(value) > 0, { message: "Capacity must be at least 1" })
		.refine((value) => Number(value) <= 10_000, { message: "Keep the capacity under 10,000" }),
	description: z
		.string("Enter a description")
		.trim()
		.min(1, "Enter a description")
		.max(5000, "Keep the description under 5000 characters"),
	requirements: z
		.string()
		.trim()
		.max(1000, "Keep the requirements under 1000 characters")
		.optional(),
})

export type CreateOpportunityFormValues = z.input<typeof createOpportunitySchema>
export type CreateOpportunityInput = z.output<typeof createOpportunitySchema>
