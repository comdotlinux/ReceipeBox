<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user, isAuthenticated, authStore } from '$lib/stores';

	export let requireAuth = false;
	export let requireAdmin = false;
	export let redirectTo = '/auth/login';

	let isLoading = true;
	let hasAccess = false;

	onMount(async () => {
		// Try to refresh authentication
		await authStore.refreshAuth();

		// Check access based on requirements
		const currentUser = $user;

		if (requireAuth && !$isAuthenticated) {
			// User needs to be authenticated but isn't
			hasAccess = false;
			goto(redirectTo);
			return;
		}

		if (requireAdmin && (!currentUser || currentUser.role !== 'admin')) {
			// User needs admin role but doesn't have it
			hasAccess = false;
			goto('/'); // Redirect to home instead of login
			return;
		}

		hasAccess = true;
		isLoading = false;
	});

	// Watch for auth changes
	$effect(() => {
		if (!isLoading) {
			const currentUser = $user;

			if (requireAuth && !$isAuthenticated) {
				hasAccess = false;
				goto(redirectTo);
			} else if (requireAdmin && (!currentUser || currentUser.role !== 'admin')) {
				hasAccess = false;
				goto('/');
			} else {
				hasAccess = true;
			}
		}
	});
</script>

{#if isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
	</div>
{:else if hasAccess}
	<slot />
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
			<p class="mb-6 text-gray-600 dark:text-gray-400">
				{#if requireAdmin}
					You need administrator privileges to access this page.
				{:else}
					You need to be signed in to access this page.
				{/if}
			</p>
			<a
				href="/"
				class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm
               font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500
               focus:ring-offset-2 focus:outline-none"
			>
				Go Home
			</a>
		</div>
	</div>
{/if}
