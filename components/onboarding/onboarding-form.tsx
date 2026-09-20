"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { type ReactNode, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
	applicationFormSchema,
	ONBOARDING_STEP_COUNT,
	type OnboardingFormValues,
	type OnboardingStep,
	STEP_FIELDS,
} from "@/lib/validation/onboarding"
import { PersonalDetailsStep } from "./steps/personal-details-step"

interface OnboardingFormProps {
	/** Intro copy for the application, rendered by the onboarding page. */
	children?: ReactNode
	/** Prefilled from the signed-in volunteer's account email. */
	defaultEmail?: string
}

export function OnboardingForm({ children, defaultEmail = "" }: OnboardingFormProps) {
	const [stepIndex, setStepIndex] = useState(0)
	const [isAdvancing, setIsAdvancing] = useState(false)
	const step = (stepIndex + 1) as OnboardingStep

	// One form instance owns the data for all four parts, so a volunteer can move
	// between them without losing anything.
	const methods = useForm<OnboardingFormValues>({
		defaultValues: {
			firstName: "",
			lastName: "",
			address: "",
			mobile: "",
			email: defaultEmail,
			dateOfBirth: "",
			emergencyContact: {
				firstName: "",
				lastName: "",
				relationship: "",
				mobile: "",
				email: "",
			},
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
		// screen yet cannot block this one. Part 4 adds the final `handleSubmit`
		// that validates the whole application.
		const partIsComplete =
			partFields.length === 0 ? true : await methods.trigger(partFields, { shouldFocus: true })
		setIsAdvancing(false)

		if (!partIsComplete) {
			return
		}

		setStepIndex((index) => Math.min(index + 1, ONBOARDING_STEP_COUNT - 1))
	}

	return (
		<FormProvider {...methods}>
			<h1 className="text-2xl font-bold text-neutral">
				Medical Pantry Volunteer Application Form ({step}/{ONBOARDING_STEP_COUNT})
			</h1>

			{children ? <div className="mt-4 space-y-4 text-sm leading-6">{children}</div> : null}

			<form noValidate onSubmit={handleNext}>
				{step === 1 ? <PersonalDetailsStep /> : <StepPlaceholder step={step} />}

				<div className="mt-8">
					<Button
						type="submit"
						variant="accent"
						loading={isAdvancing}
						className="min-w-24 font-semibold"
					>
						Next
					</Button>
				</div>
			</form>
		</FormProvider>
	)
}

/** TODO: replace with the part {2,3,4} fields as those parts are built. */
function StepPlaceholder({ step }: { step: OnboardingStep }) {
	return (
		<section className="mt-8">
			<h2 className="text-lg font-bold text-neutral">
				Part {step} of {ONBOARDING_STEP_COUNT}
			</h2>
			<p className="mt-3 max-w-xs text-sm text-base-content/65">
				This part of the application form has not been built yet.
			</p>
		</section>
	)
}
