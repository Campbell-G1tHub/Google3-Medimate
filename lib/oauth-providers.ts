import { importPKCS8, SignJWT } from "jose"

export type SocialProvider = "apple" | "google" | "facebook"

const APPLE_TRUSTED_ORIGIN = "https://appleid.apple.com"

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

const appleCredentials = requiredCredentialGroup([
	"APPLE_CLIENT_ID",
	"APPLE_TEAM_ID",
	"APPLE_KEY_ID",
	"APPLE_PRIVATE_KEY",
])
const google = oauthCredentials("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET")
const facebook = oauthCredentials("FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET")

async function generateAppleClientSecret() {
	if (!appleCredentials) {
		throw new Error("Apple credentials are not configured")
	}

	const [clientId, teamId, keyId, encodedPrivateKey] = appleCredentials
	const privateKey = encodedPrivateKey.replace(/\\n/g, "\n")
	const signingKey = await importPKCS8(privateKey, "ES256")
	const now = Math.floor(Date.now() / 1000)

	return new SignJWT({})
		.setProtectedHeader({ alg: "ES256", kid: keyId })
		.setIssuer(teamId)
		.setSubject(clientId)
		.setAudience(APPLE_TRUSTED_ORIGIN)
		.setIssuedAt(now)
		.setExpirationTime(now + 180 * 24 * 60 * 60)
		.sign(signingKey)
}

export const socialProviders = {
	...(appleCredentials
		? {
				apple: async () => ({
					clientId: appleCredentials[0],
					clientSecret: await generateAppleClientSecret(),
				}),
			}
		: {}),
	...(google ? { google } : {}),
	...(facebook ? { facebook } : {}),
}

export const oauthTrustedOrigins = appleCredentials ? [APPLE_TRUSTED_ORIGIN] : []

export function getEnabledSocialProviders(): SocialProvider[] {
	return [
		...(appleCredentials ? (["apple"] as const) : []),
		...(google ? (["google"] as const) : []),
		...(facebook ? (["facebook"] as const) : []),
	]
}
