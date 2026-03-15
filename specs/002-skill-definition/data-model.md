# Data Model: Claude Code Skill Definition for Bitbucket CLI

**Date**: 2026-03-15
**Feature**: 002-skill-definition

## Overview

This feature produces a documentation artifact (SKILL.md), not a runtime data model. The "entities" below describe the structure of the skill file itself.

## Entities

### Skill Metadata (YAML Frontmatter)

| Field         | Type   | Required | Description                                              |
|---------------|--------|----------|----------------------------------------------------------|
| name          | string | Yes      | Skill identifier: `bitbucket-cli`                        |
| description   | string | Yes      | What the skill does and when to use it                   |
| allowed-tools | string | Yes      | Permission grant: `Bash(bb:*)`                           |

### Command Entry

Each command is documented with:

| Attribute   | Description                                          |
|-------------|------------------------------------------------------|
| Syntax      | Full command with arguments and options in code block |
| Arguments   | Required positional parameters (e.g., `<repo>`)      |
| Options     | Named flags with defaults (e.g., `--state <state>`)  |

### Command Groups

| Group       | Command Count | Parent Command |
|-------------|---------------|----------------|
| auth        | 2             | `bb auth`      |
| repo        | 2             | `bb repo`      |
| pr          | 16            | `bb pr`        |
| pr comment  | 6             | `bb pr comment` |
| pipeline    | 7             | `bb pipeline`  |
| **Total**   | **33**        |                |

*Note: Plus `--json`, `--workspace`, `--verbose` global options documented separately.*

### Global Options

| Flag                    | Type    | Default | Description                        |
|-------------------------|---------|--------|------------------------------------|
| `--json`                | boolean | false  | Output in JSON format              |
| `-w, --workspace <slug>` | string  | config | Override default workspace         |
| `-v, --verbose`         | boolean | false  | Show HTTP request/response details |

## Relationships

```
SKILL.md
├── Frontmatter (metadata)
├── Quick Start (setup + basic examples)
├── Global Options (applies to all commands)
├── Command Groups
│   ├── Auth (2 commands)
│   ├── Repo (2 commands)
│   ├── PR (16 commands)
│   │   └── Comment (6 commands, nested under PR)
│   └── Pipeline (7 commands)
└── Workflow Examples (multi-command sequences)
```

## State Transitions

Not applicable — SKILL.md is a static documentation file with no runtime state.
