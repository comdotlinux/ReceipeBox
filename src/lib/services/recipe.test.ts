import { describe, it, expect, beforeEach, vi } from 'vitest';
import { recipeService } from './recipe';
import type { Recipe, RecipeCreateData, RecipeUpdateData } from '$lib/types/recipe';
import { pb } from './pocketbase';

// Mock the pocketbase module
vi.mock('./pocketbase', () => ({
	pb: {
		client: {
			collection: vi.fn(),
			send: vi.fn()
		},
		isAuthenticated: true,
		currentUser: { id: 'user123', role: 'admin' }
	}
}));

describe('RecipeService', () => {
	let mockCollection: any;

	const mockRecipe: Recipe = {
		id: 'test123',
		title: 'Test Recipe',
		description: 'A test recipe description',
		ingredients: [
			{ amount: '2', unit: 'cups', item: 'flour', notes: '' }
		],
		instructions: [
			{ step: 1, instruction: 'Mix ingredients', timeInMinutes: 5 }
		],
		tags: ['test', 'recipe'],
		metadata: {
			prepTimeMinutes: 10,
			cookTimeMinutes: 20,
			servings: 4,
			difficulty: 'easy'
		},
		source: {
			type: 'manual',
			name: 'Test User'
		},
		image: '',
		created_by: 'user123',
		last_modified_by: 'user123',
		is_published: true,
		cache_key: 'test_cache_key',
		created: '2025-01-01',
		updated: '2025-01-01',
		collectionId: 'recipes',
		collectionName: 'recipes'
	};

	beforeEach(() => {
		vi.clearAllMocks();
		
		mockCollection = {
			getList: vi.fn(),
			getOne: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn()
		};

		vi.mocked(pb.client.collection).mockReturnValue(mockCollection);
		pb.isAuthenticated = true;
		pb.currentUser = { id: 'user123', role: 'admin' } as any;
	});

	describe('getRecipes', () => {
		it('should fetch published recipes with default parameters', async () => {
			mockCollection.getList.mockResolvedValue({
				items: [mockRecipe],
				totalItems: 1,
				totalPages: 1,
				page: 1,
				perPage: 20
			});

			const result = await recipeService.getRecipes();

			expect(mockCollection.getList).toHaveBeenCalledWith(1, 20, {
				filter: 'is_published = true',
				sort: '-updated',
				expand: 'created_by,last_modified_by'
			});
			expect(result.items).toHaveLength(1);
		});

		it('should apply search query when provided', async () => {
			mockCollection.getList.mockResolvedValue({
				items: [],
				totalItems: 0,
				totalPages: 0,
				page: 1,
				perPage: 20
			});

			await recipeService.getRecipes({ query: 'pasta' });

			expect(mockCollection.getList).toHaveBeenCalledWith(1, 20, {
				filter: 'is_published = true && (title ~ "pasta" || description ~ "pasta")',
				sort: '-updated',
				expand: 'created_by,last_modified_by'
			});
		});

		it('should apply multiple filters', async () => {
			mockCollection.getList.mockResolvedValue({
				items: [],
				totalItems: 0,
				totalPages: 0,
				page: 1,
				perPage: 20
			});

			await recipeService.getRecipes({ 
				query: 'pasta',
				tags: ['italian', 'quick'],
				difficulty: 'easy'
			});

			expect(mockCollection.getList).toHaveBeenCalledWith(1, 20, {
				filter: expect.stringContaining('is_published = true'),
				sort: '-updated',
				expand: 'created_by,last_modified_by'
			});
		});
	});

	describe('getRecipe', () => {
		it('should fetch a single recipe by ID', async () => {
			mockCollection.getOne.mockResolvedValue(mockRecipe);

			const result = await recipeService.getRecipe('test123');

			expect(mockCollection.getOne).toHaveBeenCalledWith('test123', {
				expand: 'created_by,last_modified_by'
			});
			expect(result).toEqual(mockRecipe);
		});

		it('should throw error when recipe not found', async () => {
			mockCollection.getOne.mockRejectedValue(new Error('Not found'));

			await expect(recipeService.getRecipe('invalid')).rejects.toThrow('Failed to fetch recipe');
		});
	});

	describe('createRecipe', () => {
		it('should create a new recipe for admin users', async () => {
			const newRecipe: RecipeCreateData = {
				title: 'New Recipe',
				description: 'Description',
				ingredients: mockRecipe.ingredients,
				instructions: mockRecipe.instructions,
				tags: mockRecipe.tags,
				metadata: mockRecipe.metadata,
				source: mockRecipe.source,
				is_published: true
			};
			
			mockCollection.create.mockResolvedValue(mockRecipe);

			const result = await recipeService.createRecipe(newRecipe);

			expect(mockCollection.create).toHaveBeenCalled();
			expect(result).toEqual(mockRecipe);
		});

		it('should throw error when non-admin tries to create recipe', async () => {
			pb.currentUser = { id: 'user123', role: 'reader' } as any;
			const newRecipe: RecipeCreateData = {
				title: 'New Recipe',
				ingredients: [],
				instructions: [],
				tags: [],
				metadata: {} as any,
				source: {} as any
			};

			await expect(recipeService.createRecipe(newRecipe)).rejects.toThrow('Only administrators can create recipes');
		});

		it('should throw error when not authenticated', async () => {
			pb.isAuthenticated = false;
			const newRecipe: RecipeCreateData = {
				title: 'New Recipe',
				ingredients: [],
				instructions: [],
				tags: [],
				metadata: {} as any,
				source: {} as any
			};

			await expect(recipeService.createRecipe(newRecipe)).rejects.toThrow('Must be authenticated to create recipes');
		});
	});

	describe('updateRecipe', () => {
		it('should update an existing recipe for admin users', async () => {
			const updates: RecipeUpdateData = { 
				id: 'test123',
				title: 'Updated Recipe' 
			};
			mockCollection.update.mockResolvedValue({ ...mockRecipe, ...updates });

			const result = await recipeService.updateRecipe(updates);

			expect(mockCollection.update).toHaveBeenCalledWith('test123', expect.any(FormData));
			expect(result.title).toBe('Updated Recipe');
		});

		it('should throw error when non-admin tries to update recipe', async () => {
			pb.currentUser = { id: 'user123', role: 'reader' } as any;

			await expect(recipeService.updateRecipe({ id: 'test123' })).rejects.toThrow('Only administrators can update recipes');
		});
	});

	describe('deleteRecipe', () => {
		it('should delete a recipe for admin users', async () => {
			mockCollection.delete.mockResolvedValue(true);

			await recipeService.deleteRecipe('test123');

			expect(mockCollection.delete).toHaveBeenCalledWith('test123');
		});

		it('should throw error when non-admin tries to delete recipe', async () => {
			pb.currentUser = { id: 'user123', role: 'reader' } as any;

			await expect(recipeService.deleteRecipe('test123')).rejects.toThrow('Only administrators can delete recipes');
		});
	});

	describe('duplicateRecipe', () => {
		it('should create a copy of an existing recipe', async () => {
			mockCollection.getOne.mockResolvedValue(mockRecipe);
			mockCollection.create.mockResolvedValue({
				...mockRecipe,
				id: 'copy123',
				title: 'Test Recipe (Copy)',
				is_published: false
			});

			const result = await recipeService.duplicateRecipe('test123');

			expect(mockCollection.getOne).toHaveBeenCalledWith('test123', {
				expand: 'created_by,last_modified_by'
			});
			expect(mockCollection.create).toHaveBeenCalled();
			expect(result.title).toBe('Test Recipe (Copy)');
			expect(result.is_published).toBe(false);
		});
	});

	describe('extractRecipeFromUrl', () => {
		it('should extract recipe from URL for admin users', async () => {
			const mockResponse = {
				success: true,
				recipe: mockRecipe
			};
			vi.mocked(pb.client.send).mockResolvedValue(mockResponse);

			const result = await recipeService.extractRecipeFromUrl('https://example.com/recipe');

			expect(pb.client.send).toHaveBeenCalledWith('/api/extract-recipe-url', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ url: 'https://example.com/recipe' })
			});
			expect(result).toEqual(mockResponse);
		});

		it('should throw error when non-admin tries to extract recipe', async () => {
			pb.currentUser = { id: 'user123', role: 'reader' } as any;

			await expect(recipeService.extractRecipeFromUrl('https://example.com')).rejects.toThrow('Only administrators can extract recipes');
		});
	});

	describe('extractRecipeFromImage', () => {
		it('should extract recipe from image for admin users', async () => {
			const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
			const mockResponse = {
				success: true,
				recipe: mockRecipe
			};
			vi.mocked(pb.client.send).mockResolvedValue(mockResponse);

			const result = await recipeService.extractRecipeFromImage(mockFile);

			expect(pb.client.send).toHaveBeenCalledWith('/api/extract-recipe-image', {
				method: 'POST',
				body: expect.any(FormData)
			});
			expect(result).toEqual(mockResponse);
		});
	});
});