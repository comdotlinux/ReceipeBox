import { writable, derived } from 'svelte/store';
import { tagService } from '$lib/services';
import type { Tag, TagSearchParams } from '$lib/types';

export const tags = writable<Tag[]>([]);
export const popularTags = writable<Tag[]>([]);
export const selectedTags = writable<string[]>([]);
export const tagsLoading = writable(false);
export const tagsError = writable<string | null>(null);

class TagsStore {
  async loadTags(params: TagSearchParams = {}): Promise<void> {
    try {
      tagsLoading.set(true);
      tagsError.set(null);

      const response = await tagService.getTags(params);
      tags.set(response.items);
    } catch (error) {
      tagsError.set(error instanceof Error ? error.message : 'Failed to load tags');
    } finally {
      tagsLoading.set(false);
    }
  }

  async loadPopularTags(limit: number = 10): Promise<void> {
    try {
      const popular = await tagService.getPopularTags(limit);
      popularTags.set(popular);
    } catch (error) {
      console.warn('Failed to load popular tags:', error);
    }
  }

  async createTag(data: any): Promise<Tag> {
    try {
      tagsLoading.set(true);
      tagsError.set(null);

      const tag = await tagService.createTag(data);
      
      // Add to the list
      tags.update(existing => [tag, ...existing]);
      
      return tag;
    } catch (error) {
      tagsError.set(error instanceof Error ? error.message : 'Failed to create tag');
      throw error;
    } finally {
      tagsLoading.set(false);
    }
  }

  async updateTag(data: any): Promise<Tag> {
    try {
      tagsLoading.set(true);
      tagsError.set(null);

      const tag = await tagService.updateTag(data);
      
      // Update in the list
      tags.update(existing => 
        existing.map(t => t.id === tag.id ? tag : t)
      );
      
      return tag;
    } catch (error) {
      tagsError.set(error instanceof Error ? error.message : 'Failed to update tag');
      throw error;
    } finally {
      tagsLoading.set(false);
    }
  }

  async deleteTag(id: string): Promise<void> {
    try {
      tagsLoading.set(true);
      tagsError.set(null);

      await tagService.deleteTag(id);
      
      // Remove from the list
      tags.update(existing => existing.filter(t => t.id !== id));
      popularTags.update(existing => existing.filter(t => t.id !== id));
    } catch (error) {
      tagsError.set(error instanceof Error ? error.message : 'Failed to delete tag');
      throw error;
    } finally {
      tagsLoading.set(false);
    }
  }

  toggleTag(tagName: string): void {
    selectedTags.update(current => {
      if (current.includes(tagName)) {
        return current.filter(t => t !== tagName);
      } else {
        return [...current, tagName];
      }
    });
  }

  clearSelectedTags(): void {
    selectedTags.set([]);
  }

  selectTags(tagNames: string[]): void {
    selectedTags.set(tagNames);
  }

  clearError(): void {
    tagsError.set(null);
  }
}

export const tagsStore = new TagsStore();

// Derived stores
export const tagMap = derived(tags, ($tags) => {
  const map = new Map<string, Tag>();
  $tags.forEach(tag => {
    map.set(tag.name, tag);
  });
  return map;
});

export const availableTags = derived(tags, ($tags) => 
  $tags.map(tag => tag.name).sort()
);

export const tagColors = derived(tags, ($tags) => {
  const colors = new Map<string, string>();
  $tags.forEach(tag => {
    if (tag.color) {
      colors.set(tag.name, tag.color);
    }
  });
  return colors;
});