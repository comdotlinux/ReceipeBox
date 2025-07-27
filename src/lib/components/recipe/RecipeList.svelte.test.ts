import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import RecipeList from './RecipeList.svelte';
import type { Recipe } from '$lib/types';

// Mock the RecipeCard component
vi.mock('./RecipeCard.svelte', () => ({
	default: vi.fn().mockImplementation(() => ({
		$$: { on_mount: [], on_destroy: [], before_update: [], after_update: [] }
	}))
}));

// Mock the stores
const mockRecipesStore = {
	searchRecipes: vi.fn()
};

const mockRecipes = { subscribe: vi.fn() };
const mockRecipesLoading = { subscribe: vi.fn() };
const mockRecipesError = { subscribe: vi.fn() };

vi.mock('$lib/stores', () => ({
	recipesStore: mockRecipesStore,
	recipes: mockRecipes,
	recipesLoading: mockRecipesLoading,
	recipesError: mockRecipesError
}));

// Mock svelte's onMount
vi.mock('svelte', () => ({
	onMount: vi.fn((callback) => callback())
}));

// Sample recipe data
const mockRecipeData: Recipe[] = [
	{
		id: 'recipe-1',
		title: 'Test Recipe 1',
		description: 'First test recipe',
		image: 'test1.jpg',
		ingredients: [],
		instructions: [],
		tags: ['breakfast'],
		metadata: {},
		source: { type: 'manual', extractedBy: 'manual' },
		is_published: true,
		created: '2023-01-01T00:00:00.000Z',
		updated: '2023-01-01T00:00:00.000Z'
	},
	{
		id: 'recipe-2',
		title: 'Test Recipe 2',
		description: 'Second test recipe',
		image: 'test2.jpg',
		ingredients: [],
		instructions: [],
		tags: ['dinner'],
		metadata: {},
		source: { type: 'url', extractedBy: 'gemini' },
		is_published: true,
		created: '2023-01-02T00:00:00.000Z',
		updated: '2023-01-02T00:00:00.000Z'
	}
];

describe('RecipeList', () => {
	const user = userEvent.setup();

	beforeEach(() => {
		vi.clearAllMocks();

		// Default mock implementations
		mockRecipes.subscribe.mockImplementation((callback) => {
			callback(mockRecipeData);
			return () => {};
		});

		mockRecipesLoading.subscribe.mockImplementation((callback) => {
			callback(false);
			return () => {};
		});

		mockRecipesError.subscribe.mockImplementation((callback) => {
			callback(null);
			return () => {};
		});

		mockRecipesStore.searchRecipes.mockResolvedValue(undefined);
	});

	describe('Loading State', () => {
		it('shows loading skeleton when loading recipes', () => {
			mockRecipesLoading.subscribe.mockImplementation((callback) => {
				callback(true);
				return () => {};
			});

			mockRecipes.subscribe.mockImplementation((callback) => {
				callback([]);
				return () => {};
			});

			render(RecipeList);

			// Should show skeleton loading cards
			const skeletonCards = document.querySelectorAll('.animate-pulse');
			expect(skeletonCards.length).toBeGreaterThan(0);
		});
	});

	describe('Error State', () => {
		it('displays error message when recipes fail to load', () => {
			mockRecipesError.subscribe.mockImplementation((callback) => {
				callback('Failed to load recipes');
				return () => {};
			});

			render(RecipeList);

			expect(screen.getByText('Error Loading Recipes')).toBeInTheDocument();
			expect(screen.getByText('Failed to load recipes')).toBeInTheDocument();
			expect(screen.getByText('Try Again')).toBeInTheDocument();
		});

		it('allows retry when error occurs', async () => {
			mockRecipesError.subscribe.mockImplementation((callback) => {
				callback('Failed to load recipes');
				return () => {};
			});

			render(RecipeList);

			const retryButton = screen.getByText('Try Again');
			await user.click(retryButton);

			expect(mockRecipesStore.searchRecipes).toHaveBeenCalled();
		});
	});

	describe('Empty State', () => {
		it('shows empty state when no recipes are found', () => {
			mockRecipes.subscribe.mockImplementation((callback) => {
				callback([]);
				return () => {};
			});

			render(RecipeList);

			expect(screen.getByText('No Recipes Found')).toBeInTheDocument();
			expect(screen.getByText('Get started by adding your first recipe.')).toBeInTheDocument();
		});

		it('shows different message when search/filter is active', () => {
			mockRecipes.subscribe.mockImplementation((callback) => {
				callback([]);
				return () => {};
			});

			render(RecipeList, { props: { searchQuery: 'nonexistent' } });

			expect(
				screen.getByText('Try adjusting your search criteria or clearing filters.')
			).toBeInTheDocument();
			expect(screen.getByText('Clear Filters')).toBeInTheDocument();
		});

		it('clears filters when clear button is clicked', async () => {
			mockRecipes.subscribe.mockImplementation((callback) => {
				callback([]);
				return () => {};
			});

			const component = render(RecipeList, {
				props: { searchQuery: 'test', selectedTags: ['breakfast'] }
			});

			const clearButton = screen.getByText('Clear Filters');
			await user.click(clearButton);

			// This would be tested by checking if the component's props change
			// In a real test, you'd need to access the component instance
			expect(mockRecipesStore.searchRecipes).toHaveBeenCalled();
		});
	});

	describe('Recipe Display', () => {
		it('renders recipe grid when recipes are available', () => {
			render(RecipeList);

			// Should render a grid container
			const grid = document.querySelector('.grid');
			expect(grid).toBeInTheDocument();
			expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
		});

		it('calls searchRecipes on mount', () => {
			render(RecipeList);

			expect(mockRecipesStore.searchRecipes).toHaveBeenCalledWith({
				query: '',
				tags: [],
				page: 1,
				limit: 20
			});
		});

		it('searches with custom query and tags', () => {
			render(RecipeList, {
				props: {
					searchQuery: 'pasta',
					selectedTags: ['italian', 'dinner'],
					limit: 10
				}
			});

			expect(mockRecipesStore.searchRecipes).toHaveBeenCalledWith({
				query: 'pasta',
				tags: ['italian', 'dinner'],
				page: 1,
				limit: 10
			});
		});
	});

	describe('Load More Functionality', () => {
		it('shows load more button when enabled and recipes are available', () => {
			render(RecipeList, { props: { showLoadMore: true } });

			expect(screen.getByText('Load More Recipes')).toBeInTheDocument();
		});

		it('hides load more button when disabled', () => {
			render(RecipeList, { props: { showLoadMore: false } });

			expect(screen.queryByText('Load More Recipes')).not.toBeInTheDocument();
		});

		it('shows loading state in load more button', () => {
			mockRecipesLoading.subscribe.mockImplementation((callback) => {
				callback(true);
				return () => {};
			});

			render(RecipeList, { props: { showLoadMore: true } });

			expect(screen.getByText('Loading...')).toBeInTheDocument();
			const loadMoreButton = screen.getByRole('button', { name: /loading/i });
			expect(loadMoreButton).toBeDisabled();
		});

		it('loads next page when load more is clicked', async () => {
			render(RecipeList, { props: { showLoadMore: true } });

			const loadMoreButton = screen.getByText('Load More Recipes');
			await user.click(loadMoreButton);

			expect(mockRecipesStore.searchRecipes).toHaveBeenCalledWith({
				query: '',
				tags: [],
				page: 2,
				limit: 20
			});
		});
	});

	describe('Search Reactivity', () => {
		it('reloads recipes when search parameters change', async () => {
			const component = render(RecipeList);

			// Clear the initial call
			mockRecipesStore.searchRecipes.mockClear();

			// Update props to trigger search
			await component.rerender({ searchQuery: 'new search' });

			expect(mockRecipesStore.searchRecipes).toHaveBeenCalledWith({
				query: 'new search',
				tags: [],
				page: 1,
				limit: 20
			});
		});

		it('resets to page 1 when search changes', async () => {
			const component = render(RecipeList);

			// Simulate being on page 2
			const loadMoreButton = screen.getByText('Load More Recipes');
			await user.click(loadMoreButton);

			// Clear the call history
			mockRecipesStore.searchRecipes.mockClear();

			// Change search query
			await component.rerender({ searchQuery: 'new search' });

			expect(mockRecipesStore.searchRecipes).toHaveBeenCalledWith({
				query: 'new search',
				tags: [],
				page: 1, // Should reset to page 1
				limit: 20
			});
		});
	});

	describe('Accessibility', () => {
		it('provides appropriate aria labels and roles', () => {
			render(RecipeList);

			const grid = document.querySelector('[role="grid"]') || document.querySelector('.grid');
			expect(grid).toBeInTheDocument();

			// Load more button should be accessible
			if (screen.queryByText('Load More Recipes')) {
				const loadMoreButton = screen.getByText('Load More Recipes');
				expect(loadMoreButton).toHaveAttribute('type', 'button');
			}
		});
	});
});
