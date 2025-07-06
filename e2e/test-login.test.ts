import { test, expect } from '@playwright/test';

test('verify admin login works', async ({ page }) => {
  // Go to login page
  await page.goto('/auth/login');
  
  // Fill login form
  await page.getByTestId('email-input').fill('admin@test.com');
  await page.getByTestId('password-input').fill('testpassword123');
  await page.getByTestId('login-button').click();
  
  // Should redirect to home
  await page.waitForURL('/');
  
  // Should see admin menu
  await expect(page.getByRole('link', { name: 'Add Recipe', exact: true }).first()).toBeVisible();
  
  // Should be able to navigate to recipe creation page
  await page.getByRole('link', { name: 'Add Recipe', exact: true }).first().click();
  await page.waitForURL('/admin/recipes/new');
  
  // Should see the form
  await expect(page.locator('input[placeholder="Enter recipe title"]')).toBeVisible();
  
  console.log('✅ Admin login and navigation works!');
});