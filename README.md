# MyRecipeBox PWA

A Progressive Web Application for collecting, organizing, and accessing recipes both online and offline. Features AI-powered recipe extraction from URLs and images, comprehensive search functionality, and role-based access control.

## 🚀 Features

- **Progressive Web App** with offline functionality
- **AI-Powered Recipe Extraction** from URLs and images using Google Gemini API
- **Triple Input Methods** (URL, manual form, and image upload with OCR)
- **Advanced Search & Tagging** system
- **Role-Based Access Control** (Admin/Reader)
- **Offline-First Architecture** with smart caching
- **Material Design** with theme support

## 📋 Development Progress

### ✅ Phase 1: Core Foundation & Setup
- [x] Set up SvelteKit project with TypeScript
- [x] Install dependencies (PocketBase SDK, Dexie, Gemini API)
- [x] Create project folder structure
- [x] Configure environment variables
- [x] Define TypeScript interfaces and data models
- [x] Create service classes for API interactions
- [x] Set up Svelte stores for state management
- [x] Set up PocketBase backend with collections
- [x] Create development scripts and environment

### ✅ Phase 2: Authentication & Authorization  
- [x] Implement PocketBase authentication
- [x] Create login/register components with Svelte 5 runes
- [x] Set up OAuth providers (Google, GitHub)
- [x] Implement role-based access control  
- [x] Create authentication guards and navigation
- [x] Write comprehensive unit and E2E tests
- [x] Update components to use modern Svelte 5 syntax

### ✅ Phase 3: Recipe Management
- [x] Build manual recipe creation form with comprehensive validation
- [x] Implement recipe CRUD operations with PocketBase integration  
- [x] Create recipe listing and detail views with responsive design
- [x] Add admin-only edit/delete functionality with role-based access
- [x] Create admin routes (/admin/recipes/new, /admin/recipes/[id]/edit)
- [x] Implement recipe detail view (/recipes/[id]) with breadcrumbs
- [x] Update homepage to display recipe collection
- [x] Add comprehensive E2E tests with test IDs and CSS classes
- [x] Fix registration bug (passwordConfirm field missing)
- [x] Update E2E tests to use real PocketBase instead of mocks
- [x] Set up interactive coverage UI with Vitest

### 📋 Phase 4: AI Integration
- [ ] Integrate Google Gemini API for URL extraction
- [ ] Implement image upload and preprocessing
- [ ] Add Gemini Vision API for OCR
- [ ] Create review/edit extracted content interface

### 📋 Phase 5: Search & Discovery
- [ ] Implement full-text search functionality
- [ ] Add tag-based filtering
- [ ] Create advanced search features
- [ ] Build tag management interface

### 📋 Phase 6: PWA & Offline Features
- [ ] Implement caching strategy with service workers
- [ ] Add offline data synchronization
- [ ] Configure PWA manifest and installation
- [ ] Handle offline/online state transitions

### 📋 Phase 7: Testing & Quality
- [ ] Write unit tests for all components
- [ ] Create integration tests with Playwright
- [ ] Test authentication and authorization
- [ ] Test AI extraction features
- [ ] Test offline functionality

### 📋 Phase 8: Deployment & Production
- [ ] Configure Cloudflare Pages deployment
- [ ] Set up CI/CD pipeline
- [ ] Add error tracking and monitoring
- [ ] Performance optimization

## 🛠 Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Backend**: PocketBase (SQLite/PostgreSQL)
- **Authentication**: PocketBase Auth (OAuth2, email/password)
- **AI Integration**: Google Gemini API (text & vision)
- **Styling**: Tailwind CSS with forms and typography plugins
- **Offline Storage**: Dexie.js (IndexedDB wrapper)
- **Testing**: Vitest (unit/component) + Playwright (E2E)
- **Deployment**: Cloudflare Pages

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x (managed with asdf)
- npm 10.x

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Development Commands

```bash
# Development server
npm run dev

# Run tests
npm run test

# Run unit tests only
npm run test:unit

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and format code
npm run lint
npm run format
```

## 📚 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   ├── forms/       # Form components
│   │   ├── recipe/      # Recipe-specific components
│   │   ├── auth/        # Authentication components
│   │   └── layout/      # Layout components
│   ├── stores/          # Svelte stores for state management
│   ├── services/        # API services and business logic
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── routes/              # SvelteKit routes
└── tests/               # Test files
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required environment variables.

### PocketBase Setup

1. Install PocketBase
2. Run PocketBase server
3. Configure collections and authentication
4. Set up admin user

## 🧪 Testing

This project follows a comprehensive testing strategy with multiple test types and tools to ensure reliability and quality.

### **Test Types & Coverage**

- **Unit Tests**: Service layer logic, store management, utility functions
- **Component Tests**: Svelte component rendering and interactions  
- **E2E Tests**: Complete user journeys and authentication flows
- **Integration Tests**: API interactions and cross-component workflows

### **Testing Stack**

- **Vitest** - Unit and component testing framework
- **Playwright** - End-to-end testing with real browsers
- **Testing Library** - Component testing utilities and DOM queries
- **jsdom** - DOM simulation for unit tests

### **Running Tests**

#### **All Tests**
```bash
npm run test                    # Run all tests (unit + E2E)
```

#### **Unit Tests**
```bash
npm run test:unit               # Run in watch mode (development)
npm run test:unit -- --run     # Run once and exit
npm run test:unit:coverage     # Run with coverage report (text output)
npm run test:coverage          # Interactive coverage UI with browser

# Run specific test files
npm run test:unit -- --run src/lib/services/pocketbase.test.ts
npm run test:unit -- --run src/lib/stores/auth.test.ts
```

#### **Coverage Reports**
```bash
npm run test:coverage          # Opens interactive Vitest UI with coverage
                              # - Live coverage visualization
                              # - Click-through source files
                              # - Real-time test running
                              # - Auto-opens at http://localhost:51204/__vitest__/
```

#### **E2E Tests**
```bash
npm run test:e2e                # Run all E2E tests headless
npm run test:e2e -- --headed   # Run with visible browser
npm run test:e2e -- --debug    # Run in debug mode

# Run specific test files or patterns
npm run test:e2e -- e2e/auth.test.ts
npm run test:e2e -- --grep "authentication"
npm run test:e2e -- --grep "should show welcome page"
```

### **Test Files Structure**

```
src/
├── lib/
│   ├── services/
│   │   └── pocketbase.test.ts      # PocketBase service tests
│   ├── stores/
│   │   └── auth.test.ts            # Authentication store tests
│   └── components/
│       └── auth/
│           └── LoginForm.test.ts   # Component tests (when needed)
├── routes/
│   └── page.svelte.test.ts         # Route component tests
└── demo.spec.ts                    # Example unit test

e2e/
├── auth.test.ts                    # Authentication flow tests
└── demo.test.ts                    # Example E2E test

# Test configuration
├── vitest.config.ts                # Vitest configuration
├── playwright.config.ts            # Playwright configuration
├── vitest-setup-client.ts          # Client-side test setup
└── vitest-setup-server.ts          # Server-side test setup
```

### **Current Test Coverage**

#### **Unit Tests** ✅
- **PocketBase Service** (`src/lib/services/pocketbase.test.ts`)
  - Authentication methods (login, register, OAuth)
  - Error handling and validation
  - Token management and refresh
  - File URL generation and utilities

- **Authentication Store** (`src/lib/stores/auth.test.ts`)
  - State management and reactivity
  - Login/logout workflows
  - Role-based derived stores
  - Error state handling

#### **E2E Tests** ✅
- **Authentication Flows** (`e2e/auth.test.ts`)
  - Welcome page for unauthenticated users
  - Login and registration form validation
  - OAuth button availability
  - Role-based UI differences (Admin vs Reader)
  - Navigation and redirects
  - Error message display

### **Development Workflow**

#### **For Test-Driven Development**
```bash
# Start tests in watch mode while developing
npm run test:unit

# Start dev server for E2E testing
npm run dev:full  # Starts both PocketBase and SvelteKit
```

#### **Before Committing**
```bash
# Run all tests to ensure nothing is broken
npm run test

# Run linting and formatting
npm run lint
npm run format
```

### **Test Setup Requirements**

#### **For E2E Tests**
The development server must be running:
```bash
npm run dev:full    # Recommended: starts both services
# OR separately:
npm run pocketbase  # Terminal 1
npm run dev         # Terminal 2
```

#### **Playwright Browsers**
Install required browsers (done automatically on first run):
```bash
npx playwright install
```

### **Writing New Tests**

#### **Unit Tests**
Create `.test.ts` files next to your source files:
```typescript
// src/lib/services/example.test.ts
import { describe, it, expect, vi } from 'vitest';
import { exampleFunction } from './example';

describe('Example Service', () => {
  it('should work correctly', () => {
    expect(exampleFunction()).toBe('expected result');
  });
});
```

#### **E2E Tests**
Add test files in the `e2e/` directory:
```typescript
// e2e/example.test.ts
import { test, expect } from '@playwright/test';

test.describe('Example Feature', () => {
  test('should work as expected', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### **Troubleshooting Tests**

#### **Common Issues**

1. **E2E tests timeout or fail to start**
   ```bash
   # Ensure dev server is running
   npm run dev:full
   
   # Check if PocketBase is accessible
   curl http://localhost:8090/api/health
   ```

2. **Unit tests can't find modules**
   ```bash
   # Clear Vitest cache
   npm run test:unit -- --run --no-cache
   ```

3. **Playwright browser issues**
   ```bash
   # Reinstall browsers
   npx playwright install --force
   ```

4. **Node version compatibility**
   ```bash
   # Ensure Node 22.x is being used
   node --version
   asdf current nodejs
   ```

#### **Debugging Tests**

```bash
# Debug specific test with browser devtools
npm run test:e2e -- --debug --grep "specific test name"

# Run tests with verbose logging
npm run test:unit -- --run --reporter=verbose

# Generate test coverage report with interactive UI
npm run test:coverage
```

### **Continuous Integration**

The test suite is designed to run in CI environments:
- All tests run on every commit
- E2E tests use headless browsers
- Test results integrate with PR status checks
- Coverage reports can be generated for monitoring

This comprehensive testing strategy ensures the authentication system is robust, reliable, and ready for production use.

## 🚀 Deployment

The app is configured for deployment on Cloudflare Pages:

1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables in Cloudflare

## 📖 Documentation

- [Product Requirements Document](./PRD.md)
- [Development Instructions](./CLAUDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.