"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { LogoutButton } from "./logout-button"
import { isActiveRoute, NAV_ITEMS, type NavItem } from "./nav-items"

/** TODO: The real profile photo is not implemented yet; swap this for the user's avatar. */
const PLACEHOLDER_AVATAR_SRC = "/icons/icon-transparent.png"

export interface ShellUser {
	name: string
	email: string
	isAdmin: boolean
}

interface AppShellProps {
	children: ReactNode
	user: ShellUser
}


export function AppShell({ children, user }: AppShellProps) {
	const pathname = usePathname()
	const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || user.isAdmin)

	return (
		<div className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:flex-row">
			{/* Navbar */}
			<aside className="hidden w-64 shrink-0 flex-col border-r border-base-300 px-4 py-6 lg:flex">
				<ProfileSummary user={user} />
				<nav aria-label="Main" className="mt-8 flex flex-col gap-1">
					{navItems.map((item) => (
						<SidebarLink
							key={item.href}
							item={item}
							isActive={isActiveRoute(pathname, item.href)}
						/>
					))}
				</nav>
				<div className="mt-auto pt-8">
					<LogoutButton />
				</div>
			</aside>
			
			{/* Logout button in mobile mode */}
			<div className="flex min-w-0 flex-1 flex-col">
				<div className="sticky top-0 z-30 flex items-center justify-end border-b border-base-300 bg-base-100 px-5 py-2 lg:hidden">
					<LogoutButton variant="compact" />
				</div>
				<div className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</div>
			</div>

			<nav
				aria-label="Main"
				className="fixed inset-x-0 bottom-0 z-40 border-t border-base-300 bg-base-100 pb-[env(safe-area-inset-bottom)] lg:hidden"
			>
				<ul className="flex">
					{navItems.map((item) => (
						<BottomBarLink
							key={item.href}
							item={item}
							isActive={isActiveRoute(pathname, item.href)}
						/>
					))}
				</ul>
			</nav>
		</div>
	)
}

function ProfileSummary({ user }: { user: ShellUser }) {
	return (
		<div className="flex flex-col items-center text-center">
			<span className="flex size-20 items-center justify-center rounded-full border border-base-300 bg-base-100 p-2">
				<Image
					src={PLACEHOLDER_AVATAR_SRC}
					alt=""
					width={64}
					height={64}
					className="size-full object-contain"
				/>
			</span>
			{user.name && <p className="mt-3 text-sm font-semibold text-primary">{user.name}</p>}
			<p className="text-xs break-all text-base-content/60">{user.email}</p>
		</div>
	)
}

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
	const Icon = item.icon

	return (
		<Link
			href={item.href}
			aria-current={isActive ? "page" : undefined}
			className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm ${
				isActive
					? "bg-primary font-semibold text-primary-content"
					: "font-medium text-primary hover:bg-base-200"
			}`}
		>
			<Icon className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
			{item.label}
		</Link>
	)
}

function BottomBarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
	const Icon = item.icon

	return (
		<li className="flex-1">
			<Link
				href={item.href}
				aria-label={item.label}
				aria-current={isActive ? "page" : undefined}
				className={`flex h-14 items-center justify-center ${
					isActive ? "bg-primary text-primary-content" : "text-primary hover:bg-base-200"
				}`}
			>
				<Icon className="size-6" aria-hidden="true" strokeWidth={1.75} />
			</Link>
		</li>
	)
}
