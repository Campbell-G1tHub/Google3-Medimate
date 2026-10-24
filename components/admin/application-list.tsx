"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { ApplicationSummary } from "@/lib/volunteer-applications"
import {
	APPLICATION_SORT_OPTIONS,
	APPLICATION_STATUS_OPTIONS,
	type ApplicationSort,
	type ApplicationStatus,
} from "@/lib/validation/volunteer-application"
import { ApplicationReview } from "./application-review"

const SEARCH_API = "/api/admin/volunteer-applications/search"
const SEARCH_DELAY_MS = 300

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
	APPLICATION_STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

const dateFormat = new Intl.DateTimeFormat("en-AU", {
	day: "numeric",
	month: "short",
	year: "numeric",
})

const SELECT_CLASS =
	"select select-sm w-auto rounded-full border-none bg-primary pr-8 font-semibold text-primary-content"

export function ApplicationList() {
	const [query, setQuery] = useState("")
	const [debouncedQuery, setDebouncedQuery] = useState("")
	const [status, setStatus] = useState<ApplicationStatus | "">("")
	const [sort, setSort] = useState<ApplicationSort>("newest")
	const [applications, setApplications] = useState<ApplicationSummary[]>([])
	const [state, setState] = useState<"loading" | "ready" | "error">("loading")
	const [reloadKey, setReloadKey] = useState(0)
	const [reviewingId, setReviewingId] = useState<string | null>(null)

	useEffect(() => {
		const timer = window.setTimeout(() => setDebouncedQuery(query), SEARCH_DELAY_MS)
		return () => window.clearTimeout(timer)
	}, [query])

	useEffect(() => {
		const controller = new AbortController()
		setState("loading")

		fetch(SEARCH_API, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ query: debouncedQuery, status: status || undefined, sort }),
			signal: controller.signal,
		})
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(`Search failed with ${response.status}`)
				}
				const data: { applications: ApplicationSummary[] } = await response.json()
				setApplications(data.applications)
				setState("ready")
			})
			.catch((error) => {
				if (!controller.signal.aborted) {
					console.error(error)
					setState("error")
				}
			})

		return () => controller.abort()
	}, [debouncedQuery, status, sort, reloadKey])

	const reload = useCallback(() => setReloadKey((key) => key + 1), [])

	return (
		<section aria-labelledby="search-applications-title" className="flex w-full max-w-xl flex-col gap-3">
			<h2 id="search-applications-title" className="text-xl text-primary">
				Search applications
			</h2>

			<label className="input w-full rounded-full border-primary sm:max-w-80">
				<span className="sr-only">Search by name or email</span>
				<input
					type="search"
					placeholder="Search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>
			</label>

			<div className="flex flex-wrap gap-2">
				<select
					aria-label="Filter by status"
					className={SELECT_CLASS}
					value={status}
					onChange={(event) => setStatus(event.target.value as ApplicationStatus | "")}
				>
					<option value="">Status</option>
					{APPLICATION_STATUS_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<select
					aria-label="Sort applications"
					className={SELECT_CLASS}
					value={sort}
					onChange={(event) => setSort(event.target.value as ApplicationSort)}
				>
					{APPLICATION_SORT_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			{state === "loading" && applications.length === 0 ? (
				<div className="flex justify-center py-8">
					<span className="loading loading-spinner loading-md text-primary" />
				</div>
			) : state === "error" ? (
				<div role="alert" className="alert alert-error alert-soft text-sm">
					<span>We couldn't load the applications.</span>
					<button type="button" onClick={reload} className="btn btn-sm btn-ghost">
						Try again
					</button>
				</div>
			) : applications.length === 0 ? (
				<p className="py-6 text-sm text-base-content/65">No applications match your search.</p>
			) : (
				<ul aria-busy={state === "loading"} className="flex flex-col gap-2">
					{applications.map((application) => (
						<ApplicationRow
							key={application.id}
							application={application}
							onReview={() => setReviewingId(application.id)}
						/>
					))}
				</ul>
			)}

			{reviewingId && (
				<ApplicationReview
					key={reviewingId}
					applicationId={reviewingId}
					onClose={() => setReviewingId(null)}
					onReviewed={reload}
				/>
			)}
		</section>
	)
}

interface ApplicationRowProps {
	application: ApplicationSummary
	onReview: () => void
}

function ApplicationRow({ application, onReview }: ApplicationRowProps) {
	const submitted = new Date(application.submittedAt)

	return (
		<li className="flex items-center gap-3 rounded-2xl border border-primary px-4 py-2">
			<div className="flex min-w-0 grow flex-col sm:flex-row sm:items-center sm:gap-6">
				<span className="truncate text-sm sm:w-44">{application.fullName}</span>
				<time dateTime={application.submittedAt} className="text-xs font-semibold">
					{dateFormat.format(submitted)}
				</time>
			</div>
			<span className="w-20 shrink-0 text-center text-sm font-semibold text-primary">
				{STATUS_LABELS[application.status] ?? application.status}
			</span>
			<Button
				variant="accent"
				size="small"
				className="shrink-0 px-4"
				onClick={onReview}
				aria-label={`Review ${application.fullName}'s application`}
			>
				Review
			</Button>
		</li>
	)
}
