export type SocialProvider = "google" | "facebook"

function getCredentials(clientIdName: string, clientSecretName: string) {
	const clientId = process.env[clientIdName]?.trim()
	const clientSecret = process.env[clientSecretName]?.trim()

	if (Boolean(clientId) !== Boolean(clientSecret)) {
		throw new Error(`${clientIdName} and ${clientSecretName} must be set together.`)
	}

	return clientId && clientSecret ? { clientId, clientSecret } : undefined
}

const google = getCredentials("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET")
const facebook = getCredentials("FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET")

export const socialProviders = {
	...(google ? { google } : {}),
	...(facebook ? { facebook } : {}),
}

export function getEnabledSocialProviders(): SocialProvider[] {
	return [...(google ? (["google"] as const) : []), ...(facebook ? (["facebook"] as const) : [])]
}
