"use client"

import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import type { OnboardingFormValues } from "@/lib/validation/onboarding"

/**
 * Part 1 of the application form: the volunteer's own details plus their emergency
 * contact. Labels are visually hidden so the fields read like the Medical Pantry
 * design, which relies on placeholders; the label still names the field for
 * assistive tech.
 */
export function PersonalDetailsStep() {
	const {
		formState: { errors },
		register,
	} = useFormContext<OnboardingFormValues>()

	return (
		<>
			<section className="mt-8">
				<h2 className="text-lg font-bold text-neutral">Tell us more about yourself</h2>
				<div className="mt-3 max-w-xs space-y-2">
					<Input
						label="First Name"
						labelClassName="sr-only"
						placeholder="First Name"
						autoComplete="given-name"
						aria-required
						error={errors.firstName?.message}
						{...register("firstName")}
					/>
					<Input
						label="Last Name"
						labelClassName="sr-only"
						placeholder="Last Name"
						autoComplete="family-name"
						aria-required
						error={errors.lastName?.message}
						{...register("lastName")}
					/>
					<Input
						label="Address"
						labelClassName="sr-only"
						placeholder="Address"
						autoComplete="street-address"
						aria-required
						error={errors.address?.message}
						{...register("address")}
					/>
					<Input
						label="Mobile"
						labelClassName="sr-only"
						placeholder="Mobile"
						type="tel"
						autoComplete="tel"
						aria-required
						error={errors.mobile?.message}
						{...register("mobile")}
					/>
					<Input
						label="Email"
						labelClassName="sr-only"
						placeholder="Email"
						type="email"
						autoComplete="email"
						aria-required
						error={errors.email?.message}
						{...register("email")}
					/>
					<Input
						label="DOB"
						labelClassName="sr-only"
						placeholder="DOB"
						type="date"
						autoComplete="bday"
						aria-required
						error={errors.dateOfBirth?.message}
						{...register("dateOfBirth")}
					/>
				</div>
			</section>

			<section className="mt-8">
				<h2 className="text-lg font-bold text-neutral">Emergency Contact Details</h2>
				<div className="mt-3 max-w-xs space-y-2">
					<Input
						label="First Name"
						labelClassName="sr-only"
						placeholder="First Name"
						autoComplete="off"
						aria-required
						error={errors.emergencyContact?.firstName?.message}
						{...register("emergencyContact.firstName")}
					/>
					<Input
						label="Last Name"
						labelClassName="sr-only"
						placeholder="Last Name"
						autoComplete="off"
						aria-required
						error={errors.emergencyContact?.lastName?.message}
						{...register("emergencyContact.lastName")}
					/>
					<Input
						label="Relationship"
						labelClassName="sr-only"
						placeholder="Relationship"
						autoComplete="off"
						aria-required
						error={errors.emergencyContact?.relationship?.message}
						{...register("emergencyContact.relationship")}
					/>
					<Input
						label="Mobile"
						labelClassName="sr-only"
						placeholder="Mobile"
						type="tel"
						autoComplete="off"
						aria-required
						error={errors.emergencyContact?.mobile?.message}
						{...register("emergencyContact.mobile")}
					/>
					<Input
						label="Email"
						labelClassName="sr-only"
						placeholder="Email"
						type="email"
						autoComplete="off"
						aria-required
						error={errors.emergencyContact?.email?.message}
						{...register("emergencyContact.email")}
					/>
				</div>
			</section>
		</>
	)
}
