import type { FieldPath } from "react-hook-form"
import { z } from "zod"

/** The Medical Pantry volunteer application form is completed in four parts. */
export const ONBOARDING_STEPS = [1, 2, 3, 4] as const

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]

const AU_MOBILE_PATTERN = /^(?:\+?61|0)\s?4\d{2}[\s-]?\d{3}[\s-]?\d{3}$/
const AU_MOBILE_MESSAGE = "Enter an Australian mobile number, e.g. 0412 345 678"

function nameField(message: string) {
	return z.string().trim().min(1, message)
}

function mobileField(message: string) {
	return z.string().trim().min(1, message).regex(AU_MOBILE_PATTERN, AU_MOBILE_MESSAGE)
}

/**
 * `type="date"` inputs submit `YYYY-MM-DD`. The ISO round trip rejects impossible
 * dates the `Date` constructor would otherwise roll over (e.g. `2026-02-30`).
 */
function isDateOfBirth(value: string) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false
	}

	const date = new Date(`${value}T00:00:00Z`)

	if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
		return false
	}

	const today = new Date()
	const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
	const earliestUTC = Date.UTC(today.getFullYear() - 120, today.getMonth(), today.getDate())

	return date.getTime() <= todayUTC && date.getTime() >= earliestUTC
}

/** "Tell us more about yourself" — the volunteer's own details. */
export const personalDetailsSchema = z.object({
	firstName: nameField("Enter your first name"),
	lastName: nameField("Enter your last name"),
	address: z.string().trim().min(1, "Enter your address"),
	mobile: mobileField("Enter your mobile number"),
	email: z.email("Enter a valid email address").trim(),
	dateOfBirth: z.string().min(1, "Enter your date of birth").refine(isDateOfBirth, {
		message: "Enter a valid date of birth",
	}),
})

/** "Emergency Contact Details" — nested so the fields map to the EmergencyContact relation. */
export const emergencyContactSchema = z.object({
	firstName: nameField("Enter your emergency contact's first name"),
	lastName: nameField("Enter your emergency contact's last name"),
	relationship: z.string().trim().min(1, "Enter your emergency contact's relationship to you"),
	mobile: mobileField("Enter your emergency contact's mobile number"),
	email: z.email("Enter a valid email address for your emergency contact").trim(),
})

/**
 * Part 1 of the application form. Parts 2-4 are added to this schema as they are
 * built, which keeps every later field inside the same form and resolver.
 */
export const applicationFormSchema = personalDetailsSchema.extend({
	emergencyContact: emergencyContactSchema,
})

/**
 * The values held by the single form instance. This is the schema input (not the
 * parsed output) because that is what the inputs actually contain.
 */
export type OnboardingFormValues = z.input<typeof applicationFormSchema>

/** Fields that "Next" validates before the volunteer moves to the following part. */
export const STEP_FIELDS = {
	1: [
		"firstName",
		"lastName",
		"address",
		"mobile",
		"email",
		"dateOfBirth",
		"emergencyContact.firstName",
		"emergencyContact.lastName",
		"emergencyContact.relationship",
		"emergencyContact.mobile",
		"emergencyContact.email",
	],
	// TODO: fill in as parts 2, 3 and 4 are built.
	2: [],
	3: [],
	4: [],
} as const satisfies Record<OnboardingStep, readonly FieldPath<OnboardingFormValues>[]>
