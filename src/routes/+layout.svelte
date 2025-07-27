<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { authStore, appStore, currentRoute, user, theme } from '$lib/stores';
	import Header from '$lib/components/layout/Header.svelte';
	import OfflineStatus from '$lib/components/ui/OfflineStatus.svelte';

	let { children } = $props();

	onMount(() => {
		// Initialize authentication
		// Only refresh if not already authenticated
		if (!$user) {
			authStore.refreshAuth();
		}

		// Ensure app store is initialized by accessing it
		// This forces the constructor to run if it hasn't already
		console.log('Layout onMount - current theme:', $theme);
		appStore.setTheme($theme); // This ensures the theme system is initialized
	});

	// Update current route for navigation state
	$effect(() => {
		currentRoute.set($page.route.id || '');
	});

	// Hide header on auth pages
	const showHeader = $derived(!$page.route.id?.startsWith('/auth'));
</script>

<svelte:head>
	<title>MyRecipeBox - Your Personal Recipe Collection</title>
	<meta
		name="description"
		content="Collect, organize, and access your favorite recipes with AI-powered extraction and offline support."
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if showHeader}
		<Header />
	{/if}

	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Offline Status Component -->
	<OfflineStatus />
</div>
