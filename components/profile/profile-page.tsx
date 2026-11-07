"use client"

import { type FormEvent, type ReactNode, type SVGProps, useState } from "react"
import { VolunteerSidebar } from "@/components/navigation/volunteer-sidebar"

type Profile = {
	name: string
	email: string
	firstName: string
	lastName: string
	mobile: string
	address: string
	carType: string
	forkliftLicense: boolean
	firstAid: boolean
	impact: { commitments: number; hours: number; ordersPacked: number }
}

type Editing = "personal" | "logistics" | null
type Confirmation = "discard" | "save" | null
type Outcome = "discarded" | "applied" | null

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="28"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2.25"
			viewBox="0 0 24 24"
			width="28"
			{...props}
		>
			{children}
		</svg>
	)
}

function Avatar() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="110"
			stroke="currentColor"
			strokeWidth="2.4"
			viewBox="0 0 104 104"
			width="110"
		>
			<circle cx="52" cy="52" r="50" />
			<circle cx="52" cy="34" r="17" />
			<path d="M20 91c0-17 14-27 32-27s32 10 32 27" />
		</svg>
	)
}
function Bell() {
	return (
		<Icon>
			<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
		</Icon>
	)
}
function Close() {
	return (
		<Icon height="32" width="32">
			<path d="m6 6 12 12M18 6 6 18" />
		</Icon>
	)
}
function EditIcon() {
	return (
		<Icon height="52" width="52">
			<path d="M5 4.5h8.5M5 4.5v15h15V11" />
			<path d="m10 14 1.3-3.8 6.5-6.5a1.6 1.6 0 0 1 2.3 2.3l-6.5 6.5z" />
		</Icon>
	)
}
function CheckIcon() {
	return (
		<Icon height="52" width="52">
			<path d="m5 12 4.5 4.5L19 7" />
		</Icon>
	)
}

function Modal({
	children,
	title,
	onClose,
}: {
	children: ReactNode
	title?: string
	onClose?: () => void
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 p-4">
			<section
				aria-modal="true"
				className="w-full max-w-[490px] overflow-hidden rounded-[20px] border-[3px] border-primary bg-white shadow-2xl"
				role="dialog"
			>
				{title && (
					<header className="flex h-[62px] items-center justify-between bg-primary px-4 text-lg font-bold text-white">
						<h2>{title}</h2>
						{onClose && (
							<button aria-label="Close" onClick={onClose} type="button">
								<Close />
							</button>
						)}
					</header>
				)}
				{children}
			</section>
		</div>
	)
}

function YesNo({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
	return (
		<div className="flex h-8 w-[104px] rounded-full border-2 border-primary p-0.5 text-xs font-bold">
			<button
				className={`flex-1 rounded-full ${value ? "bg-primary text-white" : "text-primary"}`}
				onClick={() => onChange(true)}
				type="button"
			>
				Yes
			</button>
			<button
				className={`flex-1 rounded-full ${!value ? "bg-primary text-white" : "text-primary"}`}
				onClick={() => onChange(false)}
				type="button"
			>
				No
			</button>
		</div>
	)
}

export function ProfilePageContent({ initialProfile }: { initialProfile: Profile }) {
	const [profile, setProfile] = useState(initialProfile)
	const [draft, setDraft] = useState(initialProfile)
	const [editing, setEditing] = useState<Editing>(null)
	const [completedSection, setCompletedSection] = useState<Exclude<Editing, null>>("personal")
	const [confirmation, setConfirmation] = useState<Confirmation>(null)
	const [outcome, setOutcome] = useState<Outcome>(null)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState("")

	const openEditor = (section: Exclude<Editing, null>) => {
		setDraft(profile)
		setEditing(section)
		setError("")
	}
	const closeEditor = () => setConfirmation("discard")
	const save = async () => {
		if (!editing) return
		setSaving(true)
		setError("")
		const body =
			editing === "personal"
				? {
					section: "personal",
					firstName: draft.firstName,
					lastName: draft.lastName,
					mobile: draft.mobile,
					address: draft.address,
				}
				: {
					section: "logistics",
					carType: draft.carType,
					forkliftLicense: draft.forkliftLicense,
					firstAid: draft.firstAid,
				}
		const response = await fetch("/api/profile", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})
		setSaving(false)
		if (!response.ok) {
			setError("Your changes could not be saved. Please try again.")
			return
		}
		setProfile((current) => ({
			...current,
			...draft,
			name: editing === "personal" ? `${draft.firstName} ${draft.lastName}`.trim() : current.name,
		}))
		setCompletedSection(editing)
		setConfirmation(null)
		setEditing(null)
		setOutcome("applied")
	}
	const discard = () => {
		if (editing) setCompletedSection(editing)
		setConfirmation(null)
		setEditing(null)
		setOutcome("discarded")
	}
	const sectionLabel =
		completedSection === "logistics" ? "Logistics Details" : "Personal Information"

	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] bg-white text-primary">
			<VolunteerSidebar />
			<main className="min-w-0 flex-1 px-6 py-3 sm:px-10">
				<div className="flex items-center justify-between border-b-2 border-base-300 pb-2">
					<h1 className="text-3xl">Profile</h1>
					<Bell />
				</div>
				<section className="flex items-center gap-4 border-b-2 border-base-300 py-4">
					<Avatar />
					<div className="text-sm font-bold">
						<p>{profile.name || "Name Surname"}</p>
						<p>{profile.email}</p>
					</div>
				</section>
				<section className="border-b-2 border-base-300 py-2">
					<h2 className="text-xl">My Impact</h2>
					<dl className="mt-3 grid max-w-[620px] grid-cols-[1fr_auto] gap-y-3 text-sm">
						<dt className="font-bold">Total Commitments</dt>
						<dd>{profile.impact.commitments}</dd>
						<dt className="font-bold">Total Hours</dt>
						<dd>{profile.impact.hours}</dd>
						<dt className="font-bold">Total Orders Packed</dt>
						<dd>{profile.impact.ordersPacked}</dd>
					</dl>
				</section>
				<section className="border-b-2 border-base-300 py-3">
					<h2 className="text-xl">Personal Information</h2>
					<dl className="mt-4 grid max-w-[620px] grid-cols-[170px_1fr] gap-y-4 text-sm">
						<dt className="font-bold">First Name</dt>
						<dd>{profile.firstName || "—"}</dd>
						<dt className="font-bold">Last Name</dt>
						<dd>{profile.lastName || "—"}</dd>
						<dt className="font-bold">Mobile</dt>
						<dd>{profile.mobile || "—"}</dd>
						<dt className="font-bold">Address</dt>
						<dd>{profile.address || "—"}</dd>
					</dl>
					<button
						className="mt-5 h-10 min-w-[340px] rounded-full bg-accent px-6 text-sm font-bold text-white"
						onClick={() => openEditor("personal")}
						type="button"
					>
						Edit Personal Information
					</button>
				</section>
				<section className="py-3">
					<h2 className="text-xl">Logistics Details</h2>
					<dl className="mt-4 grid max-w-[620px] grid-cols-[170px_1fr] gap-y-4 text-sm">
						<dt className="font-bold">Car type</dt>
						<dd>{profile.carType || "—"}</dd>
						<dt className="font-bold">Forklift license</dt>
						<dd>{profile.forkliftLicense ? "Yes" : "No"}</dd>
						<dt className="font-bold">First Aid</dt>
						<dd>{profile.firstAid ? "Yes" : "No"}</dd>
					</dl>
					<button
						className="mt-5 h-10 min-w-[340px] rounded-full bg-accent px-6 text-sm font-bold text-white"
						onClick={() => openEditor("logistics")}
						type="button"
					>
						Edit Logistics Details
					</button>
				</section>
			</main>
			{editing === "personal" && !confirmation && !outcome && (
				<Modal onClose={closeEditor} title="Edit Personal Information">
					<form
						className="space-y-3 p-4"
						onSubmit={(event: FormEvent) => {
							event.preventDefault()
							setConfirmation("save")
						}}
					>
						<Field
							label="First Name"
							value={draft.firstName}
							onChange={(value) => setDraft({ ...draft, firstName: value })}
						/>
						<Field
							label="Last Name"
							value={draft.lastName}
							onChange={(value) => setDraft({ ...draft, lastName: value })}
						/>
						<Field
							label="Mobile"
							value={draft.mobile}
							onChange={(value) => setDraft({ ...draft, mobile: value })}
						/>
						<Field
							label="Address"
							value={draft.address}
							onChange={(value) => setDraft({ ...draft, address: value })}
						/>
						{error && <p className="text-sm font-bold text-accent">{error}</p>}
						<button
							className="h-10 w-full rounded-full bg-accent text-sm font-bold text-white"
							type="submit"
						>
							Save
						</button>
					</form>
				</Modal>
			)}
			{editing === "logistics" && !confirmation && !outcome && (
				<Modal onClose={closeEditor} title="Edit Logistics Details">
					<form
						className="space-y-4 p-4"
						onSubmit={(event: FormEvent) => {
							event.preventDefault()
							setConfirmation("save")
						}}
					>
						<Field
							label="Car Type"
							value={draft.carType}
							onChange={(value) => setDraft({ ...draft, carType: value })}
						/>
						<div className="block text-base font-bold">
							Forklift license
							<YesNo
								value={draft.forkliftLicense}
								onChange={(value) => setDraft({ ...draft, forkliftLicense: value })}
							/>
						</div>
						<div className="block text-base font-bold">
							First Aid
							<YesNo
								value={draft.firstAid}
								onChange={(value) => setDraft({ ...draft, firstAid: value })}
							/>
						</div>
						{error && <p className="text-sm font-bold text-accent">{error}</p>}
						<button
							className="h-10 w-full rounded-full bg-accent text-sm font-bold text-white"
							type="submit"
						>
							Save
						</button>
					</form>
				</Modal>
			)}
			{confirmation && (
				<Modal>
					<div className="space-y-4 px-6 py-10 text-center">
						<div className="flex justify-center">
							<EditIcon />
						</div>
						<h2 className="text-lg">
							{confirmation === "save" ? "Save changes?" : "Unsaved changes"}
						</h2>
						<p className="text-sm">
							{confirmation === "save"
								? "Are you sure you want to save your changes?"
								: "Are you sure you want to exit without saving?"}
						</p>
						<div className="flex gap-2">
							<button
								className="h-10 flex-1 rounded-full border-2 border-accent font-bold text-accent"
								onClick={() => setConfirmation(null)}
								type="button"
							>
								Keep editing
							</button>
							<button
								className="h-10 flex-1 rounded-full bg-accent font-bold text-white disabled:opacity-60"
								disabled={saving}
								onClick={confirmation === "save" ? save : discard}
								type="button"
							>
								{confirmation === "save" && saving
									? "Saving..."
									: confirmation === "save"
										? "Save"
										: "Discard"}
							</button>
						</div>
					</div>
				</Modal>
			)}
			{outcome && (
				<Modal>
					<div className="space-y-4 px-6 py-12 text-center">
						<div className="flex justify-center">
							<CheckIcon />
						</div>
						<h2 className="text-lg">Changes {outcome === "applied" ? "applied" : "not applied"}</h2>
						<p className="text-sm">
							Your changes to {sectionLabel}{" "}
							{outcome === "applied" ? "has been applied" : "has not been applied"}
						</p>
						<button
							className="h-10 min-w-[140px] rounded-full bg-accent px-7 font-bold text-white"
							onClick={() => setOutcome(null)}
							type="button"
						>
							Done
						</button>
					</div>
				</Modal>
			)}
		</div>
	)
}

function Field({
	label,
	value,
	onChange,
}: {
	label: string
	value: string
	onChange: (value: string) => void
}) {
	return (
		<label className="block text-base font-bold">
			{label}
			<input
				className="mt-1 block h-8 w-full rounded-full border-2 border-neutral bg-white px-3 text-sm font-normal"
				onChange={(event) => onChange(event.target.value)}
				value={value}
			/>
		</label>
	)
}
