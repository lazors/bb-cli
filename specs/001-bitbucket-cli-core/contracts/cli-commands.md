# CLI Command Contract: Bitbucket CLI

**Binary name**: `bb`

## Global Flags

| Flag              | Short | Type   | Default | Description                                |
|-------------------|-------|--------|---------|--------------------------------------------|
| `--workspace`     | `-w`  | string | config  | Workspace slug (overrides default)         |
| `--json`          |       | flag   | false   | Output in JSON format                      |
| `--verbose`       | `-v`  | flag   | false   | Show HTTP request/response details (auth headers masked) |
| `--help`          | `-h`  | flag   |         | Show help                                  |
| `--version`       |       | flag   |         | Show version                               |

## Commands

### `bb auth`

#### `bb auth setup`
Configure authentication credentials and default workspace.

| Argument/Flag     | Type   | Required | Description                           |
|-------------------|--------|----------|---------------------------------------|
| `--username`      | string | yes*     | Bitbucket username                    |
| `--app-password`  | string | yes*     | Bitbucket app password                |
| `--access-token`  | string | yes*     | OAuth2 access token (alternative)     |
| `--workspace`     | string | no       | Default workspace to set              |

*Either `--username` + `--app-password` or `--access-token` required. Providing both is an error.

**Exit codes**: 0 success, 1 invalid input or write failure

#### `bb auth status`
Show current authentication status and configuration. Displays: auth method, credential source (env vars or config file), default workspace, masked credential values.

**Exit codes**: 0 authenticated, 1 not configured

---

### `bb repo`

#### `bb repo list`
List repositories in a workspace.

| Flag          | Type    | Default | Description                          |
|---------------|---------|---------|--------------------------------------|
| `--role`      | string  |         | Filter by role (admin, contributor, member, owner) |
| `--sort`      | string  |         | Sort field (e.g., `-updated_on`)     |
| `--limit`     | integer |         | Maximum number of results            |
| `--page-size` | integer | 25      | Results per API request (max 100)    |

**Exit codes**: 0 success, 1 API error, 1 auth error

#### `bb repo view <repo>`
Get details for a specific repository.

| Argument | Type   | Required | Description         |
|----------|--------|----------|---------------------|
| `repo`   | string | yes      | Repository slug     |

**Exit codes**: 0 success, 1 not found, 1 auth error

---

### `bb pr`

#### `bb pr list <repo>`
List pull requests for a repository.

| Flag          | Type    | Default | Description                          |
|---------------|---------|---------|--------------------------------------|
| `--state`     | string  | OPEN    | Filter (case-insensitive): OPEN, MERGED, DECLINED, SUPERSEDED |
| `--limit`     | integer |         | Maximum number of results            |
| `--page-size` | integer | 25      | Results per API request (max 100)    |

#### `bb pr create <repo>`
Create a new pull request.

| Flag                    | Type    | Required | Description                      |
|-------------------------|---------|----------|----------------------------------|
| `--title`               | string  | yes      | PR title                         |
| `--source`              | string  | yes      | Source branch name               |
| `--destination`         | string  | no       | Destination branch (default: main) |
| `--description`         | string  | no       | PR description                   |
| `--reviewer`            | string[]| no       | Reviewer usernames (repeatable)  |
| `--close-source-branch` | flag    | false    | Delete source branch on merge    |
| `--draft`               | flag    | false    | Create as draft PR               |

**Output**: Created PR ID and URL.

#### `bb pr view <repo> <pr-id>`
Get details for a specific pull request.

#### `bb pr update <repo> <pr-id>`
Update a pull request.

| Flag              | Type    | Required | Description                    |
|-------------------|---------|----------|--------------------------------|
| `--title`         | string  | no       | New title                      |
| `--description`   | string  | no       | New description                |
| `--reviewer`      | string[]| no       | Replace all reviewers (repeatable) |
| `--destination`   | string  | no       | New destination branch         |

#### `bb pr approve <repo> <pr-id>`
Approve a pull request.

#### `bb pr unapprove <repo> <pr-id>`
Remove approval from a pull request.

#### `bb pr request-changes <repo> <pr-id>`
Request changes on a pull request.

#### `bb pr unrequest-changes <repo> <pr-id>`
Remove a change request from a pull request.

#### `bb pr merge <repo> <pr-id>`
Merge a pull request.

| Flag                    | Type   | Default      | Description                      |
|-------------------------|--------|--------------|----------------------------------|
| `--strategy`            | string | merge_commit | merge_commit, squash, fast_forward |
| `--message`             | string |              | Merge commit message (API default if omitted) |
| `--close-source-branch` | flag   | false        | Delete source branch (overrides PR setting)  |

#### `bb pr decline <repo> <pr-id>`
Decline a pull request.

#### `bb pr publish <repo> <pr-id>`
Publish a draft pull request (mark ready for review).

#### `bb pr draft <repo> <pr-id>`
Convert a pull request to draft status.

#### `bb pr activity <repo> <pr-id>`
Get the activity log for a pull request.

| Flag          | Type    | Default | Description                          |
|---------------|---------|---------|--------------------------------------|
| `--limit`     | integer |         | Maximum number of results            |

#### `bb pr diff <repo> <pr-id>`
Get the diff for a pull request (unified diff format to stdout).

#### `bb pr diffstat <repo> <pr-id>`
Get diff statistics for a pull request.

#### `bb pr commits <repo> <pr-id>`
List commits on a pull request.

#### `bb pr tasks <repo> <pr-id>`
List tasks on a pull request (read-only).

---

### `bb pr comment`

#### `bb pr comment list <repo> <pr-id>`
List comments on a pull request.

| Flag          | Type    | Default | Description                          |
|---------------|---------|---------|--------------------------------------|
| `--limit`     | integer |         | Maximum number of results            |

#### `bb pr comment add <repo> <pr-id>`
Create a comment on a pull request.

| Flag        | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| `--body`    | string  | yes      | Comment text (markdown)              |
| `--file`    | string  | no       | File path (for inline comment)       |
| `--line`    | integer | no       | Line number (for inline comment)     |
| `--parent`  | integer | no       | Parent comment ID (for replies)      |

#### `bb pr comment update <repo> <pr-id> <comment-id>`
Update a comment on a pull request.

| Flag        | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| `--body`    | string  | yes      | Updated comment text                 |

#### `bb pr comment delete <repo> <pr-id> <comment-id>`
Delete a comment on a pull request.

#### `bb pr comment resolve <repo> <pr-id> <comment-id>`
Resolve a comment thread.

#### `bb pr comment reopen <repo> <pr-id> <comment-id>`
Reopen a resolved comment thread.

---

### `bb pipeline`

#### `bb pipeline list <repo>`
List pipeline runs for a repository.

| Flag          | Type    | Default | Description                          |
|---------------|---------|---------|--------------------------------------|
| `--sort`      | string  |         | Sort field (e.g., `-created_on`)     |
| `--limit`     | integer |         | Maximum number of results            |
| `--page-size` | integer | 25      | Results per API request (max 100)    |

#### `bb pipeline run <repo>`
Trigger a new pipeline run.

| Flag           | Type    | Required | Description                        |
|----------------|---------|----------|------------------------------------|
| `--branch`     | string  | yes      | Target branch name                 |
| `--pipeline`   | string  | no       | Custom pipeline name               |
| `--var`        | string[]| no       | Variables as KEY=VALUE (repeatable) |

**Output**: Pipeline UUID and build number.

#### `bb pipeline view <repo> <pipeline-uuid>`
Get details for a specific pipeline run.

#### `bb pipeline stop <repo> <pipeline-uuid>`
Stop a running pipeline.

#### `bb pipeline steps <repo> <pipeline-uuid>`
List steps for a pipeline run.

#### `bb pipeline step <repo> <pipeline-uuid> <step-uuid>`
Get details for a specific pipeline step.

#### `bb pipeline logs <repo> <pipeline-uuid> <step-uuid>`
Get logs for a specific pipeline step.

---

## Output Contract

### Human-readable (default)
- Tabular format for list commands (columns: key fields per entity type)
- Key-value pairs for detail/view commands
- Diff output as plain text (unified format)
- Errors to stderr

### JSON (`--json`)
- All list commands return: `{"values": [...], "page": N, "pagelen": N, "size": N}` (pagination metadata from API)
- All detail commands return: single object with entity fields
- All action commands return: `{"success": true, "message": "..."}` with relevant context fields
- Diff command with `--json`: `{"diff": "..."}` (diff text wrapped in JSON)
- Error format: `{"error": {"message": "...", "status": N}}` to stderr

### Identifier Formats
- PR IDs: integers (e.g., `42`)
- Pipeline UUIDs: strings with curly braces as returned by API (e.g., `"{uuid}"`)
- Timestamps: ISO 8601 format (e.g., `"2026-03-14T10:30:00.000000+00:00"`)

### Exit Codes
| Code | Meaning                          |
|------|----------------------------------|
| 0    | Success                          |
| 1    | General error (API, auth, input, server error) |

All error types (authentication, not-found, rate-limit, input validation, server errors) use exit code 1. Error differentiation is via error messages and JSON error output, not exit codes.
