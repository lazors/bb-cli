# Feature Specification: Claude Code Skill Definition for Bitbucket CLI

**Feature Branch**: `002-skill-definition`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "I want to use in future bitbucket-cli like npm package although it will require some config. But The idea is to use it as skill the same way as it being used playwright-cli. I installed it here for reference. Check and lets implement the same structure for .md file with SKILL.md having all commands."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install and Register bb as a Claude Code Skill (Priority: P1)

A developer installs the `bitbucket-cli` npm package (globally or locally) and wants Claude Code to recognize it as an available skill. After installation, the `bb` command is available as a Claude Code skill that can be invoked from conversations — similar to how `playwright-cli` works after installation.

**Why this priority**: Without skill registration, Claude Code has no awareness of the `bb` tool. This is the foundational requirement that enables all other stories.

**Independent Test**: Can be tested by installing the package and verifying Claude Code lists `bitbucket-cli` as an available skill with the correct name, description, and allowed tools.

**Acceptance Scenarios**:

1. **Given** a developer has installed `bitbucket-cli` as an npm package, **When** they open Claude Code in a project where it is available, **Then** Claude Code recognizes `bb` as an available skill with the name and description from SKILL.md.
2. **Given** the SKILL.md file exists in the correct location within the package, **When** Claude Code loads skills, **Then** the skill metadata (name, description, allowed-tools) is correctly parsed and registered.

---

### User Story 2 - Use bb Commands via Claude Code Skill (Priority: P1)

A developer working in Claude Code asks the AI to perform Bitbucket operations (e.g., "list my PRs", "create a PR", "check pipeline status"). Claude Code recognizes these as `bb` skill tasks and executes the appropriate `bb` CLI commands, returning results to the developer.

**Why this priority**: This is the core value proposition — using natural language to interact with Bitbucket through Claude Code. Equal priority with Story 1 since both are required for the feature to deliver value.

**Independent Test**: Can be tested by invoking Claude Code with a Bitbucket-related request and verifying the correct `bb` command is constructed and executed.

**Acceptance Scenarios**:

1. **Given** the `bb` skill is registered and authentication is configured, **When** a developer asks Claude Code to "list open PRs for my-repo", **Then** Claude Code runs `bb pr list my-repo --json` and presents the results.
2. **Given** the SKILL.md documents all available commands with examples, **When** Claude Code needs to perform a Bitbucket operation, **Then** it can determine the correct command syntax from the skill documentation.
3. **Given** the `bb` skill is registered, **When** a developer asks for a Bitbucket operation and authentication is not configured, **Then** Claude Code guides the developer through `bb auth setup`.

---

### User Story 3 - Discover Available bb Commands (Priority: P2)

A developer wants to know what Bitbucket operations they can perform through Claude Code. The SKILL.md provides a comprehensive, categorized command reference that Claude Code can use to suggest available operations and provide usage guidance.

**Why this priority**: Discovery helps developers understand the full capability of the tool, but it is not blocking for basic usage — developers who know the commands can use them without browsing the reference.

**Independent Test**: Can be tested by asking Claude Code "what Bitbucket operations can you do?" and verifying it returns a comprehensive list derived from SKILL.md.

**Acceptance Scenarios**:

1. **Given** SKILL.md is loaded, **When** a developer asks what Bitbucket operations are available, **Then** Claude Code presents the categorized list of commands (auth, repo, pr, pr comment, pipeline).
2. **Given** SKILL.md includes usage examples, **When** a developer asks how to create a PR, **Then** Claude Code provides the correct syntax with option explanations derived from the skill documentation.

---

### User Story 4 - Configure Authentication for bb Skill (Priority: P2)

A developer needs to set up Bitbucket credentials before the skill can interact with the API. The skill documentation includes prerequisites and setup instructions so Claude Code can guide the developer through initial configuration.

**Why this priority**: Configuration is a one-time setup that must happen before commands work, but the instructions can be simple and referenced from the existing `bb auth setup` command.

**Independent Test**: Can be tested by following the setup instructions in SKILL.md with a fresh installation and verifying that subsequent commands authenticate successfully.

**Acceptance Scenarios**:

1. **Given** a fresh installation with no credentials configured, **When** a developer invokes the bb skill, **Then** the skill documentation includes a setup section that Claude Code uses to guide authentication.
2. **Given** credentials can be provided via environment variables (`BITBUCKET_USERNAME`, `BITBUCKET_APP_PASSWORD`), **When** these are set in the environment, **Then** `bb` commands work without requiring `bb auth setup`.

---

### Edge Cases

- What happens when `bb` is installed locally (not globally)? The skill should document fallback to `npx bb` or `node_modules/.bin/bb`.
- What happens when the workspace is not configured? Commands requiring a workspace should fail with a clear error message guiding the user to set one.
- What happens when the Bitbucket API is unreachable? Commands should fail gracefully with descriptive error messages.
- What happens when `--json` output is malformed or the API returns an unexpected response? The skill relies on `bb` error handling; SKILL.md should note that `--json` mode provides structured error output.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The package MUST include a `SKILL.md` file in `.claude/skills/bitbucket-cli/` that follows the Claude Code skill format (YAML frontmatter with `name`, `description`, and `allowed-tools` fields).
- **FR-002**: The SKILL.md MUST document all available `bb` commands organized by category: Authentication, Repositories, Pull Requests, PR Comments, and Pipelines.
- **FR-003**: Each command entry MUST include the full command syntax with all arguments and options.
- **FR-004**: The SKILL.md MUST include a quick-start section covering authentication setup and basic operations.
- **FR-005**: The SKILL.md MUST include practical examples showing common workflows (e.g., creating a PR, reviewing a PR, checking pipeline status).
- **FR-006**: The skill MUST declare `allowed-tools: Bash(bb:*)` in the frontmatter to permit Claude Code to execute `bb` commands.
- **FR-007**: The SKILL.md MUST document global options (`--json`, `--workspace`, `--verbose`) that apply to all commands.
- **FR-008**: The SKILL.md MUST include a prerequisites/setup section explaining authentication configuration methods (app passwords, OAuth2 tokens, environment variables).
- **FR-009**: The SKILL.md MUST document the `--json` flag as the recommended output mode for AI agent consumption, noting that all commands support it.
- **FR-010**: The `.claude/skills/bitbucket-cli/` directory MUST be committed to the repository. (Note: npm distribution configuration — e.g., `package.json` `files` field — is out of scope for this feature.)

### Key Entities

- **Skill Definition (SKILL.md)**: The markdown file with YAML frontmatter that Claude Code uses to register and understand the `bb` tool. Contains metadata, command reference, and usage examples.
- **Command Group**: A logical category of related commands (auth, repo, pr, pr comment, pipeline) used to organize the skill documentation.
- **Global Options**: CLI flags (`--json`, `--workspace`, `--verbose`) available on every command, documented once and referenced throughout.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: SKILL.md covers 100% of the `bb` CLI commands (33 commands across 5 groups) with complete argument and option documentation.
- **SC-002**: A developer can install the package and have Claude Code recognize the `bb` skill within a single setup step (install + auth configure).
- **SC-003**: Claude Code can correctly construct and execute any documented `bb` command based solely on the SKILL.md content, without needing external documentation.
- **SC-004**: The SKILL.md structure follows the same pattern as the established `playwright-cli` skill (YAML frontmatter, categorized commands, examples section) ensuring consistency across skills.
- **SC-005**: All examples in SKILL.md are functional — running them against a configured Bitbucket workspace produces the documented behavior.

## Assumptions

- The skill file structure follows the convention established by `playwright-cli`: a `SKILL.md` file in `.claude/skills/<package-name>/` with YAML frontmatter containing `name`, `description`, and `allowed-tools`.
- The `bb` binary name is used as the command prefix (matching the `program.name("bb")` in cli.ts).
- The SKILL.md is authored as part of this repository and shipped with the npm package — it is not auto-generated from Commander.js definitions.
- Claude Code's skill loading mechanism reads the SKILL.md from the installed package location automatically.
- The `--json` flag is the preferred output format when the skill is invoked by Claude Code, as it provides structured, parseable output.
- Authentication setup is a prerequisite documented in the skill file, not handled automatically by the skill registration.

## Scope Boundaries

### In Scope
- Creating the `SKILL.md` file with complete command reference
- Structuring the file to match the `playwright-cli` skill pattern
- Documenting all 33 commands with full syntax, arguments, options, and examples
- Including setup/prerequisites section for authentication
- Including practical workflow examples

### Out of Scope
- Modifying the `bb` CLI implementation itself
- Auto-generating SKILL.md from Commander.js definitions
- Creating reference sub-documents (unlike playwright-cli's `references/` directory — all content fits in a single SKILL.md)
- npm package publishing configuration (package.json `files` field adjustments are a separate concern)
- OAuth2 flow implementation or credential management changes
