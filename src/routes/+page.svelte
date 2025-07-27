<script lang="ts">
	import { onMount } from 'svelte';
	import { isAuthenticated, isAdmin, user } from '$lib/stores';
	import { tagsStore, popularTags } from '$lib/stores/tags';
	import RecipeList from '$lib/components/recipe/RecipeList.svelte';

	let searchQuery = $state('');
	let selectedTags = $state<string[]>([]);

	onMount(() => {
		if ($isAuthenticated) {
			tagsStore.loadPopularTags(10);
		}
	});

	function toggleTag(tagName: string) {
		if (selectedTags.includes(tagName)) {
			selectedTags = selectedTags.filter(t => t !== tagName);
		} else {
			selectedTags = [...selectedTags, tagName];
		}
	}

	function getContrastColor(hexColor: string): string {
		if (!hexColor) return '#ffffff';
		
		// Remove # if present
		const hex = hexColor.replace('#', '');
		
		// Convert to RGB
		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);
		
		// Calculate brightness
		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		
		// Return black or white based on brightness
		return brightness > 155 ? '#000000' : '#ffffff';
	}
</script>

<svelte:head>
	<title>Home - MyRecipeBox</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
			<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
				<a
					href="/admin/recipes/new"
					class="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-gray-800"
				>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg
								class="h-8 w-8 text-blue-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
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
					class="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-gray-800"
				>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg
								class="h-8 w-8 text-green-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
								/>
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
					class="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-gray-800"
				>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg
								class="h-8 w-8 text-purple-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
								/>
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
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recipe Collection</h2>
				<div class="flex items-center space-x-4">
					<!-- Search bar -->
					<div class="relative">
						<input
							type="text"
							placeholder="Search recipes..."
							bind:value={searchQuery}
							data-testid="search-recipes-input"
							class="w-64 rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-blue-500
                     dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
						/>
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<svg
								class="h-5 w-5 text-gray-400"
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
						</div>
					</div>
					
					<!-- Advanced Search Link -->
					<a
						href="/search"
						class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						<svg class="mr-2 -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
						</svg>
						Advanced Search
					</a>
				</div>
			</div>

			<!-- Popular Tags Filter -->
			{#if $popularTags.length > 0}
				<div class="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
					<div class="mb-3 flex items-center justify-between">
						<h3 class="text-sm font-medium text-gray-900 dark:text-white">Quick Filter by Tags</h3>
						{#if selectedTags.length > 0}
							<button
								onclick={() => selectedTags = []}
								class="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
							>
								Clear ({selectedTags.length})
							</button>
						{/if}
					</div>
					<div class="flex flex-wrap gap-2">
						{#each $popularTags.slice(0, 8) as tag}
							<button
								onclick={() => toggleTag(tag.name)}
								class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all {selectedTags.includes(tag.name)
									? 'ring-2 ring-indigo-500 ring-offset-2'
									: 'hover:opacity-80'}"
								style="background-color: {tag.color || '#6b7280'}; color: {getContrastColor(tag.color || '#6b7280')}"
								data-testid="quick-tag-{tag.name.toLowerCase().replace(/\s+/g, '-')}"
							>
								{tag.name}
								{#if selectedTags.includes(tag.name)}
									<svg class="ml-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<RecipeList
				{searchQuery}
				{selectedTags}
				onClearFilters={() => {
					searchQuery = '';
					selectedTags = [];
				}}
			/>
		</div>
	{:else}
		<!-- Welcome screen for unauthenticated users -->
		<div class="py-16 text-center">
			<div class="mx-auto max-w-md">
				<svg
					class="mx-auto mb-6 h-16 w-16 text-blue-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
				<h1
					class="welcome-title mb-4 text-4xl font-bold text-gray-900 dark:text-white"
					data-testid="welcome-title"
				>
					Welcome to MyRecipeBox
				</h1>
				<p class="mb-8 text-lg text-gray-600 dark:text-gray-400">
					Your personal recipe collection with AI-powered extraction and offline support.
				</p>
				<div class="space-y-4">
					<a
						href="/auth/register"
						data-testid="get-started-button"
						class="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4
                   py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						Get Started
					</a>
					<a
						href="/auth/login"
						data-testid="sign-in-button"
						class="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4
                   py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50
                   focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none
                   dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Sign In
					</a>
				</div>
			</div>
		</div>

		<!-- Features section -->
		<div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3" data-testid="features-section">
			<div class="feature-card text-center" data-testid="ai-extraction-feature">
				<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
					<svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 dark:text-white">AI-Powered Extraction</h3>
				<p class="text-gray-600 dark:text-gray-400">
					Extract recipes from URLs and images using advanced AI technology.
				</p>
			</div>

			<div class="feature-card text-center" data-testid="offline-access-feature">
				<div
					class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100"
				>
					<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
						/>
					</svg>
				</div>
				<h3 class="text-lg font-medium text-gray-900 dark:text-white">Offline Access</h3>
				<p class="text-gray-600 dark:text-gray-400">
					Access your recipes anywhere, even without an internet connection.
				</p>
			</div>

			<div class="feature-card text-center" data-testid="smart-search-feature">
				<div
					class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100"
				>
					<svg
						class="h-6 w-6 text-purple-600"
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
				</div>
				<h3 class="text-lg font-medium text-gray-900 dark:text-white">Smart Search</h3>
				<p class="text-gray-600 dark:text-gray-400">
					Find recipes quickly with advanced search and tagging system.
				</p>
			</div>
		</div>
	{/if}
</div>
