<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { user, isAuthenticated, authStore } from '$lib/stores';
  
  export let requireAuth = false;
  export let requireAdmin = false;
  export let redirectTo = '/auth/login';
  
  let isLoading = true;
  let hasAccess = false;

  onMount(async () => {
    // Try to refresh authentication
    await authStore.refreshAuth();
    
    // Check access based on requirements
    const currentUser = $user;
    
    if (requireAuth && !$isAuthenticated) {
      // User needs to be authenticated but isn't
      hasAccess = false;
      goto(redirectTo);
      return;
    }
    
    if (requireAdmin && (!currentUser || currentUser.role !== 'admin')) {
      // User needs admin role but doesn't have it
      hasAccess = false;
      goto('/'); // Redirect to home instead of login
      return;
    }
    
    hasAccess = true;
    isLoading = false;
  });

  // Watch for auth changes
  $effect(() => {
    if (!isLoading) {
      const currentUser = $user;
      
      if (requireAuth && !$isAuthenticated) {
        hasAccess = false;
        goto(redirectTo);
      } else if (requireAdmin && (!currentUser || currentUser.role !== 'admin')) {
        hasAccess = false;
        goto('/');
      } else {
        hasAccess = true;
      }
    }
  });
</script>

{#if isLoading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
{:else if hasAccess}
  <slot />
{:else}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Access Denied
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {#if requireAdmin}
          You need administrator privileges to access this page.
        {:else}
          You need to be signed in to access this page.
        {/if}
      </p>
      <a 
        href="/"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
               text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
               focus:ring-offset-2 focus:ring-blue-500"
      >
        Go Home
      </a>
    </div>
  </div>
{/if}