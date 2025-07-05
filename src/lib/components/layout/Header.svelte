<script lang="ts">
  import { user, isAuthenticated, isAdmin, authStore, appStore } from '$lib/stores';
  import { goto } from '$app/navigation';
  
  async function handleLogout() {
    await authStore.logout();
    goto('/');
  }

  function toggleSidebar() {
    appStore.toggleSidebar();
  }
</script>

<header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Left side: Logo and navigation -->
      <div class="flex items-center">
        <button
          onclick={toggleSidebar}
          class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Open sidebar"
          data-testid="mobile-menu-button"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="flex-shrink-0 flex items-center ml-4 md:ml-0">
          <a href="/" class="flex items-center space-x-2" data-testid="home-logo">
            <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span class="text-xl font-bold text-gray-900 dark:text-white app-name">MyRecipeBox</span>
          </a>
        </div>

        <!-- Navigation links for larger screens -->
        <nav class="hidden md:ml-8 md:flex md:space-x-8">
          <a 
            href="/"
            class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
          >
            Recipes
          </a>
          {#if $isAdmin}
            <a 
              href="/admin/recipes/new"
              class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
            >
              Add Recipe
            </a>
            <a 
              href="/admin/tags"
              class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
            >
              Manage Tags
            </a>
          {/if}
        </nav>
      </div>

      <!-- Right side: Search, theme toggle, user menu -->
      <div class="flex items-center space-x-4">
        <!-- Search bar -->
        <div class="hidden sm:block">
          <div class="relative">
            <input
              type="text"
              placeholder="Search recipes..."
              class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Theme toggle -->
        <button
          onclick={() => appStore.setTheme('dark')}
          class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          aria-label="Toggle theme"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- User menu -->
        {#if $isAuthenticated}
          <div class="relative">
            <button
              class="flex items-center space-x-2 text-sm bg-white dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="User menu"
            >
              <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span class="text-white font-medium">
                  {$user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span class="hidden md:block text-gray-700 dark:text-gray-300">
                {$user?.name}
              </span>
              {#if $isAdmin}
                <span class="hidden md:block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Admin
                </span>
              {/if}
            </button>

            <!-- Dropdown menu (you can implement this with a library like floating-ui) -->
            <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 hidden">
              <a href="/profile" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Your Profile
              </a>
              <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Settings
              </a>
              <button
                onclick={handleLogout}
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        {:else}
          <div class="flex items-center space-x-3">
            <a
              href="/auth/login"
              class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium"
            >
              Sign in
            </a>
            <a
              href="/auth/register"
              class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign up
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</header>