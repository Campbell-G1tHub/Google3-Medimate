import type { ReactNode } from "react"
import { useEffect, useId, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp } from "lucide-react"

export interface DropdownOption {
	label: string
	value: string
}

export interface DropdownSelectProps {
	className?: string
	buttonClassName?: string
	disabled?: boolean
	error?: string
	/** When true, the panel opens above the trigger instead of below. */
	flip?: boolean
	label?: ReactNode
	labelClassName?: string
	menuClassName?: string
	options: readonly DropdownOption[]
	optionClassName?: string
	placeholder?: string
	/**
	 * When true, prevents the value from becoming empty. Single-select keeps the
	 * current value when it is toggled again instead of clearing it; multi-select
	 * prevents unchecking the last selected option. When `onToggleOption` is provided
	 * the parent owns the mutation and remains responsible for not emptying the value.
	 */
	noEmptySelects?: boolean
	/** Multi-select only: when true, render checkbox-style items. Defaults to true. */
	showCheckboxes?: boolean
	/** Overrides the default button label derived from `value`. */
	summaryValue?: (value: string | string[]) => string
	value: string | string[]
	wrapperClassName?: string
	onChange: (next: string | string[]) => void
	/** Multi-select only: override how each checkbox toggle mutates the array. */
	onToggleOption?: (option: DropdownOption, checked: boolean) => void
	onBlur?: () => void
}

const isMultiple = (value: string | string[]): value is string[] => Array.isArray(value)

/**
 * A controlled select-style dropdown. When `value` is an array the dropdown is a
 * multi-select built from `Checkbox` (unless `showCheckboxes` is false); otherwise it
 * is a single-select where picking the already-selected option clears the value again
 * (toggle behaviour, blocked by `noEmptySelects`). Uses headless open/close state with
 * the same outside-click and Escape handling as the rest of the UI kit, styled with
 * Daisy UI classes.
 */
export function DropdownSelect({
	className,
	buttonClassName,
	disabled,
	error,
	flip = false,
	label,
	labelClassName,
	menuClassName,
	options,
	optionClassName,
	placeholder,
	noEmptySelects = false,
	showCheckboxes = true,
	summaryValue,
	value,
	wrapperClassName,
	onChange,
	onToggleOption,
	onBlur,
}: DropdownSelectProps) {
	const panelId = useId()
	const errorId = useId()
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const multiple = isMultiple(value)

	useEffect(() => {
		if (!isOpen) {
			return
		}

		function closeOnOutsidePress(event: PointerEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false)
				onBlur?.()
			}
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false)
				onBlur?.()
			}
		}

		document.addEventListener("pointerdown", closeOnOutsidePress)
		document.addEventListener("keydown", closeOnEscape)
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePress)
			document.removeEventListener("keydown", closeOnEscape)
		}
	}, [isOpen, onBlur])

	const customSummary = summaryValue?.(value)
	const selectedText =
		customSummary ||
		(multiple
			? value.length > 0
				? `${value.length} selected`
				: (placeholder ?? "Select options")
			: (options.find((option) => option.value === value)?.label ?? placeholder ?? ""))

	function toggleSingle(option: DropdownOption) {
		if (!multiple) {
			if (noEmptySelects && option.value === value) {
				return
			}
			onChange(option.value === value ? "" : option.value)
			setIsOpen(false)
			onBlur?.()
		}
	}

	function toggleMulti(option: DropdownOption, checked: boolean) {
		if (!multiple) {
			return
		}

		if (noEmptySelects && !checked && value.length === 1) {
			return
		}

		if (onToggleOption) {
			onToggleOption(option, checked)
			return
		}

		onChange(checked ? [...value, option.value] : value.filter((item) => item !== option.value))
	}

	return (
		<fieldset
			className={["fieldset sm:max-w-xs", wrapperClassName].filter(Boolean).join(" ")}
		>
			{label && (
				<legend
					className={["fieldset-legend text-base-content", labelClassName]
						.filter(Boolean)
						.join(" ")}
				>
					{label}
				</legend>
			)}
			<div
				ref={containerRef}
				className={["relative", className].filter(Boolean).join(" ")}
			>
				<button
					type="button"
					onClick={() => setIsOpen((open) => !open)}
					aria-expanded={isOpen}
					aria-haspopup="listbox"
					aria-controls={panelId}
					aria-describedby={error ? errorId : undefined}
					disabled={disabled}
					className={[
						"btn btn-primary w-full justify-between px-2 text-sm font-semibold shadow-none rounded-full",
						buttonClassName,
					]
						.filter(Boolean)
						.join(" ")}
				>
					<span className="truncate first-letter:uppercase">{selectedText}</span>
					{isOpen ? <ChevronUp /> : <ChevronDown />}
				</button>

				{isOpen && (
					<div
						id={panelId}
						role="listbox"
						className={[
							"absolute left-0 z-20 w-full min-w-fit max-h-40 overflow-y-scroll rounded-2xl border-2 border-primary bg-base-100 shadow-md",
							flip ? "bottom-full mb-2" : "top-full mt-2",
							menuClassName,
						]
							.filter(Boolean)
							.join(" ")}
					>
						{multiple ? (
							showCheckboxes ? (
								<div className="flex flex-col gap-4 px-4 py-4">
									{options.map((option) => (
										<Checkbox
											key={option.value}
											name="dropdown-select"
											value={option.value}
											label={option.label}
											checked={value.includes(option.value)}
											onChange={(event) => toggleMulti(option, event.target.checked)}
										/>
									))}
								</div>
							) : (
								<ul className="menu w-full">
									{options.map((option) => (
										<li key={option.value}>
											<button
												type="button"
												onClick={() => toggleMulti(option, !value.includes(option.value))}
												className={[
													"flex w-full items-center justify-between gap-2",
													value.includes(option.value) && "bg-base-200 font-bold",
													optionClassName,
												]
													.filter(Boolean)
													.join(" ")}
											>
												{option.label}
											</button>
										</li>
									))}
								</ul>
							)
						) : (
							<ul className="menu w-full">
								{options.map((option) => (
									<li key={option.value}>
										<button
											type="button"
											onClick={() => toggleSingle(option)}
											className={[
												"flex w-full items-center justify-between gap-2",
												value === option.value && "bg-base-200 font-bold",
												optionClassName,
											]
												.filter(Boolean)
												.join(" ")}
										>
											{option.label}
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				)}
			</div>
			{error && (
				<p id={errorId} className="label text-error">
					{error}
				</p>
			)}
		</fieldset>
	)
}
