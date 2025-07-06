<script lang="ts">
  import { page } from '$app/stores';
  import { recipesStore, currentRecipe, isAdmin, pb } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { Recipe } from '$lib/types';

  let recipe = $state<Recipe | null>(null);
  let loading = $state(true);
  let error = $state('');

  onMount(async () => {
    const recipeId = $page.params.id;
    if (!recipeId) {
      error = 'Recipe ID is required';
      loading = false;
      return;
    }

    try {
      await recipesStore.loadRecipe(recipeId);
      
      // Set the recipe directly from the store
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

    // Also subscribe for any updates
    const unsubscribe = currentRecipe.subscribe(value => {
      recipe = value;
    });
    
    return unsubscribe;
  });

  function getImageUrl() {
    if (!recipe?.image) return null;
    return pb.getFileUrl(recipe, recipe.image);
  }

  async function handleDelete() {
    if (!recipe || !confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      await recipesStore.deleteRecipe(recipe.id);
      goto('/');
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  }
</script>

<svelte:head>
  <title>{recipe ? recipe.title : 'Recipe'} - MyRecipeBox</title>
  {#if recipe}
    <meta name="description" content={recipe.description || `Recipe for ${recipe.title}`} />
  {/if}
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  {#if loading}
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if error}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
        <div class="mt-4">
          <a href="/" class="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  {:else if recipe}
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <div>
              <a href="/" class="text-gray-400 hover:text-gray-500">
                <svg class="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
                <span class="sr-only">Home</span>
              </a>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="ml-4 text-sm font-medium text-gray-500">{recipe.title}</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Recipe Header -->
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-8">
        {#if getImageUrl()}
          <div class="aspect-w-16 aspect-h-9">
            <img 
              src={getImageUrl()} 
              alt={recipe.title}
              class="w-full h-64 object-cover"
            />
          </div>
        {/if}
        
        <div class="p-6">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {recipe.title}
              </h1>
              
              {#if recipe.description}
                <p class="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  {recipe.description}
                </p>
              {/if}
              
              <!-- Recipe Meta -->
              <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                {#if recipe.metadata?.prepTime}
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Prep: {recipe.metadata.prepTime}
                  </div>
                {/if}
                
                {#if recipe.metadata?.cookTime}
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                    </svg>
                    Cook: {recipe.metadata.cookTime}
                  </div>
                {/if}
                
                {#if recipe.metadata?.servings}
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Serves: {recipe.metadata.servings}
                  </div>
                {/if}
                
                {#if recipe.metadata?.difficulty}
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    {recipe.metadata.difficulty}
                  </div>
                {/if}
                
                {#if recipe.metadata?.cuisine}
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
                    </svg>
                    {recipe.metadata.cuisine}
                  </div>
                {/if}
              </div>
            </div>
            
            <!-- Admin Actions -->
            {#if $isAdmin}
              <div class="flex items-center space-x-3 ml-6">
                <a 
                  href="/admin/recipes/{recipe.id}/edit"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit Recipe
                </a>
                
                <button 
                  onclick={handleDelete}
                  class="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Delete Recipe
                </button>
              </div>
            {/if}
          </div>
          
          <!-- Tags -->
          {#if recipe.tags && recipe.tags.length > 0}
            <div class="mt-4">
              <div class="flex flex-wrap gap-2">
                {#each recipe.tags as tag}
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {tag}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Dietary Info -->
          {#if recipe.metadata?.dietary && recipe.metadata.dietary.length > 0}
            <div class="mt-3">
              <div class="flex flex-wrap gap-2">
                {#each recipe.metadata.dietary as dietary}
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {dietary}
                  </span>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Recipe Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Ingredients -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sticky top-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ingredients</h2>
            <ul class="space-y-3">
              {#each recipe.ingredients as ingredient}
                <li class="flex items-start">
                  <input type="checkbox" class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <div class="ml-3 flex-1">
                    <span class="text-gray-900 dark:text-white">
                      {#if ingredient.quantity}{ingredient.quantity} {/if}
                      {#if ingredient.unit}{ingredient.unit} {/if}
                      {ingredient.item}
                    </span>
                    {#if ingredient.notes}
                      <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {ingredient.notes}
                      </div>
                    {/if}
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        </div>
        
        <!-- Instructions -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Instructions</h2>
            <div class="space-y-6">
              {#each recipe.instructions as instruction, index}
                <div class="flex">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {instruction.step}
                    </div>
                  </div>
                  <div class="ml-4 flex-1">
                    <p class="text-gray-900 dark:text-white leading-relaxed">
                      {instruction.instruction}
                    </p>
                    {#if instruction.duration || instruction.temperature}
                      <div class="mt-2 flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        {#if instruction.duration}
                          <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {instruction.duration}
                          </span>
                        {/if}
                        {#if instruction.temperature}
                          <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                            {instruction.temperature}
                          </span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Source Info -->
      {#if recipe.source}
        <div class="mt-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <span class="mr-2">
              {#if recipe.source.type === 'url'}🔗{:else if recipe.source.type === 'image'}📷{:else}✍️{/if}
            </span>
            <span>
              {#if recipe.source.type === 'url'}
                Recipe extracted from URL
              {:else if recipe.source.type === 'image'}
                Recipe extracted from image
              {:else}
                Recipe created manually
              {/if}
            </span>
            {#if recipe.source.extractedBy && recipe.source.extractedBy !== 'manual'}
              <span class="ml-2">• Extracted by {recipe.source.extractedBy}</span>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>