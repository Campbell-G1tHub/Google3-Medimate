"use client"

import { useEffect, useRef } from "react"
import { CalendarIcon, formatOpportunityDateTime, MapPinIcon } from "./opportunity-card-base"

export interface OpportunityDetailsContent {
	category: string
	title: string
	description: string
	location: string | null
	startsAt: string | null
	/**
	 * Omit it to fall back to the keyword guess the volunteer cards use; pass `null` when the
	 * value is known to be empty so no requirement is invented.
	 */
	requirements?: string | null
}

const TITLE_ID = "opportunity-details-title"

/**
 * Events created before requirements were collected get the same title-based guess the cards
 * show, so the volunteer-facing copy doesn't change.
 */
function resolveRequirements(opportunity: OpportunityDetailsContent) {
	if (opportunity.requirements !== undefined) {
		return opportunity.requirements?.trim() || "No specific requirements"
	}

	return opportunity.title.toLowerCase().includes("delivery")
		? "Car · Driver licence"
		: "No specific requirements"
}

/**
 * The opportunity description popup shared by the volunteer dashboard, the volunteer browse
 * page and the admin opportunity list. Mount it to open it — it shows itself on mount and
 * calls `onClose` for the close button, Escape and a backdrop click.
 */
export function OpportunityDetailsModal({
	opportunity,
	onClose,
	badge,
	spotsLeft,
	attended = false,
}: {
	opportunity: OpportunityDetailsContent
	onClose: () => void
	/** Pill at the foot of the card, e.g. "Confirmed" or the status label. */
	badge?: string
	/** "N spots left" line; omitted when the remaining spots are unknown. */
	spotsLeft?: number
	/** Heavier border for the states that mark the opportunity as already yours. */
	attended?: boolean
}) {
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const dialog = dialogRef.current

		if (dialog && !dialog.open) {
			dialog.showModal()
		}
	}, [])

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby={TITLE_ID}
			className="modal open:bg-primary/35"
			onCancel={(event) => {
				event.preventDefault()
				onClose()
			}}
			onClose={onClose}
		>
			<div
				className={`modal-box relative max-w-md rounded-[1.25rem] border p-3 border-2`}
			>
				<button
					aria-label="Close dialog"
					className="absolute right-3 top-2 text-xl leading-none text-primary"
					onClick={onClose}
					type="button"
				>
					×
				</button>
				<p className="text-sm font-bold text-primary">{opportunity.category}</p>
				<h2 id={TITLE_ID} className="mt-1 text-base font-bold text-black">
					{opportunity.title}
				</h2>
				<p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
					<MapPinIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
					{opportunity.location ?? "Location to be confirmed"}
				</p>
				<p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
					<CalendarIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
					{formatOpportunityDateTime(opportunity.startsAt)}
				</p>
				{spotsLeft !== undefined && (
					<p className="mt-2 text-xs font-bold text-accent">
						{spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
					</p>
				)}
				<hr className="my-2 border-primary" />
				<h3 className="text-md font-bold text-black">About this event</h3>
				<p className="mt-0.5 text-sm leading-3 text-primary">{opportunity.description}</p>
				<h3 className="mt-1 text-md font-bold text-black">Requirements</h3>
				<p className="text-sm text-primary">{resolveRequirements(opportunity)}</p>
				{badge && (
					<div className="mt-2 rounded-full bg-primary py-1 text-center text-xs font-bold text-white">
						{badge}
					</div>
				)}
			</div>
			{/* daisyUI's backdrop button: a click anywhere outside the box closes the dialog. */}
			<form method="dialog" className="modal-backdrop">
				<button aria-label="Close dialog" type="submit">
					close
				</button>
			</form>
		</dialog>
	)
}
