import type { Metadata } from "next"
import { headers } from "next/headers"
import Image from "next/image"
import { redirect } from "next/navigation"
import { BackToLoginButton } from "@/components/onboarding/back-to-login-button"
import { auth } from "@/lib/auth"
import { getApplicationStatus, hasAppAccess } from "@/lib/volunteer-access"

export const metadata: Metadata = {
	title: "Application status | MediMate",
}

export default async function ApplicationStatusPage() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session) {
		redirect("/login")
	}
	if (!session.user.onboardingCompleted) {
		redirect("/onboarding")
	}

	if (await hasAppAccess(session.user)) {
		redirect("/home")
	}

	const isRejected = (await getApplicationStatus(session.user.id)) === "REJECTED"

	return (
		<div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 px-5 py-8 text-center">
			<h1 className="text-2xl font-bold text-neutral">
				{isRejected
					? "Medical Pantry Volunteer Application Unsuccessful"
					: "Medical Pantry Volunteer Application Form Submitted"}
			</h1>

			{isRejected ? (
				<p className="text-sm leading-6">
					Thank you for your interest in volunteering with Medical Pantry. Unfortunately your
					application was not approved this time.
				</p>
			) : (
				<div className="space-y-4 text-sm leading-6">
					<p>Thanks for applying!</p>
					<p>
						We've received your Medical Pantry volunteer application. Our team will review it and
						notify you once it has been processed
					</p>
				</div>
			)}

			<Image
				src="/team.png"
				alt="Medical Pantry volunteers in front of a delivery truck"
				width={418}
				height={236}
				priority
				className="h-auto w-full max-w-sm rounded-box border-2 border-primary"
			/>

			<BackToLoginButton />
		</div>
	)
}
