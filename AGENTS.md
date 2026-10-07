# Repository guidance

This repository distributes the same skills to Claude Code and Codex. Preserve both host catalogs and each plugin's stable identity.

- Author a skill under `<plugin>/skills/<skill-name>/SKILL.md` with YAML `name` and `description`; keep conditional detail in references.
- `.claude-plugin/plugin.json` remains the per-plugin source for identity, version and metadata. Run `npm run sync:metadata` after changing it or the Claude catalog. This generates root portable manifests, Codex compatibility overlays and `.agents/plugins/marketplace.json`.
- Do not expose the existing Claude hook scripts to Codex automatically. The generated OpenAI extension explicitly has `hooks: []`. A hook port requires host-specific implementation and validation.
- Install validation tools with `npm ci --ignore-scripts`; run `npm run check` and `git diff --check`. Never substitute the system `sg` command for the local `ast-grep` binary.
- Imported skills have pinned, unmodified snapshots in `third_party/` and provenance in `upstream-lock.json`. Preserve licenses, compare from that pinned source, and retain the listed local adaptations. Do not overwrite adapted skills with upstream blindly.
- Tests use isolated temporary directories. Live GitHub mutations, external model calls, browser account actions and Windows notifications are outside the offline test suite.
