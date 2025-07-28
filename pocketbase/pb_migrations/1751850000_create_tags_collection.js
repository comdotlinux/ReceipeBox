/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = new Collection({
			id: 'pbc_tags_12345',
			name: 'tags',
			type: 'base',
			system: false,
			schema: [
				{
					id: 'text_name',
					name: 'name',
					type: 'text',
					required: true,
					unique: true,
					options: {
						min: 1,
						max: 50,
						pattern: '^[a-zA-Z0-9\\s\\-_]+$'
					}
				},
				{
					id: 'text_description',
					name: 'description',
					type: 'text',
					required: false,
					options: {
						max: 200
					}
				},
				{
					id: 'text_category',
					name: 'category',
					type: 'select',
					required: false,
					options: {
						maxSelect: 1,
						values: ['cuisine', 'dietary', 'difficulty', 'meal_type', 'cooking_method', 'other']
					}
				},
				{
					id: 'text_slug',
					name: 'slug',
					type: 'text',
					required: true,
					unique: true,
					options: {
						min: 1,
						max: 50,
						pattern: '^[a-z0-9\\-_]+$'
					}
				},
				{
					id: 'text_color',
					name: 'color',
					type: 'text',
					required: false,
					options: {
						min: 4,
						max: 7,
						pattern: '^#[0-9a-fA-F]{6}$'
					}
				},
				{
					id: 'relation_created_by',
					name: 'created_by',
					type: 'relation',
					required: true,
					options: {
						maxSelect: 1,
						collectionId: 'users'
					}
				},
				{
					id: 'number_usage_count',
					name: 'usage_count',
					type: 'number',
					required: false,
					options: {
						min: 0
					}
				}
			],
			listRule: '@request.auth.id != ""',
			viewRule: '@request.auth.id != ""',
			createRule: '@request.auth.role = "admin"',
			updateRule: '@request.auth.role = "admin"',
			deleteRule: '@request.auth.role = "admin"'
		});

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('tags');
		return app.delete(collection);
	}
);