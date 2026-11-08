const relativeTime = new Intl.RelativeTimeFormat("en-AU", { numeric: "auto" })

const TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	["day", 86_400_000],
	["hour", 3_600_000],
	["minute", 60_000],
]

/**
 * Shared "1 hour ago" label for notification surfaces (bell + inbox). Pass `now` when
 * rendering on the server and hydrating on the client so both renders agree.
 */
export function formatTimeAgo(iso: string, now = Date.now()) {
	const elapsed = new Date(iso).getTime() - now
	for (const [unit, ms] of TIME_UNITS) {
		if (Math.abs(elapsed) >= ms) {
			return relativeTime.format(Math.round(elapsed / ms), unit)
		}
	}
	return "just now"
}
