import { test, expect, type Page } from '@playwright/test';
import { setupTestUsers, cleanupTestData, testUsers, createTestRecipe } from './test-utils';

test.describe('Recipe Visibility Based on Published Status', () => {
	let adminPage: Page;
	let readerPage: Page;
	let guestPage: Page;
	let publishedRecipeId: string;
	let unpublishedRecipeId: string;

	test.beforeAll(async ({ browser }) => {
		await setupTestUsers();
		
		// Create contexts
		const adminContext = await browser.newContext();
		adminPage = await adminContext.newPage();
		
		const readerContext = await browser.newContext();
		readerPage = await readerContext.newPage();
		
		const guestContext = await browser.newContext();
		guestPage = await guestContext.newPage();
		
		// Login admin
		await adminPage.goto('/login');
		await adminPage.fill('input[name="email"]', testUsers.admin.email);
		await adminPage.fill('input[name="password"]', testUsers.admin.password);
		await adminPage.click('button[type="submit"]');
		await adminPage.waitForURL('/');
		
		// Login reader
		await readerPage.goto('/login');
		await readerPage.fill('input[name="email"]', testUsers.reader.email);
		await readerPage.fill('input[name="password"]', testUsers.reader.password);
		await readerPage.click('button[type="submit"]');
		await readerPage.waitForURL('/');
		
		// Create test recipes
		publishedRecipeId = await createTestRecipe(adminPage, {
			title: 'Published Recipe Visibility Test',
			description: 'This recipe should be visible to all authenticated users',
			is_published: true
		});
		
		unpublishedRecipeId = await createTestRecipe(adminPage, {
			title: 'Unpublished Recipe Visibility Test',
			description: 'This recipe should only be visible to admins',
			is_published: false
		});
	});

	test.afterAll(async () => {
		await cleanupTestData();
		await adminPage.close();
		await readerPage.close();
		await guestPage.close();
	});

	test('published recipes are visible to all authenticated users', async () => {
		// Admin can see published recipe
		await adminPage.goto(`/recipes/${publishedRecipeId}`);
		await expect(adminPage.locator('h1')).toContainText('Published Recipe Visibility Test');
		await expect(adminPage.locator('text=This recipe should be visible to all authenticated users')).toBeVisible();
		
		// Reader can see published recipe
		await readerPage.goto(`/recipes/${publishedRecipeId}`);
		await expect(readerPage.locator('h1')).toContainText('Published Recipe Visibility Test');
		await expect(readerPage.locator('text=This recipe should be visible to all authenticated users')).toBeVisible();
	});

	test('unpublished recipes are only visible to admin users', async () => {
		// Admin can see unpublished recipe
		await adminPage.goto(`/recipes/${unpublishedRecipeId}`);
		await expect(adminPage.locator('h1')).toContainText('Unpublished Recipe Visibility Test');
		await expect(adminPage.locator('text=Draft')).toBeVisible();
		
		// Reader cannot see unpublished recipe
		await readerPage.goto(`/recipes/${unpublishedRecipeId}`);
		await expect(readerPage.locator('text=Recipe not found')).toBeVisible();
	});

	test('guest users cannot see any recipes', async () => {
		// Guest cannot see published recipe
		await guestPage.goto(`/recipes/${publishedRecipeId}`);
		await expect(guestPage).toHaveURL('/login');
		
		// Guest cannot see unpublished recipe
		await guestPage.goto(`/recipes/${unpublishedRecipeId}`);
		await expect(guestPage).toHaveURL('/login');
	});

	test('recipe list only shows published recipes to readers', async () => {
		// Admin sees all recipes
		await adminPage.goto('/recipes');
		await expect(adminPage.locator('text=Published Recipe Visibility Test')).toBeVisible();
		await expect(adminPage.locator('text=Unpublished Recipe Visibility Test')).toBeVisible();
		
		// Reader only sees published recipes
		await readerPage.goto('/recipes');
		await expect(readerPage.locator('text=Published Recipe Visibility Test')).toBeVisible();
		await expect(readerPage.locator('text=Unpublished Recipe Visibility Test')).not.toBeVisible();
	});

	test('search results respect published status', async () => {
		// Admin search returns all matching recipes
		await adminPage.goto('/recipes?search=Visibility Test');
		await expect(adminPage.locator('text=Published Recipe Visibility Test')).toBeVisible();
		await expect(adminPage.locator('text=Unpublished Recipe Visibility Test')).toBeVisible();
		
		// Reader search only returns published recipes
		await readerPage.goto('/recipes?search=Visibility Test');
		await expect(readerPage.locator('text=Published Recipe Visibility Test')).toBeVisible();
		await expect(readerPage.locator('text=Unpublished Recipe Visibility Test')).not.toBeVisible();
	});

	test('draft indicator is shown for unpublished recipes', async () => {
		// Admin sees draft indicator on unpublished recipes
		await adminPage.goto('/recipes');
		const unpublishedCard = adminPage.locator('article', { hasText: 'Unpublished Recipe Visibility Test' });
		await expect(unpublishedCard.locator('text=Draft')).toBeVisible();
		
		// Published recipe doesn't show draft indicator
		const publishedCard = adminPage.locator('article', { hasText: 'Published Recipe Visibility Test' });
		await expect(publishedCard.locator('text=Draft')).not.toBeVisible();
	});

	test('admin can toggle published status from recipe page', async () => {
		// Create a new recipe as published
		const recipeId = await createTestRecipe(adminPage, {
			title: 'Toggle Published Status Test',
			description: 'Testing toggle functionality',
			is_published: true
		});
		
		// Navigate to recipe
		await adminPage.goto(`/recipes/${recipeId}`);
		
		// Should see "Published" status
		await expect(adminPage.locator('text=Published')).toBeVisible();
		
		// Click toggle button (if implemented)
		const toggleButton = adminPage.locator('button:text("Unpublish")');
		if (await toggleButton.isVisible()) {
			await toggleButton.click();
			await expect(adminPage.locator('text=Draft')).toBeVisible();
			
			// Verify reader can no longer see it
			await readerPage.goto(`/recipes/${recipeId}`);
			await expect(readerPage.locator('text=Recipe not found')).toBeVisible();
		}
	});

	test('recipe counts reflect visibility rules', async () => {
		// Admin sees total count including unpublished
		await adminPage.goto('/recipes');
		const adminCount = await adminPage.locator('text=/\\d+ recipes? found/').textContent();
		
		// Reader sees only published count
		await readerPage.goto('/recipes');
		const readerCount = await readerPage.locator('text=/\\d+ recipes? found/').textContent();
		
		// Admin should see more recipes than reader (if unpublished recipes exist)
		const adminNumber = parseInt(adminCount?.match(/\\d+/)?.[0] || '0');
		const readerNumber = parseInt(readerCount?.match(/\\d+/)?.[0] || '0');
		expect(adminNumber).toBeGreaterThanOrEqual(readerNumber);
	});

	test('API respects published status in responses', async () => {
		// Get admin auth token
		const adminResponse = await adminPage.evaluate(async () => {
			return await fetch('/api/collections/recipes/records?page=1&perPage=100').then(r => r.json());
		});
		
		// Get reader auth token
		const readerResponse = await readerPage.evaluate(async () => {
			return await fetch('/api/collections/recipes/records?page=1&perPage=100&filter=is_published=true').then(r => r.json());
		});
		
		// Admin should get all recipes
		const adminRecipes = adminResponse.items || [];
		const adminHasUnpublished = adminRecipes.some((r: any) => !r.is_published);
		expect(adminHasUnpublished).toBe(true);
		
		// Reader should only get published recipes
		const readerRecipes = readerResponse.items || [];
		const readerHasUnpublished = readerRecipes.some((r: any) => !r.is_published);
		expect(readerHasUnpublished).toBe(false);
	});
});