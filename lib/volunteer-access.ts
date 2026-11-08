import { prisma } from "@/lib/prisma"

interface AccessUser {
	id: string
	role?: string | null
}

export function getApplicationStatus(volunteerId: string) {
	return prisma.volunteerInformation
		.findUnique({ where: { volunteerId }, select: { status: true } })
		.then((application) => application?.status ?? null)
}

/**
 * One-stop access check sourced from the database rather than the session.
 *
 * `onboardingCompleted` and the application `status` live on the volunteer row and
 * its one-to-one `information` relation, so they are read together in a single
 * query. This keeps the result in sync with reality even though the fields are
 * written via Prisma (e.g. `onboarding/actions.ts`) without touching the auth
 * session cache.
 */
export async function getVolunteerAccess(user: AccessUser) {
	const volunteer = await prisma.volunteer.findUnique({
		where: { id: user.id },
		select: {
			onboardingCompleted: true,
			information: { select: { status: true } },
		},
	})

	const applicationStatus = volunteer?.information?.status ?? null

	return {
		onboardingCompleted: volunteer?.onboardingCompleted ?? false,
		applicationStatus,
		hasAppAccess:
			user.role === "ADMIN" ||
			(volunteer?.onboardingCompleted === true && applicationStatus === "APPROVED"),
	}
}

/** Admins always have access. Volunteers need a completed, approved application. */
export function hasAppAccess(user: AccessUser) {
	return getVolunteerAccess(user).then(({ hasAppAccess }) => hasAppAccess)
}
