"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { OpportunityDetailsModal } from "@/components/opportunities/opportunity-details-modal"
import { Button } from "@/components/ui/button"
import { DropdownSelect } from "@/components/ui/dropdown-select"
import type { AdminOpportunity } from "@/lib/opportunities"
import {
	describeOpportunityStatus,
	OPPORTUNITY_CATEGORY_OPTIONS,
	OPPORTUNITY_DATE_FILTER_OPTIONS,
	OPPORTUNITY_SORT_OPTIONS,
	type OpportunitySort,
} from "@/lib/validation/opportunity"
import { CreateOpportunityDialog } from "./create-opportunity-dialog"
import { DeleteOpportunityDialog } from "./delete-opportunity-dialog"
import { EditOpportunityDialog } from "./edit-opportunity-dialog"

const OPPORTUNITIES_API = "/api/admin/opportunities"

const dateFormat = new Intl.DateTimeFormat("en-AU", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
})

const FILTER_BUTTON_CLASS = "w-auto px-3 py-1.5 text-xs font-bold"

function formatDate(value: string | null) {
	if (!value) {
		return "Time TBC"
	}

	return dateFormat.format(new Date(value))
}

/** Active opportunities read as red like the design; finished ones step back. */
function statusClass(status: string) {
	return status === "OPEN" || status === "IN_PROGRESS" ? "text-accent" : "text-primary/70"
}

function matchesDateFilter(startsAt: string | null, filters: readonly string[]) {
	if (filters.length === 0) {
		return true
	}

	const eventDate = startsAt ? new Date(startsAt) : undefined
	const today = new Date()
	const difference = eventDate
		? Math.floor((eventDate.getTime() - today.getTime()) / 86_400_000)
		: Number.NaN

	return filters.some(
		(item) =>
			item === "Any time" ||
			(item === "This week" && difference >= 0 && difference < 7) ||
			(item === "This weekend" && difference >= 0 && difference < 3) ||
			(item === "Next week" && difference >= 7 && difference < 14) ||
			(item === "This month" &&
				eventDate?.getMonth() === today.getMonth() &&
				eventDate.getFullYear() === today.getFullYear()),
	)
}

/**
 * The per-row "Manage" dropdown: the trigger plus the Edit/Delete actions. Closes on an outside
 * press or Escape, handing focus back to the trigger the way a menu button is expected to.
 */
function ManageMenu({
	opportunity,
	onEdit,
	onDelete,
}: {
	opportunity: AdminOpportunity
	onEdit: () => void
	onDelete: () => void
}) {
	const [isOpen, setIsOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)

	useEffect(() => {
		if (!isOpen) {
			return
		}

		function closeOnOutsidePress(event: PointerEvent) {
			if (!containerRef.current?.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false)
				triggerRef.current?.focus()
			}
		}

		document.addEventListener("pointerdown", closeOnOutsidePress)
		document.addEventListener("keydown", closeOnEscape)
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePress)
			document.removeEventListener("keydown", closeOnEscape)
		}
	}, [isOpen])

	function choose(action: () => void) {
		setIsOpen(false)
		action()
	}

	return (
		<div ref={containerRef} className="relative">
			<Button
				ref={triggerRef}
				variant="accent"
				size="small"
				className="gap-1 px-3"
				aria-haspopup="menu"
				aria-expanded={isOpen}
				aria-label={`Manage ${opportunity.role}`}
				onClick={() => setIsOpen((open) => !open)}
			>
				Manage
				{isOpen ? (
					<ChevronUp aria-hidden="true" size={16} />
				) : (
					<ChevronDown aria-hidden="true" size={16} />
				)}
			</Button>

			{isOpen && (
				<div
					role="menu"
					aria-label={`Manage ${opportunity.role}`}
					className="absolute right-0 z-20 mt-2 flex w-52 flex-col overflow-hidden rounded-2xl border-2 border-primary bg-base-100 py-1 text-left shadow-md"
				>
					<button
						type="button"
						role="menuitem"
						className="w-full px-4 py-2 text-left text-sm font-semibold text-primary hover:bg-base-200"
						onClick={() => choose(onEdit)}
					>
						Edit Opportunity
					</button>
					<button
						type="button"
						role="menuitem"
						className="w-full px-4 py-2 text-left text-sm font-semibold text-accent hover:bg-base-200"
						onClick={() => choose(onDelete)}
					>
						Delete Opportunity
					</button>
				</div>
			)}
		</div>
	)
}

/**
 * Admin list of the opportunities the signed-in admin has created: search, category/location/date
 * filters and sorting, plus the entry point for creating a new opportunity.
 */
export function OpportunityList() {
	const [opportunities, setOpportunities] = useState<AdminOpportunity[]>([])
	const [state, setState] = useState<"loading" | "ready" | "error">("loading")
	const [query, setQuery] = useState("")
	const [categories, setCategories] = useState<string[]>([])
	const [locations, setLocations] = useState<string[]>([])
	const [dates, setDates] = useState<string[]>([])
	const [sort, setSort] = useState<OpportunitySort>("newest")
	const [isCreating, setIsCreating] = useState(false)
	const [detailsFor, setDetailsFor] = useState<AdminOpportunity>()
	const [editingFor, setEditingFor] = useState<AdminOpportunity>()
	const [deletingFor, setDeletingFor] = useState<AdminOpportunity>()

	const load = useCallback(async (signal?: AbortSignal) => {
		const response = await fetch(OPPORTUNITIES_API, { signal })

		if (!response.ok) {
			throw new Error(`Loading opportunities failed with ${response.status}`)
		}

		const data: { opportunities: AdminOpportunity[] } = await response.json()
		setOpportunities(data.opportunities)
	}, [])

	useEffect(() => {
		const controller = new AbortController()

		async function loadOpportunities() {
			try {
				await load(controller.signal)
				if (!controller.signal.aborted) {
					setState("ready")
				}
			} catch (error) {
				if (!controller.signal.aborted) {
					console.error(error)
					setState("error")
				}
			}
		}

		void loadOpportunities()

		return () => controller.abort()
	}, [load])

	const refresh = useCallback(() => {
		setState("loading")

		load()
			.then(() => setState("ready"))
			.catch((error) => {
				console.error(error)
				setState("error")
			})
	}, [load])

	const locationOptions = useMemo(
		() => [
			...new Set(
				opportunities
					.map((opportunity) => opportunity.location)
					.filter((value): value is string => Boolean(value)),
			),
		],
		[opportunities],
	)

	const displayed = useMemo(() => {
		const needle = query.trim().toLowerCase()

		return opportunities
			.filter((opportunity) => {
				const matchesSearch =
					!needle ||
					[opportunity.category, opportunity.role, opportunity.location, opportunity.description]
						.filter(Boolean)
						.some((value) => value?.toLowerCase().includes(needle))
				const matchesCategory =
					categories.length === 0 ||
					categories.some((item) => opportunity.category.toLowerCase() === item.toLowerCase())
				const matchesLocation =
					locations.length === 0 || locations.includes(opportunity.location ?? "")

				return (
					matchesSearch &&
					matchesCategory &&
					matchesLocation &&
					matchesDateFilter(opportunity.startsAt, dates)
				)
			})
			.sort((a, b) =>
				sort === "newest"
					? (b.startsAt ?? "").localeCompare(a.startsAt ?? "")
					: (a.startsAt ?? "").localeCompare(b.startsAt ?? ""),
			)
	}, [opportunities, query, categories, locations, dates, sort])

	return (
		<section aria-labelledby="search-opportunities-title" className="flex w-full flex-col gap-3">
			<Button variant="accent" className="w-full sm:w-64" onClick={() => setIsCreating(true)}>
				Create Opportunity
			</Button>

			<h2 id="search-opportunities-title" className="mt-2 text-xl font-bold text-primary">
				Search opportunities
			</h2>

			<label className="input w-full rounded-full border-primary sm:max-w-80">
				<span className="sr-only">Search opportunities</span>
				<input
					type="search"
					placeholder="Search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>
			</label>

			<div className="flex flex-wrap gap-2">
				<DropdownSelect
					wrapperClassName="sm:max-w-none"
					className="sm:max-w-none"
					buttonClassName={FILTER_BUTTON_CLASS}
					menuClassName="w-56 text-xs"
					options={OPPORTUNITY_CATEGORY_OPTIONS}
					value={categories}
					placeholder="Category"
					onChange={(next) => setCategories(Array.isArray(next) ? next : [next])}
				/>
				<DropdownSelect
					wrapperClassName="sm:max-w-none"
					className="sm:max-w-none"
					buttonClassName={FILTER_BUTTON_CLASS}
					menuClassName="w-44 text-xs"
					options={locationOptions.map((location) => ({
						value: location,
						label: location,
					}))}
					value={locations}
					placeholder="Location"
					onChange={(next) => setLocations(Array.isArray(next) ? next : [next])}
				/>
				<DropdownSelect
					wrapperClassName="sm:max-w-none"
					className="sm:max-w-none"
					buttonClassName={FILTER_BUTTON_CLASS}
					menuClassName="w-44 text-xs"
					options={OPPORTUNITY_DATE_FILTER_OPTIONS}
					value={dates}
					placeholder="Date"
					onChange={(next) => setDates(Array.isArray(next) ? next : [next])}
				/>
			</div>

			<div className="flex items-center gap-2 text-sm font-bold text-primary">
				<span>{displayed.length} Results</span>
				<DropdownSelect
					wrapperClassName="sm:max-w-none"
					className="sm:max-w-none"
					buttonClassName={FILTER_BUTTON_CLASS}
					menuClassName="w-44 text-xs"
					options={OPPORTUNITY_SORT_OPTIONS}
					value={sort}
					placeholder="Sort"
					onChange={(next) => setSort(String(next) === "oldest" ? "oldest" : "newest")}
				/>
			</div>

			{state === "loading" && opportunities.length === 0 ? (
				<div className="flex justify-center py-8">
					<span className="loading loading-spinner loading-md text-primary" />
				</div>
			) : state === "error" ? (
				<div role="alert" className="alert alert-error alert-soft text-sm">
					<span>We couldn&apos;t load your opportunities.</span>
					<button type="button" onClick={refresh} className="btn btn-sm btn-ghost">
						Try again
					</button>
				</div>
			) : displayed.length === 0 ? (
				<p className="py-6 text-sm text-base-content/65">
					{opportunities.length === 0
						? "You haven't created any opportunities yet."
						: "No opportunities match your search."}
				</p>
			) : (
				<>
					{/* Column labels, hidden on narrow screens where each row stacks. */}
					<div
						aria-hidden="true"
						className="hidden items-center gap-4 px-3 text-xs font-bold text-primary sm:flex"
					>
						<span className="w-27">Category</span>
						<span className="w-36">Role</span>
						<span className="w-20">Date</span>
						<span className="w-24">Status</span>
					</div>
					<ul aria-busy={state === "loading"} className="flex flex-col gap-2">
						{displayed.map((opportunity) => (
							<li
								key={opportunity.id}
								className="flex flex-col max-w-2xl gap-2 rounded-2xl border-2 border-primary px-3 py-2 sm:flex-row sm:items-center sm:gap-4"
							>
								<div className="flex min-w-0 grow flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
									<span className="truncate text-sm font-bold text-primary sm:w-32">
										{opportunity.category}
									</span>
									<span className="truncate text-sm sm:w-44">{opportunity.role}</span>
									<time
										dateTime={opportunity.startsAt ?? undefined}
										className="text-xs text-base-content/80 sm:w-24"
									>
										{formatDate(opportunity.startsAt)}
									</time>
									<span className={`text-xs font-bold sm:w-24 ${statusClass(opportunity.status)}`}>
										{describeOpportunityStatus(opportunity.status)}
									</span>
								</div>
								<div className="flex shrink-0 items-center gap-2">
									<ManageMenu
										opportunity={opportunity}
										onEdit={() => setEditingFor(opportunity)}
										onDelete={() => setDeletingFor(opportunity)}
									/>
									<Button
										variant="outline"
										size="small"
										className="px-4"
										aria-label={`Details for ${opportunity.role}`}
										onClick={() => setDetailsFor(opportunity)}
									>
										Details
									</Button>
								</div>
							</li>
						))}
					</ul>
				</>
			)}

			{detailsFor && (
				<OpportunityDetailsModal
					badge={describeOpportunityStatus(detailsFor.status)}
					onClose={() => setDetailsFor(undefined)}
					opportunity={{
						category: detailsFor.category,
						description: detailsFor.description,
						location: detailsFor.location,
						requirements: detailsFor.requirements,
						startsAt: detailsFor.startsAt,
						title: detailsFor.role,
					}}
				/>
			)}

			{isCreating && (
				<CreateOpportunityDialog onClose={() => setIsCreating(false)} onCreated={refresh} />
			)}

			{editingFor && (
				<EditOpportunityDialog
					opportunity={editingFor}
					onClose={() => setEditingFor(undefined)}
					onSaved={refresh}
				/>
			)}

			{deletingFor && (
				<DeleteOpportunityDialog
					opportunity={deletingFor}
					onClose={() => setDeletingFor(undefined)}
					onDeleted={refresh}
				/>
			)}
		</section>
	)
}
