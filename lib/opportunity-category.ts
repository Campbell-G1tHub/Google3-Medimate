/**
 * Keyword guess for an event's group/category, used by the volunteer-facing cards.
 *
 * This lives in its own module (rather than `lib/opportunities.ts`) so it stays
 * importable from Client Components: `lib/opportunities.ts` pulls in Prisma and
 * its Node-only dependencies, which must never enter the client bundle.
 */
export function opportunityCategoryFor(title: string) {
	const value = title.toLowerCase()
	if (value.includes("delivery")) return "Deliveries"
	if (value.includes("warehouse")) return "Warehouses"
	return "Community"
}
