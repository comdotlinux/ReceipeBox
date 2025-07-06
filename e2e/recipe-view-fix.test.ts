import { test, expect, type Page } from '@playwright/test';

test.describe('Recipe Viewing Fix Verification', () => {
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

  // Helper function to create a test recipe
  async function createTestRecipe(page: Page, title: string, description: string): Promise<string> {
    await page.goto('/admin/recipes/new');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[placeholder="Enter recipe title"]', title);
    await page.fill('textarea[placeholder="Brief description of the recipe..."]', description);
    await page.fill('input[placeholder="Ingredient name"]', 'Test ingredient');
    await page.fill('input[placeholder="Amount"]', '1');
    await page.fill('input[placeholder="Unit"]', 'cup');
    await page.fill('textarea[placeholder="Describe this step in detail..."]', 'Test instruction step');
    
    // Listen for the recipe creation API call
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/collections/recipes/records') && response.request().method() === 'POST'
    );
    
    await page.click('button:has-text("Create Recipe")');
    
    // Get recipe ID from API response
    const response = await responsePromise;
    const responseBody = await response.text();
    const recipeData = JSON.parse(responseBody);
    return recipeData.id;
  }

  test('recipe detail page loads correctly after fix', async ({ page }) => {
    // Create admin user and a test recipe
    await createAndLoginTestUser(page, 'admin');
    
    const timestamp = Date.now();
    const recipeTitle = `Test Recipe Fix ${timestamp}`;
    const recipeDescription = `This recipe tests the viewing fix ${timestamp}`;
    
    const recipeId = await createTestRecipe(page, recipeTitle, recipeDescription);
    
    // Navigate directly to the recipe detail page
    await page.goto(`/recipes/${recipeId}`);
    
    // Verify the recipe detail page loaded successfully
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
    
    // Verify the title matches
    await expect(page.locator('h1')).toContainText(recipeTitle);
    
    // Verify key sections are present
    await expect(page.locator('h2:has-text("Ingredients")')).toBeVisible();
    await expect(page.locator('h2:has-text("Instructions")')).toBeVisible();
    
    // Verify no error message is shown
    const errorElement = page.locator('.bg-red-50');
    await expect(errorElement).not.toBeVisible();
    
    // Verify content is displayed
    await expect(page.locator(`text=${recipeDescription}`)).toBeVisible();
    await expect(page.locator('text=Test ingredient')).toBeVisible();
    await expect(page.locator('text=Test instruction step')).toBeVisible();
  });
  
  test('can navigate between multiple recipes', async ({ page }) => {
    // Create admin user and multiple test recipes
    await createAndLoginTestUser(page, 'admin');
    
    const timestamp = Date.now();
    const recipes = [
      {
        title: `Navigation Recipe 1 ${timestamp}`,
        description: `First navigation test recipe ${timestamp}`,
        id: ''
      },
      {
        title: `Navigation Recipe 2 ${timestamp}`,
        description: `Second navigation test recipe ${timestamp}`,
        id: ''
      },
      {
        title: `Navigation Recipe 3 ${timestamp}`,
        description: `Third navigation test recipe ${timestamp}`,
        id: ''
      }
    ];
    
    // Create all test recipes
    for (const recipe of recipes) {
      recipe.id = await createTestRecipe(page, recipe.title, recipe.description);
    }
    
    // Test navigating to each recipe directly
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      
      // Navigate directly to recipe detail page
      await page.goto(`/recipes/${recipe.id}`);
      await page.waitForLoadState('networkidle');
      
      // Verify the recipe loaded correctly
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).toContainText(recipe.title);
      await expect(page.locator(`text=${recipe.description}`)).toBeVisible();
      
      // Verify key sections are present
      await expect(page.locator('h2:has-text("Ingredients")')).toBeVisible();
      await expect(page.locator('h2:has-text("Instructions")')).toBeVisible();
      
      // Verify no error message is shown
      const errorElement = page.locator('.bg-red-50');
      await expect(errorElement).not.toBeVisible();
    }
  });
});