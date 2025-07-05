import PocketBase from 'pocketbase';
import type { User, UserAuthResponse, UserLoginData, UserCreateData } from '$lib/types';

class PocketBaseService {
  private pb: PocketBase;
  private static instance: PocketBaseService;

  private constructor() {
    const baseUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';
    this.pb = new PocketBase(baseUrl);
    
    // Auto-refresh auth token
    this.pb.autoCancellation(false);
  }

  public static getInstance(): PocketBaseService {
    if (!PocketBaseService.instance) {
      PocketBaseService.instance = new PocketBaseService();
    }
    return PocketBaseService.instance;
  }

  public get client(): PocketBase {
    return this.pb;
  }

  public get isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  public get currentUser(): User | null {
    return this.pb.authStore.model as User | null;
  }

  public get token(): string | null {
    return this.pb.authStore.token;
  }

  // Authentication methods
  public async login(credentials: UserLoginData): Promise<UserAuthResponse> {
    try {
      const authData = await this.pb.collection('users').authWithPassword(
        credentials.email,
        credentials.password
      );
      return {
        record: authData.record as User,
        token: authData.token
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async register(userData: UserCreateData): Promise<UserAuthResponse> {
    try {
      // Create user
      const user = await this.pb.collection('users').create({
        ...userData,
        role: userData.role || 'reader'
      });

      // Request email verification
      await this.pb.collection('users').requestVerification(userData.email);

      // Auto-login after registration
      const authData = await this.pb.collection('users').authWithPassword(
        userData.email,
        userData.password
      );

      return {
        record: authData.record as User,
        token: authData.token
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async logout(): Promise<void> {
    this.pb.authStore.clear();
  }

  public async refreshAuth(): Promise<UserAuthResponse | null> {
    try {
      if (!this.pb.authStore.isValid) {
        return null;
      }

      const authData = await this.pb.collection('users').authRefresh();
      return {
        record: authData.record as User,
        token: authData.token
      };
    } catch (error) {
      this.pb.authStore.clear();
      return null;
    }
  }

  public async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.pb.collection('users').requestPasswordReset(email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async confirmPasswordReset(
    token: string,
    password: string,
    passwordConfirm: string
  ): Promise<void> {
    try {
      await this.pb.collection('users').confirmPasswordReset(
        token,
        password,
        passwordConfirm
      );
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async requestEmailVerification(email: string): Promise<void> {
    try {
      await this.pb.collection('users').requestVerification(email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async confirmEmailVerification(token: string): Promise<void> {
    try {
      await this.pb.collection('users').confirmVerification(token);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // OAuth methods
  public async loginWithGoogle(): Promise<UserAuthResponse> {
    try {
      const authData = await this.pb.collection('users').authWithOAuth2({
        provider: 'google'
      });
      return {
        record: authData.record as User,
        token: authData.token
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async loginWithGitHub(): Promise<UserAuthResponse> {
    try {
      const authData = await this.pb.collection('users').authWithOAuth2({
        provider: 'github'
      });
      return {
        record: authData.record as User,
        token: authData.token
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  public getFileUrl(record: any, filename: string): string {
    return this.pb.files.getUrl(record, filename);
  }

  public subscribe(collection: string, callback: (e: any) => void): () => void {
    this.pb.collection(collection).subscribe('*', callback);
    return () => this.pb.collection(collection).unsubscribe();
  }

  private handleError(error: any): Error {
    if (error?.response?.data) {
      const errorData = error.response.data;
      if (errorData.message) {
        return new Error(errorData.message);
      }
      if (errorData.data) {
        const firstField = Object.keys(errorData.data)[0];
        if (firstField && errorData.data[firstField]?.message) {
          return new Error(errorData.data[firstField].message);
        }
      }
    }
    return new Error(error?.message || 'An unexpected error occurred');
  }
}

export const pb = PocketBaseService.getInstance();