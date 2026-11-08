"use client"

import { useEffect, useMemo, useState } from "react"
import {
	AnnouncementDialog,
	ConfirmSignUpDialog,
	OpportunityDialog,
	SignUpSuccessDialog,
} from "@/components/inbox/inbox-dialogs"
import { type DropdownOption, DropdownSelect } from "@/components/ui/dropdown-select"
import type { NotificationItem } from "@/lib/announcements"
import { formatTimeAgo } from "@/lib/relative-time"
import { ANNOUNCEMENT_TYPE_OPTIONS } from "@/lib/validation/announcement"

const MARK_READ_API = "/api/volunteers/dashboard/inbox/mark-read"
const FILTER_BUTTON_CLASS = "px-3 py-1.5 text-xs font-bold text-white"

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
	ANNOUNCEMENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const SORT_OPTIONS: readonly DropdownOption[] = [
	{ value: "Newest first", label: "Newest first" },
	{ value: "Oldest first", label: "Oldest first" },
]

type Dialog = "announcement" | "opportunity" | "confirm" | "success"

function NotificationRow({
	item,
	now,
	onOpen,
}: {
	item: NotificationItem
	now: number | undefined
	onOpen: () => void
}) {
	const isUnread = !item.readAt
	const { announcement } = item

	return (
		<button
			aria-haspopup="dialog"
			className="flex w-full max-w-xl items-center gap-3 rounded-full border-2 border-primary bg-white px-3 py-1.5 text-left text-[11px] text-primary hover:bg-base-200/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:text-xs"
			onClick={onOpen}
			type="button"
		>
			<span className="w-24 shrink-0 truncate font-bold sm:w-36">
				{TYPE_LABELS[announcement.type] ?? announcement.type}
			</span>
			<span className="flex min-w-0 flex-1 items-center gap-1.5">
				{isUnread && <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />}
				<span className={`truncate ${isUnread ? "font-bold" : "font-medium"}`}>
					{announcement.subject}
				</span>
				{isUnread && <span className="sr-only">, unread</span>}
			</span>
			<span className="shrink-0 font-bold">
				{now === undefined ? "" : formatTimeAgo(item.createdAt, now)}
			</span>
		</button>
	)
}

/**
 * The volunteer inbox: every announcement notification they have received, newest first,
 * with search/type filters. Clicking a row marks it read and opens the modal for its type;
 * opportunity announcements lead into the event details and the sign-up flow.
 */
export function InboxList({ initialNotifications }: { initialNotifications: NotificationItem[] }) {
	const [notifications, setNotifications] = useState(initialNotifications)
	const [query, setQuery] = useState("")
	const [types, setTypes] = useState<string[]>([])
	const [sort, setSort] = useState("Sort")
	const [selected, setSelected] = useState<NotificationItem>()
	const [dialog, setDialog] = useState<Dialog>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState("")
	// Relative labels are computed after mount so the server and client render agree.
	const [now, setNow] = useState<number>()

	useEffect(() => {
		const tick = () => setNow(Date.now())
		tick()
		const interval = window.setInterval(tick, 60_000)
		return () => window.clearInterval(interval)
	}, [])

	const displayed = useMemo(() => {
		const needle = query.trim().toLowerCase()
		return notifications
			.filter(({ announcement }) => {
				const matchesSearch =
					!needle ||
					[announcement.subject, announcement.message].some((value) =>
						value.toLowerCase().includes(needle),
					)
				const matchesType = types.length === 0 || types.includes(announcement.type)
				return matchesSearch && matchesType
			})
			.sort((a, b) =>
				sort === "Oldest first"
					? a.createdAt.localeCompare(b.createdAt)
					: b.createdAt.localeCompare(a.createdAt),
			)
	}, [notifications, query, types, sort])

	const selectedEvent = selected?.event ?? undefined

	function closeDialog() {
		setSelected(undefined)
		setDialog(undefined)
		setError("")
	}

	function openNotification(item: NotificationItem) {
		setSelected(item)
		setDialog("announcement")
		setError("")
		if (!item.readAt) {
			void markRead(item.id)
		}
	}

	async function markRead(notificationId: string) {
		const readAt = new Date().toISOString()
		setNotifications((items) =>
			items.map((item) =>
				item.id === notificationId && !item.readAt ? { ...item, readAt } : item,
			),
		)

		try {
			await fetch(MARK_READ_API, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ notificationIds: [notificationId] }),
			})
		} catch {
			// A failed mark-read leaves the row unread; the bell refreshes on its own schedule.
		}
	}

	async function submitSignUp() {
		if (!selected?.event) return

		setIsSubmitting(true)
		setError("")
		try {
			const response = await fetch(`/api/events/${selected.event.id}/sign-up`, {
				method: "POST",
			})
			const result = (await response.json()) as { error?: string }
			if (!response.ok) throw new Error(result.error ?? "Unable to update this opportunity.")

			setNotifications((items) =>
				items.map((item) =>
					item.id === selected.id && item.event
						? { ...item, event: { ...item.event, signedUp: true } }
						: item,
				),
			)
			setDialog("success")
		} catch (submitError) {
			setError(
				submitError instanceof Error ? submitError.message : "Unable to update this opportunity.",
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="bg-white pb-16 md:pb-0">
			<section className="px-4 md:px-8">
				<h2 className="mt-2 text-base font-bold text-primary">Search</h2>
				<label className="sr-only" htmlFor="inbox-search">
					Search notifications
				</label>
				<input
					className="mt-2 h-9 w-full max-w-xs rounded-full border border-primary px-3 text-xs outline-none focus:ring-2 focus:ring-secondary"
					id="inbox-search"
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search..."
					value={query}
				/>
				<div className="mt-2 flex flex-wrap gap-2">
					<DropdownSelect
						buttonClassName={FILTER_BUTTON_CLASS}
						className="sm:max-w-none"
						menuClassName="w-44 text-xs"
						wrapperClassName="sm:max-w-none"
						options={ANNOUNCEMENT_TYPE_OPTIONS}
						value={types}
						placeholder="Type"
						onChange={(next) => setTypes(Array.isArray(next) ? next : [next])}
					/>
					<DropdownSelect
						buttonClassName={FILTER_BUTTON_CLASS}
						className="sm:max-w-none"
						menuClassName="w-44 text-xs"
						wrapperClassName="sm:max-w-none"
						options={SORT_OPTIONS}
						value={sort}
						placeholder="Sort"
						onChange={(next) => setSort(next === "" ? "Sort" : String(next))}
					/>
				</div>
				<p className="mt-4 text-sm font-bold text-primary">{displayed.length} Results</p>
				{displayed.length === 0 ? (
					<p className="mt-2 text-sm text-primary">No messages match your filters.</p>
				) : (
					<div className="mt-2 max-h-[60vh] overflow-y-auto pr-1">
						<ul className="flex flex-col gap-2">
							{displayed.map((item) => (
								<li key={item.id}>
									<NotificationRow item={item} now={now} onOpen={() => openNotification(item)} />
								</li>
							))}
						</ul>
					</div>
				)}
			</section>
			{selected && dialog === "announcement" && (
				<AnnouncementDialog
					item={selected}
					onClose={closeDialog}
					onOpenOpportunity={() => setDialog("opportunity")}
				/>
			)}
			{selectedEvent && dialog === "opportunity" && (
				<OpportunityDialog
					event={selectedEvent}
					onClose={closeDialog}
					onSignUp={() => setDialog("confirm")}
				/>
			)}
			{selectedEvent && dialog === "confirm" && (
				<ConfirmSignUpDialog
					error={error}
					event={selectedEvent}
					onCancel={() => {
						setError("")
						setDialog("opportunity")
					}}
					onConfirm={() => void submitSignUp()}
					pending={isSubmitting}
				/>
			)}
			{selectedEvent && dialog === "success" && (
				<SignUpSuccessDialog event={selectedEvent} onDone={closeDialog} />
			)}
		</main>
	)
}
