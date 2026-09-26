"use client"

import { useFormContext } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import type { OnboardingFormValues } from "@/lib/validation/onboarding"

/**
 * Part 3 of the application form: the volunteer's two referees. Each referee answers
 * in one free-text box holding both their name and their contact details, so the box
 * carries no placeholder of its own — the question above it states what to include.
 *
 * Both boxes are optional, as the reference form marks neither referee as required.
 */
export function RefereesStep() {
	const {
		formState: { errors },
		register,
	} = useFormContext<OnboardingFormValues>()

	return (
		<section className="mt-8 space-y-4">
			<h2 className="text-lg font-bold text-neutral">Referees</h2>
			<p className="text-sm leading-6">
				Please provide the name and contact details for 2 referees.
			</p>
			<Textarea
				label="Referee 1"
				rows={5}
				error={errors.referee1?.message}
				{...register("referee1")}
			/>
			<Textarea
				label="Referee 2"
				rows={5}
				error={errors.referee2?.message}
				{...register("referee2")}
			/>
		</section>
	)
}
