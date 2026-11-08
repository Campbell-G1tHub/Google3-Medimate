import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import type { CreateOpportunityInput } from "@/lib/validation/opportunity"

/**
 * An opportunity as the admin list renders it. Opportunities are `events` rows; the category
 * comes from the linked volunteer group, falling back to a keyword guess for older rows that
 * have no group.
 */
export interface AdminOpportunity {
	id: string
	category: string
	role: string
	description: string
	location: string | null
	startsAt: string | null
	endsAt: string | null
	capacity: number | null
	requirements: string | null
	status: string
}

const OPPORTUNITY_SELECT = {
	id: true,
	title: true,
	description: true,
	location: true,
	startsAt: true,
	endsAt: true,
	capacity: true,
	requirements: true,
	status: true,
	volunteerGroup: { select: { name: true } },
} satisfies Prisma.EventSelect

type OpportunityRow = Prisma.EventGetPayload<{ select: typeof OPPORTUNITY_SELECT }>

/** Same heuristic the volunteer-facing cards use, for events created before groups existed. */
function categoryFor(row: OpportunityRow) {
	if (row.volunteerGroup?.name) {
		return row.volunteerGroup.name
	}

	const title = row.title.toLowerCase()

	if (title.includes("delivery")) return "Deliveries"
	if (title.includes("warehouse")) return "Warehouses"

	return "Community"
}

function toAdminOpportunity(row: OpportunityRow): AdminOpportunity {
	return {
		id: row.id,
		category: categoryFor(row),
		role: row.title,
		description: row.description,
		location: row.location,
		startsAt: row.startsAt?.toISOString() ?? null,
		endsAt: row.endsAt?.toISOString() ?? null,
		capacity: row.capacity,
		requirements: row.requirements,
		status: row.status,
	}
}

/** Every opportunity the signed-in admin has created, newest start date first. */
export async function listCreatedOpportunities(creatorId: string) {
	const events = await prisma.event.findMany({
		where: { creatorId },
		orderBy: [{ startsAt: "desc" }, { createdTime: "desc" }],
		select: OPPORTUNITY_SELECT,
	})

	return events.map(toAdminOpportunity)
}

/**
 * Files the opportunity under the volunteer group named after its category, creating that
 * group on first use, then stores the event itself.
 */
export async function createOpportunity(creatorId: string, input: CreateOpportunityInput) {
	const group = await prisma.volunteerGroup.upsert({
		where: { name: input.category },
		update: {},
		create: { name: input.category },
		select: { id: true },
	})

	const event = await prisma.event.create({
		data: {
			creatorId,
			title: input.role,
			description: input.description,
			location: input.location,
			startsAt: new Date(input.time),
			capacity: Number(input.capacity),
			requirements: input.requirements?.trim() || null,
			status: "OPEN",
			volunteerGroupId: group.id,
		},
		select: OPPORTUNITY_SELECT,
	})

	return toAdminOpportunity(event)
}
