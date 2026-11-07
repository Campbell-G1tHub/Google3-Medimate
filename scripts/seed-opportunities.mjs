// Seeds test opportunities for the /opportunities page. Opportunities are `events` rows with
// status OPEN, which is what app/opportunities/page.tsx and app/api/events/route.ts list.
//
// Usage:
//   node scripts/seed-opportunities.mjs            # create or refresh the seeded opportunities
//   node scripts/seed-opportunities.mjs --reset    # delete the seeded opportunities first
//
// Re-running is safe: rows are matched on (title, creator_id) and updated in place, so existing
// sign-ups on those events are preserved.
import "dotenv/config"
import pg from "pg"

const reset = process.argv.slice(2).includes("--reset")

// Fallback owner for the events. Only used when the database has no ADMIN volunteer yet.
const FALLBACK_ADMIN = { name: "Medimate Admin", email: "medimate.admin@localhost.local" }

// Titles carry a "warehouse" or "delivery" keyword in a few rows because the opportunities UI
// derives the card category (and the Reserve vs Sign up button) from the title text.
const OPPORTUNITIES = [
	{
		title: "Warehouse lorem ipsum dolor sit amet",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		location: "Melbourne CBD",
		startsInDays: 1,
		startsAtTime: [9, 0],
		durationMinutes: 180,
	},
	{
		title: "Lorem ipsum dolor sit amet consectetur",
		description:
			"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
		location: "Fitzroy",
		startsInDays: 2,
		startsAtTime: [13, 0],
		durationMinutes: 150,
	},
	{
		title: "Delivery lorem ipsum tempor incididunt",
		description:
			"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
		location: "Carlton",
		startsInDays: 3,
		startsAtTime: [10, 30],
		durationMinutes: 120,
	},
	{
		title: "Lorem ipsum sed do eiusmod tempor",
		description:
			"Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
		location: "Richmond",
		startsInDays: 5,
		startsAtTime: [9, 30],
		durationMinutes: 240,
	},
	{
		title: "Warehouse ut labore et dolore magna aliqua",
		description:
			"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
		location: "St Kilda",
		startsInDays: 6,
		startsAtTime: [14, 0],
		durationMinutes: 180,
	},
	{
		title: "Lorem ipsum ut enim ad minim veniam",
		description:
			"Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
		location: "Footscray",
		startsInDays: 8,
		startsAtTime: [9, 0],
		durationMinutes: 120,
	},
	{
		title: "Delivery quis nostrud exercitation ullamco",
		description:
			"Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
		location: "Brunswick",
		startsInDays: 9,
		startsAtTime: [11, 0],
		durationMinutes: 150,
	},
	{
		title: "Lorem ipsum laboris nisi ut aliquip ex ea",
		description:
			"Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
		location: "Docklands",
		startsInDays: 11,
		startsAtTime: [13, 30],
		durationMinutes: 180,
	},
	{
		title: "Warehouse commodo consequat duis aute irure",
		description:
			"Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi.",
		location: "Southbank",
		startsInDays: 13,
		startsAtTime: [8, 30],
		durationMinutes: 240,
	},
	{
		title: "Lorem ipsum dolor in reprehenderit voluptate",
		description:
			"Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.",
		location: "Prahran",
		startsInDays: 14,
		startsAtTime: [10, 0],
		durationMinutes: 120,
	},
	{
		title: "Delivery velit esse cillum dolore eu fugiat",
		description:
			"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque.",
		location: "Collingwood",
		startsInDays: 16,
		startsAtTime: [12, 0],
		durationMinutes: 90,
	},
	{
		title: "Lorem ipsum nulla pariatur excepteur sint",
		description:
			"Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.",
		location: "Northcote",
		startsInDays: 18,
		startsAtTime: [9, 0],
		durationMinutes: 180,
	},
	{
		title: "Warehouse occaecat cupidatat non proident",
		description:
			"Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae.",
		location: "Preston",
		startsInDays: 21,
		startsAtTime: [15, 0],
		durationMinutes: 120,
	},
	{
		title: "Lorem ipsum sunt in culpa qui officia",
		description:
			"Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur.",
		location: "Sunshine",
		startsInDays: 24,
		startsAtTime: [10, 30],
		durationMinutes: 150,
	},
	{
		title: "Lorem ipsum deserunt mollit anim id est laborum",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		location: null, // falls back to "Location to be confirmed" in the UI
		startsInDays: 27,
		startsAtTime: [13, 0],
		durationMinutes: 180,
	},
	{
		title: "Lorem ipsum sed perspiciatis unde omnis iste",
		description:
			"Quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.",
		location: "Box Hill",
		startsInDays: null, // falls back to "Time to be confirmed" in the UI
		startsAtTime: null,
		durationMinutes: null,
	},
]

/** Current UTC offset of Melbourne in minutes, so shifts read as Melbourne wall-clock times. */
function melbourneOffsetMinutes(instant) {
	const formatter = new Intl.DateTimeFormat("en-AU", {
		timeZone: "Australia/Melbourne",
		timeZoneName: "longOffset",
	})
	const zone = formatter.formatToParts(instant).find((part) => part.type === "timeZoneName")
	const match = zone?.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/)
	if (!match) return 0
	const sign = match[1] === "-" ? -1 : 1
	return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0))
}

/** Today's calendar date in Melbourne as [year, monthIndex, day]. */
function melbourneToday() {
	const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Australia/Melbourne",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	})
		.format(new Date())
		.split("-")
		.map(Number)
	return [year, month - 1, day]
}

/** Returns the event window for an opportunity, or null times when it is still to be confirmed. */
function eventWindow({ startsInDays, startsAtTime, durationMinutes }) {
	if (startsInDays === null || startsAtTime === null) {
		return { startsAt: null, endsAt: null }
	}
	const [hour, minute] = startsAtTime
	const [year, monthIndex, day] = melbourneToday()
	// Wall-clock time in Melbourne, corrected back to the matching UTC instant.
	const wallClock = Date.UTC(year, monthIndex, day + startsInDays, hour, minute)
	const startsAt = new Date(wallClock - melbourneOffsetMinutes(new Date(wallClock)) * 60_000)
	const endsAt = new Date(startsAt.getTime() + (durationMinutes ?? 120) * 60_000)
	return { startsAt, endsAt }
}

/** Picks an admin to own the seeded events, creating the fallback admin when none exists yet. */
async function findOrCreateCreator(client) {
	const { rows } = await client.query(
		"SELECT id, name, email FROM volunteers WHERE role = 'ADMIN' ORDER BY created_at LIMIT 1",
	)
	if (rows[0]) return rows[0]

	const { rows: created } = await client.query(
		`INSERT INTO volunteers (name, email, email_verified, onboarding_completed, role)
		 VALUES ($1, $2, true, true, 'ADMIN')
		 RETURNING id, name, email`,
		[FALLBACK_ADMIN.name, FALLBACK_ADMIN.email],
	)
	console.log(`No admin found, created ${FALLBACK_ADMIN.name} <${FALLBACK_ADMIN.email}>.`)
	return created[0]
}

async function deleteSeededEvents(client, creatorId) {
	const titles = OPPORTUNITIES.map((opportunity) => opportunity.title)
	const { rowCount } = await client.query(
		"DELETE FROM event_attendees WHERE event_id IN (SELECT id FROM events WHERE creator_id = $1 AND title = ANY($2::text[]))",
		[creatorId, titles],
	)
	const { rowCount: eventsDeleted } = await client.query(
		"DELETE FROM events WHERE creator_id = $1 AND title = ANY($2::text[])",
		[creatorId, titles],
	)
	console.log(`--reset removed ${eventsDeleted} seeded opportunities and ${rowCount} sign-ups.`)
}

async function seedOpportunity(client, creatorId, opportunity) {
	const { startsAt, endsAt } = eventWindow(opportunity)
	const { rows } = await client.query(
		"SELECT id FROM events WHERE title = $1 AND creator_id = $2",
		[opportunity.title, creatorId],
	)

	if (rows[0]) {
		await client.query(
			`UPDATE events
			 SET description = $2, location = $3, starts_at = $4, ends_at = $5, status = 'OPEN', updated_time = now()
			 WHERE id = $1`,
			[rows[0].id, opportunity.description, opportunity.location, startsAt, endsAt],
		)
		return "updated"
	}

	await client.query(
		`INSERT INTO events (creator_id, title, description, location, starts_at, ends_at, status)
		 VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')`,
		[creatorId, opportunity.title, opportunity.description, opportunity.location, startsAt, endsAt],
	)
	return "created"
}

async function main() {
	const connectionString = process.env.DATABASE_URL
	if (!connectionString) {
		throw new Error("DATABASE_URL is not set. Copy .env.example to .env or run inside compose.")
	}

	const client = new pg.Client({ connectionString })
	await client.connect()

	try {
		const creator = await findOrCreateCreator(client)

		if (reset) {
			await deleteSeededEvents(client, creator.id)
		}

		const counts = { created: 0, updated: 0 }
		for (const opportunity of OPPORTUNITIES) {
			counts[await seedOpportunity(client, creator.id, opportunity)] += 1
		}

		console.log(
			`Seeded ${OPPORTUNITIES.length} opportunities for ${creator.name} <${creator.email}>: ${counts.created} created, ${counts.updated} updated.`,
		)
	} finally {
		await client.end()
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error)
	process.exit(1)
})
