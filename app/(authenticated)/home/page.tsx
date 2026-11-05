"use client"

import { NotificationBell } from "@/components/notifications/notification-bell"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"

export default function Page() {
	const { data: session, isPending } = useSession()

	return (
		<div className="px-5 py-8 sm:px-8">
			<header className="flex items-center justify-between gap-3">
				<h1 className="text-3xl text-primary">Dashboard</h1>
				<NotificationBell />
			</header>

			<section className="card mt-6 w-full max-w-lg border border-base-300 bg-base-100 shadow-sm">
				<div className="card-body gap-6 p-7 sm:p-9">
					<div>
						<p className="text-xs font-semibold tracking-[0.18em] text-secondary uppercase">
							Medical Pantry
						</p>
						<h2 className="mt-1 text-2xl text-primary">Your MediMate account</h2>
					</div>

					{isPending ? (
						<div className="flex items-center gap-3 text-sm text-base-content/65">
							<span className="loading loading-spinner loading-sm" />
							Loading your session…
						</div>
					) : session ? (
						<div className="rounded-box border border-base-300 bg-base-200 p-5">
							<p className="font-semibold text-primary">{session.user.name}</p>
							<p className="mt-1 text-sm text-base-content/65">{session.user.email}</p>
							<span className="badge badge-success badge-soft mt-4">Signed in</span>
						</div>
					) : (
						<>
							<div className="alert alert-warning">
								<span>Your session has expired. Sign in to continue.</span>
							</div>
							<Button to="/login" variant="accent" fullWidth>
								Go to sign in
							</Button>
						</>
					)}
				</div>
			</section>
		</div>
	)
}
