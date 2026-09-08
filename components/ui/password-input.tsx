"use client"

import { useState } from "react"
import { Input, type InputProps } from "./input"

export type PasswordInputProps = Omit<InputProps, "trailing" | "type">

export function PasswordInput({ ...props }: PasswordInputProps) {
	const [visible, setVisible] = useState(false)

	return (
		<Input
			type={visible ? "text" : "password"}
			trailing={
				<button
					type="button"
					className="btn btn-ghost btn-xs text-base-content/60"
					onClick={() => setVisible((current) => !current)}
					aria-pressed={visible}
				>
					{visible ? "Hide" : "Show"}
				</button>
			}
			{...props}
		/>
	)
}
