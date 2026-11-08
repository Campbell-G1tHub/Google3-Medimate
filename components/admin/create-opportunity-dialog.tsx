"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, CircleX, FilePlus, TagX, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { DropdownSelect } from "@/components/ui/dropdown-select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
	type CreateOpportunityFormValues,
	type CreateOpportunityInput,
	createOpportunitySchema,
	OPPORTUNITY_CATEGORY_OPTIONS,
} from "@/lib/validation/opportunity"

const CREATE_OPPORTUNITY_API = "/api/admin/opportunities"

const DEFAULT_VALUES: CreateOpportunityFormValues = {
	category: "",
	role: "",
	location: "",
	time: "",
	capacity: "",
	description: "",
	requirements: "",
}

const LABEL_CLASS = "text-sm font-bold text-primary"
const FIELD_CLASS = "rounded-full border-primary px-4"

interface CreateOpportunityResponse {
	success: boolean
	error?: string
	fieldErrors?: Partial<Record<keyof CreateOpportunityFormValues, string[]>>
}

/**
 * The "Create Opportunity" modal from the admin design plus the three confirmation dialogs
 * that go with it: discard, confirm-create, and the success notice. Mount it to open it —
 * it shows itself on mount and calls `onClose` once the flow is finished.
 */
export function CreateOpportunityDialog({
	onClose,
	onCreated,
}: {
	onClose: () => void
	onCreated: () => void
}) {
	const formDialogRef = useRef<HTMLDialogElement>(null)
	const discardDialogRef = useRef<HTMLDialogElement>(null)
	const discardedDialogRef = useRef<HTMLDialogElement>(null)
	const confirmDialogRef = useRef<HTMLDialogElement>(null)
	const createdDialogRef = useRef<HTMLDialogElement>(null)
	const [pending, setPending] = useState<CreateOpportunityInput | null>(null)
	const [isPosting, setIsPosting] = useState(false)
	const [submitError, setSubmitError] = useState("")

	const {
		control,
		formState: { errors },
		handleSubmit,
		register,
		reset,
		setError,
	} = useForm<CreateOpportunityFormValues, unknown, CreateOpportunityInput>({
		resolver: zodResolver(createOpportunitySchema),
		defaultValues: DEFAULT_VALUES,
	})

	useEffect(() => {
		formDialogRef.current?.showModal()
	}, [])

	const onValid = (values: CreateOpportunityInput) => {
		setSubmitError("")
		setPending(values)
		confirmDialogRef.current?.showModal()
	}

	/** Any attempt to leave the form asks for confirmation first. */
	function requestClose() {
		discardDialogRef.current?.showModal()
	}

	function discardOpportunity() {
		discardDialogRef.current?.close()
		formDialogRef.current?.close()
		discardedDialogRef.current?.showModal()
	}

	function resetForm() {
		reset(DEFAULT_VALUES)
		setPending(null)
		setSubmitError("")
	}

	async function postOpportunity() {
		if (!pending) {
			return
		}

		setIsPosting(true)
		setSubmitError("")

		try {
			const response = await fetch(CREATE_OPPORTUNITY_API, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(pending),
			})
			const data: CreateOpportunityResponse = await response
				.json()
				.catch(() => ({ success: false }))

			confirmDialogRef.current?.close()

			if (!response.ok || !data.success) {
				for (const [field, messages] of Object.entries(data.fieldErrors ?? {})) {
					if (messages?.[0]) {
						setError(field as keyof CreateOpportunityFormValues, { message: messages[0] })
					}
				}
				setSubmitError(data.error ?? "The opportunity could not be created. Please try again.")
				return
			}

			formDialogRef.current?.close()
			createdDialogRef.current?.showModal()
			onCreated()
		} catch {
			confirmDialogRef.current?.close()
			setSubmitError("We couldn't reach the server. Check your connection and try again.")
		} finally {
			setIsPosting(false)
		}
	}

	return (
		<>
			<dialog
				ref={formDialogRef}
				className="modal"
				aria-labelledby="create-opportunity-title"
				onCancel={(event) => {
					event.preventDefault()
					requestClose()
				}}
				onClose={resetForm}
			>
				<div className="modal-box max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-0">
					<div className="flex items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-content">
						<h2 id="create-opportunity-title" className="text-lg font-bold">
							Create Opportunity
						</h2>
						<button
							type="button"
							aria-label="Close dialog"
							className="rounded-full p-1 hover:bg-primary-content/10"
							onClick={requestClose}
						>
							<X aria-hidden="true" size={22} />
						</button>
					</div>

					<form
						noValidate
						onSubmit={(event) => void handleSubmit(onValid)(event)}
						className="flex flex-col gap-2 p-4"
					>
						{/* The flex wrapper keeps the dropdown trigger hugged to its content, like the design. */}
						<div className="flex">
							<Controller
								control={control}
								name="category"
								render={({ field, fieldState }) => (
									<DropdownSelect
										label="Category"
										labelClassName={LABEL_CLASS}
										wrapperClassName="sm:max-w-none"
										className="sm:max-w-none"
										buttonClassName="px-4"
										options={OPPORTUNITY_CATEGORY_OPTIONS}
										value={field.value ?? ""}
										placeholder="Category"
										error={fieldState.error?.message}
										onChange={(next) => field.onChange(String(next))}
										onBlur={field.onBlur}
									/>
								)}
							/>
						</div>

						<Input
							label="Role"
							labelClassName={LABEL_CLASS}
							className={FIELD_CLASS}
							aria-label="Role"
							placeholder="Role"
							error={errors.role?.message}
							{...register("role")}
						/>

						<Input
							label="Location"
							labelClassName={LABEL_CLASS}
							className={FIELD_CLASS}
							aria-label="Location"
							placeholder="Location"
							error={errors.location?.message}
							{...register("location")}
						/>

						<Input
							label="Time"
							labelClassName={LABEL_CLASS}
							className={FIELD_CLASS}
							aria-label="Time"
							type="datetime-local"
							error={errors.time?.message}
							{...register("time")}
						/>

						<Input
							label="Capacity"
							labelClassName={LABEL_CLASS}
							className={FIELD_CLASS}
							aria-label="Capacity"
							type="number"
							inputMode="numeric"
							min={1}
							placeholder="Capacity"
							error={errors.capacity?.message}
							{...register("capacity")}
						/>

						<Textarea
							label="Description"
							labelClassName={LABEL_CLASS}
							className="rounded-box border-primary px-4"
							aria-label="Description"
							rows={5}
							placeholder="Description"
							error={errors.description?.message}
							{...register("description")}
						/>

						<Input
							label="Requirements"
							labelClassName={LABEL_CLASS}
							className={FIELD_CLASS}
							aria-label="Requirements"
							placeholder="Requirements"
							error={errors.requirements?.message}
							{...register("requirements")}
						/>

						{submitError && (
							<div role="alert" className="alert alert-error alert-soft text-sm">
								{submitError}
							</div>
						)}

						<Button type="submit" variant="accent" className="mt-2 w-full" fullWidth>
							Create Opportunity
						</Button>
					</form>
				</div>
			</dialog>

			<dialog ref={discardDialogRef} className="modal" aria-labelledby="discard-opportunity-title">
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					<TagX aria-hidden="true" className="text-primary" size={44} />
					<h2 id="discard-opportunity-title" className="text-lg font-bold text-primary">
						Discard opportunity?
					</h2>
					<p className="text-sm text-base-content">
						Are you sure you want to exit without creating this opportunity?
					</p>
					<div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
						<Button variant="outline" onClick={() => discardDialogRef.current?.close()}>
							Keep
						</Button>
						<Button variant="accent" onClick={discardOpportunity}>
							Discard
						</Button>
					</div>
				</div>
			</dialog>

			<dialog
				ref={discardedDialogRef}
				className="modal"
				aria-labelledby="opportunity-discarded-title"
			>
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					<CircleX aria-hidden="true" className="text-primary" size={44} />
					<h2 id="opportunity-discarded-title" className="text-lg font-bold text-primary">
						Opportunity discarded
					</h2>
					<p className="text-sm text-base-content">This opportunity has been discarded.</p>
					<Button variant="accent" className="mt-2 w-full" fullWidth onClick={onClose}>
						Close
					</Button>
				</div>
			</dialog>

			<dialog ref={confirmDialogRef} className="modal" aria-labelledby="confirm-opportunity-title">
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					<FilePlus aria-hidden="true" className="text-primary" size={44} />
					<h2 id="confirm-opportunity-title" className="text-lg font-bold text-primary">
						Create opportunity?
					</h2>
					<p className="text-sm text-base-content">
						Are you sure you want to create this opportunity?
					</p>
					<div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
						<Button
							variant="outline"
							onClick={() => confirmDialogRef.current?.close()}
							disabled={isPosting}
						>
							Keep editing
						</Button>
						<Button variant="accent" onClick={postOpportunity} loading={isPosting}>
							Create
						</Button>
					</div>
				</div>
			</dialog>

			<dialog ref={createdDialogRef} className="modal" aria-labelledby="opportunity-created-title">
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					<Check aria-hidden="true" className="text-primary" size={48} />
					<h2 id="opportunity-created-title" className="text-lg font-bold text-primary">
						Opportunity created
					</h2>
					<p className="text-sm text-base-content">
						This opportunity has been created. Volunteers who prefer this type of opportunity will
						be notified.
					</p>
					<Button variant="accent" className="mt-2 w-full" fullWidth onClick={onClose}>
						Close
					</Button>
				</div>
			</dialog>
		</>
	)
}
