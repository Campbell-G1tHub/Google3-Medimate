"use client"

import { useState } from "react"
import { DropdownSelect } from "@/components/ui/dropdown-select"
import { AnnouncementForm } from "./announcement-form"
import { ApplicationList } from "./application-list"
import { OpportunityList } from "./opportunity-list"

type AdminView = "send-announcement" | "volunteer-applications" | "opportunities"

const ADMIN_VIEW_OPTIONS = [
	{ label: "Send Announcement", value: "send-announcement" },
	{ label: "Volunteer Applications", value: "volunteer-applications" },
	{ label: "Manage/Create Opportunities", value: "opportunities" },
] as const

/**
 * Admin section switcher. One dropdown below the app shell header swaps between the
 * announcements form, the volunteer applications list, and the opportunities list in place.
 */
export function AdminPanel() {
	const [view, setView] = useState<AdminView>("send-announcement")

	return (
		<div className="flex w-full flex-col gap-4 px-5 py-6 sm:px-8">
			<DropdownSelect
				label="Admin section"
				labelClassName="sr-only"
				options={ADMIN_VIEW_OPTIONS}
				noEmptySelects
				value={view}
				onChange={(next) => setView(next as AdminView)}
				className="sm:max-w-xs"
			/>
			{view === "send-announcement" && <AnnouncementForm />}
			{view === "volunteer-applications" && <ApplicationList />}
			{view === "opportunities" && <OpportunityList />}
		</div>
	)
}
