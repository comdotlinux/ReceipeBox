import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';

// Mock the PocketBase service before importing
vi.mock('$lib/services', () => ({
	pb: {
		login: vi.fn(),
		register: vi.fn(),
		logout: vi.fn(),
		refreshAuth: vi.fn(),
		loginWithGoogle: vi.fn(),
		loginWithGitHub: vi.fn(),
		requestPasswordReset: vi.fn(),
		isAuthenticated: false,
		currentUser: null,
		client: {
			authStore: {
				onChange: vi.fn()
			}
		}
	}
}));

import { authStore, user, isAuthenticated, isAdmin, authLoading, authError } from './auth';
import { pb as mockPb } from '$lib/services';

describe('Auth Store', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Reset store values
		user.set(null);
		authLoading.set(false);
		authError.set(null);
	});

	describe('Login', () => {
		it('should login successfully', async () => {
			const mockUser = {
				id: '1',
				email: 'test@example.com',
				name: 'Test User',
				role: 'reader' as const
			};

			mockPb.login.mockResolvedValue({
				record: mockUser,
				token: 'test-token'
			});

			await authStore.login('test@example.com', 'password');

			expect(mockPb.login).toHaveBeenCalledWith({
				email: 'test@example.com',
				password: 'password'
			});
			expect(get(user)).toEqual(mockUser);
			expect(get(authLoading)).toBe(false);
			expect(get(authError)).toBeNull();
		});

		it('should handle login error', async () => {
			const errorMessage = 'Invalid credentials';
			mockPb.login.mockRejectedValue(new Error(errorMessage));

			await expect(authStore.login('test@example.com', 'wrong')).rejects.toThrow(errorMessage);

			expect(get(user)).toBeNull();
			expect(get(authLoading)).toBe(false);
			expect(get(authError)).toBe(errorMessage);
		});

		it('should set loading state during login', async () => {
			mockPb.login.mockImplementation(() => {
				expect(get(authLoading)).toBe(true);
				return Promise.resolve({
					record: { id: '1', email: 'test@example.com', name: 'Test', role: 'reader' },
					token: 'token'
				});
			});

			await authStore.login('test@example.com', 'password');
			expect(get(authLoading)).toBe(false);
		});
	});

	describe('Registration', () => {
		it('should register successfully', async () => {
			const mockUser = {
				id: '1',
				email: 'new@example.com',
				name: 'New User',
				role: 'reader' as const
			};

			mockPb.register.mockResolvedValue({
				record: mockUser,
				token: 'new-token'
			});

			await authStore.register('new@example.com', 'password', 'New User');

			expect(mockPb.register).toHaveBeenCalledWith({
				email: 'new@example.com',
				password: 'password',
				name: 'New User'
			});
			expect(get(user)).toEqual(mockUser);
			expect(get(authError)).toBeNull();
		});

		it('should handle registration error', async () => {
			const errorMessage = 'Email already exists';
			mockPb.register.mockRejectedValue(new Error(errorMessage));

			await expect(authStore.register('existing@example.com', 'password', 'User')).rejects.toThrow(
				errorMessage
			);

			expect(get(user)).toBeNull();
			expect(get(authError)).toBe(errorMessage);
		});
	});

	describe('OAuth Login', () => {
		it('should login with Google', async () => {
			const mockUser = {
				id: '1',
				email: 'google@example.com',
				name: 'Google User',
				role: 'reader' as const
			};

			mockPb.loginWithGoogle.mockResolvedValue({
				record: mockUser,
				token: 'google-token'
			});

			await authStore.loginWithGoogle();

			expect(mockPb.loginWithGoogle).toHaveBeenCalled();
			expect(get(user)).toEqual(mockUser);
		});

		it('should login with GitHub', async () => {
			const mockUser = {
				id: '1',
				email: 'github@example.com',
				name: 'GitHub User',
				role: 'reader' as const
			};

			mockPb.loginWithGitHub.mockResolvedValue({
				record: mockUser,
				token: 'github-token'
			});

			await authStore.loginWithGitHub();

			expect(mockPb.loginWithGitHub).toHaveBeenCalled();
			expect(get(user)).toEqual(mockUser);
		});
	});

	describe('Logout', () => {
		it('should logout successfully', async () => {
			// Set initial user
			user.set({
				id: '1',
				email: 'test@example.com',
				name: 'Test User',
				role: 'reader',
				emailVisibility: true,
				verified: true,
				created: '2024-01-01',
				updated: '2024-01-01'
			});

			mockPb.logout.mockResolvedValue(undefined);

			await authStore.logout();

			expect(mockPb.logout).toHaveBeenCalled();
			expect(get(user)).toBeNull();
			expect(get(authError)).toBeNull();
		});
	});

	describe('Derived Stores', () => {
		it('should calculate isAuthenticated correctly', () => {
			expect(get(isAuthenticated)).toBe(false);

			user.set({
				id: '1',
				email: 'test@example.com',
				name: 'Test User',
				role: 'reader',
				emailVisibility: true,
				verified: true,
				created: '2024-01-01',
				updated: '2024-01-01'
			});

			expect(get(isAuthenticated)).toBe(true);
		});

		it('should calculate isAdmin correctly', () => {
			expect(get(isAdmin)).toBe(false);

			// Set reader user
			user.set({
				id: '1',
				email: 'reader@example.com',
				name: 'Reader User',
				role: 'reader',
				emailVisibility: true,
				verified: true,
				created: '2024-01-01',
				updated: '2024-01-01'
			});

			expect(get(isAdmin)).toBe(false);

			// Set admin user
			user.set({
				id: '2',
				email: 'admin@example.com',
				name: 'Admin User',
				role: 'admin',
				emailVisibility: true,
				verified: true,
				created: '2024-01-01',
				updated: '2024-01-01'
			});

			expect(get(isAdmin)).toBe(true);
		});
	});

	describe('Password Reset', () => {
		it('should request password reset', async () => {
			mockPb.requestPasswordReset.mockResolvedValue(undefined);

			await authStore.requestPasswordReset('test@example.com');

			expect(mockPb.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
			expect(get(authError)).toBeNull();
		});

		it('should handle password reset error', async () => {
			const errorMessage = 'User not found';
			mockPb.requestPasswordReset.mockRejectedValue(new Error(errorMessage));

			await expect(authStore.requestPasswordReset('nonexistent@example.com')).rejects.toThrow(
				errorMessage
			);

			expect(get(authError)).toBe(errorMessage);
		});
	});

	describe('Auth Refresh', () => {
		it('should refresh auth successfully', async () => {
			const mockUser = {
				id: '1',
				email: 'test@example.com',
				name: 'Test User',
				role: 'reader' as const
			};

			mockPb.refreshAuth.mockResolvedValue({
				record: mockUser,
				token: 'refreshed-token'
			});

			await authStore.refreshAuth();

			expect(mockPb.refreshAuth).toHaveBeenCalled();
			expect(get(user)).toEqual(mockUser);
		});

		it('should handle refresh failure', async () => {
			mockPb.refreshAuth.mockResolvedValue(null);

			await authStore.refreshAuth();

			expect(get(user)).toBeNull();
		});
	});

	describe('Error Management', () => {
		it('should clear error', () => {
			authError.set('Some error');
			expect(get(authError)).toBe('Some error');

			authStore.clearError();
			expect(get(authError)).toBeNull();
		});
	});
});
