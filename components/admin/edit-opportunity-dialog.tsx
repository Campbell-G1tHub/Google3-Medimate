"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import type { AdminOpportunity } from "@/lib/opportunities"
import {
	type CreateOpportunityFormValues,
	type CreateOpportunityInput,
	type UpdateOpportunityInput,
	updateOpportunitySchema,
} from "@/lib/validation/opportunity"
import { OpportunityFormFields } from "./opportunity-form-fields"

interface UpdateOpportunityResponse {
	success: boolean
	error?: string
	fieldErrors?: Partial<Record<keyof CreateOpportunityFormValues, string[]>>
}

/** `type="datetime-local"` wants `YYYY-MM-DDTHH:mm` in the browser's zone, not an ISO string. */
function toLocalDateTimeValue(value: string | null) {
	if (!value) {
		return ""
	}

	const date = new Date(value)

	if (Number.isNaN(date.getTime())) {
		return ""
	}

	const pad = (part: number) => String(part).padStart(2, "0")

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** The editable fields of an opportunity, seeded from the row the admin picked in "Manage". */
function defaultValuesFor(opportunity: AdminOpportunity): CreateOpportunityFormValues {
	return {
		category: opportunity.category,
		role: opportunity.role,
		location: opportunity.location ?? "",
		time: toLocalDateTimeValue(opportunity.startsAt),
		capacity: opportunity.capacity === null ? "" : String(opportunity.capacity),
		description: opportunity.description,
		requirements: opportunity.requirements ?? "",
	}
}

/**
 * The "Edit Opportunity" modal from the admin design: the same fields as the create dialog,
 * pre-filled from the opportunity, with a single "Save changes" button. Mount it to open it —
 * it shows itself on mount, calls `onSaved` after a successful save, and always closes itself
 * (via `onClose`) once the admin dismisses it.
 */
export function EditOpportunityDialog({
	opportunity,
	onClose,
	onSaved,
}: {
	opportunity: AdminOpportunity
	onClose: () => void
	onSaved: () => void
}) {
	const dialogRef = useRef<HTMLDialogElement>(null)
	const [isSaving, setIsSaving] = useState(false)
	const [submitError, setSubmitError] = useState("")

	const {
		control,
		formState: { errors },
		handleSubmit,
		register,
		setError,
	} = useForm<CreateOpportunityFormValues, unknown, CreateOpportunityInput>({
		resolver: zodResolver(updateOpportunitySchema),
		defaultValues: defaultValuesFor(opportunity),
	})

	useEffect(() => {
		const dialog = dialogRef.current

		if (dialog && !dialog.open) {
			dialog.showModal()
		}
	}, [])

	async function save(values: UpdateOpportunityInput) {
		setIsSaving(true)
		setSubmitError("")

		try {
			const response = await fetch(
				`/api/admin/opportunities/${encodeURIComponent(opportunity.id)}`,
				{
					method: "PATCH",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(values),
				},
			)
			const data: UpdateOpportunityResponse = await response
				.json()
				.catch(() => ({ success: false }))

			if (!response.ok || !data.success) {
				for (const [field, messages] of Object.entries(data.fieldErrors ?? {})) {
					if (messages?.[0]) {
						setError(field as keyof CreateOpportunityFormValues, { message: messages[0] })
					}
				}
				setSubmitError(data.error ?? "The opportunity could not be saved. Please try again.")
				return
			}

			dialogRef.current?.close()
			onSaved()
		} catch {
			setSubmitError("We couldn't reach the server. Check your connection and try again.")
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<dialog
			ref={dialogRef}
			className="modal"
			aria-labelledby="edit-opportunity-title"
			onCancel={(event) => {
				event.preventDefault()
				dialogRef.current?.close()
			}}
			onClose={onClose}
		>
			<div className="modal-box max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-0">
				<div className="flex items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-content">
					<h2 id="edit-opportunity-title" className="text-lg font-bold">
						Edit Opportunity
					</h2>
					<button
						type="button"
						aria-label="Close dialog"
						className="rounded-full p-1 hover:bg-primary-content/10"
						onClick={() => dialogRef.current?.close()}
					>
						<X aria-hidden="true" size={22} />
					</button>
				</div>

				<form
					noValidate
					onSubmit={(event) => void handleSubmit(save)(event)}
					className="flex flex-col gap-2 p-4"
				>
					<OpportunityFormFields control={control} errors={errors} register={register} />

					{submitError && (
						<div role="alert" className="alert alert-error alert-soft text-sm">
							{submitError}
						</div>
					)}

					<Button type="submit" variant="accent" className="mt-2 w-full" fullWidth loading={isSaving}>
						Save changes
					</Button>
				</form>
			</div>
		</dialog>
	)
}
