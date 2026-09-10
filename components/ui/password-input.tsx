"use client"

import Image from "next/image"
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
					className="btn btn-ghost btn-xs"
					onClick={() => setVisible((current) => !current)}
					aria-pressed={visible}
					aria-label={visible ? "Hide password" : "Show password"}
				>
					<Image
						src="/icons/show_password.png"
						alt=""
						width={18}
						height={18}
						className={visible ? "opacity-100" : "opacity-50"}
					/>
				</button>
			}
			{...props}
		/>
	)
}
