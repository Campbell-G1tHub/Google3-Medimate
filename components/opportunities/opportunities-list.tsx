"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export interface Opportunity {
	id: string
	title: string
	description: string
	location: string | null
	startsAt: string | null
	endsAt: string | null
	status: string
	signedUp: boolean
}

interface OpportunitiesListProps {
	initialOpportunities: Opportunity[]
}

function formatDateTime(value: string | null) {
	if (!value) {
		return "Time to be confirmed"
	}

	return new Intl.DateTimeFormat("en-AU", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value))
}

export function OpportunitiesList({ initialOpportunities }: OpportunitiesListProps) {
	const [opportunities, setOpportunities] = useState(initialOpportunities)
	const [error, setError] = useState("")
	const [signingUpFor, setSigningUpFor] = useState<string>()

	async function signUp(eventId: string) {
		setError("")
		setSigningUpFor(eventId)

		try {
			const response = await fetch(`/api/events/${eventId}/sign-up`, { method: "POST" })
			const result = (await response.json()) as { error?: string }

			if (!response.ok) {
				throw new Error(result.error ?? "Unable to sign up for this opportunity.")
			}

			setOpportunities((current) =>
				current.map((opportunity) =>
					opportunity.id === eventId ? { ...opportunity, signedUp: true } : opportunity,
				),
			)
		} catch (signUpError) {
			setError(
				signUpError instanceof Error
					? signUpError.message
					: "Unable to sign up for this opportunity.",
			)
		} finally {
			setSigningUpFor(undefined)
		}
	}

	return (
		<main className="min-h-screen bg-base-200 px-5 py-10">
			<section className="mx-auto max-w-5xl">
				<p className="font-semibold text-secondary text-sm uppercase tracking-[0.16em]">
					Medical Pantry
				</p>
				<h1 className="mt-2 text-4xl text-primary">Volunteer opportunities</h1>
				<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
					<p className="max-w-2xl text-base-content/70">
						Find an upcoming opportunity and register your interest.
					</p>
					<Link href="/my-events" className="btn btn-outline btn-sm">
						My events
					</Link>
				</div>

				{error && <p className="alert alert-error mt-6">{error}</p>}

				{opportunities.length === 0 ? (
					<Card
						className="mt-8"
						title="No open opportunities right now"
						description="Please check back soon for new Medical Pantry volunteer shifts."
					>
						<p className="text-sm text-base-content/65">New opportunities will appear here.</p>
					</Card>
				) : (
					<div className="mt-8 grid gap-5 md:grid-cols-2">
						{opportunities.map((opportunity) => (
							<Card
								key={opportunity.id}
								title={opportunity.title}
								description={opportunity.description}
								footer={
									opportunity.signedUp ? (
										<span className="badge badge-success badge-soft">Signed up</span>
									) : (
										<Button
											onClick={() => void signUp(opportunity.id)}
											loading={signingUpFor === opportunity.id}
											disabled={signingUpFor !== undefined}
										>
											Sign up
										</Button>
									)
								}
							>
								<dl className="space-y-2 text-sm">
									<div>
										<dt className="font-semibold">When</dt>
										<dd>{formatDateTime(opportunity.startsAt)}</dd>
										{opportunity.endsAt && <dd>Ends {formatDateTime(opportunity.endsAt)}</dd>}
									</div>
									<div>
										<dt className="font-semibold">Where</dt>
										<dd>{opportunity.location ?? "Location to be confirmed"}</dd>
									</div>
								</dl>
							</Card>
						))}
					</div>
				)}
			</section>
		</main>
	)
}
