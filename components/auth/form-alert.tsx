interface FormAlertProps {
	message?: string
	type?: "error" | "success"
}

export function FormAlert({ message, type = "error" }: FormAlertProps) {
	if (!message) {
		return null
	}

	return (
		<div className={`alert ${type === "error" ? "alert-error" : "alert-success"}`} role="status">
			<span className="text-sm">{message}</span>
		</div>
	)
}
