<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error - MyRecipeBox</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
	<div class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
		<div class="mb-4">
			<svg
				class="mx-auto h-12 w-12 text-red-500"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
				/>
			</svg>
		</div>

		<h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Error</h1>

		<p class="mb-6 text-gray-600 dark:text-gray-400">
			{$page.error?.message || 'An unexpected error occurred'}
		</p>

		<div class="space-y-3">
			<a
				href="/"
				class="block w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
			>
				Back to Home
			</a>

			{#if $page.status === 404}
				<p class="text-sm text-gray-500 dark:text-gray-400">
					The page you're looking for doesn't exist.
				</p>
			{/if}
		</div>
	</div>
</div>
