import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "./tests/e2e",
	globalSetup: "./tests/e2e/global-setup.ts",
	// Tests share one database, so they run one at a time.
	fullyParallel: false,
	workers: 1,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	// The dev server compiles pages on first visit.
	timeout: 60_000,
	expect: { timeout: 15_000 },
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	projects: [
		{
			name: "desktop",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "mobile",
			use: { ...devices["Pixel 7"] },
			testIgnore: /api\//,
		},
	],
})
