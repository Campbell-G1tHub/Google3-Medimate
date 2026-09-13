import Image from "next/image"

export function SiteHeader() {
	return (
		<header className="bg-primary text-primary-content">
			<div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
				<div className="flex items-center gap-2">
					<Image src="/icon-transparent.png" alt="Medical Pantry" width={28} height={28} priority />
					<span className="text-sm font-semibold sm:text-base">Medical Pantry</span>
				</div>
				<span className="text-lg font-bold sm:text-xl">MediMate</span>
			</div>
		</header>
	)
}
