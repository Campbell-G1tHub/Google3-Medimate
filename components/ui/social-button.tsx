import Image from "next/image"

export interface SocialButtonProps {
	icon: string
	label: string
}

export function SocialButton({ icon, label }: SocialButtonProps) {
	return (
		<button
			type="button"
			className="btn w-full justify-center rounded-full border-base-content/30 bg-base-100 font-normal text-base-content shadow-none hover:bg-base-300"
			aria-disabled="true"
		>
			<span className="flex w-64 items-center gap-6">
				<Image src={icon} alt="" width={20} height={20} className="shrink-0" />
				<span>{label}</span>
			</span>
		</button>
	)
}
