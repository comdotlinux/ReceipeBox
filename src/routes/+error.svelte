<script>
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Error - MyRecipeBox</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
  <div class="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
    <div class="mb-4">
      <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
    </div>
    
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
    
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      {$page.error?.message || 'An unexpected error occurred'}
    </p>
    
    <div class="space-y-3">
      <a 
        href="/"
        class="block w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Back to Home
      </a>
      
      {#if $page.status === 404}
        <p class="text-sm text-gray-500 dark:text-gray-400">
          The page you're looking for doesn't exist.
        </p>
      {/if}
    </div>
  </div>
</div>