# Tasks: Claude Code Skill Definition for Bitbucket CLI

**Input**: Design documents from `/specs/002-skill-definition/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the skill directory structure

- [x] T001 Create directory `.claude/skills/bitbucket-cli/` for the skill definition

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Write the SKILL.md file skeleton with frontmatter and structural sections

**Note**: This feature creates a single documentation file. The "foundational" phase establishes the file with valid YAML frontmatter and section headings, which all user stories then populate with content.

- [x] T002 Create `.claude/skills/bitbucket-cli/SKILL.md` with YAML frontmatter (`name: bitbucket-cli`, `description`, `allowed-tools: Bash(bb:*)`) and empty section headings (Quick Start, Commands, Global Options, Examples) — reference `.claude/skills/playwright-cli/SKILL.md` for structure

**Checkpoint**: SKILL.md exists with valid frontmatter — Claude Code can discover the skill (even if command sections are empty)

---

## Phase 3: User Story 1 — Install and Register bb as a Claude Code Skill (Priority: P1) MVP

**Goal**: SKILL.md has complete YAML frontmatter and global options so Claude Code recognizes `bb` as a skill and understands its invocation pattern.

**Independent Test**: Open Claude Code in this project and verify `bitbucket-cli` appears as an available skill with the correct name and description.

### Implementation for User Story 1

- [x] T003 [US1] Write the Quick Start section in `.claude/skills/bitbucket-cli/SKILL.md` — show `bb auth setup`, `bb auth status`, and a basic `bb repo list` / `bb pr list` sequence
- [x] T004 [US1] Write the Global Options section in `.claude/skills/bitbucket-cli/SKILL.md` — document `--json`, `-w, --workspace <slug>`, `-v, --verbose` with descriptions and defaults
- [x] T005 [US1] Write the Prerequisites/Setup section in `.claude/skills/bitbucket-cli/SKILL.md` — explain app password creation, `bb auth setup` usage, environment variables (`BITBUCKET_USERNAME`, `BITBUCKET_APP_PASSWORD`, `BITBUCKET_ACCESS_TOKEN`), and workspace configuration

**Checkpoint**: SKILL.md has frontmatter + quick start + global options + setup instructions. Claude Code can recognize and invoke `bb` commands.

---

## Phase 4: User Story 2 — Use bb Commands via Claude Code Skill (Priority: P1)

**Goal**: SKILL.md documents all 33 commands with complete syntax so Claude Code can construct and execute any `bb` command.

**Independent Test**: Ask Claude Code to perform any Bitbucket operation (e.g., "list PRs for my-repo") and verify it constructs the correct `bb` command with proper arguments and options.

### Implementation for User Story 2

- [x] T006 [P] [US2] Write the Authentication commands section in `.claude/skills/bitbucket-cli/SKILL.md` — document `bb auth setup` (options: `--username`, `--app-password`, `--access-token`, `-w`) and `bb auth status`
- [x] T007 [P] [US2] Write the Repository commands section in `.claude/skills/bitbucket-cli/SKILL.md` — document `bb repo list` (options: `--role`, `--sort`, `--limit`, `--page-size`) and `bb repo view <repo>`
- [x] T008 [P] [US2] Write the Pull Request commands section in `.claude/skills/bitbucket-cli/SKILL.md` — document all 16 PR commands: `list`, `view`, `create`, `update`, `approve`, `unapprove`, `request-changes`, `unrequest-changes`, `merge`, `decline`, `publish`, `draft`, `activity`, `diff`, `diffstat`, `commits`, `tasks` with all arguments and options
- [x] T009 [P] [US2] Write the PR Comment commands section in `.claude/skills/bitbucket-cli/SKILL.md` — document all 6 comment commands: `list`, `add`, `update`, `delete`, `resolve`, `reopen` with all arguments and options
- [x] T010 [P] [US2] Write the Pipeline commands section in `.claude/skills/bitbucket-cli/SKILL.md` — document all 7 pipeline commands: `list`, `run`, `view`, `stop`, `steps`, `step`, `logs` with all arguments and options

**Checkpoint**: All 33 commands documented with full syntax. Claude Code can construct any `bb` command from the SKILL.md reference.

---

## Phase 5: User Story 3 — Discover Available bb Commands (Priority: P2)

**Goal**: SKILL.md is organized with clear categories so developers can browse and discover what operations are available.

**Independent Test**: Ask Claude Code "what Bitbucket operations can you do?" and verify it returns a categorized list matching the SKILL.md structure.

### Implementation for User Story 3

- [x] T011 [US3] Review and ensure all command sections in `.claude/skills/bitbucket-cli/SKILL.md` have consistent formatting — each group has a clear heading, commands are in code blocks with descriptive comments, and the organization matches the 5-group structure (auth, repo, pr, pr comment, pipeline)

**Checkpoint**: Command reference is well-organized and browsable. Claude Code can present categorized command lists to users.

---

## Phase 6: User Story 4 — Configure Authentication for bb Skill (Priority: P2)

**Goal**: SKILL.md includes clear setup instructions so Claude Code can guide users through initial authentication configuration.

**Independent Test**: Follow the setup instructions with a fresh installation and verify that `bb` commands authenticate successfully.

### Implementation for User Story 4

- [x] T012 [US4] Review and expand the Prerequisites/Setup section in `.claude/skills/bitbucket-cli/SKILL.md` — ensure it covers: (1) creating a Bitbucket App Password with required permissions, (2) running `bb auth setup --username X --app-password Y`, (3) setting env vars as alternative, (4) verifying with `bb auth status`, (5) local installation fallback (`npx bb`)

**Checkpoint**: A developer can follow the setup section end-to-end to configure authentication.

---

## Phase 7: Workflow Examples (Priority: P2)

**Goal**: SKILL.md includes practical multi-command workflow examples showing common developer tasks.

### Implementation

- [x] T013 [P] Write the "Create and Submit a Pull Request" workflow example in `.claude/skills/bitbucket-cli/SKILL.md` — show `bb pr create`, adding reviewers, checking status
- [x] T014 [P] Write the "Review a Pull Request" workflow example in `.claude/skills/bitbucket-cli/SKILL.md` — show `bb pr view`, `bb pr diff`, `bb pr comment add`, `bb pr approve`/`bb pr request-changes`
- [x] T015 [P] Write the "Monitor and Debug Pipelines" workflow example in `.claude/skills/bitbucket-cli/SKILL.md` — show `bb pipeline list`, `bb pipeline view`, `bb pipeline steps`, `bb pipeline logs`

**Checkpoint**: All workflow examples are functional and demonstrate real multi-command sequences.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and consistency checks

- [x] T016 Validate all 33 commands are documented in `.claude/skills/bitbucket-cli/SKILL.md` by cross-referencing with `src/cli.ts` command registrations
- [x] T017 Verify YAML frontmatter parses correctly and matches the contract in `specs/002-skill-definition/contracts/skill-format.md`
- [x] T018 Verify SKILL.md structure matches the `playwright-cli` pattern at `.claude/skills/playwright-cli/SKILL.md` (frontmatter format, section organization, code block style)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (directory must exist)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (SKILL.md file must exist with frontmatter)
- **User Story 2 (Phase 4)**: Depends on Phase 2 — can run in parallel with Phase 3
- **User Story 3 (Phase 5)**: Depends on Phase 4 (commands must be documented to organize them)
- **User Story 4 (Phase 6)**: Depends on Phase 3 (setup section must exist to expand it)
- **Workflow Examples (Phase 7)**: Depends on Phase 4 (commands must be documented to reference in examples)
- **Polish (Phase 8)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependencies on other stories
- **US2 (P1)**: Can start after Foundational — no dependencies on other stories (parallel with US1)
- **US3 (P2)**: Depends on US2 (needs command sections to exist before organizing them)
- **US4 (P2)**: Depends on US1 (needs setup section to exist before expanding it)

### Within User Story 2

- T006, T007, T008, T009, T010 are all marked [P] — they write to different sections of the same file but are independent content blocks that can be authored in parallel

### Parallel Opportunities

- T006, T007, T008, T009, T010 (all command group sections) can be written in parallel
- T013, T014, T015 (workflow examples) can be written in parallel
- US1 and US2 can be worked on in parallel after Phase 2

---

## Parallel Example: User Story 2

```bash
# Launch all command section tasks together:
Task: "Write Authentication commands section in .claude/skills/bitbucket-cli/SKILL.md"
Task: "Write Repository commands section in .claude/skills/bitbucket-cli/SKILL.md"
Task: "Write Pull Request commands section in .claude/skills/bitbucket-cli/SKILL.md"
Task: "Write PR Comment commands section in .claude/skills/bitbucket-cli/SKILL.md"
Task: "Write Pipeline commands section in .claude/skills/bitbucket-cli/SKILL.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup (create directory)
2. Complete Phase 2: Foundational (create SKILL.md with frontmatter)
3. Complete Phase 3: User Story 1 (quick start, global options, setup)
4. Complete Phase 4: User Story 2 (all 33 commands documented)
5. **STOP and VALIDATE**: Claude Code recognizes `bb` skill and can construct commands
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → SKILL.md exists with valid frontmatter
2. Add US1 → Quick start + setup instructions → Claude Code can guide auth setup
3. Add US2 → All commands documented → Claude Code can execute any `bb` command (MVP!)
4. Add US3 → Commands well-organized → Discovery experience improved
5. Add US4 → Setup instructions expanded → First-time configuration is seamless
6. Add Examples → Workflow demonstrations → Multi-step operations are clear
7. Polish → Final validation → Everything cross-checked against implementation

---

## Notes

- All tasks write to a single file: `.claude/skills/bitbucket-cli/SKILL.md`
- [P] tasks write to independent sections within the file — no content conflicts
- This is a documentation-only feature — no source code changes, no tests
- Reference `.claude/skills/playwright-cli/SKILL.md` as the structural template throughout
- Cross-reference all command syntax against `src/commands/**/*.ts` for accuracy
- Commit after each phase checkpoint
