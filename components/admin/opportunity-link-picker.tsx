"use client"

import { useEffect, useMemo, useState } from "react"
import { formatOpportunityDateTime } from "@/components/opportunities/opportunity-card-base"
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select"
import { opportunityCategoryFor } from "@/lib/opportunity-category"
import {Check} from "lucide-react"

interface OpportunityOption {
	id: string
	title: string
	location: string | null
	startsAt: string | null
}

const ADMIN_EVENTS_API = "/api/admin/events"

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

const FILTER_BUTTON_CLASS = "px-3 py-1.5 text-xs font-bold text-white"

export function OpportunityLinkPicker({
	value,
	onChange,
	onBlur,
	error,
}: {
	value?: string
	onChange: (eventId: string | undefined) => void
	onBlur: () => void
	error?: string
}) {
	const [opportunities, setOpportunities] = useState<OpportunityOption[]>([])
	const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
	const [query, setQuery] = useState("")
	const [categories, setCategories] = useState<string[]>([])
	const [locationsFilter, setLocationsFilter] = useState<string[]>([])
	const [dates, setDates] = useState<string[]>([])

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const response = await fetch(ADMIN_EVENTS_API)
				if (!response.ok) {
					throw new Error(`Request failed with ${response.status}`)
				}
				const data = (await response.json()) as { events?: OpportunityOption[] }
				if (cancelled) {
					return
				}
				setOpportunities(data.events ?? [])
				setStatus("ready")
			} catch {
				if (!cancelled) {
					setStatus("error")
				}
			}
		})()

		return () => {
			cancelled = true
		}
	}, [])

	const locations = useMemo(
		() => [
			...new Set(
				opportunities
					.map((item) => item.location)
					.filter((item): item is string => Boolean(item)),
			),
		],
		[opportunities],
	)

	const displayed = useMemo(() => {
		const needle = query.trim().toLowerCase()
		return opportunities.filter((opportunity) => {
			const category = opportunityCategoryFor(opportunity.title)
			const matchesSearch =
				!needle ||
				[opportunity.title, opportunity.location, category]
					.filter(Boolean)
					.some((item) => item?.toLowerCase().includes(needle))
			const matchesCategory =
				categories.length === 0 ||
				categories.some((item) => category.toLowerCase().startsWith(item.toLowerCase()))
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
			return matchesSearch && matchesCategory && matchesLocation && matchesDate
		})
	}, [opportunities, query, categories, locationsFilter, dates])

	return (
		<div className="rounded-box border-2 border-primary p-3">
			<div className="flex items-center justify-between gap-2">
				<span className="text-base font-bold text-primary">Link an opportunity</span>
				{value && (
					<button
						type="button"
						onClick={() => {
							onChange(undefined)
							onBlur()
						}}
						className="btn btn-ghost btn-xs rounded-full text-primary"
					>
						Clear selection
					</button>
				)}
			</div>

			<div className="mt-2 flex items-center gap-2 text-sm font-bold text-primary">
				<span>Search</span>
			</div>
			<label className="sr-only" htmlFor="opportunity-link-search">
				Search opportunities
			</label>
			<input
				id="opportunity-link-search"
				className="mt-2 h-9 w-full max-w-xs rounded-full border border-primary px-3 text-xs outline-none focus:ring-2 focus:ring-secondary"
				onChange={(event) => setQuery(event.target.value)}
				placeholder="Search..."
				type="search"
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

			{error && <p className="mt-2 text-sm text-error">{error}</p>}

			<div className="mt-2 flex max-h-72 flex-col gap-2 overflow-y-auto" role="listbox" aria-label="Opportunities">
				{status === "loading" && (
					<div className="flex justify-center py-6">
						<span className="loading loading-spinner loading-md text-primary" />
					</div>
				)}
				{status === "error" && (
					<p className="py-6 text-center text-sm text-error">
						We couldn&apos;t load the opportunities. Please try again.
					</p>
				)}
				{status === "ready" && displayed.length === 0 && (
					<p className="py-6 text-center text-sm text-primary">
						No opportunities match your filters.
					</p>
				)}
				{status === "ready" &&
					displayed.map((opportunity) => {
						const selected = opportunity.id === value
						const category = opportunityCategoryFor(opportunity.title)
						return (
							<button
								key={opportunity.id}
								type="button"
								role="option"
								aria-selected={selected}
								onClick={() => {
									onChange(selected ? undefined : opportunity.id)
									onBlur()
								}}
								className="flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left border-primary bg-white hover:bg-primary/5"
							>
								<span className="min-w-0">
									<span className="block text-[10px] font-bold text-primary">{category}</span>
									<span className="block truncate text-sm font-bold text-black">
										{opportunity.title}
									</span>
									<span className="block truncate text-xs text-primary">
										{opportunity.location ?? "Location to be confirmed"} ·{" "}
										{formatOpportunityDateTime(opportunity.startsAt)}
									</span>
								</span>
								<span
									aria-hidden="true"
									className={`flex size-5 shrink-0 items-center justify-center border-2 text-xs ${selected ? "border-accent bg-accent text-primary-content" : "border-primary text-transparent"}`}
								>
									<Check />
								</span>
							</button>
						)
					})}
			</div>
		</div>
	)
}
