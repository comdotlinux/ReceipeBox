import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Tag, TagCreateData, TagUpdateData } from '$lib/types';

// Mock PocketBase
const mockCollection = {
	getList: vi.fn(),
	getOne: vi.fn(),
	create: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
	getFullList: vi.fn()
};

const mockPb = {
	client: {
		collection: vi.fn(() => mockCollection)
	},
	isAuthenticated: true,
	currentUser: {
		id: 'test-user-id',
		email: 'admin@test.com',
		name: 'Test Admin',
		role: 'admin'
	}
};

vi.mock('./pocketbase', () => ({
	pb: mockPb
}));

// Import TagService after mocking
const { TagService } = await import('./tag');

describe('TagService', () => {
	let tagService: TagService;

	beforeEach(() => {
		vi.clearAllMocks();
		// Reset mock state
		mockPb.isAuthenticated = true;
		mockPb.currentUser = {
			id: 'test-user-id',
			email: 'admin@test.com',
			name: 'Test Admin',
			role: 'admin'
		};
		tagService = TagService.getInstance();
	});

	describe('getTags', () => {
		it('should fetch tags with default parameters', async () => {
			const mockTags: Tag[] = [
				{
					id: '1',
					name: 'Italian',
					slug: 'italian',
					usage_count: 10,
					color: '#ef4444',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			];

			mockCollection.getList.mockResolvedValueOnce({
				page: 1,
				perPage: 50,
				totalItems: 1,
				totalPages: 1,
				items: mockTags
			});

			const result = await tagService.getTags();

			expect(mockPb.client.collection).toHaveBeenCalledWith('tags');
			expect(mockCollection.getList).toHaveBeenCalledWith(1, 50, {
				filter: '',
				sort: '-usage_count,name'
			});
			expect(result.items).toEqual(mockTags);
		});

		it('should fetch tags with search query', async () => {
			mockCollection.getList.mockResolvedValueOnce({
				page: 1,
				perPage: 50,
				totalItems: 0,
				totalPages: 0,
				items: []
			});

			await tagService.getTags({ query: 'test' });

			expect(mockCollection.getList).toHaveBeenCalledWith(1, 50, {
				filter: 'name ~ "test"',
				sort: '-usage_count,name'
			});
		});
	});

	describe('getTag', () => {
		it('should fetch a single tag by ID', async () => {
			const mockTag: Tag = {
				id: '1',
				name: 'Quick',
				slug: 'quick',
				usage_count: 5,
				color: '#3b82f6',
				created: '2024-01-01',
				updated: '2024-01-01'
			};

			mockCollection.getOne.mockResolvedValueOnce(mockTag);

			const result = await tagService.getTag('1');

			expect(mockPb.client.collection).toHaveBeenCalledWith('tags');
			expect(mockCollection.getOne).toHaveBeenCalledWith('1');
			expect(result).toEqual(mockTag);
		});
	});

	describe('createTag', () => {
		it('should create a new tag', async () => {
			const tagData: TagCreateData = {
				name: 'Healthy',
				color: '#22c55e'
			};

			const createdTag: Tag = {
				id: '2',
				name: 'Healthy',
				slug: 'healthy',
				usage_count: 0,
				color: '#22c55e',
				created: '2024-01-01',
				updated: '2024-01-01'
			};

			mockCollection.create.mockResolvedValueOnce(createdTag);

			const result = await tagService.createTag(tagData);

			expect(mockCollection.create).toHaveBeenCalledWith({
				name: 'Healthy',
				slug: 'healthy',
				usage_count: 0,
				color: '#22c55e',
				created_by: 'test-user-id'
			});
			expect(result).toEqual(createdTag);
		});

		it('should generate random color if not provided', async () => {
			const tagData: TagCreateData = {
				name: 'Test Tag'
			};

			mockCollection.create.mockResolvedValueOnce({
				id: '3',
				name: 'Test Tag',
				slug: 'test-tag',
				usage_count: 0,
				color: '#ef4444',
				created: '2024-01-01',
				updated: '2024-01-01'
			});

			await tagService.createTag(tagData);

			expect(mockCollection.create).toHaveBeenCalled();
			const createCall = mockCollection.create.mock.calls[0][0];
			expect(createCall.color).toBeDefined();
			expect(createCall.color).toMatch(/^#[0-9a-f]{6}$/i);
		});

		it('should throw error if not authenticated', async () => {
			mockPb.isAuthenticated = false;

			await expect(tagService.createTag({ name: 'Test' })).rejects.toThrow(
				'Must be authenticated to create tags'
			);
		});

		it('should throw error if not admin', async () => {
			mockPb.currentUser.role = 'reader';

			await expect(tagService.createTag({ name: 'Test' })).rejects.toThrow(
				'Only administrators can create tags'
			);
		});
	});

	describe('updateTag', () => {
		it('should update an existing tag', async () => {
			const updateData: TagUpdateData = {
				id: '1',
				name: 'Updated Tag',
				color: '#f59e0b'
			};

			const updatedTag: Tag = {
				id: '1',
				name: 'Updated Tag',
				slug: 'updated-tag',
				usage_count: 5,
				color: '#f59e0b',
				created: '2024-01-01',
				updated: '2024-01-02'
			};

			mockCollection.update.mockResolvedValueOnce(updatedTag);

			const result = await tagService.updateTag(updateData);

			expect(mockCollection.update).toHaveBeenCalledWith('1', {
				name: 'Updated Tag',
				slug: 'updated-tag',
				color: '#f59e0b'
			});
			expect(result).toEqual(updatedTag);
		});

		it('should update only provided fields', async () => {
			const updateData: TagUpdateData = {
				id: '1',
				color: '#ec4899'
			};

			mockCollection.update.mockResolvedValueOnce({
				id: '1',
				name: 'Original',
				slug: 'original',
				usage_count: 5,
				color: '#ec4899',
				created: '2024-01-01',
				updated: '2024-01-02'
			});

			await tagService.updateTag(updateData);

			expect(mockCollection.update).toHaveBeenCalledWith('1', {
				color: '#ec4899'
			});
		});
	});

	describe('deleteTag', () => {
		it('should delete a tag', async () => {
			mockCollection.delete.mockResolvedValueOnce(true);

			await tagService.deleteTag('1');

			expect(mockPb.client.collection).toHaveBeenCalledWith('tags');
			expect(mockCollection.delete).toHaveBeenCalledWith('1');
		});

		it('should throw error if not admin', async () => {
			mockPb.currentUser.role = 'reader';

			await expect(tagService.deleteTag('1')).rejects.toThrow(
				'Only administrators can delete tags'
			);
		});
	});

	describe('getTagsByNames', () => {
		it('should fetch tags by names', async () => {
			const mockTags: Tag[] = [
				{
					id: '1',
					name: 'Quick',
					slug: 'quick',
					usage_count: 10,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				},
				{
					id: '2',
					name: 'Healthy',
					slug: 'healthy',
					usage_count: 8,
					color: '#22c55e',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			];

			mockCollection.getFullList.mockResolvedValueOnce(mockTags);

			const result = await tagService.getTagsByNames(['Quick', 'Healthy']);

			expect(mockCollection.getFullList).toHaveBeenCalledWith({
				filter: 'name = "Quick" || name = "Healthy"'
			});
			expect(result).toEqual(mockTags);
		});

		it('should return empty array for empty names', async () => {
			const result = await tagService.getTagsByNames([]);

			expect(mockCollection.getFullList).not.toHaveBeenCalled();
			expect(result).toEqual([]);
		});
	});

	describe('createTagsIfNotExist', () => {
		it('should create only non-existing tags', async () => {
			const existingTags: Tag[] = [
				{
					id: '1',
					name: 'Existing',
					slug: 'existing',
					usage_count: 5,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			];

			const newTag: Tag = {
				id: '2',
				name: 'New',
				slug: 'new',
				usage_count: 0,
				color: '#ef4444',
				created: '2024-01-01',
				updated: '2024-01-01'
			};

			mockCollection.getFullList.mockResolvedValueOnce(existingTags);
			mockCollection.create.mockResolvedValueOnce(newTag);

			const result = await tagService.createTagsIfNotExist(['Existing', 'New']);

			expect(mockCollection.create).toHaveBeenCalledOnce();
			expect(result).toHaveLength(2);
			expect(result).toContainEqual(existingTags[0]);
			expect(result).toContainEqual(newTag);
		});
	});

	describe('incrementUsageCount', () => {
		it('should increment tag usage count', async () => {
			const mockTag: Tag = {
				id: '1',
				name: 'Test',
				slug: 'test',
				usage_count: 5,
				color: '#3b82f6',
				created: '2024-01-01',
				updated: '2024-01-01'
			};

			mockCollection.getOne.mockResolvedValueOnce(mockTag);
			mockCollection.update.mockResolvedValueOnce({
				...mockTag,
				usage_count: 6
			});

			await tagService.incrementUsageCount('1');

			expect(mockCollection.update).toHaveBeenCalledWith('1', {
				usage_count: 6
			});
		});
	});

	describe('decrementUsageCount', () => {
		it('should decrement tag usage count', async () => {
			const mockTag: Tag = {
				id: '1',
				name: 'Test',
				slug: 'test',
				usage_count: 5,
				color: '#3b82f6',
				created: '2024-01-01',
				updated: '2024-01-01'
			};

			mockCollection.getOne.mockResolvedValueOnce(mockTag);
			mockCollection.update.mockResolvedValueOnce({
				...mockTag,
				usage_count: 4
			});

			await tagService.decrementUsageCount('1');

			expect(mockCollection.update).toHaveBeenCalledWith('1', {
				usage_count: 4
			});
		});

		it('should not go below zero', async () => {
			const mockTag: Tag = {
				id: '1',
				name: 'Test',
				slug: 'test',
				usage_count: 0,
				color: '#3b82f6',
				created: '2024-01-01',
				updated: '2024-01-01'
			};

			mockCollection.getOne.mockResolvedValueOnce(mockTag);
			mockCollection.update.mockResolvedValueOnce(mockTag);

			await tagService.decrementUsageCount('1');

			expect(mockCollection.update).toHaveBeenCalledWith('1', {
				usage_count: 0
			});
		});
	});

	describe('getPopularTags', () => {
		it('should fetch popular tags', async () => {
			const mockTags: Tag[] = [
				{
					id: '1',
					name: 'Popular',
					slug: 'popular',
					usage_count: 100,
					color: '#ef4444',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			];

			mockCollection.getList.mockResolvedValueOnce({
				page: 1,
				perPage: 10,
				totalItems: 1,
				totalPages: 1,
				items: mockTags
			});

			const result = await tagService.getPopularTags(10);

			expect(mockCollection.getList).toHaveBeenCalledWith(1, 10, {
				sort: '-usage_count,name'
			});
			expect(result).toEqual(mockTags);
		});
	});

	describe('slug generation', () => {
		it('should generate proper slugs', async () => {
			const testCases = [
				{ name: 'Simple Tag', expectedSlug: 'simple-tag' },
				{ name: 'Tag with   spaces', expectedSlug: 'tag-with-spaces' },
				{ name: 'Tag-with-dashes', expectedSlug: 'tag-with-dashes' },
				{ name: 'Tag123Numbers', expectedSlug: 'tag123numbers' },
				{ name: 'UPPERCASE TAG', expectedSlug: 'uppercase-tag' }
			];

			for (const testCase of testCases) {
				mockCollection.create.mockResolvedValueOnce({
					id: '1',
					name: testCase.name,
					slug: testCase.expectedSlug,
					usage_count: 0,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				});

				await tagService.createTag({ name: testCase.name });

				const createCall = mockCollection.create.mock.calls[0][0];
				expect(createCall.slug).toBe(testCase.expectedSlug);
				
				mockCollection.create.mockClear();
			}
		});
	});
});