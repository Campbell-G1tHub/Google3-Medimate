import type { HTMLAttributes, ReactNode } from "react"

export interface CardProps extends HTMLAttributes<HTMLElement> {
	children: ReactNode
	description?: string
	footer?: ReactNode
	title?: string
}

export function Card({ children, className, description, footer, title, ...props }: CardProps) {
	return (
		<article
			className={["card border border-base-300 bg-base-100 shadow-sm", className]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			<div className="card-body gap-4">
				{(title || description) && (
					<div>
						{title && <h3 className="card-title text-primary">{title}</h3>}
						{description && (
							<p className="mt-1 text-sm leading-6 text-base-content/65">{description}</p>
						)}
					</div>
				)}
				<div className="grow">{children}</div>
				{footer && <div className="card-actions justify-end">{footer}</div>}
			</div>
		</article>
	)
}
