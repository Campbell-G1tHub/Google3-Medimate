"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { AcknowledgementStep } from "@/components/onboarding/steps/acknowledgement-step"
import { PersonalDetailsStep } from "@/components/onboarding/steps/personal-details-step"
import { RefereesStep } from "@/components/onboarding/steps/referees-step"
import { VolunteerInterestsStep } from "@/components/onboarding/steps/volunteer-interests-step"
import { Button } from "@/components/ui/button"
import type { OnboardingFormValues } from "@/lib/validation/onboarding"
import type { ApplicationDetail } from "@/lib/volunteer-applications"

type Decision = "APPROVED" | "REJECTED"

const REVIEW_API = "/api/admin/volunteer-applications/review"

const DECISION_COPY = {
	APPROVED: {
		icon: "/icons/application_approve.svg",
		confirmTitle: "Approve Application?",
		confirmText: (name: string) => <>You're about to approve the application for "{name}"</>,
		action: "Approve",
		doneTitle: "Application Approved",
		doneText: (name: string) => <>"{name}" is now a volunteer and can access MediMate</>,
	},
	REJECTED: {
		icon: "/icons/application_reject.svg",
		confirmTitle: "Reject Application?",
		confirmText: (name: string) => <>You're about to reject the application for "{name}"</>,
		action: "Reject",
		doneTitle: "Application Rejected",
		doneText: (name: string) => <>Volunteer application for "{name}" has been rejected.</>,
	},
} as const

interface ApplicationReviewProps {
	applicationId: string
	onClose: () => void
	onReviewed: () => void
}

export function ApplicationReview({ applicationId, onClose, onReviewed }: ApplicationReviewProps) {
	const reviewRef = useRef<HTMLDialogElement>(null)
	const confirmRef = useRef<HTMLDialogElement>(null)
	const successRef = useRef<HTMLDialogElement>(null)
	const bodyRef = useRef<HTMLDivElement>(null)
	const [application, setApplication] = useState<ApplicationDetail | null>(null)
	const [loadError, setLoadError] = useState("")
	const [decision, setDecision] = useState<Decision | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [reviewError, setReviewError] = useState("")
	const methods = useForm<OnboardingFormValues>({ values: application?.answers })

	useEffect(() => {
		reviewRef.current?.showModal()
		// Focus the content rather than the close button, which would show a focus ring on open
		bodyRef.current?.focus()
	}, [])

	useEffect(() => {
		const controller = new AbortController()

		fetch(`/api/admin/volunteer-applications/${applicationId}`, { signal: controller.signal })
			.then(async (response) => {
				const data = await response.json()
				if (!response.ok) {
					throw new Error(data.error ?? "That application could not be loaded.")
				}
				setApplication(data.application)
			})
			.catch((error: Error) => {
				if (!controller.signal.aborted) {
					setLoadError(error.message)
				}
			})

		return () => controller.abort()
	}, [applicationId])

	function confirm(nextDecision: Decision) {
		setDecision(nextDecision)
		setReviewError("")
		confirmRef.current?.showModal()
	}

	async function submitDecision() {
		if (!decision) {
			return
		}

		setIsSubmitting(true)
		try {
			const response = await fetch(REVIEW_API, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ applicationId, decision }),
			})
			const data = await response.json().catch(() => ({}))
			confirmRef.current?.close()

			if (!response.ok) {
				setReviewError(data.error ?? "The decision could not be saved. Please try again.")
				if (response.status === 409) {
					onReviewed()
				}
				return
			}

			successRef.current?.showModal()
		} catch {
			confirmRef.current?.close()
			setReviewError("We couldn't reach the server. Check your connection and try again.")
		} finally {
			setIsSubmitting(false)
		}
	}

	function finish() {
		onReviewed()
		onClose()
	}

	const name = application?.fullName ?? ""
	const copy = decision ? DECISION_COPY[decision] : null
	const isPending = application?.status === "PENDING"

	return (
		<>
			<dialog
				ref={reviewRef}
				className="modal"
				aria-labelledby="review-application-title"
				onClose={onClose}
			>
				<div className="modal-box flex max-h-[90vh] w-11/12 max-w-3xl flex-col overflow-hidden border border-primary p-0!">
					<header className="flex items-center justify-between gap-3 bg-primary px-5 py-3 text-primary-content">
						<h2 id="review-application-title" className="text-lg">
							Review Volunteer Application
						</h2>
						<button
							type="button"
							onClick={() => reviewRef.current?.close()}
							className="btn btn-square btn-primary border-none shadow-none"
							aria-label="Close"
						>
							<Image src="/icons/close.svg" alt="" width={40} height={40} />
						</button>
					</header>

					<div ref={bodyRef} tabIndex={-1} className="grow overflow-y-auto px-5 pb-6 outline-none">
						{loadError ? (
							<div role="alert" className="alert alert-error alert-soft mt-5 text-sm">
								{loadError}
							</div>
						) : !application ? (
							<div className="flex justify-center py-12">
								<span className="loading loading-spinner loading-md text-primary" />
							</div>
						) : (
							<>
								<h3 className="mt-4 text-2xl text-primary">{name}'s Application</h3>
								{!isPending && (
									<p className="mt-2 text-sm text-base-content/70">
										This application was {application.status.toLowerCase()}
										{application.reviewedAt &&
											` on ${new Date(application.reviewedAt).toLocaleDateString("en-AU")}`}
										.
									</p>
								)}
								<FormProvider {...methods}>
									<fieldset disabled className="min-w-0">
										<PersonalDetailsStep />
										<VolunteerInterestsStep />
										<RefereesStep />
										<AcknowledgementStep showAgreement={false} />
									</fieldset>
								</FormProvider>
							</>
						)}
					</div>

					{isPending && (
						<footer className="flex flex-col gap-3 border-t border-base-300 px-5 py-4">
							{reviewError && (
								<div role="alert" className="alert alert-error alert-soft text-sm">
									{reviewError}
								</div>
							)}
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() => confirm("REJECTED")}
									className="btn btn-outline btn-accent rounded-full shadow-none"
								>
									Reject
								</button>
								<Button variant="accent" onClick={() => confirm("APPROVED")}>
									Approve
								</Button>
							</div>
						</footer>
					)}
				</div>
			</dialog>

			<dialog ref={confirmRef} className="modal" aria-labelledby="confirm-decision-title">
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					{copy && <Image src={copy.icon} alt="" width={48} height={48} />}
					<h2 id="confirm-decision-title" className="text-lg text-primary">
						{copy?.confirmTitle}
					</h2>
					<p className="text-sm">{copy?.confirmText(name)}</p>
					<div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
						<button
							type="button"
							className="btn btn-outline btn-accent rounded-full shadow-none"
							onClick={() => confirmRef.current?.close()}
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<Button variant="accent" onClick={submitDecision} loading={isSubmitting}>
							{copy?.action}
						</Button>
					</div>
				</div>
			</dialog>

			<dialog
				ref={successRef}
				className="modal"
				aria-labelledby="decision-saved-title"
				onClose={finish}
			>
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					<Image src="/icons/check.svg" alt="" width={40} height={40} />
					<h2 id="decision-saved-title" className="text-lg text-primary">
						{copy?.doneTitle}
					</h2>
					<p className="text-sm">{copy?.doneText(name)}</p>
					<Button
						variant="accent"
						className="mt-2 w-full sm:w-40"
						onClick={() => successRef.current?.close()}
					>
						Done
					</Button>
				</div>
			</dialog>
		</>
	)
}
