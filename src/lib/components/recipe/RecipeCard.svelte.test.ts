import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import RecipeCard from './RecipeCard.svelte';
import type { Recipe } from '$lib/types';

// Mock the stores
vi.mock('$lib/stores', () => ({
  isAdmin: { subscribe: vi.fn() },
  pb: { getFileUrl: vi.fn() }
}));

// Mock the PocketBase file URL function
const mockGetFileUrl = vi.fn();
vi.mocked(mockGetFileUrl).mockReturnValue('https://example.com/image.jpg');

// Sample recipe data
const mockRecipe: Recipe = {
  id: 'recipe-1',
  title: 'Test Recipe',
  description: 'A delicious test recipe',
  image: 'test-image.jpg',
  ingredients: [
    { item: 'Flour', quantity: '2', unit: 'cups', notes: '' }
  ],
  instructions: [
    { step: 1, instruction: 'Mix ingredients', duration: '5 minutes', temperature: '' }
  ],
  tags: ['breakfast', 'easy'],
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

describe('RecipeCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders recipe title and description', () => {
    render(RecipeCard, { props: { recipe: mockRecipe } });
    
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();
  });

  it('displays recipe metadata', () => {
    render(RecipeCard, { props: { recipe: mockRecipe } });
    
    expect(screen.getByText('10 minutes')).toBeInTheDocument(); // prep time
    expect(screen.getByText('Easy')).toBeInTheDocument(); // difficulty
    expect(screen.getByText('4')).toBeInTheDocument(); // servings
  });

  it('shows recipe tags', () => {
    render(RecipeCard, { props: { recipe: mockRecipe } });
    
    expect(screen.getByText('breakfast')).toBeInTheDocument();
    expect(screen.getByText('easy')).toBeInTheDocument();
  });

  it('displays placeholder when no image is provided', () => {
    const recipeWithoutImage = { ...mockRecipe, image: undefined };
    render(RecipeCard, { props: { recipe: recipeWithoutImage } });
    
    // Should show the placeholder SVG
    const placeholderSvg = document.querySelector('svg');
    expect(placeholderSvg).toBeInTheDocument();
  });

  it('shows limited tags in compact mode', () => {
    const recipeWithManyTags = {
      ...mockRecipe,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    };
    
    render(RecipeCard, { props: { recipe: recipeWithManyTags, compact: true } });
    
    // Should only show first 2 tags in compact mode
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument(); // +3 more tags
  });

  it('hides description in compact mode', () => {
    render(RecipeCard, { props: { recipe: mockRecipe, compact: true } });
    
    expect(screen.queryByText('A delicious test recipe')).not.toBeInTheDocument();
  });

  it('creates correct link to recipe detail page', () => {
    render(RecipeCard, { props: { recipe: mockRecipe } });
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/recipes/recipe-1');
  });

  it('displays source type indicator', () => {
    render(RecipeCard, { props: { recipe: mockRecipe } });
    
    // Manual source should show ✍️
    expect(screen.getByText('✍️')).toBeInTheDocument();
  });

  it('shows URL source indicator for URL extraction', () => {
    const urlRecipe = {
      ...mockRecipe,
      source: { type: 'url' as const, extractedBy: 'gemini' }
    };
    
    render(RecipeCard, { props: { recipe: urlRecipe } });
    
    expect(screen.getByText('🔗')).toBeInTheDocument();
  });

  it('shows image source indicator for image extraction', () => {
    const imageRecipe = {
      ...mockRecipe,
      source: { type: 'image' as const, extractedBy: 'gemini' }
    };
    
    render(RecipeCard, { props: { recipe: imageRecipe } });
    
    expect(screen.getByText('📷')).toBeInTheDocument();
  });
});