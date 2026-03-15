# Tasks: Bitbucket CLI Core

**Input**: Design documents from `/specs/001-bitbucket-cli-core/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the TypeScript/Node.js CLI project with all tooling

- [x] T001 Initialize pnpm project with package.json — set name `bitbucket-cli`, bin `bb`, type `module`, Node.js 18+ engine, and scripts (build, test, test:watch, typecheck, lint) in package.json
- [x] T002 Install dependencies — commander (CLI), typescript, tsup (build), vitest (test), eslint, @types/node as devDependencies via pnpm
- [x] T003 [P] Configure TypeScript in tsconfig.json — target ES2022, module NodeNext, moduleResolution NodeNext, strict mode, outDir dist, rootDir src, declaration true
- [x] T004 [P] Configure tsup in tsup.config.ts — entry src/cli.ts, format esm, dts true, clean true, shims true, target node18
- [x] T005 [P] Configure Vitest in vitest.config.ts — globals true, environment node
- [x] T006 [P] Configure ESLint in eslint.config.js for TypeScript
- [x] T007 Create directory structure per plan.md — src/commands/auth/, src/commands/repo/, src/commands/pr/, src/commands/pr/comment/, src/commands/pipeline/, src/api/, src/auth/, src/utils/, src/types/, tests/

**Checkpoint**: Project builds and `pnpm test` runs (even if no tests yet)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that ALL user stories depend on — types, config, API client, output, errors

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 [P] Define config types in src/types/config.ts — Config interface (auth.type, auth.username, auth.app_password, auth.access_token, defaults.workspace), environment variable names as constants (BITBUCKET_USERNAME, BITBUCKET_APP_PASSWORD, BITBUCKET_ACCESS_TOKEN, BITBUCKET_WORKSPACE)
- [x] T009 [P] Define API response types in src/types/api.ts — Repository, PullRequest, BranchRef, User, Participant, Comment, Activity, Pipeline, PipelineStep, PaginatedResponse<T> per data-model.md
- [x] T010 Implement config manager in src/auth/config.ts — readConfig() loads ~/.config/bitbucket-cli/config.json, writeConfig() saves with mode 600, getConfigDir() returns platform-appropriate path
- [x] T011 Implement credential resolution in src/auth/credentials.ts — resolveCredentials() checks env vars first then config file, returns auth headers (Basic for app-password, Bearer for oauth2), throws if no credentials found
- [x] T012 Implement error handling in src/utils/errors.ts — BitbucketApiError class, handleApiError() maps HTTP status codes (401→auth error with `bb auth setup` guidance, 404→not found, 429→rate limit with Retry-After, 409→conflict), formatError() writes to stderr in text or JSON based on --json flag, process.exit(1)
- [x] T013 Implement output formatting in src/utils/output.ts — outputResult() writes to stdout as human-readable table/key-value or JSON based on --json flag, formatTable() for list commands, formatKeyValue() for detail commands
- [x] T014 Implement base API client in src/api/client.ts — BitbucketClient class with constructor(credentials), request(method, path, body?) adds auth headers and base URL (https://api.bitbucket.org/2.0), fetchPage() returns single page, fetchAll() follows `next` links with --limit and --page-size support, error handling for non-2xx responses
- [x] T015 Create CLI entry point in src/cli.ts — Commander program with name `bb`, version from package.json, global options (--workspace/-w, --json, --verbose/-v), register all command groups (auth, repo, pr, pipeline), add shebang line #!/usr/bin/env node

**Checkpoint**: Foundation ready — `pnpm build` produces a `bb` binary that shows help, API client can make authenticated requests

---

## Phase 3: User Story 1 — Authenticate and List Repositories (Priority: P1) MVP

**Goal**: User can configure auth credentials, set default workspace, and list/view repositories. This is the minimum viable product that proves the CLI works end-to-end.

**Independent Test**: Run `bb auth setup`, then `bb repo list` and verify repositories appear in both text and JSON formats.

### Implementation for User Story 1

- [x] T016 [P] [US1] Implement repos API layer in src/api/repos.ts — listRepositories(workspace, options?) calls GET /repositories/{workspace} with query params (role, sort, pagelen), getRepository(workspace, repoSlug) calls GET /repositories/{workspace}/{repo_slug}, both return typed responses
- [x] T017 [P] [US1] Implement `bb auth setup` command in src/commands/auth/setup.ts — accepts --username + --app-password OR --access-token, optional --workspace for default, validates inputs (must provide one auth method), calls writeConfig(), outputs success message with configured auth type
- [x] T018 [P] [US1] Implement `bb auth status` command in src/commands/auth/status.ts — reads config, displays auth type, masked credentials, default workspace, env var override status; exits 1 if not configured
- [x] T019 [US1] Implement `bb repo list` command in src/commands/repo/list.ts — accepts --role, --sort, --limit, --page-size flags, resolves workspace (--workspace flag → config default), calls listRepositories(), formats output (table: name, language, updated_on, is_private; JSON: full objects)
- [x] T020 [US1] Implement `bb repo view` command in src/commands/repo/view.ts — accepts <repo> argument, resolves workspace, calls getRepository(), formats output (key-value: full_name, description, language, mainbranch, created_on, size; JSON: full object)
- [x] T021 [US1] Register auth and repo command groups in src/cli.ts — import and attach auth (setup, status) and repo (list, view) subcommands to the program

**Checkpoint**: User Story 1 fully functional — `bb auth setup`, `bb auth status`, `bb repo list`, `bb repo view` all work

---

## Phase 4: User Story 8 — Get Repository Details (Priority: P1)

**Goal**: User can view detailed metadata for a specific repository. (Note: this story is fully implemented by T020 in US1 — the repo API layer and `bb repo view` command are already complete.)

**Independent Test**: Run `bb repo view <repo>` and verify metadata. Run with invalid slug and verify error.

### Implementation for User Story 8

- [x] T022 [US8] Verify `bb repo view` handles not-found errors correctly — ensure 404 response produces clear "Repository not found" error on stderr with workspace/repo context, exits 1

**Checkpoint**: US8 is an extension of US1 — verified by testing `bb repo view` with valid and invalid slugs

---

## Phase 5: User Story 2 — Browse and Manage Pull Requests (Priority: P1)

**Goal**: User can list PRs, view PR details, and perform review actions (approve, unapprove, request-changes, unrequest-changes, decline, merge).

**Independent Test**: Run `bb pr list <repo>`, then `bb pr view <repo> <id>`, then `bb pr approve <repo> <id>` and verify each produces expected output.

### Implementation for User Story 2

- [x] T023 [US2] Implement pullrequests API layer in src/api/pullrequests.ts — listPullRequests(workspace, repo, options?), getPullRequest(workspace, repo, prId), createPullRequest(workspace, repo, body), updatePullRequest(workspace, repo, prId, body), approvePr(workspace, repo, prId), unapprovePr(workspace, repo, prId), requestChanges(workspace, repo, prId), unrequestChanges(workspace, repo, prId), declinePr(workspace, repo, prId), mergePr(workspace, repo, prId, options?), getActivity(workspace, repo, prId, options?). Each calls the correct HTTP method and path per contracts/cli-commands.md
- [x] T024 [P] [US2] Implement `bb pr list` command in src/commands/pr/list.ts — accepts <repo>, --state (default OPEN), --limit, --page-size, resolves workspace, formats table (ID, title, author, state, source→destination)
- [x] T025 [P] [US2] Implement `bb pr view` command in src/commands/pr/view.ts — accepts <repo> <pr-id>, resolves workspace, formats key-value (id, title, state, draft, author, source, destination, reviewers, approvals, created_on)
- [x] T026 [P] [US2] Implement `bb pr approve` command in src/commands/pr/approve.ts — accepts <repo> <pr-id>, calls approvePr(), outputs confirmation
- [x] T027 [P] [US2] Implement `bb pr unapprove` command in src/commands/pr/unapprove.ts — accepts <repo> <pr-id>, calls unapprovePr(), outputs confirmation
- [x] T028 [P] [US2] Implement `bb pr request-changes` command in src/commands/pr/request-changes.ts — accepts <repo> <pr-id>, calls requestChanges(), outputs confirmation
- [x] T029 [P] [US2] Implement `bb pr unrequest-changes` command in src/commands/pr/unrequest-changes.ts — accepts <repo> <pr-id>, calls unrequestChanges(), outputs confirmation
- [x] T030 [P] [US2] Implement `bb pr decline` command in src/commands/pr/decline.ts — accepts <repo> <pr-id>, calls declinePr(), outputs confirmation
- [x] T031 [US2] Implement `bb pr merge` command in src/commands/pr/merge.ts — accepts <repo> <pr-id>, --strategy (merge_commit|squash|fast_forward), --message, --close-source-branch, calls mergePr(), handles 202 long-running merge (display pending status + task ID), outputs confirmation
- [x] T032 [US2] Implement `bb pr activity` command in src/commands/pr/activity.ts — accepts <repo> <pr-id>, --limit, calls getActivity(), formats chronological list (date, type, user, summary)
- [x] T033 [US2] Register pr command group in src/cli.ts — import and attach all pr subcommands (list, view, approve, unapprove, request-changes, unrequest-changes, decline, merge, activity)

**Checkpoint**: User Story 2 fully functional — all PR browse and review action commands work

---

## Phase 6: User Story 3 — Create and Update Pull Requests (Priority: P1)

**Goal**: User can create new PRs (regular and draft), update PR properties, publish drafts, and convert to draft.

**Independent Test**: Run `bb pr create <repo> --title "Test" --source dev --destination main`, verify PR created. Then `bb pr update <repo> <id> --title "Updated"` and verify change.

### Implementation for User Story 3

- [x] T034 [P] [US3] Implement `bb pr create` command in src/commands/pr/create.ts — accepts <repo>, --title (required), --source (required), --destination, --description, --reviewer (repeatable), --close-source-branch, --draft, builds request body per API contract, calls createPullRequest(), outputs created PR ID, URL, and state
- [x] T035 [P] [US3] Implement `bb pr update` command in src/commands/pr/update.ts — accepts <repo> <pr-id>, --title, --description, --reviewer (repeatable), --destination, fetches current PR first (to preserve omitted fields), merges changes, calls updatePullRequest(), outputs confirmation
- [x] T036 [P] [US3] Implement `bb pr publish` command in src/commands/pr/publish.ts — accepts <repo> <pr-id>, fetches current PR, sets draft:false, calls updatePullRequest() with full body, outputs confirmation that PR is ready for review
- [x] T037 [P] [US3] Implement `bb pr draft` command in src/commands/pr/draft.ts — accepts <repo> <pr-id>, fetches current PR, sets draft:true, calls updatePullRequest() with full body, outputs confirmation that PR converted to draft

**Checkpoint**: User Story 3 fully functional — PR create, update, publish, draft commands all work

---

## Phase 7: User Story 4 — Comment on Pull Requests (Priority: P2)

**Goal**: User can list, create (general and inline), update, delete comments, and resolve/reopen comment threads.

**Independent Test**: Run `bb pr comment list <repo> <pr-id>`, then `bb pr comment add <repo> <pr-id> --body "test"`, verify comment appears, then delete it.

### Implementation for User Story 4

- [x] T038 [US4] Implement comments API layer in src/api/comments.ts — listComments(workspace, repo, prId, options?), createComment(workspace, repo, prId, body), updateComment(workspace, repo, prId, commentId, body), deleteComment(workspace, repo, prId, commentId), resolveComment(workspace, repo, prId, commentId), reopenComment(workspace, repo, prId, commentId). Each calls correct method/path per contracts
- [x] T039 [P] [US4] Implement `bb pr comment list` command in src/commands/pr/comment/list.ts — accepts <repo> <pr-id>, --limit, formats table (ID, author, content preview, inline location if present, resolved status, created_on)
- [x] T040 [P] [US4] Implement `bb pr comment add` command in src/commands/pr/comment/add.ts — accepts <repo> <pr-id>, --body (required), --file + --line (optional for inline), --parent (optional for reply), builds request body with content.raw and optional inline.path/inline.to and parent.id, outputs created comment ID
- [x] T041 [P] [US4] Implement `bb pr comment update` command in src/commands/pr/comment/update.ts — accepts <repo> <pr-id> <comment-id>, --body (required), calls updateComment(), outputs confirmation
- [x] T042 [P] [US4] Implement `bb pr comment delete` command in src/commands/pr/comment/delete.ts — accepts <repo> <pr-id> <comment-id>, calls deleteComment(), outputs confirmation
- [x] T043 [P] [US4] Implement `bb pr comment resolve` command in src/commands/pr/comment/resolve.ts — accepts <repo> <pr-id> <comment-id>, calls resolveComment(), outputs confirmation
- [x] T044 [P] [US4] Implement `bb pr comment reopen` command in src/commands/pr/comment/reopen.ts — accepts <repo> <pr-id> <comment-id>, calls reopenComment(), outputs confirmation
- [x] T045 [US4] Register pr comment subcommand group in src/cli.ts — attach comment subcommands (list, add, update, delete, resolve, reopen) under `bb pr comment`

**Checkpoint**: User Story 4 fully functional — all comment CRUD and resolve/reopen commands work

---

## Phase 8: User Story 5 — View PR Diffs, Commits, and Activity (Priority: P2)

**Goal**: User can view PR diffs, diff statistics, commit history. (Activity is already implemented in US2 T032.)

**Independent Test**: Run `bb pr diff <repo> <pr-id>` and verify unified diff output. Run `bb pr diffstat <repo> <pr-id>` and verify per-file summary.

### Implementation for User Story 5

- [x] T046 [US5] Add diff and commit methods to src/api/pullrequests.ts — getDiff(workspace, repo, prId) returns raw text, getDiffstat(workspace, repo, prId, options?), listCommits(workspace, repo, prId, options?) returns paginated results
- [x] T047 [P] [US5] Implement `bb pr diff` command in src/commands/pr/diff.ts — accepts <repo> <pr-id>, calls getDiff(), writes raw unified diff text directly to stdout (no formatting — plain text passthrough)
- [x] T048 [P] [US5] Implement `bb pr diffstat` command in src/commands/pr/diffstat.ts — accepts <repo> <pr-id>, calls getDiffstat(), formats table (file path, status, lines added, lines removed; JSON: full objects)
- [x] T049 [P] [US5] Implement `bb pr commits` command in src/commands/pr/commits.ts — accepts <repo> <pr-id>, calls listCommits(), formats table (hash abbreviated, message first line, author, date; JSON: full objects)
- [x] T050 [US5] Register diff, diffstat, and commits subcommands in src/cli.ts under `bb pr`

**Checkpoint**: User Story 5 fully functional — diff, diffstat, commits commands work alongside activity from US2

---

## Phase 9: User Story 7 — Manage Pipelines (Priority: P2)

**Goal**: User can list pipeline runs, trigger new runs, view details, stop pipelines, list steps, view step details, and read step logs.

**Independent Test**: Run `bb pipeline list <repo>` and verify pipeline runs are listed with status and timestamps.

### Implementation for User Story 7

- [x] T051 [US7] Implement pipelines API layer in src/api/pipelines.ts — listPipelines(workspace, repo, options?), triggerPipeline(workspace, repo, target), getPipeline(workspace, repo, pipelineUuid), stopPipeline(workspace, repo, pipelineUuid), listSteps(workspace, repo, pipelineUuid, options?), getStep(workspace, repo, pipelineUuid, stepUuid), getStepLog(workspace, repo, pipelineUuid, stepUuid). Trigger body uses target.ref_type, target.ref_name, target.type="pipeline_ref_target", optional selector and variables
- [x] T052 [P] [US7] Implement `bb pipeline list` command in src/commands/pipeline/list.ts — accepts <repo>, --sort, --limit, --page-size, formats table (build_number, state, target branch, created_on, duration)
- [x] T053 [P] [US7] Implement `bb pipeline run` command in src/commands/pipeline/run.ts — accepts <repo>, --branch (required), --pipeline (optional custom name), --var KEY=VALUE (repeatable, parsed into variables array), calls triggerPipeline(), outputs pipeline UUID and build number
- [x] T054 [P] [US7] Implement `bb pipeline view` command in src/commands/pipeline/view.ts — accepts <repo> <pipeline-uuid>, calls getPipeline(), formats key-value (build_number, state, result, target, creator, created_on, completed_on, duration)
- [x] T055 [P] [US7] Implement `bb pipeline stop` command in src/commands/pipeline/stop.ts — accepts <repo> <pipeline-uuid>, calls stopPipeline(), outputs confirmation
- [x] T056 [P] [US7] Implement `bb pipeline steps` command in src/commands/pipeline/steps.ts — accepts <repo> <pipeline-uuid>, calls listSteps(), formats table (name, state, duration)
- [x] T057 [P] [US7] Implement `bb pipeline step` command in src/commands/pipeline/step.ts — accepts <repo> <pipeline-uuid> <step-uuid>, calls getStep(), formats key-value (name, state, result, started_on, completed_on, duration)
- [x] T058 [P] [US7] Implement `bb pipeline logs` command in src/commands/pipeline/logs.ts — accepts <repo> <pipeline-uuid> <step-uuid>, calls getStepLog(), writes raw log text directly to stdout
- [x] T059 [US7] Register pipeline command group in src/cli.ts — attach all pipeline subcommands (list, run, view, stop, steps, step, logs)

**Checkpoint**: User Story 7 fully functional — all pipeline commands work

---

## Phase 10: User Story 6 — Manage PR Tasks (Priority: P3)

**Goal**: User can list tasks on a PR (read-only from activity log). CLI informs user that task create/update is not supported.

**Independent Test**: Run `bb pr tasks <repo> <pr-id>` on a PR with tasks and verify task descriptions and statuses are displayed.

### Implementation for User Story 6

- [x] T060 [US6] Implement `bb pr tasks` command in src/commands/pr/tasks.ts — accepts <repo> <pr-id>, calls getActivity() and filters for task-related entries, formats table (description, assignee, status); displays "No tasks found" for empty results. If the user calls with a --create or --update flag, outputs unsupported message directing to Bitbucket web UI
- [x] T061 [US6] Register tasks subcommand in src/cli.ts under `bb pr`

**Checkpoint**: User Story 6 fully functional — read-only task listing works, unsupported operations produce clear messages

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories

- [x] T062 [P] Add --verbose flag implementation in src/api/client.ts — when enabled, log HTTP method, URL, status code, and response time to stderr before returning response
- [x] T063 [P] Add rate limit header checking in src/api/client.ts — check X-RateLimit-NearLimit header on every response, output warning to stderr when near limit
- [x] T064 [P] Update CLAUDE.md with build commands, test commands, project architecture, and CLI usage patterns now that project is implemented
- [x] T065 Run quickstart.md validation — follow all setup and example workflow steps, verify each command produces expected output
- [x] T066 Verify all commands support --json flag consistently — spot check each command group to ensure JSON output is parseable and follows the contract (list: {values, total}, detail: object, action: {success, ...}, error: {error: {message, status}})

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — MVP, implement first
- **US8 (Phase 4)**: Depends on Phase 3 (US1) — uses repo view from US1
- **US2 (Phase 5)**: Depends on Phase 2 — can start after Phase 2 (parallel with US1 if desired)
- **US3 (Phase 6)**: Depends on Phase 5 (US2) — uses PR API layer from US2
- **US4 (Phase 7)**: Depends on Phase 2 — independent of other stories
- **US5 (Phase 8)**: Depends on Phase 5 (US2) — extends PR API layer
- **US7 (Phase 9)**: Depends on Phase 2 — independent of PR stories
- **US6 (Phase 10)**: Depends on Phase 5 (US2) — uses activity API from US2
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundation only — no story dependencies
- **US8 (P1)**: Depends on US1 (repo API layer)
- **US2 (P1)**: Foundation only — no story dependencies (has own API layer)
- **US3 (P1)**: Depends on US2 (PR API layer: createPullRequest, updatePullRequest)
- **US4 (P2)**: Foundation only — has own API layer (comments)
- **US5 (P2)**: Depends on US2 (extends PR API layer with diff/commits methods)
- **US6 (P3)**: Depends on US2 (uses getActivity from PR API layer)
- **US7 (P2)**: Foundation only — has own API layer (pipelines)

### Parallel Opportunities

**After Phase 2 (Foundation) completes, these can run in parallel:**
- US1 + US2 + US4 + US7 (all have independent API layers)

**After US2 completes, these can run in parallel:**
- US3 + US5 + US6 (all extend the PR API layer)

### Within Each User Story

- API layer before commands (commands depend on API methods)
- Commands marked [P] can be implemented in parallel (different files)
- CLI registration is the last step in each story (aggregates all commands)

---

## Parallel Example: User Story 2

```bash
# After T023 (PR API layer) completes, launch all commands in parallel:
Task: "T024 [P] [US2] bb pr list in src/commands/pr/list.ts"
Task: "T025 [P] [US2] bb pr view in src/commands/pr/view.ts"
Task: "T026 [P] [US2] bb pr approve in src/commands/pr/approve.ts"
Task: "T027 [P] [US2] bb pr unapprove in src/commands/pr/unapprove.ts"
Task: "T028 [P] [US2] bb pr request-changes in src/commands/pr/request-changes.ts"
Task: "T029 [P] [US2] bb pr unrequest-changes in src/commands/pr/unrequest-changes.ts"
Task: "T030 [P] [US2] bb pr decline in src/commands/pr/decline.ts"
# Then sequential (depends on parallel commands):
Task: "T031 [US2] bb pr merge in src/commands/pr/merge.ts"
Task: "T032 [US2] bb pr activity in src/commands/pr/activity.ts"
Task: "T033 [US2] Register all in src/cli.ts"
```

## Parallel Example: User Story 7

```bash
# After T051 (pipeline API layer) completes, launch all commands in parallel:
Task: "T052 [P] [US7] bb pipeline list in src/commands/pipeline/list.ts"
Task: "T053 [P] [US7] bb pipeline run in src/commands/pipeline/run.ts"
Task: "T054 [P] [US7] bb pipeline view in src/commands/pipeline/view.ts"
Task: "T055 [P] [US7] bb pipeline stop in src/commands/pipeline/stop.ts"
Task: "T056 [P] [US7] bb pipeline steps in src/commands/pipeline/steps.ts"
Task: "T057 [P] [US7] bb pipeline step in src/commands/pipeline/step.ts"
Task: "T058 [P] [US7] bb pipeline logs in src/commands/pipeline/logs.ts"
# Then sequential:
Task: "T059 [US7] Register all in src/cli.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (auth + repo)
4. **STOP and VALIDATE**: `bb auth setup`, `bb repo list`, `bb repo view` all work
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (auth + repos) → MVP!
3. Add US2 (PR browse + review actions) → Core PR workflow
4. Add US3 (PR create + update + draft) → Full PR lifecycle
5. Add US4 (comments) + US5 (diffs/commits) → Complete code review
6. Add US7 (pipelines) → CI/CD integration
7. Add US6 (tasks read-only) → Full feature set
8. Polish → Production ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Draft PR publish/convert uses fetch-then-update pattern (Bitbucket drops omitted PUT fields)
- PR tasks are read-only — activity log is the only API source
- Rate limit: report and exit, no auto-retry
