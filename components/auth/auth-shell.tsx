import type { ReactNode } from "react"

interface AuthShellProps {
	children: ReactNode
	compact?: boolean
	description?: string
	title: string
}

export function AuthShell({
	children,
	compact = false,
	description,
	title,
}: AuthShellProps) {
	return (
		<div className="flex min-h-dvh flex-col bg-base-100 text-neutral">
			<section
				className={`flex flex-1 justify-center px-5 ${compact ? "pt-12 pb-16 sm:pt-14" : "pt-14 pb-14 sm:pt-24 lg:pt-32"
					}`}
			>
				<div className="w-full max-w-xl">
					<h1 className="mx-auto max-w-lg text-center text-2xl font-bold text-neutral">
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
		</div>
	)
}
