<script lang="ts">
  import type { Recipe, RecipeIngredient, RecipeInstruction, RecipeCreateData } from '$lib/types';
  import { recipesStore, recipesLoading, recipesError } from '$lib/stores';
  import { goto } from '$app/navigation';
  
  const { recipe = null, mode = 'create' }: { recipe?: Recipe | null; mode?: 'create' | 'edit' } = $props();
  
  // Form state
  let title = $state(recipe?.title || '');
  let description = $state(recipe?.description || '');
  let imageFile = $state<File | null>(null);
  let imagePreview = $state<string | null>(recipe?.image ? '' : null); // Will be set from recipe if editing
  
  // Ingredients
  let ingredients = $state<RecipeIngredient[]>(
    recipe?.ingredients || [{ item: '', quantity: '', unit: '', notes: '' }]
  );
  
  // Instructions
  let instructions = $state<RecipeInstruction[]>(
    recipe?.instructions || [{ step: 1, instruction: '', duration: '', temperature: '' }]
  );
  
  // Metadata
  let servings = $state(recipe?.metadata?.servings || '');
  let prepTime = $state(recipe?.metadata?.prepTime || '');
  let cookTime = $state(recipe?.metadata?.cookTime || '');
  let difficulty = $state(recipe?.metadata?.difficulty || 'Easy');
  let cuisine = $state(recipe?.metadata?.cuisine || '');
  let dietary = $state<string[]>(recipe?.metadata?.dietary || []);
  
  // Tags
  let tagInput = $state('');
  let tags = $state<string[]>(recipe?.tags || []);
  
  // Publishing
  let isPublished = $state(recipe?.is_published ?? true);
  
  // Validation
  let errors = $state<Record<string, string>>({});
  
  // Add/Remove functions
  function addIngredient() {
    ingredients = [...ingredients, { item: '', quantity: '', unit: '', notes: '' }];
  }
  
  function removeIngredient(index: number) {
    ingredients = ingredients.filter((_, i) => i !== index);
  }
  
  function addInstruction() {
    const nextStep = Math.max(...instructions.map(i => i.step), 0) + 1;
    instructions = [...instructions, { step: nextStep, instruction: '', duration: '', temperature: '' }];
  }
  
  function removeInstruction(index: number) {
    instructions = instructions.filter((_, i) => i !== index);
    // Reorder steps
    instructions = instructions.map((inst, i) => ({ ...inst, step: i + 1 }));
  }
  
  function handleImageChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors = { ...errors, image: 'Please select an image file' };
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        errors = { ...errors, image: 'Image must be smaller than 10MB' };
        return;
      }
      
      imageFile = file;
      delete errors.image;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      tags = [...tags, tag];
      tagInput = '';
    }
  }
  
  function removeTag(tagToRemove: string) {
    tags = tags.filter(tag => tag !== tagToRemove);
  }
  
  function handleTagKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag();
    }
  }
  
  function toggleDietary(item: string) {
    if (dietary.includes(item)) {
      dietary = dietary.filter(d => d !== item);
    } else {
      dietary = [...dietary, item];
    }
  }
  
  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (ingredients.filter(ing => ing.item.trim()).length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }
    
    if (instructions.filter(inst => inst.instruction.trim()).length === 0) {
      newErrors.instructions = 'At least one instruction is required';
    }
    
    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }
  
  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const recipeData: RecipeCreateData = {
      title: title.trim(),
      description: description.trim() || undefined,
      image: imageFile || undefined,
      ingredients: ingredients.filter(ing => ing.item.trim()),
      instructions: instructions.filter(inst => inst.instruction.trim()),
      tags,
      metadata: {
        servings: servings.trim() || undefined,
        prepTime: prepTime.trim() || undefined,
        cookTime: cookTime.trim() || undefined,
        difficulty,
        cuisine: cuisine.trim() || undefined,
        dietary: dietary.length > 0 ? dietary : undefined
      },
      source: {
        type: 'manual',
        extractedBy: 'manual'
      },
      is_published: isPublished
    };
    
    try {
      if (mode === 'create') {
        console.log('Creating recipe with data:', recipeData);
        const newRecipe = await recipesStore.createRecipe(recipeData);
        console.log('Recipe created successfully:', newRecipe);
        console.log('Redirecting to:', `/recipes/${newRecipe.id}`);
        await goto(`/recipes/${newRecipe.id}`);
        console.log('Redirect completed');
      } else if (recipe) {
        console.log('Updating recipe with data:', recipeData);
        const updatedRecipe = await recipesStore.updateRecipe({
          id: recipe.id,
          ...recipeData
        });
        console.log('Recipe updated successfully:', updatedRecipe);
        console.log('Redirecting to:', `/recipes/${updatedRecipe.id}`);
        await goto(`/recipes/${updatedRecipe.id}`);
        console.log('Redirect completed');
      }
    } catch (error) {
      console.error('Failed to save recipe:', error);
      // Don't rethrow the error to prevent form from breaking
    }
  }
  
  const commonDietaryOptions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 
    'Low-Carb', 'Keto', 'Paleo', 'Halal', 'Kosher'
  ];
</script>

<div class="max-w-4xl mx-auto">
  <form onsubmit={handleSubmit} class="space-y-8">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {mode === 'create' ? 'Create New Recipe' : 'Edit Recipe'}
      </h2>
      
      <!-- Basic Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Title -->
        <div class="md:col-span-2">
          <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipe Title *
          </label>
          <input
            type="text"
            id="title"
            bind:value={title}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter recipe title"
            required
          />
          {#if errors.title}
            <p class="mt-1 text-sm text-red-600">{errors.title}</p>
          {/if}
        </div>
        
        <!-- Description -->
        <div class="md:col-span-2">
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            bind:value={description}
            rows="3"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Brief description of the recipe..."
          ></textarea>
        </div>
        
        <!-- Image Upload -->
        <div class="md:col-span-2">
          <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipe Image
          </label>
          <div class="mt-1 flex items-center space-x-4">
            <input
              type="file"
              id="image"
              accept="image/*"
              onchange={handleImageChange}
              class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {#if imagePreview}
            <div class="mt-4">
              <img src={imagePreview} alt="Recipe preview" class="w-32 h-32 object-cover rounded-lg" />
            </div>
          {/if}
          {#if errors.image}
            <p class="mt-1 text-sm text-red-600">{errors.image}</p>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Recipe Metadata -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Recipe Details</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label for="servings" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Servings
          </label>
          <input
            type="text"
            id="servings"
            bind:value={servings}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="4 people"
          />
        </div>
        
        <div>
          <label for="prepTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Prep Time
          </label>
          <input
            type="text"
            id="prepTime"
            bind:value={prepTime}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="15 minutes"
          />
        </div>
        
        <div>
          <label for="cookTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cook Time
          </label>
          <input
            type="text"
            id="cookTime"
            bind:value={cookTime}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="30 minutes"
          />
        </div>
        
        <div>
          <label for="difficulty" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Difficulty
          </label>
          <select
            id="difficulty"
            bind:value={difficulty}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        
        <div class="md:col-span-2">
          <label for="cuisine" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cuisine Type
          </label>
          <input
            type="text"
            id="cuisine"
            bind:value={cuisine}
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Italian, Mexican, etc."
          />
        </div>
        
        <!-- Dietary Restrictions -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dietary Options
          </label>
          <div class="flex flex-wrap gap-2">
            {#each commonDietaryOptions as option}
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={dietary.includes(option)}
                  onchange={() => toggleDietary(option)}
                  class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            {/each}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Ingredients -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Ingredients *</h3>
        <button
          type="button"
          onclick={addIngredient}
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add Ingredient
        </button>
      </div>
      
      <div class="space-y-3">
        {#each ingredients as ingredient, index}
          <div class="grid grid-cols-12 gap-3 items-end">
            <div class="col-span-5">
              <input
                type="text"
                bind:value={ingredient.item}
                placeholder="Ingredient name"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div class="col-span-2">
              <input
                type="text"
                bind:value={ingredient.quantity}
                placeholder="Amount"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div class="col-span-2">
              <input
                type="text"
                bind:value={ingredient.unit}
                placeholder="Unit"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div class="col-span-2">
              <input
                type="text"
                bind:value={ingredient.notes}
                placeholder="Notes"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div class="col-span-1">
              <button
                type="button"
                onclick={() => removeIngredient(index)}
                class="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                disabled={ingredients.length === 1}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
      
      {#if errors.ingredients}
        <p class="mt-2 text-sm text-red-600">{errors.ingredients}</p>
      {/if}
    </div>
    
    <!-- Instructions -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Instructions *</h3>
        <button
          type="button"
          onclick={addInstruction}
          class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add Step
        </button>
      </div>
      
      <div class="space-y-4">
        {#each instructions as instruction, index}
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div class="flex justify-between items-start mb-3">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                Step {instruction.step}
              </h4>
              <button
                type="button"
                onclick={() => removeInstruction(index)}
                class="text-red-600 hover:text-red-800 focus:outline-none"
                disabled={instructions.length === 1}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="md:col-span-2">
                <textarea
                  bind:value={instruction.instruction}
                  placeholder="Describe this step in detail..."
                  rows="3"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>
              
              <div class="space-y-3">
                <input
                  type="text"
                  bind:value={instruction.duration}
                  placeholder="Duration (e.g., 5 minutes)"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  bind:value={instruction.temperature}
                  placeholder="Temperature (e.g., 350°F)"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      {#if errors.instructions}
        <p class="mt-2 text-sm text-red-600">{errors.instructions}</p>
      {/if}
    </div>
    
    <!-- Tags -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Tags</h3>
      
      <div class="space-y-4">
        <div class="flex">
          <input
            type="text"
            bind:value={tagInput}
            onkeydown={handleTagKeydown}
            placeholder="Add a tag and press Enter"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="button"
            onclick={addTag}
            class="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
        
        {#if tags.length > 0}
          <div class="flex flex-wrap gap-2">
            {#each tags as tag}
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {tag}
                <button
                  type="button"
                  onclick={() => removeTag(tag)}
                  class="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  ×
                </button>
              </span>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Publishing Options -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Publishing</h3>
      
      <div class="flex items-center">
        <input
          type="checkbox"
          id="is-published"
          bind:checked={isPublished}
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="is-published" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          Publish this recipe (make it visible to all users)
        </label>
      </div>
      
      {#if !isPublished}
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This recipe will be saved as a draft and only visible to administrators.
        </p>
      {/if}
    </div>
    
    <!-- Form Actions -->
    <div class="flex justify-end space-x-4">
      <button
        type="button"
        onclick={() => goto('/admin/recipes')}
        class="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
      >
        Cancel
      </button>
      
      <button
        type="submit"
        disabled={$recipesLoading}
        class="px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if $recipesLoading}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        {:else}
          {mode === 'create' ? 'Create Recipe' : 'Update Recipe'}
        {/if}
      </button>
    </div>
    
    {#if $recipesError}
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error saving recipe</h3>
            <p class="mt-1 text-sm text-red-700">{$recipesError}</p>
          </div>
        </div>
      </div>
    {/if}
  </form>
</div>