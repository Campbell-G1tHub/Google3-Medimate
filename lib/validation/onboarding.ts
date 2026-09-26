import type { FieldPath } from "react-hook-form"
import { z } from "zod"

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

/** A single choice in a checkbox or radio group. */
export interface OnboardingOption {
	label: string
	value: string
}

/**
 * "How would you like to help Medical Pantry?" The values are stable slugs so the
 * answers can be matched to `VolunteerGroup` rows when the application is submitted.
 */
export const VOLUNTEER_INTEREST_OPTIONS = [
	{
		value: "warehouse-tasks",
		label: "Assisting with tasks in our warehouse – cleaning, sorting, item packing",
	},
	{
		value: "digital-communications",
		label: "Digital communications – social content, marketing, graphic design",
	},
	{
		value: "logistics",
		label: "Logistics – pickups from hospitals and drop-off to the warehouse",
	},
	{ value: "fundraising", label: "Fundraising" },
	{
		value: "grant-writing-and-research",
		label: "Grant writing and Scientific Research (healthcare sustainability and health impact)",
	},
	{ value: "hospital-liaison", label: "Hospital liaison or representative" },
	{ value: "board-member", label: "Board member" },
	{ value: "community-engagement", label: "Community engagement" },
	{
		value: "innovation-computer-science",
		label: "Innovation team – Computer Science, App development",
	},
	{
		value: "innovation-industrial-design",
		label: "Innovation team – industrial design for pre/post plastic project",
	},
	{ value: "sustainability-research", label: "Sustainability/research team" },
	{
		value: "corporate-sponsorship",
		label: "Corporate Sponsorship and Partnership team",
	},
] as const satisfies readonly OnboardingOption[]

/** "Frequency" — how often the volunteer would like to attend programs. */
export const VOLUNTEER_FREQUENCY_OPTIONS = [
	{ value: "weekly", label: "Weekly" },
	{ value: "fortnightly", label: "Fortnightly" },
	{ value: "monthly", label: "Monthly" },
] as const satisfies readonly OnboardingOption[]

/** "How soon can you begin volunteering?" */
export const VOLUNTEER_AVAILABILITY_OPTIONS = [
	{ value: "immediately", label: "Immediately" },
	{ value: "1-2-weeks", label: "1-2 weeks" },
	{ value: "2-4-weeks", label: "2-4 weeks" },
] as const satisfies readonly OnboardingOption[]

/**
 * Part 2 of the application form. The field names mirror the `VolunteerInformation`
 * columns the submit action will write, so the answers map across without a
 * translation layer. Every field is optional, as the reference form marks none of
 * these questions as required.
 */
export const volunteerInterestsSchema = z.object({
	volunteerInterests: z.array(z.string()).optional(),
	carType: z.string().trim().optional(),
	frequentSuburbs: z.string().trim().optional(),
	motivation: z.string().trim().optional(),
	skillsAndStrengths: z.string().trim().optional(),
	medicalConditions: z.string().trim().optional(),
	frequency: z.string().optional(),
	availability: z.string().optional(),
})

/**
 * Part 3 of the application form. Each referee is one free-text answer holding their
 * name and contact details, which maps to a `Referees` row's `referralMessage` when
 * the application is submitted. Both are optional, as the reference form marks neither
 * referee as required.
 */
export const refereesSchema = z.object({
	referee1: z.string().trim().optional(),
	referee2: z.string().trim().optional(),
})

/** "I have read and accept the Volunteer Agreement below:" — the responses to the agreement. */
export const VOLUNTEER_AGREEMENT_OPTIONS = [
	{ value: "yes", label: "Yes I agree" },
	{ value: "no", label: "No I do not agree" },
] as const satisfies readonly OnboardingOption[]

/** "I consent to Medical Pantry completing a Criminal Police Check on my behalf". */
export const POLICE_CHECK_CONSENT_OPTIONS = [
	{ value: "yes", label: "Yes" },
	{ value: "no", label: "No" },
] as const satisfies readonly OnboardingOption[]

/**
 * "How did you hear about Medical Pantry?" The values are stable slugs so the answers
 * can be stored as the `VolunteerInformation.referralSources` list when the application
 * is submitted.
 */
export const REFERRAL_SOURCE_OPTIONS = [
	{ value: "facebook", label: "Facebook" },
	{ value: "linkedin", label: "LinkedIn" },
	{ value: "instagram", label: "Instagram" },
	{ value: "word-of-mouth", label: "Word of Mouth" },
	{ value: "hospital", label: "Hospital" },
	{ value: "university-clubs", label: "University Clubs" },
	{ value: "medical-pantry-website", label: "Medical Pantry Website" },
	{ value: "other", label: "Other" },
] as const satisfies readonly OnboardingOption[]

/**
 * Part 4 of the application form: the acknowledgements and declarations. The field names
 * mirror the `VolunteerInformation` columns the submit action will write, so the answers
 * map across without a translation layer.
 */
export const acknowledgementSchema = z.object({
	// Answering "No" is recorded, but an application cannot be sent without accepting the
	// agreement, so only "yes" satisfies the schema.
	agreementAccepted: z
		.string()
		.min(1, "Select whether you accept the Volunteer Agreement")
		.refine((value) => value === "yes", "You must accept the Volunteer Agreement to apply"),
	// Either answer is a valid application; the declaration just has to be made.
	policeCheckConsent: z
		.string()
		.refine(
			(value) => value === "yes" || value === "no",
			"Select whether you consent to a Criminal Police Check",
		),
	referralSources: z.array(z.string()).min(1, "Select at least one option"),
	// Opting in is the point of the question, so an unchecked box is a valid answer.
	newsletterOptIn: z.boolean().optional(),
})

/**
 * The whole application form: parts 1-4 in one schema, so a single resolver validates
 * whichever part is on screen and, on submit, the application as a whole.
 */
export const applicationFormSchema = personalDetailsSchema.extend({
	emergencyContact: emergencyContactSchema,
	...volunteerInterestsSchema.shape,
	...refereesSchema.shape,
	...acknowledgementSchema.shape,
})

/**
 * The values held by the single form instance. This is the schema input (not the
 * parsed output) because that is what the inputs actually contain.
 */
export type OnboardingFormValues = z.input<typeof applicationFormSchema>

/**
 * The answers each part must hold before the form lets the volunteer move on. "Next"
 * validates one part's fields; "Submit" validates the whole application through the
 * resolver instead.
 */
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
	// Part 2 has no required fields, so "Next" always advances from it. The questions
	// the database marks NOT NULL (motivation, skills, frequency, availability) are
	// enforced when the submit action is built.
	2: [],
	// Part 3's referees are optional too, so "Next" always advances from it.
	3: [],
	// Part 4 is the last part, so these are the answers "Submit" requires: the two
	// declarations and at least one referral source. The newsletter opt-in is optional.
	4: ["agreementAccepted", "policeCheckConsent", "referralSources"],
} as const satisfies Record<OnboardingStep, readonly FieldPath<OnboardingFormValues>[]>
