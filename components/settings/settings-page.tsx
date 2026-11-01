"use client"

import { useState, type FormEvent, type ReactNode, type SVGProps } from "react"
import { useRouter } from "next/navigation"
import { VolunteerSidebar } from "@/components/navigation/volunteer-sidebar"
import { changePassword, deleteUser, signOut } from "@/lib/auth-client"

type Dialog = "password" | "delete" | "delete-confirm" | "deleted" | "logout" | null

const preferences = [
	"Assisting with tasks in our warehouse - cleaning, sorting, itemising, packing",
	"Digital communications - branding, content, marketing, graphic design",
	"Logistics - pickups from hospitals and drop off to the warehouse",
	"Fundraising",
	"Grant writing and Scientific Research (healthcare sustainability and health impact)",
	"Hospital liaison or representative",
	"Board member",
	"Community Engagement",
	"Innovation team - Computer Science, App Development",
	"Innovation team - industrial design for precious plastic project",
	"Sustainability Research team",
	"Corporate Sponsorship and Partnerships team",
]

const preferenceColumns = [preferences.slice(0, 6), preferences.slice(6)]

function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="28"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2.2"
			viewBox="0 0 24 24"
			width="28"
			{...props}
		>
			{children}
		</svg>
	)
}

function BellIcon() {
	return (
		<Icon>
			<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
		</Icon>
	)
}
function CloseIcon() {
	return (
		<Icon>
			<path d="m6 6 12 12M18 6 6 18" />
		</Icon>
	)
}
function AlertIcon() {
	return (
		<Icon height="48" width="48">
			<path d="M8.5 3h7l5 5v8l-5 5h-7l-5-5V8l5-5Z" />
			<path d="M12 9v5M12 17h.01" />
		</Icon>
	)
}
function DeletedIcon() {
	return (
		<Icon height="54" width="54">
			<circle cx="9" cy="7" r="4" />
			<path d="M2.5 20c.5-4.1 3-6.5 6.5-6.5 2.6 0 4.6 1 5.8 2.9M17 8l5 5M22 8l-5 5" />
		</Icon>
	)
}
function LogoutIcon() {
	return (
		<Icon height="54" width="54">
			<path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M13 8l4 4-4 4M8 12h9" />
		</Icon>
	)
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
	return (
		<button
			aria-checked={checked}
			className="flex h-9 w-[110px] items-center rounded-full border-2 border-primary bg-white p-1 text-xs font-bold text-primary"
			onClick={onChange}
			role="switch"
			type="button"
		>
			<span
				className={`flex h-7 w-[52px] items-center justify-center rounded-full transition ${checked ? "bg-primary text-white" : "translate-x-[48px] bg-white"}`}
			>
				{checked ? "On" : "Off"}
			</span>
			<span className={`w-[52px] ${checked ? "text-primary" : "-translate-x-[52px] text-primary"}`}>
				{checked ? "Off" : "On"}
			</span>
		</button>
	)
}

function Modal({
	children,
	className = "",
	onClose,
	title,
}: {
	children: ReactNode
	className?: string
	onClose?: () => void
	title?: string
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 p-4">
			<section
				aria-modal="true"
				className={`w-full max-w-[470px] overflow-hidden rounded-[18px] border-[3px] border-primary bg-white shadow-2xl ${className}`}
				role="dialog"
			>
				{title && (
					<header className="flex h-[68px] items-center justify-between bg-primary px-5 text-2xl font-bold text-white">
						<h2>{title}</h2>
						{onClose && (
							<button aria-label="Close" className="p-1 text-white" onClick={onClose} type="button">
								<CloseIcon />
							</button>
						)}
					</header>
				)}
				{children}
			</section>
		</div>
	)
}

type SettingsValues = {
	appNotifications: boolean
	opportunityNotifications: boolean
	newsletterNotifications: boolean
	preferences: string[]
}

export function SettingsPageContent({ initialSettings }: { initialSettings: SettingsValues }) {
	const router = useRouter()
	const [dialog, setDialog] = useState<Dialog>(null)
	const [settings, setSettings] = useState<SettingsValues>(initialSettings)
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [deletePassword, setDeletePassword] = useState("")
	const [error, setError] = useState("")
	const [settingsError, setSettingsError] = useState("")
	const [submitting, setSubmitting] = useState(false)

	const saveSettings = async (next: SettingsValues) => {
		setSettings(next)
		setSettingsError("")
		const response = await fetch("/api/settings", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(next),
		})
		if (!response.ok) {
			setSettings(initialSettings)
			setSettingsError("Your notification settings could not be saved. Please try again.")
		}
	}
	const togglePreference = (preference: string) => {
		const selected = settings.preferences.includes(preference)
		void saveSettings({
			...settings,
			preferences: selected
				? settings.preferences.filter((item) => item !== preference)
				: [...settings.preferences, preference],
		})
	}
	const changePasswordSubmit = async (event: FormEvent) => {
		event.preventDefault()
		setError("")
		if (newPassword.length < 8) return setError("Your new password must be at least 8 characters.")
		if (newPassword !== confirmPassword) return setError("The new passwords do not match.")
		setSubmitting(true)
		const { error: requestError } = await changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: false,
		})
		setSubmitting(false)
		if (requestError) return setError("Your current password could not be verified.")
		setCurrentPassword("")
		setNewPassword("")
		setConfirmPassword("")
		setDialog(null)
	}
	const deleteAccount = async () => {
		setSubmitting(true)
		setError("")
		const { error: requestError } = await deleteUser({ password: deletePassword })
		setSubmitting(false)
		if (requestError) return setError("Your password could not be verified. Please try again.")
		setDialog("deleted")
	}
	const logout = () => void signOut({ fetchOptions: { onSuccess: () => router.push("/login") } })

	return (
		<div className="flex min-h-[calc(100vh-3.5rem)] bg-white">
			<VolunteerSidebar />
			<div className="min-w-0 flex-1 px-6 py-3 sm:px-10">
				<div className="flex items-center justify-between border-b-2 border-base-300 pb-2">
					<h1 className="text-3xl text-primary">Settings</h1>
					<BellIcon />
				</div>
				<div className="max-w-[1080px] pt-3 text-primary">
					<section className="space-y-3">
						<h2 className="text-base">App notifications</h2>
						<Toggle
							checked={settings.appNotifications}
							onChange={() =>
								void saveSettings({ ...settings, appNotifications: !settings.appNotifications })
							}
						/>
						<h2 className="pt-1 text-base">Opportunity Notifications</h2>
						<Toggle
							checked={settings.opportunityNotifications}
							onChange={() =>
								void saveSettings({
									...settings,
									opportunityNotifications: !settings.opportunityNotifications,
								})
							}
						/>
						<h2 className="pt-1 text-base">Newsletter Notifications</h2>
						<Toggle
							checked={settings.newsletterNotifications}
							onChange={() =>
								void saveSettings({
									...settings,
									newsletterNotifications: !settings.newsletterNotifications,
								})
							}
						/>
					</section>
					<section className="mt-4">
						<h2 className="text-base">Opportunity Notification Preferences</h2>
						<div className="mt-3 grid gap-x-12 md:grid-cols-2">
							{preferenceColumns.map((column) => (
								<div className="space-y-4" key={column[0]}>
									{column.map((preference) => (
										<label
											className="flex cursor-pointer items-start gap-2 text-xs leading-5"
											key={preference}
										>
											<input
												checked={settings.preferences.includes(preference)}
												className="mt-0.5 h-5 w-5 shrink-0 appearance-none rounded border-2 border-base-300 checked:border-primary checked:bg-primary checked:bg-[linear-gradient(45deg,transparent_40%,white_40%,white_58%,transparent_58%),linear-gradient(-45deg,transparent_40%,white_40%,white_58%,transparent_58%)]"
												onChange={() => togglePreference(preference)}
												type="checkbox"
											/>
											{preference}
										</label>
									))}
								</div>
							))}
						</div>
					</section>
					{settingsError && (
						<p className="mt-3 text-sm font-semibold text-accent">{settingsError}</p>
					)}
					<section className="mt-7 space-y-2">
						<h2 className="text-xl">Account</h2>
						<button
							className="block h-10 rounded-full bg-accent px-5 text-sm font-bold text-white"
							onClick={() => {
								setError("")
								setDialog("password")
							}}
							type="button"
						>
							Change password
						</button>
						<button
							className="block h-10 rounded-full bg-accent px-5 text-sm font-bold text-white"
							onClick={() => {
								setError("")
								setDeletePassword("")
								setDialog("delete")
							}}
							type="button"
						>
							Delete Account
						</button>
						<button
							className="block h-10 rounded-full bg-accent px-5 text-sm font-bold text-white"
							onClick={() => setDialog("logout")}
							type="button"
						>
							Log out
						</button>
					</section>
				</div>
			</div>
			{dialog === "password" && (
				<Modal onClose={() => setDialog(null)} title="Change password">
					<form className="space-y-3 p-5" onSubmit={changePasswordSubmit}>
						<p className="text-sm">Enter your current password, then choose a new one</p>
						<label className="block text-xl font-bold">
							Current password
							<input
								className="mt-2 block h-10 w-full rounded-full border-2 border-neutral bg-white px-4 text-base font-normal"
								onChange={(event) => setCurrentPassword(event.target.value)}
								required
								type="password"
								value={currentPassword}
							/>
						</label>
						<label className="block text-xl font-bold">
							New password
							<input
								className="mt-2 block h-10 w-full rounded-full border-2 border-neutral bg-white px-4 text-base font-normal"
								onChange={(event) => setNewPassword(event.target.value)}
								required
								type="password"
								value={newPassword}
							/>
						</label>
						<p className="text-sm">At least 8 characters</p>
						<label className="block text-xl font-bold">
							Confirm new password
							<input
								className="mt-2 block h-10 w-full rounded-full border-2 border-neutral bg-white px-4 text-base font-normal"
								onChange={(event) => setConfirmPassword(event.target.value)}
								required
								type="password"
								value={confirmPassword}
							/>
						</label>
						{error && <p className="text-sm font-semibold text-accent">{error}</p>}
						<button
							className="h-11 w-full rounded-full bg-accent font-bold text-white disabled:opacity-60"
							disabled={submitting}
							type="submit"
						>
							{submitting ? "Changing password..." : "Change password"}
						</button>
					</form>
				</Modal>
			)}
			{dialog === "delete" && (
				<Modal title="Account deletion">
					<div className="space-y-4 p-5">
						<p>
							This permanently deletes your MediMate account and personal details. You will lose
							access to your opportunities. This can’t be undone
						</p>
						<label className="block text-xl font-bold">
							Enter your password to confirm
							<input
								className="mt-2 block h-10 w-full rounded-full border-2 border-neutral bg-white px-4 text-base font-normal"
								onChange={(event) => setDeletePassword(event.target.value)}
								type="password"
								value={deletePassword}
							/>
						</label>
						{error && <p className="text-sm font-semibold text-accent">{error}</p>}
						<div className="flex gap-2">
							<button
								className="h-10 flex-1 rounded-full border-2 border-accent font-bold text-accent"
								onClick={() => setDialog(null)}
								type="button"
							>
								Keep my account
							</button>
							<button
								className="h-10 flex-1 rounded-full bg-accent font-bold text-white"
								disabled={!deletePassword}
								onClick={() => setDialog("delete-confirm")}
								type="button"
							>
								Delete
							</button>
						</div>
					</div>
				</Modal>
			)}
			{dialog === "delete-confirm" && (
				<Modal>
					<div className="space-y-4 px-5 py-9 text-center">
						<div className="flex justify-center text-primary">
							<AlertIcon />
						</div>
						<h2 className="text-xl">Account deletion</h2>
						<p>Are you sure you want to delete your account?</p>
						{error && <p className="text-sm font-semibold text-accent">{error}</p>}
						<div className="flex gap-2 pt-2">
							<button
								className="h-10 flex-1 rounded-full border-2 border-accent font-bold text-accent"
								onClick={() => setDialog("delete")}
								type="button"
							>
								No
							</button>
							<button
								className="h-10 flex-1 rounded-full bg-accent font-bold text-white disabled:opacity-60"
								disabled={submitting}
								onClick={deleteAccount}
								type="button"
							>
								{submitting ? "Deleting..." : "Yes"}
							</button>
						</div>
					</div>
				</Modal>
			)}
			{dialog === "deleted" && (
				<Modal className="max-w-[740px] rounded-[28px] border-[4px]">
					<div className="space-y-5 px-9 py-16 text-center sm:px-16">
						<div className="flex justify-center text-primary">
							<DeletedIcon />
						</div>
						<h2 className="text-xl">Your account has been deleted</h2>
						<p>You will be directed to the login page</p>
						<button
							className="h-14 w-full rounded-full bg-accent text-xl font-bold text-white"
							onClick={() => router.push("/login")}
							type="button"
						>
							Go to Login
						</button>
					</div>
				</Modal>
			)}
			{dialog === "logout" && (
				<Modal>
					<div className="space-y-4 px-5 py-12 text-center">
						<div className="flex justify-center text-primary">
							<LogoutIcon />
						</div>
						<h2 className="text-xl">Log out?</h2>
						<p>You&apos;ll need to log in again to see your opportunities and notifications</p>
						<div className="flex gap-2 pt-2">
							<button
								className="h-10 flex-1 rounded-full border-2 border-accent font-bold text-accent"
								onClick={() => setDialog(null)}
								type="button"
							>
								Stay logged in
							</button>
							<button
								className="h-10 flex-1 rounded-full bg-accent font-bold text-white"
								onClick={logout}
								type="button"
							>
								Log out
							</button>
						</div>
					</div>
				</Modal>
			)}
		</div>
	)
}
