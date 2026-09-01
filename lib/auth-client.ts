import { emailOTPClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
	plugins: [emailOTPClient()],
})

export const { requestPasswordReset, resetPassword, signIn, signOut, signUp, useSession } =
	authClient
