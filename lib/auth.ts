import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"
import { sendOneTimePasswordEmail, sendPasswordResetEmail } from "@/lib/auth-email"
import { socialProviders } from "@/lib/oauth-providers"
import { prisma } from "@/lib/prisma"

const trustedOrigins =
	process.env.AUTH_TRUSTED_ORIGINS?.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean) ?? []

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	trustedOrigins,
	socialProviders,
	rateLimit: {
		enabled: process.env.NODE_ENV === "production",
		window: 10,
		max: 100,
	},
	user: {
		modelName: "volunteer",
		deleteUser: {
			enabled: true,
			beforeDelete: async (user) => {
				const createdEventIds = (
					await prisma.event.findMany({
						where: { creatorId: user.id },
						select: { id: true },
					})
				).map((event) => event.id)

				await prisma.$transaction(async (tx) => {
					await tx.notification.deleteMany({
						where: {
							post: {
								OR: [{ authorId: user.id }, { eventId: { in: createdEventIds } }],
							},
						},
					})
					await tx.post.deleteMany({
						where: { OR: [{ authorId: user.id }, { eventId: { in: createdEventIds } }] },
					})
					await tx.eventAttendee.deleteMany({
						where: { OR: [{ volunteerId: user.id }, { eventId: { in: createdEventIds } }] },
					})
					await tx.event.deleteMany({ where: { creatorId: user.id } })
					await tx.document.deleteMany({ where: { volunteerId: user.id } })
					await tx.referees.deleteMany({ where: { volunteerId: user.id } })
					await tx.volunteerGroupPreference.deleteMany({ where: { volunteerId: user.id } })
					await tx.notification_Permission.deleteMany({ where: { volunteerId: user.id } })
					await tx.volunteerNotificationSettings.deleteMany({ where: { volunteerId: user.id } })
					await tx.volunteerInformation.deleteMany({ where: { volunteerId: user.id } })
					await tx.emergencyContact.deleteMany({ where: { declarantId: user.id } })
				})
			},
		},
		additionalFields: {
			onboardingCompleted: {
				type: "boolean",
				defaultValue: false,
				input: false,
			},
			role: {
				type: "string",
				defaultValue: "VOLUNTEER",
				input: false,
			},
		},
	},
	verification: {
		fields: {
			value: "token",
		},
	},
	advanced: {
		database: {
			generateId: false,
		},
	},
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		resetPasswordTokenExpiresIn: 60 * 60,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail(user.email, url)
		},
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: false,
	},
	plugins: [
		emailOTP({
			overrideDefaultEmailVerification: true,
			disableSignUp: true,
			expiresIn: 10 * 60,
			allowedAttempts: 3,
			storeOTP: "hashed",
			sendVerificationOTP: async ({ email, otp, type }) => {
				await sendOneTimePasswordEmail(email, otp, type)
			},
		}),
		nextCookies(),
	],
})
