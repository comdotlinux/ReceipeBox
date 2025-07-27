<script lang="ts">
	import type { Recipe } from '$lib/types';
	import RecipeCard from './RecipeCard.svelte';
	import { recipesStore, recipes, recipesLoading, recipesError } from '$lib/stores';
	import { onMount } from 'svelte';

	const {
		searchQuery = '',
		selectedTags = [],
		showLoadMore = true,
		limit = 20,
		onClearFilters
	}: {
		searchQuery?: string;
		selectedTags?: string[];
		showLoadMore?: boolean;
		limit?: number;
		onClearFilters?: () => void;
	} = $props();

	let currentPage = $state(1);

	onMount(() => {
		loadRecipes();
	});

	$effect(() => {
		// Reload when search params change
		if (searchQuery || selectedTags.length > 0) {
			currentPage = 1;
			loadRecipes();
		}
	});

	async function loadRecipes(page = 1) {
		currentPage = page;
		await recipesStore.searchRecipes({
			query: searchQuery,
			tags: selectedTags,
			page,
			limit
		});
	}

	async function loadMore() {
		await loadRecipes(currentPage + 1);
	}
</script>

<div class="space-y-6">
	<!-- Loading State -->
	{#if $recipesLoading && currentPage === 1}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _}
				<div class="animate-pulse overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
					<div class="h-48 w-full bg-gray-200 dark:bg-gray-700"></div>
					<div class="space-y-3 p-4">
						<div class="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
						<div class="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
						<div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700"></div>
						<div class="flex space-x-2">
							<div class="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
							<div class="h-6 w-12 rounded-full bg-gray-200 dark:bg-gray-700"></div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if $recipesError}
		<!-- Error State -->
		<div class="py-12 text-center">
			<div class="mx-auto max-w-md">
				<svg
					class="mx-auto mb-4 h-12 w-12 text-red-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
					/>
				</svg>
				<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
					Error Loading Recipes
				</h3>
				<p class="mb-4 text-gray-600 dark:text-gray-400">
					{$recipesError}
				</p>
				<button
					onclick={() => loadRecipes()}
					class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
				>
					Try Again
				</button>
			</div>
		</div>
	{:else if $recipes.length === 0}
		<!-- Empty State -->
		<div class="py-12 text-center">
			<div class="mx-auto max-w-md">
				<svg
					class="mx-auto mb-4 h-16 w-16 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
				<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">No Recipes Found</h3>
				<p class="mb-6 text-gray-600 dark:text-gray-400">
					{#if searchQuery || selectedTags.length > 0}
						Try adjusting your search criteria or clearing filters.
					{:else}
						Get started by adding your first recipe.
					{/if}
				</p>
				{#if searchQuery || selectedTags.length > 0}
					<button
						onclick={() => {
							onClearFilters?.();
							currentPage = 1;
							loadRecipes(1);
						}}
						class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						data-testid="clear-filters-button"
					>
						Clear Filters
					</button>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Recipe Grid -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each $recipes as recipe (recipe.id)}
				<RecipeCard {recipe} />
			{/each}
		</div>

		<!-- Load More Button -->
		{#if showLoadMore && $recipes.length > 0}
			<div class="text-center">
				<button
					onclick={loadMore}
					disabled={$recipesLoading}
					class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					data-testid="load-more-button"
				>
					{#if $recipesLoading}
						<svg
							class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Loading...
					{:else}
						Load More Recipes
					{/if}
				</button>
			</div>
		{/if}
	{/if}
</div>
