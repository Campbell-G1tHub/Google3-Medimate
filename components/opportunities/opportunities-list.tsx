"use client"

import type { ReactNode, SVGProps } from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

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
type FilterMenu = "category" | "location" | "date" | "sort" | undefined

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
function formatDateTime(value: string | null) {
	if (!value) return "Time to be confirmed"
	return new Intl.DateTimeFormat("en-AU", {
		day: "2-digit",
		month: "2-digit",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(value))
}
function categoryFor(opportunity: Opportunity) {
	const title = opportunity.title.toLowerCase()
	if (title.includes("delivery")) return "Deliveries"
	if (title.includes("warehouse")) return "Warehouses"
	return "Community"
}

function FilterButton({
	label,
	open,
	onClick,
}: {
	label: string
	open: boolean
	onClick: () => void
}) {
	return (
		<button
			aria-expanded={open}
			className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white"
			onClick={onClick}
			type="button"
		>
			{label} <span className="text-[9px]">{open ? "▲" : "▼"}</span>
		</button>
	)
}
function FilterDropdown({
	label,
	options,
	selected,
	onSelect,
}: {
	label: string
	options: string[]
	selected: string
	onSelect: (value: string) => void
}) {
	return (
		<div className="absolute left-0 top-9 z-20 w-44 overflow-hidden rounded-2xl border-2 border-primary bg-white text-xs shadow-md">
			<div className="flex items-center justify-between bg-primary px-3 py-2 font-bold text-white">
				<span>{label}</span>
				<span>▲</span>
			</div>
			{options.map((option) => (
				<button
					className={`flex w-full items-center justify-between border-b border-primary/70 px-3 py-2 text-left last:border-b-0 ${selected === option ? "bg-base-200 font-bold" : ""}`}
					key={option}
					onClick={() => onSelect(option)}
					type="button"
				>
					{option}
					<span
						aria-hidden="true"
						className={`grid h-4 w-4 shrink-0 place-items-center border border-primary text-[10px] leading-none ${selected === option ? "bg-primary text-white" : "bg-white text-transparent"}`}
					>
						✓
					</span>
				</button>
			))}
		</div>
	)
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
		<article className="flex h-36 w-48 shrink-0 flex-col rounded-2xl border-2 border-primary bg-white p-2 text-[10px] shadow-sm">
			<div className="flex items-start justify-between gap-2">
				<p className="font-bold text-primary">{categoryFor(opportunity)}</p>
				<button
					aria-label={`View details for ${opportunity.title}`}
					className="text-primary"
					onClick={onDetails}
					type="button"
				>
					<ExpandIcon />
				</button>
			</div>
			<h2 className="mt-1 font-bold text-primary">{opportunity.title}</h2>
			<div className="mt-1.5 space-y-0.5 text-primary">
				<p className="flex items-center gap-1">
					<MapPinIcon />
					{opportunity.location ?? "Location to be confirmed"}
				</p>
				<p className="flex items-center gap-1">
					<CalendarIcon />
					{formatDateTime(opportunity.startsAt)}
				</p>
			</div>
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
		</article>
	)
}

export function OpportunitiesList({
	initialOpportunities,
}: {
	initialOpportunities: Opportunity[]
}) {
	const [opportunities, setOpportunities] = useState(initialOpportunities)
	const [activeView, setActiveView] = useState<"available" | "attended">("available")
	const [query, setQuery] = useState("")
	const [category, setCategory] = useState("Category")
	const [location, setLocation] = useState("Location")
	const [date, setDate] = useState("Date")
	const [sort, setSort] = useState("Sort")
	const [openMenu, setOpenMenu] = useState<FilterMenu>()
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
					category === "Category" ||
					categoryFor(opportunity).toLowerCase().startsWith(category.toLowerCase())
				const eventDate = opportunity.startsAt ? new Date(opportunity.startsAt) : undefined
				const today = new Date()
				const dayDifference = eventDate
					? Math.floor((eventDate.getTime() - today.getTime()) / 86_400_000)
					: Number.NaN
				const matchesDate =
					date === "Date" ||
					date === "Any time" ||
					(date === "This week" && dayDifference >= 0 && dayDifference < 7) ||
					(date === "This weekend" && dayDifference >= 0 && dayDifference < 3) ||
					(date === "Next week" && dayDifference >= 7 && dayDifference < 14) ||
					(date === "This month" &&
						eventDate?.getMonth() === today.getMonth() &&
						eventDate.getFullYear() === today.getFullYear())
				return (
					matchesView &&
					matchesSearch &&
					matchesCategory &&
					matchesDate &&
					(location === "Location" || opportunity.location === location)
				)
			})
			.sort((a, b) =>
				sort === "Newest first"
					? (b.startsAt ?? "").localeCompare(a.startsAt ?? "")
					: (a.startsAt ?? "").localeCompare(b.startsAt ?? ""),
			)
	}, [activeView, opportunities, query, category, location, date, sort])
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
	function choose(
		setter: (value: string) => void,
		value: string,
		current: string,
		defaultValue: string,
	) {
		setter(value === current ? defaultValue : value)
	}
	return (
		<main className="min-h-screen bg-white pb-16 md:pb-0">
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
							<div className="relative">
								<FilterButton
									label="Category"
									open={openMenu === "category"}
									onClick={() => setOpenMenu(openMenu === "category" ? undefined : "category")}
								/>
								{openMenu === "category" && (
									<FilterDropdown
										label="Category"
										options={[
											"Warehouse",
											"Digital communications",
											"Logistics",
											"Fundraising",
											"Grant writing and Scientific Research",
											"Hospital liaison or representative",
											"Board member",
											"Community Engagement",
											"Computer Science",
											"Industrial design",
											"Sustainability Research team",
											"Corporate Sponsorship and Partnerships team",
										]}
										selected={category}
										onSelect={(value) => choose(setCategory, value, category, "Category")}
									/>
								)}
							</div>
							<div className="relative">
								<FilterButton
									label="Location"
									open={openMenu === "location"}
									onClick={() => setOpenMenu(openMenu === "location" ? undefined : "location")}
								/>
								{openMenu === "location" && (
									<FilterDropdown
										label="Location"
										options={locations}
										selected={location}
										onSelect={(value) => choose(setLocation, value, location, "Location")}
									/>
								)}
							</div>
							<div className="relative">
								<FilterButton
									label="Date"
									open={openMenu === "date"}
									onClick={() => setOpenMenu(openMenu === "date" ? undefined : "date")}
								/>
								{openMenu === "date" && (
									<FilterDropdown
										label="Date"
										options={["Any time", "This week", "This weekend", "Next week", "This month"]}
										selected={date}
										onSelect={(value) => choose(setDate, value, date, "Date")}
									/>
								)}
							</div>
						</div>
					</div>
					<div className="mt-4 flex items-center gap-2 text-sm font-bold text-primary">
						<span>{displayed.length} Results</span>
						<div className="relative">
							<FilterButton
								label="Sort"
								open={openMenu === "sort"}
								onClick={() => setOpenMenu(openMenu === "sort" ? undefined : "sort")}
							/>
							{openMenu === "sort" && (
								<FilterDropdown
									label="Sort"
									options={["Active", "Inactive", "Newest first", "Oldest first"]}
									selected={sort}
									onSelect={(value) => choose(setSort, value, sort, "Sort")}
								/>
							)}
						</div>
					</div>
					{displayed.length === 0 ? (
						<p className="mt-4 text-sm text-primary">No opportunities match your filters.</p>
					) : (
						<div className="mt-2 flex flex-wrap gap-2">
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
					<p
						className={
							selected.signedUp
								? "text-sm font-bold text-primary"
								: "text-sm font-bold text-primary"
						}
					>
						{categoryFor(selected)}
					</p>
					<h2
						className={
							selected.signedUp
								? "mt-1 text-base font-bold text-black"
								: "mt-1 text-base font-bold text-black"
						}
					>
						{selected.title}
					</h2>
					<p
						className={
							selected.signedUp
								? "mt-2 flex items-center gap-1.5 text-xs font-medium text-primary"
								: "mt-2 flex items-center gap-1.5 text-xs font-medium text-primary"
						}
					>
						<MapPinIcon className="h-4 w-4" />
						{selected.location ?? "Location to be confirmed"}
					</p>
					<p
						className={
							selected.signedUp
								? "mt-1 flex items-center gap-1.5 text-xs font-medium text-primary"
								: "mt-1 flex items-center gap-1.5 text-xs font-medium text-primary"
						}
					>
						<CalendarIcon className="h-4 w-4" />
						{formatDateTime(selected.startsAt)}
					</p>
					{!selected.signedUp && <p className="mt-2 text-xs font-bold text-accent">3 spots left</p>}
					<hr className="my-2 border-primary" />
					<h3
						className={
							selected.signedUp ? "text-xs font-bold text-black" : "text-xs font-bold text-black"
						}
					>
						About this event
					</h3>
					<p
						className={
							selected.signedUp
								? "mt-0.5 text-[11px] leading-3 text-primary"
								: "mt-0.5 text-[11px] leading-3 text-primary"
						}
					>
						{selected.description}
					</p>
					<h3
						className={
							selected.signedUp
								? "mt-1 text-xs font-bold text-black"
								: "mt-1 text-xs font-bold text-black"
						}
					>
						Requirements
					</h3>
					<p
						className={selected.signedUp ? "text-[11px] text-primary" : "text-[11px] text-primary"}
					>
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
							<strong>{selected.title}</strong> on {formatDateTime(selected.startsAt)} in{" "}
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
							<strong>{selected.title}</strong> on {formatDateTime(selected.startsAt)}.
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
