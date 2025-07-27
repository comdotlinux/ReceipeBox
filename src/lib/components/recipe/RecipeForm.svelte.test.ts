import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import RecipeForm from './RecipeForm.svelte';
import type { Recipe } from '$lib/types';

// Mock the stores
const mockRecipesStore = {
	createRecipe: vi.fn(),
	updateRecipe: vi.fn()
};

const mockRecipesLoading = { subscribe: vi.fn() };
const mockRecipesError = { subscribe: vi.fn() };

vi.mock('$lib/stores', () => ({
	recipesStore: mockRecipesStore,
	recipesLoading: mockRecipesLoading,
	recipesError: mockRecipesError
}));

// Mock navigation
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({
	goto: mockGoto
}));

// Sample recipe data for edit mode
const mockRecipe: Recipe = {
	id: 'recipe-1',
	title: 'Test Recipe',
	description: 'A test recipe',
	image: 'test-image.jpg',
	ingredients: [{ item: 'Flour', quantity: '2', unit: 'cups', notes: 'all-purpose' }],
	instructions: [
		{ step: 1, instruction: 'Mix ingredients', duration: '5 minutes', temperature: '350°F' }
	],
	tags: ['breakfast'],
	metadata: {
		servings: '4',
		prepTime: '10 minutes',
		cookTime: '20 minutes',
		difficulty: 'Easy',
		cuisine: 'American',
		dietary: ['vegetarian']
	},
	source: {
		type: 'manual',
		extractedBy: 'manual'
	},
	is_published: true,
	created: '2023-01-01T00:00:00.000Z',
	updated: '2023-01-01T00:00:00.000Z'
};

describe('RecipeForm', () => {
	const user = userEvent.setup();

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock store subscriptions
		mockRecipesLoading.subscribe.mockImplementation((callback) => {
			callback(false);
			return () => {};
		});

		mockRecipesError.subscribe.mockImplementation((callback) => {
			callback(null);
			return () => {};
		});
	});

	describe('Create Mode', () => {
		it('renders create form with default values', () => {
			render(RecipeForm, { props: { mode: 'create' } });

			expect(screen.getByText('Create New Recipe')).toBeInTheDocument();
			expect(screen.getByDisplayValue('')).toBeInTheDocument(); // empty title input
			expect(screen.getByText('Create Recipe')).toBeInTheDocument(); // submit button
		});

		it('shows validation errors for required fields', async () => {
			render(RecipeForm, { props: { mode: 'create' } });

			const submitButton = screen.getByText('Create Recipe');
			await user.click(submitButton);

			expect(screen.getByText('Title is required')).toBeInTheDocument();
			expect(screen.getByText('At least one ingredient is required')).toBeInTheDocument();
			expect(screen.getByText('At least one instruction is required')).toBeInTheDocument();
		});

		it('allows adding and removing ingredients', async () => {
			render(RecipeForm, { props: { mode: 'create' } });

			// Initially has one empty ingredient
			expect(screen.getAllByPlaceholderText('Ingredient name')).toHaveLength(1);

			// Add ingredient
			const addButton = screen.getByText('Add Ingredient');
			await user.click(addButton);

			expect(screen.getAllByPlaceholderText('Ingredient name')).toHaveLength(2);

			// Remove ingredient (second one, first one is disabled when it's the only one)
			const removeButtons = screen.getAllByLabelText(/delete/i);
			if (removeButtons.length > 1) {
				await user.click(removeButtons[1]);
				expect(screen.getAllByPlaceholderText('Ingredient name')).toHaveLength(1);
			}
		});

		it('allows adding and removing instructions', async () => {
			render(RecipeForm, { props: { mode: 'create' } });

			// Initially has one empty instruction
			expect(screen.getAllByPlaceholderText('Describe this step in detail...')).toHaveLength(1);

			// Add instruction
			const addButton = screen.getByText('Add Step');
			await user.click(addButton);

			expect(screen.getAllByPlaceholderText('Describe this step in detail...')).toHaveLength(2);
			expect(screen.getByText('Step 2')).toBeInTheDocument();
		});

		it('manages tags correctly', async () => {
			render(RecipeForm, { props: { mode: 'create' } });

			const tagInput = screen.getByPlaceholderText('Add a tag and press Enter');

			// Add tag by typing and pressing Enter
			await user.type(tagInput, 'breakfast');
			await user.keyboard('{Enter}');

			expect(screen.getByText('breakfast')).toBeInTheDocument();
			expect(tagInput).toHaveValue('');

			// Remove tag
			const removeTagButton = screen.getByText('×');
			await user.click(removeTagButton);

			expect(screen.queryByText('breakfast')).not.toBeInTheDocument();
		});

		it('handles dietary options', async () => {
			render(RecipeForm, { props: { mode: 'create' } });

			const vegetarianCheckbox = screen.getByLabelText('Vegetarian');
			await user.click(vegetarianCheckbox);

			expect(vegetarianCheckbox).toBeChecked();
		});

		it('submits form with valid data', async () => {
			mockRecipesStore.createRecipe.mockResolvedValue({ id: 'new-recipe-id' });

			render(RecipeForm, { props: { mode: 'create' } });

			// Fill required fields
			await user.type(screen.getByLabelText(/Recipe Title/), 'New Recipe');
			await user.type(screen.getByPlaceholderText('Ingredient name'), 'Flour');
			await user.type(screen.getByPlaceholderText('Describe this step in detail...'), 'Mix well');

			const submitButton = screen.getByText('Create Recipe');
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockRecipesStore.createRecipe).toHaveBeenCalledWith({
					title: 'New Recipe',
					description: undefined,
					image: undefined,
					ingredients: [{ item: 'Flour', quantity: '', unit: '', notes: '' }],
					instructions: [{ step: 1, instruction: 'Mix well', duration: '', temperature: '' }],
					tags: [],
					metadata: {
						servings: undefined,
						prepTime: undefined,
						cookTime: undefined,
						difficulty: 'Easy',
						cuisine: undefined,
						dietary: undefined
					},
					source: {
						type: 'manual',
						extractedBy: 'manual'
					},
					is_published: true
				});
			});

			expect(mockGoto).toHaveBeenCalledWith('/recipes/new-recipe-id');
		});
	});

	describe('Edit Mode', () => {
		it('renders edit form with recipe data', () => {
			render(RecipeForm, { props: { recipe: mockRecipe, mode: 'edit' } });

			expect(screen.getByText('Edit Recipe')).toBeInTheDocument();
			expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
			expect(screen.getByDisplayValue('A test recipe')).toBeInTheDocument();
			expect(screen.getByText('Update Recipe')).toBeInTheDocument();
		});

		it('populates form fields with recipe data', () => {
			render(RecipeForm, { props: { recipe: mockRecipe, mode: 'edit' } });

			// Check ingredients
			expect(screen.getByDisplayValue('Flour')).toBeInTheDocument();
			expect(screen.getByDisplayValue('2')).toBeInTheDocument();
			expect(screen.getByDisplayValue('cups')).toBeInTheDocument();
			expect(screen.getByDisplayValue('all-purpose')).toBeInTheDocument();

			// Check instructions
			expect(screen.getByDisplayValue('Mix ingredients')).toBeInTheDocument();
			expect(screen.getByDisplayValue('5 minutes')).toBeInTheDocument();
			expect(screen.getByDisplayValue('350°F')).toBeInTheDocument();

			// Check metadata
			expect(screen.getByDisplayValue('4')).toBeInTheDocument(); // servings
			expect(screen.getByDisplayValue('10 minutes')).toBeInTheDocument(); // prep time
			expect(screen.getByDisplayValue('Easy')).toBeInTheDocument(); // difficulty

			// Check tags
			expect(screen.getByText('breakfast')).toBeInTheDocument();

			// Check dietary
			expect(screen.getByLabelText('Vegetarian')).toBeChecked();
		});

		it('submits updated recipe data', async () => {
			mockRecipesStore.updateRecipe.mockResolvedValue({ id: 'recipe-1' });

			render(RecipeForm, { props: { recipe: mockRecipe, mode: 'edit' } });

			// Modify title
			const titleInput = screen.getByDisplayValue('Test Recipe');
			await user.clear(titleInput);
			await user.type(titleInput, 'Updated Recipe');

			const submitButton = screen.getByText('Update Recipe');
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockRecipesStore.updateRecipe).toHaveBeenCalledWith(
					expect.objectContaining({
						id: 'recipe-1',
						title: 'Updated Recipe'
					})
				);
			});

			expect(mockGoto).toHaveBeenCalledWith('/recipes/recipe-1');
		});
	});

	describe('Image Handling', () => {
		it('validates image file type', async () => {
			render(RecipeForm, { props: { mode: 'create' } });

			const fileInput = screen.getByLabelText(/Recipe Image/);
			const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

			await user.upload(fileInput, invalidFile);

			expect(screen.getByText('Please select an image file')).toBeInTheDocument();
		});

		it('validates image file size', async () => {
			render(RecipeForm, { props: { mode: 'create' } });

			const fileInput = screen.getByLabelText(/Recipe Image/);
			// Create a file larger than 10MB
			const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
				type: 'image/jpeg'
			});

			await user.upload(fileInput, largeFile);

			expect(screen.getByText('Image must be smaller than 10MB')).toBeInTheDocument();
		});
	});

	describe('Loading and Error States', () => {
		it('shows loading state during submission', () => {
			mockRecipesLoading.subscribe.mockImplementation((callback) => {
				callback(true);
				return () => {};
			});

			render(RecipeForm, { props: { mode: 'create' } });

			expect(screen.getByText('Saving...')).toBeInTheDocument();
			expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
		});

		it('displays error message when submission fails', () => {
			mockRecipesError.subscribe.mockImplementation((callback) => {
				callback('Failed to save recipe');
				return () => {};
			});

			render(RecipeForm, { props: { mode: 'create' } });

			expect(screen.getByText('Error saving recipe')).toBeInTheDocument();
			expect(screen.getByText('Failed to save recipe')).toBeInTheDocument();
		});
	});
});
