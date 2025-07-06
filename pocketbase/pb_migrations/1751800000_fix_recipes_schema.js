/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_842702175")

  // Add missing fields if they don't exist

  // Add title field
  try {
    collection.fields.addAt(1, new Field({
      "hidden": false,
      "id": "text_title",
      "maxSize": 200,
      "name": "title",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "text"
    }))
  } catch (e) {
    console.log("Title field may already exist")
  }

  // Add description field
  try {
    collection.fields.addAt(2, new Field({
      "hidden": false,
      "id": "text_description",
      "maxSize": 500,
      "name": "description",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    }))
  } catch (e) {
    console.log("Description field may already exist")
  }

  // Add ingredients field
  try {
    collection.fields.addAt(3, new Field({
      "hidden": false,
      "id": "json_ingredients",
      "name": "ingredients",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "json"
    }))
  } catch (e) {
    console.log("Ingredients field may already exist")
  }

  // Add instructions field
  try {
    collection.fields.addAt(4, new Field({
      "hidden": false,
      "id": "json_instructions",
      "name": "instructions",
      "presentable": false,
      "required": true,
      "system": false,
      "type": "json"
    }))
  } catch (e) {
    console.log("Instructions field may already exist")
  }

  // Add tags field
  try {
    collection.fields.addAt(5, new Field({
      "hidden": false,
      "id": "json_tags",
      "name": "tags",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    }))
  } catch (e) {
    console.log("Tags field may already exist")
  }

  // Add metadata field
  try {
    collection.fields.addAt(6, new Field({
      "hidden": false,
      "id": "json_metadata",
      "name": "metadata",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    }))
  } catch (e) {
    console.log("Metadata field may already exist")
  }

  // Add source field
  try {
    collection.fields.addAt(7, new Field({
      "hidden": false,
      "id": "json_source",
      "name": "source",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "json"
    }))
  } catch (e) {
    console.log("Source field may already exist")
  }

  // Add cache_key field
  try {
    collection.fields.addAt(8, new Field({
      "hidden": false,
      "id": "text_cache_key",
      "name": "cache_key",
      "presentable": false,
      "required": false,
      "system": false,
      "type": "text"
    }))
  } catch (e) {
    console.log("Cache key field may already exist")
  }

  return app.save(collection)
}, (app) => {
  // Rollback - remove the fields
  const collection = app.findCollectionByNameOrId("pbc_842702175")

  // Remove fields if they exist
  try { collection.fields.removeById("text_title") } catch (e) {}
  try { collection.fields.removeById("text_description") } catch (e) {}
  try { collection.fields.removeById("json_ingredients") } catch (e) {}
  try { collection.fields.removeById("json_instructions") } catch (e) {}
  try { collection.fields.removeById("json_tags") } catch (e) {}
  try { collection.fields.removeById("json_metadata") } catch (e) {}
  try { collection.fields.removeById("json_source") } catch (e) {}
  try { collection.fields.removeById("text_cache_key") } catch (e) {}

  return app.save(collection)
})