import Link from "next/link"
import type { ButtonHTMLAttributes, ReactNode } from "react"

const variantClasses = {
	primary: "btn-primary",
	secondary: "btn-secondary",
	accent: "btn-accent",
	neutral: "btn-neutral",
	ghost: "btn-ghost",
	outline: "btn-outline btn-primary",
} as const

const sizeClasses = {
	small: "btn-sm",
	medium: "",
	large: "btn-lg",
} as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode
	to?: string
	fullWidth?: boolean
	loading?: boolean
	size?: keyof typeof sizeClasses
	rounded?: boolean
	variant?: keyof typeof variantClasses
}

export function Button({
	children,
	className,
	disabled,
	fullWidth = false,
	to,
	loading = false,
	size = "medium",
	variant = "primary",
	rounded = true,
	...props
}: ButtonProps) {
	const classes = [
		"btn shadow-none",
		variantClasses[variant],
		sizeClasses[size],
		fullWidth && "w-full",
		rounded && "rounded-full",
		className,
	]
		.filter(Boolean)
		.join(" ")

	if (to) {
		return (
			<Link href={to} className={classes} aria-disabled={disabled || loading} aria-busy={loading || undefined}>
				{loading && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
				{children}
			</Link>
		)
	}


	return (
		<button
			type="button"
			className={classes}
			disabled={disabled || loading}
			aria-busy={loading || undefined}
			{...props}
		>
			{loading && <span className="loading loading-spinner loading-sm" aria-hidden="true" />}
			{children}
		</button>
	)
}
