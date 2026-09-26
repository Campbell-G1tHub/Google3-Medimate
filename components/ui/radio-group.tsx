import type { InputHTMLAttributes, ReactNode, Ref } from "react"

export interface RadioGroupOption {
	label: string
	value: string
}

export interface RadioGroupProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "type" | "value"> {
	description?: string
	error?: string
	label: ReactNode
	labelClassName?: string
	options: readonly RadioGroupOption[]
	ref?: Ref<HTMLInputElement>
	wrapperClassName?: string
}

/**
 * A fieldset of radios sharing one name. The register `ref` is attached to every
 * input, which is how react-hook-form tracks a radio group, so the whole group is
 * wired with a single `{...register("fieldName")}` spread.
 */
export function RadioGroup({
	className,
	description,
	error,
	id,
	label,
	labelClassName,
	name,
	options,
	ref,
	wrapperClassName,
	...props
}: RadioGroupProps) {
	const groupId = id ?? name
	const errorId = groupId ? `${groupId}-error` : undefined
	const classes = ["radio radio-secondary radio-sm border-neutral/40", error && "radio-error", className]
		.filter(Boolean)
		.join(" ")

	return (
		<fieldset className={["fieldset w-full", wrapperClassName].filter(Boolean).join(" ")}>
			<legend
				className={["fieldset-legend text-base-content", labelClassName].filter(Boolean).join(" ")}
			>
				{label}
			</legend>
			{description && <p className="label text-sm text-base-content/70">{description}</p>}
			<div className="space-y-1">
				{options.map((option) => (
					<label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
						<input
							ref={ref}
							id={groupId ? `${groupId}-${option.value}` : undefined}
							name={name}
							type="radio"
							value={option.value}
							className={classes}
							aria-describedby={error && errorId ? errorId : undefined}
							aria-invalid={error ? true : undefined}
							{...props}
						/>
						<span>{option.label}</span>
					</label>
				))}
			</div>
			{error && (
				<p id={errorId} className="label text-error">
					{error}
				</p>
			)}
		</fieldset>
	)
}
