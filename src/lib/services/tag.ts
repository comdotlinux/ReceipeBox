import { pb } from './pocketbase';
import type {
	Tag,
	TagCreateData,
	TagUpdateData,
	TagListResponse,
	TagSearchParams
} from '$lib/types';

export class TagService {
	private static instance: TagService;

	public static getInstance(): TagService {
		if (!TagService.instance) {
			TagService.instance = new TagService();
		}
		return TagService.instance;
	}

	async getTags(params: TagSearchParams = {}): Promise<TagListResponse> {
		try {
			const { page = 1, limit = 50, query } = params;

			let filter = '';
			if (query) {
				filter = `name ~ "${query}"`;
			}

			const result = await pb.client.collection('tags').getList(page, limit, {
				filter,
				sort: '-usage_count,name'
			});

			return {
				page: result.page,
				perPage: result.perPage,
				totalItems: result.totalItems,
				totalPages: result.totalPages,
				items: result.items as Tag[]
			};
		} catch (error) {
			console.error('Failed to fetch tags:', error);
			
			// Return empty result if tags collection doesn't exist or has schema issues
			return {
				page: 1,
				perPage: limit || 50,
				totalItems: 0,
				totalPages: 0,
				items: []
			};
		}
	}

	async getTag(id: string): Promise<Tag> {
		try {
			const result = await pb.client.collection('tags').getOne(id);
			return result as Tag;
		} catch (error) {
			throw new Error(`Failed to fetch tag: ${error}`);
		}
	}

	async createTag(data: TagCreateData): Promise<Tag> {
		try {
			if (!pb.isAuthenticated) {
				throw new Error('Must be authenticated to create tags');
			}

			if (pb.currentUser?.role !== 'admin') {
				throw new Error('Only administrators can create tags');
			}

			const slug = this.generateSlug(data.name);

			const tagData = {
				name: data.name,
				slug,
				usage_count: 0,
				color: data.color || this.generateRandomColor(),
				created_by: pb.currentUser.id
			};

			const result = await pb.client.collection('tags').create(tagData);
			return result as Tag;
		} catch (error) {
			throw new Error(`Failed to create tag: ${error}`);
		}
	}

	async updateTag(data: TagUpdateData): Promise<Tag> {
		try {
			if (!pb.isAuthenticated) {
				throw new Error('Must be authenticated to update tags');
			}

			if (pb.currentUser?.role !== 'admin') {
				throw new Error('Only administrators can update tags');
			}

			const updateData: any = {};

			if (data.name) {
				updateData.name = data.name;
				updateData.slug = this.generateSlug(data.name);
			}

			if (data.color) {
				updateData.color = data.color;
			}

			const result = await pb.client.collection('tags').update(data.id, updateData);
			return result as Tag;
		} catch (error) {
			throw new Error(`Failed to update tag: ${error}`);
		}
	}

	async deleteTag(id: string): Promise<void> {
		try {
			if (!pb.isAuthenticated) {
				throw new Error('Must be authenticated to delete tags');
			}

			if (pb.currentUser?.role !== 'admin') {
				throw new Error('Only administrators can delete tags');
			}

			await pb.client.collection('tags').delete(id);
		} catch (error) {
			throw new Error(`Failed to delete tag: ${error}`);
		}
	}

	async getTagsByNames(names: string[]): Promise<Tag[]> {
		try {
			if (names.length === 0) return [];

			const filter = names.map((name) => `name = "${name}"`).join(' || ');
			const result = await pb.client.collection('tags').getFullList({
				filter
			});

			return result as Tag[];
		} catch (error) {
			throw new Error(`Failed to fetch tags by names: ${error}`);
		}
	}

	async createTagsIfNotExist(names: string[]): Promise<Tag[]> {
		try {
			if (names.length === 0) return [];

			const existingTags = await this.getTagsByNames(names);
			const existingNames = existingTags.map((tag) => tag.name);
			const newNames = names.filter((name) => !existingNames.includes(name));

			const newTags: Tag[] = [];
			for (const name of newNames) {
				try {
					const tag = await this.createTag({ name });
					newTags.push(tag);
				} catch (error) {
					console.warn(`Failed to create tag "${name}":`, error);
				}
			}

			return [...existingTags, ...newTags];
		} catch (error) {
			throw new Error(`Failed to create tags: ${error}`);
		}
	}

	async incrementUsageCount(tagId: string): Promise<void> {
		try {
			const tag = await this.getTag(tagId);
			await pb.client.collection('tags').update(tagId, {
				usage_count: tag.usage_count + 1
			});
		} catch (error) {
			console.warn(`Failed to increment usage count for tag ${tagId}:`, error);
		}
	}

	async decrementUsageCount(tagId: string): Promise<void> {
		try {
			const tag = await this.getTag(tagId);
			const newCount = Math.max(0, tag.usage_count - 1);
			await pb.client.collection('tags').update(tagId, {
				usage_count: newCount
			});
		} catch (error) {
			console.warn(`Failed to decrement usage count for tag ${tagId}:`, error);
		}
	}

	async getPopularTags(limit: number = 10): Promise<Tag[]> {
		try {
			const result = await pb.client.collection('tags').getList(1, limit, {
				sort: '-usage_count,name'
			});

			return result.items as Tag[];
		} catch (error) {
			throw new Error(`Failed to fetch popular tags: ${error}`);
		}
	}

	private generateSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	private generateRandomColor(): string {
		const colors = [
			'#ef4444',
			'#f97316',
			'#f59e0b',
			'#eab308',
			'#84cc16',
			'#22c55e',
			'#10b981',
			'#14b8a6',
			'#06b6d4',
			'#0ea5e9',
			'#3b82f6',
			'#6366f1',
			'#8b5cf6',
			'#a855f7',
			'#d946ef',
			'#ec4899',
			'#f43f5e'
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}
}

export const tagService = TagService.getInstance();
