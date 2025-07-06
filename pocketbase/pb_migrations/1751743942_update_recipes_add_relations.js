/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // This migration is now a no-op since the relations can't be added
  // without the users collection existing with the correct ID
  // You'll need to add these fields manually through the PocketBase admin UI
  return null
}, (app) => {
  // No rollback needed
  return null
})