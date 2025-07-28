<script lang="ts">
	import { isAuthenticated, isAdmin } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if ($isAuthenticated && $isAdmin) {
			// Redirect to the new extraction page
			goto('/admin/recipes/extract');
		}
	});
</script>

<svelte:head>
	<title>Create New Recipe - MyRecipeBox</title>
</svelte:head>

{#if !$isAuthenticated || !$isAdmin}
	<div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
		<div class="text-center" data-testid="access-denied">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
			<p class="mt-2 text-gray-600 dark:text-gray-400">
				You need admin privileges to create recipes.
			</p>
			<a
				href="/auth/login"
				class="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				data-testid="access-denied-login-link"
			>
				Sign In
			</a>
		</div>
	</div>
{/if}
