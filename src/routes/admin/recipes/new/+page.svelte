<script lang="ts">
  import RecipeForm from '$lib/components/recipe/RecipeForm.svelte';
  import { isAuthenticated, isAdmin } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    if (!$isAuthenticated || !$isAdmin) {
      goto('/auth/login');
    }
  });
</script>

<svelte:head>
  <title>Create New Recipe - MyRecipeBox</title>
</svelte:head>

{#if $isAuthenticated && $isAdmin}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8">
        <nav class="flex" aria-label="Breadcrumb">
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
                <a href="/admin" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">Admin</a>
              </div>
            </li>
            <li>
              <div class="flex items-center">
                <svg class="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                <span class="ml-4 text-sm font-medium text-gray-500">New Recipe</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      <RecipeForm mode="create" />
    </div>
  </div>
{:else}
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div class="text-center" data-testid="access-denied">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
      <p class="mt-2 text-gray-600 dark:text-gray-400">You need admin privileges to create recipes.</p>
      <a href="/auth/login" class="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" data-testid="access-denied-login-link">
        Sign In
      </a>
    </div>
  </div>
{/if}