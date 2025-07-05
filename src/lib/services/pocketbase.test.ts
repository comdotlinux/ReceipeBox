import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock PocketBase before importing
vi.mock('pocketbase', () => ({
  default: vi.fn().mockImplementation(() => ({
    collection: vi.fn(),
    authStore: {
      isValid: false,
      model: null,
      token: null,
      clear: vi.fn(),
      onChange: vi.fn()
    },
    send: vi.fn(),
    autoCancellation: vi.fn(),
    files: {
      getUrl: vi.fn()
    }
  }))
}));

import { pb } from './pocketbase';

// Get the mock instance for testing
const mockPocketBase = (pb as any).client;

describe('PocketBaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should login with email and password', async () => {
      const mockAuth = {
        authWithPassword: vi.fn().mockResolvedValue({
          record: { id: '1', email: 'test@example.com', name: 'Test User', role: 'reader' },
          token: 'mock-token'
        })
      };
      
      pb.client.collection = vi.fn().mockReturnValue(mockAuth);

      const result = await pb.login({ email: 'test@example.com', password: 'password' });

      expect(pb.client.collection).toHaveBeenCalledWith('users');
      expect(mockAuth.authWithPassword).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result.record.email).toBe('test@example.com');
      expect(result.token).toBe('mock-token');
    });

    it('should register a new user', async () => {
      const mockCollection = {
        create: vi.fn().mockResolvedValue({ id: '1', email: 'test@example.com' }),
        requestVerification: vi.fn().mockResolvedValue({}),
        authWithPassword: vi.fn().mockResolvedValue({
          record: { id: '1', email: 'test@example.com', name: 'Test User', role: 'reader' },
          token: 'mock-token'
        })
      };
      
      mockPocketBase.collection.mockReturnValue(mockCollection);

      const result = await pb.register({
        email: 'test@example.com',
        password: 'password',
        passwordConfirm: 'password',
        name: 'Test User'
      });

      expect(mockCollection.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        passwordConfirm: 'password',
        name: 'Test User',
        role: 'reader'
      });
      expect(mockCollection.requestVerification).toHaveBeenCalledWith('test@example.com');
      expect(mockCollection.authWithPassword).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result.record.email).toBe('test@example.com');
    });

    it('should logout and clear auth store', async () => {
      await pb.logout();
      expect(mockPocketBase.authStore.clear).toHaveBeenCalled();
    });

    it('should refresh authentication', async () => {
      mockPocketBase.authStore.isValid = true;
      const mockAuth = {
        authRefresh: vi.fn().mockResolvedValue({
          record: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'new-token'
        })
      };
      
      mockPocketBase.collection.mockReturnValue(mockAuth);

      const result = await pb.refreshAuth();

      expect(mockAuth.authRefresh).toHaveBeenCalled();
      expect(result?.record.email).toBe('test@example.com');
      expect(result?.token).toBe('new-token');
    });

    it('should return null when refresh fails', async () => {
      mockPocketBase.authStore.isValid = false;
      
      const result = await pb.refreshAuth();
      expect(result).toBeNull();
    });

    it('should request password reset', async () => {
      const mockCollection = {
        requestPasswordReset: vi.fn().mockResolvedValue({})
      };
      
      mockPocketBase.collection.mockReturnValue(mockCollection);

      await pb.requestPasswordReset('test@example.com');

      expect(mockCollection.requestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle OAuth login with Google', async () => {
      const mockAuth = {
        authWithOAuth2: vi.fn().mockResolvedValue({
          record: { id: '1', email: 'test@gmail.com', name: 'Google User', role: 'reader' },
          token: 'oauth-token'
        })
      };
      
      mockPocketBase.collection.mockReturnValue(mockAuth);

      const result = await pb.loginWithGoogle();

      expect(mockAuth.authWithOAuth2).toHaveBeenCalledWith({
        provider: 'google'
      });
      expect(result.record.email).toBe('test@gmail.com');
      expect(result.token).toBe('oauth-token');
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const mockAuth = {
        authWithPassword: vi.fn().mockRejectedValue({
          response: {
            data: {
              message: 'Invalid credentials'
            }
          }
        })
      };
      
      mockPocketBase.collection.mockReturnValue(mockAuth);

      await expect(pb.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('should handle field validation errors', async () => {
      const mockAuth = {
        authWithPassword: vi.fn().mockRejectedValue({
          response: {
            data: {
              data: {
                email: {
                  message: 'Invalid email format'
                }
              }
            }
          }
        })
      };
      
      mockPocketBase.collection.mockReturnValue(mockAuth);

      await expect(pb.login({ email: 'invalid', password: 'password' }))
        .rejects.toThrow('Invalid email format');
    });

    it('should handle unknown errors', async () => {
      const mockAuth = {
        authWithPassword: vi.fn().mockRejectedValue(new Error('Network error'))
      };
      
      mockPocketBase.collection.mockReturnValue(mockAuth);

      await expect(pb.login({ email: 'test@example.com', password: 'password' }))
        .rejects.toThrow('Network error');
    });
  });

  describe('Utilities', () => {
    it('should get file URL', () => {
      const mockFiles = {
        getUrl: vi.fn().mockReturnValue('https://example.com/file.jpg')
      };
      
      mockPocketBase.files = mockFiles;

      const url = pb.getFileUrl({ id: '1' }, 'avatar.jpg');

      expect(mockFiles.getUrl).toHaveBeenCalledWith({ id: '1' }, 'avatar.jpg');
      expect(url).toBe('https://example.com/file.jpg');
    });

    it('should setup subscription', () => {
      const mockCollection = {
        subscribe: vi.fn(),
        unsubscribe: vi.fn()
      };
      
      mockPocketBase.collection.mockReturnValue(mockCollection);

      const callback = vi.fn();
      const unsubscribe = pb.subscribe('recipes', callback);

      expect(mockCollection.subscribe).toHaveBeenCalledWith('*', callback);

      unsubscribe();
      expect(mockCollection.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Properties', () => {
    it('should check authentication status', () => {
      mockPocketBase.authStore.isValid = true;
      expect(pb.isAuthenticated).toBe(true);

      mockPocketBase.authStore.isValid = false;
      expect(pb.isAuthenticated).toBe(false);
    });

    it('should get current user', () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockPocketBase.authStore.model = mockUser;
      
      expect(pb.currentUser).toBe(mockUser);
    });

    it('should get token', () => {
      mockPocketBase.authStore.token = 'test-token';
      expect(pb.token).toBe('test-token');
    });
  });
});