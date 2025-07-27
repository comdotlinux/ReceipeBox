import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, deleteTestUser } from './helpers/auth';

test.describe('Tag Management', () => {
	test('tag management page is only accessible to admins', async ({ page }) => {
		// Test with reader user
		const readerUser = await createTestUser('reader');
		
		try {
			await loginUser(page, readerUser.email, readerUser.password);
			
			// Try to access tag management
			await page.goto('/admin/tags');
			
			// Should be redirected to home
			await expect(page).toHaveURL('/');
		} finally {
			await deleteTestUser(readerUser.email);
		}
		
		// Test with admin user
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			
			// Access tag management
			await page.goto('/admin/tags');
			
			// Should stay on the page
			await expect(page).toHaveURL('/admin/tags');
			await expect(page.locator('h1')).toContainText('Manage Tags');
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('admin can navigate to tag management from header', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			
			// Click Manage Tags link in navigation header (not the quick action card)
			await page.locator('header').getByRole('link', { name: 'Manage Tags' }).click();
			
			// Should navigate to tag management page
			await expect(page).toHaveURL('/admin/tags');
			await expect(page.locator('h1')).toContainText('Manage Tags');
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('admin can create a new tag', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			await page.goto('/admin/tags');
			
			// Click Create Tag button (wait for it to be visible first)
			await page.waitForSelector('[data-testid="create-tag-button"]', { timeout: 10000 });
			await page.getByTestId('create-tag-button').click();
			
			// Fill in tag form
			const uniqueTagName = `TestTag${Date.now()}`;
			await page.getByTestId('tag-name-input').fill(uniqueTagName);
			
			// Select a color
			await page.getByTestId('tag-color-input').fill('#ef4444');
			
			// Save the tag
			await page.getByTestId('save-tag-button').click();
			
			// Tag should appear in the list
			await expect(page.getByText(uniqueTagName)).toBeVisible();
			
			// Should show with the selected color
			const tagElement = page.locator(`text=${uniqueTagName}`).first();
			await expect(tagElement).toHaveCSS('background-color', 'rgb(239, 68, 68)');
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('tag creation form validation works', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			await page.goto('/admin/tags');
			
			// Click Create Tag button (wait for it to be visible first)
			await page.waitForSelector('[data-testid="create-tag-button"]', { timeout: 10000 });
			await page.getByTestId('create-tag-button').click();
			
			// Try to save without entering name
			const saveButton = page.getByTestId('save-tag-button');
			await expect(saveButton).toBeDisabled();
			
			// Enter a name
			await page.getByTestId('tag-name-input').fill('ValidTag');
			
			// Save button should be enabled
			await expect(saveButton).toBeEnabled();
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('admin can edit an existing tag', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			await page.goto('/admin/tags');
			
			// First create a tag
			await page.getByTestId('create-tag-button').click();
			const originalName = `EditableTag${Date.now()}`;
			await page.getByTestId('tag-name-input').fill(originalName);
			await page.getByTestId('save-tag-button').click();
			
			// Wait for tag to appear
			await expect(page.getByText(originalName)).toBeVisible();
			
			// Click edit button for the tag
			const tagSlug = originalName.toLowerCase().replace(/\s+/g, '-');
			await page.getByTestId(`edit-tag-${tagSlug}`).click();
			
			// Edit the tag name
			const newName = `${originalName}Edited`;
			await page.getByTestId('tag-name-input').clear();
			await page.getByTestId('tag-name-input').fill(newName);
			
			// Change color
			await page.getByTestId('tag-color-input').fill('#22c55e');
			
			// Save changes
			await page.getByTestId('save-tag-button').click();
			
			// Old name should not be visible
			await expect(page.getByText(originalName, { exact: true })).not.toBeVisible();
			
			// New name should be visible
			await expect(page.getByText(newName)).toBeVisible();
			
			// Should have new color
			const tagElement = page.locator(`text=${newName}`).first();
			await expect(tagElement).toHaveCSS('background-color', 'rgb(34, 197, 94)');
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('admin can delete a tag', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			await page.goto('/admin/tags');
			
			// First create a tag
			await page.getByTestId('create-tag-button').click();
			const tagName = `DeletableTag${Date.now()}`;
			await page.getByTestId('tag-name-input').fill(tagName);
			await page.getByTestId('save-tag-button').click();
			
			// Wait for tag to appear
			await expect(page.getByText(tagName)).toBeVisible();
			
			// Set up dialog handler for confirmation
			page.on('dialog', dialog => dialog.accept());
			
			// Click delete button for the tag
			const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-');
			await page.getByTestId(`delete-tag-${tagSlug}`).click();
			
			// Tag should be removed
			await expect(page.getByText(tagName)).not.toBeVisible();
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('tag color presets work correctly', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			await page.goto('/admin/tags');
			
			// Click Create Tag button (wait for it to be visible first)
			await page.waitForSelector('[data-testid="create-tag-button"]', { timeout: 10000 });
			await page.getByTestId('create-tag-button').click();
			
			// Enter tag name
			await page.getByTestId('tag-name-input').fill('ColorTest');
			
			// Click on a color preset (the first one)
			const colorPresets = page.locator('button[title^="#"]');
			const firstPreset = colorPresets.first();
			const presetColor = await firstPreset.getAttribute('title');
			await firstPreset.click();
			
			// Color input should update
			await expect(page.getByTestId('tag-color-input')).toHaveValue(presetColor);
			
			// Preview should update
			const preview = page.locator('text=ColorTest').first();
			await expect(preview).toBeVisible();
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('tag search functionality works', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			await page.goto('/admin/tags');
			
			// Create multiple tags
			const tagNames = [
				`SearchableTag${Date.now()}`,
				`AnotherTag${Date.now()}`,
				`DifferentTag${Date.now()}`
			];
			
			for (const tagName of tagNames) {
				await page.getByTestId('create-tag-button').click();
				await page.getByTestId('tag-name-input').fill(tagName);
				await page.getByTestId('save-tag-button').click();
				await expect(page.getByText(tagName)).toBeVisible();
			}
			
			// Search for "Searchable"
			await page.getByTestId('search-tags-input').fill('Searchable');
			await page.getByTestId('search-tags-button').click();
			
			// Should only show matching tag
			await expect(page.getByText(tagNames[0])).toBeVisible();
			await expect(page.getByText(tagNames[1])).not.toBeVisible();
			await expect(page.getByText(tagNames[2])).not.toBeVisible();
			
			// Clear search
			await page.getByTestId('search-tags-input').clear();
			await page.getByTestId('search-tags-button').click();
			
			// All tags should be visible again
			for (const tagName of tagNames) {
				await expect(page.getByText(tagName)).toBeVisible();
			}
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('popular tags section displays correctly', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			await page.goto('/admin/tags');
			
			// Check popular tags section exists
			await expect(page.getByText('Popular Tags')).toBeVisible();
			
			// Create a tag and use it in a recipe to increase usage count
			await page.getByTestId('create-tag-button').click();
			const tagName = `PopularTag${Date.now()}`;
			await page.getByTestId('tag-name-input').fill(tagName);
			await page.getByTestId('save-tag-button').click();
			
			// Create a recipe with this tag
			await page.goto('/admin/recipes/new');
			await page.fill('input[placeholder="Enter recipe title"]', `Recipe with ${tagName}`);
			await page.fill('input[placeholder="Ingredient name"]', 'Test Ingredient');
			await page.fill('textarea[placeholder="Describe this step in detail..."]', 'Test instruction');
			
			// Add the tag
			await page.fill('input[placeholder="Add tags (press Enter)"]', tagName);
			await page.keyboard.press('Enter');
			
			await page.click('button:has-text("Create Recipe")');
			await page.waitForURL(/\/recipes\/.+/);
			
			// Go back to tags page
			await page.goto('/admin/tags');
			
			// The tag might appear in popular tags (depending on existing data)
			const popularSection = page.locator('text=Popular Tags').locator('..');
			const tagInPopular = popularSection.getByText(tagName);
			
			// If it appears, it should show usage count
			if (await tagInPopular.isVisible()) {
				await expect(popularSection.getByText(/\d+ uses?/)).toBeVisible();
			}
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('tag form can be cancelled', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			await page.goto('/admin/tags');
			
			// Click Create Tag button (wait for it to be visible first)
			await page.waitForSelector('[data-testid="create-tag-button"]', { timeout: 10000 });
			await page.getByTestId('create-tag-button').click();
			
			// Fill in some data
			await page.getByTestId('tag-name-input').fill('CancelledTag');
			
			// Click Cancel
			await page.getByText('Cancel').click();
			
			// Form should be hidden
			await expect(page.getByTestId('tag-name-input')).not.toBeVisible();
			
			// Tag should not be created
			await expect(page.getByText('CancelledTag')).not.toBeVisible();
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});

	test('empty state displays when no tags exist', async ({ page }) => {
		const adminUser = await createTestUser('admin');
		
		try {
			await loginUser(page, adminUser.email, adminUser.password);
			await page.goto('/admin/tags');
			
			// If there are no tags, empty state should show
			const noTagsMessage = page.getByText('No Tags Found');
			if (await noTagsMessage.isVisible()) {
				await expect(page.getByText('Get started by creating your first tag')).toBeVisible();
				await expect(page.getByText('Create First Tag')).toBeVisible();
			}
		} finally {
			await deleteTestUser(adminUser.email);
		}
	});
});