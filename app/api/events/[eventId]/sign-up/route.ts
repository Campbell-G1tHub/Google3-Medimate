import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, context: { params: Promise<{ eventId: string }> }) {
	const session = await auth.api.getSession({ headers: request.headers })

	if (!session) {
		return Response.json({ error: "Authentication is required." }, { status: 401 })
	}

	const { eventId } = await context.params
	const event = await prisma.event.findFirst({
		where: { id: eventId, status: "OPEN" },
		select: { id: true },
	})

	if (!event) {
		return Response.json({ error: "This opportunity is not available." }, { status: 404 })
	}

	const existingRegistration = await prisma.eventAttendee.findFirst({
		where: { eventId, volunteerId: session.user.id },
		select: { id: true },
	})

	if (existingRegistration) {
		return Response.json(
			{ error: "You have already signed up for this opportunity." },
			{ status: 409 },
		)
	}

	const registration = await prisma.eventAttendee.create({
		data: { eventId, volunteerId: session.user.id },
		select: { id: true, eventId: true, volunteerId: true, status: true, createdAt: true },
	})

	return Response.json({ registration }, { status: 201 })
}
