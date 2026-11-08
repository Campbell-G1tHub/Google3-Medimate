"use client"

import type { ReactNode, SVGProps } from "react"
import { useMemo, useState } from "react"
import {
	CalendarIcon,
	formatOpportunityDateTime,
	MapPinIcon,
	OpportunityCardBase,
} from "@/components/opportunities/opportunity-card-base"
import { Button } from "@/components/ui/button"
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select"

export interface Opportunity {
	id: string
	title: string
	description: string
	location: string | null
	startsAt: string | null
	endsAt: string | null
	status: string
	signedUp: boolean
}

type Dialog = "details" | "confirm" | "success" | "my-details" | undefined
type Action = "sign-up" | "reserve"

const CATEGORY_OPTIONS: readonly DropdownOption[] = [
	{ value: "Warehouse", label: "Warehouse" },
	{ value: "Digital communications", label: "Digital communications" },
	{ value: "Logistics", label: "Logistics" },
	{ value: "Fundraising", label: "Fundraising" },
	{ value: "Grant writing and Scientific Research", label: "Grant writing and Scientific Research" },
	{ value: "Hospital liaison or representative", label: "Hospital liaison or representative" },
	{ value: "Board member", label: "Board member" },
	{ value: "Community Engagement", label: "Community Engagement" },
	{ value: "Computer Science", label: "Computer Science" },
	{ value: "Industrial design", label: "Industrial design" },
	{ value: "Sustainability Research team", label: "Sustainability Research team" },
	{
		value: "Corporate Sponsorship and Partnerships team",
		label: "Corporate Sponsorship and Partnerships team",
	},
]

const DATE_OPTIONS: readonly DropdownOption[] = [
	{ value: "Any time", label: "Any time" },
	{ value: "This week", label: "This week" },
	{ value: "This weekend", label: "This weekend" },
	{ value: "Next week", label: "Next week" },
	{ value: "This month", label: "This month" },
]

const SORT_OPTIONS: readonly DropdownOption[] = [
	{ value: "Active", label: "Active" },
	{ value: "Inactive", label: "Inactive" },
	{ value: "Newest first", label: "Newest first" },
	{ value: "Oldest first", label: "Oldest first" },
]

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="16"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			viewBox="0 0 24 24"
			width="16"
			{...props}
		>
			{children}
		</svg>
	)
}
function UserCheckIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon height="42" width="42" {...props}>
			<circle cx="9" cy="7" r="4" />
			<path d="M2.5 20c.5-4.1 3-6.5 6.5-6.5 2.3 0 4.2.8 5.4 2.4" />
			<path d="m16 15 2 2 4-4" />
		</Icon>
	)
}
function CheckIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon height="48" width="48" {...props}>
			<path d="M20 12a8 8 0 1 1-2.3-5.7" />
			<path d="m9 12 2.5 2.5L21 5" />
		</Icon>
	)
}
function categoryFor(opportunity: Opportunity) {
	const title = opportunity.title.toLowerCase()
	if (title.includes("delivery")) return "Deliveries"
	if (title.includes("warehouse")) return "Warehouses"
	return "Community"
}

function DialogFrame({
	children,
	onClose,
	variant,
}: {
	children: ReactNode
	onClose: () => void
	variant: "details" | "attended-details" | "confirm" | "success" | "my-details"
}) {
	const className = {
		details: "relative max-w-[28rem] rounded-[1.25rem] border-2 border-primary p-3",
		"attended-details": "relative max-w-[28rem] rounded-[1.25rem] border-[3px] border-primary p-3",
		confirm: "max-w-md rounded-2xl border-2 border-primary px-6 py-7",
		success: "max-w-md rounded-2xl border-2 border-primary px-6 py-7",
		"my-details": "max-w-md overflow-hidden rounded-2xl border-2 border-primary p-0",
	}[variant]
	return (
		<div
			aria-modal="true"
			className="fixed inset-0 z-50 grid place-items-center bg-primary/35 p-5"
			role="dialog"
		>
			<div className={`w-full bg-white shadow-xl ${className}`}>
				{(variant === "details" || variant === "attended-details") && (
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

function OpportunityCard({
	opportunity,
	view,
	onDetails,
	onAction,
}: {
	opportunity: Opportunity
	view: "available" | "attended"
	onDetails: () => void
	onAction: () => void
}) {
	const reserve = opportunity.title.toLowerCase().includes("warehouse")
	return (
		<OpportunityCardBase
			detailsLabel={`View details for ${opportunity.title}`}
			event={opportunity}
			header={<p className="font-bold text-primary">{categoryFor(opportunity)}</p>}
			onDetails={onDetails}
			size="compact"
		>
			{view === "available" && <p className="mt-1 font-bold text-accent">3 spots left</p>}
			<div className="mt-auto pt-1">
				<Button
					className={`h-6 min-h-0 w-full px-2 text-[10px] ${reserve && view === "available" ? "!border-accent !bg-white !text-accent hover:!bg-white" : "border-none bg-accent text-white hover:bg-accent/90"}`}
					onClick={onAction}
					rounded
					variant={reserve && view === "available" ? "outline" : "accent"}
				>
					{view === "attended" ? "My details" : reserve ? "Reserve" : "Sign up"}
				</Button>
			</div>
		</OpportunityCardBase>
	)
}

const FILTER_BUTTON_CLASS = "px-3 py-1.5 text-xs font-bold text-white"

export function OpportunitiesList({
	initialOpportunities,
}: {
	initialOpportunities: Opportunity[]
}) {
	const [opportunities, setOpportunities] = useState(initialOpportunities)
	const [activeView, setActiveView] = useState<"available" | "attended">("available")
	const [query, setQuery] = useState("")
	const [categories, setCategories] = useState<string[]>([])
	const [locationsFilter, setLocationsFilter] = useState<string[]>([])
	const [dates, setDates] = useState<string[]>([])
	const [sort, setSort] = useState("Sort")
	const [selected, setSelected] = useState<Opportunity>()
	const [dialog, setDialog] = useState<Dialog>()
	const [action, setAction] = useState<Action>("sign-up")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState("")
	const locations = useMemo(
		() => [
			...new Set(
				opportunities.map((item) => item.location).filter((item): item is string => Boolean(item)),
			),
		],
		[opportunities],
	)
	const displayed = useMemo(() => {
		const needle = query.trim().toLowerCase()
		return opportunities
			.filter((opportunity) => {
				const matchesView =
					activeView === "attended"
						? opportunity.signedUp
						: opportunity.status === "OPEN" && !opportunity.signedUp

				const matchesSearch =
					!needle ||
					[opportunity.title, opportunity.description, opportunity.location]
						.filter(Boolean)
						.some((value) => value?.toLowerCase().includes(needle))

				const matchesCategory =
					categories.length === 0 ||
					categories.some((item) =>
						categoryFor(opportunity).toLowerCase().startsWith(item.toLowerCase()),
					)

				const matchesLocation =
					locationsFilter.length === 0 ||
					locationsFilter.includes(opportunity.location ?? "")

				const eventDate = opportunity.startsAt ? new Date(opportunity.startsAt) : undefined
				const today = new Date()
				const dayDifference = eventDate
					? Math.floor((eventDate.getTime() - today.getTime()) / 86_400_000)
					: Number.NaN
				const matchesDate =
					dates.length === 0 ||
					dates.some(
						(item) =>
							item === "Any time" ||
							(item === "This week" && dayDifference >= 0 && dayDifference < 7) ||
							(item === "This weekend" && dayDifference >= 0 && dayDifference < 3) ||
							(item === "Next week" && dayDifference >= 7 && dayDifference < 14) ||
							(item === "This month" &&
								eventDate?.getMonth() === today.getMonth() &&
								eventDate.getFullYear() === today.getFullYear()),
					)
				return matchesView && matchesSearch && matchesCategory && matchesLocation && matchesDate
			})
			.sort((a, b) =>
				sort === "Newest first"
					? (b.startsAt ?? "").localeCompare(a.startsAt ?? "")
					: (a.startsAt ?? "").localeCompare(b.startsAt ?? ""),
			)
	}, [activeView, opportunities, query, categories, locationsFilter, dates, sort])
	function closeDialog() {
		setSelected(undefined)
		setDialog(undefined)
		setError("")
	}
	function openDetails(opportunity: Opportunity) {
		setSelected(opportunity)
		setDialog("details")
	}
	function openAction(opportunity: Opportunity) {
		if (activeView === "attended") {
			setSelected(opportunity)
			setDialog("my-details")
			return
		}
		setSelected(opportunity)
		setAction(opportunity.title.toLowerCase().includes("warehouse") ? "reserve" : "sign-up")
		setDialog("confirm")
	}
	async function submitAction() {
		if (!selected) return
		setIsSubmitting(true)
		setError("")
		try {
			const response = await fetch(`/api/events/${selected.id}/sign-up`, { method: "POST" })
			const result = (await response.json()) as { error?: string }
			if (!response.ok) throw new Error(result.error ?? "Unable to update this opportunity.")
			setOpportunities((current) =>
				current.map((item) => (item.id === selected.id ? { ...item, signedUp: true } : item)),
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
			<div className="flex">
				<section className="min-w-0 flex-1 px-4 py-4 md:px-8 md:py-6">
					<div className="mt-2">
						<div className="flex items-center gap-2 text-sm font-bold text-primary">
							<span>Search</span>
							<div className="flex rounded-full border-2 border-primary p-0.5 text-xs">
								<button
									className={`rounded-full px-3 py-0.5 ${activeView === "available" ? "bg-primary text-white" : ""}`}
									onClick={() => setActiveView("available")}
									type="button"
								>
									Available
								</button>
								<button
									className={`rounded-full px-3 py-0.5 ${activeView === "attended" ? "bg-primary text-white" : ""}`}
									onClick={() => setActiveView("attended")}
									type="button"
								>
									Attended
								</button>
							</div>
						</div>
						<label className="sr-only" htmlFor="opportunity-search">
							Search opportunities
						</label>
						<input
							className="mt-2 h-9 w-full max-w-xs rounded-full border border-primary px-3 text-xs outline-none focus:ring-2 focus:ring-secondary"
							id="opportunity-search"
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
								options={CATEGORY_OPTIONS}
								value={categories}
								placeholder="Category"
								onChange={(next) => setCategories(Array.isArray(next) ? next : [next])}
							/>
							<DropdownSelect
								buttonClassName={FILTER_BUTTON_CLASS}
								className="sm:max-w-none"
								menuClassName="w-44 text-xs"
								wrapperClassName="sm:max-w-none"
								options={locations.map((item) => ({ value: item, label: item }))}
								value={locationsFilter}
								placeholder="Location"
								onChange={(next) => setLocationsFilter(Array.isArray(next) ? next : [next])}
							/>
							<DropdownSelect
								buttonClassName={FILTER_BUTTON_CLASS}
								className="sm:max-w-none"
								menuClassName="w-44 text-xs"
								wrapperClassName="sm:max-w-none"
								options={DATE_OPTIONS}
								value={dates}
								placeholder="Date"
								onChange={(next) => setDates(Array.isArray(next) ? next : [next])}
							/>
						</div>
					</div>
					<div className="mt-4 flex  items-center gap-2 text-sm font-bold text-primary">
						<span>{displayed.length} Results</span>
						<DropdownSelect
							buttonClassName={FILTER_BUTTON_CLASS}
							className="sm:max-w-none"
							menuClassName="w-44 text-xs"
							wrapperClassName="sm:max-w-none"
							options={SORT_OPTIONS}
							value={sort}
							placeholder="Sort"
							onChange={(next) =>
								setSort(next === sort ? "Sort" : next === "" ? "Sort" : String(next))
							}
						/>
					</div>
					{displayed.length === 0 ? (
						<p className="mt-4 text-sm text-primary">No opportunities match your filters.</p>
					) : (
						<div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
							{displayed.map((opportunity) => (
								<OpportunityCard
									key={opportunity.id}
									onAction={() => openAction(opportunity)}
									onDetails={() => openDetails(opportunity)}
									opportunity={opportunity}
									view={activeView}
								/>
							))}
						</div>
					)}
				</section>
			</div>
			{selected && dialog === "details" && (
				<DialogFrame
					onClose={closeDialog}
					variant={selected.signedUp ? "attended-details" : "details"}
				>
					<p className="text-sm font-bold text-primary">{categoryFor(selected)}</p>
					<h2 className="mt-1 text-base font-bold text-black">{selected.title}</h2>
					<p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary">
						<MapPinIcon aria-hidden="true" className="h-4 w-4" />
						{selected.location ?? "Location to be confirmed"}
					</p>
					<p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
						<CalendarIcon aria-hidden="true" className="h-4 w-4" />
						{formatOpportunityDateTime(selected.startsAt)}
					</p>
					{!selected.signedUp && <p className="mt-2 text-xs font-bold text-accent">3 spots left</p>}
					<hr className="my-2 border-primary" />
					<h3 className="text-xs font-bold text-black">About this event</h3>
					<p className="mt-0.5 text-[11px] leading-3 text-primary">{selected.description}</p>
					<h3 className="mt-1 text-xs font-bold text-black">Requirements</h3>
					<p className="text-[11px] text-primary">
						{selected.title.toLowerCase().includes("delivery")
							? "Car · Driver licence"
							: "No specific requirements"}
					</p>
				</DialogFrame>
			)}
			{selected && dialog === "confirm" && (
				<DialogFrame onClose={closeDialog} variant="confirm">
					<div className="text-center">
						<UserCheckIcon className="mx-auto h-9 w-9" />
						<h2 className="mt-3 text-lg font-bold text-black">
							{action === "reserve" ? "Reserve this opportunity?" : "Sign up for this opportunity?"}
						</h2>
						<p className="mx-auto mt-3 max-w-sm text-sm text-black">
							You&apos;re about to {action === "reserve" ? "reserve" : "sign-up for"}{" "}
							<strong>{selected.title}</strong> on {formatOpportunityDateTime(selected.startsAt)} in{" "}
							{selected.location ?? "the local area"}.
						</p>
						<div className="mt-5 flex flex-wrap justify-center gap-3">
							{action === "sign-up" && (
								<Button
									className="h-9 min-h-0 !border-accent !bg-white px-5 text-sm font-bold !text-accent hover:!border-accent hover:!bg-white hover:!text-accent"
									onClick={closeDialog}
									rounded
									variant="outline"
								>
									Cancel
								</Button>
							)}
							<Button
								className="h-9 min-h-0 border-none bg-accent px-5 text-sm font-bold text-white hover:bg-accent/90"
								loading={isSubmitting}
								onClick={() => void submitAction()}
								rounded
								variant="accent"
							>
								{action === "reserve" ? "Reserve" : "Confirm Sign Up"}
							</Button>
						</div>
						{error && <p className="mt-3 text-sm text-error">{error}</p>}
					</div>
				</DialogFrame>
			)}
			{selected && dialog === "success" && (
				<DialogFrame onClose={closeDialog} variant="success">
					<div className="text-center">
						<CheckIcon className="mx-auto h-10 w-10" />
						<h2 className="mt-3 text-lg font-bold text-black">
							{action === "reserve" ? "You've been reserved!" : "You've signed up!"}
						</h2>
						<p className="mx-auto mt-3 max-w-sm text-sm text-black">
							{action === "reserve" ? "You reserved for" : "You secured your spot for"}{" "}
							<strong>{selected.title}</strong> on {formatOpportunityDateTime(selected.startsAt)}.
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
				</DialogFrame>
			)}
			{selected && dialog === "my-details" && (
				<DialogFrame onClose={closeDialog} variant="my-details">
					<div className="flex items-center justify-between bg-primary px-4 py-3 text-sm font-bold text-white">
						<span>My details</span>
						<button
							aria-label="Close dialog"
							className="text-2xl leading-none"
							onClick={closeDialog}
							type="button"
						>
							×
						</button>
					</div>
					<div className="space-y-4 p-4 text-xs text-primary">
						<p>
							<strong>Sign up time:</strong> 12:32pm, 25/08/2026
						</p>
						<p>
							<strong>Start time/date:</strong> 2:00pm, 01/09/2026
						</p>
						<p>
							<strong>End time/date:</strong> 4:00pm, 01/09/2026
						</p>
						<p>
							<strong>Total time:</strong> 2 hours
						</p>
						<p>
							<strong>Total orders packed:</strong> 46
						</p>
					</div>
				</DialogFrame>
			)}
		</main>
	)
}
