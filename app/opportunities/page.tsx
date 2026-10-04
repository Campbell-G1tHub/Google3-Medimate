import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { OpportunitiesList, type Opportunity } from "@/components/opportunities/opportunities-list"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function OpportunitiesPage() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session) {
		redirect("/login")
	}

	const events = await prisma.event.findMany({
		where: { status: "OPEN" },
		orderBy: { startsAt: "asc" },
		select: {
			id: true,
			title: true,
			description: true,
			location: true,
			startsAt: true,
			endsAt: true,
			status: true,
			attendees: {
				where: { volunteerId: session.user.id },
				select: { id: true },
			},
		},
	})

	const opportunities: Opportunity[] = events.map(({ attendees, ...event }) => ({
		...event,
		startsAt: event.startsAt?.toISOString() ?? null,
		endsAt: event.endsAt?.toISOString() ?? null,
		signedUp: attendees.length > 0,
	}))

	return <OpportunitiesList initialOpportunities={opportunities} />
}
