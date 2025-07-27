import { test, expect } from '@playwright/test';

test.describe('Theme Toggle Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage to start fresh
		await page.goto('/');
		await page.evaluate(() => {
			localStorage.clear();
		});
		await page.reload();
	});

	test('theme toggle button should change theme between light and dark modes', async ({ page }) => {
		await page.goto('/');

		// Wait for page to load and theme to initialize
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Find the theme toggle button
		const themeButton = page.locator('button[aria-label="Toggle theme"]');
		await expect(themeButton).toBeVisible();

		// Check initial state (should default to system/light mode for most users)
		const initialHtmlClass = await page.locator('html').getAttribute('class');
		console.log('Initial HTML class:', initialHtmlClass);

		// Get initial theme from localStorage
		const initialTheme = await page.evaluate(() => localStorage.getItem('theme'));
		console.log('Initial theme from localStorage:', initialTheme);

		// Test CSS classes that should change between light and dark modes
		const elementsToCheck = [
			{ selector: 'html', lightClass: null, darkClass: 'dark' },
			{ selector: 'header', lightClass: 'bg-white', darkClass: 'dark:bg-gray-800' },
			{ selector: 'h1[data-testid="welcome-title"]', lightClass: 'text-gray-900', darkClass: 'dark:text-white' },
			{ selector: 'body', lightClass: 'bg-gray-50', darkClass: 'dark:bg-gray-900' },
			{ selector: '.app-name', lightClass: 'text-gray-900', darkClass: 'dark:text-white' },
			{ selector: 'a[href="/auth/register"]', lightClass: 'bg-blue-600', darkClass: 'bg-blue-600' },
			{ selector: 'a[href="/auth/login"]', lightClass: 'bg-white', darkClass: 'dark:bg-gray-800' },
			{ selector: 'a[href="/auth/login"]', lightClass: 'text-gray-700', darkClass: 'dark:text-gray-300' },
			{ selector: 'p', lightClass: 'text-gray-600', darkClass: 'dark:text-gray-400' },
			{ selector: 'header', lightClass: 'border-gray-200', darkClass: 'dark:border-gray-700' }
		];

		// Function to check if element has dark theme styling
		const isDarkTheme = async () => {
			const htmlClass = await page.locator('html').getAttribute('class');
			return htmlClass?.includes('dark') || false;
		};

		// Function to get computed styles for debugging
		const getElementStyles = async (selector: string) => {
			try {
				const element = page.locator(selector).first();
				if (await element.count() === 0) return 'Element not found';
				
				const styles = await element.evaluate((el) => {
					const computed = window.getComputedStyle(el);
					return {
						backgroundColor: computed.backgroundColor,
						color: computed.color,
						borderColor: computed.borderColor
					};
				});
				return styles;
			} catch (error) {
				return `Error: ${error}`;
			}
		};

		// Check initial theme state
		const initialIsDark = await isDarkTheme();
		console.log('Initial dark mode state:', initialIsDark);

		// Log initial styles for debugging
		console.log('\n--- Initial Styles ---');
		for (const element of elementsToCheck.slice(0, 5)) {
			const styles = await getElementStyles(element.selector);
			console.log(`${element.selector}:`, styles);
		}

		// Click the theme toggle button
		console.log('\n--- Clicking theme toggle button ---');
		await themeButton.click();
		
		// Wait for theme change to take effect
		await page.waitForTimeout(500);

		// Check if theme changed
		const afterClickIsDark = await isDarkTheme();
		console.log('After click dark mode state:', afterClickIsDark);

		// Verify the theme actually changed
		expect(afterClickIsDark).not.toBe(initialIsDark);

		// Check localStorage was updated
		const newTheme = await page.evaluate(() => localStorage.getItem('theme'));
		console.log('New theme from localStorage:', newTheme);
		expect(newTheme).not.toBe(initialTheme);

		// Log styles after theme change
		console.log('\n--- Styles After Theme Change ---');
		for (const element of elementsToCheck.slice(0, 5)) {
			const styles = await getElementStyles(element.selector);
			console.log(`${element.selector}:`, styles);
		}

		// Verify HTML element has correct class
		const finalHtmlClass = await page.locator('html').getAttribute('class');
		console.log('Final HTML class:', finalHtmlClass);
		
		if (afterClickIsDark) {
			expect(finalHtmlClass).toContain('dark');
		} else {
			expect(finalHtmlClass).not.toContain('dark');
		}

		// Test clicking again to toggle back
		console.log('\n--- Clicking theme toggle button again ---');
		await themeButton.click();
		await page.waitForTimeout(500);

		const secondToggleIsDark = await isDarkTheme();
		console.log('After second click dark mode state:', secondToggleIsDark);
		
		// Should have toggled back OR moved to the next theme in cycle
		// (since we have light -> dark -> system -> light cycle)
		expect(secondToggleIsDark).not.toBe(afterClickIsDark);

		// Test one more click to complete the cycle
		console.log('\n--- Third click to test full cycle ---');
		await themeButton.click();
		await page.waitForTimeout(500);

		const thirdToggleIsDark = await isDarkTheme();
		console.log('After third click dark mode state:', thirdToggleIsDark);

		// Verify theme persistence by reloading page
		console.log('\n--- Testing theme persistence ---');
		await page.reload();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		const afterReloadIsDark = await isDarkTheme();
		const afterReloadTheme = await page.evaluate(() => localStorage.getItem('theme'));
		console.log('After reload dark mode state:', afterReloadIsDark);
		console.log('After reload theme from localStorage:', afterReloadTheme);

		// Theme should persist after reload
		expect(afterReloadTheme).toBeTruthy();
	});

	test('theme toggle button icon should change based on current theme', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		const themeButton = page.locator('button[aria-label="Toggle theme"]');
		await expect(themeButton).toBeVisible();

		// Function to check which icon is displayed
		const getDisplayedIcon = async () => {
			const sunIcon = themeButton.locator('svg path[d*="M12 3v1m0 16v1m9-9h-1M4 12H3"]');
			const moonIcon = themeButton.locator('svg path[d*="M20.354 15.354A9 9 0"]');
			
			const sunVisible = await sunIcon.count() > 0;
			const moonVisible = await moonIcon.count() > 0;
			
			return { sun: sunVisible, moon: moonVisible };
		};

		// Check initial icon
		const initialIcon = await getDisplayedIcon();
		console.log('Initial icon state:', initialIcon);

		// Click to toggle theme
		await themeButton.click();
		await page.waitForTimeout(500);

		// Check icon changed
		const afterClickIcon = await getDisplayedIcon();
		console.log('After click icon state:', afterClickIcon);

		// Icon should have changed
		expect(afterClickIcon.sun).not.toBe(initialIcon.sun);
		expect(afterClickIcon.moon).not.toBe(initialIcon.moon);
	});

	test('computed styles should actually change when theme toggles', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);

		// Elements to check for actual computed style changes
		const testElements = [
			'body',
			'header', 
			'h1[data-testid="welcome-title"]',
			'p',
			'.app-name'
		];

		// Get initial computed styles
		const initialStyles: Record<string, any> = {};
		for (const selector of testElements) {
			try {
				const element = page.locator(selector).first();
				if (await element.count() > 0) {
					initialStyles[selector] = await element.evaluate((el) => {
						const computed = window.getComputedStyle(el);
						return {
							backgroundColor: computed.backgroundColor,
							color: computed.color
						};
					});
				}
			} catch (error) {
				console.log(`Could not get styles for ${selector}:`, error);
			}
		}

		console.log('Initial computed styles:', initialStyles);

		// Toggle theme
		const themeButton = page.locator('button[aria-label="Toggle theme"]');
		await themeButton.click();
		await page.waitForTimeout(1000); // Give more time for styles to update

		// Get styles after toggle
		const afterToggleStyles: Record<string, any> = {};
		for (const selector of testElements) {
			try {
				const element = page.locator(selector).first();
				if (await element.count() > 0) {
					afterToggleStyles[selector] = await element.evaluate((el) => {
						const computed = window.getComputedStyle(el);
						return {
							backgroundColor: computed.backgroundColor,
							color: computed.color
						};
					});
				}
			} catch (error) {
				console.log(`Could not get styles for ${selector}:`, error);
			}
		}

		console.log('After toggle computed styles:', afterToggleStyles);

		// Verify at least some styles changed
		let stylesChanged = false;
		for (const selector of testElements) {
			if (initialStyles[selector] && afterToggleStyles[selector]) {
				const initial = initialStyles[selector];
				const after = afterToggleStyles[selector];
				
				if (initial.backgroundColor !== after.backgroundColor || 
					initial.color !== after.color) {
					stylesChanged = true;
					console.log(`✅ Styles changed for ${selector}`);
					console.log(`  Background: ${initial.backgroundColor} → ${after.backgroundColor}`);
					console.log(`  Color: ${initial.color} → ${after.color}`);
				} else {
					console.log(`❌ No style change for ${selector}`);
				}
			}
		}

		expect(stylesChanged).toBe(true);
	});

	test('debug theme system internals', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Listen for console logs
		const consoleLogs: string[] = [];
		page.on('console', (msg) => {
			consoleLogs.push(`${msg.type()}: ${msg.text()}`);
		});

		await page.waitForTimeout(2000);

		// Check if theme initialization ran
		const hasThemeInitLogs = consoleLogs.some(log => 
			log.includes('Initial theme:') || 
			log.includes('Applying theme:') ||
			log.includes('Initial script')
		);

		console.log('Console logs during initialization:');
		consoleLogs.forEach(log => console.log(log));

		expect(hasThemeInitLogs).toBe(true);

		// Click theme toggle and capture more logs
		const themeButton = page.locator('button[aria-label="Toggle theme"]');
		await themeButton.click();
		await page.waitForTimeout(1000);

		console.log('Console logs after theme toggle:');
		consoleLogs.forEach(log => console.log(log));

		// Check if theme toggle logs appeared
		const hasThemeToggleLogs = consoleLogs.some(log => 
			log.includes('Setting theme to:') || 
			log.includes('Theme store changed to:')
		);

		expect(hasThemeToggleLogs).toBe(true);
	});
});