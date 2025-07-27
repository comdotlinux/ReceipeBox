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

- **Unit Tests**: 74/74 passing (PocketBase, Recipe, Auth, Gemini services)
- **E2E Tests**: 50/50 passing (Auth flows, Recipe CRUD, Visibility, Error handling)
- **Interactive Coverage UI**: Available via `npm run test:coverage`

### ✅ Completed Features (Phase 1-5 Complete)

#### **Phase 4: AI Integration** ✅

- Integrated Google Gemini API for URL extraction
- Implemented image upload and preprocessing
- Added Gemini Vision API for OCR capabilities
- Created review/edit interface for extracted content
- Built comprehensive extraction UI with three modes (manual, URL, image)
- Added API endpoints for server-side extraction processing
- Implemented proper error handling and validation
- Created tests for AI extraction features (74/74 passing)

#### **Phase 5: Search & Discovery** ✅

- Implemented advanced search functionality with multiple filter options
- Created dedicated search page (/search) with comprehensive filtering
- Built tag management interface for administrators (/admin/tags)
- Added popular tags display and quick filtering on homepage
- Enhanced navigation with search functionality in header
- Integrated cuisine, difficulty, and dietary preference filters
- Added real-time search with auto-complete functionality
- Created tag-based filtering with visual tag indicators

### 📋 Upcoming Phases

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
- NEVER proactively create documentation files (\*.md) or README files unless explicitly requested

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.

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

1. Begin Phase 5: Search & Discovery
2. Implement full-text search functionality
3. Add tag-based filtering and advanced search
4. Create tag management interface
5. Build search optimization features

---

# Consolidated Documentation

## Product Requirements Document (Archived from PRD.md)

### Executive Summary

RecipeVault is a Progressive Web Application that enables users to collect, organize, and access recipes both online and offline. The app leverages AI-powered recipe extraction from URLs and provides a clean, searchable interface for recipe management.

### Key Features

1. **Progressive Web App** with installation capability
2. **AI-Powered Recipe Extraction** from URLs and images
3. **Triple Input Methods** (URL, manual form, and image upload with OCR)
4. **Advanced Search & Tagging** system
5. **Offline-First Architecture** with smart caching
6. **Role-Based Access Control** (Admin/User)
7. **Material Design** with theme support

### Technical Stack

- **Frontend**: SvelteKit with TypeScript
- **Backend**: PocketBase (Go-based BaaS)
- **Authentication**: PocketBase Auth (OAuth2, email/password)
- **Database**: PocketBase SQLite (with optional PostgreSQL)
- **AI Integration**: Google Gemini API (via PocketBase hooks/extensions)
- **Testing**: Vitest + Playwright for unit and integration tests

---

## Deployment Guide (Archived from DEPLOYMENT.md)

### Local Development Setup

#### Running PocketBase Locally

```bash
# Download PocketBase (if not already installed)
# Visit https://pocketbase.io/docs/ for latest version

# Start PocketBase server
cd pocketbase/
./pocketbase serve

# PocketBase will be available at:
# - API: http://localhost:8090/api/
# - Admin UI: http://localhost:8090/_/
```

#### Environment Variables Setup

Create `.env` file in project root:

```bash
# Required Environment Variables
VITE_POCKETBASE_URL=http://localhost:8090
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Optional - for OAuth providers
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GITHUB_CLIENT_ID=your-github-client-id
```

#### Development Commands

```bash
# Install dependencies
npm install

# Start development with PocketBase
npm run dev:full

# Or run separately:
npm run pocketbase  # Terminal 1 - starts PocketBase
npm run dev         # Terminal 2 - starts SvelteKit dev server
```

### Production Architecture Overview

- **Frontend**: SvelteKit app container (port 3000)
- **Backend**: PocketBase database and API container (port 8090)
- **Storage**: Docker volumes for persistent data (database + uploaded images)
- **Orchestration**: Docker Compose for multi-container management
- **External**: Reverse proxy and TLS handled externally

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Server with at least 2GB RAM and 10GB storage
- External reverse proxy/load balancer (Cloudflare, AWS ALB, etc.)

### Production Environment Setup

Create `.env.production` file:

```bash
# Application Configuration
NODE_ENV=production
VITE_POCKETBASE_URL=http://localhost:8090/api
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# PocketBase Configuration
PB_ADMIN_EMAIL=admin@your-domain.com
PB_ADMIN_PASSWORD=your-secure-admin-password
PB_ENCRYPTION_KEY=your-32-character-encryption-key

# Port Configuration
FRONTEND_PORT=3000
POCKETBASE_PORT=8090
```

### Docker Deployment

#### Using Docker Compose

```bash
# Navigate to docker directory
cd docker/

# Build and start services
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Manual Docker Commands

```bash
# Build frontend image
docker build -f docker/Dockerfile.frontend -t myrecipebox-frontend .

# Run PocketBase container
docker run -d \
  --name myrecipebox-pocketbase \
  -p 8090:8090 \
  -v pocketbase_data:/pb_data \
  ghcr.io/muchobien/pocketbase:latest

# Run frontend container
docker run -d \
  --name myrecipebox-frontend \
  -p 3000:3000 \
  --link myrecipebox-pocketbase \
  myrecipebox-frontend
```

### Key Deployment Files

- `docker/docker-compose.yml` - Production Docker Compose configuration
- `docker/Dockerfile.frontend` - Frontend container build configuration
- `scripts/migrate.sh` - Database migration script
- `scripts/backup.sh` - Automated backup script
- `scripts/restore.sh` - Backup restoration script

### Initial Setup Steps

1. **Prepare Environment**
   ```bash
   mkdir -p /opt/myrecipebox
   cd /opt/myrecipebox
   git clone https://github.com/comdotlinux/ReceipeBox.git .
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with your settings
   ```

3. **Deploy with Docker**
   ```bash
   cd docker/
   docker-compose up --build -d
   ```

4. **Verify Deployment**
   ```bash
   curl -f http://localhost:3000/health
   curl -f http://localhost:8090/api/health
   ```

### Backup and Restore

#### Create Backup
```bash
./scripts/backup.sh
```

#### Restore from Backup
```bash
./scripts/restore.sh YYYYMMDD_HHMMSS
```

### Health Monitoring

The application includes health check endpoints:
- Frontend: `http://localhost:3000/health`
- PocketBase: `http://localhost:8090/api/health`

### Troubleshooting

#### Common Issues

1. **PocketBase won't start**
   - Check port 8090 is available
   - Verify volume permissions
   - Check logs: `docker-compose logs pocketbase`

2. **Frontend can't connect to PocketBase**
   - Verify VITE_POCKETBASE_URL in environment
   - Check network connectivity between containers
   - Ensure PocketBase is healthy before frontend starts

3. **Environment variables not loading**
   - Verify .env file location and syntax
   - Check Docker container environment configuration
   - Restart containers after environment changes

---

## Theme Testing Guide (Archived from theme-testing-guide.md)

### Theme Toggle Fixes Applied

1. **Homepage Trash Icon Fixed** 📖 - Changed to recipe book icon
2. **Header Logo Fixed** 📚 - Changed to recipe book icon  
3. **Theme Toggle Functionality Fixed** 🌓 - Fully functional 3-way toggle

### Theme Cycle Testing

1. **Light Mode** ☀️ → Click → **Dark Mode** 🌙
2. **Dark Mode** 🌙 → Click → **System Mode** 🖥️ 
3. **System Mode** 🖥️ → Click → **Light Mode** ☀️

### Testing Steps

1. Open http://localhost:5174/
2. Click the sun/moon button in the header
3. Verify background changes from light to dark
4. Verify text colors invert appropriately
5. Verify icon changes to reflect current mode
6. Test persistence by refreshing page

---

## Debug Theme Guide (Archived from debug-theme.md)

### Debug Console Messages

When page loads, you should see:
```
Initial script - theme: system isDark: true
Applying theme: system
Setting dark mode: true
Added dark class to html element
```

When clicking theme toggle:
```
Setting theme to: light
Theme store changed to: light
Applying theme: light  
Setting dark mode: false
Removed dark class from html element
```

### Manual Debug Commands

```javascript
// Check current theme
console.log('Theme in localStorage:', localStorage.getItem('theme'));
console.log('Dark class on HTML:', document.documentElement.classList.contains('dark'));

// Force light mode
localStorage.setItem('theme', 'light');
document.documentElement.classList.remove('dark');
location.reload();

// Force dark mode
localStorage.setItem('theme', 'dark');
document.documentElement.classList.add('dark');
location.reload();
```
