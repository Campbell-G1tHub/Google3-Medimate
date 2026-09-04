import type { InputHTMLAttributes, ReactNode } from "react"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	endAdornment?: ReactNode
	error?: string
	hint?: string
	label: string
	labelClassName?: string
	wrapperClassName?: string
}

export function Input({
	className,
	endAdornment,
	error,
	hint,
	id,
	label,
	labelClassName,
	name,
	wrapperClassName,
	...props
}: InputProps) {
	const inputId = id ?? name
	const descriptionId = inputId ? `${inputId}-${error ? "error" : "hint"}` : undefined
	const classes = ["input w-full", error && "input-error", className].filter(Boolean).join(" ")

	return (
		<fieldset className={["fieldset w-full", wrapperClassName].filter(Boolean).join(" ")}>
			<legend
				className={["fieldset-legend text-base-content", labelClassName].filter(Boolean).join(" ")}
			>
				{label}
			</legend>
			<div className="relative w-full">
				<input
					id={inputId}
					name={name}
					className={[classes, endAdornment && "pr-14"].filter(Boolean).join(" ")}
					aria-describedby={(error || hint) && descriptionId ? descriptionId : undefined}
					aria-invalid={error ? true : undefined}
					{...props}
				/>
				{endAdornment && (
					<span className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</span>
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
