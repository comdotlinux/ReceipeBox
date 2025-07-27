<script lang="ts">
	import { isAuthenticated, isAdmin } from '$lib/stores';
	import { recipesStore, recipes, recipesLoading, searchResults } from '$lib/stores/recipes';
	import type { RecipeSearchParams } from '$lib/types';
	import AdvancedSearch from '$lib/components/search/AdvancedSearch.svelte';
	import RecipeCard from '$lib/components/recipe/RecipeCard.svelte';
	import { onMount } from 'svelte';

	let searchParams = $state<RecipeSearchParams>({
		query: '',
		tags: [],
		page: 1,
		limit: 20
	});

	let currentPage = $state(1);

	onMount(() => {
		// Load initial recipes if authenticated
		if ($isAuthenticated) {
			handleSearch(searchParams);
		}
	});

	function handleSearch(params: RecipeSearchParams) {
		searchParams = { ...params };
		currentPage = 1;
		recipesStore.searchRecipes(params);
	}

	function handleClear() {
		searchParams = {
			query: '',
			tags: [],
			page: 1,
			limit: 20
		};
		currentPage = 1;
		recipesStore.loadRecipes({ page: 1, limit: 20 });
	}

	async function loadMore() {
		const nextPage = currentPage + 1;
		const newParams = { ...searchParams, page: nextPage };
		
		await recipesStore.searchRecipes(newParams);
		currentPage = nextPage;
	}

	function getTotalResultsText() {
		if (!$searchResults) return '';
		const { totalItems, page, perPage } = $searchResults;
		const start = (page - 1) * perPage + 1;
		const end = Math.min(page * perPage, totalItems);
		return `Showing ${start}-${end} of ${totalItems} recipes`;
	}

	function hasActiveFilters() {
		return (
			searchParams.query?.trim() ||
			(searchParams.tags && searchParams.tags.length > 0) ||
			searchParams.cuisine ||
			searchParams.difficulty ||
			(searchParams.dietary && searchParams.dietary.length > 0)
		);
	}
</script>

<svelte:head>
	<title>Search Recipes - MyRecipeBox</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	{#if $isAuthenticated}
		<!-- Page Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Search Recipes</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">
				Find the perfect recipe using our advanced search and filtering options.
			</p>
		</div>

		<!-- Search Component -->
		<div class="mb-8">
			<AdvancedSearch 
				{searchParams}
				onSearch={handleSearch}
				onClear={handleClear}
			/>
		</div>

		<!-- Results Header -->
		{#if $searchResults && !$recipesLoading}
			<div class="mb-6 flex items-center justify-between">
				<div>
					<p class="text-sm text-gray-600 dark:text-gray-400" data-testid="search-results-count">
						{getTotalResultsText()}
					</p>
					{#if hasActiveFilters()}
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-500">
							Results filtered by your search criteria
						</p>
					{/if}
				</div>
				
				{#if $isAdmin}
					<div class="flex gap-2">
						<a
							href="/admin/recipes/new"
							class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
						>
							<svg class="mr-2 -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Add Recipe
						</a>
						<a
							href="/admin/recipes/extract"
							class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
						>
							<svg class="mr-2 -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
							</svg>
							Extract from URL
						</a>
					</div>
				{/if}
			</div>
		{/if}

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
		{:else if $recipes.length === 0 && !$recipesLoading}
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
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">No Recipes Found</h3>
					<p class="mb-6 text-gray-600 dark:text-gray-400">
						{#if hasActiveFilters()}
							No recipes match your current search criteria. Try adjusting your filters or search terms.
						{:else}
							Start by searching for recipes or browse the collection.
						{/if}
					</p>
					{#if hasActiveFilters()}
						<button
							onclick={handleClear}
							class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
							data-testid="clear-search-filters"
						>
							Clear Filters
						</button>
					{:else}
						<a
							href="/"
							class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
						>
							Browse All Recipes
						</a>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Recipe Results -->
			<div class="space-y-6">
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each $recipes as recipe (recipe.id)}
						<RecipeCard {recipe} />
					{/each}
				</div>

				<!-- Load More Button -->
				{#if $searchResults && $recipes.length < $searchResults.totalItems}
					<div class="text-center">
						<button
							onclick={loadMore}
							disabled={$recipesLoading}
							class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							data-testid="load-more-search-results"
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
			</div>
		{/if}
	{:else}
		<!-- Unauthenticated State -->
		<div class="py-16 text-center">
			<div class="mx-auto max-w-md">
				<svg
					class="mx-auto mb-6 h-16 w-16 text-indigo-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<h1 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Search Recipes</h1>
				<p class="mb-8 text-lg text-gray-600 dark:text-gray-400">
					Sign in to access our advanced recipe search and filtering features.
				</p>
				<div class="space-y-4">
					<a
						href="/auth/login"
						class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					>
						Sign In to Search
					</a>
					<a
						href="/"
						class="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Back to Home
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>