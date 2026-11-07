"use client"

import type { ReactNode, SVGProps } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "@/lib/auth-client"

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="24"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2.5"
			viewBox="0 0 24 24"
			width="24"
			{...props}
		>
			{children}
		</svg>
	)
}

function UserAvatar() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="104"
			stroke="currentColor"
			strokeWidth="2.5"
			viewBox="0 0 104 104"
			width="104"
		>
			<circle cx="52" cy="52" r="50" />
			<circle cx="52" cy="34" r="17" />
			<path d="M20 91c0-17 14-27 32-27s32 10 32 27" />
		</svg>
	)
}

function SettingsIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="26"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2.25"
			viewBox="0 0 24 24"
			width="26"
		>
			<circle cx="12" cy="12" r="3" />
			<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" />
		</svg>
	)
}

const navigation = [
	{
		href: "/home",
		label: "Dashboard",
		icon: (
			<Icon>
				<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z" />
				<path d="M9 21v-6h6v6" />
			</Icon>
		),
	},
	{
		href: "/opportunities",
		label: "Opportunities",
		icon: (
			<Icon>
				<circle cx="11" cy="11" r="6" />
				<path d="m20 20-4-4" />
			</Icon>
		),
	},
	{
		href: "/inbox",
		label: "Inbox",
		icon: (
			<Icon>
				<path d="M4 5h16l2 8v6H2v-6l2-8Z" />
				<path d="M2 13h5l2 3h6l2-3h5" />
			</Icon>
		),
	},
	{
		href: "/profile",
		label: "Profile",
		icon: (
			<Icon>
				<circle cx="12" cy="8" r="4" />
				<path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
			</Icon>
		),
	},
	{
		href: "/settings",
		label: "Setting",
		icon: <SettingsIcon />,
	},
]

export function VolunteerSidebar() {
	const pathname = usePathname()
	const router = useRouter()
	const { data: session } = useSession()
	return (
		<aside className="hidden min-h-[calc(100vh-3.5rem)] w-[215px] shrink-0 border-r border-primary/30 bg-white px-[15px] py-[15px] md:flex md:flex-col">
			<div className="flex h-[172px] flex-col items-center justify-center gap-2 rounded-[20px] px-2.5 py-2.5 text-center text-black">
				<UserAvatar />
				<div className="max-w-[150px] leading-tight">
					<p className="truncate text-sm font-semibold">{session?.user.name || "Name Surname"}</p>
					<p className="truncate text-xs font-semibold">
						{session?.user.email || "example@gmail.com"}
					</p>
				</div>
			</div>
			<nav aria-label="Volunteer navigation" className="mt-2.5 flex flex-col gap-2.5">
				{navigation.map((item) => {
					const active = pathname === item.href
					return (
						<Link
							aria-current={active ? "page" : undefined}
							className={`flex h-11 items-center gap-1.5 rounded-[20px] px-2.5 text-sm font-bold transition-colors ${active ? "bg-primary text-white" : "text-primary hover:bg-primary/10"}`}
							href={item.href}
							key={item.href}
						>
							{item.icon}
							<span>{item.label}</span>
						</Link>
					)
				})}
			</nav>
			<button
				className="mt-auto flex h-11 w-[149px] items-center gap-2 rounded-[20px] px-2.5 text-sm font-bold text-accent hover:bg-accent/10"
				onClick={() => void signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })}
				type="button"
			>
				<Icon>
					<path d="M10 17l5-5-5-5M15 12H3M21 4v16" />
				</Icon>
				Log out
			</button>
		</aside>
	)
}
