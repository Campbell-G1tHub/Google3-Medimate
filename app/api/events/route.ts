import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers })

	if (!session) {
		return Response.json({ error: "Authentication is required." }, { status: 401 })
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

	return Response.json({
		events: events.map(({ attendees, ...event }) => ({
			...event,
			signedUp: attendees.length > 0,
		})),
	})
}
