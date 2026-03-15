# Implementation Plan: Bitbucket CLI Core

**Branch**: `001-bitbucket-cli-core` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-bitbucket-cli-core/spec.md`

## Summary

Build a Node.js CLI tool (`bb`) that wraps the Bitbucket Cloud REST API v2, providing command-line access to repositories, pull requests, comments, pipelines, and related operations. Designed for both human users and AI agent automation with dual human-readable/JSON output modes. Uses Commander.js for CLI framework, native fetch for HTTP, TypeScript with tsup for builds, and Vitest for testing.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+
**Primary Dependencies**: Commander.js (CLI framework), native fetch (HTTP)
**Storage**: Local config file (`~/.config/bitbucket-cli/config.json`, mode 600)
**Testing**: Vitest
**Target Platform**: Cross-platform (Windows, macOS, Linux) — Node.js runtime
**Project Type**: CLI tool
**Performance Goals**: <10s per single-resource command (excluding network latency)
**Constraints**: No admin operations, official API v2 only, no auto-retry on rate limit
**Scale/Scope**: ~35 commands across 4 command groups (auth, repo, pr, pipeline)

## Constitution Check

*GATE: No constitution file found. No gates to enforce. Proceeding with standard best practices.*

## Project Structure

### Documentation (this feature)

```text
specs/001-bitbucket-cli-core/
├── plan.md              # This file
├── research.md          # Phase 0 output — technology decisions
├── data-model.md        # Phase 1 output — entity definitions
├── quickstart.md        # Phase 1 output — setup guide
├── contracts/
│   └── cli-commands.md  # Phase 1 output — full CLI command contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── cli.ts               # Entry point — Commander program setup, command registration
├── commands/
│   ├── auth/
│   │   ├── setup.ts     # bb auth setup
│   │   └── status.ts    # bb auth status
│   ├── repo/
│   │   ├── list.ts      # bb repo list
│   │   └── view.ts      # bb repo view
│   ├── pr/
│   │   ├── list.ts      # bb pr list
│   │   ├── create.ts    # bb pr create
│   │   ├── view.ts      # bb pr view
│   │   ├── update.ts    # bb pr update
│   │   ├── approve.ts   # bb pr approve
│   │   ├── unapprove.ts # bb pr unapprove
│   │   ├── request-changes.ts
│   │   ├── unrequest-changes.ts
│   │   ├── merge.ts     # bb pr merge
│   │   ├── decline.ts   # bb pr decline
│   │   ├── publish.ts   # bb pr publish (draft → ready)
│   │   ├── draft.ts     # bb pr draft (ready → draft)
│   │   ├── activity.ts  # bb pr activity
│   │   ├── diff.ts      # bb pr diff
│   │   ├── diffstat.ts  # bb pr diffstat
│   │   ├── commits.ts   # bb pr commits
│   │   ├── tasks.ts     # bb pr tasks (read-only)
│   │   └── comment/
│   │       ├── list.ts      # bb pr comment list
│   │       ├── add.ts       # bb pr comment add
│   │       ├── update.ts    # bb pr comment update
│   │       ├── delete.ts    # bb pr comment delete
│   │       ├── resolve.ts   # bb pr comment resolve
│   │       └── reopen.ts    # bb pr comment reopen
│   └── pipeline/
│       ├── list.ts      # bb pipeline list
│       ├── run.ts       # bb pipeline run
│       ├── view.ts      # bb pipeline view
│       ├── stop.ts      # bb pipeline stop
│       ├── steps.ts     # bb pipeline steps
│       ├── step.ts      # bb pipeline step
│       └── logs.ts      # bb pipeline logs
├── api/
│   ├── client.ts        # Base HTTP client (auth, base URL, error handling, pagination)
│   ├── repos.ts         # Repository API methods
│   ├── pullrequests.ts  # Pull request API methods
│   ├── comments.ts      # Comment API methods
│   └── pipelines.ts     # Pipeline API methods
├── auth/
│   ├── config.ts        # Read/write config file, env var resolution
│   └── credentials.ts   # Credential resolution (env → config file)
├── utils/
│   ├── output.ts        # JSON vs human-readable formatting
│   └── errors.ts        # Error handling, exit codes, stderr formatting
└── types/
    ├── api.ts           # Bitbucket API response types
    └── config.ts        # Config file types

tests/
├── api/
│   ├── client.test.ts
│   ├── repos.test.ts
│   ├── pullrequests.test.ts
│   ├── comments.test.ts
│   └── pipelines.test.ts
├── auth/
│   ├── config.test.ts
│   └── credentials.test.ts
├── commands/
│   ├── auth/
│   ├── repo/
│   ├── pr/
│   └── pipeline/
└── utils/
    ├── output.test.ts
    └── errors.test.ts
```

**Structure Decision**: Single-project CLI layout. Commands organized by Bitbucket resource type (repo, pr, pipeline) with a shared API client layer. The `api/` layer handles all HTTP communication and pagination; `commands/` layer handles CLI argument parsing, calling API methods, and formatting output. This separation allows testing API logic independently from CLI wiring.

## Architecture Decisions

### Layered Architecture

```
Commands (CLI parsing + output formatting)
    ↓
API Client (HTTP calls + pagination + auth headers)
    ↓
Auth/Config (credential resolution: env vars → config file)
```

Each command file:
1. Registers itself with Commander (arguments, flags, description)
2. Resolves workspace (flag → config default)
3. Calls the appropriate API method
4. Formats output (human-readable or JSON based on `--json`)
5. Handles errors (stderr, non-zero exit)

### Pagination Strategy

The API client handles pagination internally:
- `fetchAll(url, options)` — follows `next` links, returns all results. Respects `--limit` to stop early.
- `fetchPage(url, options)` — returns a single page (for `--page` usage).
- All list commands use `fetchAll` by default, controlled by `--limit` and `--page-size`.

### Draft PR Publish/Convert

No separate API endpoints exist. The CLI implements:
- `bb pr publish <id>`: Fetches current PR → sets `draft: false` → PUT full object
- `bb pr draft <id>`: Fetches current PR → sets `draft: true` → PUT full object

This fetch-then-update pattern is necessary because Bitbucket drops omitted fields on PUT.

### Error Handling

- All API errors are caught at the command level
- HTTP 401/403 → auth error message with `bb auth setup` guidance
- HTTP 404 → "not found" with resource type context
- HTTP 429 → rate limit message with Retry-After value, exit code 1
- HTTP 409 → conflict message (e.g., merge conflicts)
- Network errors → connection error with retry guidance
- All errors go to stderr; exit code 1

## Complexity Tracking

No complexity violations to justify — the architecture is a straightforward single-project CLI with clear separation of concerns.
