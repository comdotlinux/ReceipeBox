import { test, expect, type Page } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Recipe Full Flow', () => {
	// Helper function to create a unique test user for each test
	async function createAndLoginTestUser(page: Page, role: 'admin' | 'reader' = 'admin') {
		if (role === 'admin') {
			// For admin tests, use the pre-existing admin account
			await page.goto('/auth/login');
			await page.getByTestId('email-input').fill('admin@test.com');
			await page.getByTestId('password-input').fill('testpassword123');
			await page.getByTestId('login-button').click();
			await page.waitForURL('/');
			return { email: 'admin@test.com', password: 'testpassword123' };
		}

		// For reader, create a new user
		const timestamp = Date.now();
		const email = `test-reader-${timestamp}@example.com`;
		const password = 'TestPass123!';
		const name = `Test Reader ${timestamp}`;

		await page.goto('/auth/register');
		await page.getByTestId('name-input').fill(name);
		await page.getByTestId('register-email-input').fill(email);
		await page.getByTestId('register-password-input').fill(password);
		await page.getByTestId('confirm-password-input').fill(password);
		await page.getByTestId('register-button').click();
		await page.waitForURL('/');

		return { email, password };
	}

	// Helper function to generate unique recipe data for each test
	function generateRecipeData() {
		const timestamp = Date.now();
		return {
			title: `${faker.food.dish()} ${timestamp}`,
			description: `${faker.food.description()} - Test ${timestamp}`,
			prepTime: `${faker.number.int({ min: 5, max: 30 })} minutes`,
			cookTime: `${faker.number.int({ min: 10, max: 120 })} minutes`,
			servings: faker.number.int({ min: 2, max: 8 }).toString(),
			difficulty: faker.helpers.arrayElement(['Easy', 'Medium', 'Hard']),
			cuisine: faker.helpers.arrayElement(['Italian', 'Mexican', 'Chinese', 'Indian', 'American']),
			ingredients: [
				{
					quantity: faker.number.float({ min: 0.5, max: 3, fractionDigits: 1 }).toString(),
					unit: faker.helpers.arrayElement(['cups', 'tbsp', 'tsp', 'oz', 'lbs']),
					item: faker.food.ingredient(),
					notes: faker.lorem.words(3)
				},
				{
					quantity: faker.number.int({ min: 1, max: 5 }).toString(),
					unit: faker.helpers.arrayElement(['cloves', 'pieces', 'whole']),
					item: faker.food.ingredient(),
					notes: ''
				},
				{
					quantity: faker.number.float({ min: 0.25, max: 2, fractionDigits: 2 }).toString(),
					unit: faker.helpers.arrayElement(['cups', 'tbsp', 'tsp']),
					item: faker.food.ingredient(),
					notes: faker.lorem.words(2)
				}
			],
			instructions: [
				{
					step: 1,
					instruction: faker.lorem.sentence(),
					duration: `${faker.number.int({ min: 2, max: 10 })} minutes`,
					temperature: ''
				},
				{
					step: 2,
					instruction: faker.lorem.sentence(),
					duration: '',
					temperature: `${faker.number.int({ min: 300, max: 450 })}°F`
				},
				{
					step: 3,
					instruction: faker.lorem.sentence(),
					duration: `${faker.number.int({ min: 5, max: 30 })} minutes`,
					temperature: ''
				}
			],
			tags: [faker.food.ethnicCategory(), faker.food.adjective()],
			dietary: faker.helpers.arrayElements(
				['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'],
				2
			)
		};
	}

	test('should create a new recipe and view it with all details', async ({ page }) => {
		// Create and login a fresh admin user for this test
		await createAndLoginTestUser(page, 'admin');

		// Generate unique recipe data for this test
		const recipeData = generateRecipeData();

		// Navigate to create recipe page
		await page.click('a:has-text("Add Recipe")');
		await page.waitForURL('/admin/recipes/new');

		// Fill in basic information
		await page.fill('input[placeholder="Enter recipe title"]', recipeData.title);
		await page.fill(
			'textarea[placeholder="Brief description of the recipe..."]',
			recipeData.description
		);

		// Fill in metadata
		await page.fill('input[placeholder="15 minutes"]', recipeData.prepTime); // Prep time
		await page.fill('input[placeholder="30 minutes"]', recipeData.cookTime); // Cook time
		await page.fill('input[placeholder="4 people"]', recipeData.servings); // Servings
		await page.selectOption('select#difficulty', recipeData.difficulty);
		await page.fill('input[placeholder="Italian, Mexican, etc."]', recipeData.cuisine);

		// Add ingredients - use the first default ingredient, then add more
		// First ingredient (already exists)
		await page.fill('input[placeholder="Ingredient name"]', recipeData.ingredients[0].item);
		await page.fill('input[placeholder="Amount"]', recipeData.ingredients[0].quantity);
		await page.fill('input[placeholder="Unit"]', recipeData.ingredients[0].unit);
		if (recipeData.ingredients[0].notes) {
			await page.fill('input[placeholder="Notes"]', recipeData.ingredients[0].notes);
		}

		// Add remaining ingredients
		for (let i = 1; i < recipeData.ingredients.length; i++) {
			await page.click('button:has-text("Add Ingredient")');

			const ingredient = recipeData.ingredients[i];
			// Get the new row inputs (they're added at the end)
			const ingredientInputs = page.locator('input[placeholder="Ingredient name"]').nth(i);
			const quantityInputs = page.locator('input[placeholder="Amount"]').nth(i);
			const unitInputs = page.locator('input[placeholder="Unit"]').nth(i);
			const notesInputs = page.locator('input[placeholder="Notes"]').nth(i);

			await ingredientInputs.fill(ingredient.item);
			await quantityInputs.fill(ingredient.quantity);
			await unitInputs.fill(ingredient.unit);
			if (ingredient.notes) {
				await notesInputs.fill(ingredient.notes);
			}
		}

		// Add instructions - use the first default instruction, then add more
		// First instruction (already exists)
		await page.fill(
			'textarea[placeholder="Describe this step in detail..."]',
			recipeData.instructions[0].instruction
		);
		if (recipeData.instructions[0].duration) {
			await page.fill(
				'input[placeholder="Duration (e.g., 5 minutes)"]',
				recipeData.instructions[0].duration
			);
		}
		if (recipeData.instructions[0].temperature) {
			await page.fill(
				'input[placeholder="Temperature (e.g., 350°F)"]',
				recipeData.instructions[0].temperature
			);
		}

		// Add remaining instructions
		for (let i = 1; i < recipeData.instructions.length; i++) {
			await page.click('button:has-text("Add Step")');

			const instruction = recipeData.instructions[i];
			// Get the new instruction fields (they're added at the end)
			const instructionTextarea = page
				.locator('textarea[placeholder="Describe this step in detail..."]')
				.nth(i);
			const durationInputs = page.locator('input[placeholder="Duration (e.g., 5 minutes)"]').nth(i);
			const temperatureInputs = page
				.locator('input[placeholder="Temperature (e.g., 350°F)"]')
				.nth(i);

			await instructionTextarea.fill(instruction.instruction);
			if (instruction.duration) {
				await durationInputs.fill(instruction.duration);
			}
			if (instruction.temperature) {
				await temperatureInputs.fill(instruction.temperature);
			}
		}

		// Add tags - one by one
		const tagInput = page.locator('input[placeholder="Add a tag and press Enter"]');
		for (const tag of recipeData.tags) {
			await tagInput.fill(tag);
			await tagInput.press('Enter');
		}

		// Select dietary options
		for (const dietary of recipeData.dietary) {
			await page.check(`label:has-text("${dietary}") input[type="checkbox"]`);
		}

		// Note: is_published is hardcoded to true in RecipeForm, no need to check

		// Listen for the recipe creation API call
		const responsePromise = page.waitForResponse(
			(response) =>
				response.url().includes('/api/collections/recipes/records') &&
				response.request().method() === 'POST'
		);

		// Submit the form
		await page.click('button:has-text("Create Recipe")');

		// Get recipe ID from API response
		const response = await responsePromise;
		const responseBody = await response.text();
		const apiResponse = JSON.parse(responseBody);
		const recipeId = apiResponse.id;

		// Navigate to recipe detail page
		await page.goto(`/recipes/${recipeId}`);

		// Wait for recipe detail page to load
		await page.waitForSelector('h1');

		// Verify all the data is displayed correctly
		// Title and description
		await expect(page.locator('h1')).toHaveText(recipeData.title);
		await expect(page.locator('p.text-gray-600').first()).toContainText(recipeData.description);

		// Metadata
		await expect(page.locator('text=Prep:')).toBeVisible();
		await expect(page.locator('text=Prep:').locator('..')).toContainText(recipeData.prepTime);

		await expect(page.locator('text=Cook:')).toBeVisible();
		await expect(page.locator('text=Cook:').locator('..')).toContainText(recipeData.cookTime);

		await expect(page.locator('text=Serves:')).toBeVisible();
		await expect(page.locator('text=Serves:').locator('..')).toContainText(recipeData.servings);

		await expect(page.locator(`text=${recipeData.difficulty}`)).toBeVisible();
		await expect(page.locator(`text=${recipeData.cuisine}`)).toBeVisible();

		// Tags
		for (const tag of recipeData.tags) {
			await expect(page.locator('.bg-blue-100', { hasText: tag })).toBeVisible();
		}

		// Dietary options
		for (const dietary of recipeData.dietary) {
			await expect(page.locator('.bg-green-100', { hasText: dietary })).toBeVisible();
		}

		// Ingredients
		await expect(page.locator('h2:has-text("Ingredients")')).toBeVisible();
		for (const ingredient of recipeData.ingredients) {
			const ingredientText = `${ingredient.quantity} ${ingredient.unit} ${ingredient.item}`;
			await expect(page.locator('li', { hasText: ingredient.item })).toBeVisible();

			// Check quantity and unit are displayed
			const ingredientElement = page.locator('li', { hasText: ingredient.item });
			await expect(ingredientElement).toContainText(ingredient.quantity);
			await expect(ingredientElement).toContainText(ingredient.unit);

			// Check notes if present
			if (ingredient.notes) {
				await expect(ingredientElement).toContainText(ingredient.notes);
			}
		}

		// Instructions
		await expect(page.locator('h2:has-text("Instructions")')).toBeVisible();
		for (const instruction of recipeData.instructions) {
			// Check step number
			await expect(
				page.locator('.bg-blue-600', { hasText: instruction.step.toString() })
			).toBeVisible();

			// Check instruction text
			await expect(page.locator('p', { hasText: instruction.instruction })).toBeVisible();

			// Check duration if present
			if (instruction.duration) {
				await expect(page.locator('span', { hasText: instruction.duration })).toBeVisible();
			}

			// Check temperature if present
			if (instruction.temperature) {
				await expect(page.locator('span', { hasText: instruction.temperature })).toBeVisible();
			}
		}
	});

	test('should handle recipe with minimal data', async ({ page }) => {
		// Create and login a fresh admin user for this test
		await createAndLoginTestUser(page, 'admin');

		const timestamp = Date.now();
		const minimalRecipe = {
			title: `${faker.food.dish()} ${timestamp}`,
			ingredients: [
				{
					item: faker.food.ingredient()
				}
			],
			instructions: [
				{
					instruction: faker.lorem.sentence()
				}
			]
		};

		// Navigate to create recipe page
		await page.click('a:has-text("Add Recipe")');
		await page.waitForURL('/admin/recipes/new');

		// Fill minimal data
		await page.fill('input[placeholder="Enter recipe title"]', minimalRecipe.title);
		await page.fill('input[placeholder="Ingredient name"]', minimalRecipe.ingredients[0].item);
		await page.fill(
			'textarea[placeholder="Describe this step in detail..."]',
			minimalRecipe.instructions[0].instruction
		);

		// Listen for the recipe creation API call
		const responsePromise = page.waitForResponse(
			(response) =>
				response.url().includes('/api/collections/recipes/records') &&
				response.request().method() === 'POST'
		);

		// Submit (is_published is true by default)
		await page.click('button:has-text("Create Recipe")');

		// Get recipe ID from API response
		const response = await responsePromise;
		const responseBody = await response.text();
		const apiResponse = JSON.parse(responseBody);
		const recipeId = apiResponse.id;

		// Navigate to recipe detail page
		await page.goto(`/recipes/${recipeId}`);

		// Verify minimal data is displayed
		await expect(page.locator('h1')).toHaveText(minimalRecipe.title);
		await expect(page.locator('li', { hasText: minimalRecipe.ingredients[0].item })).toBeVisible();
		await expect(
			page.locator('p', { hasText: minimalRecipe.instructions[0].instruction })
		).toBeVisible();
	});

	test('should allow editing a recipe and viewing updated data', async ({ page }) => {
		// Create and login a fresh admin user for this test
		await createAndLoginTestUser(page, 'admin');

		// First create a recipe with unique data
		const timestamp = Date.now();
		const originalTitle = `${faker.food.dish()} ${timestamp}`;

		await page.click('a:has-text("Add Recipe")');
		await page.waitForURL('/admin/recipes/new');

		await page.fill('input[placeholder="Enter recipe title"]', originalTitle);
		await page.fill('input[placeholder="Ingredient name"]', 'Original ingredient');
		await page.fill(
			'textarea[placeholder="Describe this step in detail..."]',
			'Original instruction'
		);
		// Listen for the recipe creation API call
		const responsePromise = page.waitForResponse(
			(response) =>
				response.url().includes('/api/collections/recipes/records') &&
				response.request().method() === 'POST'
		);

		// is_published is true by default
		await page.click('button:has-text("Create Recipe")');

		// Get recipe ID from API response
		const response = await responsePromise;
		const responseBody = await response.text();
		const apiResponse = JSON.parse(responseBody);
		const recipeId = apiResponse.id;

		// Navigate to recipe detail page
		await page.goto(`/recipes/${recipeId}`);
		await page.waitForSelector('h1');

		// Click edit button
		await page.click('a:has-text("Edit Recipe")');
		await page.waitForURL(/\/admin\/recipes\/.*\/edit/);

		// Update the recipe with new unique data
		const updatedData = {
			title: `${faker.food.dish()} ${timestamp + 1000}`, // Slightly different timestamp
			description: `${faker.food.description()} - Updated ${timestamp}`,
			ingredient: faker.food.ingredient(),
			instruction: faker.lorem.sentence()
		};

		await page.fill('input[placeholder="Enter recipe title"]', updatedData.title);
		await page.fill(
			'textarea[placeholder="Brief description of the recipe..."]',
			updatedData.description
		);
		await page.fill('input[placeholder="Ingredient name"]', updatedData.ingredient);
		await page.fill(
			'textarea[placeholder="Describe this step in detail..."]',
			updatedData.instruction
		);

		// Listen for the recipe update API call
		const updateResponsePromise = page.waitForResponse(
			(response) =>
				response.url().includes(`/api/collections/recipes/records/${recipeId}`) &&
				response.request().method() === 'PATCH'
		);

		await page.click('button:has-text("Update Recipe")');

		// Wait for update to complete
		await updateResponsePromise;

		// Navigate to recipe detail page
		await page.goto(`/recipes/${recipeId}`);

		// Verify updated data
		await expect(page.locator('h1')).toHaveText(updatedData.title);
		await expect(page.locator('p.text-gray-600').first()).toContainText(updatedData.description);
		await expect(page.locator('li', { hasText: updatedData.ingredient })).toBeVisible();
		await expect(page.locator('p', { hasText: updatedData.instruction })).toBeVisible();
	});
});
