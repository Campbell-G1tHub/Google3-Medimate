"use client"

import type { Control, FieldErrors, UseFormRegister } from "react-hook-form"
import { Controller } from "react-hook-form"
import { DropdownSelect } from "@/components/ui/dropdown-select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
	type CreateOpportunityFormValues,
	OPPORTUNITY_CATEGORY_OPTIONS,
} from "@/lib/validation/opportunity"

const LABEL_CLASS = "text-sm font-bold text-primary"
const FIELD_CLASS = "rounded-full border-primary px-4"

/**
 * The category/role/location/time/capacity/description/requirements fields shared by the create
 * and edit opportunity dialogs, so both forms stay identical to the design. The caller supplies
 * the `react-hook-form` pieces and renders its own submit button and error alert.
 */
export function OpportunityFormFields({
	control,
	errors,
	register,
}: {
	control: Control<CreateOpportunityFormValues>
	errors: FieldErrors<CreateOpportunityFormValues>
	register: UseFormRegister<CreateOpportunityFormValues>
}) {
	return (
		<>
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
		</>
	)
}
