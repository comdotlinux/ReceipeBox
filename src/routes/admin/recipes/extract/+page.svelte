<script lang="ts">
	import { recipeService } from '$lib/services';
	import type { RecipeExtractionResponse } from '$lib/types';
	import RecipeForm from '$lib/components/recipe/RecipeForm.svelte';

	let extractionMode: 'url' | 'image' | 'manual' = $state('manual');
	let urlInput = $state('');
	let imageFile = $state<File | null>(null);
	let imagePreview = $state<string | null>(null);
	let isExtracting = $state(false);
	let extractionError = $state<string | null>(null);
	let extractedRecipe = $state<RecipeExtractionResponse | null>(null);

	async function handleUrlExtraction() {
		if (!urlInput.trim()) {
			extractionError = 'Please enter a URL';
			return;
		}

		isExtracting = true;
		extractionError = null;

		try {
			const result = await recipeService.extractRecipeFromUrl(urlInput);
			extractedRecipe = result;
		} catch (error) {
			extractionError = error instanceof Error ? error.message : 'Failed to extract recipe';
		} finally {
			isExtracting = false;
		}
	}

	async function handleImageExtraction() {
		if (!imageFile) {
			extractionError = 'Please select an image';
			return;
		}

		isExtracting = true;
		extractionError = null;

		try {
			const result = await recipeService.extractRecipeFromImage(imageFile);
			extractedRecipe = result;
		} catch (error) {
			extractionError = error instanceof Error ? error.message : 'Failed to extract recipe';
		} finally {
			isExtracting = false;
		}
	}

	function handleImageChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				extractionError = 'Please select an image file';
				return;
			}

			// Validate file size (10MB max)
			if (file.size > 10 * 1024 * 1024) {
				extractionError = 'Image must be smaller than 10MB';
				return;
			}

			imageFile = file;
			extractionError = null;

			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function resetExtraction() {
		extractedRecipe = null;
		urlInput = '';
		imageFile = null;
		imagePreview = null;
		extractionError = null;
	}

	function handleModeChange(mode: 'url' | 'image' | 'manual') {
		extractionMode = mode;
		resetExtraction();
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">Create New Recipe</h1>
		<p class="mt-2 text-gray-600">Add a new recipe to your collection</p>
	</div>

	{#if !extractedRecipe}
		<!-- Extraction Mode Selection -->
		<div class="mb-8 rounded-lg bg-white shadow">
			<div class="p-6">
				<h2 class="mb-4 text-lg font-medium text-gray-900">
					How would you like to add your recipe?
				</h2>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<button
						onclick={() => handleModeChange('manual')}
						class="rounded-lg border-2 p-4 transition-colors {extractionMode === 'manual'
							? 'border-indigo-500 bg-indigo-50'
							: 'border-gray-200 hover:border-gray-300'}"
					>
						<svg
							class="mx-auto mb-2 h-8 w-8 {extractionMode === 'manual'
								? 'text-indigo-600'
								: 'text-gray-400'}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							></path>
						</svg>
						<div
							class="font-medium {extractionMode === 'manual'
								? 'text-indigo-900'
								: 'text-gray-700'}"
						>
							Manual Entry
						</div>
						<div
							class="text-sm {extractionMode === 'manual' ? 'text-indigo-700' : 'text-gray-500'}"
						>
							Type your recipe from scratch
						</div>
					</button>

					<button
						onclick={() => handleModeChange('url')}
						class="rounded-lg border-2 p-4 transition-colors {extractionMode === 'url'
							? 'border-indigo-500 bg-indigo-50'
							: 'border-gray-200 hover:border-gray-300'}"
					>
						<svg
							class="mx-auto mb-2 h-8 w-8 {extractionMode === 'url'
								? 'text-indigo-600'
								: 'text-gray-400'}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							></path>
						</svg>
						<div
							class="font-medium {extractionMode === 'url' ? 'text-indigo-900' : 'text-gray-700'}"
						>
							Import from URL
						</div>
						<div class="text-sm {extractionMode === 'url' ? 'text-indigo-700' : 'text-gray-500'}">
							Extract from a recipe website
						</div>
					</button>

					<button
						onclick={() => handleModeChange('image')}
						class="rounded-lg border-2 p-4 transition-colors {extractionMode === 'image'
							? 'border-indigo-500 bg-indigo-50'
							: 'border-gray-200 hover:border-gray-300'}"
					>
						<svg
							class="mx-auto mb-2 h-8 w-8 {extractionMode === 'image'
								? 'text-indigo-600'
								: 'text-gray-400'}"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							></path>
						</svg>
						<div
							class="font-medium {extractionMode === 'image' ? 'text-indigo-900' : 'text-gray-700'}"
						>
							Scan from Image
						</div>
						<div class="text-sm {extractionMode === 'image' ? 'text-indigo-700' : 'text-gray-500'}">
							Extract from a photo or scan
						</div>
					</button>
				</div>
			</div>
		</div>

		<!-- Extraction Input -->
		{#if extractionMode === 'url'}
			<div class="mb-8 rounded-lg bg-white p-6 shadow">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Import Recipe from URL</h3>

				<div class="space-y-4">
					<div>
						<label for="url" class="mb-2 block text-sm font-medium text-gray-700">
							Recipe URL
						</label>
						<div class="flex gap-4">
							<input
								type="url"
								id="url"
								bind:value={urlInput}
								placeholder="https://example.com/recipe"
								class="block w-full flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
								disabled={isExtracting}
							/>
							<button
								onclick={handleUrlExtraction}
								disabled={isExtracting || !urlInput.trim()}
								class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isExtracting ? 'Extracting...' : 'Extract Recipe'}
							</button>
						</div>
					</div>

					{#if extractionError}
						<div class="rounded-md bg-red-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm text-red-800">{extractionError}</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{:else if extractionMode === 'image'}
			<div class="mb-8 rounded-lg bg-white p-6 shadow">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Scan Recipe from Image</h3>

				<div class="space-y-4">
					<div>
						<label for="image" class="mb-2 block text-sm font-medium text-gray-700">
							Recipe Image
						</label>
						<div class="flex w-full items-center justify-center">
							<label
								for="image-upload"
								class="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
							>
								{#if imagePreview}
									<img
										src={imagePreview}
										alt="Recipe preview"
										class="max-h-full max-w-full object-contain"
									/>
								{:else}
									<div class="flex flex-col items-center justify-center pt-5 pb-6">
										<svg
											class="mb-3 h-10 w-10 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
											></path>
										</svg>
										<p class="mb-2 text-sm text-gray-500">
											<span class="font-semibold">Click to upload</span> or drag and drop
										</p>
										<p class="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
									</div>
								{/if}
								<input
									id="image-upload"
									type="file"
									accept="image/*"
									class="hidden"
									onchange={handleImageChange}
									disabled={isExtracting}
								/>
							</label>
						</div>
					</div>

					{#if imageFile}
						<button
							onclick={handleImageExtraction}
							disabled={isExtracting}
							class="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isExtracting ? 'Extracting...' : 'Extract Recipe'}
						</button>
					{/if}

					{#if extractionError}
						<div class="rounded-md bg-red-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm text-red-800">{extractionError}</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{:else}
			<!-- Manual Entry -->
			<RecipeForm mode="create" />
		{/if}
	{:else}
		<!-- Extracted Recipe Review -->
		<div class="mb-8 rounded-lg bg-white p-6 shadow">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-lg font-medium text-gray-900">Review Extracted Recipe</h3>
				<div class="flex items-center gap-4">
					<span class="text-sm text-gray-500">
						Confidence: {Math.round((extractedRecipe.confidence || 0.95) * 100)}%
					</span>
					<button onclick={resetExtraction} class="text-sm text-gray-600 hover:text-gray-900">
						Start Over
					</button>
				</div>
			</div>

			<div class="mb-6 text-sm text-gray-600">
				Review and edit the extracted recipe information before saving.
			</div>

			<!-- Convert extracted recipe to format expected by RecipeForm -->
			<RecipeForm
				mode="create"
				recipe={{
					id: '',
					title: extractedRecipe.title,
					description: extractedRecipe.description || '',
					ingredients: extractedRecipe.ingredients,
					instructions: extractedRecipe.instructions,
					tags: extractedRecipe.tags,
					metadata: extractedRecipe.metadata,
					source: extractedRecipe.source,
					created_by: '',
					last_modified_by: '',
					is_published: true,
					cache_key: '',
					created: '',
					updated: ''
				}}
			/>
		</div>
	{/if}
</div>
