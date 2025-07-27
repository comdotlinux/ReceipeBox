/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_842702175');

		// update collection data
		unmarshal(
			{
				createRule: '@request.auth.role = "admin"',
				deleteRule: '@request.auth.role = "admin"',
				listRule: '(@request.auth.id != "") && (is_published = true)',
				updateRule: '@request.auth.role = "admin"',
				viewRule: '(@request.auth.id != "") && (is_published = true)'
			},
			collection
		);

		// add field
		collection.fields.addAt(
			1,
			new Field({
				hidden: false,
				id: 'file3309110367',
				maxSelect: 1,
				maxSize: 0,
				mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
				name: 'image',
				presentable: false,
				protected: false,
				required: false,
				system: false,
				thumbs: ['100x100', '300x300', '600x600'],
				type: 'file'
			})
		);

		// add field
		collection.fields.addAt(
			2,
			new Field({
				cascadeDelete: false,
				collectionId: '_pb_users_auth_',
				hidden: false,
				id: 'relation3725765462',
				maxSelect: 1,
				minSelect: 0,
				name: 'created_by',
				presentable: false,
				required: true,
				system: false,
				type: 'relation'
			})
		);

		// add field
		collection.fields.addAt(
			3,
			new Field({
				cascadeDelete: false,
				collectionId: '_pb_users_auth_',
				hidden: false,
				id: 'relation1708078862',
				maxSelect: 1,
				minSelect: 0,
				name: 'last_modified_by',
				presentable: false,
				required: false,
				system: false,
				type: 'relation'
			})
		);

		// add field
		collection.fields.addAt(
			4,
			new Field({
				hidden: false,
				id: 'bool1875119480',
				name: 'is_published',
				presentable: false,
				required: false,
				system: false,
				type: 'bool'
			})
		);

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_842702175');

		// update collection data
		unmarshal(
			{
				createRule: null,
				deleteRule: null,
				listRule: null,
				updateRule: null,
				viewRule: null
			},
			collection
		);

		// remove field
		collection.fields.removeById('file3309110367');

		// remove field
		collection.fields.removeById('relation3725765462');

		// remove field
		collection.fields.removeById('relation1708078862');

		// remove field
		collection.fields.removeById('bool1875119480');

		return app.save(collection);
	}
);
