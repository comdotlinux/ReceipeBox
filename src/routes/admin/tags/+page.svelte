<script lang="ts">
	import { onMount } from 'svelte';
	import { isAdmin } from '$lib/stores';
	import { tagsStore, tags, tagsLoading, tagsError, popularTags } from '$lib/stores/tags';
	import type { Tag, TagCreateData, TagUpdateData } from '$lib/types';
	import { goto } from '$app/navigation';

	// Redirect if not admin
	$effect(() => {
		if (!$isAdmin) {
			goto('/');
		}
	});

	let showCreateForm = $state(false);
	let editingTag = $state<Tag | null>(null);
	let newTagName = $state('');
	let newTagColor = $state('#3b82f6');
	let searchQuery = $state('');
	let currentPage = $state(1);

	onMount(() => {
		loadTags();
		loadPopularTags();
	});

	async function loadTags() {
		await tagsStore.loadTags({
			query: searchQuery || undefined,
			page: currentPage,
			limit: 50
		});
	}

	async function loadPopularTags() {
		await tagsStore.loadPopularTags(20);
	}

	function handleFormSubmit(event: Event) {
		event.preventDefault();
		if (editingTag) {
			updateTag();
		} else {
			createTag();
		}
	}

	async function createTag() {
		if (!newTagName.trim()) return;

		try {
			const tagData: TagCreateData = {
				name: newTagName.trim(),
				color: newTagColor
			};

			await tagsStore.createTag(tagData);
			
			// Reset form
			newTagName = '';
			newTagColor = '#3b82f6';
			showCreateForm = false;
			
			// Reload tags
			await loadTags();
		} catch (error) {
			console.error('Failed to create tag:', error);
		}
	}

	async function updateTag() {
		if (!editingTag || !newTagName.trim()) return;

		try {
			const updateData: TagUpdateData = {
				id: editingTag.id,
				name: newTagName.trim(),
				color: newTagColor
			};

			await tagsStore.updateTag(updateData);
			
			// Reset form
			editingTag = null;
			newTagName = '';
			newTagColor = '#3b82f6';
			
			// Reload tags
			await loadTags();
		} catch (error) {
			console.error('Failed to update tag:', error);
		}
	}

	async function deleteTag(tag: Tag) {
		if (!confirm(`Are you sure you want to delete the tag "${tag.name}"? This action cannot be undone.`)) {
			return;
		}

		try {
			await tagsStore.deleteTag(tag.id);
			await loadTags();
		} catch (error) {
			console.error('Failed to delete tag:', error);
		}
	}

	function startEdit(tag: Tag) {
		editingTag = tag;
		newTagName = tag.name;
		newTagColor = tag.color || '#3b82f6';
		showCreateForm = true;
	}

	function cancelEdit() {
		editingTag = null;
		newTagName = '';
		newTagColor = '#3b82f6';
		showCreateForm = false;
	}

	function handleSearch() {
		currentPage = 1;
		loadTags();
	}

	function getContrastColor(hexColor: string): string {
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

	// Pre-defined color options
	const colorOptions = [
		'#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
		'#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
		'#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280'
	];
</script>

<svelte:head>
	<title>Manage Tags - MyRecipeBox</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Page Header -->
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Manage Tags</h1>
				<p class="mt-2 text-gray-600 dark:text-gray-400">
					Create, edit, and organize recipe tags for better categorization.
				</p>
			</div>
			<button
				onclick={() => {showCreateForm = true; editingTag = null;}}
				class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
				data-testid="create-tag-button"
			>
				<svg class="mr-2 -ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				Create Tag
			</button>
		</div>
	</div>

	<!-- Error Display -->
	{#if $tagsError}
		<div class="mb-6 rounded-md bg-red-50 p-4">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-red-800">{$tagsError}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Create/Edit Form -->
	{#if showCreateForm}
		<div class="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
			<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">
				{editingTag ? 'Edit Tag' : 'Create New Tag'}
			</h3>
			
			<form onsubmit={handleFormSubmit}>
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<label for="tag-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Tag Name
						</label>
						<input
							id="tag-name"
							type="text"
							bind:value={newTagName}
							placeholder="Enter tag name..."
							required
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
							data-testid="tag-name-input"
						/>
					</div>
					
					<div>
						<label for="tag-color" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Tag Color
						</label>
						<div class="mt-1 flex items-center space-x-3">
							<input
								id="tag-color"
								type="color"
								bind:value={newTagColor}
								class="h-10 w-16 rounded border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								data-testid="tag-color-input"
							/>
							<div 
								class="flex h-8 items-center rounded-full px-3 text-sm font-medium"
								style="background-color: {newTagColor}; color: {getContrastColor(newTagColor)}"
							>
								{newTagName || 'Preview'}
							</div>
						</div>
						
						<!-- Color presets -->
						<div class="mt-3 flex flex-wrap gap-2">
							{#each colorOptions as color}
								<button
									type="button"
									onclick={() => newTagColor = color}
									class="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 {newTagColor === color ? 'border-gray-900 dark:border-white' : 'border-gray-300'}"
									style="background-color: {color}"
									title={color}
									aria-label="Select color {color}"
								></button>
							{/each}
						</div>
					</div>
				</div>
				
				<div class="mt-6 flex justify-end space-x-3">
					<button
						type="button"
						onclick={cancelEdit}
						class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!newTagName.trim()}
						class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
						data-testid="save-tag-button"
					>
						{editingTag ? 'Update' : 'Create'} Tag
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Search and Popular Tags -->
	<div class="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Search -->
		<div class="lg:col-span-2">
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Search Tags</h3>
				<div class="flex gap-4">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search by tag name..."
						class="flex-1 rounded-lg border border-gray-300 py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
						data-testid="search-tags-input"
					/>
					<button
						onclick={handleSearch}
						class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
						data-testid="search-tags-button"
					>
						Search
					</button>
				</div>
			</div>
		</div>

		<!-- Popular Tags -->
		<div>
			<div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
				<h3 class="mb-4 text-lg font-medium text-gray-900 dark:text-white">Popular Tags</h3>
				<div class="space-y-2">
					{#each $popularTags.slice(0, 10) as tag}
						<div class="flex items-center justify-between">
							<div 
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
								style="background-color: {tag.color}; color: {getContrastColor(tag.color)}"
							>
								{tag.name}
							</div>
							<span class="text-xs text-gray-500">{tag.usage_count} uses</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Tags List -->
	<div class="rounded-lg bg-white shadow dark:bg-gray-800">
		<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
			<h3 class="text-lg font-medium text-gray-900 dark:text-white">All Tags</h3>
		</div>

		{#if $tagsLoading}
			<!-- Loading State -->
			<div class="p-6">
				<div class="animate-pulse space-y-3">
					{#each Array(5) as _}
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-3">
								<div class="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
								<div class="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
							<div class="flex space-x-2">
								<div class="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
								<div class="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if $tags.length === 0}
			<!-- Empty State -->
			<div class="p-12 text-center">
				<svg class="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
				</svg>
				<h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">No Tags Found</h3>
				<p class="mb-4 text-gray-600 dark:text-gray-400">
					{searchQuery ? 'No tags match your search criteria.' : 'Get started by creating your first tag.'}
				</p>
				{#if searchQuery}
					<button
						onclick={() => {searchQuery = ''; handleSearch();}}
						class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						Clear Search
					</button>
				{:else}
					<button
						onclick={() => {showCreateForm = true; editingTag = null;}}
						class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					>
						Create First Tag
					</button>
				{/if}
			</div>
		{:else}
			<!-- Tags Table -->
			<div class="overflow-hidden">
				<div class="divide-y divide-gray-200 dark:divide-gray-700">
					{#each $tags as tag (tag.id)}
						<div class="flex items-center justify-between p-6">
							<div class="flex items-center space-x-4">
								<div 
									class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
									style="background-color: {tag.color}; color: {getContrastColor(tag.color)}"
								>
									{tag.name}
								</div>
								<div class="text-sm text-gray-500 dark:text-gray-400">
									Used {tag.usage_count} time{tag.usage_count !== 1 ? 's' : ''}
								</div>
								<div class="text-xs text-gray-400 dark:text-gray-500">
									ID: {tag.slug}
								</div>
							</div>
							
							<div class="flex items-center space-x-2">
								<button
									onclick={() => startEdit(tag)}
									class="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
									data-testid="edit-tag-{tag.slug}"
								>
									<svg class="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
									Edit
								</button>
								<button
									onclick={() => deleteTag(tag)}
									class="inline-flex items-center rounded border border-red-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:border-red-600 dark:bg-gray-700 dark:text-red-400 dark:hover:bg-red-900"
									data-testid="delete-tag-{tag.slug}"
								>
									<svg class="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									Delete
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>