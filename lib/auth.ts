import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"
import {
	sendOneTimePasswordEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
} from "@/lib/auth-email"
import { oauthTrustedOrigins, socialProviders } from "@/lib/oauth-providers"
import { prisma } from "@/lib/prisma"

const configuredTrustedOrigins =
	process.env.AUTH_TRUSTED_ORIGINS?.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean) ?? []
const trustedOrigins = [...new Set([...configuredTrustedOrigins, ...oauthTrustedOrigins])]

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	trustedOrigins,
	socialProviders,
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
		expiresIn: 60 * 60,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail(user.email, url)
		},
	},
	plugins: [
		emailOTP({
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
