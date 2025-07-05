import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: [
		{
			command: 'cd pocketbase && ./pocketbase serve',
			port: 8090,
			reuseExistingServer: true,
			timeout: 5000
		},
		{
			command: 'npm run dev',
			port: 5173,
			reuseExistingServer: true,
			timeout: 10000
		}
	],
	globalSetup: './e2e/global-setup.ts',
	testDir: 'e2e',
	use: {
		baseURL: 'http://localhost:5173'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});
