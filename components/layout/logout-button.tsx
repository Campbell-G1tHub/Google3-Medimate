"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signOut } from "@/lib/auth-client"

interface LogoutButtonProps {
	/** `compact` is the small variant used in the mobile sub-bar. */
	variant?: "sidebar" | "compact"
}

const VARIANT_CLASSES = {
	sidebar: "w-full px-4 py-2.5 text-sm",
	compact: "px-3 py-1.5 text-xs",
} as const

export function LogoutButton({ variant = "sidebar" }: LogoutButtonProps) {
	const router = useRouter()
	const [isPending, setIsPending] = useState(false)

	async function handleSignOut() {
		setIsPending(true)

		try {
			await signOut()
			router.push("/login")
			router.refresh()
		} catch {
			setIsPending(false)
		}
	}

	return (
		<button
			type="button"
			onClick={handleSignOut}
			disabled={isPending}
			aria-busy={isPending || undefined}
			className={`flex items-center gap-2 rounded-full font-semibold text-accent hover:bg-base-200 disabled:opacity-70 ${VARIANT_CLASSES[variant]}`}
		>
			{isPending ? (
				<span className="loading loading-spinner loading-xs" aria-hidden="true" />
			) : (
				<LogOut className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
			)}
			<span>Log out</span>
		</button>
	)
}
