"use client"

import Image from "next/image"
import { useState } from "react"
import { signIn } from "@/lib/auth-client"

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

export type SocialProvider = Exclude<(typeof providers)[number]["id"], undefined>

export function SocialAuthButtons({ action, enabledProviders, onError }: SocialAuthButtonsProps) {
	const [pendingProvider, setPendingProvider] = useState<SocialProvider>()
	const enabledProviderSet = new Set(enabledProviders)

	async function handleSignIn(provider: SocialProvider) {
		onError?.("")
		setPendingProvider(provider)

		try {
			const result = await signIn.social({
				provider,
				callbackURL: "/account",
				newUserCallbackURL: "/account",
				errorCallbackURL: action === "Sign up" ? "/sign-up" : "/login",
			})

			if (result.error) {
				onError?.(
					result.error.message ??
						`${provider === "google" ? "Google" : "Facebook"} sign-in is not available.`,
				)
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
				const pending = provider.id === pendingProvider
				const configured = provider.id ? enabledProviderSet.has(provider.id) : false
				const disabled = !configured || pendingProvider !== undefined

				return (
					<button
						key={provider.name}
						type="button"
						disabled={disabled}
						onClick={() => provider.id && handleSignIn(provider.id)}
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
