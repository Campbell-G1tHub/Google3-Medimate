"use client"

import { useSyncExternalStore } from "react"
import { DropdownSelect } from "@/components/ui/dropdown-select"
import { ALL_VOLUNTEERS, SEND_TO_OPTIONS } from "@/lib/validation/announcement"

/** Match Tailwind's default `sm` breakpoint (640px). */
const MOBILE_QUERY = "(max-width: 639px)"

function subscribeToMobile(callback: () => void) {
	const mediaQuery = window.matchMedia(MOBILE_QUERY)
	mediaQuery.addEventListener("change", callback)
	return () => mediaQuery.removeEventListener("change", callback)
}

function getMobileSnapshot() {
	return window.matchMedia(MOBILE_QUERY).matches
}

function useIsMobile() {
	return useSyncExternalStore(subscribeToMobile, getMobileSnapshot, () => false)
}

interface SendToSelectProps {
	value: string[]
	onChange: (value: string[]) => void
	type: string
	onBlur?: () => void
	error?: string
}

export function SendToSelect({ value, onChange, onBlur, error, type }: SendToSelectProps) {
	const isMobile = useIsMobile()

	// "All volunteers" and specific groups are mutually exclusive.
	function toggle(option: string, checked: boolean) {
		if (option === ALL_VOLUNTEERS) {
			onChange(checked ? [ALL_VOLUNTEERS] : [])
			return
		}

		const groups = value.filter((item) => item !== ALL_VOLUNTEERS && item !== option)
		onChange(checked ? [...groups, option] : groups)
	}

	return (
		<DropdownSelect
			label="Send to"
			labelClassName="text-base font-bold text-primary"
			options={SEND_TO_OPTIONS}
			value={value}
			onChange={(next) => {
				if (Array.isArray(next)) {
					onChange(next)
				}
			}}
			onToggleOption={(option, checked) => toggle(option.value, checked)}
			onBlur={onBlur}
			error={error}
			flip={isMobile || type === "OPPORTUNITY"}
			placeholder="Select category or all volunteers"
		/>
	)
}
