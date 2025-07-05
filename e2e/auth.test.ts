import { test, expect } from '@playwright/test';

test.describe('Authentication with Real PocketBase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can register successfully', async ({ page }) => {
    // Navigate to register page
    await page.getByTestId('get-started-button').click();
    await expect(page).toHaveURL('/auth/register');

    // Fill registration form with unique email
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('register-email-input').fill(uniqueEmail);
    await page.getByTestId('register-password-input').fill('testpassword123');
    await page.getByTestId('confirm-password-input').fill('testpassword123');

    // Submit registration
    await page.getByTestId('register-button').click();

    // Should redirect to home page after successful registration
    await expect(page).toHaveURL('/');
  });

  test('user can login with existing credentials', async ({ page }) => {
    // Navigate to login page
    await page.getByTestId('sign-in-button').click();
    await expect(page).toHaveURL('/auth/login');

    // Use the test admin credentials created in global setup
    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('testpassword123');
    await page.getByTestId('login-button').click();

    // Should redirect to home page after successful login
    await expect(page).toHaveURL('/');
  });

  test('registration shows error for password mismatch', async ({ page }) => {
    await page.getByTestId('get-started-button').click();
    
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('register-email-input').fill('test@example.com');
    await page.getByTestId('register-password-input').fill('testpassword123');
    await page.getByTestId('confirm-password-input').fill('wrongpassword');
    
    await page.getByTestId('register-button').click();

    // Should show password mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('registration shows error for weak password', async ({ page }) => {
    await page.getByTestId('get-started-button').click();
    
    await page.getByTestId('name-input').fill('Test User');
    await page.getByTestId('register-email-input').fill('test@example.com');
    await page.getByTestId('register-password-input').fill('weak');
    await page.getByTestId('confirm-password-input').fill('weak');
    
    await page.getByTestId('register-button').click();

    // Should show weak password error in the error alert (not the hint text)
    await expect(page.locator('.bg-red-100')).toContainText('Password must be at least 8 characters long');
  });

  test('login shows error for invalid credentials', async ({ page }) => {
    await page.getByTestId('sign-in-button').click();
    
    await page.getByTestId('email-input').fill('invalid@example.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-button').click();

    // Should show login error
    await expect(page.locator('.bg-red-100')).toBeVisible();
  });

  test('admin user can access admin routes', async ({ page }) => {
    // Register a new admin user for this test
    const adminEmail = `admin-${Date.now()}@test.com`;
    await page.getByTestId('get-started-button').click();
    await page.getByTestId('name-input').fill('Test Admin');
    await page.getByTestId('register-email-input').fill(adminEmail);
    await page.getByTestId('register-password-input').fill('testpassword123');
    await page.getByTestId('confirm-password-input').fill('testpassword123');
    await page.getByTestId('register-button').click();
    
    await expect(page).toHaveURL('/');

    // Navigate to admin recipe creation page
    await page.goto('/admin/recipes/new');
    
    // Since new users are created as 'reader' by default, this should show access denied
    await expect(page.getByTestId('access-denied')).toBeVisible();
  });

  test('reader user cannot access admin routes', async ({ page }) => {
    // Register a new reader user for this test
    const readerEmail = `reader-${Date.now()}@test.com`;
    await page.getByTestId('get-started-button').click();
    await page.getByTestId('name-input').fill('Test Reader');
    await page.getByTestId('register-email-input').fill(readerEmail);
    await page.getByTestId('register-password-input').fill('testpassword123');
    await page.getByTestId('confirm-password-input').fill('testpassword123');
    await page.getByTestId('register-button').click();
    
    await expect(page).toHaveURL('/');

    // Try to navigate to admin recipe creation page
    await page.goto('/admin/recipes/new');
    
    // Since new users are created as 'reader' by default, this should show access denied
    await expect(page.getByTestId('access-denied')).toBeVisible();
  });
});