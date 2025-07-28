import { recipeService } from './recipe';
import { tagService } from './tag';
import { offlineService } from './offline';
import { browser } from '$app/environment';
import type { Recipe } from '$lib/types';

export interface SyncStatus {
	isOnline: boolean;
	isLoading: boolean;
	lastSync: number | null;
	pendingOperations: number;
	error: string | null;
}

class SyncService {
	private syncInProgress = false;
	private syncListeners: ((status: SyncStatus) => void)[] = [];

	constructor() {
		if (browser) {
			// Listen for online/offline events
			window.addEventListener('online', () => this.handleOnlineStatusChange(true));
			window.addEventListener('offline', () => this.handleOnlineStatusChange(false));

			// Listen for service worker messages
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.addEventListener('message', (event) => {
					if (event.data?.type === 'SYNC_RECIPES') {
						this.syncWithServer();
					}
				});
			}

			// Initial sync check
			this.checkAndSync();
		}
	}

	// Subscribe to sync status changes
	onSyncStatusChange(callback: (status: SyncStatus) => void): () => void {
		this.syncListeners.push(callback);
		return () => {
			const index = this.syncListeners.indexOf(callback);
			if (index > -1) {
				this.syncListeners.splice(index, 1);
			}
		};
	}

	private notifyListeners(status: SyncStatus): void {
		this.syncListeners.forEach(listener => listener(status));
	}

	private async handleOnlineStatusChange(isOnline: boolean): Promise<void> {
		console.log('Network status changed:', isOnline ? 'online' : 'offline');
		
		if (isOnline) {
			// Wait a bit to ensure connection is stable
			setTimeout(() => this.syncWithServer(), 1000);
		}

		this.notifyListeners(await this.getSyncStatus());
	}

	async getSyncStatus(): Promise<SyncStatus> {
		const isOnline = await offlineService.isOnline();
		const metadata = await offlineService.getCacheMetadata();
		const pendingOps = await offlineService.getPendingSyncOperations();

		return {
			isOnline,
			isLoading: this.syncInProgress,
			lastSync: metadata?.lastSync || null,
			pendingOperations: pendingOps.length,
			error: null
		};
	}

	// Main sync method - handles both directions
	async syncWithServer(force: boolean = false): Promise<void> {
		if (this.syncInProgress) {
			console.log('Sync already in progress, skipping');
			return;
		}

		try {
			this.syncInProgress = true;
			this.notifyListeners(await this.getSyncStatus());

			const isOnline = await offlineService.isOnline();
			if (!isOnline) {
				console.log('Offline - skipping sync');
				return;
			}

			const isCacheStale = await offlineService.isCacheStale();
			if (!force && !isCacheStale) {
				console.log('Cache is fresh - skipping sync');
				return;
			}

			console.log('Starting sync with server...');

			// 1. Push pending local changes to server
			await this.pushLocalChanges();

			// 2. Pull latest data from server
			await this.pullServerChanges();

			console.log('Sync completed successfully');

		} catch (error) {
			console.error('Sync failed:', error);
			this.notifyListeners({
				...(await this.getSyncStatus()),
				error: error instanceof Error ? error.message : 'Sync failed'
			});
		} finally {
			this.syncInProgress = false;
			this.notifyListeners(await this.getSyncStatus());
		}
	}

	private async pushLocalChanges(): Promise<void> {
		const pendingOps = await offlineService.getPendingSyncOperations();
		
		for (const op of pendingOps) {
			try {
				switch (op.type) {
					case 'create':
						await recipeService.createRecipe(op.data);
						break;
					case 'update':
						await recipeService.updateRecipe(op.data);
						break;
					case 'delete':
						await recipeService.deleteRecipe(op.data.id);
						break;
				}

				// Remove successful operation from queue
				await offlineService.clearSyncOperation(op.id);
				console.log(`Synced ${op.type} operation:`, op.id);

			} catch (error) {
				console.error(`Failed to sync ${op.type} operation:`, error);
				// Keep the operation in queue for next sync attempt
			}
		}
	}

	private async pullServerChanges(): Promise<void> {
		try {
			// Get all recipes from server
			const response = await recipeService.getRecipes({ limit: 1000 });
			
			// Cache recipes locally
			await offlineService.cacheRecipes(response.items);
			console.log(`Cached ${response.items.length} recipes`);

			// Get and cache tags
			const tagsResponse = await tagService.getTags();
			await offlineService.cacheTags(tagsResponse.items);
			console.log(`Cached ${tagsResponse.items.length} tags`);

		} catch (error) {
			console.error('Failed to pull server changes:', error);
			throw error;
		}
	}

	// Check if sync is needed and perform if necessary
	async checkAndSync(): Promise<void> {
		const isOnline = await offlineService.isOnline();
		if (!isOnline) return;

		const isCacheStale = await offlineService.isCacheStale();
		const pendingOps = await offlineService.getPendingSyncOperations();

		if (isCacheStale || pendingOps.length > 0) {
			await this.syncWithServer();
		}
	}

	// Manual sync trigger
	async forcSync(): Promise<void> {
		await this.syncWithServer(true);
	}

	// Handle offline recipe operations
	async createRecipeOffline(data: any): Promise<Recipe> {
		// Generate temporary ID for offline creation
		const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const tempRecipe: Recipe = {
			...data,
			id: tempId,
			created: new Date().toISOString(),
			updated: new Date().toISOString()
		};

		// Queue sync operation
		await offlineService.queueSyncOperation({
			id: tempId,
			type: 'create',
			data: data
		});

		// Cache the temporary recipe
		await offlineService.cacheRecipes([tempRecipe]);

		return tempRecipe;
	}

	async updateRecipeOffline(data: any): Promise<Recipe> {
		const updatedRecipe: Recipe = {
			...data,
			updated: new Date().toISOString()
		};

		// Queue sync operation
		await offlineService.queueSyncOperation({
			id: `update_${data.id}_${Date.now()}`,
			type: 'update',
			data: data
		});

		// Update in cache
		await offlineService.cacheRecipes([updatedRecipe]);

		return updatedRecipe;
	}

	async deleteRecipeOffline(id: string): Promise<void> {
		// Queue sync operation
		await offlineService.queueSyncOperation({
			id: `delete_${id}_${Date.now()}`,
			type: 'delete',
			data: { id }
		});

		// Note: We keep the recipe in cache but mark it as deleted
		// This will be handled during sync
	}

	// Background sync registration
	async registerBackgroundSync(): Promise<void> {
		if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
			try {
				const registration = await navigator.serviceWorker.ready;
				await registration.sync.register('sync-recipes');
				console.log('Background sync registered');
			} catch (error) {
				console.error('Failed to register background sync:', error);
			}
		}
	}

	// Get cached data for offline use
	async getOfflineRecipes(params: any = {}): Promise<any> {
		return await offlineService.getCachedRecipes(params);
	}

	async getOfflineRecipe(id: string): Promise<Recipe | null> {
		return await offlineService.getCachedRecipe(id);
	}

	async getOfflineTags(): Promise<any[]> {
		return await offlineService.getCachedTags();
	}

	// Clear all cached data
	async clearCache(): Promise<void> {
		await offlineService.clearCache();
		console.log('Cache cleared');
	}
}

export const syncService = new SyncService();