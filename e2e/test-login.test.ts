import { test, expect } from '@playwright/test';

test('verify admin login works', async ({ page }) => {
  // Go to login page
  await page.goto('/auth/login');
  
  // Fill login form
  await page.fill('input#email', 'a@b.c');
  await page.fill('input#password', 'abcabcabc');
  await page.click('button[type="submit"]');
  
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