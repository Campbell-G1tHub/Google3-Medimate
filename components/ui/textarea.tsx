import type { Ref, TextareaHTMLAttributes } from "react"

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: string
	hint?: string
	label: string
	labelClassName?: string
	ref?: Ref<HTMLTextAreaElement>
	wrapperClassName?: string
}

/** Multi-line sibling of `Input`: same label, guidance, and validation contract. */
export function Textarea({
	className,
	error,
	hint,
	id,
	label,
	labelClassName,
	name,
	ref,
	rows = 4,
	wrapperClassName,
	...props
}: TextareaProps) {
	const textareaId = id ?? name
	const descriptionId = textareaId ? `${textareaId}-${error ? "error" : "hint"}` : undefined
	const classes = [
		"textarea w-full border-neutral/30 bg-base-100 px-2 py-2 text-sm font-normal focus:border-secondary focus:outline-none",
		error && "textarea-error",
		className,
	]
		.filter(Boolean)
		.join(" ")

	return (
		<fieldset className={["fieldset w-full", wrapperClassName].filter(Boolean).join(" ")}>
			<legend
				className={["fieldset-legend text-base-content", labelClassName].filter(Boolean).join(" ")}
			>
				{label}
			</legend>
			<textarea
				ref={ref}
				id={textareaId}
				name={name}
				rows={rows}
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
