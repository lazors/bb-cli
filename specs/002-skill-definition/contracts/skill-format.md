# Contract: Claude Code Skill File Format

**Date**: 2026-03-15
**Feature**: 002-skill-definition

## SKILL.md File Contract

The SKILL.md file MUST conform to this structure for Claude Code to recognize and load it as a skill.

### YAML Frontmatter (Required)

```yaml
---
name: <package-name>
description: <human-readable description of what the skill does and when to use it>
allowed-tools: Bash(<command-prefix>:*)
---
```

**Field constraints**:
- `name`: Must match the npm package name / skill directory name
- `description`: Should describe both capability and trigger conditions ("Use when...")
- `allowed-tools`: Must use `Bash(<prefix>:*)` format where `<prefix>` is the CLI binary name

### Markdown Body (Required)

The body MUST include:

1. **Title heading** (`# <Tool Name>`)
2. **Quick start section** — minimal command sequence to get started
3. **Commands section** — categorized command reference with code blocks
4. **Examples section** — multi-step workflow demonstrations

### For bitbucket-cli specifically

```yaml
---
name: bitbucket-cli
description: Interact with Bitbucket Cloud repositories, pull requests, comments, and pipelines. Use when the user needs to manage repos, review PRs, run pipelines, or automate Bitbucket workflows.
allowed-tools: Bash(bb:*)
---
```

### File Location

```
.claude/skills/bitbucket-cli/SKILL.md
```
