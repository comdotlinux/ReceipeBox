import PocketBase from 'pocketbase';
import type { Page } from '@playwright/test';

const pb = new PocketBase('http://localhost:8090');

export const testUsers = {
	admin: {
		email: 'admin.e2e@test.com',
		password: 'AdminPass123!',
		name: 'Admin E2E Test',
		role: 'admin'
	},
	reader: {
		email: 'reader.e2e@test.com',
		password: 'ReaderPass123!',
		name: 'Reader E2E Test',
		role: 'reader'
	}
};

export async function setupTestUsers() {
	try {
		// Try to create admin user
		try {
			await pb.collection('users').create({
				...testUsers.admin,
				passwordConfirm: testUsers.admin.password
			});
			console.log('Admin test user created');
		} catch (err: any) {
			if (err?.response?.code !== 400) {
				console.error('Admin user creation failed:', err.message);
			}
		}

		// Try to create reader user
		try {
			await pb.collection('users').create({
				...testUsers.reader,
				passwordConfirm: testUsers.reader.password
			});
			console.log('Reader test user created');
		} catch (err: any) {
			if (err?.response?.code !== 400) {
				console.error('Reader user creation failed:', err.message);
			}
		}
	} catch (error) {
		console.error('Test user setup error:', error);
	}
}

export async function cleanupTestData() {
	try {
		// Try to login with known admin credentials
		try {
			await pb.collection('users').authWithPassword('a@b.c', 'abcabcabc');
		} catch (loginError) {
			// If login fails, skip cleanup
			console.log('Skipping cleanup - admin login failed');
			return;
		}

		// Delete test recipes
		try {
			const recipes = await pb.collection('recipes').getList(1, 100, {
				filter: 'title ~ "Test" || title ~ "E2E"'
			});

			for (const recipe of recipes.items) {
				try {
					await pb.collection('recipes').delete(recipe.id);
				} catch (err) {
					console.error('Failed to delete recipe:', recipe.id);
				}
			}
		} catch (err) {
			console.log('Failed to fetch recipes for cleanup');
		}

		// Note: We don't delete test users as they might be needed for other test runs
	} catch (error) {
		console.error('Cleanup error:', error);
	}
}

export async function createTestRecipe(
	page: Page,
	data: {
		title: string;
		description: string;
		is_published: boolean;
	}
): Promise<string> {
	await page.goto('/admin/recipes/new');
	await page.waitForLoadState('networkidle');

	// Fill in recipe form
	await page.fill('input[placeholder="Enter recipe title"]', data.title);
	await page.fill('textarea[placeholder="Brief description of the recipe..."]', data.description);

	// The form should have at least one ingredient and instruction by default
	// Fill the first ingredient
	await page.fill('input[placeholder="Ingredient name"]', 'Test ingredient');
	await page.fill('input[placeholder="Amount"]', '1');
	await page.fill('input[placeholder="Unit"]', 'cup');

	// Fill the first instruction
	await page.fill(
		'textarea[placeholder="Describe this step in detail..."]',
		'Test instruction step'
	);

	// Note: is_published is hardcoded to true in RecipeForm, no need to check
	// Listen for the recipe creation API call
	const responsePromise = page.waitForResponse(
		(response) =>
			response.url().includes('/api/collections/recipes/records') &&
			response.request().method() === 'POST'
	);

	// Submit form
	await page.click('button:has-text("Create Recipe")');

	// Get recipe ID from API response
	const response = await responsePromise;
	const responseBody = await response.text();
	const recipeData = JSON.parse(responseBody);
	return recipeData.id;
}

export async function loginUser(page: Page, email: string, password: string) {
	await page.goto('/auth/login');
	await page.fill('input#email', email);
	await page.fill('input#password', password);
	await page.click('button[type="submit"]');
	await page.waitForURL('/');
}

export async function logoutUser(page: Page) {
	await page.goto('/');
	await page.click('button:text("Logout")');
	await page.waitForURL('/login');
}
