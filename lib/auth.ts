import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { sendVerificationEmail } from "@/lib/auth-email"
import { prisma } from "@/lib/prisma"

export const auth = betterAuth({
	user: {
		modelName: "volunteer"
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
	},
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: false,
		expiresIn: 60 * 60,
		sendVerificationEmail: async ({ user, url }) => {
			await sendVerificationEmail(user.email, url)
		},
	},
})
