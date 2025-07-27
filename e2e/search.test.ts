import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, deleteTestUser, createAndLoginTestUser } from './helpers/auth';

test.describe('Search and Filtering', () => {
	test('search page is accessible to authenticated users', async ({ page }) => {
		const user = await createTestUser('reader');
		
		try {
			await loginUser(page, user.email, user.password);
			
			// Navigate to search page via nav link (use exact match to avoid conflicts)
			await page.getByRole('link', { name: 'Search', exact: true }).click();
			await page.waitForURL('/search');
			
			// Verify search page elements
			await expect(page.locator('h1')).toContainText('Search Recipes');
			await expect(page.getByTestId('advanced-search-input')).toBeVisible();
			await expect(page.getByText('Show Filters')).toBeVisible();
		} finally {
			await deleteTestUser(user.email);
		}
	});

	test('search page shows appropriate content for unauthenticated users', async ({ page }) => {
		await page.goto('/search');
		
		// Should show sign in prompt
		await expect(page.locator('h1')).toContainText('Search Recipes');
		await expect(page.getByText('Sign in to access our advanced recipe search')).toBeVisible();
		await expect(page.getByText('Sign In to Search')).toBeVisible();
	});

	test('basic text search functionality works', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			
			// First create a test recipe to search for
			await page.goto('/admin/recipes/new');
			const uniqueTitle = `Searchable Pasta Recipe ${Date.now()}`;
			
			await page.fill('input[placeholder="Enter recipe title"]', uniqueTitle);
			await page.fill('textarea[placeholder="Brief description of the recipe..."]', 'Delicious pasta with tomato sauce');
			await page.fill('input[placeholder="Ingredient name"]', 'Pasta');
			await page.fill('textarea[placeholder="Describe this step in detail..."]', 'Cook the pasta');
			
			// Make it published
			await page.getByLabel('Publish this recipe (make it visible to all users)').check();
			
			await page.click('button:has-text("Create Recipe")');
			await page.waitForURL(/\/recipes\/.+/);
			
			// Now search for it
			await page.goto('/search');
			await page.waitForSelector('[data-testid="advanced-search-input"]', { timeout: 10000 });
			await page.getByTestId('advanced-search-input').fill('Pasta');
			
			// Wait for search results with a more reasonable timeout
			await page.waitForTimeout(1000); // Give reactive search time to update
			
			// Should find the recipe
			await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 });
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('advanced filters can be toggled', async ({ page }) => {
		const user = await createTestUser('reader');
		
		try {
			await loginUser(page, user.email, user.password);
			await page.goto('/search');
			
			// Initially filters should be hidden
			await expect(page.getByText('Quick Tags')).not.toBeVisible();
			
			// Show filters
			await page.getByText('Show Filters').click();
			
			// Now filters should be visible
			await expect(page.getByText('Quick Tags')).toBeVisible();
			await expect(page.getByTestId('cuisine-filter')).toBeVisible();
			await expect(page.getByTestId('difficulty-filter')).toBeVisible();
			await expect(page.getByText('Dietary Preferences')).toBeVisible();
			
			// Toggle text should change
			await expect(page.getByText('Hide Filters')).toBeVisible();
		} finally {
			await deleteTestUser(user.email);
		}
	});

	test('tag filtering works correctly', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			
			// Create a recipe with specific tags
			await page.goto('/admin/recipes/new');
			const uniqueTitle = `Tagged Recipe ${Date.now()}`;
			
			await page.fill('input[placeholder="Enter recipe title"]', uniqueTitle);
			await page.fill('input[placeholder="Ingredient name"]', 'Test Ingredient');
			await page.fill('textarea[placeholder="Describe this step in detail..."]', 'Test instruction');
			
			// Add tags
			await page.fill('input[placeholder="Add tags (press Enter)"]', 'Quick');
			await page.keyboard.press('Enter');
			await page.fill('input[placeholder="Add tags (press Enter)"]', 'Healthy');
			await page.keyboard.press('Enter');
			
			// Make it published
			await page.getByLabel('Publish this recipe (make it visible to all users)').check();
			
			await page.click('button:has-text("Create Recipe")');
			await page.waitForURL(/\/recipes\/.+/);
			
			// Search with tag filter
			await page.goto('/search');
			await page.getByText('Show Filters').click();
			
			// Click on Quick tag
			await page.getByTestId('tag-filter-quick').click();
			
			// Should find the recipe
			await page.waitForTimeout(1000); // Give reactive search time to update
			await expect(page.getByText(uniqueTitle)).toBeVisible();
			
			// Clear tag and search for non-existent tag
			await page.getByTestId('tag-filter-quick').click(); // Deselect
			await page.getByTestId('tag-filter-dessert').click();
			
			// Should not find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).not.toBeVisible();
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('cuisine filter works correctly', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			
			// Create an Italian recipe
			await page.goto('/admin/recipes/new');
			const uniqueTitle = `Italian Recipe ${Date.now()}`;
			
			await page.fill('input[placeholder="Enter recipe title"]', uniqueTitle);
			await page.fill('input[placeholder="Ingredient name"]', 'Pasta');
			await page.fill('textarea[placeholder="Describe this step in detail..."]', 'Cook pasta');
			
			// Set cuisine
			await page.getByLabel('Cuisine').selectOption('Italian');
			
			// Make it published
			await page.getByLabel('Publish this recipe (make it visible to all users)').check();
			
			await page.click('button:has-text("Create Recipe")');
			await page.waitForURL(/\/recipes\/.+/);
			
			// Search with cuisine filter
			await page.goto('/search');
			await page.getByText('Show Filters').click();
			
			// Select Italian cuisine
			await page.getByTestId('cuisine-filter').selectOption('Italian');
			
			// Should find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).toBeVisible();
			
			// Change to different cuisine
			await page.getByTestId('cuisine-filter').selectOption('Mexican');
			
			// Should not find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).not.toBeVisible();
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('difficulty filter works correctly', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			
			// Create an easy recipe
			await page.goto('/admin/recipes/new');
			const uniqueTitle = `Easy Recipe ${Date.now()}`;
			
			await page.fill('input[placeholder="Enter recipe title"]', uniqueTitle);
			await page.fill('input[placeholder="Ingredient name"]', 'Simple Ingredient');
			await page.fill('textarea[placeholder="Describe this step in detail..."]', 'Simple step');
			
			// Set difficulty
			await page.getByLabel('Difficulty').selectOption('Easy');
			
			// Make it published
			await page.getByLabel('Publish this recipe (make it visible to all users)').check();
			
			await page.click('button:has-text("Create Recipe")');
			await page.waitForURL(/\/recipes\/.+/);
			
			// Search with difficulty filter
			await page.goto('/search');
			await page.getByText('Show Filters').click();
			
			// Select Easy difficulty
			await page.getByTestId('difficulty-filter').selectOption('Easy');
			
			// Should find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).toBeVisible();
			
			// Change to different difficulty
			await page.getByTestId('difficulty-filter').selectOption('Hard');
			
			// Should not find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).not.toBeVisible();
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('dietary filter works correctly', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			
			// Create a vegetarian recipe
			await page.goto('/admin/recipes/new');
			const uniqueTitle = `Vegetarian Recipe ${Date.now()}`;
			
			await page.fill('input[placeholder="Enter recipe title"]', uniqueTitle);
			await page.fill('input[placeholder="Ingredient name"]', 'Vegetables');
			await page.fill('textarea[placeholder="Describe this step in detail..."]', 'Cook vegetables');
			
			// Check dietary options
			await page.getByLabel('Vegetarian').check();
			await page.getByLabel('Gluten-Free').check();
			
			// Make it published
			await page.getByLabel('Publish this recipe (make it visible to all users)').check();
			
			await page.click('button:has-text("Create Recipe")');
			await page.waitForURL(/\/recipes\/.+/);
			
			// Search with dietary filter
			await page.goto('/search');
			await page.getByText('Show Filters').click();
			
			// Select Vegetarian
			await page.getByTestId('dietary-filter-vegetarian').check();
			
			// Should find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).toBeVisible();
			
			// Also works with Gluten-Free
			await page.getByTestId('dietary-filter-vegetarian').uncheck();
			await page.getByTestId('dietary-filter-gluten-free').check();
			
			// Should still find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).toBeVisible();
			
			// But not with Vegan
			await page.getByTestId('dietary-filter-gluten-free').uncheck();
			await page.getByTestId('dietary-filter-vegan').check();
			
			// Should not find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).not.toBeVisible();
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('multiple filters work together', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			
			// Create a specific recipe
			await page.goto('/admin/recipes/new');
			const uniqueTitle = `Multi-Filter Recipe ${Date.now()}`;
			
			await page.fill('input[placeholder="Enter recipe title"]', uniqueTitle);
			await page.fill('textarea[placeholder="Brief description of the recipe..."]', 'Pasta dish for testing');
			await page.fill('input[placeholder="Ingredient name"]', 'Pasta');
			await page.fill('textarea[placeholder="Describe this step in detail..."]', 'Cook pasta');
			
			// Set multiple attributes
			await page.getByLabel('Cuisine').selectOption('Italian');
			await page.getByLabel('Difficulty').selectOption('Easy');
			await page.getByLabel('Vegetarian').check();
			
			// Add tags
			await page.fill('input[placeholder="Add tags (press Enter)"]', 'Quick');
			await page.keyboard.press('Enter');
			
			// Make it published
			await page.getByLabel('Publish this recipe (make it visible to all users)').check();
			
			await page.click('button:has-text("Create Recipe")');
			await page.waitForURL(/\/recipes\/.+/);
			
			// Search with multiple filters
			await page.goto('/search');
			await page.getByText('Show Filters').click();
			
			// Apply all matching filters
			await page.getByTestId('advanced-search-input').fill('Pasta');
			await page.getByTestId('tag-filter-quick').click();
			await page.getByTestId('cuisine-filter').selectOption('Italian');
			await page.getByTestId('difficulty-filter').selectOption('Easy');
			await page.getByTestId('dietary-filter-vegetarian').check();
			
			// Should find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).toBeVisible();
			
			// Change one filter to non-matching
			await page.getByTestId('difficulty-filter').selectOption('Hard');
			
			// Should not find the recipe
			await page.waitForTimeout(1000);
			await expect(page.getByText(uniqueTitle)).not.toBeVisible();
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('search results show appropriate empty state', async ({ page }) => {
		const user = await createTestUser('reader');
		
		try {
			await loginUser(page, user.email, user.password);
			await page.goto('/search');
			
			// Search for something that doesn't exist
			await page.getByTestId('advanced-search-input').fill('NonExistentRecipe12345');
			
			// Wait for search to complete
			await page.waitForTimeout(1000);
			
			// Should show empty state
			await expect(page.getByText('No Recipes Found')).toBeVisible();
			await expect(page.getByText('No recipes match your current search criteria')).toBeVisible();
			await expect(page.getByTestId('clear-search-filters')).toBeVisible();
		} finally {
			await deleteTestUser(user.email);
		}
	});

	test('clear filters button works', async ({ page }) => {
		const user = await createTestUser('reader');
		
		try {
			await loginUser(page, user.email, user.password);
			await page.goto('/search');
			
			// Apply some filters
			await page.getByTestId('advanced-search-input').fill('Test Search');
			await page.getByText('Show Filters').click();
			await page.getByTestId('tag-filter-quick').click();
			await page.getByTestId('cuisine-filter').selectOption('Italian');
			
			// Clear all filters
			await page.getByTestId('clear-filters-button').click();
			
			// All filters should be cleared
			await expect(page.getByTestId('advanced-search-input')).toHaveValue('');
			await expect(page.getByTestId('cuisine-filter')).toHaveValue('');
			
			// Tag should not be selected (no ring)
			const tagButton = page.getByTestId('tag-filter-quick');
			await expect(tagButton).not.toHaveClass(/ring-2/);
		} finally {
			await deleteTestUser(user.email);
		}
	});

	test('quick tag filter on homepage works', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			
			// Create a recipe with a specific tag
			await page.goto('/admin/recipes/new');
			const uniqueTitle = `Homepage Tag Test ${Date.now()}`;
			
			await page.fill('input[placeholder="Enter recipe title"]', uniqueTitle);
			await page.fill('input[placeholder="Ingredient name"]', 'Test Ingredient');
			await page.fill('textarea[placeholder="Describe this step in detail..."]', 'Test instruction');
			
			// Add a common tag
			await page.fill('input[placeholder="Add tags (press Enter)"]', 'Dinner');
			await page.keyboard.press('Enter');
			
			// Make it published
			await page.getByLabel('Publish this recipe (make it visible to all users)').check();
			
			await page.click('button:has-text("Create Recipe")');
			await page.waitForURL(/\/recipes\/.+/);
			
			// Go to homepage
			await page.goto('/');
			
			// If the tag exists in popular tags, click it
			const dinnerTag = page.getByTestId('quick-tag-dinner');
			if (await dinnerTag.isVisible()) {
				await dinnerTag.click();
				
				// Should filter recipes
				await page.waitForTimeout(1000);
				await expect(page.getByText(uniqueTitle)).toBeVisible();
			}
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});
});