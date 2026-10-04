import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers })

	if (!session) {
		return Response.json({ error: "Authentication is required." }, { status: 401 })
	}

	const registrations = await prisma.eventAttendee.findMany({
		where: { volunteerId: session.user.id },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			status: true,
			createdAt: true,
			event: {
				select: {
					id: true,
					title: true,
					description: true,
					location: true,
					startsAt: true,
					endsAt: true,
					status: true,
				},
			},
		},
	})

	return Response.json({ events: registrations })
}
