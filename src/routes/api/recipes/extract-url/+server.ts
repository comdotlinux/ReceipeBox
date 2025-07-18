import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GeminiService } from '$lib/services';
import { pb } from '$lib/services';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Check authentication
		if (!pb.authStore.isValid) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check admin role
		const user = pb.authStore.model;
		if (!user || user.role !== 'admin') {
			return json({ error: 'Forbidden: Admin access required' }, { status: 403 });
		}

		// Parse request body
		const body = await request.json();
		const { url } = body;

		if (!url || typeof url !== 'string') {
			return json({ error: 'URL is required' }, { status: 400 });
		}

		// Validate URL format
		try {
			new URL(url);
		} catch {
			return json({ error: 'Invalid URL format' }, { status: 400 });
		}

		// Extract recipe using Gemini
		const geminiService = GeminiService.getInstance();
		const extractedRecipe = await geminiService.extractRecipeFromUrl(url);

		// Transform to match RecipeExtractionResponse type
		const response = {
			...extractedRecipe,
			confidence: 0.95, // Default confidence score
			source: extractedRecipe.source
		};

		return json({
			success: true,
			data: response
		});
	} catch (error) {
		console.error('Error in extract-url endpoint:', error);

		// Handle specific errors
		if (error instanceof Error) {
			if (error.message.includes('GEMINI_API_KEY')) {
				return json({ error: 'Gemini API not configured' }, { status: 500 });
			}
			if (error.message.includes('Failed to fetch URL')) {
				return json({ error: 'Could not access the provided URL' }, { status: 400 });
			}
			if (error.message.includes('Failed to extract recipe')) {
				return json({ error: error.message }, { status: 422 });
			}
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
