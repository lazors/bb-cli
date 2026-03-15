# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**bitbucket-cli** (`bb`) — A CLI tool wrapping Bitbucket Cloud REST API v2 for repositories, pull requests, comments, tasks, and pipelines. Designed for both human users and AI agent automation.

## Build & Development Commands

```bash
pnpm build          # Build with tsup (output: dist/cli.js)
pnpm test           # Run tests (vitest)
pnpm test:watch     # Watch mode tests
pnpm typecheck      # Type check (tsc --noEmit)
pnpm lint           # Lint (eslint)
```

## Architecture

```
src/
├── cli.ts               # Entry point — Commander program, command registration
├── commands/             # Command implementations (one file per command)
│   ├── auth/             # bb auth setup, bb auth status
│   ├── repo/             # bb repo list, bb repo view
│   ├── pr/               # bb pr list/view/create/update/approve/merge/etc.
│   │   └── comment/      # bb pr comment list/add/update/delete/resolve/reopen
│   └── pipeline/         # bb pipeline list/run/view/stop/steps/step/logs
├── api/                  # Bitbucket API client layer
│   ├── client.ts         # Base HTTP client (auth, pagination, error handling)
│   ├── repos.ts          # Repository API methods
│   ├── pullrequests.ts   # Pull request API methods (incl. diff, commits, activity)
│   ├── comments.ts       # Comment API methods
│   └── pipelines.ts      # Pipeline API methods
├── auth/
│   ├── config.ts         # Config file read/write (platform-specific paths)
│   └── credentials.ts    # Credential resolution (env vars → config file)
├── utils/
│   ├── output.ts         # JSON vs human-readable formatting
│   └── errors.ts         # Error handling, exit codes
└── types/
    ├── api.ts            # Bitbucket API response types
    └── config.ts         # Config file types
```

**Layered architecture**: Commands → API Client → Auth/Config. Each command file registers with Commander, resolves workspace, calls API methods, formats output.

## Key Patterns

- **Auth**: App Passwords (Basic) + OAuth2 tokens; env vars (`BITBUCKET_*`) override config
- **Config**: `~/.config/bitbucket-cli/config.json` (Linux), `%APPDATA%\bitbucket-cli\config.json` (Windows)
- **Output**: `--json` flag switches between human-readable tables/key-value and JSON
- **Errors**: All to stderr, exit code 1; `--json` produces `{"error":{"message":"...","status":N}}`
- **Pagination**: Auto-follows `next` links; `--limit` and `--page-size` flags
- **Draft PRs**: Fetch-then-update pattern (PUT with full body, toggle draft field)

## Tech Stack

- TypeScript 5.x, Node.js 18+ (native fetch), Commander.js, tsup, Vitest, pnpm
