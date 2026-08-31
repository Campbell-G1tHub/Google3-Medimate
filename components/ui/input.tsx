import type { InputHTMLAttributes } from "react"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	error?: string
	hint?: string
	label: string
	wrapperClassName?: string
}

export function Input({
	className,
	error,
	hint,
	id,
	label,
	name,
	wrapperClassName,
	...props
}: InputProps) {
	const inputId = id ?? name
	const descriptionId = inputId ? `${inputId}-${error ? "error" : "hint"}` : undefined
	const classes = ["input w-full", error && "input-error", className].filter(Boolean).join(" ")

	return (
		<fieldset className={["fieldset w-full", wrapperClassName].filter(Boolean).join(" ")}>
			<legend className="fieldset-legend text-base-content">{label}</legend>
			<input
				id={inputId}
				name={name}
				className={classes}
				aria-describedby={(error || hint) && descriptionId ? descriptionId : undefined}
				aria-invalid={error ? true : undefined}
				{...props}
			/>
			{(error || hint) && (
				<p id={descriptionId} className={`label ${error ? "text-error" : "text-base-content/60"}`}>
					{error ?? hint}
				</p>
			)}
		</fieldset>
	)
}
