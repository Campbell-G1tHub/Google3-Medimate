import { prisma } from "@/lib/prisma"

interface AccessUser {
	id: string
	role?: string | null
	onboardingCompleted?: boolean | null
}

export function getApplicationStatus(volunteerId: string) {
	return prisma.volunteerInformation
		.findUnique({ where: { volunteerId }, select: { status: true } })
		.then((application) => application?.status ?? null)
}

/** Admins always have access. Volunteers need an approved application. */
export async function hasAppAccess(user: AccessUser) {
	if (user.role === "ADMIN") {
		return true
	}
	if (!user.onboardingCompleted) {
		return false
	}
	return (await getApplicationStatus(user.id)) === "APPROVED"
}
