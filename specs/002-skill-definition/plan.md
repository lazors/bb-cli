# Implementation Plan: Claude Code Skill Definition for Bitbucket CLI

**Branch**: `002-skill-definition` | **Date**: 2026-03-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-skill-definition/spec.md`

## Summary

Create a `SKILL.md` file at `.claude/skills/bitbucket-cli/SKILL.md` that registers the `bb` CLI as a Claude Code skill. The file follows the established `playwright-cli` skill pattern: YAML frontmatter (name, description, allowed-tools) followed by categorized command reference covering all 33 commands, global options, setup instructions, and workflow examples.

## Technical Context

**Language/Version**: Markdown (YAML frontmatter)
**Primary Dependencies**: None (documentation artifact only)
**Storage**: N/A
**Testing**: Manual validation — verify Claude Code recognizes the skill; verify command syntax matches CLI implementation
**Target Platform**: Claude Code (skill loading system)
**Project Type**: CLI tool skill definition (documentation)
**Performance Goals**: N/A
**Constraints**: Must follow the exact YAML frontmatter format that Claude Code expects; must match `playwright-cli` skill structure
**Scale/Scope**: Single file (SKILL.md) documenting 33 commands across 5 groups

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution file exists (`/.specify/memory/constitution.md` not found). Gate passes by default — no constraints to evaluate.

## Project Structure

### Documentation (this feature)

```text
specs/002-skill-definition/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (skill file format contract)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
.claude/skills/bitbucket-cli/
└── SKILL.md             # The deliverable — skill definition file
```

**Structure Decision**: This feature creates a single documentation file in the existing `.claude/skills/` directory, following the same directory convention as the already-installed `playwright-cli` skill at `.claude/skills/playwright-cli/SKILL.md`. No source code changes are needed.

## Complexity Tracking

No constitution violations — table not applicable.
