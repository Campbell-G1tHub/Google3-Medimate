import type { InputHTMLAttributes, ReactNode, Ref } from "react"

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	error?: string
	/** Text shown beside the box; it is also the checkbox's accessible name. */
	label: ReactNode
	labelClassName?: string
	ref?: Ref<HTMLInputElement>
	wrapperClassName?: string
}

/**
 * A labelled checkbox. Native properties are passed straight through, including the
 * `ref`, so a group of them can be registered with a single
 * `{...register("fieldName")}` spread and `value` per option.
 */
export function Checkbox({
	className,
	error,
	id,
	label,
	labelClassName,
	name,
	ref,
	value,
	wrapperClassName,
	...props
}: CheckboxProps) {
	const inputId = id ?? (name && value !== undefined ? `${name}-${String(value)}` : name)
	const errorId = inputId ? `${inputId}-error` : undefined
	const classes = [
		"checkbox checkbox-secondary checkbox-sm mt-0.5 shrink-0 rounded-sm border-neutral/40",
		error && "checkbox-error",
		className,
	]
		.filter(Boolean)
		.join(" ")

	return (
		<div className={["w-full", wrapperClassName].filter(Boolean).join(" ")}>
			<label
				htmlFor={inputId}
				className={["flex cursor-pointer items-center gap-2", labelClassName]
					.filter(Boolean)
					.join(" ")}
			>
				<input
					ref={ref}
					id={inputId}
					name={name}
					type="checkbox"
					value={value}
					className={classes}
					aria-describedby={error && errorId ? errorId : undefined}
					aria-invalid={error ? true : undefined}
					{...props}
				/>
				<span className="text-sm leading-5">{label}</span>
			</label>
			{error && (
				<p id={errorId} className="label text-error">
					{error}
				</p>
			)}
		</div>
	)
}
