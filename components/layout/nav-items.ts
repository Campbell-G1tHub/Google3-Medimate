import { House, type LucideIcon, MailOpen, Search, Settings, Shield, User } from "lucide-react"

export interface NavItem {
	label: string
	href: string
	icon: LucideIcon
	/** Only rendered for admins; the route itself is guarded by `proxy.ts`. */
	adminOnly?: boolean
}

/**
 * Shared by the desktop sidebar and the mobile bottom bar, so both navs always list the
 * same destinations in the same order. Routes without a page yet still render as links;
 * they 404 until their page is added.
 */
export const NAV_ITEMS: NavItem[] = [
	{ label: "Dashboard", href: "/home", icon: House },
	{ label: "Opportunities", href: "/opportunities", icon: Search },
	{ label: "Inbox", href: "/inbox", icon: MailOpen },
	{ label: "Profile", href: "/profile", icon: User },
	{
		label: "Admin",
		href: "/dashboard/admin/send-announcement",
		icon: Shield,
		adminOnly: true,
	},
	{ label: "Settings", href: "/settings", icon: Settings },
]

/** `/home` is active on `/home` only; `/dashboard/admin` stays active on its child pages. */
export function isActiveRoute(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`)
}
