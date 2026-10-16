"use client"

import Image from "next/image"
import { useEffect, useId, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { ALL_VOLUNTEERS, describeAudience, SEND_TO_OPTIONS } from "@/lib/validation/announcement"

interface SendToSelectProps {
	value: string[]
	onChange: (value: string[]) => void
	onBlur?: () => void
	error?: string
}

export function SendToSelect({ value, onChange, onBlur, error }: SendToSelectProps) {
	const panelId = useId()
	const errorId = useId()
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

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

		document.addEventListener("pointerdown", closeOnOutsidePress)
		return () => document.removeEventListener("pointerdown", closeOnOutsidePress)
	}, [isOpen, onBlur])

	// "All volunteers" and specific groups are mutually exclusive.
	function toggle(option: string, checked: boolean) {
		if (option === ALL_VOLUNTEERS) {
			onChange(checked ? [ALL_VOLUNTEERS] : [])
			return
		}

		const groups = value.filter((item) => item !== ALL_VOLUNTEERS && item !== option)
		onChange(checked ? [...groups, option] : groups)
	}

	const summary = value.length > 0 ? describeAudience(value) : "Select category or all volunteers"

	return (
		<fieldset className="fieldset w-full sm:max-w-xs">
			<legend className="fieldset-legend text-base font-bold text-primary">Send to</legend>
			<div
				ref={containerRef}
				className={
					isOpen ? "overflow-hidden rounded-[1.25rem] border border-primary bg-base-100" : undefined
				}
			>
				<button
					type="button"
					onClick={() => setIsOpen((open) => !open)}
					aria-expanded={isOpen}
					aria-controls={panelId}
					aria-describedby={error ? errorId : undefined}
					className={`btn btn-primary w-full justify-between px-4 text-sm font-semibold shadow-none ${isOpen ? "rounded-none" : "rounded-full"}`}
				>
					<span className="truncate first-letter:uppercase">{summary}</span>
					<Image
						src={isOpen ? "/icons/chevron_up.svg" : "/icons/chevron_down.svg"}
						alt=""
						width={isOpen ? 24 : 12}
						height={isOpen ? 24 : 7}
					/>
				</button>

				{isOpen && (
					<div id={panelId} className="flex flex-col gap-4 px-4 py-4">
						{SEND_TO_OPTIONS.map((option) => (
							<Checkbox
								key={option.value}
								name="sendTo"
								value={option.value}
								label={option.label}
								checked={value.includes(option.value)}
								onChange={(event) => toggle(option.value, event.target.checked)}
								onBlur={onBlur}
							/>
						))}
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
