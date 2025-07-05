import { pb } from './pocketbase';
import type { 
  Recipe, 
  RecipeCreateData, 
  RecipeUpdateData, 
  RecipeListResponse, 
  RecipeSearchParams,
  RecipeExtractionRequest,
  RecipeExtractionResponse 
} from '$lib/types';

export class RecipeService {
  private static instance: RecipeService;

  public static getInstance(): RecipeService {
    if (!RecipeService.instance) {
      RecipeService.instance = new RecipeService();
    }
    return RecipeService.instance;
  }

  async getRecipes(params: RecipeSearchParams = {}): Promise<RecipeListResponse> {
    try {
      const { page = 1, limit = 20, query, tags, cuisine, difficulty, dietary } = params;
      
      let filter = 'is_published = true';
      const filterParts: string[] = [filter];

      if (query) {
        filterParts.push(`(title ~ "${query}" || description ~ "${query}")`);
      }

      if (tags && tags.length > 0) {
        const tagFilters = tags.map(tag => `tags ~ "${tag}"`).join(' && ');
        filterParts.push(`(${tagFilters})`);
      }

      if (cuisine) {
        filterParts.push(`metadata.cuisine = "${cuisine}"`);
      }

      if (difficulty) {
        filterParts.push(`metadata.difficulty = "${difficulty}"`);
      }

      if (dietary && dietary.length > 0) {
        const dietaryFilters = dietary.map(diet => `metadata.dietary ~ "${diet}"`).join(' || ');
        filterParts.push(`(${dietaryFilters})`);
      }

      const finalFilter = filterParts.join(' && ');

      const result = await pb.client.collection('recipes').getList(page, limit, {
        filter: finalFilter,
        sort: '-updated',
        expand: 'created_by,last_modified_by'
      });

      return {
        page: result.page,
        perPage: result.perPage,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        items: result.items as Recipe[]
      };
    } catch (error) {
      throw new Error(`Failed to fetch recipes: ${error}`);
    }
  }

  async getRecipe(id: string): Promise<Recipe> {
    try {
      const result = await pb.client.collection('recipes').getOne(id, {
        expand: 'created_by,last_modified_by'
      });
      return result as Recipe;
    } catch (error) {
      throw new Error(`Failed to fetch recipe: ${error}`);
    }
  }

  async createRecipe(data: RecipeCreateData): Promise<Recipe> {
    try {
      if (!pb.isAuthenticated) {
        throw new Error('Must be authenticated to create recipes');
      }

      if (pb.currentUser?.role !== 'admin') {
        throw new Error('Only administrators can create recipes');
      }

      const formData = new FormData();
      
      // Handle image upload
      if (data.image instanceof File) {
        formData.append('image', data.image);
      } else if (typeof data.image === 'string') {
        formData.append('image', data.image);
      }

      // Add other fields
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('ingredients', JSON.stringify(data.ingredients));
      formData.append('instructions', JSON.stringify(data.instructions));
      formData.append('tags', JSON.stringify(data.tags));
      formData.append('metadata', JSON.stringify(data.metadata));
      formData.append('source', JSON.stringify(data.source));
      formData.append('created_by', pb.currentUser.id);
      formData.append('last_modified_by', pb.currentUser.id);
      formData.append('is_published', String(data.is_published ?? false));

      // Generate cache key
      const cacheKey = this.generateCacheKey(data);
      formData.append('cache_key', cacheKey);

      const result = await pb.client.collection('recipes').create(formData);
      return result as Recipe;
    } catch (error) {
      throw new Error(`Failed to create recipe: ${error}`);
    }
  }

  async updateRecipe(data: RecipeUpdateData): Promise<Recipe> {
    try {
      if (!pb.isAuthenticated) {
        throw new Error('Must be authenticated to update recipes');
      }

      if (pb.currentUser?.role !== 'admin') {
        throw new Error('Only administrators can update recipes');
      }

      const formData = new FormData();
      
      // Handle image upload
      if (data.image instanceof File) {
        formData.append('image', data.image);
      } else if (typeof data.image === 'string') {
        formData.append('image', data.image);
      }

      // Add updated fields
      if (data.title) formData.append('title', data.title);
      if (data.description !== undefined) formData.append('description', data.description);
      if (data.ingredients) formData.append('ingredients', JSON.stringify(data.ingredients));
      if (data.instructions) formData.append('instructions', JSON.stringify(data.instructions));
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));
      if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));
      if (data.source) formData.append('source', JSON.stringify(data.source));
      if (data.is_published !== undefined) formData.append('is_published', String(data.is_published));
      
      formData.append('last_modified_by', pb.currentUser.id);

      // Update cache key
      if (data.title || data.ingredients || data.instructions) {
        const cacheKey = this.generateCacheKey(data as RecipeCreateData);
        formData.append('cache_key', cacheKey);
      }

      const result = await pb.client.collection('recipes').update(data.id, formData);
      return result as Recipe;
    } catch (error) {
      throw new Error(`Failed to update recipe: ${error}`);
    }
  }

  async deleteRecipe(id: string): Promise<void> {
    try {
      if (!pb.isAuthenticated) {
        throw new Error('Must be authenticated to delete recipes');
      }

      if (pb.currentUser?.role !== 'admin') {
        throw new Error('Only administrators can delete recipes');
      }

      await pb.client.collection('recipes').delete(id);
    } catch (error) {
      throw new Error(`Failed to delete recipe: ${error}`);
    }
  }

  async extractRecipeFromUrl(url: string): Promise<RecipeExtractionResponse> {
    try {
      if (!pb.isAuthenticated) {
        throw new Error('Must be authenticated to extract recipes');
      }

      if (pb.currentUser?.role !== 'admin') {
        throw new Error('Only administrators can extract recipes');
      }

      const response = await pb.client.send('/api/extract-recipe-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      return response as RecipeExtractionResponse;
    } catch (error) {
      throw new Error(`Failed to extract recipe from URL: ${error}`);
    }
  }

  async extractRecipeFromImage(imageFile: File): Promise<RecipeExtractionResponse> {
    try {
      if (!pb.isAuthenticated) {
        throw new Error('Must be authenticated to extract recipes');
      }

      if (pb.currentUser?.role !== 'admin') {
        throw new Error('Only administrators can extract recipes');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await pb.client.send('/api/extract-recipe-image', {
        method: 'POST',
        body: formData
      });

      return response as RecipeExtractionResponse;
    } catch (error) {
      throw new Error(`Failed to extract recipe from image: ${error}`);
    }
  }

  async duplicateRecipe(id: string): Promise<Recipe> {
    try {
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

  private generateCacheKey(data: Partial<RecipeCreateData>): string {
    const content = JSON.stringify({
      title: data.title,
      ingredients: data.ingredients,
      instructions: data.instructions
    });
    return btoa(content).slice(0, 32);
  }
}

export const recipeService = RecipeService.getInstance();