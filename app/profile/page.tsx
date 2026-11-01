import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ProfilePageContent } from "@/components/profile/profile-page"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function ProfilePage() {
	const session = await auth.api.getSession({ headers: await headers() })
	if (!session) redirect("/login")
	const [information, completed] = await Promise.all([
		prisma.volunteerInformation.findUnique({ where: { volunteerId: session.user.id } }),
		prisma.eventAttendee.findMany({
			where: {
				volunteerId: session.user.id,
				status: "ATTENDING",
				event: { endsAt: { lte: new Date() } },
			},
			select: { ordersPacked: true, event: { select: { startsAt: true, endsAt: true } } },
		}),
	])
	const nameParts = session.user.name.trim().split(/\s+/)
	const totalHours = completed.reduce((total, attendee) => {
		if (!attendee.event.startsAt || !attendee.event.endsAt) return total
		return (
			total +
			Math.max(0, (attendee.event.endsAt.getTime() - attendee.event.startsAt.getTime()) / 3_600_000)
		)
	}, 0)

	return (
		<ProfilePageContent
			initialProfile={{
				name: session.user.name,
				email: session.user.email,
				firstName: information?.firstName ?? nameParts[0] ?? "",
				lastName: information?.lastName ?? nameParts.slice(1).join(" "),
				mobile: information?.mobile ?? "",
				address: information?.address ?? "",
				carType: information?.carType ?? "",
				forkliftLicense: information?.forkliftLicense ?? false,
				firstAid: information?.firstAid ?? false,
				impact: {
					commitments: completed.length,
					hours: Number(totalHours.toFixed(1)),
					ordersPacked: completed.reduce((total, attendee) => total + attendee.ordersPacked, 0),
				},
			}}
		/>
	)
}
