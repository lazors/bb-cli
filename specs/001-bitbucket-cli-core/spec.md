# Feature Specification: Bitbucket CLI Core

**Feature Branch**: `001-bitbucket-cli-core`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "Build bitbucket-cli — a CLI tool wrapping Bitbucket API for repositories, pull requests, comments, tasks, and pipelines management, designed for agent integration. Mirrors common Bitbucket UI functionality. No admin access. User sees the same thing as they do in UI."

## Clarifications

### Session 2026-03-14

- Q: Should the CLI use undocumented Bitbucket endpoints for full PR task CRUD, or only support official API (read-only listing)? → A: Official API only — list tasks read-only from the activity log. No create/update operations.
- Q: Should the CLI require workspace on every command or allow a configured default? → A: Configurable default workspace — set once during auth/config, use implicitly. Override per-command with `--workspace` flag.
- Q: How should the CLI store credentials — OS native keychain or local config file? → A: Local config file with restricted file permissions (e.g., `~/.config/bitbucket-cli/config.json`, mode 600). No OS keychain dependency.
- Q: Should the CLI auto-retry on rate limit (429) or report and exit? → A: Report and exit with non-zero code. Include retry-after timing in the error message. No automatic retries.
- Q: Should the CLI accept credentials via environment variables as an override for CI/CD? → A: Yes, environment variables (e.g., `BITBUCKET_USERNAME`, `BITBUCKET_APP_PASSWORD`) override config file values. Config file is the fallback.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticate and List Repositories (Priority: P1)

A user (or an automated agent) authenticates with Bitbucket using their credentials and lists repositories in a workspace. This is the foundational capability — without authentication and basic repository browsing, no other CLI operations are possible.

**Why this priority**: Authentication is the gateway to all other functionality. Listing repositories is the simplest read operation that proves the CLI works end-to-end.

**Independent Test**: Can be fully tested by running the auth setup and a single list command, verifying that repositories are returned in the expected output format.

**Acceptance Scenarios**:

1. **Given** a user has valid Bitbucket credentials configured, **When** they run the list repositories command with a workspace name, **Then** they see a list of repositories they have access to, displayed in both human-readable and JSON formats.
2. **Given** a user has no credentials configured, **When** they run any command, **Then** they receive a clear error message explaining how to authenticate.
3. **Given** a user has invalid or expired credentials, **When** they run any command, **Then** they receive a clear authentication error with guidance to re-authenticate.
4. **Given** a workspace has more repositories than fit in one page, **When** the user lists repositories, **Then** all results are returned (pagination handled automatically) or the user can control pagination via flags.
5. **Given** a user has configured a default workspace, **When** they run the list repositories command without specifying `--workspace`, **Then** repositories from the default workspace are listed.
6. **Given** a user has configured a default workspace, **When** they run any command with an explicit `--workspace` flag, **Then** the explicit workspace is used instead of the default.
7. **Given** environment variables for credentials are set, **When** the user runs any command, **Then** environment variable values take precedence over config file values.

---

### User Story 2 - Browse and Manage Pull Requests (Priority: P1)

A user lists pull requests for a repository, views details of a specific PR, and performs common review actions: approve, request changes, decline, or merge. This mirrors the core PR workflow visible in the Bitbucket UI.

**Why this priority**: Pull request management is the most frequent Bitbucket workflow. An agent needs to read PR state and take review actions to participate in code review flows.

**Independent Test**: Can be tested by listing PRs, fetching a specific PR's details, and performing an approval — verifying each command returns expected data and the action is reflected in Bitbucket.

**Acceptance Scenarios**:

1. **Given** a repository with open pull requests, **When** the user lists PRs, **Then** they see PR titles, authors, status, and IDs.
2. **Given** a specific PR ID, **When** the user requests PR details, **Then** they see title, description, source/destination branches, reviewers, approval status, and current state.
3. **Given** an open PR, **When** the user approves it, **Then** the approval is registered in Bitbucket and the CLI confirms success.
4. **Given** an open PR the user has approved, **When** the user removes their approval, **Then** the approval is removed and confirmed.
5. **Given** an open PR, **When** the user requests changes, **Then** the change request is registered.
6. **Given** an open PR with a change request from the user, **When** the user removes the change request, **Then** it is removed.
7. **Given** an approved PR ready to merge, **When** the user merges it, **Then** the merge completes (or a pending merge status is reported for long-running merges) and the CLI confirms the result.
8. **Given** an open PR, **When** the user declines it, **Then** the PR is declined and confirmed.

---

### User Story 3 - Create and Update Pull Requests (Priority: P1)

A user creates a new pull request from the CLI, specifying source and destination branches, title, description, and reviewers. They can also update an existing PR's properties and create draft PRs.

**Why this priority**: Creating and updating PRs is essential for agents that automate branch workflows — pushing code and then opening a PR for review without leaving the terminal.

**Independent Test**: Can be tested by creating a PR between two branches, verifying it appears in the Bitbucket UI, then updating its title and confirming the change.

**Acceptance Scenarios**:

1. **Given** a repository with at least two branches, **When** the user creates a PR with title, source branch, and destination branch, **Then** a PR is created and its URL/ID is returned.
2. **Given** optional parameters (description, reviewers, close-source-branch flag), **When** the user includes them during PR creation, **Then** the PR is created with those properties set.
3. **Given** an existing open PR, **When** the user updates its title, description, reviewers, or destination branch, **Then** the PR is updated in Bitbucket and the change is confirmed.
4. **Given** the user wants a draft PR, **When** they create a PR with a draft flag, **Then** a draft PR is created that prevents merging until published.
5. **Given** a draft PR, **When** the user publishes it, **Then** the PR becomes ready for review and reviewers are notified.
6. **Given** a regular open PR, **When** the user converts it to draft, **Then** the PR status changes to draft.

---

### User Story 4 - Comment on Pull Requests (Priority: P2)

A user reads, creates, updates, and deletes comments on a pull request. They can leave general comments or inline comments on specific files/lines. They can also resolve and reopen comment threads.

**Why this priority**: Comments are the primary communication mechanism during code review. An agent needs to read review feedback and post responses.

**Independent Test**: Can be tested by listing comments on a PR, posting a new comment, verifying it appears, then deleting it.

**Acceptance Scenarios**:

1. **Given** a PR with existing comments, **When** the user lists comments, **Then** they see comment content, author, creation time, and whether each comment is resolved.
2. **Given** a PR, **When** the user posts a general comment with text content, **Then** the comment appears on the PR.
3. **Given** a PR, **When** the user posts an inline comment specifying a file path and line number, **Then** the comment appears on that specific code location.
4. **Given** an existing comment the user authored, **When** the user updates it, **Then** the comment content is changed.
5. **Given** an existing comment the user authored, **When** the user deletes it, **Then** the comment is removed.
6. **Given** an unresolved comment thread, **When** the user resolves it, **Then** the thread is marked as resolved.
7. **Given** a resolved comment thread, **When** the user reopens it, **Then** the thread is marked as unresolved.

---

### User Story 5 - View PR Diffs, Commits, and Activity (Priority: P2)

A user views the diff, diff statistics, commit list, and activity log for a pull request. This gives them full visibility into what changed, the commit history, and what actions have been taken.

**Why this priority**: An agent reviewing code needs to see what changed (diff), understand the commit history, and be aware of prior review activity before taking action.

**Independent Test**: Can be tested by fetching a diff for a known PR and verifying the output contains expected file changes.

**Acceptance Scenarios**:

1. **Given** a PR with code changes, **When** the user requests the diff, **Then** the full diff is displayed in standard unified diff format.
2. **Given** a PR with code changes, **When** the user requests diff statistics, **Then** they see per-file change summaries (files changed, lines added/removed).
3. **Given** a PR with multiple commits, **When** the user lists commits, **Then** they see commit hashes, messages, authors, and dates.
4. **Given** a PR with review activity, **When** the user requests the activity log, **Then** they see a chronological list of events (comments, approvals, updates, status changes).

---

### User Story 6 - Manage PR Tasks (Priority: P3)

A user lists tasks on a pull request to see outstanding work items and their completion status. Task listing is read-only via the official Bitbucket API (activity log). Creating and updating tasks is not supported by the CLI due to Bitbucket API v2 limitations.

**Why this priority**: Tasks provide visibility into outstanding work items within a PR. Read-only access is sufficient for agents to understand what work remains.

**Independent Test**: Can be tested by listing tasks on a PR that has tasks and verifying the output shows task descriptions and statuses.

**Acceptance Scenarios**:

1. **Given** a PR with existing tasks, **When** the user lists tasks, **Then** they see task descriptions, assignees, and completion status.
2. **Given** a PR with no tasks, **When** the user lists tasks, **Then** they see an empty result with a clear message.
3. **Given** a user attempts to create or update a task via the CLI, **When** they run such a command, **Then** they receive a clear message that task creation/updates are not supported and must be done via the Bitbucket web UI.

---

### User Story 7 - Manage Pipelines (Priority: P2)

A user lists pipeline runs for a repository, triggers a new run, views run details, checks step statuses and logs, and stops a running pipeline. This mirrors the Pipelines UI in Bitbucket.

**Why this priority**: Pipelines are integral to CI/CD workflows. An agent needs to trigger builds, check status, and read logs to act on CI results.

**Independent Test**: Can be tested by listing pipeline runs for a repository and viewing details of a specific run.

**Acceptance Scenarios**:

1. **Given** a repository with pipeline history, **When** the user lists pipeline runs, **Then** they see run IDs, trigger info, status, and timestamps.
2. **Given** a repository with a pipeline configuration, **When** the user triggers a new run specifying a branch, **Then** the pipeline starts and the run ID is returned.
3. **Given** a pipeline run ID, **When** the user requests run details, **Then** they see status, duration, trigger info, and step summary.
4. **Given** a running pipeline, **When** the user stops it, **Then** the pipeline and its uncompleted steps are signaled to stop.
5. **Given** a pipeline run, **When** the user lists its steps, **Then** they see step names, statuses, and durations.
6. **Given** a specific pipeline step, **When** the user requests step details, **Then** they see detailed step information.
7. **Given** a completed or running pipeline step, **When** the user requests logs, **Then** the step's log output is displayed.

---

### User Story 8 - Get Repository Details (Priority: P1)

A user retrieves detailed information about a specific repository, including its name, description, language, size, default branch, and other metadata visible in the Bitbucket UI.

**Why this priority**: Repository details are essential context for agents that need to understand the repo they are operating on — what branch to target, what language it uses, etc.

**Independent Test**: Can be tested by requesting details for a known repository and verifying the returned metadata.

**Acceptance Scenarios**:

1. **Given** a valid workspace and repository slug, **When** the user requests repository details, **Then** they see the repo's full name, description, language, creation date, default branch, and access level.
2. **Given** an invalid repository slug, **When** the user requests details, **Then** they receive a clear "not found" error.

---

### Edge Cases

- What happens when the user tries to approve their own PR? The CLI relays the error from the Bitbucket API (user cannot approve their own PR).
- What happens when network connectivity is lost mid-request? The CLI displays a connection error: "Connection error: {details}. Check your network connection and try again."
- What happens when the Bitbucket API rate limit is exceeded? The CLI displays the rate limit error with Retry-After value and exits with code 1. No automatic retry.
- What happens when a merge is long-running and returns a 202 status? The CLI reports: "Merge in progress. Task ID: {id}. Check PR status to confirm completion."
- What happens when a user tries to merge a draft PR? The CLI relays the error from the Bitbucket API that draft PRs cannot be merged until published.
- What happens when a user tries to update/delete a comment they did not author? The CLI relays the permission error from the Bitbucket API.
- What happens when paginated results are extremely large (thousands of items)? The CLI uses `--limit` and `--page-size` to control total results and per-request size. Without `--limit`, all pages are fetched.
- What happens when a user attempts to create or update a PR task? The CLI displays: "Task creation and updates are not supported via the CLI. Use the Bitbucket web UI to manage tasks."
- What happens when the user tries to decline an already-merged PR? The CLI relays the error from the Bitbucket API (cannot decline a merged PR).
- What happens when the user tries to approve a declined PR? The CLI relays the error from the Bitbucket API (cannot approve a non-open PR).
- What happens when a repository slug contains special characters? The HTTP client handles URL encoding automatically. The slug is passed as-is to the API layer.
- What happens when `bb pr comment add --file <path> --line <num>` references a file not in the PR diff? The CLI passes the request to the API and relays any error. The API may accept or reject the comment depending on the file path.
- What happens when the config file is corrupted or contains invalid JSON? The CLI displays an error with the config file path and suggests re-running `bb auth setup`.
- What happens when an OAuth2 access token has expired? The CLI displays an authentication error instructing the user to obtain a new token and re-run `bb auth setup`. Token refresh is out of scope.
- What happens when the user's App Password lacks required scopes? The CLI relays the 403 error from the API and suggests which scope is likely needed based on the command group.
- What happens when `bb pr create --reviewer <user>` references a user that doesn't exist? The CLI relays the error from the Bitbucket API.
- What happens when the Bitbucket API returns a 5xx error? The CLI displays: "Bitbucket server error ({status code}). Try again later." and exits with code 1.
- What happens when `bb pipeline run --var` receives malformed input? The CLI rejects input without a `=` sign with: "Invalid variable format: '<input>'. Expected KEY=VALUE."
- What happens when the config directory or file has overly permissive permissions? The CLI does not check existing file permissions — it only sets restrictive permissions when creating or writing the file.

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Configuration
- **FR-001**: System MUST support authentication via Bitbucket App Passwords (username + app password) using basic auth. Required App Password scopes per command group: Repositories (`repository` read, `repository:write` for write ops), Pull Requests (`pullrequest` read, `pullrequest:write` for create/update/approve/merge), Pipelines (`pipeline` read, `pipeline:write` for trigger/stop). If a command fails due to insufficient scopes, the error message MUST include which scope is likely missing (based on the command group) and link to Bitbucket App Password settings.
- **FR-002**: System MUST support authentication via OAuth 2.0 access tokens. Token refresh is out of scope — if the token has expired, the CLI MUST display an error instructing the user to obtain a new token and re-run `bb auth setup`.
- **FR-003**: System MUST store credentials in a local configuration file with restricted file permissions, located in a platform-specific standard config directory: `~/.config/bitbucket-cli/config.json` on Linux, `~/Library/Application Support/bitbucket-cli/config.json` on macOS, `%APPDATA%\bitbucket-cli\config.json` on Windows. File permissions MUST be set to mode 600 on Unix systems; on Windows, the file MUST be created with user-only ACL (no inheritance from parent). If `bb auth setup` is run and the directory or file does not exist, they MUST be created automatically. If the config file exists but is corrupted or contains invalid JSON, the CLI MUST display an error message indicating the file is corrupt with the path, and suggest re-running `bb auth setup` to recreate it. No OS keychain dependency.
- **FR-003a**: System MUST support credential override via environment variables: `BITBUCKET_USERNAME`, `BITBUCKET_APP_PASSWORD`, `BITBUCKET_ACCESS_TOKEN`, `BITBUCKET_WORKSPACE`. Environment variables take precedence over the config file when set. If partial environment credentials are provided (e.g., `BITBUCKET_USERNAME` set but `BITBUCKET_APP_PASSWORD` not set), the CLI MUST display an error listing which variables are set and which are missing. Credential resolution order: environment variables → config file. No per-command flag-level credential override is supported (credentials come only from env vars or config file).
- **FR-004**: System MUST provide a command (`bb auth setup`) to configure/set authentication credentials and default workspace. If both `--username`/`--app-password` AND `--access-token` are provided, the CLI MUST reject the input with an error explaining that only one authentication method should be specified.
- **FR-004a**: System MUST allow setting a default workspace during configuration, which is used implicitly when `--workspace` is not provided on a command. If no workspace is available (not set via flag, config, or `BITBUCKET_WORKSPACE` env var) and a command requires it, the CLI MUST exit with an error: "No workspace specified. Use --workspace flag, set a default with 'bb auth setup --workspace <slug>', or set BITBUCKET_WORKSPACE environment variable."
- **FR-004b**: System MUST allow overriding the default workspace on any command via a `--workspace` flag.
- **FR-005**: System MUST display clear error messages when authentication fails. Error messages MUST include: (a) what went wrong (e.g., "Authentication failed: invalid credentials"), (b) how to fix it (e.g., "Run 'bb auth setup' to reconfigure credentials"), and (c) for scope-related errors, which scope is likely needed.
- **FR-005a**: System MUST provide a `bb auth status` command that displays: authentication method in use (app-password or oauth2), source of credentials (environment variables or config file), configured default workspace, and credential validity (masked values — first 4 and last 4 characters shown, middle replaced with asterisks). When credentials come from environment variables, the output MUST indicate "Source: environment variables".

#### Output Formats
- **FR-006**: System MUST support human-readable text output by default. List commands MUST use tabular format with columns. Detail/view commands MUST use key-value pair format. Diff output MUST be plain text in unified diff format.
- **FR-007**: System MUST support JSON output via a `--json` flag for machine consumption and agent integration. JSON error output format: `{"error": {"message": "...", "status": N}}` to stderr. List commands MUST return: `{"values": [...], "page": N, "pagelen": N, "size": N}`. Detail commands MUST return a single object. Action commands (approve, merge, etc.) MUST return: `{"success": true, "message": "..."}` with relevant context fields. For `bb pr diff --json`, the diff text MUST be wrapped in a JSON object: `{"diff": "..."}`.
- **FR-008**: System MUST write error messages to stderr and data output to stdout, enabling clean piping and composition.
- **FR-008a**: System MUST support a `--verbose` flag that outputs HTTP request/response details (method, URL, status code, timing) to stderr. When `--verbose` is active, authentication headers MUST be masked (showing "Authorization: Basic ****" or "Authorization: Bearer ****") to prevent credential leakage.

#### Repository Operations
- **FR-009**: System MUST list repositories in a workspace with support for filtering by role (admin, contributor, member, owner) via `--role` flag, and sorting via `--sort` flag (e.g., `-updated_on` for most recently updated). The filter and sort values are passed directly to the Bitbucket API. Human-readable output MUST display: name (slug), description (truncated to 80 chars), language, and updated date.
- **FR-010**: System MUST retrieve and display detailed metadata for a specific repository. Fields displayed: full name, slug, description, language, default branch name, creation date, last update date, size, privacy status (public/private), and HTML URL. Repository slugs containing special characters are passed as-is to the API (URL encoding is handled by the HTTP client).

#### Pull Request Operations
- **FR-011**: System MUST list pull requests for a repository, filterable by state. The `--state` flag accepts values case-insensitively (e.g., "open" or "OPEN") and normalizes to uppercase for the API. Only a single state filter is supported per invocation. Human-readable output MUST display: PR ID, title, author display name, state, and source→destination branch names.
- **FR-012**: System MUST create a new pull request with title, source branch, destination branch, and optional description, reviewers, and close-source-branch flag. Reviewers are specified by Bitbucket username (nickname) via `--reviewer` flag (repeatable). If a specified reviewer does not exist or is not a workspace member, the CLI relays the error from the Bitbucket API.
- **FR-013**: System MUST retrieve and display full details for a specific pull request. Fields displayed: ID, title, description, state, draft status, author, source branch, destination branch, reviewers with approval status, created date, updated date, close-source-branch setting, and HTML URL.
- **FR-014**: System MUST update an existing pull request's properties (title, description, reviewers, destination branch). The `--reviewer` flag REPLACES all existing reviewers (not additive). If no update flags are provided (no --title, --description, --reviewer, --destination), the CLI MUST display an error: "No update options specified. Use --title, --description, --reviewer, or --destination."
- **FR-015**: System MUST support approving a pull request on behalf of the authenticated user. If the PR is in a state that does not accept approvals (e.g., DECLINED), the CLI relays the error from the Bitbucket API.
- **FR-016**: System MUST support removing an approval from a pull request.
- **FR-017**: System MUST support declining a pull request. If the PR is already merged, the CLI relays the error from the Bitbucket API.
- **FR-018**: System MUST support merging a pull request with configurable strategy (merge_commit, squash, fast_forward). When `--message` is not provided, the Bitbucket API uses its default merge commit message. The `--close-source-branch` flag on merge overrides the PR's existing close-source-branch setting for this merge operation. When a long-running merge returns HTTP 202, the CLI MUST display: "Merge in progress. Task ID: {id}. Check PR status to confirm completion."
- **FR-019**: System MUST support requesting changes on a pull request.
- **FR-020**: System MUST support removing a change request from a pull request.
- **FR-021**: System MUST retrieve the activity log for a pull request, showing a chronological list of events (approvals, comments, updates, status changes) with actor, date, and event details.

#### Draft Pull Request Operations
- **FR-022**: System MUST support creating a draft pull request via a `--draft` flag.
- **FR-023**: System MUST support publishing a draft pull request (marking it ready for review). If `bb pr publish` is called on a PR that is not a draft, the CLI MUST display: "PR #{id} is already published (not a draft)." and exit with code 0 (no-op success).
- **FR-024**: System MUST support converting a regular pull request to draft status.

#### Comment Operations
- **FR-025**: System MUST list comments on a pull request, showing content, author, timestamps, and resolved status.
- **FR-026**: System MUST create a general comment on a pull request.
- **FR-027**: System MUST create an inline comment on a specific file and line of a pull request. If the specified file path is not part of the PR diff, the Bitbucket API may accept the comment anyway (behavior is API-dependent) — the CLI passes the request through and relays any error.
- **FR-027a**: System MUST support creating reply comments via the `--parent` flag, specifying the parent comment ID. The reply appears as a threaded response under the parent comment.
- **FR-028**: System MUST update an existing comment on a pull request.
- **FR-029**: System MUST delete a comment on a pull request.
- **FR-030**: System MUST resolve a comment thread on a pull request.
- **FR-031**: System MUST reopen a resolved comment thread on a pull request.

#### Diff & Commit Operations
- **FR-032**: System MUST retrieve and display the diff for a pull request in unified diff format. The CLI streams the diff output to stdout without truncation — the consumer (terminal or pipe) is responsible for handling large output. No size limit is enforced by the CLI.
- **FR-033**: System MUST retrieve diff statistics (per-file changes summary) for a pull request.
- **FR-034**: System MUST list commits on a pull request with hash, message, author, and date.

#### Task Operations
- **FR-035**: System MUST list tasks on a pull request (read-only). The CLI attempts to extract task entries from the PR activity log endpoint. Note: task visibility in the activity log is limited — the activity log may contain task-related entries (description, completion status) but fields like assignee may not be available. If no task entries are found, the CLI displays an empty result. Task creation and updates are out of scope due to Bitbucket API v2 limitations and must be performed via the Bitbucket web UI.

#### Pipeline Operations
- **FR-036**: System MUST list pipeline runs for a repository with status and timing information. Human-readable output MUST display: build number, status (state + result), trigger branch, creator, and created/completed timestamps.
- **FR-037**: System MUST trigger a new pipeline run, specifying at minimum a target branch. When the repository has no `bitbucket-pipelines.yml`, the CLI relays the error from the Bitbucket API. The `--var` flag accepts KEY=VALUE format; malformed input (no `=` sign) MUST be rejected with an error: "Invalid variable format: '<input>'. Expected KEY=VALUE."
- **FR-038**: System MUST retrieve details for a specific pipeline run.
- **FR-039**: System MUST stop a running pipeline.
- **FR-040**: System MUST list steps for a pipeline run with status and duration.
- **FR-041**: System MUST retrieve details for a specific pipeline step. Fields displayed: step name, UUID, status (state + result), start time, completion time, duration, and log URL.
- **FR-042**: System MUST retrieve and display logs for a specific pipeline step. Logs are streamed as plain text to stdout. The CLI does not use HTTP Range requests — it fetches the full log content.

#### Pagination & Rate Limiting
- **FR-043**: System MUST handle API pagination automatically, following `next` links rather than constructing URLs.
- **FR-044**: System MUST provide flags to control pagination behavior: `--limit` (maximum total results to return) and `--page-size` (results per API request, max 100). No page-number navigation (`--page`) is provided — the CLI auto-paginates and uses `--limit` to cap results.
- **FR-045**: System MUST handle rate-limit responses (HTTP 429) by exiting with a non-zero code and displaying a clear error message that includes retry-after timing when available. No automatic retries.

#### Error Handling
- **FR-048**: System MUST handle HTTP 5xx server errors by displaying: "Bitbucket server error ({status code}). Try again later." with exit code 1.
- **FR-049**: System MUST handle network errors (DNS resolution failure, connection refused, timeout) by displaying: "Connection error: {details}. Check your network connection and try again." with exit code 1.
- **FR-050**: System MUST validate HTTPS certificates. Self-signed certificates are rejected. No `--insecure` flag is provided.

#### Agent Integration
- **FR-046**: System MUST use exit code 0 for success and exit code 1 for all errors (authentication, not-found, rate-limit, input validation, server errors). A single error exit code is intentional — error differentiation is via error messages and JSON error output, not exit codes.
- **FR-047**: System MUST be usable non-interactively — all required inputs provided via command arguments and flags, no interactive prompts during execution.
- **FR-047a**: JSON output MUST use stable, machine-parseable identifiers: PR IDs as integers, pipeline UUIDs as strings with curly braces (as returned by the API), timestamps in ISO 8601 format.

### Key Entities

- **Workspace**: A Bitbucket workspace that owns repositories. Identified by a slug. The top-level organizational unit.
- **Repository**: A code repository within a workspace. Identified by workspace + repo slug. Has metadata like language, default branch, and description.
- **Pull Request**: A code review unit linking a source branch to a destination branch. Has state (open, merged, declined, superseded), draft status, reviewers, and approval status. Identified by repository + PR ID (integer).
- **Comment**: Text attached to a PR, either as a general comment or inline on a specific file/line. Can be resolved/reopened. Identified by PR + comment ID.
- **Task**: A to-do item attached to a PR tracking required work. Has description and completion status. Note: tasks are extracted from the activity log, so available fields are limited to what the activity log provides (description, completion status). Assignee information may not be available via this source.
- **Pipeline Run**: A CI/CD execution for a repository. Has a UUID, status (pending, running, completed, failed, stopped), and is composed of steps.
- **Pipeline Step**: An individual stage within a pipeline run. Has its own status, duration, and logs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can authenticate and run their first command (list repositories) within 2 minutes of completing `pnpm install` and `pnpm build`. The 2-minute window covers `bb auth setup` and `bb repo list` only (not dependency installation).
- **SC-002**: All supported Bitbucket operations produce equivalent outcomes whether performed via the CLI or the Bitbucket web UI — the CLI returns the same data fields and the same mutations occur. "Equivalent" means the API state change is identical; the CLI may display a subset of fields compared to the full web UI.
- **SC-003**: Every command completes and returns output within 10 seconds for single-resource operations, where "the tool's control" is defined as time spent in CLI processing (argument parsing, output formatting) — not network round-trip time or Bitbucket API response time.
- **SC-004**: An automated agent can execute a full PR workflow (create PR, add comment, approve, merge) using only CLI commands with `--json` output, without human intervention. This includes error recovery: if any step fails, the JSON error output provides sufficient information for the agent to diagnose the failure.
- **SC-005**: 100% of error scenarios produce exit code 1 and a human-readable error message on stderr.
- **SC-006**: JSON output for every command is parseable and consistent in structure. Consistency means: list commands always return `{"values": [...]}`, detail commands always return a single object, action commands always return `{"success": true, ...}`. A formal JSON schema is not in scope for v1 but the structure patterns are documented in the CLI contract.

## Assumptions

- Users have an existing Bitbucket Cloud account with appropriate permissions for the operations they want to perform (at minimum, read access to repositories).
- The CLI targets Bitbucket Cloud (api.bitbucket.org/2.0) only. Bitbucket Server/Data Center is not supported. All API endpoints used have been validated as available on Bitbucket Cloud.
- No admin-level operations are in scope — the CLI only exposes functionality available to regular workspace members/contributors.
- The CLI is a local tool installed on the user's machine or CI environment. It does not run as a service.
- Credential storage uses a local config file with restricted file permissions (mode 600 on Unix, user-only ACL on Windows). No OS keychain or custom encryption dependency.
- The Bitbucket API rate limits (1,000–10,000 requests/hour for authenticated users) are sufficient for typical CLI usage patterns.
- PR task operations are limited to read-only listing via the activity log. The Bitbucket API v2 does not provide public endpoints for task creation or updates. Task visibility in the activity log has limited API support — available fields may be restricted to description and completion status.
- Cross-repository pull requests (where source and destination are in different repositories) are out of scope. All PR operations assume source and destination are in the same repository.
- Node.js 18+ is a hard requirement for the CLI runtime due to dependency on native `fetch()` support. This is enforced via the `engines` field in package.json.

## Non-Functional Requirements

- **NFR-001**: Error messages and all CLI output are in English only. Localization/i18n is out of scope.
- **NFR-002**: The CLI does not implement signal handling beyond the default Node.js behavior. Ctrl+C (SIGINT) terminates the process immediately. In-flight API requests are abandoned, not cleaned up.
- **NFR-003**: Multiple `bb` processes can run simultaneously. The config file is read-only during normal command execution (only written during `bb auth setup`). No file locking is implemented.
- **NFR-004**: The config file format is not versioned. If the schema changes in future versions, migration is handled by re-running `bb auth setup`.
- **NFR-005**: No startup time target is enforced as a hard requirement, but the architecture choices (Commander.js, minimal dependencies) are selected to keep startup under 100ms.
