"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "@/lib/auth-client"

export default function AccountPage() {
	const router = useRouter()
	const { data: session, isPending } = useSession()

	async function handleSignOut() {
		await signOut()
		router.push("/login")
		router.refresh()
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-base-200 px-5 py-10">
			<section className="card w-full max-w-lg border border-base-300 bg-base-100 shadow-sm">
				<div className="card-body gap-6 p-7 sm:p-9">
					<div>
						<p className="text-xs font-semibold tracking-[0.18em] text-secondary uppercase">
							Medical Pantry
						</p>
						<h1 className="mt-1 text-3xl text-primary">Your MediMate account</h1>
					</div>

					{isPending ? (
						<div className="flex items-center gap-3 text-sm text-base-content/65">
							<span className="loading loading-spinner loading-sm" />
							Loading your session…
						</div>
					) : session ? (
						<>
							<div className="rounded-box border border-base-300 bg-base-200 p-5">
								<p className="font-semibold text-primary">{session.user.name}</p>
								<p className="mt-1 text-sm text-base-content/65">{session.user.email}</p>
								<span className="badge badge-success badge-soft mt-4">Signed in</span>
							</div>
							<Button onClick={handleSignOut} variant="outline" fullWidth>
								Sign out
							</Button>
						</>
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
		</main>
	)
}
