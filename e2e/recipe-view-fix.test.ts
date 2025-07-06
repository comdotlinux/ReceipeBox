import { test, expect } from '@playwright/test';

test.describe('Recipe Viewing Fix Verification', () => {
  test('recipe detail page loads correctly after fix', async ({ page }) => {
    // Go directly to home page
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we can see recipes (they should be visible to all)
    const recipeCards = page.locator('a[href^="/recipes/"]');
    const count = await recipeCards.count();
    
    if (count > 0) {
      // Get the first recipe title
      const firstRecipeTitle = await page.locator('h3').first().textContent();
      console.log('Found recipe:', firstRecipeTitle);
      
      // Click on the first recipe card link
      await recipeCards.first().click();
      
      // Wait for navigation to recipe detail page
      await page.waitForURL(/\/recipes\/[^/]+$/, { timeout: 10000 });
      
      // Verify the recipe detail page loaded successfully
      await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
      
      // Verify the title matches
      const detailTitle = await page.locator('h1').textContent();
      expect(detailTitle).toBe(firstRecipeTitle);
      
      // Verify key sections are present
      await expect(page.locator('h2:has-text("Ingredients")')).toBeVisible();
      await expect(page.locator('h2:has-text("Instructions")')).toBeVisible();
      
      // Verify no error message is shown
      const errorElement = page.locator('.bg-red-50');
      await expect(errorElement).not.toBeVisible();
      
      console.log('✅ Recipe detail page loaded successfully!');
    } else {
      console.log('No recipes found on homepage - skipping test');
      test.skip();
    }
  });
  
  test('can navigate between multiple recipes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if we have recipes
    const recipeCards = page.locator('a[href^="/recipes/"]');
    const count = await recipeCards.count();
    
    if (count === 0) {
      console.log('No recipes found on homepage - skipping test');
      test.skip();
      return;
    }
    
    // Get all recipe titles
    const recipeTitles = await page.locator('h3').allTextContents();
    console.log(`Found ${recipeTitles.length} recipes`);
    
    // Test viewing first 3 recipes (or less if fewer exist)
    const recipesToTest = Math.min(3, recipeTitles.length);
    
    for (let i = 0; i < recipesToTest; i++) {
      // Go back to home
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Get the recipe title
      const title = await page.locator('h3').nth(i).textContent();
      console.log(`Testing recipe ${i + 1}: ${title}`);
      
      // Click the recipe card link
      await page.locator('a[href^="/recipes/"]').nth(i).click();
      
      // Wait for detail page
      await page.waitForURL(/\/recipes\/[^/]+$/);
      await expect(page.locator('h1')).toBeVisible();
      
      // Verify title matches
      const detailTitle = await page.locator('h1').textContent();
      expect(detailTitle).toBe(title);
      
      console.log(`✅ Recipe ${i + 1} loaded successfully`);
    }
  });
});