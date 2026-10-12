"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
	ANNOUNCEMENT_TYPE_OPTIONS,
	type AnnouncementFormValues,
	type AnnouncementInput,
	announcementSchema,
	describeAudience,
} from "@/lib/validation/announcement"
import { SendToSelect } from "./send-to-select"

const SEND_ANNOUNCEMENT_API = "/api/admin/send-announcement"

const DEFAULT_VALUES: AnnouncementFormValues = {
	type: "GENERAL",
	subject: "",
	message: "",
	link: "",
	sendTo: [],
}

const LABEL_CLASS = "text-base font-bold text-primary"

interface SendAnnouncementResponse {
	success: boolean
	error?: string
	fieldErrors?: Partial<Record<keyof AnnouncementFormValues, string[]>>
}

export function AnnouncementForm() {
	const confirmRef = useRef<HTMLDialogElement>(null)
	const successRef = useRef<HTMLDialogElement>(null)
	const [pending, setPending] = useState<AnnouncementFormValues | null>(null)
	const [isPosting, setIsPosting] = useState(false)
	const [submitError, setSubmitError] = useState("")

	const {
		control,
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		reset,
		setError,
		setValue,
		clearErrors,
		watch,
	} = useForm<AnnouncementFormValues, unknown, AnnouncementInput>({
		resolver: zodResolver(announcementSchema),
		defaultValues: DEFAULT_VALUES,
	})

	const type = watch("type")

	useEffect(() => {
		if (type !== "NEWSLETTER") {
			setValue("link", "")
			clearErrors("link")
		}
	}, [type, setValue, clearErrors])

	const onValid = () => {
		setSubmitError("")
		setPending(getValues())
		confirmRef.current?.showModal()
	}

	async function postAnnouncement() {
		if (!pending) {
			return
		}

		setIsPosting(true)
		setSubmitError("")

		try {
			const response = await fetch(SEND_ANNOUNCEMENT_API, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(pending),
			})
			const data: SendAnnouncementResponse = await response.json().catch(() => ({ success: false }))

			confirmRef.current?.close()

			if (!response.ok || !data.success) {
				for (const [field, messages] of Object.entries(data.fieldErrors ?? {})) {
					if (messages?.[0]) {
						setError(field as keyof AnnouncementFormValues, { message: messages[0] })
					}
				}
				setSubmitError(data.error ?? "The announcement could not be sent. Please try again.")
				return
			}

			successRef.current?.showModal()
		} catch {
			confirmRef.current?.close()
			setSubmitError("We couldn't reach the server. Check your connection and try again.")
		} finally {
			setIsPosting(false)
		}
	}

	function resetForm() {
		reset(DEFAULT_VALUES)
		setPending(null)
	}

	const audience = pending ? describeAudience(pending.sendTo) : ""

	return (
		<>
			<form
				noValidate
				onSubmit={handleSubmit(onValid)}
				className="flex w-full max-w-xl flex-col gap-2"
			>
				<fieldset className="fieldset">
					<legend className={`fieldset-legend ${LABEL_CLASS}`}>Announcement Type</legend>
					<div className="flex flex-wrap gap-2">
						{ANNOUNCEMENT_TYPE_OPTIONS.map((option) => (
							<label key={option.value} className="cursor-pointer">
								<input
									type="radio"
									value={option.value}
									className="peer sr-only"
									{...register("type")}
								/>
								<span className="btn btn-sm rounded-full border-primary bg-base-100 px-4 font-semibold text-primary shadow-none peer-checked:bg-primary peer-checked:text-primary-content peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary">
									{option.label}
								</span>
							</label>
						))}
					</div>
				</fieldset>

				<Input
					label="Subject"
					labelClassName={LABEL_CLASS}
					placeholder="Write a subject..."
					className="rounded-full border-primary px-4"
					error={errors.subject?.message}
					{...register("subject")}
				/>

				<Textarea
					label="Message"
					labelClassName={LABEL_CLASS}
					placeholder="Write announcement..."
					rows={5}
					className="rounded-box border-primary px-4"
					error={errors.message?.message}
					{...register("message")}
				/>

				{type === "NEWSLETTER" && (
					<Input
						label="Link Newsletter"
						labelClassName={LABEL_CLASS}
						type="url"
						inputMode="url"
						placeholder="Newsletter link"
						className="rounded-full border-primary px-4"
						error={errors.link?.message}
						{...register("link")}
					/>
				)}

				<Controller
					control={control}
					name="sendTo"
					render={({ field, fieldState }) => (
						<SendToSelect
							value={field.value}
							onChange={field.onChange}
							onBlur={field.onBlur}
							error={fieldState.error?.message}
						/>
					)}
				/>

				{submitError && (
					<div role="alert" className="alert alert-error alert-soft text-sm">
						{submitError}
					</div>
				)}

				<Button type="submit" variant="accent" className="mt-2 w-full sm:max-w-xs">
					Post announcement
				</Button>
			</form>

			<dialog ref={confirmRef} className="modal" aria-labelledby="confirm-announcement-title">
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					<Image src="/icons/announcement.svg" alt="" width={48} height={48} />
					<h2 id="confirm-announcement-title" className="text-lg text-primary">
						Post this announcement?
					</h2>
					<p className="text-sm">
						You're about to send <strong>"{pending?.subject}"</strong> to{" "}
						<strong>{audience}</strong>.
					</p>
					<div className="mt-2 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
						<button
							type="button"
							className="btn btn-outline btn-accent rounded-full shadow-none"
							onClick={() => confirmRef.current?.close()}
							disabled={isPosting}
						>
							Cancel
						</button>
						<Button variant="accent" onClick={postAnnouncement} loading={isPosting}>
							Post announcement
						</Button>
					</div>
				</div>
			</dialog>

			<dialog
				ref={successRef}
				className="modal"
				aria-labelledby="announcement-posted-title"
				onClose={resetForm}
			>
				<div className="modal-box flex max-w-md flex-col items-center gap-3 border-2 border-primary text-center">
					<Image src="/icons/check.svg" alt="" width={40} height={40} />
					<h2 id="announcement-posted-title" className="text-lg text-primary">
						Announcement posted
					</h2>
					<p className="text-sm">
						<strong>"{pending?.subject}"</strong> has been sent to <strong>{audience}</strong>
					</p>
					<Button variant="accent" className="mt-2 w-full sm:w-40" onClick={() => successRef.current?.close()}>
						Done
					</Button>
				</div>
			</dialog>
		</>
	)
}
