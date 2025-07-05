export interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
  color?: string;
  created_by: string;
  created: string;
  updated: string;
}

export interface TagCreateData {
  name: string;
  color?: string;
}

export interface TagUpdateData extends Partial<TagCreateData> {
  id: string;
}

export interface TagListResponse {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  items: Tag[];
}

export interface TagSearchParams {
  query?: string;
  page?: number;
  limit?: number;
}