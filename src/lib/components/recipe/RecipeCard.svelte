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

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
  <a href="/recipes/{recipe.id}" class="block">
    <!-- Recipe Image -->
    <div class="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
      {#if imageUrl}
        <img 
          src={imageUrl} 
          alt={recipe.title}
          class="w-full h-48 object-cover"
          loading="lazy"
        />
      {:else}
        <div class="w-full h-48 flex items-center justify-center">
          <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
        </div>
      {/if}
    </div>
    
    <!-- Recipe Content -->
    <div class="p-4">
      <!-- Title -->
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {recipe.title}
      </h3>
      
      <!-- Description -->
      {#if recipe.description && !compact}
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
      {/if}
      
      <!-- Recipe Meta -->
      <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
        <div class="flex items-center space-x-4">
          {#if prepTime}
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {prepTime}
            </div>
          {/if}
          
          {#if difficulty}
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {difficulty}
            </div>
          {/if}
          
          {#if servings}
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {servings}
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Tags -->
      {#if recipe.tags && recipe.tags.length > 0}
        <div class="flex flex-wrap gap-1 mb-3">
          {#each recipe.tags.slice(0, compact ? 2 : 4) as tag}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {tag}
            </span>
          {/each}
          {#if recipe.tags.length > (compact ? 2 : 4)}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              +{recipe.tags.length - (compact ? 2 : 4)}
            </span>
          {/if}
        </div>
      {/if}
    </div>
  </a>
  
  <!-- Admin Actions -->
  {#if $isAdmin}
    <div class="px-4 pb-4 pt-0">
      <div class="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
        <div class="flex items-center space-x-2">
          <a 
            href="/admin/recipes/{recipe.id}/edit"
            class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Edit
          </a>
          
          <button 
            type="button"
            class="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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