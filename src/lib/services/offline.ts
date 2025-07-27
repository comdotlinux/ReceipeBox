import { browser } from '$app/environment';
import type { Recipe, RecipeListResponse } from '$lib/types';

interface SyncOperation {
	id: string;
	type: 'create' | 'update' | 'delete';
	data: any;
	timestamp: number;
}

interface CacheMetadata {
	lastSync: number;
	version: string;
	totalRecipes: number;
}

class OfflineService {
	private dbName = 'myrecipebox-cache';
	private version = 1;
	private db: IDBDatabase | null = null;

	async init(): Promise<void> {
		if (this.db || !browser) return;

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Recipes store
				if (!db.objectStoreNames.contains('recipes')) {
					const recipesStore = db.createObjectStore('recipes', { keyPath: 'id' });
					recipesStore.createIndex('title', 'title', { unique: false });
					recipesStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
					recipesStore.createIndex('created', 'created', { unique: false });
					recipesStore.createIndex('updated', 'updated', { unique: false });
				}

				// Sync operations store
				if (!db.objectStoreNames.contains('sync_operations')) {
					db.createObjectStore('sync_operations', { keyPath: 'id' });
				}

				// Cache metadata store
				if (!db.objectStoreNames.contains('cache_metadata')) {
					db.createObjectStore('cache_metadata', { keyPath: 'key' });
				}

				// Tags store
				if (!db.objectStoreNames.contains('tags')) {
					const tagsStore = db.createObjectStore('tags', { keyPath: 'id' });
					tagsStore.createIndex('name', 'name', { unique: false });
				}
			};
		});
	}

	// Recipe caching methods
	async cacheRecipes(recipes: Recipe[]): Promise<void> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		const transaction = this.db.transaction(['recipes'], 'readwrite');
		const store = transaction.objectStore('recipes');

		const promises = recipes.map(recipe => 
			new Promise<void>((resolve, reject) => {
				const request = store.put(recipe);
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			})
		);

		await Promise.all(promises);
		await this.updateCacheMetadata({
			lastSync: Date.now(),
			version: '1.0',
			totalRecipes: recipes.length
		});
	}

	async getCachedRecipes(params: { 
		query?: string; 
		tags?: string[]; 
		page?: number; 
		limit?: number; 
	} = {}): Promise<RecipeListResponse> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(['recipes'], 'readonly');
			const store = transaction.objectStore('recipes');
			const request = store.getAll();

			request.onsuccess = () => {
				let recipes = request.result as Recipe[];

				// Apply filters
				if (params.query) {
					const query = params.query.toLowerCase();
					recipes = recipes.filter(recipe => 
						recipe.title.toLowerCase().includes(query) ||
						recipe.description?.toLowerCase().includes(query) ||
						recipe.ingredients.some(ing => 
							ing.item.toLowerCase().includes(query)
						) ||
						recipe.instructions.some(inst => 
							inst.instruction.toLowerCase().includes(query)
						)
					);
				}

				if (params.tags && params.tags.length > 0) {
					recipes = recipes.filter(recipe =>
						params.tags!.some(tag => recipe.tags.includes(tag))
					);
				}

				// Sort by updated date (newest first)
				recipes.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());

				// Apply pagination
				const page = params.page || 1;
				const limit = params.limit || 20;
				const start = (page - 1) * limit;
				const paginatedRecipes = recipes.slice(start, start + limit);

				resolve({
					page,
					perPage: limit,
					totalItems: recipes.length,
					totalPages: Math.ceil(recipes.length / limit),
					items: paginatedRecipes
				});
			};

			request.onerror = () => reject(request.error);
		});
	}

	async getCachedRecipe(id: string): Promise<Recipe | null> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(['recipes'], 'readonly');
			const store = transaction.objectStore('recipes');
			const request = store.get(id);

			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}

	// Sync operations for offline changes
	async queueSyncOperation(operation: Omit<SyncOperation, 'timestamp'>): Promise<void> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		const syncOp: SyncOperation = {
			...operation,
			timestamp: Date.now()
		};

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(['sync_operations'], 'readwrite');
			const store = transaction.objectStore('sync_operations');
			const request = store.put(syncOp);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async getPendingSyncOperations(): Promise<SyncOperation[]> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(['sync_operations'], 'readonly');
			const store = transaction.objectStore('sync_operations');
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	async clearSyncOperation(id: string): Promise<void> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(['sync_operations'], 'readwrite');
			const store = transaction.objectStore('sync_operations');
			const request = store.delete(id);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	// Cache metadata management
	async updateCacheMetadata(metadata: CacheMetadata): Promise<void> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(['cache_metadata'], 'readwrite');
			const store = transaction.objectStore('cache_metadata');
			const request = store.put({ key: 'main', ...metadata });

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	async getCacheMetadata(): Promise<CacheMetadata | null> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(['cache_metadata'], 'readonly');
			const store = transaction.objectStore('cache_metadata');
			const request = store.get('main');

			request.onsuccess = () => {
				const result = request.result;
				if (result) {
					const { key, ...metadata } = result;
					resolve(metadata as CacheMetadata);
				} else {
					resolve(null);
				}
			};
			request.onerror = () => reject(request.error);
		});
	}

	// Utility methods
	async isOnline(): Promise<boolean> {
		if (!browser) return false;
		return navigator.onLine && await this.checkNetworkConnectivity();
	}

	private async checkNetworkConnectivity(): Promise<boolean> {
		try {
			const response = await fetch('/api/health', {
				method: 'HEAD',
				cache: 'no-cache'
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	async isCacheStale(): Promise<boolean> {
		const metadata = await this.getCacheMetadata();
		if (!metadata) return true;

		const hoursSinceLastSync = (Date.now() - metadata.lastSync) / (1000 * 60 * 60);
		return hoursSinceLastSync > 1; // Consider cache stale after 1 hour
	}

	// Tag caching
	async cacheTags(tags: any[]): Promise<void> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		const transaction = this.db.transaction(['tags'], 'readwrite');
		const store = transaction.objectStore('tags');

		const promises = tags.map(tag => 
			new Promise<void>((resolve, reject) => {
				const request = store.put(tag);
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			})
		);

		await Promise.all(promises);
	}

	async getCachedTags(): Promise<any[]> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(['tags'], 'readonly');
			const store = transaction.objectStore('tags');
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	// Clear all cached data
	async clearCache(): Promise<void> {
		await this.init();
		if (!this.db) throw new Error('Database not initialized');

		const transaction = this.db.transaction(['recipes', 'tags', 'cache_metadata'], 'readwrite');
		
		await Promise.all([
			new Promise<void>((resolve, reject) => {
				const request = transaction.objectStore('recipes').clear();
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			}),
			new Promise<void>((resolve, reject) => {
				const request = transaction.objectStore('tags').clear();
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			}),
			new Promise<void>((resolve, reject) => {
				const request = transaction.objectStore('cache_metadata').clear();
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			})
		]);
	}
}

export const offlineService = new OfflineService();