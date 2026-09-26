"use client"

import { useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup } from "@/components/ui/radio-group"
import {
	type OnboardingFormValues,
	POLICE_CHECK_CONSENT_OPTIONS,
	REFERRAL_SOURCE_OPTIONS,
	VOLUNTEER_AGREEMENT_OPTIONS,
} from "@/lib/validation/onboarding"

/** Served straight from `public/`, so the browser renders the PDF without a download. */
const VOLUNTEER_AGREEMENT_URL = "/volunteer_agreement.pdf"

const AGREEMENT_QUESTION = "I have read and accept the Volunteer Agreement below:"
const POLICE_CHECK_QUESTION =
	"I consent to Medical Pantry completing a Criminal Police Check on my behalf"
const REFERRAL_SOURCE_QUESTION = "How did you hear about Medical Pantry?"

/** Named by the referral source `fieldset`, so the group's single error message is tied to it. */
const REFERRAL_SOURCE_ERROR_ID = "referralSources-error"

/**
 * Part 4 of the application form: the acknowledgements and declarations that finish the
 * application. The Volunteer Agreement is embedded with an `iframe` so the volunteer
 * reads it in place, with a link underneath for browsers that will not render a PDF
 * inside a frame.
 */
export function AcknowledgementStep() {
	const {
		formState: { errors },
		register,
	} = useFormContext<OnboardingFormValues>()

	return (
		<>
			<section className="mt-8">
				<h2 className="text-lg font-bold text-neutral">Acknowledgement &amp; Declaration</h2>
				<p className="mt-3 text-sm leading-6">
					Almost there! Please complete the following acknowledgements and declarations.
				</p>
			</section>

			<section className="mt-8">
				<h3 className="text-sm font-semibold text-neutral">{AGREEMENT_QUESTION}</h3>
				<iframe
					className="ml-[50%] -translate-x-1/2 mt-4 h-160 w-full md:w-3xl rounded-box border border-base-300 bg-base-200"
					src={VOLUNTEER_AGREEMENT_URL}
					title="Medical Pantry Volunteer Agreement"
				/>
				<p className="mt-2 text-sm">
					<a
						className="link link-secondary"
						href={VOLUNTEER_AGREEMENT_URL}
						target="_blank"
						rel="noreferrer"
					>
						Open the Volunteer Agreement in a new tab
					</a>
				</p>
				{/* The question above the agreement is this group's visible label, so the
				    legend repeats it for screen readers only. */}
				<RadioGroup
					label={AGREEMENT_QUESTION}
					labelClassName="sr-only"
					options={VOLUNTEER_AGREEMENT_OPTIONS}
					error={errors.agreementAccepted?.message}
					{...register("agreementAccepted")}
				/>
			</section>

			<section className="mt-8">
				<h3 className="text-sm font-semibold text-neutral">{POLICE_CHECK_QUESTION}</h3>
				<RadioGroup
					label={POLICE_CHECK_QUESTION}
					labelClassName="sr-only"
					options={POLICE_CHECK_CONSENT_OPTIONS}
					error={errors.policeCheckConsent?.message}
					{...register("policeCheckConsent")}
				/>
			</section>

			<section className="mt-8">
				<h3 className="text-sm font-semibold text-neutral">{REFERRAL_SOURCE_QUESTION}</h3>
				<fieldset
					className="mt-4 space-y-1"
					aria-describedby={errors.referralSources ? REFERRAL_SOURCE_ERROR_ID : undefined}
				>
					<legend className="sr-only">{REFERRAL_SOURCE_QUESTION}</legend>
					{REFERRAL_SOURCE_OPTIONS.map((option) => (
						<Checkbox
							key={option.value}
							label={option.label}
							value={option.value}
							{...register("referralSources")}
						/>
					))}
				</fieldset>
				{/* One message under the group, rather than one repeated beside every box. */}
				{errors.referralSources && (
					<p id={REFERRAL_SOURCE_ERROR_ID} className="label text-error">
						{errors.referralSources.message}
					</p>
				)}
			</section>

			<section className="mt-8">
				<h3 className="text-sm font-semibold text-neutral">
					Receiving newsletters and updates from Medical Pantry
				</h3>
				<div className="mt-4">
					<Checkbox
						label="I would like to receive future newsletters and update emails about Medical Pantry"
						{...register("newsletterOptIn")}
					/>
				</div>
			</section>
		</>
	)
}
