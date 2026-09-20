import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { emailOTP } from "better-auth/plugins"
import { sendOneTimePasswordEmail, sendPasswordResetEmail } from "@/lib/auth-email"
import { prisma } from "@/lib/prisma"
import { nextCookies } from "better-auth/next-js"

const trustedOrigins = process.env.AUTH_TRUSTED_ORIGINS?.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean)

export const auth = betterAuth({
	trustedOrigins,
	rateLimit: {
		enabled: process.env.NODE_ENV === "production",
		window: 10,
		max: 100
	},
	user: {
		modelName: "volunteer",
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
		nextCookies()
	],
})
