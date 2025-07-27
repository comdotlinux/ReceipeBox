import { describe, it, expect } from 'vitest';
import {
	hasRole,
	isAdmin,
	isReader,
	canCreateRecipe,
	canEditRecipe,
	canDeleteRecipe
} from './auth';

describe('Auth Utility Functions', () => {
	const adminUser = {
		id: 'admin123',
		email: 'admin@test.com',
		role: 'admin',
		name: 'Admin User',
		avatar: '',
		created: '2025-01-01',
		updated: '2025-01-01'
	};

	const readerUser = {
		id: 'reader123',
		email: 'reader@test.com',
		role: 'reader',
		name: 'Reader User',
		avatar: '',
		created: '2025-01-01',
		updated: '2025-01-01'
	};

	describe('hasRole', () => {
		it('should return true when user has the specified role', () => {
			expect(hasRole(adminUser, 'admin')).toBe(true);
			expect(hasRole(readerUser, 'reader')).toBe(true);
		});

		it('should return false when user does not have the specified role', () => {
			expect(hasRole(adminUser, 'reader')).toBe(false);
			expect(hasRole(readerUser, 'admin')).toBe(false);
		});

		it('should return false when user is null or undefined', () => {
			expect(hasRole(null, 'admin')).toBe(false);
			expect(hasRole(undefined, 'admin')).toBe(false);
		});

		it('should return false when user has no role', () => {
			const userWithoutRole = { ...adminUser, role: undefined };
			expect(hasRole(userWithoutRole as any, 'admin')).toBe(false);
		});
	});

	describe('isAdmin', () => {
		it('should return true for admin users', () => {
			expect(isAdmin(adminUser)).toBe(true);
		});

		it('should return false for non-admin users', () => {
			expect(isAdmin(readerUser)).toBe(false);
		});

		it('should return false for null or undefined users', () => {
			expect(isAdmin(null)).toBe(false);
			expect(isAdmin(undefined)).toBe(false);
		});
	});

	describe('isReader', () => {
		it('should return true for reader users', () => {
			expect(isReader(readerUser)).toBe(true);
		});

		it('should return false for non-reader users', () => {
			expect(isReader(adminUser)).toBe(false);
		});

		it('should return false for null or undefined users', () => {
			expect(isReader(null)).toBe(false);
			expect(isReader(undefined)).toBe(false);
		});
	});

	describe('canCreateRecipe', () => {
		it('should return true only for admin users', () => {
			expect(canCreateRecipe(adminUser)).toBe(true);
		});

		it('should return false for reader users', () => {
			expect(canCreateRecipe(readerUser)).toBe(false);
		});

		it('should return false for unauthenticated users', () => {
			expect(canCreateRecipe(null)).toBe(false);
			expect(canCreateRecipe(undefined)).toBe(false);
		});
	});

	describe('canEditRecipe', () => {
		it('should return true only for admin users', () => {
			expect(canEditRecipe(adminUser)).toBe(true);
		});

		it('should return false for reader users', () => {
			expect(canEditRecipe(readerUser)).toBe(false);
		});

		it('should return false for unauthenticated users', () => {
			expect(canEditRecipe(null)).toBe(false);
			expect(canEditRecipe(undefined)).toBe(false);
		});
	});

	describe('canDeleteRecipe', () => {
		it('should return true only for admin users', () => {
			expect(canDeleteRecipe(adminUser)).toBe(true);
		});

		it('should return false for reader users', () => {
			expect(canDeleteRecipe(readerUser)).toBe(false);
		});

		it('should return false for unauthenticated users', () => {
			expect(canDeleteRecipe(null)).toBe(false);
			expect(canDeleteRecipe(undefined)).toBe(false);
		});
	});

	describe('role-based access patterns', () => {
		it('should correctly implement admin privileges', () => {
			expect(isAdmin(adminUser)).toBe(true);
			expect(canCreateRecipe(adminUser)).toBe(true);
			expect(canEditRecipe(adminUser)).toBe(true);
			expect(canDeleteRecipe(adminUser)).toBe(true);
		});

		it('should correctly implement reader restrictions', () => {
			expect(isReader(readerUser)).toBe(true);
			expect(canCreateRecipe(readerUser)).toBe(false);
			expect(canEditRecipe(readerUser)).toBe(false);
			expect(canDeleteRecipe(readerUser)).toBe(false);
		});

		it('should handle edge cases with malformed user objects', () => {
			const malformedUser = { id: 'test', email: 'test@test.com' };
			expect(isAdmin(malformedUser as any)).toBe(false);
			expect(isReader(malformedUser as any)).toBe(false);
			expect(canCreateRecipe(malformedUser as any)).toBe(false);
		});
	});
});
