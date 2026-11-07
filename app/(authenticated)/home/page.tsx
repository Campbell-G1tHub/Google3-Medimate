"use client"

import type { ReactNode, SVGProps } from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"

type EventCard = {
	id: string
	title: string
	description: string
	location: string | null
	startsAt: string | null
	endsAt: string | null
	registrationStatus?: "ATTENDING" | "NOT_ATTENDING"
	signedUp?: boolean
}

type Dialog = "details" | "confirm-sign-up" | "confirm-cancel" | "success" | undefined

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="18"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
			width="18"
			{...props}
		>
			{children}
		</svg>
	)
}

function MapPinIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
			<circle cx="12" cy="10" r="2.5" />
		</Icon>
	)
}
function CalendarIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<rect height="15" rx="2" width="18" x="3" y="5" />
			<path d="M16 3v4M8 3v4M3 10h18" />
		</Icon>
	)
}
function ExpandIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7" />
		</Icon>
	)
}
function BellIcon() {
	return (
		<Icon height="23" width="23">
			<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
		</Icon>
	)
}
function HomeIcon() {
	return (
		<Icon>
			<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9Z" />
			<path d="M9 21v-6h6v6" />
		</Icon>
	)
}
function SearchIcon() {
	return (
		<Icon>
			<circle cx="11" cy="11" r="6" />
			<path d="m20 20-4-4" />
		</Icon>
	)
}
function InboxIcon() {
	return (
		<Icon>
			<path d="M4 4h16v16H4zM4 15h5l1.5 2h3L15 15h5" />
		</Icon>
	)
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon height="34" width="34" {...props}>
			<circle cx="12" cy="12" r="9" />
			<path d="m8 12 2.5 2.5L16 9" />
		</Icon>
	)
}
function WarningIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon height="34" width="34" stroke="#d02327" {...props}>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 8v5M12 16h.01" />
		</Icon>
	)
}

function VolunteerCheckIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon height="40" width="40" {...props}>
			<circle cx="9" cy="7" r="4" />
			<path d="M2.5 20c.5-4.1 3-6.5 6.5-6.5 2.3 0 4.2.8 5.4 2.4" />
			<path d="m16 15 2 2 4-4" />
		</Icon>
	)
}

function formatDate(value: string | null) {
	if (!value) return "Time to be confirmed"
	return new Intl.DateTimeFormat("en-AU", {
		day: "2-digit",
		month: "2-digit",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value))
}

function categoryFor(event: EventCard) {
	const value = event.title.toLowerCase()
	if (value.includes("delivery")) return "Deliveries"
	if (value.includes("warehouse")) return "Warehouses"
	return "Community"
}

function EventCardView({
	event,
	onDetails,
	onAction,
}: {
	event: EventCard
	onDetails: () => void
	onAction: () => void
}) {
	const registered = Boolean(event.registrationStatus)
	return (
		<article className="flex h-44 w-40 shrink-0 flex-col rounded-2xl border-2 border-primary bg-white p-2.5 text-[11px] shadow-sm sm:w-48 sm:text-xs">
			<div className="flex items-start justify-between gap-2">
				<p className="font-bold text-primary">{categoryFor(event)}</p>
				<button
					aria-label={`View details for ${event.title}`}
					className="-mr-0.5 -mt-0.5 text-primary transition hover:text-secondary"
					onClick={onDetails}
					type="button"
				>
					<ExpandIcon />
				</button>
			</div>
			<h3 className="mt-2 font-bold text-primary">{event.title}</h3>
			<div className="mt-3 space-y-1 text-primary">
				<p className="flex items-center gap-1">
					<MapPinIcon />
					{event.location ?? "Location to be confirmed"}
				</p>
				<p className="flex items-center gap-1">
					<CalendarIcon />
					{formatDate(event.startsAt)}
				</p>
			</div>
			{!registered && <p className="mt-2 font-bold text-accent">3 spots left</p>}
			<div className="mt-auto pt-2">
				{registered ? (
					<div className="flex items-center justify-between gap-1">
						<span className="flex h-7 items-center rounded-full bg-primary px-2 text-[10px] font-bold text-white">
							{event.registrationStatus === "NOT_ATTENDING" ? "Cancelled" : "Confirmed"}
						</span>
						{event.registrationStatus !== "NOT_ATTENDING" && (
							<Button
								className="h-7 min-h-0 border-none bg-accent px-2 text-[10px] text-white hover:bg-accent/90"
								onClick={onAction}
								rounded
								variant="accent"
							>
								Cancel
							</Button>
						)}
					</div>
				) : (
					<Button
						className="h-8 min-h-0 w-full border-none bg-accent px-2 text-xs text-white hover:bg-accent/90"
						onClick={onAction}
						rounded
						variant="accent"
					>
						Sign up
					</Button>
				)}
			</div>
		</article>
	)
}

function EventRow({ children, empty }: { children: ReactNode; empty: string }) {
	return (
		<div className="mt-2 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
			{children || (
				<p className="rounded-xl border border-base-300 px-4 py-5 text-sm text-primary">{empty}</p>
			)}
		</div>
	)
}

function Modal({
	children,
	onClose,
	variant,
}: {
	children: ReactNode
	onClose: () => void
	variant: "registered-detail" | "opportunity-detail" | "confirmation" | "success"
}) {
	const containerClass = {
		"registered-detail": "relative max-w-[28rem] rounded-[1.25rem] border-[3px] border-primary p-3",
		"opportunity-detail": "relative max-w-[28rem] rounded-[1.25rem] border-2 border-primary p-3",
		confirmation: "max-w-md rounded-2xl border-2 border-primary px-6 py-7",
		success: "max-w-md rounded-2xl border-2 border-primary px-6 py-7",
	}[variant]
	const hasCloseButton = variant === "registered-detail" || variant === "opportunity-detail"

	return (
		<div
			aria-modal="true"
			className="fixed inset-0 z-50 grid place-items-center bg-primary/35 p-5"
			role="dialog"
		>
			<div className={`w-full bg-white shadow-xl ${containerClass}`}>
				{hasCloseButton && (
					<button
						aria-label="Close dialog"
						className="absolute right-3 top-2 text-xl leading-none text-primary"
						onClick={onClose}
						type="button"
					>
						×
					</button>
				)}
				{children}
			</div>
		</div>
	)
}

export default function DashboardPage() {
	const { data: session, isPending } = useSession()
	const [registered, setRegistered] = useState<EventCard[]>([])
	const [available, setAvailable] = useState<EventCard[]>([])
	const [selected, setSelected] = useState<EventCard>()
	const [dialog, setDialog] = useState<Dialog>()
	const [action, setAction] = useState<"sign-up" | "cancel">()
	const [pending, setPending] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		if (!session) return
		void Promise.all([fetch("/api/my-events"), fetch("/api/events")]).then(
			async ([myEvents, events]) => {
				if (!myEvents.ok || !events.ok) {
					setError("Unable to load your event cards.")
					return
				}
				const myEventsData = (await myEvents.json()) as {
					events: Array<{ status: EventCard["registrationStatus"]; event: EventCard }>
				}
				const eventsData = (await events.json()) as { events: EventCard[] }
				setRegistered(
					myEventsData.events.map(({ event, status }) => ({
						...event,
						registrationStatus: status,
					})),
				)
				setAvailable(eventsData.events.filter((event) => !event.signedUp))
			},
		)
	}, [session])

	const matching = useMemo(() => available.slice(0, 3), [available])
	const alsoAvailable = useMemo(() => available.slice(3), [available])
	function openDetails(event: EventCard) {
		setSelected(event)
		setDialog("details")
	}
	function openConfirmation(event: EventCard, nextAction: "sign-up" | "cancel") {
		setSelected(event)
		setAction(nextAction)
		setDialog(nextAction === "sign-up" ? "confirm-sign-up" : "confirm-cancel")
	}
	function closeDialog() {
		setSelected(undefined)
		setDialog(undefined)
		setAction(undefined)
		setError("")
	}
	async function completeAction() {
		if (!selected || !action) return
		setPending(true)
		setError("")
		try {
			const response = await fetch(`/api/events/${selected.id}/sign-up`, {
				method: action === "sign-up" ? "POST" : "DELETE",
			})
			const result = (await response.json()) as { error?: string }
			if (!response.ok) throw new Error(result.error ?? "Unable to update this event.")
			if (action === "sign-up") {
				setAvailable((current) => current.filter((event) => event.id !== selected.id))
				setRegistered((current) => [{ ...selected, registrationStatus: "ATTENDING" }, ...current])
			} else {
				setRegistered((current) => current.filter((event) => event.id !== selected.id))
				setAvailable((current) => [...current, { ...selected, registrationStatus: undefined }])
			}
			setDialog("success")
		} catch (actionError) {
			setError(actionError instanceof Error ? actionError.message : "Unable to update this event.")
		} finally {
			setPending(false)
		}
	}

	if (isPending)
		return <main className="grid min-h-screen place-items-center">Loading dashboard…</main>
	if (!session)
		return (
			<main className="grid min-h-screen place-items-center">
				Please sign in to view your dashboard.
			</main>
		)

	return (
		<main className="min-h-screen bg-white pb-16 md:pb-0">
			<div className="flex">
				<section className="min-w-0 flex-1 px-4 py-4 md:px-8 md:py-6">
					<header className="flex items-center justify-between border-b border-base-300 pb-3">
						<h1 className="text-2xl font-bold text-primary md:text-3xl">Dashboard</h1>
						<button
							aria-label="Unread notifications"
							className="relative text-primary"
							type="button"
						>
							<BellIcon />
							<span className="absolute -right-1 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
								3
							</span>
						</button>
					</header>
					<section className="mt-4">
						<h2 className="text-base font-bold text-primary">My Events</h2>
						<EventRow empty="You have not registered for an opportunity yet.">
							{registered.map((event) => (
								<EventCardView
									event={event}
									key={event.id}
									onAction={() => openConfirmation(event, "cancel")}
									onDetails={() => openDetails(event)}
								/>
							))}
						</EventRow>
					</section>
					<section className="mt-4">
						<h2 className="text-base font-bold text-primary">Matching your interests</h2>
						<EventRow empty="No matching opportunities are available right now.">
							{matching.map((event) => (
								<EventCardView
									event={event}
									key={event.id}
									onAction={() => openConfirmation(event, "sign-up")}
									onDetails={() => openDetails(event)}
								/>
							))}
						</EventRow>
					</section>
					<section className="mt-4">
						<h2 className="text-base font-bold text-primary">Also available</h2>
						<EventRow empty="No other opportunities are available right now.">
							{alsoAvailable.map((event) => (
								<EventCardView
									event={event}
									key={event.id}
									onAction={() => openConfirmation(event, "sign-up")}
									onDetails={() => openDetails(event)}
								/>
							))}
						</EventRow>
					</section>
					{error && <p className="mt-4 text-sm text-error">{error}</p>}
				</section>
			</div>
			{selected && dialog === "details" && (
				<Modal
					onClose={closeDialog}
					variant={selected.registrationStatus ? "registered-detail" : "opportunity-detail"}
				>
					<p className="text-sm font-bold text-primary">{categoryFor(selected)}</p>
					<h2 className="mt-1 text-base font-bold text-black">{selected.title}</h2>
					<p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
						<MapPinIcon className="h-4 w-4 shrink-0" />
						{selected.location ?? "Location to be confirmed"}
					</p>
					<p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
						<CalendarIcon className="h-4 w-4 shrink-0" />
						{formatDate(selected.startsAt)}
					</p>

					{/* Todo wire to actual data */}
					<p className="mt-2 text-xs font-bold text-accent">3 spots left</p>
					<hr className="my-2 border-primary" />
					<h3 className="text-xs font-bold text-black">About this event</h3>
					<p className="mt-0.5 text-[11px] leading-3 text-primary">{selected.description}</p>
					<h3 className="mt-1 text-xs font-bold text-black">Requirements</h3>
					<p className="text-[11px] text-primary">
						{selected.title.toLowerCase().includes("delivery")
							? "Car · Driver licence"
							: "No specific requirements"}
					</p>
					{selected.registrationStatus && (
						<div className="mt-2 rounded-full bg-primary py-1 text-center text-xs font-bold text-white">
							Confirmed
						</div>
					)}
				</Modal>
			)}
			{selected && (dialog === "confirm-sign-up" || dialog === "confirm-cancel") && (
				<Modal onClose={closeDialog} variant="confirmation">
					<div className="text-center">
						{dialog === "confirm-cancel" ? (
							<WarningIcon className="mx-auto h-9 w-9" />
						) : (
							<VolunteerCheckIcon className="mx-auto h-9 w-9" />
						)}
						<h2 className="mt-3 text-lg font-bold text-black">
							{dialog === "confirm-cancel" ? "Cancel this event?" : "Sign up for this opportunity?"}
						</h2>
						<p className="mx-auto mt-3 max-w-sm text-sm text-black">
							{dialog === "confirm-cancel" ? (
								<>
									You&apos;re about to cancel your sign-up for <strong>{selected.title}</strong> on{" "}
									{formatDate(selected.startsAt)}. This will free up your spot for another
									volunteer.
								</>
							) : (
								<>
									You&apos;re about to sign up for <strong>{selected.title}</strong> on{" "}
									{formatDate(selected.startsAt)} in {selected.location ?? "the local area"}.
								</>
							)}
						</p>
						<div className="mt-5 flex flex-wrap justify-center gap-3">
							<Button
								className="h-9 min-h-0 !border-accent !bg-white px-5 text-sm font-bold !text-accent hover:!border-accent hover:!bg-white hover:!text-accent"
								onClick={closeDialog}
								rounded
								variant="outline"
							>
								{dialog === "confirm-cancel" ? "Keep my spot" : "Cancel"}
							</Button>
							<Button
								className="h-9 min-h-0 border-none bg-accent px-5 text-sm font-bold text-white hover:bg-accent/90"
								loading={pending}
								onClick={() => void completeAction()}
								rounded
								variant="accent"
							>
								{dialog === "confirm-cancel" ? "Cancel event" : "Confirm Sign Up"}
							</Button>
						</div>
						{error && <p className="mt-3 text-sm text-error">{error}</p>}
					</div>
				</Modal>
			)}
			{selected && dialog === "success" && (
				<Modal onClose={closeDialog} variant="success">
					<div className="text-center">
						<CheckIcon className="mx-auto h-10 w-10" />
						<h2 className="mt-3 text-lg font-bold text-black">
							{action === "cancel" ? "Event Cancelled" : "You've signed up!"}
						</h2>
						<p className="mx-auto mt-3 max-w-sm text-sm text-black">
							{action === "cancel" ? (
								<>
									You cancelled your sign-up for <strong>{selected.title}</strong> on{" "}
									{formatDate(selected.startsAt)}. Your spot has been freed up for another
									volunteer.
								</>
							) : (
								<>
									You secured your spot for <strong>{selected.title}</strong> on{" "}
									{formatDate(selected.startsAt)}.
								</>
							)}
						</p>
						<Button
							className="mt-5 h-9 min-h-0 border-none bg-accent px-6 text-sm font-bold text-white hover:bg-accent/90"
							onClick={closeDialog}
							rounded
							variant="accent"
						>
							Done
						</Button>
					</div>
				</Modal>
			)}
		</main>
	)
}