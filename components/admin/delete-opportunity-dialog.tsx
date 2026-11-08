"use client"

import { Check, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { AdminOpportunity } from "@/lib/opportunities"

/**
 * The delete flow from the admin design: a confirmation ("Delete opportunity?") and, once the
 * opportunity is gone, a success notice ("Opportunity deleted"). Mount it to open the
 * confirmation — `onDeleted` refreshes the list, `onClose` unmounts the flow.
 */
export function DeleteOpportunityDialog({
	opportunity,
	onClose,
	onDeleted,
}: {
	opportunity: AdminOpportunity
	onClose: () => void
	onDeleted: () => void
}) {
	const confirmDialogRef = useRef<HTMLDialogElement>(null)
	const deletedDialogRef = useRef<HTMLDialogElement>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const [deleteError, setDeleteError] = useState("")

	useEffect(() => {
		const dialog = confirmDialogRef.current

		if (dialog && !dialog.open) {
			dialog.showModal()
		}
	}, [])

	/**
	 * Closing the confirmation has to unmount the flow — but *not* while moving on to the success
	 * notice, so the cancel path calls this explicitly instead of listening to the dialog's
	 * `close` event.
	 */
	function cancel() {
		confirmDialogRef.current?.close()
		onClose()
	}

	async function deleteOpportunity() {
		setIsDeleting(true)
		setDeleteError("")

		try {
			const response = await fetch(
				`/api/admin/opportunities/${encodeURIComponent(opportunity.id)}`,
				{ method: "DELETE" },
			)
			const data: { success?: boolean; error?: string } = await response
				.json()
				.catch(() => ({ success: false }))

			if (!response.ok || !data.success) {
				setDeleteError(data.error ?? "The opportunity could not be deleted. Please try again.")
				return
			}

			confirmDialogRef.current?.close()
			deletedDialogRef.current?.showModal()
			onDeleted()
		} catch {
			setDeleteError("We couldn't reach the server. Check your connection and try again.")
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<>
			<dialog
				ref={confirmDialogRef}
				className="modal"
				aria-labelledby="delete-opportunity-title"
				onCancel={(event) => {
					event.preventDefault()
					cancel()
				}}
			>
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					<X aria-hidden="true" className="text-primary" size={44} />
					<h2 id="delete-opportunity-title" className="text-lg font-bold text-primary">
						Delete opportunity?
					</h2>
					<p className="text-sm text-base-content">
						You&apos;re about to delete &ldquo;{opportunity.role}&rdquo;.
					</p>
					{deleteError && (
						<div role="alert" className="alert alert-error alert-soft text-sm">
							{deleteError}
						</div>
					)}
					<div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
						<Button variant="outline" onClick={cancel} disabled={isDeleting}>
							Cancel
						</Button>
						<Button variant="accent" onClick={deleteOpportunity} loading={isDeleting}>
							Delete
						</Button>
					</div>
				</div>
			</dialog>

			<dialog
				ref={deletedDialogRef}
				className="modal"
				aria-labelledby="opportunity-deleted-title"
			>
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					<Check aria-hidden="true" className="text-primary" size={48} />
					<h2 id="opportunity-deleted-title" className="text-lg font-bold text-primary">
						Opportunity deleted
					</h2>
					<p className="text-sm text-base-content">
						&ldquo;{opportunity.role}&rdquo; has been deleted.
					</p>
					<Button
						variant="accent"
						className="mt-2 w-full"
						fullWidth
						onClick={() => {
							deletedDialogRef.current?.close()
							onClose()
						}}
					>
						Done
					</Button>
				</div>
			</dialog>
		</>
	)
}
