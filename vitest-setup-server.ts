import { vi, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock PocketBase
vi.mock('pocketbase', () => ({
	default: vi.fn(() => ({
		collection: vi.fn(() => ({
			authWithPassword: vi.fn(),
			authWithOAuth2: vi.fn(),
			create: vi.fn(),
			getList: vi.fn(),
			getOne: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
			authRefresh: vi.fn(),
			requestVerification: vi.fn(),
			confirmVerification: vi.fn(),
			requestPasswordReset: vi.fn(),
			confirmPasswordReset: vi.fn(),
			subscribe: vi.fn(),
			unsubscribe: vi.fn()
		})),
		authStore: {
			isValid: false,
			model: null,
			token: null,
			clear: vi.fn(),
			onChange: vi.fn()
		},
		files: {
			getUrl: vi.fn()
		},
		send: vi.fn(),
		autoCancellation: vi.fn()
	}))
}));

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
	browser: false,
	dev: true
}));

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
	},
	recipeService: {
		getRecipes: vi.fn(),
		getRecipe: vi.fn(),
		createRecipe: vi.fn(),
		updateRecipe: vi.fn(),
		deleteRecipe: vi.fn()
	},
	tagService: {
		getTags: vi.fn(),
		createTag: vi.fn(),
		updateTag: vi.fn(),
		deleteTag: vi.fn()
	}
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	preloadData: vi.fn(),
	preloadCode: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	pushState: vi.fn(),
	replaceState: vi.fn()
}));

vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn((callback) => {
			callback({
				url: new URL('http://localhost:3000'),
				params: {},
				route: { id: '/' },
				status: 200,
				error: null,
				data: {},
				form: null
			});
			return () => {};
		})
	},
	navigating: {
		subscribe: vi.fn((callback) => {
			callback(null);
			return () => {};
		})
	},
	updated: {
		subscribe: vi.fn((callback) => {
			callback(false);
			return () => {};
		}),
		check: vi.fn()
	}
}));

// Mock environment variables
vi.mock('$env/static/private', () => ({}));
vi.mock('$env/static/public', () => ({
	PUBLIC_POCKETBASE_URL: 'http://localhost:8090'
}));
vi.mock('$env/dynamic/private', () => ({}));
vi.mock('$env/dynamic/public', () => ({}));

// Global test setup
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock crypto API for secure random values
Object.defineProperty(global, 'crypto', {
	value: {
		getRandomValues: (arr: any) => {
			for (let i = 0; i < arr.length; i++) {
				arr[i] = Math.floor(Math.random() * 256);
			}
			return arr;
		},
		randomUUID: () => '123e4567-e89b-12d3-a456-426614174000'
	}
});

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
	value: {
		getItem: vi.fn(),
		setItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn()
	},
	writable: true
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
	value: {
		getItem: vi.fn(),
		setItem: vi.fn(),
		removeItem: vi.fn(),
		clear: vi.fn()
	},
	writable: true
});
