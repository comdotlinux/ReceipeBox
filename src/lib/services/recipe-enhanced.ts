import { recipeService as baseRecipeService } from './recipe';
import { syncService } from './sync';
import { offlineService } from './offline';
import type {
	Recipe,
	RecipeCreateData,
	RecipeUpdateData,
	RecipeListResponse,
	RecipeSearchParams,
	RecipeExtractionResponse
} from '$lib/types';

export class EnhancedRecipeService {
	private static instance: EnhancedRecipeService;

	public static getInstance(): EnhancedRecipeService {
		if (!EnhancedRecipeService.instance) {
			EnhancedRecipeService.instance = new EnhancedRecipeService();
		}
		return EnhancedRecipeService.instance;
	}

	async getRecipes(params: RecipeSearchParams = {}): Promise<RecipeListResponse> {
		try {
			const isOnline = await offlineService.isOnline();
			
			if (isOnline) {
				// Try to get from server first
				try {
					const response = await baseRecipeService.getRecipes(params);
					// Cache the results
					await offlineService.cacheRecipes(response.items);
					return response;
				} catch (error) {
					console.warn('Failed to fetch from server, falling back to cache:', error);
					// Fall back to cache
					return await syncService.getOfflineRecipes(params);
				}
			} else {
				// Offline - get from cache
				return await syncService.getOfflineRecipes(params);
			}
		} catch (error) {
			throw new Error(`Failed to fetch recipes: ${error}`);
		}
	}

	async getRecipe(id: string): Promise<Recipe> {
		try {
			const isOnline = await offlineService.isOnline();
			
			if (isOnline) {
				// Try to get from server first
				try {
					const recipe = await baseRecipeService.getRecipe(id);
					// Cache the result
					await offlineService.cacheRecipes([recipe]);
					return recipe;
				} catch (error) {
					console.warn('Failed to fetch from server, falling back to cache:', error);
					// Fall back to cache
					const cachedRecipe = await syncService.getOfflineRecipe(id);
					if (!cachedRecipe) {
						throw new Error('Recipe not found');
					}
					return cachedRecipe;
				}
			} else {
				// Offline - get from cache
				const cachedRecipe = await syncService.getOfflineRecipe(id);
				if (!cachedRecipe) {
					throw new Error('Recipe not available offline');
				}
				return cachedRecipe;
			}
		} catch (error) {
			throw new Error(`Failed to fetch recipe: ${error}`);
		}
	}

	async createRecipe(data: RecipeCreateData): Promise<Recipe> {
		try {
			const isOnline = await offlineService.isOnline();
			
			if (isOnline) {
				// Online - create on server
				try {
					const recipe = await baseRecipeService.createRecipe(data);
					// Cache the new recipe
					await offlineService.cacheRecipes([recipe]);
					return recipe;
				} catch (error) {
					console.warn('Failed to create on server, saving for offline sync:', error);
					// Fall back to offline creation
					return await syncService.createRecipeOffline(data);
				}
			} else {
				// Offline - queue for sync
				return await syncService.createRecipeOffline(data);
			}
		} catch (error) {
			throw new Error(`Failed to create recipe: ${error}`);
		}
	}

	async updateRecipe(data: RecipeUpdateData): Promise<Recipe> {
		try {
			const isOnline = await offlineService.isOnline();
			
			if (isOnline) {
				// Online - update on server
				try {
					const recipe = await baseRecipeService.updateRecipe(data);
					// Update cache
					await offlineService.cacheRecipes([recipe]);
					return recipe;
				} catch (error) {
					console.warn('Failed to update on server, saving for offline sync:', error);
					// Fall back to offline update
					return await syncService.updateRecipeOffline(data);
				}
			} else {
				// Offline - queue for sync
				return await syncService.updateRecipeOffline(data);
			}
		} catch (error) {
			throw new Error(`Failed to update recipe: ${error}`);
		}
	}

	async deleteRecipe(id: string): Promise<void> {
		try {
			const isOnline = await offlineService.isOnline();
			
			if (isOnline) {
				// Online - delete on server
				try {
					await baseRecipeService.deleteRecipe(id);
					// Remove from cache by getting fresh data
					await syncService.syncWithServer(true);
				} catch (error) {
					console.warn('Failed to delete on server, saving for offline sync:', error);
					// Fall back to offline delete
					await syncService.deleteRecipeOffline(id);
				}
			} else {
				// Offline - queue for sync
				await syncService.deleteRecipeOffline(id);
			}
		} catch (error) {
			throw new Error(`Failed to delete recipe: ${error}`);
		}
	}

	async extractRecipeFromUrl(url: string): Promise<RecipeExtractionResponse> {
		// Extraction requires online connection
		const isOnline = await offlineService.isOnline();
		if (!isOnline) {
			throw new Error('Recipe extraction requires internet connection');
		}

		return await baseRecipeService.extractRecipeFromUrl(url);
	}

	async extractRecipeFromImage(imageFile: File): Promise<RecipeExtractionResponse> {
		// Extraction requires online connection
		const isOnline = await offlineService.isOnline();
		if (!isOnline) {
			throw new Error('Recipe extraction requires internet connection');
		}

		return await baseRecipeService.extractRecipeFromImage(imageFile);
	}

	async duplicateRecipe(id: string): Promise<Recipe> {
		try {
			// Get the original recipe (this will use offline cache if needed)
			const original = await this.getRecipe(id);

			const duplicateData: RecipeCreateData = {
				title: `${original.title} (Copy)`,
				description: original.description,
				ingredients: [...original.ingredients],
				instructions: [...original.instructions],
				tags: [...original.tags],
				metadata: { ...original.metadata },
				source: { ...original.source },
				is_published: false
			};

			return await this.createRecipe(duplicateData);
		} catch (error) {
			throw new Error(`Failed to duplicate recipe: ${error}`);
		}
	}

	// Sync-related methods
	async forcSync(): Promise<void> {
		return await syncService.forcSync();
	}

	async getSyncStatus() {
		return await syncService.getSyncStatus();
	}

	onSyncStatusChange(callback: (status: any) => void) {
		return syncService.onSyncStatusChange(callback);
	}

	async clearCache(): Promise<void> {
		return await syncService.clearCache();
	}

	// Check if we have offline data
	async hasOfflineData(): Promise<boolean> {
		try {
			const metadata = await offlineService.getCacheMetadata();
			return metadata !== null && metadata.totalRecipes > 0;
		} catch {
			return false;
		}
	}

	// Get cache info
	async getCacheInfo() {
		return await offlineService.getCacheMetadata();
	}
}

export const enhancedRecipeService = EnhancedRecipeService.getInstance();