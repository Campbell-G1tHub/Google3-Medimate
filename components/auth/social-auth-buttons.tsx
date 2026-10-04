"use client"

import Image from "next/image"
import { useState } from "react"
import { signIn } from "@/lib/auth-client"
import type { SocialProvider } from "@/lib/oauth-providers"

interface SocialAuthButtonsProps {
	action: "Continue" | "Sign up"
	enabledProviders: SocialProvider[]
	onError?: (message: string) => void
}

const providers = [
	{
		name: "Apple",
		icon: "/icons/apple.svg",
		id: undefined,
	},
	{
		name: "Google",
		icon: "/icons/google.svg",
		id: "google",
	},
	{
		name: "Facebook",
		icon: "/icons/facebook.svg",
		id: "facebook",
	},
] as const

export function SocialAuthButtons({ action, enabledProviders, onError }: SocialAuthButtonsProps) {
	const [pendingProvider, setPendingProvider] = useState<SocialProvider>()
	const enabledProviderSet = new Set(enabledProviders)

	async function handleSocialSignIn(provider: SocialProvider) {
		onError?.("")
		setPendingProvider(provider)

		try {
			const result = await signIn.social({
				provider,
				callbackURL: "/home",
				newUserCallbackURL: "/home",
				errorCallbackURL: action === "Sign up" ? "/sign-up?error=oauth" : "/login?error=oauth",
			})

			if (result.error) {
				onError?.(result.error.message ?? "Social sign-in is not available. Please try again.")
			}
		} catch {
			onError?.("Unable to start social sign-in. Please try again.")
		} finally {
			setPendingProvider(undefined)
		}
	}

	return (
		<div className="space-y-2">
			{providers.map((provider) => {
				const pending = provider.id !== undefined && provider.id === pendingProvider
				const configured = provider.id ? enabledProviderSet.has(provider.id) : false
				const disabled = !configured || pendingProvider !== undefined

				return (
					<button
						key={provider.name}
						type="button"
						disabled={disabled}
						onClick={() => provider.id && handleSocialSignIn(provider.id)}
						title={configured ? undefined : `${provider.name} authentication is not configured yet`}
						aria-busy={pending || undefined}
						className="grid h-10 w-full grid-cols-[2rem_1fr_2rem] items-center rounded-full border border-neutral/70 bg-base-100 px-6 text-sm font-normal text-neutral disabled:cursor-not-allowed disabled:opacity-60"
					>
						<Image src={provider.icon} alt="" width={20} height={20} className="shrink-0" />
						<span>
							{action} with {provider.name}
						</span>
						<span
							className={pending ? "loading loading-spinner loading-xs" : undefined}
							aria-hidden="true"
						/>
					</button>
				)
			})}
		</div>
	)
}
