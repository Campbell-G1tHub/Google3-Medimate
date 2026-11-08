import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import {
	OPPORTUNITY_CATEGORY_OPTIONS,
	type CreateOpportunityInput,
	type UpdateOpportunityInput,
} from "@/lib/validation/opportunity"

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

/**
 * The fallback categories for events created before groups existed. Each value must be one of
 * `OPPORTUNITY_CATEGORY_OPTIONS`, so `DropdownSelect` can find it exactly and the edit dialog
 * shows the selected category instead of an empty placeholder.
 */
const LEGACY_CATEGORY_FALLBACKS = [
	{ match: "delivery", category: "Logistics" },
	{ match: "warehouse", category: "Warehouse" },
] as const

/** Same heuristic the volunteer-facing cards use, for events created before groups existed. */
function categoryFor(row: OpportunityRow) {
	if (row.volunteerGroup?.name && isKnownCategory(row.volunteerGroup.name)) {
		return row.volunteerGroup.name
	}

	const title = row.title.toLowerCase()

	const matched = LEGACY_CATEGORY_FALLBACKS.find(({ match }) => title.includes(match))
	if (matched) {
		return matched.category
	}

	return "Community Engagement"
}

/**
 * Whether a category name is one an admin can pick. Volunteer group names used by older code
 * (e.g. "Deliveries", "Warehouses", "Community") are not in `OPPORTUNITY_CATEGORY_OPTIONS`, so
 * they fall back to the title heuristic instead of being shown verbatim.
 */
function isKnownCategory(category: string) {
	return OPPORTUNITY_CATEGORY_OPTIONS.some((option) => option.value === category)
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

/**
 * Every opportunity the signed-in admin has created, newest start date first. Opportunities an
 * admin deleted are kept as `CANCELLED` rows so signed-up volunteers keep their history, but the
 * "deleted" ones no longer show up here.
 */
export async function listCreatedOpportunities(creatorId: string) {
	const events = await prisma.event.findMany({
		where: { creatorId, status: { not: "CANCELLED" } },
		orderBy: [{ startsAt: "desc" }, { createdTime: "desc" }],
		select: OPPORTUNITY_SELECT,
	})

	return events.map(toAdminOpportunity)
}

/** Files the opportunity under the volunteer group named after its category, creating it on first use. */
function groupIdForCategory(category: string) {
	return prisma.volunteerGroup
		.upsert({
			where: { name: category },
			update: {},
			create: { name: category },
			select: { id: true },
		})
		.then((group) => group.id)
}

/**
 * Files the opportunity under the volunteer group named after its category, creating that
 * group on first use, then stores the event itself.
 */
export async function createOpportunity(creatorId: string, input: CreateOpportunityInput) {
	const groupId = await groupIdForCategory(input.category)

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
			volunteerGroupId: groupId,
		},
		select: OPPORTUNITY_SELECT,
	})

	return toAdminOpportunity(event)
}

/**
 * Replaces every editable field of an opportunity the admin created, re-filing it under the
 * group named after the (possibly new) category. Returns `null` when the opportunity is gone or
 * belongs to another admin.
 */
export async function updateOpportunity(
	creatorId: string,
	opportunityId: string,
	input: UpdateOpportunityInput,
) {
	const groupId = await groupIdForCategory(input.category)

	const { count } = await prisma.event.updateMany({
		where: { id: opportunityId, creatorId },
		data: {
			title: input.role,
			description: input.description,
			location: input.location,
			startsAt: new Date(input.time),
			capacity: Number(input.capacity),
			requirements: input.requirements?.trim() || null,
			volunteerGroupId: groupId,
			updatedTime: new Date(),
		},
	})

	if (count === 0) {
		return null
	}

	const event = await prisma.event.findFirstOrThrow({
		where: { id: opportunityId, creatorId },
		select: OPPORTUNITY_SELECT,
	})

	return toAdminOpportunity(event)
}

/**
 * "Deleting" an opportunity keeps the row for volunteers who already signed up: it moves to
 * `CANCELLED`, which the admin list hides and the sign-up endpoint already refuses. Returns
 * `false` when the opportunity is gone or belongs to another admin.
 */
export async function cancelOpportunity(creatorId: string, opportunityId: string) {
	const { count } = await prisma.event.updateMany({
		where: { id: opportunityId, creatorId },
		data: { status: "CANCELLED", updatedTime: new Date() },
	})

	return count > 0
}
