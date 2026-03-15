# Quickstart: Bitbucket CLI Core

**Branch**: `001-bitbucket-cli-core` | **Date**: 2026-03-14

## Prerequisites

- Node.js 18+ (for native fetch support)
- pnpm (package manager)
- Bitbucket Cloud account with an App Password or OAuth2 token

## Setup

```bash
# Clone and install
pnpm install

# Build
pnpm build

# Link globally for local development
pnpm link --global
```

## Configuration

```bash
# Configure auth with app password
bb auth setup --username myuser --app-password mytoken --workspace myworkspace

# Or with OAuth2 token
bb auth setup --access-token myoauth2token --workspace myworkspace

# Or via environment variables (CI/CD)
export BITBUCKET_USERNAME=myuser
export BITBUCKET_APP_PASSWORD=mytoken
export BITBUCKET_WORKSPACE=myworkspace
```

## Development Commands

```bash
# Build
pnpm build          # Build with tsup

# Test
pnpm test           # Run all tests
pnpm test:watch     # Watch mode

# Type check
pnpm typecheck      # tsc --noEmit

# Lint
pnpm lint           # ESLint
```

## Example Workflows

### List repositories
```bash
bb repo list
bb repo list --json
bb repo list --role contributor --limit 10
```

### PR workflow
```bash
# Create a PR
bb pr create myrepo --title "Add feature" --source feature-branch --destination main

# Review
bb pr view myrepo 42
bb pr diff myrepo 42
bb pr approve myrepo 42

# Merge
bb pr merge myrepo 42 --strategy squash
```

### Pipeline workflow
```bash
bb pipeline list myrepo
bb pipeline run myrepo --branch main
bb pipeline logs myrepo {uuid} {step-uuid}
```

## Project Structure

```
src/
├── commands/           # Command implementations (repo/, pr/, pipeline/)
├── api/                # Bitbucket API client layer
├── auth/               # Authentication and config management
├── utils/              # Output formatting, error handling
├── types/              # TypeScript type definitions
└── cli.ts              # Entry point
tests/                  # Mirrors src/ structure
```
