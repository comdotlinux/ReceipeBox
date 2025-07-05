<script lang="ts">
  import { isAuthenticated, isAdmin, user } from '$lib/stores';
  import RecipeList from '$lib/components/recipe/RecipeList.svelte';
  
  let searchQuery = $state('');
</script>

<svelte:head>
  <title>Home - MyRecipeBox</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if $isAuthenticated}
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        Welcome back, {$user?.name}!
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        {#if $isAdmin}
          You have administrator privileges. You can create and manage recipes.
        {:else}
          Browse and search through the recipe collection.
        {/if}
      </p>
    </div>

    <!-- Admin quick actions -->
    {#if $isAdmin}
      <div class="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/admin/recipes/new"
          class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Add Recipe</h3>
              <p class="text-sm text-gray-500">Create a new recipe</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/recipes/extract"
          class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Extract from URL</h3>
              <p class="text-sm text-gray-500">Import from web</p>
            </div>
          </div>
        </a>

        <a
          href="/admin/tags"
          class="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Manage Tags</h3>
              <p class="text-sm text-gray-500">Organize categories</p>
            </div>
          </div>
        </a>
      </div>
    {/if}

    <!-- Recipe List -->
    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Recipe Collection
        </h2>
        <div class="flex items-center space-x-4">
          <!-- Search bar -->
          <div class="relative">
            <input
              type="text"
              placeholder="Search recipes..."
              bind:value={searchQuery}
              data-testid="search-recipes-input"
              class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <RecipeList {searchQuery} onClearFilters={() => { searchQuery = ''; }} />
    </div>
  {:else}
    <!-- Welcome screen for unauthenticated users -->
    <div class="text-center py-16">
      <div class="mx-auto max-w-md">
        <svg class="mx-auto h-16 w-16 text-blue-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4 welcome-title" data-testid="welcome-title">
          Welcome to MyRecipeBox
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your personal recipe collection with AI-powered extraction and offline support.
        </p>
        <div class="space-y-4">
          <a
            href="/auth/register"
            data-testid="get-started-button"
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md
                   shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Get Started
          </a>
          <a
            href="/auth/login"
            data-testid="sign-in-button"
            class="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md
                   shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                   dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>

    <!-- Features section -->
    <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="features-section">
      <div class="text-center feature-card" data-testid="ai-extraction-feature">
        <div class="mx-auto h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">AI-Powered Extraction</h3>
        <p class="text-gray-600 dark:text-gray-400">
          Extract recipes from URLs and images using advanced AI technology.
        </p>
      </div>

      <div class="text-center feature-card" data-testid="offline-access-feature">
        <div class="mx-auto h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Offline Access</h3>
        <p class="text-gray-600 dark:text-gray-400">
          Access your recipes anywhere, even without an internet connection.
        </p>
      </div>

      <div class="text-center feature-card" data-testid="smart-search-feature">
        <div class="mx-auto h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
          <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Smart Search</h3>
        <p class="text-gray-600 dark:text-gray-400">
          Find recipes quickly with advanced search and tagging system.
        </p>
      </div>
    </div>
  {/if}
</div>
