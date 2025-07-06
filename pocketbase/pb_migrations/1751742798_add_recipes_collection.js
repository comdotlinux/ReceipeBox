/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: 'recipes',
    type: 'base',
    schema: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: {
          min: 1,
          max: 200
        }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: {
          max: 500
        }
      },
      {
        name: 'ingredients',
        type: 'json',
        required: true
      },
      {
        name: 'instructions',
        type: 'json',
        required: true
      },
      {
        name: 'tags',
        type: 'json',
        required: false
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
      },
      {
        name: 'source',
        type: 'json',
        required: false
      },
      {
        name: 'is_published',
        type: 'bool',
        required: false
      },
      {
        name: 'cache_key',
        type: 'text',
        required: false
      }
    ]
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('recipes')
  return app.delete(collection)
})