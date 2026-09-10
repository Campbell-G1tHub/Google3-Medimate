import Image from "next/image"

export interface SocialButtonProps {
	icon: string
	label: string
}

export function SocialButton({ icon, label }: SocialButtonProps) {
	return (
		<button
			type="button"
			className="btn w-full justify-center gap-3 rounded-full border-base-300 bg-base-100 font-medium text-base-content shadow-none"
			aria-disabled="true"
		>
			<Image src={icon} alt="" width={20} height={20} />
			{label}
		</button>
	)
}
