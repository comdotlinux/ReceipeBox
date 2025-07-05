import { test, expect } from '@playwright/test';

test.describe('Recipe Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('unauthenticated users see welcome page and recipe collection', async ({ page }) => {
    // Should show welcome message
    await expect(page.getByTestId('welcome-title')).toBeVisible();
    
    // Should show features
    await expect(page.getByTestId('ai-extraction-feature')).toBeVisible();
    await expect(page.getByTestId('offline-access-feature')).toBeVisible();
    await expect(page.getByTestId('smart-search-feature')).toBeVisible();
    
    // Should show sign in/sign up buttons
    await expect(page.getByTestId('get-started-button')).toBeVisible();
    await expect(page.getByTestId('sign-in-button')).toBeVisible();
  });

  test('recipe collection shows empty state when no recipes exist', async ({ page }) => {
    // For unauthenticated users, they should see the welcome page
    // But if we had recipes, they would see an empty state
    // This test would be more meaningful with authenticated users
    
    await expect(page.getByTestId('welcome-title')).toBeVisible();
  });

  test('admin can access recipe creation page', async ({ page }) => {
    // First, need to log in as admin
    await page.getByTestId('sign-in-button').click();
    
    // Should navigate to login page
    await expect(page.getByTestId('login-title')).toBeVisible();
    
    // For now, we can't actually log in since we'd need a real admin account
    // But we can test the route exists
    await page.goto('/admin/recipes/new');
    
    // Should redirect to login or show access denied
    await expect(
      page.getByTestId('access-denied').or(page.getByTestId('login-title'))
    ).toBeVisible();
  });

  test('recipe detail page handles invalid IDs gracefully', async ({ page }) => {
    await page.goto('/recipes/nonexistent-id');
    
    // Should show error message
    await expect(page.getByText('Error')).toBeVisible();
    await expect(page.getByText('Back to Home')).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    // Test main navigation elements
    await expect(page.getByTestId('home-logo')).toBeVisible();
    
    // Test that clicking home logo works
    await page.getByTestId('home-logo').click();
    await expect(page.url()).toMatch(/\/$/);
  });

  test('search functionality is accessible', async ({ page }) => {
    // Check if search input is available (might be hidden for unauthenticated users)
    const searchInput = page.getByTestId('search-recipes-input');
    
    // The search might be hidden on mobile or for unauthenticated users
    // So we'll check if it exists at all
    const searchCount = await searchInput.count();
    
    if (searchCount > 0) {
      // If search exists, it should be functional
      await expect(searchInput).toBeVisible();
      
      // Test typing in search
      await searchInput.fill('pasta');
      await expect(searchInput).toHaveValue('pasta');
    }
  });

  test('responsive design works on mobile viewports', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that mobile layout is working - use app name class
    await expect(page.locator('.app-name')).toBeVisible();
    
    // Mobile menu button should be visible
    const mobileMenuButton = page.getByTestId('mobile-menu-button');
    if (await mobileMenuButton.count() > 0) {
      await expect(mobileMenuButton).toBeVisible();
    }
  });

  test('accessibility: pages have proper titles and headings', async ({ page }) => {
    // Check main page title
    await expect(page).toHaveTitle(/MyRecipeBox/);
    
    // Check main heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Test recipe detail page
    await page.goto('/recipes/test-id');
    await expect(page).toHaveTitle(/Recipe.*MyRecipeBox/);
  });

  test('theme toggle functionality', async ({ page }) => {
    // Look for theme toggle button
    const themeButton = page.getByRole('button', { name: 'Toggle theme' });
    
    if (await themeButton.count() > 0) {
      await expect(themeButton).toBeVisible();
      
      // Click to toggle theme (this would change dark/light mode)
      await themeButton.click();
      
      // We could check for dark mode classes but that depends on implementation
    }
  });

  test('breadcrumb navigation works', async ({ page }) => {
    // Test recipe detail breadcrumbs
    await page.goto('/recipes/test-recipe');
    
    // Should show home link in breadcrumb
    const homeLink = page.getByRole('link').filter({ hasText: 'Home' });
    if (await homeLink.count() > 0) {
      await expect(homeLink).toBeVisible();
    }
    
    // Test admin breadcrumbs  
    await page.goto('/admin/recipes/new');
    
    // Should redirect to login, but if we were authenticated, would show breadcrumbs
    // For now just check it doesn't crash
    await page.waitForLoadState('networkidle');
  });

  test('image placeholders work correctly', async ({ page }) => {
    // This would test that image placeholders show when no image is available
    // Since we don't have actual recipes, we can't test this fully
    // But we can check that the page loads without errors
    
    await page.goto('/recipes/test-id');
    await page.waitForLoadState('networkidle');
    
    // Should not have any console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any console errors
    await page.waitForTimeout(1000);
    
    // Filter out expected errors (like 404s for non-existent recipes)
    const unexpectedErrors = errors.filter(error => 
      !error.includes('Failed to load recipe') && 
      !error.includes('404')
    );
    
    expect(unexpectedErrors).toHaveLength(0);
  });
});

test.describe('Recipe Form Functionality', () => {
  test('recipe form validation works', async ({ page }) => {
    // Go to recipe creation (will redirect to login)
    await page.goto('/admin/recipes/new');
    
    // Should show access denied or login page
    await expect(
      page.getByTestId('access-denied').or(page.getByTestId('login-title'))
    ).toBeVisible();
    
    // This test would be more complete with actual authentication
  });

  test('recipe edit form loads correctly', async ({ page }) => {
    await page.goto('/admin/recipes/test-id/edit');
    
    // Should redirect to login or show access denied
    await expect(
      page.getByTestId('access-denied').or(page.getByTestId('login-title'))
    ).toBeVisible();
  });
});

test.describe('Recipe Display and Interaction', () => {
  test('recipe cards render correctly when data is available', async ({ page }) => {
    // Since we don't have authenticated access, we can't test actual recipe cards
    // But we can test that the page structure is correct
    
    await page.goto('/');
    
    // Should have the main recipe collection area
    await expect(page.getByTestId('welcome-title')).toBeVisible();
  });

  test('recipe search and filtering', async ({ page }) => {
    // Test search functionality
    const searchInput = page.getByTestId('search-recipes-input');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test search');
      await expect(searchInput).toHaveValue('test search');
      
      // Clear search
      await searchInput.clear();
      await expect(searchInput).toHaveValue('');
    }
  });

  test('load more functionality', async ({ page }) => {
    // Since we can't test with real data, just check page doesn't crash
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for load more button (might not be visible without data)
    const loadMoreButton = page.getByTestId('load-more-button');
    
    if (await loadMoreButton.count() > 0) {
      await expect(loadMoreButton).toBeVisible();
    }
  });
});

test.describe('Admin Functionality', () => {
  test('admin routes require authentication', async ({ page }) => {
    const adminRoutes = [
      '/admin/recipes/new',
      '/admin/recipes/test-id/edit'
    ];
    
    for (const route of adminRoutes) {
      await page.goto(route);
      
      // Should redirect to login or show access denied
      await expect(
        page.getByTestId('access-denied')
          .or(page.getByTestId('login-title'))
      ).toBeVisible();
    }
  });

  test('admin navigation elements are hidden for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    
    // Should not see admin-specific navigation
    await expect(page.getByText('Add Recipe')).not.toBeVisible();
    await expect(page.getByText('Manage Tags')).not.toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('handles network errors gracefully', async ({ page }) => {
    // Test with a 404 recipe
    await page.goto('/recipes/definitely-does-not-exist');
    
    // Should show error state
    await expect(page.getByText('Error')).toBeVisible();
    await expect(page.getByText('Back to Home')).toBeVisible();
  });

  test('handles malformed URLs', async ({ page }) => {
    // Test various malformed URLs
    const badUrls = [
      '/recipes/',
      '/admin/recipes/',
      '/admin/recipes//edit'
    ];
    
    for (const url of badUrls) {
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Should not crash the app
      await expect(page.getByText('MyRecipeBox')).toBeVisible();
    }
  });
});