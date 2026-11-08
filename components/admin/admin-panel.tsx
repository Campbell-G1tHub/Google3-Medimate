"use client"

import { useState } from "react"
import { DropdownSelect } from "@/components/ui/dropdown-select"
import { AnnouncementForm } from "./announcement-form"
import { ApplicationList } from "./application-list"

type AdminView = "send-announcement" | "volunteer-applications"

const ADMIN_VIEW_OPTIONS = [
	{ label: "Send Announcement", value: "send-announcement" },
	{ label: "Volunteer Applications", value: "volunteer-applications" },
] as const

/**
 * Admin section switcher. One dropdown below the app shell header swaps between
 * the announcements form and the volunteer applications list in place.
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
			{view === "send-announcement" ? <AnnouncementForm /> : <ApplicationList />}
		</div>
	)
}
