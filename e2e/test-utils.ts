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
		// Login as admin to cleanup
		await pb.collection('users').authWithPassword(
			testUsers.admin.email,
			testUsers.admin.password
		);

		// Delete test recipes
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

		// Note: We don't delete test users as they might be needed for other test runs
	} catch (error) {
		console.error('Cleanup error:', error);
	}
}

export async function createTestRecipe(page: Page, data: {
	title: string;
	description: string;
	is_published: boolean;
}): Promise<string> {
	await page.goto('/admin/recipes/new');
	
	// Fill in recipe form
	await page.fill('input[name="title"]', data.title);
	await page.fill('textarea[name="description"]', data.description);
	
	// Add minimal ingredient
	await page.click('button:text("Add Ingredient")');
	await page.fill('input[name="ingredients.0.amount"]', '1');
	await page.fill('input[name="ingredients.0.unit"]', 'test');
	await page.fill('input[name="ingredients.0.item"]', 'ingredient');
	
	// Add minimal instruction
	await page.click('button:text("Add Instruction")');
	await page.fill('textarea[name="instructions.0.instruction"]', 'Test instruction');
	
	// Set published status
	if (data.is_published) {
		await page.check('input[name="is_published"]');
	}
	
	// Submit form
	await page.click('button[type="submit"]:text("Create Recipe")');
	
	// Wait for redirect and extract recipe ID
	await page.waitForURL(/\/recipes\/[a-z0-9]+/);
	const url = page.url();
	const recipeId = url.split('/').pop() || '';
	
	return recipeId;
}

export async function loginUser(page: Page, email: string, password: string) {
	await page.goto('/login');
	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', password);
	await page.click('button[type="submit"]');
	await page.waitForURL('/');
}

export async function logoutUser(page: Page) {
	await page.goto('/');
	await page.click('button:text("Logout")');
	await page.waitForURL('/login');
}