# CLAUDE.md - AI Assistant Guide for moveiorca

This document provides comprehensive guidance for AI assistants working on the **moveiorca** (angular-quickstart) project.

## Project Overview

**Type:** Angular 13 Web Application
**Purpose:** Minimal Angular starter template optimized for Netlify deployment
**Tech Stack:** Angular 13.3.0, TypeScript 4.5.2, RxJS 7.8.0
**Testing:** Jasmine/Karma (unit), Cypress (e2e)
**Deployment:** Netlify

## Directory Structure

```
moveiorca/
├── src/
│   ├── app/                      # Main application module
│   │   ├── app.module.ts         # Root module (bootstrap)
│   │   ├── app.component.ts      # Root component
│   │   ├── app.component.html    # Root template
│   │   ├── app.component.css     # Component styles
│   │   ├── app.component.spec.ts # Unit tests
│   │   └── app-routing.module.ts # Routing config (currently empty)
│   ├── environments/             # Environment configurations
│   │   ├── environment.ts        # Development
│   │   └── environment.prod.ts   # Production
│   ├── assets/                   # Static assets
│   ├── main.ts                   # Application entry point
│   ├── test.ts                   # Test configuration
│   ├── polyfills.ts              # Browser polyfills
│   ├── index.html                # HTML shell
│   ├── styles.css                # Global styles
│   └── demo-styling.css          # Demo template styles
├── cypress/                      # E2E tests
│   └── e2e/
│       └── basic.cy.ts           # Cypress test specs
├── .vscode/                      # VS Code configuration
│   ├── extensions.json           # Recommended extensions
│   ├── launch.json               # Debug configs
│   └── tasks.json                # NPM tasks
├── angular.json                  # Angular CLI configuration
├── tsconfig.json                 # TypeScript base config
├── tsconfig.app.json             # App-specific TS config
├── tsconfig.spec.json            # Test-specific TS config
├── karma.conf.js                 # Unit test runner
├── cypress.config.ts             # E2E test config
├── netlify.toml                  # Netlify deployment
├── package.json                  # Dependencies & scripts
└── renovate.json                 # Dependency updates
```

## Key Files Reference

| File | Location | Purpose |
|------|----------|---------|
| `app.module.ts` | `src/app/` | Root module - declares components, imports modules |
| `app.component.ts` | `src/app/` | Root component - main app entry point |
| `app-routing.module.ts` | `src/app/` | Routing configuration (empty, ready to extend) |
| `main.ts` | `src/` | Bootstrap entry point |
| `environment.ts` | `src/environments/` | Development environment config |
| `environment.prod.ts` | `src/environments/` | Production environment config |
| `angular.json` | `/` | Angular CLI build & serve configuration |
| `netlify.toml` | `/` | Netlify deployment settings |

## Development Workflows

### Initial Setup

```bash
# Install dependencies
npm install

# Verify installation
npm run ng -- version
```

### Development Server

```bash
# Start dev server (http://localhost:4200)
npm start
# or
ng serve

# Dev server with specific port
ng serve --port 4300

# Dev server with open browser
ng serve --open
```

### Building

```bash
# Development build (no optimization)
npm run watch

# Production build
npm run build
# Output: dist/angular-quickstart/

# Build with specific configuration
ng build --configuration production
```

### Testing

```bash
# Unit tests (Karma + Jasmine)
npm test
# or
ng test

# E2E tests (Cypress)
npx cypress open    # Interactive mode
npx cypress run     # Headless mode

# Run tests with coverage
ng test --code-coverage
# Output: coverage/angular-quickstart/
```

### Code Generation

```bash
# Generate component
ng generate component components/my-component
# or shorthand
ng g c components/my-component

# Generate service
ng g service services/my-service

# Generate module
ng g module modules/my-module --routing

# Generate directive
ng g directive directives/my-directive

# Generate pipe
ng g pipe pipes/my-pipe
```

### Debugging

VS Code debug configurations are pre-configured:
- **ng serve**: Debug dev server in Chrome
- **ng test**: Debug unit tests in Chrome (port 9876)

Use VS Code's Run and Debug panel to start debugging sessions.

## Code Conventions

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase + `.component.ts` | `UserProfileComponent` → `user-profile.component.ts` |
| **Services** | PascalCase + `.service.ts` | `AuthService` → `auth.service.ts` |
| **Modules** | PascalCase + `.module.ts` | `SharedModule` → `shared.module.ts` |
| **Directives** | PascalCase + `.directive.ts` | `HighlightDirective` → `highlight.directive.ts` |
| **Pipes** | PascalCase + `.pipe.ts` | `DateFormatPipe` → `date-format.pipe.ts` |
| **Selectors** | Kebab-case with `app-` prefix | `app-user-profile` |
| **Files** | Kebab-case | `user-profile.component.ts` |

### TypeScript Conventions

This project uses **strict TypeScript mode**:
- All strict flags enabled in `tsconfig.json`
- Strict templates enabled
- No implicit returns
- Force consistent casing in file names
- Explicit return types recommended

**Example:**
```typescript
// ✓ Good - explicit types, strict mode
export class UserService {
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

// ✗ Avoid - implicit types
export class UserService {
  getUser(id) {
    return this.http.get(`/api/users/${id}`);
  }
}
```

### Component Structure

Follow this order in component files:
1. Imports
2. Component decorator
3. Class declaration
4. Properties (public, then private)
5. Constructor
6. Lifecycle hooks (in order: ngOnInit, ngOnChanges, etc.)
7. Public methods
8. Private methods

**Example:**
```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit {
  // Public properties
  title: string = 'Example';

  // Private properties
  private data: any[] = [];

  // Constructor
  constructor(private service: ExampleService) {}

  // Lifecycle hooks
  ngOnInit(): void {
    this.loadData();
  }

  // Public methods
  public handleClick(): void {
    this.processData();
  }

  // Private methods
  private loadData(): void {
    // Implementation
  }
}
```

### Testing Conventions

Every component/service should have a corresponding `.spec.ts` file.

**Component Test Structure:**
```typescript
describe('ExampleComponent', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExampleComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Styling Conventions

- **Global styles:** `src/styles.css`
- **Component styles:** Component-specific `.css` files
- **Style encapsulation:** ViewEncapsulation.Emulated (default)
- **Formatting:** 2 spaces indentation
- **CSS approach:** Plain CSS (not SCSS in this project)

## Build Configuration

### Build Budgets

Production builds have strict size budgets (configured in `angular.json`):
- **Initial bundle:** 500kb warning, 1mb error
- **Component styles:** 2kb warning, 4kb error

**When adding dependencies:**
- Check bundle size impact: `ng build --stats-json`
- Analyze with webpack-bundle-analyzer if needed
- Consider lazy loading for large features

### Environment Variables

Environment-specific configuration uses file replacement:

**Development** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**Production** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com'
};
```

Angular CLI automatically swaps these during builds.

## Common Tasks for AI Assistants

### Adding a New Component

1. Generate component: `ng g c components/new-feature`
2. Update routing if needed in `app-routing.module.ts`
3. Add component to appropriate module's declarations
4. Write unit tests in `.spec.ts` file
5. Update CLAUDE.md if it introduces new patterns

### Adding a New Service

1. Generate service: `ng g s services/my-service`
2. Implement service logic
3. Provide service (in root or specific module)
4. Write unit tests with mocked dependencies
5. Document service purpose and methods

### Adding Routes

Currently, `app-routing.module.ts` is empty. To add routing:

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: '/home' }
];
```

For lazy loading:
```typescript
{
  path: 'feature',
  loadChildren: () => import('./feature/feature.module')
    .then(m => m.FeatureModule)
}
```

### Adding HTTP Service

1. Import HttpClientModule in `app.module.ts`:
```typescript
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule  // Add this
  ]
})
```

2. Create service with HttpClient:
```typescript
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/data`);
  }
}
```

### Running Tests Before Commits

**Always run tests before committing:**
```bash
# Unit tests
npm test

# E2E tests (if Netlify dev server is running)
npx cypress run

# Build verification
npm run build
```

## Netlify Deployment

### Configuration

Deployment settings are in `netlify.toml`:
- **Build command:** `ng build`
- **Publish directory:** `dist/angular-quickstart`
- **SPA redirect:** All routes redirect to `index.html` (status 200)
- **Post-build tests:** Cypress runs after build

### Manual Deployment

```bash
# Build production bundle
npm run build

# Deploy to Netlify (requires Netlify CLI)
netlify deploy --prod --dir=dist/angular-quickstart
```

### Local Netlify Development

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Run local Netlify dev server
netlify dev
```

## Troubleshooting

### Common Issues

**Issue:** `ng: command not found`
**Solution:** Install Angular CLI locally or use `npm run ng`

**Issue:** Port 4200 already in use
**Solution:** `ng serve --port 4300` or kill process using port 4200

**Issue:** Tests failing in CI but passing locally
**Solution:** Check Cypress baseUrl configuration in `cypress.config.ts`

**Issue:** Build budget exceeded
**Solution:** Analyze bundle size and consider lazy loading or tree shaking

**Issue:** TypeScript strict mode errors
**Solution:** Fix type issues - do not disable strict mode

### Debugging Tips

1. **Component not rendering:**
   - Check module declarations
   - Verify selector matches usage
   - Check browser console for errors

2. **Service not injecting:**
   - Verify `providedIn: 'root'` or module providers
   - Check import paths
   - Ensure service is not instantiated with `new`

3. **Routing not working:**
   - Verify `<router-outlet>` in template
   - Check route configuration
   - Ensure RouterModule is imported

4. **Tests failing:**
   - Check for missing TestBed configurations
   - Mock external dependencies
   - Use `fixture.detectChanges()` after changes

## Dependencies Management

This project uses **Renovate** for automated dependency updates.

### Current Dependencies

**Production:**
- `@angular/*`: 13.3.0
- `rxjs`: 7.8.0
- `tslib`: 2.6.2
- `zone.js`: 0.11.4

**Development:**
- `@angular-devkit/build-angular`: 13.3.0
- `@angular/cli`: 13.3.0
- `typescript`: 4.5.2
- `jasmine-core`: 4.6.0
- `karma`: 6.4.0
- `cypress`: 10.0.3

### Adding New Dependencies

```bash
# Production dependency
npm install <package-name>

# Development dependency
npm install --save-dev <package-name>

# Always verify after installing
npm run build
npm test
```

## AI Assistant Best Practices

### Before Making Changes

1. **Understand the context:** Read existing code in the affected area
2. **Check dependencies:** Understand what depends on the code you're changing
3. **Review tests:** Check existing test coverage
4. **Follow conventions:** Match the existing code style

### Making Changes

1. **One concern per change:** Don't mix refactoring with feature additions
2. **Write tests:** Add/update tests for your changes
3. **Maintain strict types:** Keep TypeScript strict mode compliance
4. **Update documentation:** Update this file if introducing new patterns
5. **Check bundle size:** Ensure build budgets are not exceeded

### After Making Changes

1. **Run tests:** `npm test` and verify all pass
2. **Build verification:** `npm run build` should succeed
3. **Check for warnings:** Address any compiler warnings
4. **Review changes:** Ensure no unintended modifications
5. **Update CLAUDE.md:** Document new patterns or significant changes

### Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] Unit tests written/updated
- [ ] E2E tests updated if needed
- [ ] No console.log() statements left behind
- [ ] Error handling implemented
- [ ] Code follows project naming conventions
- [ ] Component/service properly typed
- [ ] Build succeeds without warnings
- [ ] Bundle size within budgets
- [ ] Documentation updated if needed

## Project-Specific Notes

### Current State
- **Routing:** Empty routing module (ready for routes)
- **Services:** No services yet (add as needed)
- **State Management:** None (add NgRx/Akita if complex state needed)
- **Styling:** Plain CSS with demo styling (can migrate to SCSS if needed)
- **HTTP:** Not configured (add HttpClientModule when needed)

### Extensibility Points

The project is intentionally minimal but ready to extend:

1. **Routing:** Add routes to `app-routing.module.ts`
2. **Services:** Create `src/app/services/` directory
3. **Models:** Create `src/app/models/` directory for interfaces
4. **Shared Module:** Create for shared components/pipes/directives
5. **Feature Modules:** Create for large features with lazy loading
6. **State Management:** Add NgRx or Akita for complex state
7. **Styling:** Migrate to SCSS if preprocessing needed

### Performance Considerations

- **Lazy Loading:** Use for feature modules (> 50kb)
- **OnPush Change Detection:** Consider for performance-critical components
- **TrackBy Functions:** Use in *ngFor for large lists
- **Async Pipe:** Prefer over manual subscriptions
- **Unsubscribe:** Always unsubscribe from observables in ngOnDestroy

### Security Considerations

- **Sanitization:** Angular sanitizes templates automatically
- **HttpClient:** Use built-in XSS protection
- **External URLs:** Sanitize with DomSanitizer if needed
- **API Secrets:** Never commit to repository, use environment variables
- **Dependencies:** Renovate keeps dependencies updated for security patches

## Quick Reference Commands

```bash
# Development
npm start                          # Dev server on port 4200
npm test                           # Run unit tests
npm run watch                      # Build with watch mode
npm run build                      # Production build

# Code Generation
ng g c components/name             # Component
ng g s services/name               # Service
ng g m modules/name --routing      # Module with routing
ng g directive directives/name     # Directive
ng g pipe pipes/name               # Pipe

# Testing
ng test                            # Unit tests
ng test --code-coverage           # With coverage
npx cypress open                   # E2E interactive
npx cypress run                    # E2E headless

# Debugging
ng serve --source-map             # Enable source maps
ng build --source-map             # Build with source maps
ng build --stats-json             # Bundle analysis

# Netlify
netlify dev                        # Local Netlify environment
netlify deploy                     # Deploy to Netlify
netlify deploy --prod              # Deploy to production
```

## Additional Resources

- **Angular Documentation:** https://angular.io/docs
- **Angular CLI:** https://angular.io/cli
- **RxJS Documentation:** https://rxjs.dev/
- **Jasmine Testing:** https://jasmine.github.io/
- **Cypress Documentation:** https://docs.cypress.io/
- **Netlify Documentation:** https://docs.netlify.com/

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-21 | 1.0.0 | Initial CLAUDE.md creation |

---

**Last Updated:** 2025-11-21
**Project Version:** Angular 13.3.0
**Maintained By:** AI Assistants working on moveiorca
