import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Home() {
	return (
		<main className="min-h-screen bg-base-200">
			<header className="border-b border-base-300 bg-base-100">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
					<div>
						<p className="text-xs font-semibold tracking-[0.18em] text-secondary uppercase">
							Medical Pantry
						</p>
						<p className="text-xl font-bold text-primary">Medimate</p>
					</div>
					<span className="badge badge-success badge-soft">Foundation ready</span>
				</div>
			</header>

			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
				<section className="grid items-center gap-8 rounded-box bg-primary px-6 py-10 text-primary-content shadow-sm sm:px-10 lg:grid-cols-[1.35fr_0.65fr] lg:px-12 lg:py-14">
					<div className="max-w-2xl">
						<span className="badge badge-accent mb-5">Frontend setup</span>
						<h1 className="text-3xl leading-tight sm:text-4xl lg:text-5xl">
							A consistent foundation for the Medimate experience.
						</h1>
						<p className="mt-5 max-w-xl text-sm leading-7 text-primary-content/80 sm:text-base">
							Tailwind CSS and daisyUI now share Medical Pantry&apos;s brand palette, Poppins
							typography, and reusable interface patterns.
						</p>
						<div className="mt-7 flex flex-col gap-3 sm:flex-row">
							<Button variant="accent">Primary action</Button>
							<Button className="border-primary-content/40 text-primary-content hover:bg-primary-content/10">
								Secondary action
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
						{[
							["Navy", "bg-brand-navy"],
							["Blue", "bg-brand-blue"],
							["Red", "bg-brand-red"],
						].map(([label, colour]) => (
							<div
								key={label}
								className={`${colour} rounded-box border border-white/25 p-4 text-center text-sm text-white`}
							>
								{label}
							</div>
						))}
					</div>
				</section>

				<section aria-labelledby="components-heading">
					<div className="mb-5">
						<p className="text-sm font-semibold text-secondary">Reusable patterns</p>
						<h2 id="components-heading" className="mt-1 text-2xl text-primary sm:text-3xl">
							Core components
						</h2>
					</div>

					<div className="grid gap-5 lg:grid-cols-3">
						<Card
							title="Buttons"
							description="Semantic variants keep actions consistent across features."
						>
							<div className="flex flex-wrap gap-3">
								<Button>Primary</Button>
								<Button variant="secondary">Secondary</Button>
								<Button variant="accent">Accent</Button>
								<Button variant="ghost">Ghost</Button>
							</div>
						</Card>

						<Card
							title="Inputs"
							description="Labels, guidance, and validation remain close to their controls."
						>
							<Input
								id="foundation-email"
								name="email"
								type="email"
								label="Email address"
								placeholder="name@example.com"
								hint="We will only use this for account updates."
							/>
						</Card>

						<Card
							title="Cards"
							description="Cards group related content without imposing feature-specific layout."
							footer={<Button variant="outline">View details</Button>}
						>
							<div className="flex items-center gap-3">
								<span className="status status-success" aria-hidden="true" />
								<p className="text-sm text-base-content/70">
									Responsive, accessible, and theme-aware.
								</p>
							</div>
						</Card>
					</div>
				</section>
			</div>
		</main>
	)
}
