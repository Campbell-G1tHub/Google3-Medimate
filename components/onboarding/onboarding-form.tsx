"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { type ReactNode, useState, useTransition } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { submitOnboarding } from "@/app/(account)/onboarding/actions"
import { Button } from "@/components/ui/button"
import {
	applicationFormSchema,
	ONBOARDING_STEP_COUNT,
	type OnboardingFormValues,
	type OnboardingStep,
	STEP_FIELDS,
} from "@/lib/validation/onboarding"
import { AcknowledgementStep } from "./steps/acknowledgement-step"
import { PersonalDetailsStep } from "./steps/personal-details-step"
import { RefereesStep } from "./steps/referees-step"
import { VolunteerInterestsStep } from "./steps/volunteer-interests-step"

interface OnboardingFormProps {
	/** Intro copy for the application, rendered by the onboarding page. */
	children?: ReactNode
	email: string
}

export function OnboardingForm({ children, email }: OnboardingFormProps) {
	const router = useRouter()
	const [stepIndex, setStepIndex] = useState(0)
	const [isAdvancing, setIsAdvancing] = useState(false)
	const [isSubmitting, startTransition] = useTransition()
	const [submitError, setSubmitError] = useState("")
	const step = (stepIndex + 1) as OnboardingStep
	const isFinalStep = step === ONBOARDING_STEP_COUNT

	// One form instance owns the data for all four parts, so a volunteer can move
	// between them without losing anything. `shouldUnregister` stays at its `false`
	// default: a part that is off screen keeps its values, so going Back and forward
	// restores what was already typed.
	const methods = useForm<OnboardingFormValues>({
		defaultValues: {
			firstName: "",
			lastName: "",
			address: "",
			mobile: "",
			email: email,
			dateOfBirth: "",
			emergencyContact: {
				firstName: "",
				lastName: "",
				relationship: "",
				mobile: "",
				email: "",
			},
			volunteerInterests: [],
			carType: "",
			frequentSuburbs: "",
			motivation: "",
			skillsAndStrengths: "",
			medicalConditions: "",
			frequency: "",
			availability: "",
			referee1: "",
			referee2: "",
			agreementAccepted: "",
			policeCheckConsent: "",
			referralSources: [],
			newsletterOptIn: false,
		},
		mode: "onTouched",
		resolver: zodResolver(applicationFormSchema),
	})

	async function handleNext(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const partFields = STEP_FIELDS[step]

		setIsAdvancing(true)
		// Validating with `trigger(partFields)` rather than the form's `handleSubmit`
		// keeps each part independent: react-hook-form only reports (and only fails
		// on) the fields named here, so required fields in parts that are not on
		// screen yet cannot block this one. Part 4 uses `handleFinalSubmit` below,
		// which validates the whole application in one go.
		const partIsComplete =
			partFields.length === 0 ? true : await methods.trigger(partFields, { shouldFocus: true })
		setIsAdvancing(false)

		if (!partIsComplete) {
			return
		}

		setStepIndex((index) => Math.min(index + 1, ONBOARDING_STEP_COUNT - 1))
	}

	// Part 4's "Submit" button posts here instead of `handleNext`. `handleSubmit` runs
	// the resolver over the whole application at once, so parts 1-3 are checked again
	// before the application is sent — the per-part `trigger` above only ever looked at
	// the part that was on screen.
	//
	// `submitOnboarding` writes `VolunteerInformation`, `EmergencyContact`, `Referees`
	// and `VolunteerGroupPreference`, sets `volunteers.onboarding_completed`, and the
	// client then navigates to `/home`.
	const handleFinalSubmit = methods.handleSubmit((values) => {
		setSubmitError("")
		startTransition(async () => {
			const result = await submitOnboarding(values)
			if (result?.error) {
				setSubmitError(result.error)
				return
			}

			router.push("/home")
			router.refresh()
		})
	})

	return (
		<FormProvider {...methods}>
			<h1 className="text-2xl font-bold text-neutral">
				Medical Pantry Volunteer Application Form ({step}/{ONBOARDING_STEP_COUNT})
			</h1>

			{/* The part 1 preamble only belongs to part 1; later parts carry their own. */}
			{children && step === 1 ? (
				<div className="mt-4 space-y-4 text-sm leading-6">{children}</div>
			) : null}

			<form noValidate onSubmit={isFinalStep ? handleFinalSubmit : handleNext}>
				{step === 1 ? (
					<PersonalDetailsStep />
				) : step === 2 ? (
					<VolunteerInterestsStep />
				) : step === 3 ? (
					<RefereesStep />
				) : (
					<AcknowledgementStep />
				)}

				<div className="mt-8 flex items-center gap-3">
					<Button
						type="button"
						variant="outline"
						disabled={step === 1}
						className="min-w-24 font-semibold"
						onClick={() => setStepIndex((index) => Math.max(index - 1, 0))}
					>
						Back
					</Button>
					<Button
						type="submit"
						variant="accent"
						loading={isAdvancing || isSubmitting}
						className="min-w-24 font-semibold"
					>
						{isFinalStep ? "Submit" : "Next"}
					</Button>
				</div>

				{submitError && (
					<p role="alert" className="mt-4 text-sm text-error">
						{submitError}
					</p>
				)}
			</form>
		</FormProvider>
	)
}
