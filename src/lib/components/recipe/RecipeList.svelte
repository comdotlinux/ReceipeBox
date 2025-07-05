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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each Array(6) as _}
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
          <div class="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
          <div class="p-4 space-y-3">
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div class="flex space-x-2">
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if $recipesError}
    <!-- Error State -->
    <div class="text-center py-12">
      <div class="max-w-md mx-auto">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error Loading Recipes
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          {$recipesError}
        </p>
        <button
          onclick={() => loadRecipes()}
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Try Again
        </button>
      </div>
    </div>
  {:else if $recipes.length === 0}
    <!-- Empty State -->
    <div class="text-center py-12">
      <div class="max-w-md mx-auto">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Recipes Found
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
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
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            data-testid="clear-filters-button"
          >
            Clear Filters
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Recipe Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="load-more-button"
        >
          {#if $recipesLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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