import { test as base, expect } from '@playwright/test';

// Test data for creating users and recipes
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'testpassword123',
    name: 'Test Admin',
    role: 'admin'
  },
  reader: {
    email: 'reader@test.com', 
    password: 'testpassword123',
    name: 'Test Reader',
    role: 'reader'
  }
};

export const testRecipe = {
  title: 'Test Chocolate Chip Cookies',
  description: 'Delicious homemade cookies',
  ingredients: ['2 cups flour', '1 cup sugar', '1/2 cup butter', '1 cup chocolate chips'],
  instructions: ['Mix dry ingredients', 'Cream butter and sugar', 'Combine all ingredients', 'Bake at 350°F for 12 minutes'],
  prepTime: 15,
  cookTime: 12,
  servings: 24,
  difficulty: 'easy' as const,
  tags: ['dessert', 'cookies', 'chocolate']
};

// Extended test with authentication helpers
export const test = base.extend<{
  authenticatedPage: any;
  adminPage: any;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Login as a reader user
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill(testUsers.reader.email);
    await page.getByTestId('password-input').fill(testUsers.reader.password);
    await page.getByTestId('login-button').click();
    
    // Wait for successful login (should redirect to home)
    await page.waitForURL('/');
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    // Login as an admin user  
    await page.goto('/auth/login');
    await page.getByTestId('email-input').fill(testUsers.admin.email);
    await page.getByTestId('password-input').fill(testUsers.admin.password);
    await page.getByTestId('login-button').click();
    
    // Wait for successful login
    await page.waitForURL('/');
    await use(page);
  }
});

export { expect };