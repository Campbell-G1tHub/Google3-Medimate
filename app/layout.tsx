import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import Image from "next/image"
import "./globals.css"
import Link from "next/link"

const poppins = Poppins({
	variable: "--font-poppins",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
})

export const metadata: Metadata = {
	title: "MediMate | Medical Pantry",
	description: "Medical Pantry's inventory and redistribution platform.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			data-theme="medical-pantry"
			className={`${poppins.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<header className="flex h-14 shrink-0 items-center justify-between bg-primary px-5 text-primary-content sm:px-8 lg:px-12">
					<Link href="/" className="flex items-center gap-3" aria-label="Medical Pantry home">
						<Image src="/icons/icon-transparent.png" alt="" height={30} width={30} />
						<span className="text-base font-bold sm:text-lg">Medical Pantry</span>
					</Link>
					<Link href="/" className="text-xl font-bold sm:text-2xl">
						MediMate
					</Link>
				</header>
				<main>
					{children}
				</main>
			</body>
		</html>
	)
}
