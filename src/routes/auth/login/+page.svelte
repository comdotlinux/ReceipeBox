<script lang="ts">
  import LoginForm from '$lib/components/auth/LoginForm.svelte';
  import { isAuthenticated } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    // Redirect if already authenticated
    if ($isAuthenticated) {
      goto('/');
    }
  });

  // Watch for auth changes
  $effect(() => {
    if ($isAuthenticated) {
      goto('/');
    }
  });
</script>

<svelte:head>
  <title>Sign In - MyRecipeBox</title>
  <meta name="description" content="Sign in to your MyRecipeBox account to access your recipes and collections." />
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
  <div class="w-full max-w-md">
    <LoginForm />
  </div>
</div>