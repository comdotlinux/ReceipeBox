import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	tags,
	popularTags,
	selectedTags,
	tagsLoading,
	tagsError,
	tagsStore,
	tagMap,
	availableTags,
	tagColors
} from './tags';
import type { Tag } from '$lib/types';

// Mock the tag service
vi.mock('$lib/services', () => ({
	tagService: {
		getTags: vi.fn(),
		getPopularTags: vi.fn(),
		createTag: vi.fn(),
		updateTag: vi.fn(),
		deleteTag: vi.fn()
	}
}));

describe('Tags Store', () => {
	let mockTagService: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		// Reset stores
		tags.set([]);
		popularTags.set([]);
		selectedTags.set([]);
		tagsLoading.set(false);
		tagsError.set(null);
		
		// Get mocked service
		mockTagService = vi.mocked((await import('$lib/services')).tagService);
	});

	describe('loadTags', () => {
		it('should load tags successfully', async () => {
			const mockTags: Tag[] = [
				{
					id: '1',
					name: 'Italian',
					slug: 'italian',
					usage_count: 10,
					color: '#ef4444',
					created: '2024-01-01',
					updated: '2024-01-01'
				},
				{
					id: '2',
					name: 'Quick',
					slug: 'quick',
					usage_count: 5,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			];

			mockTagService.getTags.mockResolvedValueOnce({
				items: mockTags,
				page: 1,
				perPage: 50,
				totalItems: 2,
				totalPages: 1
			});

			await tagsStore.loadTags();

			expect(mockTagService.getTags).toHaveBeenCalledWith({});
			expect(get(tags)).toEqual(mockTags);
			expect(get(tagsLoading)).toBe(false);
			expect(get(tagsError)).toBeNull();
		});

		it('should handle load error', async () => {
			mockTagService.getTags.mockRejectedValueOnce(new Error('Network error'));

			await tagsStore.loadTags();

			expect(get(tags)).toEqual([]);
			expect(get(tagsLoading)).toBe(false);
			expect(get(tagsError)).toBe('Network error');
		});

		it('should pass search params', async () => {
			mockTagService.getTags.mockResolvedValueOnce({
				items: [],
				page: 1,
				perPage: 50,
				totalItems: 0,
				totalPages: 0
			});

			await tagsStore.loadTags({ query: 'test' });

			expect(mockTagService.getTags).toHaveBeenCalledWith({ query: 'test' });
		});
	});

	describe('loadPopularTags', () => {
		it('should load popular tags', async () => {
			const mockPopularTags: Tag[] = [
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

			mockTagService.getPopularTags.mockResolvedValueOnce(mockPopularTags);

			await tagsStore.loadPopularTags(10);

			expect(mockTagService.getPopularTags).toHaveBeenCalledWith(10);
			expect(get(popularTags)).toEqual(mockPopularTags);
		});

		it('should handle error silently', async () => {
			mockTagService.getPopularTags.mockRejectedValueOnce(new Error('Network error'));

			// Should not throw
			await tagsStore.loadPopularTags();

			expect(get(popularTags)).toEqual([]);
		});
	});

	describe('createTag', () => {
		it('should create tag and add to list', async () => {
			const newTag: Tag = {
				id: '3',
				name: 'New Tag',
				slug: 'new-tag',
				usage_count: 0,
				color: '#22c55e',
				created: '2024-01-01',
				updated: '2024-01-01'
			};

			tags.set([
				{
					id: '1',
					name: 'Existing',
					slug: 'existing',
					usage_count: 5,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			]);

			mockTagService.createTag.mockResolvedValueOnce(newTag);

			const result = await tagsStore.createTag({ name: 'New Tag', color: '#22c55e' });

			expect(mockTagService.createTag).toHaveBeenCalledWith({ name: 'New Tag', color: '#22c55e' });
			expect(result).toEqual(newTag);
			expect(get(tags)).toHaveLength(2);
			expect(get(tags)[0]).toEqual(newTag); // Added to beginning
		});

		it('should handle create error', async () => {
			mockTagService.createTag.mockRejectedValueOnce(new Error('Create failed'));

			await expect(tagsStore.createTag({ name: 'Test' })).rejects.toThrow('Create failed');
			expect(get(tagsError)).toBe('Create failed');
			expect(get(tagsLoading)).toBe(false);
		});
	});

	describe('updateTag', () => {
		it('should update tag in list', async () => {
			const existingTags: Tag[] = [
				{
					id: '1',
					name: 'Original',
					slug: 'original',
					usage_count: 5,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				},
				{
					id: '2',
					name: 'Other',
					slug: 'other',
					usage_count: 3,
					color: '#ef4444',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			];

			const updatedTag: Tag = {
				...existingTags[0],
				name: 'Updated',
				slug: 'updated',
				color: '#22c55e'
			};

			tags.set(existingTags);
			mockTagService.updateTag.mockResolvedValueOnce(updatedTag);

			const result = await tagsStore.updateTag({ id: '1', name: 'Updated', color: '#22c55e' });

			expect(result).toEqual(updatedTag);
			expect(get(tags)[0]).toEqual(updatedTag);
			expect(get(tags)[1]).toEqual(existingTags[1]); // Other tag unchanged
		});
	});

	describe('deleteTag', () => {
		it('should remove tag from all lists', async () => {
			const existingTags: Tag[] = [
				{
					id: '1',
					name: 'To Delete',
					slug: 'to-delete',
					usage_count: 5,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				},
				{
					id: '2',
					name: 'Keep',
					slug: 'keep',
					usage_count: 3,
					color: '#ef4444',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			];

			tags.set(existingTags);
			popularTags.set(existingTags);
			mockTagService.deleteTag.mockResolvedValueOnce(undefined);

			await tagsStore.deleteTag('1');

			expect(mockTagService.deleteTag).toHaveBeenCalledWith('1');
			expect(get(tags)).toHaveLength(1);
			expect(get(tags)[0].id).toBe('2');
			expect(get(popularTags)).toHaveLength(1);
			expect(get(popularTags)[0].id).toBe('2');
		});
	});

	describe('tag selection', () => {
		it('should toggle tag selection', () => {
			selectedTags.set(['existing']);

			// Add new tag
			tagsStore.toggleTag('new');
			expect(get(selectedTags)).toEqual(['existing', 'new']);

			// Remove existing tag
			tagsStore.toggleTag('existing');
			expect(get(selectedTags)).toEqual(['new']);

			// Toggle same tag again
			tagsStore.toggleTag('new');
			expect(get(selectedTags)).toEqual([]);
		});

		it('should clear selected tags', () => {
			selectedTags.set(['tag1', 'tag2', 'tag3']);

			tagsStore.clearSelectedTags();

			expect(get(selectedTags)).toEqual([]);
		});

		it('should select specific tags', () => {
			selectedTags.set(['old']);

			tagsStore.selectTags(['new1', 'new2']);

			expect(get(selectedTags)).toEqual(['new1', 'new2']);
		});
	});

	describe('derived stores', () => {
		it('should create tag map', () => {
			const testTags: Tag[] = [
				{
					id: '1',
					name: 'Tag One',
					slug: 'tag-one',
					usage_count: 5,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				},
				{
					id: '2',
					name: 'Tag Two',
					slug: 'tag-two',
					usage_count: 3,
					color: '#ef4444',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			];

			tags.set(testTags);

			const map = get(tagMap);
			expect(map.size).toBe(2);
			expect(map.get('Tag One')).toEqual(testTags[0]);
			expect(map.get('Tag Two')).toEqual(testTags[1]);
		});

		it('should create sorted available tags list', () => {
			tags.set([
				{
					id: '1',
					name: 'Zebra',
					slug: 'zebra',
					usage_count: 1,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				},
				{
					id: '2',
					name: 'Apple',
					slug: 'apple',
					usage_count: 2,
					color: '#ef4444',
					created: '2024-01-01',
					updated: '2024-01-01'
				},
				{
					id: '3',
					name: 'Banana',
					slug: 'banana',
					usage_count: 3,
					color: '#22c55e',
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			]);

			const available = get(availableTags);
			expect(available).toEqual(['Apple', 'Banana', 'Zebra']);
		});

		it('should create tag colors map', () => {
			tags.set([
				{
					id: '1',
					name: 'Red Tag',
					slug: 'red-tag',
					usage_count: 1,
					color: '#ef4444',
					created: '2024-01-01',
					updated: '2024-01-01'
				},
				{
					id: '2',
					name: 'Blue Tag',
					slug: 'blue-tag',
					usage_count: 2,
					color: '#3b82f6',
					created: '2024-01-01',
					updated: '2024-01-01'
				},
				{
					id: '3',
					name: 'No Color',
					slug: 'no-color',
					usage_count: 3,
					color: null,
					created: '2024-01-01',
					updated: '2024-01-01'
				}
			]);

			const colors = get(tagColors);
			expect(colors.size).toBe(2); // Only tags with colors
			expect(colors.get('Red Tag')).toBe('#ef4444');
			expect(colors.get('Blue Tag')).toBe('#3b82f6');
			expect(colors.get('No Color')).toBeUndefined();
		});
	});

	describe('error handling', () => {
		it('should clear errors', () => {
			tagsError.set('Some error');

			tagsStore.clearError();

			expect(get(tagsError)).toBeNull();
		});
	});
});