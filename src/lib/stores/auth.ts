import { writable, derived } from 'svelte/store';
import { pb } from '$lib/services';
import type { User, UserAuthResponse } from '$lib/types';

// Re-export pb for components
export { pb };

export const user = writable<User | null>(null);
export const isAuthenticated = derived(user, ($user) => $user !== null);
export const isAdmin = derived(user, ($user) => $user?.role === 'admin');
export const isReader = derived(user, ($user) => $user?.role === 'reader');

export const authLoading = writable(false);
export const authError = writable<string | null>(null);

class AuthStore {
  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check if user is already authenticated
    if (pb.isAuthenticated && pb.currentUser) {
      user.set(pb.currentUser);
    }

    // Listen for auth changes
    let isUpdating = false;
    pb.client.authStore.onChange((token, model) => {
      if (!isUpdating) {
        isUpdating = true;
        user.set(model as User | null);
        // Use setTimeout to break the synchronous update cycle
        setTimeout(() => {
          isUpdating = false;
        }, 0);
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      authLoading.set(true);
      authError.set(null);

      const response = await pb.login({ email, password });
      user.set(response.record);
    } catch (error) {
      authError.set(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      authLoading.set(false);
    }
  }

  async register(email: string, password: string, name: string, passwordConfirm: string): Promise<void> {
    try {
      authLoading.set(true);
      authError.set(null);

      const response = await pb.register({
        email,
        password,
        passwordConfirm,
        name
      });
      user.set(response.record);
    } catch (error) {
      authError.set(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      authLoading.set(false);
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      authLoading.set(true);
      authError.set(null);

      const response = await pb.loginWithGoogle();
      user.set(response.record);
    } catch (error) {
      authError.set(error instanceof Error ? error.message : 'Google login failed');
      throw error;
    } finally {
      authLoading.set(false);
    }
  }

  async loginWithGitHub(): Promise<void> {
    try {
      authLoading.set(true);
      authError.set(null);

      const response = await pb.loginWithGitHub();
      user.set(response.record);
    } catch (error) {
      authError.set(error instanceof Error ? error.message : 'GitHub login failed');
      throw error;
    } finally {
      authLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      authLoading.set(true);
      await pb.logout();
      user.set(null);
      authError.set(null);
    } catch (error) {
      authError.set(error instanceof Error ? error.message : 'Logout failed');
    } finally {
      authLoading.set(false);
    }
  }

  async refreshAuth(): Promise<void> {
    try {
      const response = await pb.refreshAuth();
      if (response) {
        user.set(response.record);
      } else {
        user.set(null);
      }
    } catch (error) {
      user.set(null);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      authLoading.set(true);
      authError.set(null);
      await pb.requestPasswordReset(email);
    } catch (error) {
      authError.set(error instanceof Error ? error.message : 'Password reset request failed');
      throw error;
    } finally {
      authLoading.set(false);
    }
  }

  async promoteToAdmin(userId: string): Promise<void> {
    try {
      authLoading.set(true);
      authError.set(null);
      
      const updatedUser = await pb.promoteToAdmin(userId);
      
      // Update the current user if it's the same user
      if (pb.currentUser?.id === userId) {
        user.set(updatedUser);
      }
    } catch (error) {
      authError.set(error instanceof Error ? error.message : 'Failed to promote user to admin');
      throw error;
    } finally {
      authLoading.set(false);
    }
  }

  async demoteFromAdmin(userId: string): Promise<void> {
    try {
      authLoading.set(true);
      authError.set(null);
      
      const updatedUser = await pb.demoteFromAdmin(userId);
      
      // Update the current user if it's the same user
      if (pb.currentUser?.id === userId) {
        user.set(updatedUser);
      }
    } catch (error) {
      authError.set(error instanceof Error ? error.message : 'Failed to demote user from admin');
      throw error;
    } finally {
      authLoading.set(false);
    }
  }

  async updateUserRole(userId: string, role: 'admin' | 'reader'): Promise<void> {
    try {
      authLoading.set(true);
      authError.set(null);
      
      const updatedUser = await pb.updateUserRole(userId, role);
      
      // Update the current user if it's the same user
      if (pb.currentUser?.id === userId) {
        user.set(updatedUser);
      }
    } catch (error) {
      authError.set(error instanceof Error ? error.message : 'Failed to update user role');
      throw error;
    } finally {
      authLoading.set(false);
    }
  }

  clearError(): void {
    authError.set(null);
  }
}

export const authStore = new AuthStore();