<script lang="ts">
	import type { RecipeSearchParams } from '$lib/types';

	const {
		searchParams,
		onSearch,
		onClear
	}: {
		searchParams: RecipeSearchParams;
		onSearch: (params: RecipeSearchParams) => void;
		onClear: () => void;
	} = $props();

	let query = $state(searchParams.query || '');
	let selectedTags = $state(searchParams.tags || []);
	let selectedCuisine = $state(searchParams.cuisine || '');
	let selectedDifficulty = $state(searchParams.difficulty || '');
	let selectedDietary = $state(searchParams.dietary || []);
	let showAdvanced = $state(false);

	// Common filter options
	const cuisines = [
		'Italian',
		'Mexican',
		'Asian',
		'American',
		'French',
		'Mediterranean',
		'Indian',
		'Thai',
		'Japanese',
		'Greek',
		'Chinese',
		'Spanish'
	];

	const difficulties = ['Easy', 'Medium', 'Hard'];

	const dietaryOptions = [
		'Vegetarian',
		'Vegan',
		'Gluten-Free',
		'Dairy-Free',
		'Keto',
		'Paleo',
		'Low-Carb',
		'High-Protein'
	];

	// Common tags for quick selection
	const commonTags = [
		'Quick',
		'Healthy',
		'Comfort Food',
		'Dessert',
		'Breakfast',
		'Lunch',
		'Dinner',
		'Snack',
		'Appetizer',
		'Main Course',
		'Side Dish',
		'Soup',
		'Salad',
		'Pasta',
		'Chicken',
		'Beef',
		'Seafood',
		'Baking'
	];

	function handleSearch() {
		const params: RecipeSearchParams = {
			query: query.trim() || undefined,
			tags: selectedTags.length > 0 ? selectedTags : undefined,
			cuisine: selectedCuisine || undefined,
			difficulty: selectedDifficulty || undefined,
			dietary: selectedDietary.length > 0 ? selectedDietary : undefined,
			page: 1,
			limit: 20
		};
		onSearch(params);
	}

	function handleClear() {
		query = '';
		selectedTags = [];
		selectedCuisine = '';
		selectedDifficulty = '';
		selectedDietary = [];
		onClear();
	}

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	function toggleDietary(option: string) {
		if (selectedDietary.includes(option)) {
			selectedDietary = selectedDietary.filter((d) => d !== option);
		} else {
			selectedDietary = [...selectedDietary, option];
		}
	}

	function hasActiveFilters() {
		return (
			query.trim() ||
			selectedTags.length > 0 ||
			selectedCuisine ||
			selectedDifficulty ||
			selectedDietary.length > 0
		);
	}

	// Auto-search on input changes
	$effect(() => {
		if (query || selectedTags.length > 0 || selectedCuisine || selectedDifficulty || selectedDietary.length > 0) {
			handleSearch();
		}
	});
</script>

<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-lg font-medium text-gray-900 dark:text-white">Search Recipes</h3>
		<button
			onclick={() => (showAdvanced = !showAdvanced)}
			class="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
		>
			{showAdvanced ? 'Hide Filters' : 'Show Filters'}
		</button>
	</div>

	<!-- Main Search Bar -->
	<div class="mb-6">
		<div class="relative">
			<input
				type="text"
				bind:value={query}
				placeholder="Search recipes by title or description..."
				class="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-10 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
				data-testid="advanced-search-input"
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
	</div>

	<!-- Advanced Filters -->
	{#if showAdvanced}
		<div class="space-y-6">
			<!-- Quick Tag Selection -->
			<div>
				<label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
					Quick Tags
				</label>
				<div class="flex flex-wrap gap-2">
					{#each commonTags as tag}
						<button
							onclick={() => toggleTag(tag)}
							class="rounded-full px-3 py-1 text-sm transition-colors {selectedTags.includes(tag)
								? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
								: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
							data-testid="tag-filter-{tag.toLowerCase().replace(/\s+/g, '-')}"
						>
							{tag}
						</button>
					{/each}
				</div>
			</div>

			<!-- Cuisine Filter -->
			<div>
				<label for="cuisine" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
					Cuisine
				</label>
				<select
					id="cuisine"
					bind:value={selectedCuisine}
					class="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					data-testid="cuisine-filter"
				>
					<option value="">All Cuisines</option>
					{#each cuisines as cuisine}
						<option value={cuisine}>{cuisine}</option>
					{/each}
				</select>
			</div>

			<!-- Difficulty Filter -->
			<div>
				<label for="difficulty" class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
					Difficulty
				</label>
				<select
					id="difficulty"
					bind:value={selectedDifficulty}
					class="w-full rounded-lg border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
					data-testid="difficulty-filter"
				>
					<option value="">All Difficulties</option>
					{#each difficulties as difficulty}
						<option value={difficulty}>{difficulty}</option>
					{/each}
				</select>
			</div>

			<!-- Dietary Restrictions -->
			<div>
				<label class="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
					Dietary Preferences
				</label>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{#each dietaryOptions as option}
						<label class="flex items-center">
							<input
								type="checkbox"
								checked={selectedDietary.includes(option)}
								onchange={() => toggleDietary(option)}
								class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
								data-testid="dietary-filter-{option.toLowerCase().replace(/\s+/g, '-')}"
							/>
							<span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
						</label>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<!-- Action Buttons -->
	{#if hasActiveFilters()}
		<div class="mt-6 flex gap-3">
			<button
				onclick={handleSearch}
				class="flex-1 rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
				data-testid="apply-filters-button"
			>
				Apply Filters
			</button>
			<button
				onclick={handleClear}
				class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				data-testid="clear-filters-button"
			>
				Clear All
			</button>
		</div>
	{/if}

	<!-- Active Filters Display -->
	{#if hasActiveFilters() && showAdvanced}
		<div class="mt-4 border-t pt-4">
			<p class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</p>
			<div class="flex flex-wrap gap-2">
				{#if query.trim()}
					<span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
						Search: "{query}"
					</span>
				{/if}
				{#each selectedTags as tag}
					<span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
						Tag: {tag}
					</span>
				{/each}
				{#if selectedCuisine}
					<span class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
						Cuisine: {selectedCuisine}
					</span>
				{/if}
				{#if selectedDifficulty}
					<span class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
						Difficulty: {selectedDifficulty}
					</span>
				{/if}
				{#each selectedDietary as dietary}
					<span class="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800 dark:bg-pink-900 dark:text-pink-200">
						Dietary: {dietary}
					</span>
				{/each}
			</div>
		</div>
	{/if}
</div>