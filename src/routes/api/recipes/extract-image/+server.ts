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

		// Parse multipart form data
		const formData = await request.formData();
		const imageFile = formData.get('image') as File;

		if (!imageFile || !(imageFile instanceof File)) {
			return json({ error: 'Image file is required' }, { status: 400 });
		}

		// Validate file type
		if (!imageFile.type.startsWith('image/')) {
			return json({ error: 'File must be an image' }, { status: 400 });
		}

		// Validate file size (10MB max)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (imageFile.size > maxSize) {
			return json({ error: 'Image file size must be less than 10MB' }, { status: 400 });
		}

		// Extract recipe using Gemini Vision
		const geminiService = GeminiService.getInstance();
		const extractedRecipe = await geminiService.extractRecipeFromImage(imageFile);

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
		console.error('Error in extract-image endpoint:', error);

		// Handle specific errors
		if (error instanceof Error) {
			if (error.message.includes('GEMINI_API_KEY')) {
				return json({ error: 'Gemini API not configured' }, { status: 500 });
			}
			if (error.message.includes('Failed to extract recipe')) {
				return json({ error: error.message }, { status: 422 });
			}
		}

		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
