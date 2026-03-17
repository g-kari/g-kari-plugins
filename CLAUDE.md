# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code plugin marketplace repository. It hosts plugins that users install via `/plugin marketplace add g-kari/g-kari-plugins`.

## Structure

- `.claude-plugin/marketplace.json` — Marketplace catalog (lists all available plugins with sources)
- Each plugin lives in its own top-level directory (e.g., `copilot-review/`)
- Plugins use relative path sources from the marketplace root

## Adding a New Plugin

1. Create `<plugin-name>/.claude-plugin/plugin.json` with name, version, description
2. Add skills under `<plugin-name>/skills/<skill-name>/SKILL.md`, commands under `commands/`, or agents under `agents/`
3. Register the plugin in `.claude-plugin/marketplace.json` under the `plugins` array
4. Plugin names must be kebab-case

## Validation

```bash
claude plugin validate .
```

## Current Plugins

- **copilot-review** — Uses `gh copilot -- -p` to run parallel code reviews across 5 perspectives (bugs, security, error handling, performance, maintainability) via subagents
