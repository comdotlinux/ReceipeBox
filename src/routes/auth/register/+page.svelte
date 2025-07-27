<script lang="ts">
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
	import { isAuthenticated } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect if already authenticated
		if ($isAuthenticated) {
			goto('/');
		}
	});

	// Watch for auth changes
	$effect(() => {
		if ($isAuthenticated) {
			goto('/');
		}
	});
</script>

<svelte:head>
	<title>Sign Up - MyRecipeBox</title>
	<meta
		name="description"
		content="Create a new MyRecipeBox account to start collecting and organizing your favorite recipes."
	/>
</svelte:head>

<div
	class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900"
>
	<div class="w-full max-w-md">
		<RegisterForm />
	</div>
</div>
