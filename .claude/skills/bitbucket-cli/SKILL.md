---
name: bitbucket-cli
description: Interact with Bitbucket Cloud repositories, pull requests, comments, and pipelines. Use when the user needs to manage repos, review PRs, run pipelines, or automate Bitbucket workflows.
allowed-tools: Bash(bb:*), Bash(node dist/cli.js:*)
---

# Bitbucket Cloud CLI (bb)

## Quick start

```bash
# configure authentication
bb auth setup --username my-user --app-password my-app-password --workspace my-workspace
# verify authentication
bb auth status
# list repositories
bb repo list --json
# list open pull requests for a repo
bb pr list my-repo --json
# view a specific pull request
bb pr view my-repo 42 --json
# check pipeline status
bb pipeline list my-repo --json
```

## Prerequisites

### Authentication

Before using `bb`, configure credentials using one of these methods:

**Method 1 — Interactive setup:**

```bash
bb auth setup --username <username> --app-password <password> --workspace <workspace>
# or with an OAuth2 access token
bb auth setup --access-token <token> --workspace <workspace>
```

**Method 2 — Environment variables** (override config file):

```bash
export BITBUCKET_USERNAME=my-user
export BITBUCKET_APP_PASSWORD=my-app-password
# or for OAuth2
export BITBUCKET_ACCESS_TOKEN=my-token
```

**Creating an App Password:**

1. Go to Bitbucket Settings > App passwords
2. Create a new app password with required permissions (Repositories: Read/Write, Pull requests: Read/Write, Pipelines: Read/Write)
3. Copy the generated password

**Verify setup:**

```bash
bb auth status
```

### Workspace

Most commands require a workspace. Set a default during auth setup or override per-command with `-w`:

```bash
bb repo list -w other-workspace
```

### Local development

When working inside the `bitbucket-cli` repository itself, use `node dist/cli.js` instead of `bb`:

```bash
# Build first (if not already built)
pnpm build
# Then use node dist/cli.js in place of bb
node dist/cli.js auth status
node dist/cli.js repo list --json
node dist/cli.js pr list my-repo --json
```

### Installed as npm package

If `bb` is not globally available after npm install, use `npx`:

```bash
npx bb repo list --json
npx bb pr list my-repo --json
```

## Global options

All commands support these options:

```bash
--json              # Output in JSON format (recommended for automation)
-w, --workspace <slug>  # Override default workspace
-v, --verbose       # Show HTTP request/response details
```

Use `--json` for structured output when working with AI agents or scripts. All commands support it. Errors in JSON mode produce `{"error":{"message":"...","status":N}}` on stderr.

## Commands

### Authentication

```bash
# Configure credentials and default workspace
bb auth setup --username <username> --app-password <password>
bb auth setup --access-token <token>
bb auth setup --workspace <slug>
bb auth setup --username <username> --app-password <password> --workspace <slug>

# Show current authentication status and configuration
bb auth status
```

### Repositories

```bash
# List repositories in a workspace
bb repo list
bb repo list --role admin
bb repo list --sort -updated_on
bb repo list --limit 10 --page-size 50

# Get details for a specific repository
bb repo view <repo>
```

**repo list options:**

| Option | Description |
|--------|-------------|
| `--role <role>` | Filter by role: admin, contributor, member, owner |
| `--sort <field>` | Sort field (e.g., `-updated_on`) |
| `--limit <n>` | Maximum number of results |
| `--page-size <n>` | Results per API request (max 100) |

### Pull Requests

```bash
# List pull requests for a repository
bb pr list <repo>
bb pr list <repo> --state OPEN
bb pr list <repo> --state MERGED --limit 5

# Get details for a specific pull request
bb pr view <repo> <pr-id>

# Create a new pull request
bb pr create <repo> --title "My PR" --source feature-branch
bb pr create <repo> --title "My PR" --source feature-branch --destination main
bb pr create <repo> --title "My PR" --source feature-branch --description "Description" --reviewer user1 --reviewer user2 --close-source-branch --draft

# Update a pull request
bb pr update <repo> <pr-id> --title "New title"
bb pr update <repo> <pr-id> --description "Updated description"
bb pr update <repo> <pr-id> --reviewer user1 --reviewer user2
bb pr update <repo> <pr-id> --destination develop

# Approve a pull request
bb pr approve <repo> <pr-id>

# Remove approval from a pull request
bb pr unapprove <repo> <pr-id>

# Request changes on a pull request
bb pr request-changes <repo> <pr-id>

# Remove a change request from a pull request
bb pr unrequest-changes <repo> <pr-id>

# Merge a pull request
bb pr merge <repo> <pr-id>
bb pr merge <repo> <pr-id> --strategy squash
bb pr merge <repo> <pr-id> --strategy fast_forward --message "Merge commit message" --close-source-branch

# Decline a pull request
bb pr decline <repo> <pr-id>

# Publish a draft pull request (mark ready for review)
bb pr publish <repo> <pr-id>

# Convert a pull request to draft status
bb pr draft <repo> <pr-id>

# Get the activity log for a pull request
bb pr activity <repo> <pr-id>
bb pr activity <repo> <pr-id> --limit 20

# Get the diff for a pull request (unified diff format)
bb pr diff <repo> <pr-id>

# Get diff statistics for a pull request
bb pr diffstat <repo> <pr-id>

# List commits on a pull request
bb pr commits <repo> <pr-id>

# List tasks on a pull request (read-only)
bb pr tasks <repo> <pr-id>
```

**pr list options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--state <state>` | Filter: OPEN, MERGED, DECLINED, SUPERSEDED | OPEN |
| `--limit <n>` | Maximum number of results | — |
| `--page-size <n>` | Results per API request (max 100) | — |

**pr create options:**

| Option | Description | Required |
|--------|-------------|----------|
| `--title <title>` | PR title | Yes |
| `--source <branch>` | Source branch name | Yes |
| `--destination <branch>` | Destination branch | No (default: main) |
| `--description <text>` | PR description | No |
| `--reviewer <username>` | Reviewer usernames (repeatable) | No |
| `--close-source-branch` | Delete source branch on merge | No |
| `--draft` | Create as draft PR | No |

**pr update options:**

| Option | Description |
|--------|-------------|
| `--title <title>` | New title |
| `--description <text>` | New description |
| `--reviewer <username>` | Replace all reviewers (repeatable) |
| `--destination <branch>` | New destination branch |

**pr merge options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--strategy <strategy>` | merge_commit, squash, fast_forward | merge_commit |
| `--message <message>` | Merge commit message | — |
| `--close-source-branch` | Delete source branch | — |

### PR Comments

```bash
# List comments on a pull request
bb pr comment list <repo> <pr-id>
bb pr comment list <repo> <pr-id> --limit 50

# Create a comment on a pull request
bb pr comment add <repo> <pr-id> --body "Comment text in **markdown**"
# Inline comment on a specific file and line
bb pr comment add <repo> <pr-id> --body "Fix this" --file src/main.ts --line 42
# Reply to an existing comment
bb pr comment add <repo> <pr-id> --body "Good point" --parent 123

# Update a comment
bb pr comment update <repo> <pr-id> <comment-id> --body "Updated text"

# Delete a comment
bb pr comment delete <repo> <pr-id> <comment-id>

# Resolve a comment thread
bb pr comment resolve <repo> <pr-id> <comment-id>

# Reopen a resolved comment thread
bb pr comment reopen <repo> <pr-id> <comment-id>
```

**comment add options:**

| Option | Description | Required |
|--------|-------------|----------|
| `--body <text>` | Comment text (markdown) | Yes |
| `--file <path>` | File path (for inline comment) | No |
| `--line <n>` | Line number (for inline comment) | No |
| `--parent <id>` | Parent comment ID (for replies) | No |

### Pipelines

```bash
# List pipeline runs for a repository
bb pipeline list <repo>
bb pipeline list <repo> --sort -created_on --limit 10

# Trigger a new pipeline run
bb pipeline run <repo> --branch main
bb pipeline run <repo> --branch main --pipeline custom-pipeline
bb pipeline run <repo> --branch main --var KEY1=value1 --var KEY2=value2

# Get details for a specific pipeline run
bb pipeline view <repo> <pipeline-uuid>

# Stop a running pipeline
bb pipeline stop <repo> <pipeline-uuid>

# List steps for a pipeline run
bb pipeline steps <repo> <pipeline-uuid>

# Get details for a specific pipeline step
bb pipeline step <repo> <pipeline-uuid> <step-uuid>

# Get logs for a specific pipeline step
bb pipeline logs <repo> <pipeline-uuid> <step-uuid>
```

**pipeline list options:**

| Option | Description |
|--------|-------------|
| `--sort <field>` | Sort field (e.g., `-created_on`) |
| `--limit <n>` | Maximum number of results |
| `--page-size <n>` | Results per API request (max 100) |

**pipeline run options:**

| Option | Description | Required |
|--------|-------------|----------|
| `--branch <branch>` | Target branch name | Yes |
| `--pipeline <name>` | Custom pipeline name | No |
| `--var <KEY=VALUE>` | Variables (repeatable) | No |

## Example: Create and submit a pull request

```bash
# Create a PR from feature branch to main
bb pr create my-repo --title "Add user authentication" --source feature/auth --destination main --description "Implements OAuth2 login flow" --reviewer teammate1 --close-source-branch --json

# Check the PR was created
bb pr list my-repo --state OPEN --json

# View the PR details
bb pr view my-repo 42 --json
```

## Example: Review a pull request

```bash
# View PR details
bb pr view my-repo 42 --json

# Check the diff
bb pr diff my-repo 42

# View diff statistics
bb pr diffstat my-repo 42 --json

# List commits
bb pr commits my-repo 42 --json

# Add a review comment
bb pr comment add my-repo 42 --body "Looks good overall, minor nit on line 15"

# Add an inline comment on a specific file
bb pr comment add my-repo 42 --body "Consider using a constant here" --file src/config.ts --line 15

# Approve the PR
bb pr approve my-repo 42

# Or request changes
bb pr request-changes my-repo 42
```

## Example: Monitor and debug pipelines

```bash
# List recent pipeline runs
bb pipeline list my-repo --sort -created_on --limit 5 --json

# View a specific pipeline run
bb pipeline view my-repo {pipeline-uuid} --json

# List steps in the pipeline
bb pipeline steps my-repo {pipeline-uuid} --json

# Get logs for a failing step
bb pipeline logs my-repo {pipeline-uuid} {step-uuid}

# Trigger a new pipeline run
bb pipeline run my-repo --branch main --json

# Stop a running pipeline
bb pipeline stop my-repo {pipeline-uuid}
```
