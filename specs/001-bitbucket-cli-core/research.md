# Research: Bitbucket CLI Core

**Branch**: `001-bitbucket-cli-core` | **Date**: 2026-03-14

## Technology Decisions

### CLI Framework: Commander.js

- **Decision**: Commander.js
- **Rationale**: Fastest startup time (~18ms), zero dependencies, 35M+ weekly downloads, excellent TypeScript support, clean subcommand API (`bb repo list`, `bb pr create`). The minimal API surface makes it easy to maintain and extend.
- **Alternatives considered**:
  - Yargs: More middleware features but slower (42ms help), 7 dependencies
  - Oclif: Enterprise-grade with plugin system but overkill for this project (120ms help, 30 deps)
  - Citty: TypeScript-first from UnJS, zero deps, but smaller community
  - Clipanion: Used by Yarn, solid but less community adoption

### HTTP Client: Native fetch (Node.js 18+)

- **Decision**: Use Node.js built-in `fetch()` (powered by Undici)
- **Rationale**: No dependency needed, ~3x faster than axios/got, web-standard API familiar to all JS developers, future-proof as it's maintained by the Node.js core team. AbortController support for request cancellation.
- **Alternatives considered**:
  - Axios: Popular but slower, unnecessary dependency
  - Got: Feature-rich but heavy for simple REST wrapping
  - Undici direct: Possible for advanced needs, but fetch covers all requirements

### Language & Build: TypeScript with tsup

- **Decision**: TypeScript 5.x, built with tsup, ESM-first
- **Rationale**: tsup provides zero-config bundling via esbuild (much faster than tsc). ESM-first with CJS fallback ensures modern compatibility. Type checking via `tsc --noEmit` in parallel.
- **Build output**: Single ESM bundle with TypeScript declarations
- **Module format**: `"type": "module"` in package.json

### Testing: Vitest

- **Decision**: Vitest
- **Rationale**: 10-20x faster than Jest in watch mode, native ESM support without experimental flags, TypeScript-first with zero config, Jest-compatible API for easy adoption.
- **Alternatives considered**:
  - Jest: Slower, ESM support still requires flags
  - node:test: Zero deps but fewer features, less ergonomic

### Package Manager: pnpm

- **Decision**: pnpm
- **Rationale**: Fastest install times, content-addressable store saves disk space, strict dependency isolation prevents phantom deps, active development.
- **Alternatives considered**:
  - npm: Universal but slower
  - Yarn: No significant advantage over pnpm for this project

## API Research

### Draft PR Operations

- **Finding**: There are no separate endpoints for publishing or converting draft PRs.
- **Approach**: Use `PUT /pullrequests/{id}` with `draft: false` to publish, `draft: true` to convert to draft. Must include all existing PR fields (API drops omitted fields).
- **CLI implication**: Implement `bb pr publish <id>` and `bb pr draft <id>` as convenience wrappers around the update endpoint — fetch current PR state, toggle `draft` field, send full update.

### Request Changes Endpoint

- **Finding**: The endpoint path is `/request-changes` (with hyphen).
- **Endpoints**:
  - `POST /repositories/{workspace}/{repo_slug}/pullrequests/{id}/request-changes` — request changes
  - `DELETE /repositories/{workspace}/{repo_slug}/pullrequests/{id}/request-changes` — remove request

### PR Tasks

- **Finding**: No public API v2 endpoints for task CRUD. Tasks visible only in activity log.
- **Approach**: Parse task entries from `GET .../pullrequests/{id}/activity` response. Task-related activity items contain task descriptions and completion status.

### Merge Strategies

- **Finding**: Merge endpoint accepts `merge_strategy` parameter with values: `merge_commit` (default), `squash`, `fast_forward`.
- **CLI implication**: Expose as `--strategy` flag on `bb pr merge`.

### Long-Running Merges

- **Finding**: Large merges may return HTTP 202 with a task status object instead of immediate completion.
- **Approach**: When 202 received, display the pending status and task ID. The user can re-check PR state to see if merge completed.

### Pipeline Trigger

- **Finding**: Pipeline trigger requires a `target` object with `ref_type`, `ref_name`, and `type: "pipeline_ref_target"`. Optional `selector` for custom pipelines and `variables` for pipeline variables.
- **CLI implication**: Minimum: `bb pipeline run --branch <branch>`. Optional: `--pipeline <name>` for custom pipelines, `--var KEY=VALUE` for variables.

### Pipeline Logs

- **Finding**: Log endpoint returns plain text. Supports HTTP Range headers for large logs.
- **Approach**: Stream full log by default. Consider `--tail <lines>` for showing only recent output.

### Pagination

- **Finding**: All list endpoints return paginated results with `next` URL. Default page size varies by endpoint, max is typically 100.
- **Approach**: Follow `next` links automatically. Expose `--limit` to cap total results and `--page-size` to control items per request (max 100).

### Rate Limiting

- **Finding**: Authenticated users get 1,000–10,000 requests/hour (scaled by workspace paid users). `X-RateLimit-NearLimit: true` header warns when <20% remaining. HTTP 429 when exceeded.
- **Approach**: On 429, exit with non-zero code and display `Retry-After` header value if present. No auto-retry.

### Authentication Scopes

- **Finding**: Different operations require different scopes:
  - Repositories: `repository` (read), `repository:write` (for write ops)
  - Pull Requests: `pullrequest` (read), `pullrequest:write` (for create/update/approve/merge)
  - Pipelines: `pipeline` (read), `pipeline:write` (for trigger/stop)
- **CLI implication**: Document required scopes per command group. `bb auth setup` should guide users on which scopes to enable.
