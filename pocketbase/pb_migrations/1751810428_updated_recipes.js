/// <reference path="../pb_data/types.d.ts" />
migrate(
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_842702175');

		// remove field
		collection.fields.removeById('text_title');

		// remove field
		collection.fields.removeById('text_description');

		// remove field
		collection.fields.removeById('json_ingredients');

		// remove field
		collection.fields.removeById('json_instructions');

		// remove field
		collection.fields.removeById('json_tags');

		// remove field
		collection.fields.removeById('json_metadata');

		// remove field
		collection.fields.removeById('json_source');

		// remove field
		collection.fields.removeById('text_cache_key');

		// add field
		collection.fields.addAt(
			5,
			new Field({
				autogeneratePattern: '',
				hidden: false,
				id: 'text724990059',
				max: 200,
				min: 0,
				name: 'title',
				pattern: '',
				presentable: false,
				primaryKey: false,
				required: true,
				system: false,
				type: 'text'
			})
		);

		// add field
		collection.fields.addAt(
			6,
			new Field({
				autogeneratePattern: '',
				hidden: false,
				id: 'text1843675174',
				max: 500,
				min: 0,
				name: 'description',
				pattern: '',
				presentable: false,
				primaryKey: false,
				required: false,
				system: false,
				type: 'text'
			})
		);

		// add field
		collection.fields.addAt(
			7,
			new Field({
				hidden: false,
				id: 'json1264587087',
				maxSize: 0,
				name: 'ingredients',
				presentable: false,
				required: true,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			8,
			new Field({
				hidden: false,
				id: 'json2575139115',
				maxSize: 0,
				name: 'instructions',
				presentable: false,
				required: true,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			9,
			new Field({
				hidden: false,
				id: 'json1874629670',
				maxSize: 0,
				name: 'tags',
				presentable: false,
				required: false,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			10,
			new Field({
				hidden: false,
				id: 'json1326724116',
				maxSize: 0,
				name: 'metadata',
				presentable: false,
				required: false,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			11,
			new Field({
				hidden: false,
				id: 'json1602912115',
				maxSize: 0,
				name: 'source',
				presentable: false,
				required: false,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			12,
			new Field({
				autogeneratePattern: '',
				hidden: false,
				id: 'text1983006679',
				max: 0,
				min: 0,
				name: 'cache_key',
				pattern: '',
				presentable: false,
				primaryKey: false,
				required: false,
				system: false,
				type: 'text'
			})
		);

		return app.save(collection);
	},
	(app) => {
		const collection = app.findCollectionByNameOrId('pbc_842702175');

		// add field
		collection.fields.addAt(
			1,
			new Field({
				autogeneratePattern: '',
				hidden: false,
				id: 'text_title',
				max: 0,
				min: 0,
				name: 'title',
				pattern: '',
				presentable: false,
				primaryKey: false,
				required: true,
				system: false,
				type: 'text'
			})
		);

		// add field
		collection.fields.addAt(
			2,
			new Field({
				autogeneratePattern: '',
				hidden: false,
				id: 'text_description',
				max: 0,
				min: 0,
				name: 'description',
				pattern: '',
				presentable: false,
				primaryKey: false,
				required: false,
				system: false,
				type: 'text'
			})
		);

		// add field
		collection.fields.addAt(
			3,
			new Field({
				hidden: false,
				id: 'json_ingredients',
				maxSize: 0,
				name: 'ingredients',
				presentable: false,
				required: true,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			4,
			new Field({
				hidden: false,
				id: 'json_instructions',
				maxSize: 0,
				name: 'instructions',
				presentable: false,
				required: true,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			5,
			new Field({
				hidden: false,
				id: 'json_tags',
				maxSize: 0,
				name: 'tags',
				presentable: false,
				required: false,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			6,
			new Field({
				hidden: false,
				id: 'json_metadata',
				maxSize: 0,
				name: 'metadata',
				presentable: false,
				required: false,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			7,
			new Field({
				hidden: false,
				id: 'json_source',
				maxSize: 0,
				name: 'source',
				presentable: false,
				required: false,
				system: false,
				type: 'json'
			})
		);

		// add field
		collection.fields.addAt(
			8,
			new Field({
				autogeneratePattern: '',
				hidden: false,
				id: 'text_cache_key',
				max: 0,
				min: 0,
				name: 'cache_key',
				pattern: '',
				presentable: false,
				primaryKey: false,
				required: false,
				system: false,
				type: 'text'
			})
		);

		// remove field
		collection.fields.removeById('text724990059');

		// remove field
		collection.fields.removeById('text1843675174');

		// remove field
		collection.fields.removeById('json1264587087');

		// remove field
		collection.fields.removeById('json2575139115');

		// remove field
		collection.fields.removeById('json1874629670');

		// remove field
		collection.fields.removeById('json1326724116');

		// remove field
		collection.fields.removeById('json1602912115');

		// remove field
		collection.fields.removeById('text1983006679');

		return app.save(collection);
	}
);
