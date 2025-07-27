<script lang="ts">
	import { offlineState, offlineStore, formatLastSync, lastSyncTime } from '$lib/stores/offline';
	import { slide } from 'svelte/transition';

	$: currentState = $offlineState;
	$: formattedLastSync = formatLastSync($lastSyncTime);

	function handleSync() {
		offlineStore.syncData();
	}

	function handleDismiss() {
		offlineStore.dismissOfflineBanner();
	}

	function handleClearCache() {
		if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
			offlineStore.clearCache();
		}
	}
</script>

<!-- Offline Banner -->
{#if currentState.showOfflineBanner}
	<div 
		class="bg-amber-50 border-l-4 border-amber-400 p-4 fixed top-0 left-0 right-0 z-50 shadow-md"
		transition:slide={{ duration: 300 }}
	>
		<div class="flex items-center justify-between">
			<div class="flex items-center">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-amber-700">
						You're currently offline. {#if currentState.hasOfflineData}Your recipes are still available.{:else}Limited functionality available.{/if}
					</p>
				</div>
			</div>
			<div class="flex items-center space-x-2">
				{#if currentState.isOnline}
					<button
						onclick={handleSync}
						class="text-amber-600 hover:text-amber-800 text-sm font-medium"
						disabled={currentState.syncStatus.isLoading}
					>
						{currentState.syncStatus.isLoading ? 'Syncing...' : 'Sync Now'}
					</button>
				{/if}
				<button
					onclick={handleDismiss}
					class="text-amber-600 hover:text-amber-800"
					aria-label="Dismiss"
				>
					<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Pending Operations -->
		{#if currentState.syncStatus.pendingOperations > 0}
			<div class="mt-2 text-sm text-amber-700">
				<p>
					{currentState.syncStatus.pendingOperations} change(s) waiting to sync when online.
				</p>
			</div>
		{/if}
	</div>
{/if}

<!-- Connection Status Indicator (always visible in corner) -->
<div class="fixed bottom-4 right-4 z-40">
	<div 
		class="flex items-center space-x-2 bg-white rounded-full shadow-lg px-3 py-2 border"
		class:bg-red-50={!currentState.isOnline}
		class:border-red-200={!currentState.isOnline}
		class:bg-green-50={currentState.isOnline && !currentState.syncStatus.isLoading}
		class:border-green-200={currentState.isOnline && !currentState.syncStatus.isLoading}
		class:bg-blue-50={currentState.syncStatus.isLoading}
		class:border-blue-200={currentState.syncStatus.isLoading}
	>
		<!-- Connection Status Icon -->
		<div class="flex-shrink-0">
			{#if !currentState.isOnline}
				<!-- Offline Icon -->
				<svg class="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L5.636 5.636m12.728 12.728L18.364 18.364" />
				</svg>
			{:else if currentState.syncStatus.isLoading}
				<!-- Syncing Icon -->
				<svg class="h-4 w-4 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
			{:else}
				<!-- Online Icon -->
				<svg class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			{/if}
		</div>

		<!-- Status Text -->
		<div class="text-xs">
			{#if !currentState.isOnline}
				<span class="text-red-700 font-medium">Offline</span>
			{:else if currentState.syncStatus.isLoading}
				<span class="text-blue-700 font-medium">Syncing...</span>
			{:else}
				<span class="text-green-700 font-medium">Online</span>
			{/if}
		</div>

		<!-- Pending Operations Badge -->
		{#if currentState.syncStatus.pendingOperations > 0}
			<div class="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
				{currentState.syncStatus.pendingOperations}
			</div>
		{/if}
	</div>
</div>

<!-- Detailed Status Panel (toggle-able) -->
{#if currentState.syncStatus.error || currentState.hasOfflineData}
	<div class="fixed bottom-16 right-4 z-30">
		<details class="bg-white rounded-lg shadow-lg border max-w-sm">
			<summary class="p-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
				Sync Details
			</summary>
			<div class="p-3 border-t">
				<!-- Last Sync Time -->
				<div class="mb-2">
					<span class="text-xs text-gray-500">Last sync:</span>
					<span class="text-xs text-gray-700 ml-1">{formattedLastSync}</span>
				</div>

				<!-- Error Message -->
				{#if currentState.syncStatus.error}
					<div class="mb-2 text-xs text-red-600">
						Error: {currentState.syncStatus.error}
					</div>
				{/if}

				<!-- Offline Data Status -->
				{#if currentState.hasOfflineData}
					<div class="mb-2 text-xs text-green-600">
						✓ Offline data available
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex space-x-2 mt-3">
					{#if currentState.isOnline}
						<button
							onclick={handleSync}
							class="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
							disabled={currentState.syncStatus.isLoading}
						>
							{currentState.syncStatus.isLoading ? 'Syncing...' : 'Sync Now'}
						</button>
					{/if}
					
					{#if currentState.hasOfflineData}
						<button
							onclick={handleClearCache}
							class="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
						>
							Clear Cache
						</button>
					{/if}
				</div>
			</div>
		</details>
	</div>
{/if}