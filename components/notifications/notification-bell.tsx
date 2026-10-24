"use client"

import Image from "next/image"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import type { NotificationItem } from "@/lib/announcements"
import { ANNOUNCEMENT_TYPE_OPTIONS } from "@/lib/validation/announcement"
import { usePushSubscription } from "./use-push-subscription"

const LIST_API = "/api/volunteers/dashboard/inbox/list-notifications"
const MARK_READ_API = "/api/volunteers/dashboard/inbox/mark-read"
const REFRESH_INTERVAL_MS = 60_000

const TYPE_LABELS = Object.fromEntries(
	ANNOUNCEMENT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
)

const relativeTime = new Intl.RelativeTimeFormat("en-AU", { numeric: "auto" })
const TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	["day", 86_400_000],
	["hour", 3_600_000],
	["minute", 60_000],
]

function formatTimeAgo(iso: string) {
	const elapsed = new Date(iso).getTime() - Date.now()
	for (const [unit, ms] of TIME_UNITS) {
		if (Math.abs(elapsed) >= ms) {
			return relativeTime.format(Math.round(elapsed / ms), unit)
		}
	}
	return "just now"
}

async function postJson<T>(url: string, body: unknown = {}): Promise<T> {
	const response = await fetch(url, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	})
	if (!response.ok) {
		throw new Error(`Request failed with ${response.status}`)
	}
	return response.json()
}

export function NotificationBell() {
	const panelId = useId()
	const wrapperRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const [isOpen, setIsOpen] = useState(false)
	const [notifications, setNotifications] = useState<NotificationItem[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
	const [expandedId, setExpandedId] = useState<string | null>(null)

	const refresh = useCallback(async () => {
		try {
			const data = await postJson<{ notifications: NotificationItem[]; unreadCount: number }>(
				LIST_API,
			)
			setNotifications(data.notifications)
			setUnreadCount(data.unreadCount)
			setStatus("ready")
		} catch {
			setStatus("error")
		}
	}, [])

	useEffect(() => {
		refresh()
		const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS)
		const onMessage = (event: MessageEvent) => {
			if (event.data?.type === "notification-received") {
				refresh()
			}
		}

		window.addEventListener("focus", refresh)
		navigator.serviceWorker?.addEventListener("message", onMessage)

		return () => {
			window.clearInterval(interval)
			window.removeEventListener("focus", refresh)
			navigator.serviceWorker?.removeEventListener("message", onMessage)
		}
	}, [refresh])

	useEffect(() => {
		if (!isOpen) {
			return
		}

		const onPointerDown = (event: PointerEvent) => {
			if (!wrapperRef.current?.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false)
				buttonRef.current?.focus()
			}
		}

		document.addEventListener("pointerdown", onPointerDown)
		document.addEventListener("keydown", onKeyDown)
		return () => {
			document.removeEventListener("pointerdown", onPointerDown)
			document.removeEventListener("keydown", onKeyDown)
		}
	}, [isOpen])

	function toggle() {
		if (!isOpen) {
			refresh()
		}
		setIsOpen((open) => !open)
	}

	async function markRead(notificationIds?: string[]) {
		const now = new Date().toISOString()
		setNotifications((items) =>
			items.map((item) =>
				!item.readAt && (!notificationIds || notificationIds.includes(item.id))
					? { ...item, readAt: now }
					: item,
			),
		)

		try {
			const data = await postJson<{ unreadCount: number }>(MARK_READ_API, { notificationIds })
			setUnreadCount(data.unreadCount)
		} catch {
			refresh()
		}
	}

	function openNotification(item: NotificationItem) {
		setExpandedId((current) => (current === item.id ? null : item.id))
		if (!item.readAt) {
			setUnreadCount((count) => Math.max(0, count - 1))
			markRead([item.id])
		}
	}

	function markAllRead() {
		setUnreadCount(0)
		markRead()
	}

	const badgeText = unreadCount > 9 ? "9+" : String(unreadCount)

	return (
		<div ref={wrapperRef} className="relative">
			<button
				ref={buttonRef}
				type="button"
				onClick={toggle}
				className="btn btn-ghost btn-circle relative"
				aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
				aria-expanded={isOpen}
				aria-controls={panelId}
			>
				<Image src="/icons/bell.svg" alt="" width={20} height={25} />
				{unreadCount > 0 && (
					<span
						data-testid="notification-badge"
						aria-hidden="true"
						className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-semibold leading-none text-accent-content"
					>
						{badgeText}
					</span>
				)}
			</button>

			{isOpen && (
				<section
					id={panelId}
					aria-label="Notifications"
					className="fixed inset-x-4 top-16 z-50 flex max-h-[70vh] flex-col overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-lg sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-96"
				>
					<header className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
						<h2 className="text-base text-primary">Notifications</h2>
						<button
							type="button"
							onClick={markAllRead}
							disabled={unreadCount === 0}
							className="btn btn-link btn-sm px-0 text-secondary no-underline disabled:bg-transparent"
						>
							Mark all as read
						</button>
					</header>

					<div className="grow overflow-y-auto">
						{status === "loading" && notifications.length === 0 ? (
							<div className="flex justify-center py-8">
								<span className="loading loading-spinner loading-md text-primary" />
							</div>
						) : status === "error" && notifications.length === 0 ? (
							<div className="flex flex-col items-center gap-3 px-4 py-8 text-center text-sm">
								<p>We couldn't load your notifications.</p>
								<button type="button" onClick={refresh} className="btn btn-outline btn-primary btn-sm rounded-full">
									Try again
								</button>
							</div>
						) : notifications.length === 0 ? (
							<p className="px-4 py-8 text-center text-sm text-base-content/65">
								You're all caught up.
							</p>
						) : (
							<ul className="divide-y divide-base-300">
								{notifications.map((item) => (
									<NotificationRow
										key={item.id}
										item={item}
										isExpanded={expandedId === item.id}
										onOpen={() => openNotification(item)}
									/>
								))}
							</ul>
						)}
					</div>

					<PushToggle />
				</section>
			)}
		</div>
	)
}

interface NotificationRowProps {
	item: NotificationItem
	isExpanded: boolean
	onOpen: () => void
}

function NotificationRow({ item, isExpanded, onOpen }: NotificationRowProps) {
	const isUnread = !item.readAt
	const { announcement } = item

	return (
		<li className={isUnread ? "bg-base-200" : undefined}>
			<button
				type="button"
				onClick={onOpen}
				aria-expanded={isExpanded}
				className="flex w-full gap-3 px-4 py-3 text-left hover:bg-base-300/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary"
			>
				<span
					aria-hidden="true"
					className={`mt-1.5 size-2 shrink-0 rounded-full ${isUnread ? "bg-accent" : "bg-transparent"}`}
				/>
				<span className="flex min-w-0 grow flex-col gap-1">
					<span className="flex items-center justify-between gap-2">
						<span className="badge badge-outline badge-primary badge-xs">
							{TYPE_LABELS[announcement.type] ?? announcement.type}
						</span>
						<time dateTime={item.createdAt} className="text-xs text-base-content/60">
							{formatTimeAgo(item.createdAt)}
						</time>
					</span>
					<span className={`text-sm text-primary ${isUnread ? "font-semibold" : "font-medium"}`}>
						{announcement.subject}
						{isUnread && <span className="sr-only">, unread</span>}
					</span>
					<span
						className={`text-sm whitespace-pre-line text-base-content/70 ${isExpanded ? "" : "line-clamp-2"}`}
					>
						{announcement.message}
					</span>
				</span>
			</button>
			{isExpanded && announcement.link && (
				<div className="px-4 pb-3 pl-9">
					<a
						href={announcement.link}
						target="_blank"
						rel="noopener noreferrer"
						className="link link-secondary text-sm font-medium"
					>
						{announcement.type === "NEWSLETTER" ? "Read the newsletter" : "Open link"}
					</a>
				</div>
			)}
		</li>
	)
}

function PushToggle() {
	const { status, isBusy, subscribe, unsubscribe } = usePushSubscription()

	if (status === "loading" || status === "unsupported") {
		return null
	}

	return (
		<footer className="flex items-center justify-between gap-3 border-t border-base-300 px-4 py-3 text-sm">
			{status === "denied" ? (
				<p className="text-base-content/65">
					Push notifications are blocked. Allow them in your browser settings to get alerts.
				</p>
			) : (
				<>
					<span className="text-base-content/80">
						{status === "subscribed" ? "Push notifications are on" : "Get alerts on this device"}
					</span>
					<button
						type="button"
						onClick={status === "subscribed" ? unsubscribe : subscribe}
						disabled={isBusy}
						className={`btn btn-sm shrink-0 rounded-full ${status === "subscribed" ? "btn-outline btn-primary" : "btn-primary"}`}
					>
						{isBusy && <span className="loading loading-spinner loading-xs" aria-hidden="true" />}
						{status === "subscribed" ? "Turn off" : "Turn on"}
					</button>
				</>
			)}
		</footer>
	)
}
