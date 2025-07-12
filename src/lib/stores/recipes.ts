import { writable, derived } from 'svelte/store';
import { recipeService } from '$lib/services';
import type { Recipe, RecipeSearchParams, RecipeListResponse } from '$lib/types';

export const recipes = writable<Recipe[]>([]);
export const currentRecipe = writable<Recipe | null>(null);
export const recipesLoading = writable(false);
export const recipesError = writable<string | null>(null);

export const searchParams = writable<RecipeSearchParams>({
  query: '',
  tags: [],
  page: 1,
  limit: 20
});

export const searchResults = writable<RecipeListResponse | null>(null);
export const searchLoading = writable(false);

export const extractionLoading = writable(false);
export const extractionError = writable<string | null>(null);

class RecipesStore {
  async loadRecipes(params: RecipeSearchParams = {}): Promise<void> {
    try {
      recipesLoading.set(true);
      recipesError.set(null);

      const response = await recipeService.getRecipes(params);
      
      if (params.page === 1) {
        recipes.set(response.items);
      } else {
        // Append to existing recipes for pagination
        recipes.update(existing => [...existing, ...response.items]);
      }

      searchResults.set(response);
    } catch (error) {
      recipesError.set(error instanceof Error ? error.message : 'Failed to load recipes');
    } finally {
      recipesLoading.set(false);
    }
  }

  async loadRecipe(id: string): Promise<void> {
    try {
      recipesLoading.set(true);
      recipesError.set(null);

      const recipe = await recipeService.getRecipe(id);
      currentRecipe.set(recipe);
    } catch (error) {
      recipesError.set(error instanceof Error ? error.message : 'Failed to load recipe');
      throw error; // Re-throw to allow page component to handle
    } finally {
      recipesLoading.set(false);
    }
  }

  async searchRecipes(params: RecipeSearchParams): Promise<void> {
    try {
      searchLoading.set(true);
      searchParams.set(params);

      const response = await recipeService.getRecipes(params);
      searchResults.set(response);
      recipes.set(response.items);
    } catch (error) {
      recipesError.set(error instanceof Error ? error.message : 'Search failed');
    } finally {
      searchLoading.set(false);
    }
  }

  async createRecipe(data: any): Promise<Recipe> {
    try {
      recipesLoading.set(true);
      recipesError.set(null);

      const recipe = await recipeService.createRecipe(data);
      
      // Add to the beginning of the list
      recipes.update(existing => [recipe, ...existing]);
      
      return recipe;
    } catch (error) {
      recipesError.set(error instanceof Error ? error.message : 'Failed to create recipe');
      throw error;
    } finally {
      recipesLoading.set(false);
    }
  }

  async updateRecipe(data: any): Promise<Recipe> {
    try {
      recipesLoading.set(true);
      recipesError.set(null);

      const recipe = await recipeService.updateRecipe(data);
      
      // Update in the list
      recipes.update(existing => 
        existing.map(r => r.id === recipe.id ? recipe : r)
      );
      
      // Update current recipe if it's the same
      currentRecipe.update(current => 
        current?.id === recipe.id ? recipe : current
      );
      
      return recipe;
    } catch (error) {
      recipesError.set(error instanceof Error ? error.message : 'Failed to update recipe');
      throw error;
    } finally {
      recipesLoading.set(false);
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      recipesLoading.set(true);
      recipesError.set(null);

      await recipeService.deleteRecipe(id);
      
      // Remove from the list
      recipes.update(existing => existing.filter(r => r.id !== id));
      
      // Clear current recipe if it's the deleted one
      currentRecipe.update(current => 
        current?.id === id ? null : current
      );
    } catch (error) {
      recipesError.set(error instanceof Error ? error.message : 'Failed to delete recipe');
      throw error;
    } finally {
      recipesLoading.set(false);
    }
  }

  async extractFromUrl(url: string): Promise<any> {
    try {
      extractionLoading.set(true);
      extractionError.set(null);

      const extracted = await recipeService.extractRecipeFromUrl(url);
      return extracted;
    } catch (error) {
      extractionError.set(error instanceof Error ? error.message : 'Failed to extract recipe from URL');
      throw error;
    } finally {
      extractionLoading.set(false);
    }
  }

  async extractFromImage(imageFile: File): Promise<any> {
    try {
      extractionLoading.set(true);
      extractionError.set(null);

      const extracted = await recipeService.extractRecipeFromImage(imageFile);
      return extracted;
    } catch (error) {
      extractionError.set(error instanceof Error ? error.message : 'Failed to extract recipe from image');
      throw error;
    } finally {
      extractionLoading.set(false);
    }
  }

  async duplicateRecipe(id: string): Promise<Recipe> {
    try {
      recipesLoading.set(true);
      recipesError.set(null);

      const recipe = await recipeService.duplicateRecipe(id);
      
      // Add to the beginning of the list
      recipes.update(existing => [recipe, ...existing]);
      
      return recipe;
    } catch (error) {
      recipesError.set(error instanceof Error ? error.message : 'Failed to duplicate recipe');
      throw error;
    } finally {
      recipesLoading.set(false);
    }
  }

  clearError(): void {
    recipesError.set(null);
    extractionError.set(null);
  }

  clearCurrentRecipe(): void {
    currentRecipe.set(null);
  }
}

export const recipesStore = new RecipesStore();

// Derived stores
export const featuredRecipes = derived(recipes, ($recipes) => 
  $recipes.slice(0, 6)
);

export const totalRecipes = derived(searchResults, ($searchResults) => 
  $searchResults?.totalItems || 0
);

export const hasMoreRecipes = derived(
  [searchResults, recipes],
  ([$searchResults, $recipes]) => {
    if (!$searchResults) return false;
    return $recipes.length < $searchResults.totalItems;
  }
);