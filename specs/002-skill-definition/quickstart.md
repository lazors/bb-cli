# Quickstart: Claude Code Skill Definition for Bitbucket CLI

**Date**: 2026-03-15
**Feature**: 002-skill-definition

## What to Build

A single file: `.claude/skills/bitbucket-cli/SKILL.md`

## Steps

1. **Create the SKILL.md file** at `.claude/skills/bitbucket-cli/SKILL.md` with:
   - YAML frontmatter: `name: bitbucket-cli`, `description: ...`, `allowed-tools: Bash(bb:*)`
   - Quick start section showing auth setup + basic commands
   - Categorized command reference (auth, repo, pr, pr comment, pipeline)
   - Global options section (`--json`, `--workspace`, `--verbose`)
   - Workflow examples (create PR, review PR, check pipelines)

2. **Validate** the file by:
   - Checking all 33 commands are documented with correct syntax
   - Verifying YAML frontmatter parses correctly
   - Confirming the file follows the same pattern as `.claude/skills/playwright-cli/SKILL.md`

## Reference

Use `.claude/skills/playwright-cli/SKILL.md` as the structural template. Key differences:
- Command prefix: `bb` (not `playwright-cli`)
- Command groups: auth, repo, pr, pr comment, pipeline
- No `references/` sub-directory needed (all content fits in one file)

## Verification

After creating the file, Claude Code should list `bitbucket-cli` as an available skill when opened in this project.
