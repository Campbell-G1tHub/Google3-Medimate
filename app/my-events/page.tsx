import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function formatDateTime(value: Date | null) {
	if (!value) {
		return "Time to be confirmed"
	}

	return new Intl.DateTimeFormat("en-AU", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(value)
}

export default async function MyEventsPage() {
	const session = await auth.api.getSession({ headers: await headers() })

	if (!session) {
		redirect("/login")
	}

	const registrations = await prisma.eventAttendee.findMany({
		where: { volunteerId: session.user.id },
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			status: true,
			event: {
				select: {
					id: true,
					title: true,
					description: true,
					location: true,
					startsAt: true,
					endsAt: true,
					status: true,
				},
			},
		},
	})

	return (
		<main className="min-h-screen bg-base-200 px-5 py-10">
			<section className="mx-auto max-w-5xl">
				<p className="font-semibold text-secondary text-sm uppercase tracking-[0.16em]">
					Medical Pantry
				</p>
				<h1 className="mt-2 text-4xl text-primary">My events</h1>
				<p className="mt-3 max-w-2xl text-base-content/70">
					Your registered Medical Pantry volunteer opportunities.
				</p>

				{registrations.length === 0 ? (
					<Card
						className="mt-8"
						title="You have not signed up for an opportunity yet"
						description="Browse the current volunteer opportunities to find a shift that suits you."
					>
						<Link href="/opportunities" className="btn btn-primary mt-5">
							Browse opportunities
						</Link>
					</Card>
				) : (
					<div className="mt-8 grid gap-5 md:grid-cols-2">
						{registrations.map(({ id, status, event }) => (
							<Card
								key={id}
								title={event.title}
								description={event.description}
								footer={
									<span className="badge badge-success badge-soft">
										{status === "ATTENDING" ? "Registered" : "Not attending"}
									</span>
								}
							>
								<dl className="space-y-2 text-sm">
									<div>
										<dt className="font-semibold">When</dt>
										<dd>{formatDateTime(event.startsAt)}</dd>
										{event.endsAt && <dd>Ends {formatDateTime(event.endsAt)}</dd>}
									</div>
									<div>
										<dt className="font-semibold">Where</dt>
										<dd>{event.location ?? "Location to be confirmed"}</dd>
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
