---
name: "gh-fix-ci"
description: "Use when GitHub Actions PR checks are failing on a pull request and need to be diagnosed or fixed. Inspects checks / logs via `gh`, drafts a fix plan, and implements only after explicit approval. Trigger on red checks, failing workflow runs, `pr is failing CI` reports — even if the user does not name a specific check. Out of scope: external CI (e.g. Buildkite) — report only the details URL."
---


## Host compatibility and scope

Use the authenticated `gh` CLI or connected GitHub read tools. Do not create credentials or expand scopes to inspect CI; report the exact missing access instead. The optional plan skill is not required: write a concise plan inline when absent. Diagnosis alone does not authorize edits, pushes, merging, deployment, workflow reruns or external messages. If the user explicitly requested a fix, carry out the approved scope without asking again unless permissions require it.

The adapted helper returns exit 0 only for listed completed-success/skipped/neutral checks, exit 1 for failures, and exit 2 for pending/unknown/no checks. Even exit 0 does not prove all required checks are present. Check the current PR head's checks and workflow runs again. After an authorized fix/push, verify the expected remote commit and relevant CI until it passes or a blocker needs the user. Verify required checks for the exact commit before reporting green CI.

# Gh Pr Checks Plan Fix

## Overview

Use gh to locate failing PR checks, fetch GitHub Actions logs for actionable failures, summarize the failure snippet, then propose a fix plan and implement after explicit approval.
- If a plan-oriented skill (for example `create-plan`) is available, use it; otherwise draft a concise plan inline and request approval before implementing.

Prereq: use existing authorized GitHub access; `gh auth status` checks the CLI without changing access.

## Inputs

- `repo`: path inside the repo (default `.`)
- `pr`: PR number or URL (optional; defaults to current branch PR)
- `gh` authentication for the repo host

## Quick start

- `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "<number-or-url>"`
- Add `--json` if you want machine-friendly output for summarization.

## Workflow

1. Verify gh authentication.
   - Run `gh auth status` in the repo.
   - If unauthenticated, use a connected GitHub reader if available; otherwise report the missing authentication without creating or expanding persistent access.
2. Resolve the PR.
   - Prefer the current branch PR: `gh pr view --json number,url`.
   - If the user provides a PR number or URL, use that directly.
3. Inspect failing checks (GitHub Actions only).
   - Preferred: run the bundled script (handles gh field drift and job-log fallbacks):
     - `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "<number-or-url>"`
     - Add `--json` for machine-friendly output.
   - Manual fallback:
     - `gh pr checks <pr> --json name,state,bucket,link,startedAt,completedAt,workflow`
       - If a field is rejected, rerun with the available fields reported by `gh`.
     - For each failing check, extract the run id from `detailsUrl` and run:
       - `gh run view <run_id> --json name,workflowName,conclusion,status,url,event,headBranch,headSha`
       - `gh run view <run_id> --log`
     - If the run log says it is still in progress, fetch job logs directly:
       - `gh api "/repos/<owner>/<repo>/actions/jobs/<job_id>/logs" > "<path>"`
4. Scope non-GitHub Actions checks.
   - If `detailsUrl` is not a GitHub Actions run, label it as external and only report the URL.
   - Do not attempt Buildkite or other providers; keep the workflow lean.
5. Summarize failures for the user.
   - Provide the failing check name, run URL (if any), and a concise log snippet.
   - Call out missing logs explicitly.
6. Create a plan.
   - Use an available plan skill or draft a concise plan inline. Ask for edit approval only if not already granted.
7. Implement after approval.
   - Apply the approved plan, summarize diffs/tests, and ask about opening a PR.
8. Recheck status.
   - Run relevant tests after authorized changes. Inspect checks for the exact current PR head; distinguish passed, pending, failing and unavailable.

## Bundled Resources

### scripts/inspect_pr_checks.py

Fetch failing PR checks, pull GitHub Actions logs, and extract a failure snippet. Exits non-zero when failures remain so it can be used in automation.

Usage examples:
- `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "123"`
- `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --pr "https://github.com/org/repo/pull/123" --json`
- `python "<path-to-skill>/scripts/inspect_pr_checks.py" --repo "." --max-lines 200 --context 40`
