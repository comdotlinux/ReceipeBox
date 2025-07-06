# User Role Management Documentation

## Overview

The Recipe Box application implements a role-based access control system with two distinct user roles:
- **Admin**: Full access to create, edit, and delete recipes, tags, and manage application settings
- **Reader**: View-only access to published recipes

## Role System Architecture

### PocketBase Schema Configuration

The user role system is implemented in the PocketBase schema with the following configuration:

```javascript
// Role field in users collection
{
  "id": "role",
  "name": "role", 
  "type": "select",
  "required": true,
  "options": {
    "maxSelect": 1,
    "values": ["admin", "reader"]
  }
}
```

### Access Control Rules

Collections are protected with role-based access control:

| Collection | List | View | Create | Update | Delete |
|-----------|------|------|--------|--------|--------|
| recipes | Auth + Published | Auth + Published | Admin Only | Admin Only | Admin Only |
| tags | Auth Users | Auth Users | Admin Only | Admin Only | Admin Only |
| app_metadata | Auth Users | Auth Users | Admin Only | Admin Only | Admin Only |
| recipe_images | Auth Users | Auth Users | Admin Only | Admin Only | Admin Only |

## API Methods

### PocketBase Service Methods

#### `promoteToAdmin(userId: string): Promise<User>`
Promotes an existing user to admin role.

```typescript
import { pb } from '$lib/services';

try {
  const updatedUser = await pb.promoteToAdmin('user-id-here');
  console.log('User promoted to admin:', updatedUser);
} catch (error) {
  console.error('Failed to promote user:', error);
}
```

#### `demoteFromAdmin(userId: string): Promise<User>`
Demotes an admin user to reader role.

```typescript
import { pb } from '$lib/services';

try {
  const updatedUser = await pb.demoteFromAdmin('user-id-here');
  console.log('User demoted from admin:', updatedUser);
} catch (error) {
  console.error('Failed to demote user:', error);
}
```

#### `updateUserRole(userId: string, role: 'admin' | 'reader'): Promise<User>`
Updates a user's role to the specified value.

```typescript
import { pb } from '$lib/services';

try {
  const updatedUser = await pb.updateUserRole('user-id-here', 'admin');
  console.log('User role updated:', updatedUser);
} catch (error) {
  console.error('Failed to update user role:', error);
}
```

### Auth Store Methods

#### `promoteToAdmin(userId: string): Promise<void>`
Auth store wrapper for promoting users with state management.

```typescript
import { authStore } from '$lib/stores/auth';

try {
  await authStore.promoteToAdmin('user-id-here');
  // State automatically updated if current user
} catch (error) {
  console.error('Failed to promote user:', error);
}
```

#### `demoteFromAdmin(userId: string): Promise<void>`
Auth store wrapper for demoting users with state management.

```typescript
import { authStore } from '$lib/stores/auth';

try {
  await authStore.demoteFromAdmin('user-id-here');
  // State automatically updated if current user
} catch (error) {
  console.error('Failed to demote user:', error);
}
```

#### `updateUserRole(userId: string, role: 'admin' | 'reader'): Promise<void>`
Auth store wrapper for updating user roles with state management.

```typescript
import { authStore } from '$lib/stores/auth';

try {
  await authStore.updateUserRole('user-id-here', 'admin');
  // State automatically updated if current user
} catch (error) {
  console.error('Failed to update user role:', error);
}
```

## Reactive State Management

The application provides reactive stores for role-based UI rendering:

```typescript
import { user, isAdmin, isReader, isAuthenticated } from '$lib/stores/auth';

// Check if current user is admin
$: canEdit = $isAdmin;

// Check if current user is reader
$: canView = $isReader;

// Check if user is authenticated
$: loggedIn = $isAuthenticated;
```

## Usage Examples

### Admin Panel Component

```svelte
<script>
  import { authStore, isAdmin } from '$lib/stores/auth';
  
  let userId = '';
  
  async function promoteUser() {
    try {
      await authStore.promoteToAdmin(userId);
      alert('User promoted to admin successfully!');
    } catch (error) {
      alert('Failed to promote user: ' + error.message);
    }
  }
  
  async function demoteUser() {
    try {
      await authStore.demoteFromAdmin(userId);
      alert('User demoted from admin successfully!');
    } catch (error) {
      alert('Failed to demote user: ' + error.message);
    }
  }
</script>

{#if $isAdmin}
  <div class="admin-panel">
    <h2>User Management</h2>
    <input bind:value={userId} placeholder="Enter User ID" />
    <button on:click={promoteUser}>Promote to Admin</button>
    <button on:click={demoteUser}>Demote from Admin</button>
  </div>
{/if}
```

### Role-Based Navigation

```svelte
<script>
  import { isAdmin, isReader } from '$lib/stores/auth';
</script>

<nav>
  <a href="/recipes">Recipes</a>
  {#if $isAdmin}
    <a href="/admin">Admin Panel</a>
    <a href="/recipes/create">Create Recipe</a>
  {/if}
  {#if $isReader}
    <a href="/favorites">My Favorites</a>
  {/if}
</nav>
```

## Security Considerations

### Permission Validation
- All role changes require admin privileges
- User role updates are validated server-side in PocketBase
- Client-side role checks are for UI only - never rely on them for security

### Best Practices

1. **Server-Side Validation**: Always validate permissions on the server
2. **Error Handling**: Implement comprehensive error handling for role operations
3. **State Synchronization**: Use the auth store methods to ensure UI state stays in sync
4. **Audit Trail**: Consider logging role changes for security auditing

### Error Handling

```typescript
try {
  await authStore.promoteToAdmin(userId);
} catch (error) {
  if (error.message.includes('Forbidden')) {
    console.error('Insufficient permissions to promote user');
  } else if (error.message.includes('Not Found')) {
    console.error('User not found');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Integration with Components

### Protected Routes

```typescript
// src/routes/admin/+page.server.ts
import { pb } from '$lib/services';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
  if (!locals.user || locals.user.role !== 'admin') {
    throw redirect(303, '/login');
  }
  
  return {
    user: locals.user
  };
}
```

### Role-Based Component Rendering

```svelte
<script>
  import { isAdmin, user } from '$lib/stores/auth';
</script>

{#if $isAdmin}
  <AdminControls />
{:else if $user}
  <UserControls />
{:else}
  <GuestControls />
{/if}
```

## Migration and Default Roles

### Default Role Assignment
- New users are automatically assigned the 'reader' role
- This is configured in the PocketBase service registration method
- Admins must manually promote users to admin role

### Existing User Migration
If you have existing users without roles, you can migrate them:

```typescript
// Migration script example
import { pb } from '$lib/services';

async function migrateExistingUsers() {
  const users = await pb.client.collection('users').getFullList();
  
  for (const user of users) {
    if (!user.role) {
      await pb.updateUserRole(user.id, 'reader');
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure the current user has admin privileges
2. **User Not Found**: Verify the user ID is correct
3. **State Not Updating**: Use auth store methods instead of direct PocketBase calls
4. **UI Not Reflecting Changes**: Check that components are subscribing to the correct stores

### Debug Tips

```typescript
// Check current user role
console.log('Current user:', pb.currentUser);
console.log('Is admin:', pb.currentUser?.role === 'admin');

// Monitor auth state changes
user.subscribe(($user) => {
  console.log('User state changed:', $user);
});
```