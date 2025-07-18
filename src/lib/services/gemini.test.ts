import { describe, it, expect, vi, beforeEach } from 'vitest';
import GeminiService from './gemini';

// Mock Google Generative AI
vi.mock('@google/generative-ai', () => {
	const mockGenerateContent = vi.fn();
	const mockModel = {
		generateContent: mockGenerateContent
	};

	return {
		GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
			getGenerativeModel: vi.fn().mockReturnValue(mockModel)
		})),
		HarmCategory: {
			HARM_CATEGORY_HARASSMENT: 'harassment'
		},
		HarmBlockThreshold: {
			BLOCK_MEDIUM_AND_ABOVE: 'medium'
		}
	};
});

// Mock fetch for URL extraction tests
global.fetch = vi.fn();

describe('GeminiService', () => {
	let geminiService: GeminiService;

	beforeEach(() => {
		vi.clearAllMocks();
		// Set environment variable for tests
		vi.stubEnv('VITE_GEMINI_API_KEY', 'test-api-key');
		geminiService = GeminiService.getInstance();
	});

	describe('getInstance', () => {
		it('should return singleton instance', () => {
			const instance1 = GeminiService.getInstance();
			const instance2 = GeminiService.getInstance();
			expect(instance1).toBe(instance2);
		});
	});

	describe('extractRecipeFromUrl', () => {
		it('should throw error for invalid URL protocol', async () => {
			await expect(geminiService.extractRecipeFromUrl('ftp://example.com')).rejects.toThrow(
				'Invalid URL protocol'
			);
		});

		it('should handle fetch errors gracefully', async () => {
			vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

			await expect(geminiService.extractRecipeFromUrl('https://example.com')).rejects.toThrow(
				'Failed to extract recipe'
			);
		});
	});

	describe('extractRecipeFromImage', () => {
		it('should throw error for non-image files', async () => {
			const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });

			await expect(geminiService.extractRecipeFromImage(textFile)).rejects.toThrow(
				'File must be an image'
			);
		});
	});

	describe('testConnection', () => {
		it('should return true on successful connection', async () => {
			const mockResponse = {
				response: {
					text: () => 'Hello, I am connected!'
				}
			};

			// Access the mocked model and set up the response
			const { GoogleGenerativeAI } = await import('@google/generative-ai');
			const mockAI = new GoogleGenerativeAI('test');
			const mockModel = mockAI.getGenerativeModel({ model: 'test' });
			vi.mocked(mockModel.generateContent).mockResolvedValue(mockResponse);

			const result = await geminiService.testConnection();
			expect(result).toBe(true);
		});
	});
});
