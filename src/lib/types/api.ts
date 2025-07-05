export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  data?: any;
}

export interface PaginatedResponse<T> {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface RecipeExtractionRequest {
  url?: string;
  image?: File;
}

export interface RecipeExtractionResponse {
  title: string;
  description?: string;
  ingredients: Array<{
    item: string;
    quantity: string;
    unit: string;
    notes?: string;
  }>;
  instructions: Array<{
    step: number;
    instruction: string;
    duration?: string;
    temperature?: string;
  }>;
  metadata: {
    servings?: string;
    prepTime?: string;
    cookTime?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    cuisine?: string;
    dietary?: string[];
  };
  tags: string[];
  confidence: number;
  source: {
    type: 'url' | 'image';
    originalUrl?: string;
    originalImage?: string;
    extractedBy: 'gemini_url' | 'gemini_ocr';
  };
}

export interface AppMetadata {
  key: string;
  value: any;
  created: string;
  updated: string;
}

export interface CacheInfo {
  global_cache_key: string;
  last_updated: string;
  total_recipes: number;
}

export interface AppSettings {
  max_file_size: number;
  allowed_image_types: string[];
  max_tags_per_recipe: number;
}