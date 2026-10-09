"use client"

import { useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
	type OnboardingFormValues,
	VOLUNTEER_AVAILABILITY_OPTIONS,
	VOLUNTEER_FREQUENCY_OPTIONS,
	VOLUNTEER_INTEREST_OPTIONS,
} from "@/lib/validation/onboarding"

/**
 * Part 2 of the application form: how the volunteer would like to help, plus the
 * written answers that go with it. Unlike Part 1, the questions are printed above
 * their fields, so the labels are visible rather than placeholder-only.
 */
export function VolunteerInterestsStep() {
	const {
		formState: { errors },
		register,
	} = useFormContext<OnboardingFormValues>()

	return (
		<>
			<section className="mt-8">
				<h2 className="text-lg font-bold text-neutral">
					How would you like to help Medical Pantry?
				</h2>
				<p className="mt-3 text-sm leading-6">
					There are so many ways you can help out with Medical Pantry! In order for us to get to
					know you better and how best to utilise your skills, please complete the following
					questions
				</p>

				<fieldset className="mt-4 space-y-1">
					<legend className="fieldset-legend font-bold text-base-content">
						What area of volunteer work within Medical Pantry are you interested in?
					</legend>
					{VOLUNTEER_INTEREST_OPTIONS.map((option) => (
						<Checkbox
							key={option.value}
							label={option.label}
							value={option.value}
							error={errors.volunteerInterests?.message}
							{...register("volunteerInterests")}
						/>
					))}
				</fieldset>
			</section>

			<section className="mt-8 space-y-4">
				<h2 className="sr-only">Tell us about your volunteering</h2>
				<Textarea
					label="If you are applying for logistics - pickups and drop off to the warehouse, please indicate your car type (i.e. sedan, small SUV)"
					labelClassName="font-bold"
					rows={3}
					error={errors.carType?.message}
					{...register("carType")}
				/>
				<Textarea
					label="If you are applying for logistics - pick-up and drop off to the warehouse, please indicate below frequency visited suburbs."
					labelClassName="font-bold"
					rows={4}
					error={errors.frequentSuburbs?.message}
					{...register("frequentSuburbs")}
				/>
				<Textarea
					label="What motivated you to volunteer with Medical Pantry?"
					labelClassName="font-bold"
					rows={5}
					error={errors.motivation?.message}
					{...register("motivation")}
				/>
				<Textarea
					label="Do you have any particular skills or strengths that might be useful for Medical Pantry? (Such as health professional)"
					labelClassName="font-bold"
					rows={5}
					error={errors.skillsAndStrengths?.message}
					{...register("skillsAndStrengths")}
				/>
				<Textarea
					label="Do you have any medical conditions or personal issues/experiences that we should be aware of in case of an emergency?"
					labelClassName="font-bold"
					rows={4}
					error={errors.medicalConditions?.message}
					{...register("medicalConditions")}
				/>
			</section>

			<section className="mt-8 space-y-4">
				<h2 className="sr-only">Your availability</h2>
				<RadioGroup
					label="Frequency"
					labelClassName="font-bold"
					description="Please indicate your preferences and frequency to volunteering."
					options={VOLUNTEER_FREQUENCY_OPTIONS}
					error={errors.frequency?.message}
					{...register("frequency")}
				/>
				<RadioGroup
					label="How soon can you begin volunteering?"
					labelClassName="font-bold"
					options={VOLUNTEER_AVAILABILITY_OPTIONS}
					error={errors.availability?.message}
					{...register("availability")}
				/>
			</section>
		</>
	)
}
