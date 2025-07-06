import type { User } from '$lib/types/auth';

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null | undefined, role: string): boolean {
	return user?.role === role;
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null | undefined): boolean {
	return hasRole(user, 'admin');
}

/**
 * Check if a user is a reader
 */
export function isReader(user: User | null | undefined): boolean {
	return hasRole(user, 'reader');
}

/**
 * Check if a user can create recipes
 */
export function canCreateRecipe(user: User | null | undefined): boolean {
	return isAdmin(user);
}

/**
 * Check if a user can edit recipes
 */
export function canEditRecipe(user: User | null | undefined): boolean {
	return isAdmin(user);
}

/**
 * Check if a user can delete recipes
 */
export function canDeleteRecipe(user: User | null | undefined): boolean {
	return isAdmin(user);
}

/**
 * Check if a user can view unpublished recipes
 */
export function canViewUnpublishedRecipes(user: User | null | undefined): boolean {
	return isAdmin(user);
}

/**
 * Get display name for user
 */
export function getUserDisplayName(user: User | null | undefined): string {
	if (!user) return 'Guest';
	return user.name || user.email || 'Unknown User';
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: string | undefined): string {
	switch (role) {
		case 'admin':
			return 'Administrator';
		case 'reader':
			return 'Reader';
		default:
			return 'Guest';
	}
}