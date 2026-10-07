import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
test('exact authenticated approval filter executes correctly after shell parsing', () => {
  const text = readFileSync('issue-handler/skills/issue-handler/SKILL.md', 'utf8');
  const snippet = /APPROVED=\$\([\s\S]*?\)\n\nif/.exec(text)?.[0].replace(/\n\nif$/, '');
  assert.ok(snippet, 'approval example missing');
  const comments = JSON.stringify([
    { user: { login: 'owner' }, body: ' \n/approve\t' },
    { user: { login: 'owner' }, body: 'Do not /approve this' },
    { user: { login: 'other' }, body: '/approve' },
    { user: { login: 'owner' }, body: '/approve-for-elsewhere' }
  ]);
  // gh's --jq receives the shell-decoded argument. Use jq to execute that same filter offline.
  const bash = `MY_LOGIN=owner\ngh() {\n  while [ "$#" -gt 0 ]; do\n    if [ "$1" = --jq ]; then shift; printf '%s' "$COMMENTS" | jq "$1"; return; fi\n    shift\n  done\n}\n${snippet}\nprintf '%s' "$APPROVED"\n`;
  const result = spawnSync('bash', ['-c', bash], { env: { ...process.env, COMMENTS: comments }, encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  assert.equal(result.stdout, '1');
});
