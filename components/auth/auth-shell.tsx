import Link from "next/link"
import type { ReactNode } from "react"

interface AuthShellProps {
	children: ReactNode
	compact?: boolean
	description?: string
	showFooter?: boolean
	title: string
}

function MedicalPantryMark() {
	return (
		<span className="grid size-8 shrink-0 rotate-45 grid-cols-2 gap-1" aria-hidden="true">
			<span className="rounded-[2px] bg-accent" />
			<span className="rounded-[2px] bg-accent" />
			<span className="rounded-[2px] bg-accent" />
			<span className="rounded-[2px] bg-accent" />
		</span>
	)
}

export function AuthShell({
	children,
	compact = false,
	description,
	showFooter = true,
	title,
}: AuthShellProps) {
	return (
		<main className="flex min-h-dvh flex-col bg-base-100 text-neutral">
			<header className="flex h-28 shrink-0 items-center justify-between bg-primary px-5 text-primary-content sm:px-8 lg:px-12">
				<Link href="/" className="flex items-center gap-3" aria-label="Medical Pantry home">
					<MedicalPantryMark />
					<span className="text-base font-bold sm:text-lg">Medical Pantry</span>
				</Link>
				<Link href="/" className="text-xl font-bold sm:text-2xl">
					MediMate
				</Link>
			</header>

			<section
				className={`flex flex-1 justify-center px-5 ${
					compact ? "pt-12 pb-16 sm:pt-14" : "pt-14 pb-14 sm:pt-24 lg:pt-32"
				}`}
			>
				<div className="w-full max-w-xl">
					<h1 className="mx-auto max-w-lg text-center text-2xl leading-tight font-bold text-neutral sm:text-[1.65rem]">
						{title}
					</h1>
					{description ? (
						<p className="mx-auto mt-3 max-w-md text-center text-sm text-neutral/65">
							{description}
						</p>
					) : null}
					<div className="mx-auto mt-3 w-full max-w-[22rem]">{children}</div>
				</div>
			</section>

			{showFooter && (
				<footer className="shrink-0 px-5 pt-4 pb-5 text-center text-xs text-neutral">
					© 2026 Medical Pantry. All rights reserved.
				</footer>
			)}
		</main>
	)
}
