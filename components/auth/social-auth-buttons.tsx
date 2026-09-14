import Image from "next/image"

interface SocialAuthButtonsProps {
	action: "Continue" | "Sign up"
}

const providers = [
	{
		name: "Apple",
		icon: "/icons/apple.svg",
	},
	{
		name: "Google",
		icon: "/icons/google.svg"
	},
	{
		name: "Facebook",
		icon: "/icons/facebook.svg",
	},
] as const

export function SocialAuthButtons({ action }: SocialAuthButtonsProps) {
	return (
		<div className="space-y-2">
			{providers.map((provider) => (
				<button
					key={provider.name}
					type="button"
					disabled
					title={`${provider.name} authentication is not configured yet`}
					className="grid h-10 w-full grid-cols-[2rem_1fr_2rem] rounded-full items-center border border-neutral/70 bg-base-100 px-6 text-sm font-normal text-neutral disabled:cursor-not-allowed disabled:opacity-100"
				>
					<Image src={provider.icon} alt="" width={20} height={20} className="shrink-0" />
					<span>
						{action} with {provider.name}
					</span>
					<span aria-hidden="true" />
				</button>
			))}
		</div>
	)
}
