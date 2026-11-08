"use client"

import type { ReactNode, SVGProps } from "react"
import { CalendarIcon, MapPinIcon } from "@/components/opportunities/opportunity-card-base"
import { Button } from "@/components/ui/button"
import type { NotificationItem } from "@/lib/announcements"
import { formatTimeAgo } from "@/lib/relative-time"
import { ANNOUNCEMENT_TYPE_OPTIONS } from "@/lib/validation/announcement"
import { X} from "lucide-react"

/** The event an opportunity announcement points at, as sent by `listNotifications`. */
export type InboxEvent = NonNullable<NotificationItem["event"]>

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
	ANNOUNCEMENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)


/** TODO change to use actual user name */
const SENDER_NAME = "Medical Pantry Admin"

const dayMonthFormatter = new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "2-digit" })

function formatClockTime(value: Date) {
	const hour = value.getHours()
	const suffix = hour < 12 ? "am" : "pm"
	const hourOfClock = hour % 12 === 0 ? 12 : hour % 12
	const minutes = value.getMinutes()
	return minutes === 0
		? `${hourOfClock}${suffix}`
		: `${hourOfClock}:${String(minutes).padStart(2, "0")}${suffix}`
}

/** `01/09, 10am-1pm`, matching the inbox mock. */
export function formatEventWindow(startsAt: string | null, endsAt: string | null) {
	if (!startsAt) return "Time to be confirmed"

	const start = new Date(startsAt)
	const window = `${dayMonthFormatter.format(start)}, ${formatClockTime(start)}`

	return endsAt ? `${window}-${formatClockTime(new Date(endsAt))}` : window
}

function categoryForEvent(event: InboxEvent) {
	const title = event.title.toLowerCase()
	if (title.includes("delivery")) return "Deliveries"
	if (title.includes("warehouse")) return "Warehouses"
	return "Community"
}

function requirementsFor(event: InboxEvent) {
	return event.title.toLowerCase().includes("delivery")
		? ["Car", "Drivers Licence"]
		: ["No specific requirements"]
}

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

function VolunteerCheckIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon height="40" width="40" {...props}>
			<circle cx="9" cy="7" r="4" />
			<path d="M2.5 20c.5-4.1 3-6.5 6.5-6.5 2.3 0 4.2.8 5.4 2.4" />
			<path d="m16 15 2 2 4-4" />
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

const overlayClassName = "fixed inset-0 z-50 grid place-items-center bg-primary/35 p-5"

function DialogFrame({ children, label }: { children: ReactNode; label: string }) {
	return (
		<div aria-label={label} aria-modal="true" className={overlayClassName} role="dialog">
			<div className="relative flex max-h-[85vh] w-full max-w-sm flex-col rounded-[1.5rem] bg-white p-4 shadow-xl">
				{children}
			</div>
		</div>
	)
}

function DialogHeader({
	createdAt,
	onClose,
	type,
}: {
	createdAt: string
	onClose: () => void
	type: string
}) {
	return (
		<div className="flex items-center gap-2">
			<span className="rounded-full  px-2 py-0.5 text-sm bg-primary font-bold text-primary-content">
				{TYPE_LABELS[type] ?? type}
			</span>
			<span className="text-xs font-bold text-primary">{formatTimeAgo(createdAt)}</span>
			<button
				aria-label="Close dialog"
				className="ml-auto text-2xl leading-none text-primary"
				onClick={onClose}
				type="button"
			>
				<X/>
			</button>
		</div>
	)
}

function ExternalAction({ children, href }: { children: ReactNode; href: string }) {
	return (
		<a
			className="btn mt-3 h-9 min-h-0 w-full rounded-full border-none bg-accent text-sm font-bold text-white hover:bg-accent/90"
			href={href}
			rel="noopener noreferrer"
			target="_blank"
		>
			{children}
		</a>
	)
}

export function AnnouncementDialog({
	item,
	onClose,
	onOpenOpportunity,
}: {
	item: NotificationItem
	onClose: () => void
	onOpenOpportunity: () => void
}) {
	const { announcement, createdAt, event } = item
	const canOpenOpportunity = announcement.type === "OPPORTUNITY" && Boolean(event)

	return (
		<DialogFrame label={`${TYPE_LABELS[announcement.type] ?? announcement.type} announcement`}>
			<DialogHeader createdAt={createdAt} onClose={onClose} type={announcement.type} />
			<h2 className="mt-3 text-2xl font-bold text-primary">{announcement.subject}</h2>
			<p className="mt-2 text-sm text-primary">{SENDER_NAME}</p>
			<hr className="my-2 border-primary" />
			<p className="min-h-0 flex-1 overflow-y-auto whitespace-pre-line text-sm text-primary">
				{announcement.message}
			</p>
			{canOpenOpportunity && (
				<Button
					className="mt-3 h-9 min-h-0 w-full border-none bg-accent text-sm font-bold text-white hover:bg-accent/90"
					onClick={onOpenOpportunity}
					rounded
					variant="accent"
				>
					Open Opportunity
				</Button>
			)}
			{!canOpenOpportunity && announcement.type === "OPPORTUNITY" && announcement.link && (
				<ExternalAction href={announcement.link}>Open Opportunity</ExternalAction>
			)}
			{announcement.type === "NEWSLETTER" && announcement.link && (
				<ExternalAction href={announcement.link}>Open Newsletter</ExternalAction>
			)}
		</DialogFrame>
	)
}

export function OpportunityDialog({
	event,
	onClose,
	onSignUp,
}: {
	event: InboxEvent
	onClose: () => void
	onSignUp: () => void
}) {
	return (
		<DialogFrame label={`${event.title} opportunity`}>
			<button
				aria-label="Close dialog"
				className="absolute right-3 top-2 text-xl leading-none text-primary"
				onClick={onClose}
				type="button"
			>
				<X />
			</button>
			<p className="pr-6 text-sm font-bold text-primary">{categoryForEvent(event)}</p>
			<h2 className="mt-1 text-base font-bold text-black">{event.title}</h2>
			<p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
				<MapPinIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
				{event.location ?? "Location to be confirmed"}
			</p>
			<p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
				<CalendarIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
				{formatEventWindow(event.startsAt, event.endsAt)}
			</p>
			{/* TODO: wire the spot count to real data */}
			{!event.signedUp && <p className="mt-2 text-xs font-bold text-accent">3 spots left</p>}
			<hr className="my-2 border-primary" />
			<div className="min-h-0 flex-1 overflow-y-auto">
				<h3 className="text-xs font-bold text-black">About this event</h3>
				<p className="mt-0.5 text-[11px] leading-4 text-primary">{event.description}</p>
				<h3 className="mt-1 text-xs font-bold text-black">Requirements</h3>
				{requirementsFor(event).map((requirement) => (
					<p className="text-[11px] text-primary" key={requirement}>
						{requirement}
					</p>
				))}
			</div>
			<div className="mt-3">
				{event.signedUp ? (
					<p className="rounded-full bg-primary py-1 text-center text-xs font-bold text-white">
						You&apos;re signed up
					</p>
				) : (
					<Button
						className="h-9 min-h-0 w-full border-none bg-accent text-sm font-bold text-white hover:bg-accent/90"
						onClick={onSignUp}
						rounded
						variant="accent"
					>
						Sign up
					</Button>
				)}
			</div>
		</DialogFrame>
	)
}

export function ConfirmSignUpDialog({
	error,
	event,
	onCancel,
	onConfirm,
	pending,
}: {
	error: string
	event: InboxEvent
	onCancel: () => void
	onConfirm: () => void
	pending: boolean
}) {
	return (
		<div aria-label="Confirm sign up" aria-modal="true" className={overlayClassName} role="dialog">
			<div className="w-full max-w-md rounded-2xl border-2 border-primary bg-white px-6 py-7 shadow-xl">
				<div className="text-center">
					<VolunteerCheckIcon className="mx-auto h-9 w-9" />
					<h2 className="mt-3 text-lg font-bold text-black">Sign up for this opportunity?</h2>
					<p className="mx-auto mt-3 max-w-sm text-sm text-black">
						You&apos;re about to sign-up for <strong>{event.title}</strong> on{" "}
						{formatEventWindow(event.startsAt, event.endsAt)} in{" "}
						{event.location ? `${event.location} area` : "the local area"}.
					</p>
					<div className="mt-5 flex flex-wrap justify-center gap-3">
						<Button
							className="h-9 min-h-0 !border-accent !bg-white px-5 text-sm font-bold !text-accent hover:!border-accent hover:!bg-white hover:!text-accent"
							onClick={onCancel}
							rounded
							variant="outline"
						>
							Cancel
						</Button>
						<Button
							className="h-9 min-h-0 border-none bg-accent px-5 text-sm font-bold text-white hover:bg-accent/90"
							loading={pending}
							onClick={onConfirm}
							rounded
							variant="accent"
						>
							Confirm Sign Up
						</Button>
					</div>
					{error && <p className="mt-3 text-sm text-error">{error}</p>}
				</div>
			</div>
		</div>
	)
}

export function SignUpSuccessDialog({ event, onDone }: { event: InboxEvent; onDone: () => void }) {
	return (
		<div aria-label="Sign up complete" aria-modal="true" className={overlayClassName} role="dialog">
			<div className="w-full max-w-md rounded-2xl border-2 border-primary bg-white px-6 py-7 shadow-xl">
				<div className="text-center">
					<CheckIcon className="mx-auto h-10 w-10" />
					<h2 className="mt-3 text-lg font-bold text-black">You&apos;ve signed up!</h2>
					<p className="mx-auto mt-3 max-w-sm text-sm text-black">
						You secured your spot for <strong>{event.title}</strong> on{" "}
						{formatEventWindow(event.startsAt, event.endsAt)}.
					</p>
					<Button
						className="mt-5 h-9 min-h-0 border-none bg-accent px-6 text-sm font-bold text-white hover:bg-accent/90"
						onClick={onDone}
						rounded
						variant="accent"
					>
						Done
					</Button>
				</div>
			</div>
		</div>
	)
}
