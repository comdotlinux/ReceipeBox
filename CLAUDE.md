# Recipe Collection PWA - Project Status & Instructions

## Document Information
- **Product Name**: MyRecipeBox
- **Version**: 1.0
- **Date**: July 18, 2025
- **Product Manager**: [Your Name]
- **Status**: Active Development
- **Requirements Document**: [PRD](./PRD.md)

## Current Project Status

### ✅ Completed Features (Phase 1-3 Complete)

#### **Phase 1: Core Foundation & Setup** ✅
- Set up SvelteKit project with TypeScript
- Installed all dependencies (PocketBase SDK, Dexie, Tailwind CSS)
- Created comprehensive project folder structure
- Configured environment variables
- Defined TypeScript interfaces and data models
- Created service classes for API interactions
- Set up Svelte stores for state management
- Configured PocketBase backend with proper collections
- Created development scripts and environment

#### **Phase 2: Authentication & Authorization** ✅
- Implemented PocketBase authentication (email/password + OAuth)
- Created login/register components using Svelte 5 runes
- Set up OAuth providers (Google, GitHub)
- Implemented role-based access control (Admin/Reader roles)
- Created authentication guards and navigation
- Written comprehensive unit tests (69/69 passing)
- Written comprehensive E2E tests (50/50 passing)
- Updated all components to use modern Svelte 5 syntax

#### **Phase 3: Recipe Management** ✅
- Built manual recipe creation form with comprehensive validation
- Implemented full recipe CRUD operations with PocketBase integration
- Created responsive recipe listing and detail views
- Added admin-only edit/delete functionality with role-based access
- Created admin routes (/admin/recipes/new, /admin/recipes/[id]/edit)
- Implemented recipe detail view (/recipes/[id]) with breadcrumbs
- Updated homepage to display recipe collection
- **Recipe Publishing System** ✅
  - Implemented draft/published states
  - Role-based recipe visibility (admin sees all, readers see published only)
  - Draft indicators and visual badges
  - Publish toggle in recipe forms
  - Custom error pages and handling

### 📊 Testing Coverage
- **Unit Tests**: 69/69 passing (PocketBase service, Recipe service, Auth store)
- **E2E Tests**: 50/50 passing (Auth flows, Recipe CRUD, Visibility, Error handling)
- **Interactive Coverage UI**: Available via `npm run test:coverage`

### 🔄 In Progress (Phase 4)

#### **Phase 4: AI Integration**
- [ ] Integrate Google Gemini API for URL extraction
- [ ] Implement image upload and preprocessing
- [ ] Add Gemini Vision API for OCR
- [ ] Create review/edit extracted content interface

### 📋 Upcoming Phases

#### **Phase 5: Search & Discovery**
- Full-text search functionality
- Tag-based filtering
- Advanced search features
- Tag management interface

#### **Phase 6: PWA & Offline Features**
- Service worker implementation
- Offline data synchronization
- PWA manifest configuration
- Offline/online state handling

#### **Phase 7: Testing & Quality**
- Additional unit test coverage
- Integration tests with Playwright
- AI extraction feature tests
- Offline functionality tests

#### **Phase 8: Deployment & Production**
- Cloudflare Pages deployment
- CI/CD pipeline setup
- Error tracking and monitoring
- Performance optimization

## Development Instructions

### Important Reminders
- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary
- ALWAYS prefer editing existing files to creating new ones
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

### Running the Application
```bash
# Start development server with PocketBase
npm run dev:full

# Or run separately:
npm run pocketbase  # Terminal 1
npm run dev         # Terminal 2
```

### Testing Commands
```bash
# Run all tests
npm run test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Key Files & Locations
- **PocketBase Config**: `/pocketbase/pb_data/`
- **Recipe Service**: `/src/lib/services/recipe.ts`
- **Auth Store**: `/src/lib/stores/auth.ts`
- **Recipe Components**: `/src/lib/components/recipe/`
- **Admin Routes**: `/src/routes/admin/`
- **Test Files**: `/src/**/*.test.ts` and `/e2e/`

### Current Architecture
- **Frontend**: SvelteKit with TypeScript
- **Backend**: PocketBase (local instance)
- **Styling**: Tailwind CSS
- **State Management**: Svelte stores
- **Testing**: Vitest + Playwright
- **Authentication**: PocketBase Auth with OAuth support

### Next Steps
1. Begin Phase 4: AI Integration
2. Set up Google Gemini API credentials
3. Implement URL extraction endpoint
4. Create image upload functionality
5. Add OCR capabilities with Gemini Vision
