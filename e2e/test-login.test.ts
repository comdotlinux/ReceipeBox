import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, deleteTestUser } from './helpers/auth';

test('verify admin login works', async ({ page }) => {
	// Create a fresh admin user for this test
	const adminUser = await createTestUser('admin');
	
	try {
		// Login with the admin user
		await loginUser(page, adminUser.email, adminUser.password);

		// Should see admin menu
		await expect(page.getByRole('link', { name: 'Add Recipe', exact: true }).first()).toBeVisible();

		// Should be able to navigate to recipe creation page
		await page.getByRole('link', { name: 'Add Recipe', exact: true }).first().click();
		await page.waitForURL('/admin/recipes/new');

		// Should see the form
		await expect(page.locator('input[placeholder="Enter recipe title"]')).toBeVisible();

		console.log('✅ Admin login and navigation works!');
	} finally {
		// Clean up - delete the test user
		await deleteTestUser(adminUser.email);
	}
});
