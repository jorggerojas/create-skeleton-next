# create-skeleton-next

[![CI](https://github.com/jorggerojas/create-skeleton-next/actions/workflows/ci.yml/badge.svg)](https://github.com/jorggerojas/create-skeleton-next/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/jorggerojas/create-skeleton-next/graph/badge.svg?token=U7SD9KM883)](https://codecov.io/gh/jorggerojas/create-skeleton-next)
[![npm version](https://badge.fury.io/js/create-skeleton-next.svg)](https://www.npmjs.com/package/create-skeleton-next)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CLI to scaffold Next.js projects from skeleton templates with shadcn/ui components pre-configured.

## Installation

```bash
# Use with your preferred package manager
pnpm create skeleton-next my-app
bun create skeleton-next my-app
npm create skeleton-next my-app
yarn create skeleton-next my-app

# Or install globally
pnpm add -g create-skeleton-next
create-skeleton-next my-app
```

## Usage

### Interactive Mode (with prompts)

By default, the CLI will prompt you for options that are not provided via flags:

```bash
# Will prompt for project name, package manager, router type, GitHub options, and install preference
pnpm create skeleton-next

# Will only prompt for package manager, router type, GitHub options, and install preference
pnpm create skeleton-next my-app
```

### Non-interactive Mode (with defaults)

Use `-y` or `--yes` to skip all prompts and use default values:

```bash
# Uses all defaults: project name "next-skeleton-app", pnpm, app router, private GitHub repo, install deps
pnpm create skeleton-next --yes

# Uses defaults for all options except project name
pnpm create skeleton-next my-app -y
```

### Options

You can provide any combination of options via flags. If an option is not provided, the CLI will prompt for it (unless using `-y`):

```bash
# Specify router type (will still prompt for package manager, GitHub and install options)
pnpm create skeleton-next my-app --router app
pnpm create skeleton-next my-app --router pages

# GitHub repository options
pnpm create skeleton-next my-app --github          # Create GitHub repo
pnpm create skeleton-next my-app --no-github       # Skip GitHub creation
pnpm create skeleton-next my-app --public          # Make repo public
pnpm create skeleton-next my-app --private         # Make repo private

# Installation options
pnpm create skeleton-next my-app --install         # Run package manager install
pnpm create skeleton-next my-app --no-install      # Skip package manager install

# Combine options (no prompts will be shown)
pnpm create skeleton-next my-app --router pages --no-github --no-install
```

### All Options

| Option | Description | Default |
| ------ | ----------- | ------ |
| `-y, --yes` | Run with all defaults, no prompts | `false` |
| `--router <type>` | Router type: `app` or `pages` | `app` |
| `--github` | Create GitHub repository | `true` |
| `--no-github` | Skip GitHub repository creation | - |
| `--public` | Make GitHub repo public | `false` |
| `--private` | Make GitHub repo private | `true` |
| `--install` | Run package manager install after creation | `true` |
| `--no-install` | Skip package manager install | - |

**Package manager** (pnpm, bun, npm, yarn) is selected via interactive prompt when not using `-y`.

### Defaults

When using `--yes` or `-y`, or when accepting default values in prompts, the following defaults are applied:

- **Project name**: `next-skeleton-app`
- **Package manager**: `pnpm`
- **Router**: `app`
- **GitHub**: enabled, private
- **Install**: enabled
- **shadcn components**: button, input, dialog, card, dropdown-menu, form, label, select, textarea, accordion, alert, avatar, badge, breadcrumb, checkbox, separator, tooltip

### Examples

```bash
# Full interactive mode - prompts for everything
pnpm create skeleton-next

# Prompts only for package manager, router, GitHub, and install options
pnpm create skeleton-next my-new-project

# No prompts, all defaults
pnpm create skeleton-next -y

# No prompts, custom project name with defaults
pnpm create skeleton-next my-project -y

# Prompts only for install option
pnpm create skeleton-next my-app --router pages --no-github

# No prompts, completely configured
pnpm create skeleton-next my-app --router pages --no-github --no-install
```

## Templates

This CLI uses the following GitHub template repositories:

- **App Router**: [jorggerojas/next-skeleton-app](https://github.com/jorggerojas/next-skeleton-app)
- **Pages Router**: [jorggerojas/next-skeleton-page](https://github.com/jorggerojas/next-skeleton-page)

## How It Works

1. **Project Creation**:
   - If `--github` is enabled and `gh` CLI is available, creates a GitHub repository from the template
   - Otherwise, clones the template repository via HTTPS and removes the `.git` directory

2. **Dependencies Installation**:
   - If `--install` is enabled (default), runs the selected package manager's install command (`pnpm install`, `bun install`, `npm install`, or `yarn install`)

3. **shadcn/ui Setup**:
   - Verifies that the template includes a valid `components.json`
   - Installs `tailwind-merge` as a dev dependency
   - Adds default shadcn/ui components using the selected package manager (`pnpm dlx`, `bunx`, `npx`, or `yarn dlx`)

4. **Git Initialization**:
   - If the project wasn't created via `gh` CLI, initializes a new git repository
   - Creates an initial commit

## Requirements

- **Package manager**: One of [pnpm](https://pnpm.io/), [bun](https://bun.sh/), [npm](https://www.npmjs.com/), or [yarn](https://yarnpkg.com/) (required)
- **[gh](https://cli.github.com/)** - GitHub CLI (optional, for `--github` flag)
- **[git](https://git-scm.com/)** - For repository initialization (optional, but recommended)

## Development

### Local Testing

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev --no-github --no-install

# Build
pnpm build

# Test the built CLI
node dist/index.js --no-github --no-install
```

### Project Structure

```txt
src/
  index.ts              # CLI entry point
  config/
    defaults.ts         # Default configuration values
  core/
    context.ts          # Context type definitions
    pipeline.ts         # Step pipeline runner
    exec.ts             # Command execution utilities
    prompts.ts          # Interactive prompts
  features/
    project/
      createFromTemplate.ts   # Project creation logic
    git/
      initLocalGit.ts         # Git initialization
    deps/
      packageManagerInstall.ts  # Dependency installation
    ui/
      shadcn/
        ensureComponentsJson.ts  # Validate components.json
        addComponents.ts         # Add shadcn components
        defaults.ts              # Default shadcn components
  templates/
    index.ts            # Template repository mappings
```

## Testing

### Run Tests

```bash
# Run all tests (unit + integration + e2e)
pnpm test

# Run specific test suites
pnpm test:unit          # Only unit tests
pnpm test:integration   # Only integration tests
pnpm test:e2e          # Only end-to-end tests

# Run tests in CI mode with coverage
pnpm test:ci

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui
```

### Test Structure

- `tests/unit/` - Unit tests for individual functions and utilities
  - `core/` - Core utilities (exec, pipeline, prompts)
  - `config/` - Configuration tests
  - `templates/` - Template mappings
  - `features/` - Feature-specific unit tests
- `tests/integration/` - Integration tests for feature modules
  - `features/shadcn` - shadcn/ui integration
  - `features/git` - Git operations
- `tests/e2e/` - End-to-end tests for CLI commands
  - Full CLI flow testing

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **CI Workflow**: Runs on push and PR to main/develop branches
  - ✅ Linting with Biome
  - ✅ Testing on multiple OS (Ubuntu, macOS, Windows)
  - ✅ Testing on Node 22
  - ✅ Coverage reporting to Codecov (target: 90%)
  - ✅ Build verification

- **Release Workflow**: Automated releases on push to main
  - ✅ Runs tests and build
  - ✅ Creates version tag with standard-version
  - ✅ Publishes to npm registry

**Quality Gates:**

- Minimum coverage: 80%
- All tests must pass
- No linting errors
- Successful build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using conventional commits (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test changes
- `build:` - Build system changes
- `ci:` - CI/CD changes
- `chore:` - Other changes

## License

MIT
