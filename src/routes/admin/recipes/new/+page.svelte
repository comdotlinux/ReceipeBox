<script lang="ts">
	import { isAuthenticated, isAdmin } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		if (!$isAuthenticated || !$isAdmin) {
			goto('/auth/login');
		} else {
			// Redirect to the new extraction page
			goto('/admin/recipes/extract');
		}
	});
</script>

<svelte:head>
	<title>Create New Recipe - MyRecipeBox</title>
</svelte:head>

<!-- Redirect to extract page -->
