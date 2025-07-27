/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("users");

    // Find the role field and update it with a default value
    const roleField = collection.fields.find((field) => field.name === "role");
    
    if (roleField) {
      // For select fields, set the default in options
      roleField.options = {
        ...roleField.options,
        default: "reader"
      };
    }

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("users");

    // Find the role field and remove the default value
    const roleField = collection.fields.find((field) => field.name === "role");
    
    if (roleField) {
      // Remove default value
      roleField.options = {
        ...roleField.options,
        default: ""
      };
    }

    return app.save(collection);
  }
);