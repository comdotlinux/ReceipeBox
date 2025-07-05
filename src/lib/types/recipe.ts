export interface RecipeIngredient {
  item: string;
  quantity: string;
  unit: string;
  notes?: string;
}

export interface RecipeInstruction {
  step: number;
  instruction: string;
  duration?: string;
  temperature?: string;
}

export interface RecipeMetadata {
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  cuisine?: string;
  dietary?: string[];
}

export interface RecipeSource {
  type: 'url' | 'manual' | 'image';
  originalUrl?: string;
  originalImage?: string;
  extractedBy?: 'gemini_url' | 'gemini_ocr' | 'manual';
}

export interface RecipeTimestamps {
  created: string;
  lastModified: string;
  version: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  tags: string[];
  metadata: RecipeMetadata;
  source: RecipeSource;
  created_by: string;
  last_modified_by: string;
  is_published: boolean;
  cache_key: string;
  created: string;
  updated: string;
}

export interface RecipeCreateData {
  title: string;
  description?: string;
  image?: File | string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  tags: string[];
  metadata: RecipeMetadata;
  source: RecipeSource;
  is_published?: boolean;
}

export interface RecipeUpdateData extends Partial<RecipeCreateData> {
  id: string;
}

export interface RecipeListResponse {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: Recipe[];
}

export interface RecipeSearchParams {
  query?: string;
  tags?: string[];
  cuisine?: string;
  difficulty?: string;
  dietary?: string[];
  page?: number;
  limit?: number;
}