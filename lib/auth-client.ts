import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
// Type-only import: tells the client about the server's `additionalFields` (`role`,
// `onboardingCompleted`) without pulling the server auth/prisma modules into the bundle.
import type { auth } from "@/lib/auth"

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>(), emailOTPClient()],
})

export const {
	changePassword,
	deleteUser,
	requestPasswordReset,
	resetPassword,
	signIn,
	signOut,
	signUp,
	useSession,
} = authClient
