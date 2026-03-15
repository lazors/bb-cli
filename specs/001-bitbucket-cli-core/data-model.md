# Data Model: Bitbucket CLI Core

**Branch**: `001-bitbucket-cli-core` | **Date**: 2026-03-14

## Local Entities

### Config

Stored in `~/.config/bitbucket-cli/config.json` (mode 600).

| Field              | Type   | Required | Description                          |
|--------------------|--------|----------|--------------------------------------|
| auth.type          | string | yes      | "app-password" or "oauth2"           |
| auth.username      | string | yes*     | Bitbucket username (app-password)    |
| auth.app_password  | string | yes*     | App password value (app-password)    |
| auth.access_token  | string | yes*     | OAuth2 access token                  |
| defaults.workspace | string | no       | Default workspace slug               |

*Required fields depend on `auth.type`.

**Environment variable overrides** (take precedence over config file):
- `BITBUCKET_USERNAME` → `auth.username`
- `BITBUCKET_APP_PASSWORD` → `auth.app_password`
- `BITBUCKET_ACCESS_TOKEN` → `auth.access_token`
- `BITBUCKET_WORKSPACE` → `defaults.workspace`

## API Entities (from Bitbucket Cloud API v2)

### Repository

| Field         | Type     | Description                              |
|---------------|----------|------------------------------------------|
| uuid          | string   | Unique identifier                        |
| name          | string   | Repository name                          |
| full_name     | string   | workspace/repo-slug                      |
| slug          | string   | URL-safe identifier                      |
| description   | string   | Repository description                   |
| is_private    | boolean  | Privacy status                           |
| language      | string   | Primary programming language             |
| mainbranch    | object   | Default branch (`{name: "main"}`)        |
| created_on    | datetime | Creation timestamp                       |
| updated_on    | datetime | Last update timestamp                    |
| size          | integer  | Repository size in bytes                 |
| links         | object   | Related URLs (html, clone, etc.)         |

### Pull Request

| Field                | Type     | Description                                     |
|----------------------|----------|-------------------------------------------------|
| id                   | integer  | PR identifier (unique within repo)              |
| title                | string   | PR title                                        |
| description          | string   | PR description (markdown)                       |
| state                | enum     | OPEN, MERGED, DECLINED, SUPERSEDED              |
| draft                | boolean  | Whether PR is in draft mode                     |
| author               | User     | PR creator                                      |
| source               | BranchRef| Source branch and commit                        |
| destination          | BranchRef| Destination branch and commit                   |
| reviewers            | User[]   | Assigned reviewers                              |
| participants         | Participant[] | All users who interacted                   |
| close_source_branch  | boolean  | Delete source branch on merge                   |
| created_on           | datetime | Creation timestamp                              |
| updated_on           | datetime | Last update timestamp                           |
| merge_commit         | object   | Merge commit info (when merged)                 |
| links                | object   | Related URLs                                    |

**State transitions**:
```
OPEN → MERGED    (via merge)
OPEN → DECLINED  (via decline)
OPEN → SUPERSEDED (when another PR supersedes)
```

**Draft transitions**:
```
draft:true → draft:false  (publish — via PUT with draft:false)
draft:false → draft:true  (convert to draft — via PUT with draft:true)
```

### BranchRef

| Field           | Type   | Description                |
|-----------------|--------|----------------------------|
| branch.name     | string | Branch name                |
| commit.hash     | string | Commit hash                |
| repository      | object | Repository info (cross-repo PRs) |

### User

| Field        | Type   | Description             |
|--------------|--------|-------------------------|
| uuid         | string | User UUID               |
| display_name | string | Display name            |
| nickname     | string | Username/nickname       |
| account_id   | string | Atlassian account ID    |
| links        | object | Avatar, HTML profile    |

### Participant

| Field    | Type   | Description                                      |
|----------|--------|--------------------------------------------------|
| user     | User   | Participant user                                 |
| role     | enum   | PARTICIPANT, REVIEWER, AUTHOR                    |
| approved | boolean| Whether user approved                            |
| state    | enum   | approved, changes_requested, null                |

### Comment

| Field      | Type     | Description                              |
|------------|----------|------------------------------------------|
| id         | integer  | Comment identifier                       |
| content    | object   | `{raw, markup, html}` — text content     |
| inline     | object   | `{path, from, to}` — for inline comments |
| parent     | object   | `{id}` — parent comment (for replies)    |
| user       | User     | Comment author                           |
| created_on | datetime | Creation timestamp                       |
| updated_on | datetime | Last update timestamp                    |
| deleted    | boolean  | Whether comment is deleted               |
| resolved   | object   | Resolution status and metadata           |
| links      | object   | Related URLs                             |

### Activity

| Field   | Type     | Description                                |
|---------|----------|--------------------------------------------|
| type    | string   | comment, update, approval, changes_requested |
| user    | User     | Actor                                      |
| date    | datetime | When the activity occurred                 |
| comment | Comment  | Present when type=comment                  |
| update  | object   | Present when type=update (state changes)   |
| approval| object   | Present when type=approval                 |

### Pipeline

| Field          | Type     | Description                             |
|----------------|----------|-----------------------------------------|
| uuid           | string   | Pipeline UUID                           |
| build_number   | integer  | Build number                            |
| state          | object   | `{name, result}` — status info          |
| created_on     | datetime | Creation timestamp                      |
| completed_on   | datetime | Completion timestamp                    |
| target         | object   | `{ref_name, ref_type}` — branch/commit  |
| creator        | User     | Who triggered the pipeline              |
| links          | object   | Related URLs                            |

**State values**: `PENDING`, `IN_PROGRESS`, `COMPLETED`
**Result values** (when completed): `SUCCESSFUL`, `FAILED`, `ERROR`, `STOPPED`

### Pipeline Step

| Field               | Type     | Description                  |
|---------------------|----------|------------------------------|
| uuid                | string   | Step UUID                    |
| name                | string   | Step name                    |
| state               | object   | `{name, result}` — status   |
| started_on          | datetime | Start timestamp              |
| completed_on        | datetime | Completion timestamp         |
| duration_in_seconds | integer  | Step duration                |
| links               | object   | Related URLs (log)           |

## Pagination Envelope

All list endpoints return:

| Field   | Type    | Description                          |
|---------|---------|--------------------------------------|
| values  | array   | Array of result items                |
| page    | integer | Current page number                  |
| pagelen | integer | Items per page                       |
| size    | integer | Total item count                     |
| next    | string  | URL for next page (absent on last)   |
