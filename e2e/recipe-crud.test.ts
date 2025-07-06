import { test, expect, type Page } from '@playwright/test';
import { setupTestUsers, cleanupTestData, testUsers } from './test-utils';

test.describe('Recipe CRUD Operations', () => {
	let adminPage: Page;
	let readerPage: Page;

	test.beforeAll(async ({ browser }) => {
		await setupTestUsers();
		
		// Create admin context
		const adminContext = await browser.newContext();
		adminPage = await adminContext.newPage();
		
		// Create reader context
		const readerContext = await browser.newContext();
		readerPage = await readerContext.newPage();
	});

	test.afterAll(async () => {
		await cleanupTestData();
		await adminPage.close();
		await readerPage.close();
	});

	test.beforeEach(async () => {
		// Login as admin
		await adminPage.goto('/login');
		await adminPage.fill('input[name="email"]', testUsers.admin.email);
		await adminPage.fill('input[name="password"]', testUsers.admin.password);
		await adminPage.click('button[type="submit"]');
		await adminPage.waitForURL('/');

		// Login as reader
		await readerPage.goto('/login');
		await readerPage.fill('input[name="email"]', testUsers.reader.email);
		await readerPage.fill('input[name="password"]', testUsers.reader.password);
		await readerPage.click('button[type="submit"]');
		await readerPage.waitForURL('/');
	});

	test('admin can create a new recipe', async () => {
		await adminPage.goto('/admin/recipes/new');
		
		// Fill in recipe form
		await adminPage.fill('input[name="title"]', 'Test Recipe E2E');
		await adminPage.fill('textarea[name="description"]', 'This is a test recipe created by E2E tests');
		
		// Add ingredient
		await adminPage.click('button:text("Add Ingredient")');
		await adminPage.fill('input[name="ingredients.0.amount"]', '2');
		await adminPage.fill('input[name="ingredients.0.unit"]', 'cups');
		await adminPage.fill('input[name="ingredients.0.item"]', 'test flour');
		
		// Add instruction
		await adminPage.click('button:text("Add Instruction")');
		await adminPage.fill('textarea[name="instructions.0.instruction"]', 'Mix all ingredients');
		await adminPage.fill('input[name="instructions.0.timeInMinutes"]', '5');
		
		// Set metadata
		await adminPage.fill('input[name="metadata.prepTimeMinutes"]', '10');
		await adminPage.fill('input[name="metadata.cookTimeMinutes"]', '20');
		await adminPage.fill('input[name="metadata.servings"]', '4');
		await adminPage.selectOption('select[name="metadata.difficulty"]', 'easy');
		
		// Add tags
		await adminPage.fill('input[name="tags"]', 'test, e2e, automated');
		
		// Check is_published
		await adminPage.check('input[name="is_published"]');
		
		// Submit form
		await adminPage.click('button[type="submit"]:text("Create Recipe")');
		
		// Verify redirect to recipe detail
		await adminPage.waitForURL(/\/recipes\/[a-z0-9]+/);
		
		// Verify recipe content
		await expect(adminPage.locator('h1')).toContainText('Test Recipe E2E');
		await expect(adminPage.locator('text=This is a test recipe')).toBeVisible();
		await expect(adminPage.locator('text=2 cups test flour')).toBeVisible();
		await expect(adminPage.locator('text=Mix all ingredients')).toBeVisible();
	});

	test('reader cannot access recipe creation page', async () => {
		await readerPage.goto('/admin/recipes/new');
		
		// Should redirect to home or show error
		await expect(readerPage).toHaveURL('/');
		await expect(readerPage.locator('text=Unauthorized')).toBeVisible();
	});

	test('admin can edit an existing recipe', async () => {
		// First create a recipe
		await adminPage.goto('/admin/recipes/new');
		await adminPage.fill('input[name="title"]', 'Recipe to Edit');
		await adminPage.fill('textarea[name="description"]', 'Original description');
		await adminPage.click('button:text("Add Ingredient")');
		await adminPage.fill('input[name="ingredients.0.amount"]', '1');
		await adminPage.fill('input[name="ingredients.0.unit"]', 'cup');
		await adminPage.fill('input[name="ingredients.0.item"]', 'water');
		await adminPage.click('button:text("Add Instruction")');
		await adminPage.fill('textarea[name="instructions.0.instruction"]', 'Original instruction');
		await adminPage.check('input[name="is_published"]');
		await adminPage.click('button[type="submit"]:text("Create Recipe")');
		
		// Wait for recipe to be created
		await adminPage.waitForURL(/\/recipes\/[a-z0-9]+/);
		const recipeUrl = adminPage.url();
		const recipeId = recipeUrl.split('/').pop();
		
		// Navigate to edit page
		await adminPage.goto(`/admin/recipes/${recipeId}/edit`);
		
		// Update recipe
		await adminPage.fill('input[name="title"]', 'Updated Recipe Title');
		await adminPage.fill('textarea[name="description"]', 'Updated description');
		
		// Update ingredient
		await adminPage.fill('input[name="ingredients.0.amount"]', '2');
		
		// Submit changes
		await adminPage.click('button[type="submit"]:text("Update Recipe")');
		
		// Verify updates
		await adminPage.waitForURL(`/recipes/${recipeId}`);
		await expect(adminPage.locator('h1')).toContainText('Updated Recipe Title');
		await expect(adminPage.locator('text=Updated description')).toBeVisible();
		await expect(adminPage.locator('text=2 cups water')).toBeVisible();
	});

	test('admin can delete a recipe', async () => {
		// Create a recipe to delete
		await adminPage.goto('/admin/recipes/new');
		await adminPage.fill('input[name="title"]', 'Recipe to Delete');
		await adminPage.fill('textarea[name="description"]', 'This recipe will be deleted');
		await adminPage.click('button:text("Add Ingredient")');
		await adminPage.fill('input[name="ingredients.0.amount"]', '1');
		await adminPage.fill('input[name="ingredients.0.unit"]', 'item');
		await adminPage.fill('input[name="ingredients.0.item"]', 'to delete');
		await adminPage.click('button:text("Add Instruction")');
		await adminPage.fill('textarea[name="instructions.0.instruction"]', 'Will be deleted');
		await adminPage.check('input[name="is_published"]');
		await adminPage.click('button[type="submit"]:text("Create Recipe")');
		
		// Wait for recipe to be created
		await adminPage.waitForURL(/\/recipes\/[a-z0-9]+/);
		const recipeUrl = adminPage.url();
		const recipeId = recipeUrl.split('/').pop();
		
		// Navigate to edit page
		await adminPage.goto(`/admin/recipes/${recipeId}/edit`);
		
		// Click delete button
		await adminPage.click('button:text("Delete Recipe")');
		
		// Confirm deletion in dialog
		await adminPage.click('button:text("Confirm Delete")');
		
		// Verify redirect to recipes list
		await adminPage.waitForURL('/recipes');
		
		// Verify recipe is gone
		await adminPage.goto(`/recipes/${recipeId}`);
		await expect(adminPage.locator('text=Recipe not found')).toBeVisible();
	});

	test('recipe form validation works correctly', async () => {
		await adminPage.goto('/admin/recipes/new');
		
		// Try to submit empty form
		await adminPage.click('button[type="submit"]:text("Create Recipe")');
		
		// Check validation messages
		await expect(adminPage.locator('text=Title is required')).toBeVisible();
		await expect(adminPage.locator('text=At least one ingredient is required')).toBeVisible();
		await expect(adminPage.locator('text=At least one instruction is required')).toBeVisible();
		
		// Fill partial form
		await adminPage.fill('input[name="title"]', 'A');
		await adminPage.click('button[type="submit"]');
		
		// Check length validation
		await expect(adminPage.locator('text=Title must be at least 2 characters')).toBeVisible();
		
		// Fill title with too long text
		await adminPage.fill('input[name="title"]', 'A'.repeat(201));
		await adminPage.click('button[type="submit"]');
		await expect(adminPage.locator('text=Title must be less than 200 characters')).toBeVisible();
	});

	test('admin can toggle recipe published status', async () => {
		// Create an unpublished recipe
		await adminPage.goto('/admin/recipes/new');
		await adminPage.fill('input[name="title"]', 'Draft Recipe');
		await adminPage.fill('textarea[name="description"]', 'This is a draft');
		await adminPage.click('button:text("Add Ingredient")');
		await adminPage.fill('input[name="ingredients.0.amount"]', '1');
		await adminPage.fill('input[name="ingredients.0.unit"]', 'draft');
		await adminPage.fill('input[name="ingredients.0.item"]', 'item');
		await adminPage.click('button:text("Add Instruction")');
		await adminPage.fill('textarea[name="instructions.0.instruction"]', 'Draft instruction');
		// Leave is_published unchecked
		await adminPage.click('button[type="submit"]:text("Create Recipe")');
		
		// Wait for recipe to be created
		await adminPage.waitForURL(/\/recipes\/[a-z0-9]+/);
		const recipeUrl = adminPage.url();
		const recipeId = recipeUrl.split('/').pop();
		
		// Verify draft status is shown
		await expect(adminPage.locator('text=Draft')).toBeVisible();
		
		// Navigate to edit page
		await adminPage.goto(`/admin/recipes/${recipeId}/edit`);
		
		// Toggle published status
		await adminPage.check('input[name="is_published"]');
		await adminPage.click('button[type="submit"]:text("Update Recipe")');
		
		// Verify published status
		await adminPage.waitForURL(`/recipes/${recipeId}`);
		await expect(adminPage.locator('text=Draft')).not.toBeVisible();
		await expect(adminPage.locator('text=Published')).toBeVisible();
	});

	test('image upload functionality works', async () => {
		await adminPage.goto('/admin/recipes/new');
		
		// Fill basic recipe info
		await adminPage.fill('input[name="title"]', 'Recipe with Image');
		await adminPage.fill('textarea[name="description"]', 'This recipe has an image');
		await adminPage.click('button:text("Add Ingredient")');
		await adminPage.fill('input[name="ingredients.0.amount"]', '1');
		await adminPage.fill('input[name="ingredients.0.unit"]', 'test');
		await adminPage.fill('input[name="ingredients.0.item"]', 'image');
		await adminPage.click('button:text("Add Instruction")');
		await adminPage.fill('textarea[name="instructions.0.instruction"]', 'Test image upload');
		
		// Upload image (create a test image file)
		const fileInput = await adminPage.locator('input[type="file"]');
		await fileInput.setInputFiles({
			name: 'test-recipe.jpg',
			mimeType: 'image/jpeg',
			buffer: Buffer.from('fake-image-content')
		});
		
		// Submit form
		await adminPage.check('input[name="is_published"]');
		await adminPage.click('button[type="submit"]:text("Create Recipe")');
		
		// Verify image is displayed
		await adminPage.waitForURL(/\/recipes\/[a-z0-9]+/);
		await expect(adminPage.locator('img[alt="Recipe with Image"]')).toBeVisible();
	});
});