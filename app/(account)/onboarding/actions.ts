"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import {
	applicationFormSchema,
	VOLUNTEER_INTEREST_OPTIONS,
} from "@/lib/validation/onboarding"

type OnboardingSubmitResult = { error: string }

function isUniqueConstraintError(error: unknown) {
	return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
}

function optionalText(value: string | undefined): string | null {
	const trimmed = value?.trim()
	return trimmed ? trimmed : null
}

export async function submitOnboarding(
	input: unknown,
): Promise<OnboardingSubmitResult | undefined> {
	const session = await auth.api.getSession({ headers: await headers() })
	const userId = session?.user?.id

	if (!userId) {
		return { error: "You must be signed in to submit your application." }
	}

	const parsed = applicationFormSchema.safeParse(input)

	if (!parsed.success) {
		return {
			error: parsed.error.issues[0]?.message ?? "Please complete all required fields and try again.",
		}
	}

	const values = parsed.data
	const existing = await prisma.volunteer.findUnique({
		where: { id: userId },
		select: {
			onboardingCompleted: true,
			information: { select: { id: true } },
		},
	})

	if (!existing) {
		return { error: "We could not find your volunteer account." }
	}

	if (existing.onboardingCompleted || existing.information) {
		return { error: "Your volunteer application has already been submitted." }
	}

	const emergencyContactFullName =
		`${values.emergencyContact.firstName} ${values.emergencyContact.lastName}`.trim()
	const referees = [values.referee1, values.referee2]
		.map((referee) => referee?.trim())
		.filter((referee): referee is string => Boolean(referee))

	try {
		await prisma.$transaction(async (tx) => {
			const emergencyContact = await tx.emergencyContact.create({
				data: {
					declarantId: userId,
					fullName: emergencyContactFullName,
					email: values.emergencyContact.email,
					relationship: values.emergencyContact.relationship,
					phoneNumber: values.emergencyContact.mobile,
				},
			})

			const information = await tx.volunteerInformation.create({
				data: {
					volunteerId: userId,
					firstName: values.firstName,
					lastName: values.lastName,
					address: values.address,
					mobile: values.mobile,
					dateOfBirth: new Date(`${values.dateOfBirth}T00:00:00.000Z`),
					motivation: values.motivation?.trim() || "",
					skillsAndStrengths: values.skillsAndStrengths?.trim() || "",
					medicalConditions: optionalText(values.medicalConditions),
					carType: optionalText(values.carType),
					frequentSuburbs: optionalText(values.frequentSuburbs),
					frequency: values.frequency || "",
					availability: values.availability || "",
					agreementAccepted: values.agreementAccepted === "yes",
					agreementAcceptedAt: new Date(),
					policeCheckConsent: values.policeCheckConsent === "yes",
					newsletterOptIn: values.newsletterOptIn ?? false,
					referralSources: values.referralSources.join(","),
					emergencyContactId: emergencyContact.id,
				},
			})

			if (referees.length > 0) {
				await tx.referees.createMany({
					data: referees.map((referralMessage) => ({
						volunteerId: userId,
						referralMessage,
						volunteerInformationId: information.id,
					})),
				})
			}

			const selectedGroups = VOLUNTEER_INTEREST_OPTIONS.filter((option) =>
				(values.volunteerInterests ?? []).includes(option.value),
			)

			for (const option of selectedGroups) {
				const group = await tx.volunteerGroup.upsert({
					where: { name: option.label },
					update: {},
					create: { name: option.label },
				})

				await tx.volunteerGroupPreference.create({
					data: {
						volunteerId: userId,
						groupId: group.id,
						volunteerInformationId: information.id,
					},
				})
			}

			await tx.volunteer.update({
				where: { id: userId },
				data: { onboardingCompleted: true },
			})
		})
	} catch (error) {
		if (isUniqueConstraintError(error)) {
			return { error: "Your volunteer application has already been submitted." }
		}

		console.error("Failed to save onboarding application", error)
		return { error: "We could not save your application. Please try again." }
	}
}
