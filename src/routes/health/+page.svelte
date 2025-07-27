<script lang="ts">
	import type { PageData } from './$types';
	
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Health Check - MyRecipeBox</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
	<div class="bg-white p-8 rounded-lg shadow-md dark:bg-gray-800">
		<h1 class="text-2xl font-bold text-green-600 mb-4">✅ Service Health Check</h1>
		<div class="space-y-2 text-gray-700 dark:text-gray-300">
			<p><strong>Status:</strong> {data.status}</p>
			<p><strong>Service:</strong> {data.service}</p>
			<p><strong>Timestamp:</strong> {data.timestamp}</p>
		</div>
	</div>
</div>