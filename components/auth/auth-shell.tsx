import Link from "next/link"
import type { ReactNode } from "react"

interface AuthShellProps {
	children: ReactNode
	description: string
	title: string
}

export function AuthShell({ children, description, title }: AuthShellProps) {
	return (
		<main className="grid min-h-screen bg-base-200 lg:grid-cols-[minmax(0,0.9fr)_minmax(34rem,1.1fr)]">
			<section className="relative hidden overflow-hidden bg-primary px-12 py-10 text-primary-content lg:flex lg:flex-col lg:justify-between">
				<div
					className="absolute -top-32 -right-32 h-96 w-96 rounded-full border-[5rem] border-secondary/35"
					aria-hidden="true"
				/>
				<Link href="/" className="relative z-10 inline-flex w-fit flex-col">
					<span className="text-xs font-semibold tracking-[0.2em] text-primary-content/70 uppercase">
						Medical Pantry
					</span>
					<span className="text-3xl font-bold">Medimate</span>
				</Link>

				<div className="relative z-10 max-w-xl pb-16">
					<p className="text-sm font-semibold tracking-[0.15em] text-primary-content/70 uppercase">
						Make a practical difference
					</p>
					<h2 className="mt-4 text-4xl leading-tight xl:text-5xl">
						Help good food reach the people who need it.
					</h2>
					<p className="mt-6 max-w-lg leading-7 text-primary-content/75">
						Join Medical Pantry&apos;s volunteer community and stay connected with upcoming
						opportunities.
					</p>
				</div>
			</section>

			<section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
				<div className="w-full max-w-md">
					<Link href="/" className="mb-9 inline-flex flex-col lg:hidden">
						<span className="text-[0.65rem] font-semibold tracking-[0.2em] text-secondary uppercase">
							Medical Pantry
						</span>
						<span className="text-2xl font-bold text-primary">Medimate</span>
					</Link>

					<div className="card border border-base-300 bg-base-100 shadow-sm">
						<div className="card-body gap-6 p-6 sm:p-8">
							<header>
								<h1 className="text-3xl text-primary">{title}</h1>
								<p className="mt-2 text-sm leading-6 text-base-content/65">{description}</p>
							</header>
							{children}
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
