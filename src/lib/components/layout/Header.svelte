<script lang="ts">
	import { user, isAuthenticated, isAdmin, authStore, appStore, theme, isDarkMode } from '$lib/stores';
	import { goto } from '$app/navigation';

	let dropdownOpen = false;

	async function handleLogout() {
		await authStore.logout();
		goto('/');
	}

	function toggleSidebar() {
		appStore.toggleSidebar();
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (dropdownOpen && event.target instanceof Element) {
			const dropdown = event.target.closest('[data-testid="user-menu"]');
			if (!dropdown) {
				closeDropdown();
			}
		}
	}

	function toggleTheme() {
		console.log('toggleTheme called');
		// Direct DOM manipulation to ensure it works
		const html = document.documentElement;
		const isDark = html.classList.contains('dark');
		
		if (isDark) {
			html.classList.remove('dark');
			localStorage.setItem('theme', 'light');
			console.log('Switched to light mode');
		} else {
			html.classList.add('dark');
			localStorage.setItem('theme', 'dark');
			console.log('Switched to dark mode');
		}
		
		// Also update the store for reactive components
		const newTheme = isDark ? 'light' : 'dark';
		theme.set(newTheme);
		isDarkMode.set(!isDark);
	}
</script>

<svelte:window on:click={handleClickOutside} />

<header class="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Left side: Logo and navigation -->
			<div class="flex items-center">
				<button
					onclick={toggleSidebar}
					class="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 md:hidden dark:hover:bg-gray-700"
					aria-label="Open sidebar"
					data-testid="mobile-menu-button"
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				<div class="ml-4 flex flex-shrink-0 items-center md:ml-0">
					<a href="/" class="flex items-center space-x-2" data-testid="home-logo">
						<svg
							class="h-8 w-8 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
							/>
						</svg>
						<span class="app-name text-xl font-bold text-gray-900 dark:text-white">MyRecipeBox</span
						>
					</a>
				</div>

				<!-- Navigation links for larger screens -->
				<nav class="hidden md:ml-8 md:flex md:space-x-8">
					<a
						href="/"
						class="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
					>
						Recipes
					</a>
					{#if $isAuthenticated}
						<a
							href="/search"
							class="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
						>
							Search
						</a>
					{/if}
					{#if $isAdmin}
						<a
							href="/admin/recipes/new"
							class="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
						>
							Add Recipe
						</a>
						<a
							href="/admin/tags"
							class="px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
						>
							Manage Tags
						</a>
					{/if}
				</nav>
			</div>

			<!-- Right side: Search, theme toggle, user menu -->
			<div class="flex items-center space-x-4">
				<!-- Search bar -->
				{#if $isAuthenticated}
					<div class="hidden sm:block">
						<div class="relative">
							<input
								type="text"
								placeholder="Search recipes..."
								onclick={() => goto('/search')}
								readonly
								class="w-64 cursor-pointer rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-blue-500
		                     dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
							/>
							<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
								<svg
									class="h-5 w-5 text-gray-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
						</div>
					</div>
				{/if}

				<!-- Theme toggle -->
				<button
					onclick={() => {
						console.log('Theme button clicked, current theme:', $theme);
						toggleTheme();
					}}
					class="rounded-md p-2 text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:hover:text-gray-300"
					aria-label="Toggle theme"
					title="Current theme: {$theme}"
				>
					{#if $isDarkMode}
						<!-- Moon icon for dark mode -->
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					{:else}
						<!-- Sun icon for light mode -->
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					{/if}
				</button>

				<!-- User menu -->
				{#if $isAuthenticated}
					<div class="relative" data-testid="user-menu">
						<button
							onclick={toggleDropdown}
							class="flex items-center space-x-2 rounded-full bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800"
							aria-label="User menu"
							aria-expanded={dropdownOpen}
							aria-haspopup="true"
							data-testid="user-menu-button"
						>
							<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
								<span class="font-medium text-white">
									{$user?.name?.charAt(0)?.toUpperCase() || 'U'}
								</span>
							</div>
							<span class="hidden text-gray-700 md:block dark:text-gray-300">
								{$user?.name}
							</span>
							{#if $isAdmin}
								<span
									class="hidden rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 md:block"
								>
									Admin
								</span>
							{/if}
						</button>

						<!-- Dropdown menu -->
						{#if dropdownOpen}
							<div
								class="ring-opacity-5 absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black dark:bg-gray-800 z-50"
								data-testid="user-dropdown"
							>
								<a
									href="/profile"
									onclick={closeDropdown}
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								>
									Your Profile
								</a>
								<a
									href="/settings"
									onclick={closeDropdown}
									class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								>
									Settings
								</a>
								<button
									onclick={() => { handleLogout(); closeDropdown(); }}
									class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
									data-testid="logout-button"
								>
									Sign out
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<div class="flex items-center space-x-3">
						<a
							href="/auth/login"
							class="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
						>
							Sign in
						</a>
						<a
							href="/auth/register"
							class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						>
							Sign up
						</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>
