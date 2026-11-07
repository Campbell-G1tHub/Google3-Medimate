import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type ProfileInput = {
	section: "personal" | "logistics"
	firstName?: string
	lastName?: string
	mobile?: string
	address?: string
	carType?: string
	forkliftLicense?: boolean
	firstAid?: boolean
}

function text(value: unknown) {
	return typeof value === "string" ? value.trim() : undefined
}

function valid(input: unknown): input is ProfileInput {
	if (!input || typeof input !== "object") return false
	const data = input as Record<string, unknown>
	return data.section === "personal" || data.section === "logistics"
}

export async function PUT(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers })
	if (!session) return Response.json({ error: "Authentication is required." }, { status: 401 })
	const input: unknown = await request.json().catch(() => null)
	if (!valid(input)) return Response.json({ error: "Invalid profile update." }, { status: 400 })

	const current = await prisma.volunteerInformation.findUnique({
		where: { volunteerId: session.user.id },
	})
	const firstName =
		text(input.firstName) ?? current?.firstName ?? session.user.name.split(" ")[0] ?? ""
	const lastName =
		text(input.lastName) ?? current?.lastName ?? session.user.name.split(" ").slice(1).join(" ")
	const data = {
		firstName,
		lastName,
		mobile: text(input.mobile) ?? current?.mobile ?? "",
		address: text(input.address) ?? current?.address ?? "",
		carType: text(input.carType) ?? current?.carType ?? null,
		forkliftLicense: input.forkliftLicense ?? current?.forkliftLicense ?? false,
		firstAid: input.firstAid ?? current?.firstAid ?? false,
	}

	const [information] = await prisma.$transaction([
		prisma.volunteerInformation.upsert({
			where: { volunteerId: session.user.id },
			create: {
				volunteerId: session.user.id,
				...data,
				dateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
				motivation: "",
				skillsAndStrengths: "",
				frequency: "",
				availability: "",
				agreementAccepted: false,
				policeCheckConsent: false,
				newsletterOptIn: false,
				referralSources: "",
			},
			update: data,
		}),
		...(input.section === "personal"
			? [
					prisma.volunteer.update({
						where: { id: session.user.id },
						data: { name: `${firstName} ${lastName}`.trim() || session.user.name },
					}),
				]
			: []),
	])

	return Response.json({ information })
}
