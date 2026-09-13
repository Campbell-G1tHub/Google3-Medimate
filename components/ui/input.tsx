import type { InputHTMLAttributes, ReactNode } from "react"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: string
	hint?: string
	label: string
	labelHidden?: boolean
	trailing?: ReactNode
	wrapperClassName?: string
}

export function Input({
	className,
	error,
	hint,
	id,
	label,
	labelHidden = false,
	name,
	trailing,
	wrapperClassName,
	...props
}: InputProps) {
	const inputId = id ?? name
	const descriptionId = inputId ? `${inputId}-${error ? "error" : "hint"}` : undefined
	const classes = ["input w-full", trailing && "pr-16", error && "input-error", className]
		.filter(Boolean)
		.join(" ")

	return (
		<fieldset className={["fieldset w-full", wrapperClassName].filter(Boolean).join(" ")}>
			<legend
				className={["fieldset-legend text-base-content", labelHidden && "sr-only"]
					.filter(Boolean)
					.join(" ")}
			>
				{label}
			</legend>
			<div className="relative w-full">
				<input
					id={inputId}
					name={name}
					className={classes}
					aria-describedby={(error || hint) && descriptionId ? descriptionId : undefined}
					aria-invalid={error ? true : undefined}
					{...props}
				/>
				{trailing && (
					<span className="absolute inset-y-0 right-0 flex items-center pr-3">{trailing}</span>
				)}
			</div>
			{(error || hint) && (
				<p id={descriptionId} className={`label ${error ? "text-error" : "text-base-content/60"}`}>
					{error ?? hint}
				</p>
			)}
		</fieldset>
	)
}
