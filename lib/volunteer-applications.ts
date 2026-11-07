import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { type OnboardingFormValues, VOLUNTEER_INTEREST_OPTIONS } from "@/lib/validation/onboarding"
import type { SearchApplicationsInput } from "@/lib/validation/volunteer-application"

const SEARCH_LIMIT = 100

const ORDER_BY = {
	newest: [{ createdAt: "desc" }],
	oldest: [{ createdAt: "asc" }],
	name: [{ firstName: "asc" }, { lastName: "asc" }],
} satisfies Record<SearchApplicationsInput["sort"], Prisma.VolunteerInformationOrderByWithRelationInput[]>

function searchWhere(query: string | undefined): Prisma.VolunteerInformationWhereInput {
	const words = query?.split(/\s+/).filter(Boolean) ?? []

	return {
		AND: words.map((word) => ({
			OR: [
				{ firstName: { contains: word, mode: "insensitive" } },
				{ lastName: { contains: word, mode: "insensitive" } },
				{ volunteer: { email: { contains: word, mode: "insensitive" } } },
			],
		})),
	}
}

export async function searchApplications({ query, status, sort }: SearchApplicationsInput) {
	const applications = await prisma.volunteerInformation.findMany({
		where: { ...searchWhere(query), ...(status ? { status } : {}) },
		orderBy: ORDER_BY[sort],
		take: SEARCH_LIMIT,
		select: {
			id: true,
			firstName: true,
			lastName: true,
			status: true,
			createdAt: true,
			volunteer: { select: { email: true } },
		},
	})

	return applications.map((application) => ({
		id: application.id,
		fullName: `${application.firstName} ${application.lastName}`,
		email: application.volunteer.email,
		status: application.status,
		submittedAt: application.createdAt.toISOString(),
	}))
}

export type ApplicationSummary = Awaited<ReturnType<typeof searchApplications>>[number]

function yesNo(value: boolean) {
	return value ? "yes" : "no"
}

/** The application in the onboarding form's shape, so the review modal can reuse its steps. */
export async function getApplication(applicationId: string) {
	const application = await prisma.volunteerInformation.findUnique({
		where: { id: applicationId },
		include: {
			volunteer: { select: { email: true } },
			emergencyContacts: true,
			referees: true,
			groups: { include: { group: { select: { name: true } } } },
		},
	})

	if (!application) {
		return null
	}

	const groupNames = new Set(application.groups.map((preference) => preference.group.name))
	const [contactFirstName = "", ...contactLastName] =
		application.emergencyContacts?.fullName.split(" ") ?? []

	const answers: OnboardingFormValues = {
		firstName: application.firstName,
		lastName: application.lastName,
		address: application.address,
		mobile: application.mobile,
		email: application.volunteer.email,
		dateOfBirth: application.dateOfBirth.toISOString().slice(0, 10),
		emergencyContact: {
			firstName: contactFirstName,
			lastName: contactLastName.join(" "),
			relationship: application.emergencyContacts?.relationship ?? "",
			mobile: application.emergencyContacts?.phoneNumber ?? "",
			email: application.emergencyContacts?.email ?? "",
		},
		volunteerInterests: VOLUNTEER_INTEREST_OPTIONS.filter((option) =>
			groupNames.has(option.label),
		).map((option) => option.value),
		carType: application.carType ?? "",
		frequentSuburbs: application.frequentSuburbs ?? "",
		motivation: application.motivation,
		skillsAndStrengths: application.skillsAndStrengths,
		medicalConditions: application.medicalConditions ?? "",
		frequency: application.frequency,
		availability: application.availability,
		referee1: application.referees[0]?.referralMessage ?? "",
		referee2: application.referees[1]?.referralMessage ?? "",
		agreementAccepted: yesNo(application.agreementAccepted),
		policeCheckConsent: yesNo(application.policeCheckConsent),
		referralSources: application.referralSources.split(",").filter(Boolean),
		newsletterOptIn: application.newsletterOptIn,
	}

	return {
		id: application.id,
		fullName: `${application.firstName} ${application.lastName}`,
		status: application.status,
		submittedAt: application.createdAt.toISOString(),
		reviewedAt: application.reviewedAt?.toISOString() ?? null,
		answers,
	}
}

export type ApplicationDetail = NonNullable<Awaited<ReturnType<typeof getApplication>>>

type ReviewResult =
	| { outcome: "reviewed"; status: "APPROVED" | "REJECTED" }
	| { outcome: "not_found" }
	| { outcome: "already_reviewed"; status: string }

/** Only pending applications can be decided, so two admins cannot overwrite each other. */
export async function reviewApplication(
	adminId: string,
	applicationId: string,
	decision: "APPROVED" | "REJECTED",
): Promise<ReviewResult> {
	const { count } = await prisma.volunteerInformation.updateMany({
		where: { id: applicationId, status: "PENDING" },
		data: { status: decision, reviewedAt: new Date(), reviewedById: adminId },
	})

	if (count === 1) {
		return { outcome: "reviewed", status: decision }
	}

	const existing = await prisma.volunteerInformation.findUnique({
		where: { id: applicationId },
		select: { status: true },
	})

	return existing
		? { outcome: "already_reviewed", status: existing.status }
		: { outcome: "not_found" }
}
