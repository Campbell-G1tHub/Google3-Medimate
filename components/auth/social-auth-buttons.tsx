interface SocialAuthButtonsProps {
	action: "Continue" | "Sign up"
}

const providers = [
	{
		name: "Apple",
		icon: <span className="text-2xl leading-none text-black"></span>,
	},
	{
		name: "Google",
		icon: (
			<span className="bg-[conic-gradient(from_-45deg,#4285f4_0_25%,#34a853_0_42%,#fbbc05_0_67%,#ea4335_0)] bg-clip-text text-xl leading-none font-bold text-transparent">
				G
			</span>
		),
	},
	{
		name: "Facebook",
		icon: (
			<span className="flex size-6 items-end justify-center rounded-full bg-[#1877f2] text-lg leading-5 font-bold text-white">
				f
			</span>
		),
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
					className="grid h-10 w-full grid-cols-[2rem_1fr_2rem] items-center rounded-[0.6rem] border border-neutral/70 bg-base-100 px-3 text-sm font-normal text-neutral disabled:cursor-not-allowed disabled:opacity-100"
				>
					<span className="flex items-center justify-center">{provider.icon}</span>
					<span>
						{action} with {provider.name}
					</span>
					<span aria-hidden="true" />
				</button>
			))}
		</div>
	)
}
