# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.1.1](https://github.com/jorggerojas/create-skeleton-next/compare/v1.1.0...v1.1.1) (2026-05-09)


### Features

* add dependabot alert file from github web ([072001a](https://github.com/jorggerojas/create-skeleton-next/commit/072001a0d66e77a90618d908f0b2e176fa0daf73))


### CI/CD

* add npm publish workflow and package metadata ([10bd533](https://github.com/jorggerojas/create-skeleton-next/commit/10bd533e565dc60ad01a318343f6572a5ca39a25))
* update release flow ([81f9288](https://github.com/jorggerojas/create-skeleton-next/commit/81f9288c51709e26c2ba929fb400cc3d6f7d5c5a))

## [1.1.0](https://github.com/jorggerojas/create-skeleton-next/compare/v1.0.1...v1.1.0) (2026-02-24)


### Features

* **core,tests:** add package manager options ([4b10b4b](https://github.com/jorggerojas/create-skeleton-next/commit/4b10b4b845e6efb7a9418f324c412f71b062a24f))
* **notifier:** notify package updates ([66d27c4](https://github.com/jorggerojas/create-skeleton-next/commit/66d27c4bdbed263af532ab4b4a1af37d9595db54))


### Bug Fixes

* **all:** define import paths instead of relative ones ([009a115](https://github.com/jorggerojas/create-skeleton-next/commit/009a1150c4e04057e79b123326bc80f02c4663e9))


### Documentation

* update readme file ([cb6ce3e](https://github.com/jorggerojas/create-skeleton-next/commit/cb6ce3e52b6291d06c9e607b0c6d2acdab6d2ac3))

### [1.0.1](https://github.com/jorggerojas/create-skeleton-next/compare/v1.0.0...v1.0.1) (2026-02-02)

## [1.0.0](https://github.com/jorggerojas/create-skeleton-next/compare/v0.1.0...v1.0.0) (2026-02-02)


### Bug Fixes

* **husky,pnpm:** remove pnpm-workspace.yaml and update husky hooks ([4b99fce](https://github.com/jorggerojas/create-skeleton-next/commit/4b99fce1e7a1db73589ca2e6c30b53e8c46e09f2))
* **workflows:** add build step before test ([b43e6a3](https://github.com/jorggerojas/create-skeleton-next/commit/b43e6a31ded4aeca953002e54a3bfd77c098c5f0))

## [0.1.0] - 2024-02-01

### Features

- **cli**: Initial CLI implementation with interactive prompts
- **templates**: Support for App Router and Pages Router templates
- **github**: GitHub repository creation with gh CLI
- **shadcn**: Automatic shadcn/ui components installation
- **git**: Local git repository initialization
- **prompts**: Interactive mode for missing options
- **non-interactive**: Support for --yes flag to skip prompts

### Documentation

- Complete README with usage examples
- Installation and development instructions
- Template repository information

### CI/CD

- GitHub Actions workflow for testing
- GitHub Actions workflow for automated releases
- Multi-OS testing (Ubuntu, macOS, Windows)
- Multi-Node version testing (18, 20)

### Testing

- Unit tests for core utilities
- Integration tests for features
- E2E tests for CLI commands
- Coverage reporting with Codecov
