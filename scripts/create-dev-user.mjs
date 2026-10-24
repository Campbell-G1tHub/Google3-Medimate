import "dotenv/config"
import { hashPassword } from "better-auth/crypto"
import pg from "pg"

const [email, password, role = "VOLUNTEER"] = process.argv.slice(2)

if (!email || !password || !["ADMIN", "VOLUNTEER"].includes(role)) {
	console.error("Usage: node scripts/create-dev-user.mjs <email> <password> [ADMIN|VOLUNTEER]")
	process.exit(1)
}

async function loadIssuerFactory() {
	const candidates = ["better-auth", "better-auth/db", "@better-auth/core", "@better-auth/core/db"]
	for (const path of candidates) {
		const mod = await import(path).catch(() => ({}))
		if (typeof mod.createLocalAccountIssuer === "function") {
			return mod.createLocalAccountIssuer
		}
	}
	throw new Error("better-auth does not export createLocalAccountIssuer from any known path")
}

const createLocalAccountIssuer = await loadIssuerFactory()
const issuer = createLocalAccountIssuer("credential")
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
	const {
		rows: [user],
	} = await client.query(
		`INSERT INTO volunteers (name, email, email_verified, onboarding_completed, role)
		VALUES ($1, $2, true, true, $3)
		ON CONFLICT (email) DO UPDATE
			SET email_verified = true, onboarding_completed = true, role = $3
		RETURNING id`,
		[email.split("@")[0], email.toLowerCase(), role],
	)

	await client.query(`DELETE FROM accounts WHERE user_id = $1 AND provider_id = 'credential'`, [
		user.id,
	])
	await client.query(
		`INSERT INTO accounts (user_id, issuer, account_id, provider_id, password)
		VALUES ($1, $2, $3, 'credential', $4)`,
		[user.id, issuer, user.id, await hashPassword(password)],
	)

	console.log(`${role} ready: ${email} (${user.id}), issuer ${issuer}`)
} finally {
	await client.end()
}