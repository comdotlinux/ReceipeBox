import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { RecipeCreateData, RecipeIngredient, RecipeInstruction } from '$lib/types';

class GeminiService {
	private genAI: GoogleGenerativeAI;
	private static instance: GeminiService;
	private model: any;
	private visionModel: any;

	private constructor() {
		const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error('GEMINI_API_KEY is not configured');
		}

		this.genAI = new GoogleGenerativeAI(apiKey);

		// Initialize text model for URL extraction
		this.model = this.genAI.getGenerativeModel({
			model: 'gemini-pro',
			safetySettings: [
				{
					category: HarmCategory.HARM_CATEGORY_HARASSMENT,
					threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
				}
			]
		});

		// Initialize vision model for image OCR
		this.visionModel = this.genAI.getGenerativeModel({
			model: 'gemini-pro-vision',
			safetySettings: [
				{
					category: HarmCategory.HARM_CATEGORY_HARASSMENT,
					threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
				}
			]
		});
	}

	public static getInstance(): GeminiService {
		if (!GeminiService.instance) {
			GeminiService.instance = new GeminiService();
		}
		return GeminiService.instance;
	}

	private getRecipeExtractionPrompt(): string {
		return `You are a recipe extraction expert. Extract recipe information from the provided content and return it as valid JSON.

The JSON must follow this exact structure:
{
  "title": "Recipe Title",
  "description": "Brief description",
  "ingredients": [
    {
      "item": "ingredient name",
      "quantity": "amount",
      "unit": "measurement unit",
      "notes": "optional notes"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": "Step description",
      "duration": "optional time",
      "temperature": "optional temp"
    }
  ],
  "metadata": {
    "servings": "number of servings",
    "prepTime": "preparation time",
    "cookTime": "cooking time",
    "difficulty": "Easy|Medium|Hard",
    "cuisine": "cuisine type",
    "dietary": ["dietary restrictions"]
  },
  "tags": ["tag1", "tag2"],
  "confidence": 0.95
}

Important:
- Extract only factual recipe information
- Use reasonable defaults if information is missing
- Ensure all JSON is valid and properly formatted
- Include a confidence score (0-1) indicating extraction quality
- For ingredients, separate quantity, unit, and item name clearly
- Number instruction steps sequentially`;
	}

	public async extractRecipeFromUrl(url: string): Promise<RecipeCreateData> {
		try {
			// Validate URL
			const urlObj = new URL(url);
			if (!['http:', 'https:'].includes(urlObj.protocol)) {
				throw new Error('Invalid URL protocol');
			}

			// Fetch URL content
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Failed to fetch URL: ${response.statusText}`);
			}

			const html = await response.text();

			// Extract text content from HTML (basic extraction)
			const textContent = this.extractTextFromHtml(html);

			// Generate recipe using Gemini
			const prompt = `${this.getRecipeExtractionPrompt()}\n\nExtract recipe from this content:\n\n${textContent}`;

			const result = await this.model.generateContent(prompt);
			const responseText = result.response.text();

			// Parse JSON response
			const extractedData = this.parseGeminiResponse(responseText);

			// Add source information
			return {
				...extractedData,
				source: {
					type: 'url',
					originalUrl: url,
					extractedBy: 'gemini_url'
				}
			};
		} catch (error) {
			console.error('Error extracting recipe from URL:', error);
			throw new Error(
				`Failed to extract recipe: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	public async extractRecipeFromImage(imageFile: File): Promise<RecipeCreateData> {
		try {
			// Validate image
			if (!imageFile.type.startsWith('image/')) {
				throw new Error('File must be an image');
			}

			// Convert image to base64
			const imageData = await this.fileToGenerativePart(imageFile);

			// Generate recipe using Gemini Vision
			const prompt = `${this.getRecipeExtractionPrompt()}\n\nExtract recipe from this image:`;

			const result = await this.visionModel.generateContent([prompt, imageData]);
			const responseText = result.response.text();

			// Parse JSON response
			const extractedData = this.parseGeminiResponse(responseText);

			// Add source information
			return {
				...extractedData,
				source: {
					type: 'image',
					extractedBy: 'gemini_ocr'
				}
			};
		} catch (error) {
			console.error('Error extracting recipe from image:', error);
			throw new Error(
				`Failed to extract recipe: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	private extractTextFromHtml(html: string): string {
		// Remove script and style elements
		let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
		text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

		// Remove HTML tags
		text = text.replace(/<[^>]+>/g, ' ');

		// Decode HTML entities
		text = text.replace(/&nbsp;/g, ' ');
		text = text.replace(/&amp;/g, '&');
		text = text.replace(/&lt;/g, '<');
		text = text.replace(/&gt;/g, '>');
		text = text.replace(/&quot;/g, '"');
		text = text.replace(/&#39;/g, "'");

		// Clean up whitespace
		text = text.replace(/\s+/g, ' ').trim();

		// Limit length to avoid token limits
		const maxLength = 10000;
		if (text.length > maxLength) {
			text = text.substring(0, maxLength) + '...';
		}

		return text;
	}

	private parseGeminiResponse(responseText: string): RecipeCreateData {
		try {
			// Extract JSON from response (Gemini might include markdown formatting)
			const jsonMatch = responseText.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error('No JSON found in response');
			}

			const data = JSON.parse(jsonMatch[0]);

			// Validate and transform data
			if (!data.title || !Array.isArray(data.ingredients) || !Array.isArray(data.instructions)) {
				throw new Error('Invalid recipe data structure');
			}

			// Ensure proper structure for ingredients
			const ingredients: RecipeIngredient[] = data.ingredients.map((ing: any) => ({
				item: ing.item || '',
				quantity: ing.quantity || '',
				unit: ing.unit || '',
				notes: ing.notes || ''
			}));

			// Ensure proper structure for instructions
			const instructions: RecipeInstruction[] = data.instructions.map(
				(inst: any, index: number) => ({
					step: inst.step || index + 1,
					instruction: inst.instruction || '',
					duration: inst.duration || '',
					temperature: inst.temperature || ''
				})
			);

			return {
				title: data.title,
				description: data.description || '',
				ingredients,
				instructions,
				tags: Array.isArray(data.tags) ? data.tags : [],
				metadata: {
					servings: data.metadata?.servings || '',
					prepTime: data.metadata?.prepTime || '',
					cookTime: data.metadata?.cookTime || '',
					difficulty: data.metadata?.difficulty || 'Medium',
					cuisine: data.metadata?.cuisine || '',
					dietary: Array.isArray(data.metadata?.dietary) ? data.metadata.dietary : []
				},
				source: {
					type: 'manual',
					extractedBy: 'manual'
				}
			};
		} catch (error) {
			console.error('Error parsing Gemini response:', error);
			throw new Error('Failed to parse extracted recipe data');
		}
	}

	private async fileToGenerativePart(file: File): Promise<any> {
		const base64EncodedDataPromise = new Promise<string>((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				const result = reader.result as string;
				resolve(result.split(',')[1]);
			};
			reader.readAsDataURL(file);
		});

		return {
			inlineData: {
				data: await base64EncodedDataPromise,
				mimeType: file.type
			}
		};
	}

	public async testConnection(): Promise<boolean> {
		try {
			const result = await this.model.generateContent('Say "Hello, I am connected!"');
			return !!result.response.text();
		} catch (error) {
			console.error('Gemini connection test failed:', error);
			return false;
		}
	}
}

export default GeminiService;
