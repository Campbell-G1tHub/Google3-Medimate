"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"

export function BackToLoginButton() {
	const router = useRouter()
	const [isSigningOut, setIsSigningOut] = useState(false)

	async function handleClick() {
		setIsSigningOut(true)
		await signOut()
		router.push("/login")
		router.refresh()
	}

	return (
		<Button variant="accent" onClick={handleClick} loading={isSigningOut}>
			Back to login
		</Button>
	)
}
