<script lang="ts">
	import { page } from '$app/stores';
	import RecipeForm from '$lib/components/recipe/RecipeForm.svelte';
	import { isAuthenticated, isAdmin, recipesStore, currentRecipe } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let recipe = $state(null);
	let loading = $state(true);
	let error = $state('');

	onMount(async () => {
		if (!$isAuthenticated || !$isAdmin) {
			goto('/auth/login');
			return;
		}

		const recipeId = $page.params.id;
		if (!recipeId) {
			error = 'Recipe ID is required';
			loading = false;
			return;
		}

		try {
			await recipesStore.loadRecipe(recipeId);
			recipe = $currentRecipe;
			if (!recipe) {
				error = 'Recipe not found';
			}
		} catch (err) {
			console.error('Failed to load recipe:', err);
			error = 'Failed to load recipe';
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>{recipe ? `Edit ${recipe.title}` : 'Edit Recipe'} - MyRecipeBox</title>
</svelte:head>

{#if $isAuthenticated && $isAdmin}
	<div class="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
		<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
			<div class="mb-8">
				<nav class="flex" aria-label="Breadcrumb">
					<ol class="flex items-center space-x-4">
						<li>
							<div>
								<a href="/" class="text-gray-400 hover:text-gray-500">
									<svg class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path
											d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
										/>
									</svg>
									<span class="sr-only">Home</span>
								</a>
							</div>
						</li>
						<li>
							<div class="flex items-center">
								<svg
									class="h-5 w-5 flex-shrink-0 text-gray-300"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
								<a href="/admin" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
									>Admin</a
								>
							</div>
						</li>
						<li>
							<div class="flex items-center">
								<svg
									class="h-5 w-5 flex-shrink-0 text-gray-300"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
								<a
									href="/recipes/{$page.params.id}"
									class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
								>
									{recipe ? recipe.title : 'Recipe'}
								</a>
							</div>
						</li>
						<li>
							<div class="flex items-center">
								<svg
									class="h-5 w-5 flex-shrink-0 text-gray-300"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
								<span class="ml-4 text-sm font-medium text-gray-500">Edit</span>
							</div>
						</li>
					</ol>
				</nav>
			</div>

			{#if loading}
				<div class="flex items-center justify-center py-12">
					<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
				</div>
			{:else if error}
				<div class="rounded-md border border-red-200 bg-red-50 p-4">
					<div class="flex">
						<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">Error</h3>
							<p class="mt-1 text-sm text-red-700">{error}</p>
						</div>
					</div>
					<div class="mt-4">
						<a
							href="/"
							class="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200"
						>
							Back to Home
						</a>
					</div>
				</div>
			{:else if recipe}
				<RecipeForm {recipe} mode="edit" />
			{/if}
		</div>
	</div>
{:else}
	<div class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
		<div class="text-center" data-testid="access-denied">
			<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
			<p class="mt-2 text-gray-600 dark:text-gray-400">
				You need admin privileges to edit recipes.
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
