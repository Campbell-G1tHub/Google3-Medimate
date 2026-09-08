import type { ReactNode } from "react"

export interface SocialButtonProps {
	icon?: ReactNode
	label: string
}

export function SocialButton({ icon, label }: SocialButtonProps) {
	return (
		<button
			type="button"
			className="btn w-full justify-center gap-3 rounded-full border-base-300 bg-base-100 font-medium text-base-content shadow-none"
			aria-disabled="true"
		>
			{icon}
			{label}
		</button>
	)
}
