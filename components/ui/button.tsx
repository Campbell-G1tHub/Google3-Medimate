import type { ButtonHTMLAttributes, ReactNode } from "react"

const variantClasses = {
	primary: "btn-primary",
	secondary: "btn-secondary",
	accent: "btn-accent hover:border-primary hover:bg-primary hover:text-primary-content",
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
	fullWidth?: boolean
	loading?: boolean
	size?: keyof typeof sizeClasses
	variant?: keyof typeof variantClasses
}

export function Button({
	children,
	className,
	disabled,
	fullWidth = false,
	loading = false,
	size = "medium",
	variant = "primary",
	...props
}: ButtonProps) {
	const classes = [
		"btn [--depth:0]",
		variantClasses[variant],
		sizeClasses[size],
		fullWidth && "w-full",
		className,
	]
		.filter(Boolean)
		.join(" ")

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
