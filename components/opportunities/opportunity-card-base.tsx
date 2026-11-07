import { CalendarDays, Expand, MapPin } from "lucide-react"
import type { ReactNode } from "react"

export interface OpportunityCardContent {
	title: string
	location: string | null
	startsAt: string | null
}

export { CalendarDays as CalendarIcon, MapPin as MapPinIcon }

export function formatOpportunityDateTime(value: string | null) {
	if (!value) return "Time to be confirmed"
	return new Intl.DateTimeFormat("en-AU", {
		day: "2-digit",
		month: "2-digit",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value))
}

const sizeClasses = {
	compact: "h-full min-w-34 w-full p-2 text-[10px]",
	comfortable: "h-full min-h-44 w-full p-2.5 text-[11px] sm:text-xs",
} as const

const iconSize = {
	compact: 16,
	comfortable: 18,
} as const

const titleClasses = {
	compact: "mt-1",
	comfortable: "mt-2",
} as const

const metaClasses = {
	compact: "mt-1.5 space-y-0.5",
	comfortable: "mt-3 space-y-1",
} as const

const expandClasses = {
	compact: "text-primary",
	comfortable: "-mr-0.5 -mt-0.5 text-primary transition hover:text-secondary",
} as const

export function OpportunityCardBase({
	event,
	onDetails,
	detailsLabel,
	header,
	size = "comfortable",
	children,
	className,
}: {
	event: OpportunityCardContent
	onDetails: () => void
	detailsLabel: string
	header: ReactNode
	size?: keyof typeof sizeClasses
	children: ReactNode
	className?: string
}) {
	return (
		<article
			className={`flex shrink-0 flex-col rounded-2xl border-2 border-primary bg-white shadow-sm ${sizeClasses[size]} ${className ?? ""}`}
		>
			<div className="flex items-start justify-between gap-2">
				<h2 className="text-lg">{header}</h2>
				<button
					aria-label={detailsLabel}
					className={expandClasses[size]}
					onClick={onDetails}
					type="button"
				>
					<Expand aria-hidden="true" height={iconSize[size]} width={iconSize[size]} />
				</button>
			</div>
			<h2 className={`font-bold text-primary ${titleClasses[size]}`}>{event.title}</h2>
			<div className={`text-primary ${metaClasses[size]}`}>
				<p className="flex items-center gap-1">
					<MapPin aria-hidden="true" height={iconSize[size]} width={iconSize[size]} />
					{event.location ?? "Location to be confirmed"}
				</p>
				<p className="flex items-center gap-1">
					<CalendarDays aria-hidden="true" height={iconSize[size]} width={iconSize[size]} />
					{formatOpportunityDateTime(event.startsAt)}
				</p>
			</div>
			{children}
		</article>
	)
}
