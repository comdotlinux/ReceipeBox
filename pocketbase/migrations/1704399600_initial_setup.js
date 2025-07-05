// Initial migration to set up all collections
migrate((db) => {
  // Update users collection to include role field
  const usersCollection = $app.dao().findCollectionByNameOrId("users")
  if (usersCollection) {
    // Add role field
    usersCollection.schema.addField(new SchemaField({
      "id": "role",
      "name": "role",
      "type": "select",
      "required": true,
      "presentable": false,
      "unique": false,
      "options": {
        "maxSelect": 1,
        "values": ["admin", "reader"]
      }
    }))

    // Set default role to reader
    usersCollection.createRule = ""
    usersCollection.updateRule = "@request.auth.id = id"
    usersCollection.deleteRule = "@request.auth.id = id"
    usersCollection.listRule = "@request.auth.id != ''"
    usersCollection.viewRule = "@request.auth.id != ''"
    
    $app.dao().saveCollection(usersCollection)
  }

  // Create recipes collection
  const recipesCollection = new Collection({
    "id": "recipes",
    "name": "recipes",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "title",
        "name": "title",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": false,
        "options": {
          "min": 3,
          "max": 200,
          "pattern": ""
        }
      },
      {
        "id": "description",
        "name": "description",
        "type": "editor",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "convertUrls": false
        }
      },
      {
        "id": "image",
        "name": "image",
        "type": "file",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": ["image/jpeg", "image/png", "image/webp"],
          "thumbs": ["200x200", "400x400"],
          "maxSelect": 1,
          "maxSize": 10485760
        }
      },
      {
        "id": "ingredients",
        "name": "ingredients",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "id": "instructions",
        "name": "instructions",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "id": "tags",
        "name": "tags",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 1000
        }
      },
      {
        "id": "metadata",
        "name": "metadata",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 5000
        }
      },
      {
        "id": "source",
        "name": "source",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 5000
        }
      },
      {
        "id": "created_by",
        "name": "created_by",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name", "email"]
        }
      },
      {
        "id": "last_modified_by",
        "name": "last_modified_by",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name", "email"]
        }
      },
      {
        "id": "is_published",
        "name": "is_published",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "id": "cache_key",
        "name": "cache_key",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 64,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX idx_recipes_published ON recipes (is_published)",
      "CREATE INDEX idx_recipes_created_by ON recipes (created_by)",
      "CREATE INDEX idx_recipes_cache_key ON recipes (cache_key)"
    ],
    "listRule": "@request.auth.id != '' && is_published = true",
    "viewRule": "@request.auth.id != '' && is_published = true",
    "createRule": "@request.auth.role = 'admin'",
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'"
  })

  $app.dao().saveCollection(recipesCollection)

  // Create tags collection
  const tagsCollection = new Collection({
    "id": "tags",
    "name": "tags",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "name",
        "name": "name",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "min": 2,
          "max": 30,
          "pattern": ""
        }
      },
      {
        "id": "slug",
        "name": "slug",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": true,
        "options": {
          "min": 2,
          "max": 50,
          "pattern": "^[a-z0-9-]+$"
        }
      },
      {
        "id": "usage_count",
        "name": "usage_count",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "id": "color",
        "name": "color",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 7,
          "max": 7,
          "pattern": "^#[0-9a-f]{6}$"
        }
      },
      {
        "id": "created_by",
        "name": "created_by",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name", "email"]
        }
      }
    ],
    "indexes": [
      "CREATE INDEX idx_tags_usage_count ON tags (usage_count)",
      "CREATE INDEX idx_tags_name ON tags (name)"
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.role = 'admin'",
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'"
  })

  $app.dao().saveCollection(tagsCollection)

  // Create app_metadata collection
  const appMetadataCollection = new Collection({
    "id": "app_metadata",
    "name": "app_metadata",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "key",
        "name": "key",
        "type": "text",
        "required": true,
        "presentable": true,
        "unique": true,
        "options": {
          "min": 1,
          "max": 50,
          "pattern": ""
        }
      },
      {
        "id": "value",
        "name": "value",
        "type": "json",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 10000
        }
      }
    ],
    "indexes": [
      "CREATE INDEX idx_app_metadata_key ON app_metadata (key)"
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.role = 'admin'",
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'"
  })

  $app.dao().saveCollection(appMetadataCollection)

  // Create recipe_images collection (for multiple images per recipe)
  const recipeImagesCollection = new Collection({
    "id": "recipe_images",
    "name": "recipe_images",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "recipe_id",
        "name": "recipe_id",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "recipes",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["title"]
        }
      },
      {
        "id": "image",
        "name": "image",
        "type": "file",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": ["image/jpeg", "image/png", "image/webp"],
          "thumbs": ["200x200", "400x400"],
          "maxSelect": 1,
          "maxSize": 10485760
        }
      },
      {
        "id": "caption",
        "name": "caption",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 200,
          "pattern": ""
        }
      },
      {
        "id": "order",
        "name": "order",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "id": "is_primary",
        "name": "is_primary",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [
      "CREATE INDEX idx_recipe_images_recipe_id ON recipe_images (recipe_id)",
      "CREATE INDEX idx_recipe_images_order ON recipe_images (order)"
    ],
    "listRule": "@request.auth.id != ''",
    "viewRule": "@request.auth.id != ''",
    "createRule": "@request.auth.role = 'admin'",
    "updateRule": "@request.auth.role = 'admin'",
    "deleteRule": "@request.auth.role = 'admin'"
  })

  $app.dao().saveCollection(recipeImagesCollection)
}, (db) => {
  // Down migration
  const collections = ["recipes", "tags", "app_metadata", "recipe_images"]
  
  for (const collectionName of collections) {
    try {
      const collection = $app.dao().findCollectionByNameOrId(collectionName)
      if (collection) {
        $app.dao().deleteCollection(collection)
      }
    } catch (e) {
      console.log(`Failed to delete collection ${collectionName}:`, e)
    }
  }
})