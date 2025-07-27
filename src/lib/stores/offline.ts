import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { enhancedRecipeService } from '$lib/services/recipe-enhanced';

export interface OfflineState {
	isOnline: boolean;
	syncStatus: {
		isLoading: boolean;
		lastSync: number | null;
		pendingOperations: number;
		error: string | null;
	};
	hasOfflineData: boolean;
	showOfflineBanner: boolean;
}

// Create writable stores
export const isOnline = writable(true);
export const syncStatus = writable({
	isLoading: false,
	lastSync: null as number | null,
	pendingOperations: 0,
	error: null as string | null
});
export const hasOfflineData = writable(false);
export const showOfflineBanner = writable(false);

// Combined offline state store
export const offlineState = derived(
	[isOnline, syncStatus, hasOfflineData, showOfflineBanner],
	([$isOnline, $syncStatus, $hasOfflineData, $showOfflineBanner]) => ({
		isOnline: $isOnline,
		syncStatus: $syncStatus,
		hasOfflineData: $hasOfflineData,
		showOfflineBanner: $showOfflineBanner
	})
);

class OfflineStore {
	private unsubscribeSyncStatus: (() => void) | null = null;

	constructor() {
		if (browser) {
			this.initializeOfflineHandling();
		}
	}

	private async initializeOfflineHandling(): Promise<void> {
		// Set initial online state
		isOnline.set(navigator.onLine);

		// Listen for online/offline events
		window.addEventListener('online', this.handleOnline.bind(this));
		window.addEventListener('offline', this.handleOffline.bind(this));

		// Listen for sync status changes
		this.unsubscribeSyncStatus = enhancedRecipeService.onSyncStatusChange((status) => {
			syncStatus.set(status);
		});

		// Check if we have offline data
		try {
			const hasData = await enhancedRecipeService.hasOfflineData();
			hasOfflineData.set(hasData);
		} catch (error) {
			console.warn('Failed to check offline data:', error);
		}

		// Get initial sync status
		try {
			const status = await enhancedRecipeService.getSyncStatus();
			syncStatus.set(status);
		} catch (error) {
			console.warn('Failed to get sync status:', error);
		}
	}

	private handleOnline(): void {
		console.log('Connection restored');
		isOnline.set(true);
		showOfflineBanner.set(false);
		
		// Trigger sync when connection is restored
		this.syncData();
	}

	private handleOffline(): void {
		console.log('Connection lost');
		isOnline.set(false);
		showOfflineBanner.set(true);
	}

	async syncData(): Promise<void> {
		try {
			await enhancedRecipeService.forcSync();
			
			// Update offline data status
			const hasData = await enhancedRecipeService.hasOfflineData();
			hasOfflineData.set(hasData);
		} catch (error) {
			console.error('Sync failed:', error);
		}
	}

	async clearCache(): Promise<void> {
		try {
			await enhancedRecipeService.clearCache();
			hasOfflineData.set(false);
		} catch (error) {
			console.error('Failed to clear cache:', error);
		}
	}

	dismissOfflineBanner(): void {
		showOfflineBanner.set(false);
	}

	showOfflineMessage(): void {
		showOfflineBanner.set(true);
	}

	// Get cache information
	async getCacheInfo() {
		try {
			return await enhancedRecipeService.getCacheInfo();
		} catch (error) {
			console.error('Failed to get cache info:', error);
			return null;
		}
	}

	// Cleanup method
	destroy(): void {
		if (browser) {
			window.removeEventListener('online', this.handleOnline.bind(this));
			window.removeEventListener('offline', this.handleOffline.bind(this));
		}
		
		if (this.unsubscribeSyncStatus) {
			this.unsubscribeSyncStatus();
		}
	}
}

export const offlineStore = new OfflineStore();

// Convenience derived stores
export const isPending = derived(syncStatus, ($syncStatus) => $syncStatus.pendingOperations > 0);
export const isSyncing = derived(syncStatus, ($syncStatus) => $syncStatus.isLoading);
export const syncError = derived(syncStatus, ($syncStatus) => $syncStatus.error);
export const lastSyncTime = derived(syncStatus, ($syncStatus) => {
	if (!$syncStatus.lastSync) return null;
	return new Date($syncStatus.lastSync);
});

// Helper functions for components
export function formatLastSync(lastSync: Date | null): string {
	if (!lastSync) return 'Never';
	
	const now = new Date();
	const diffMs = now.getTime() - lastSync.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMinutes / 60);
	const diffDays = Math.floor(diffHours / 24);
	
	if (diffMinutes < 1) return 'Just now';
	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	return `${diffDays}d ago`;
}