# Research: Claude Code Skill Definition for Bitbucket CLI

**Date**: 2026-03-15
**Feature**: 002-skill-definition

## R1: Claude Code Skill File Format

**Decision**: Use YAML frontmatter with `name`, `description`, and `allowed-tools` fields, followed by markdown content.

**Rationale**: This is the established format used by the `playwright-cli` skill already installed in the project at `.claude/skills/playwright-cli/SKILL.md`. The frontmatter format is:

```yaml
---
name: bitbucket-cli
description: <skill description>
allowed-tools: Bash(bb:*)
---
```

**Alternatives considered**:
- JSON manifest + separate docs: More complex, not the established pattern
- Auto-generated from Commander.js: Would require build tooling; fragile coupling to implementation

## R2: Skill Directory Location

**Decision**: Place at `.claude/skills/bitbucket-cli/SKILL.md` within the repository.

**Rationale**: Matches the `playwright-cli` convention at `.claude/skills/playwright-cli/SKILL.md`. Claude Code discovers skills by scanning the `.claude/skills/` directory structure.

**Alternatives considered**:
- Root-level `SKILL.md`: Not the established convention
- Inside `src/`: Would mix documentation with source code

## R3: allowed-tools Declaration

**Decision**: Use `allowed-tools: Bash(bb:*)` to permit execution of any `bb` subcommand.

**Rationale**: The `playwright-cli` skill uses `allowed-tools: Bash(playwright-cli:*)` with the same wildcard pattern. The `bb` prefix matches the CLI's `program.name("bb")` in `src/cli.ts`. The wildcard allows Claude Code to run any `bb` subcommand (e.g., `bb pr list`, `bb pipeline run`) without enumerating each one.

**Alternatives considered**:
- Enumerating each command: `Bash(bb pr list:*), Bash(bb pr view:*)...` — too verbose, fragile if commands change
- No allowed-tools: Would require manual approval for every command execution

## R4: Command Documentation Structure

**Decision**: Organize commands into 5 category sections matching the CLI's command groups: Authentication, Repositories, Pull Requests (including Comments sub-section), and Pipelines. Use code blocks with full command syntax.

**Rationale**: Mirrors the `playwright-cli` approach of categorized code blocks. The CLI already groups commands this way in `src/cli.ts` (authCmd, repoCmd, prCmd, commentCmd, pipelineCmd).

**Alternatives considered**:
- Alphabetical flat list: Loses logical grouping, harder to navigate
- Separate files per group (like playwright-cli's `references/`): Overkill for 35 commands; single file is sufficient

## R5: Skill Description Text

**Decision**: Use description: "Interact with Bitbucket Cloud repositories, pull requests, comments, and pipelines. Use when the user needs to manage repos, review PRs, run pipelines, or automate Bitbucket workflows."

**Rationale**: Follows the `playwright-cli` pattern of stating what the tool does and when to use it. Mentions the key resource types (repos, PRs, comments, pipelines) so Claude Code can match user intent to this skill.

**Alternatives considered**:
- Short description ("Bitbucket CLI wrapper"): Too vague for Claude Code's skill matching
- Very long description with all commands listed: Frontmatter should be concise; detail goes in the body
