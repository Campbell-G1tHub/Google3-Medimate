import { headers } from "next/headers"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import { auth } from "@/lib/auth"

export default async function OnboardingPage() {
	const session = await auth.api.getSession({ headers: await headers() })

	return (
		<div className="mx-auto w-full max-w-xl px-5 py-10">
			<OnboardingForm defaultEmail={session?.user.email ?? ""}>
				<p>Thank you for your interest in volunteering with Medical Pantry!</p>
				<p>
					We believe volunteers are integral to the daily operations of the Medical Pantry and are
					central to our ability to continue to deliver a high quality and impactful service. Our
					volunteers play key roles in a number of our positions, such as digital communications,
					fundraising, database maintenance and entry and assisting with tasks in our warehouse such
					as physically sorting and packing medical supplies for our charity partners.
				</p>
				<p>
					Being a Volunteer involves attending regular programs with our Medical Pantry Members. We
					offer flexibility in the number of programs you choose to attend, and hope that you can
					make a significant time commitment to this worthy cause. While there is flexibility in
					regard to the number of programs you choose to attend throughout the year and for how
					long, we do ask - due to the nature and process of becoming a volunteer - that you intend
					to make a significant time commitment and that you have carefully considered your ability
					to balance other personal commitments.
				</p>
			</OnboardingForm>
		</div>
	)
}
