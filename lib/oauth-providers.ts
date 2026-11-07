export type SocialProvider = "google"

function requiredCredentialGroup(names: string[]) {
	const values = names.map((name) => process.env[name]?.trim())
	const configuredValues = values.filter(Boolean)

	if (configuredValues.length > 0 && configuredValues.length !== names.length) {
		throw new Error(`${names.join(", ")} must be set together`)
	}

	return configuredValues.length === names.length
		? values.map((value) => value as string)
		: undefined
}

function oauthCredentials(clientIdName: string, clientSecretName: string) {
	const credentials = requiredCredentialGroup([clientIdName, clientSecretName])

	return credentials ? { clientId: credentials[0], clientSecret: credentials[1] } : undefined
}

const google = oauthCredentials("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET")

export const socialProviders = {
	...(google ? { google } : {}),
}

export function getEnabledSocialProviders(): SocialProvider[] {
	return [
		...(google ? (["google"] as const) : []),
	]
}
