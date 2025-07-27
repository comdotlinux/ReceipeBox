<script lang="ts">
	import type { Recipe } from '$lib/types';
	import { isAdmin, pb } from '$lib/stores';

	const { recipe, compact = false }: { recipe: Recipe; compact?: boolean } = $props();

	const imageUrl = recipe.image ? pb.getFileUrl(recipe, recipe.image) : null;
	const prepTime = recipe.metadata?.prepTime;
	const cookTime = recipe.metadata?.cookTime;
	const difficulty = recipe.metadata?.difficulty;
	const servings = recipe.metadata?.servings;
</script>

<div
	class="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-200 hover:shadow-lg dark:bg-gray-800"
>
	<a href="/recipes/{recipe.id}" class="block">
		<!-- Recipe Image -->
		<div class="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
			{#if imageUrl}
				<img src={imageUrl} alt={recipe.title} class="h-48 w-full object-cover" loading="lazy" />
			{:else}
				<div class="flex h-48 w-full items-center justify-center">
					<svg
						class="h-16 w-16 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
			{/if}
		</div>

		<!-- Recipe Content -->
		<div class="p-4">
			<!-- Title and Draft Indicator -->
			<div class="mb-2 flex items-start justify-between">
				<h3 class="line-clamp-2 flex-1 text-lg font-semibold text-gray-900 dark:text-white">
					{recipe.title}
				</h3>
				{#if !recipe.is_published && $isAdmin}
					<span
						class="ml-2 inline-flex items-center rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
					>
						Draft
					</span>
				{/if}
			</div>

			<!-- Description -->
			{#if recipe.description && !compact}
				<p class="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
					{recipe.description}
				</p>
			{/if}

			<!-- Recipe Meta -->
			<div class="mb-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
				<div class="flex items-center space-x-4">
					{#if prepTime}
						<div class="flex items-center">
							<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							{prepTime}
						</div>
					{/if}

					{#if difficulty}
						<div class="flex items-center">
							<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
							{difficulty}
						</div>
					{/if}

					{#if servings}
						<div class="flex items-center">
							<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
							{servings}
						</div>
					{/if}
				</div>
			</div>

			<!-- Tags -->
			{#if recipe.tags && recipe.tags.length > 0}
				<div class="mb-3 flex flex-wrap gap-1">
					{#each recipe.tags.slice(0, compact ? 2 : 4) as tag}
						<span
							class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
						>
							{tag}
						</span>
					{/each}
					{#if recipe.tags.length > (compact ? 2 : 4)}
						<span
							class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400"
						>
							+{recipe.tags.length - (compact ? 2 : 4)}
						</span>
					{/if}
				</div>
			{/if}
		</div>
	</a>

	<!-- Admin Actions -->
	{#if $isAdmin}
		<div class="px-4 pt-0 pb-4">
			<div
				class="flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-700"
			>
				<div class="flex items-center space-x-2">
					<a
						href="/admin/recipes/{recipe.id}/edit"
						class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
						Edit
					</a>

					<button
						type="button"
						class="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900"
					>
						<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						Delete
					</button>
				</div>

				<div class="text-xs text-gray-500 dark:text-gray-400">
					{recipe.source?.type === 'url' ? '🔗' : recipe.source?.type === 'image' ? '📷' : '✍️'}
				</div>
			</div>
		</div>
	{/if}
</div>
