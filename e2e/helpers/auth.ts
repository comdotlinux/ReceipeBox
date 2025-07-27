import { Page } from '@playwright/test';
import PocketBase from 'pocketbase';

interface TestUser {
	email: string;
	password: string;
	name: string;
	role: 'admin' | 'reader';
}

export async function createTestUser(role: 'admin' | 'reader' = 'reader'): Promise<TestUser> {
	const timestamp = Date.now();
	const randomStr = Math.random().toString(36).substring(7);
	const user: TestUser = {
		email: `test-${role}-${timestamp}-${randomStr}@example.com`,
		password: 'TestPass123!',
		name: `Test ${role} ${timestamp}`,
		role
	};
	
	// Create user directly in PocketBase
	const pb = new PocketBase('http://localhost:8090');
	
	try {
		await pb.collection('users').create({
			email: user.email,
			password: user.password,
			passwordConfirm: user.password,
			name: user.name,
			role: user.role
		});
	} catch (error) {
		console.error('Failed to create test user:', error);
		throw error;
	}
	
	return user;
}

export async function deleteTestUser(email: string): Promise<void> {
	const pb = new PocketBase('http://localhost:8090');
	
	try {
		// First, find the user
		const users = await pb.collection('users').getList(1, 1, {
			filter: `email = "${email}"`
		});
		
		if (users.items.length > 0) {
			await pb.collection('users').delete(users.items[0].id);
		}
	} catch (error) {
		console.error('Failed to delete test user:', error);
		// Don't throw - cleanup should be best effort
	}
}

export async function registerUser(
	page: Page,
	name: string,
	email: string,
	password: string
): Promise<void> {
	await page.goto('/auth/register');
	
	// Wait for form to be visible
	await page.waitForSelector('[data-testid="name-input"]', { timeout: 10000 });
	
	// Fill registration form
	await page.getByTestId('name-input').fill(name);
	await page.getByTestId('register-email-input').fill(email);
	await page.getByTestId('register-password-input').fill(password);
	await page.getByTestId('confirm-password-input').fill(password);
	
	// Wait for button to be enabled with timeout
	await page.waitForFunction(() => {
		const button = document.querySelector('[data-testid="register-button"]');
		return button && !button.hasAttribute('disabled');
	}, { timeout: 5000 });
	
	await page.getByTestId('register-button').click();
	
	// Wait for redirect to home with longer timeout
	await page.waitForURL('/', { timeout: 15000 });
}

export async function loginUser(
	page: Page,
	email: string,
	password: string
): Promise<void> {
	await page.goto('/auth/login');
	
	// Wait for form to be visible
	await page.waitForSelector('[data-testid="email-input"]', { timeout: 10000 });
	
	// Fill login form
	await page.getByTestId('email-input').fill(email);
	await page.getByTestId('password-input').fill(password);
	
	// Wait for button to be enabled after filling fields with timeout
	await page.waitForFunction(() => {
		const button = document.querySelector('[data-testid="login-button"]');
		return button && !button.hasAttribute('disabled');
	}, { timeout: 5000 });
	
	await page.getByTestId('login-button').click();
	
	// Wait for redirect to home with longer timeout
	await page.waitForURL('/', { timeout: 15000 });
}

export async function createAndLoginTestUser(
	page: Page,
	role: 'admin' | 'reader' = 'reader'
): Promise<TestUser> {
	const user = await createTestUser(role);
	await loginUser(page, user.email, user.password);
	return user;
}

export async function logout(page: Page): Promise<void> {
	// Navigate to home first to ensure the header is visible
	await page.goto('/');
	
	// Click user menu button (assumes we're logged in)
	await page.locator('button[aria-label="User menu"]').click();
	
	// Click sign out
	await page.getByText('Sign out').click();
	
	// Should redirect to home
	await page.waitForURL('/');
}