import { defineConfig } from 'vite';

export default defineConfig({
	// No SvelteKit plugins for simple dev server
	plugins: [],
	server: {
		watch: {
			ignored: ['**/pocketbase/**', '**/pb_data/**', '**/*.db', '**/*.db-*']
		}
	},
	test: {
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'json-summary'],
			reportsDirectory: './coverage',
			include: ['src/**/*.{js,ts,svelte}'],
			exclude: ['src/**/*.{test,spec}.{js,ts}', 'src/**/*.d.ts']
		},
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
		setupFiles: ['./vitest-setup-server.ts']
	}
});