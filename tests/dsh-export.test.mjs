import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { exportDshSkills } from '../scripts/export-dsh-skills.mjs';

test('DSH export includes Cloudflare and OWASP skills as direct self-contained bundles', () => {
  const temp = mkdtempSync(join(tmpdir(), 'g-kari-dsh-export-'));
  try {
    const destination = join(temp, '.dsh', 'skills');
    const dryRun = exportDshSkills(destination, { dryRun: true });
    assert.equal(dryRun.length, 19);
    assert.equal(existsSync(destination), false);

    const entries = exportDshSkills(destination);
    assert.deepEqual(entries, dryRun);
    assert.equal(readdirSync(destination).length, 19);
    for (const { name } of entries) {
      const skillRoot = join(destination, name);
      const contents = readFileSync(join(skillRoot, 'SKILL.md'), 'utf8');
      assert.match(contents, new RegExp(`name: ${name}\\b`));
      assert.ok(existsSync(join(skillRoot, 'SOURCE.md')));
      assert.ok(existsSync(join(skillRoot, 'LICENSE')) || existsSync(join(skillRoot, 'LICENSE.md')));
    }
    assert.ok(existsSync(join(destination, 'security-audit', 'HUNTING.md')));
    assert.ok(existsSync(join(destination, 'code-review-security', 'plays', 'code-review-security.md')));
    assert.ok(existsSync(join(destination, 'agent-security-audit', 'templates', 'finding.md')));
    assert.ok(existsSync(join(destination, 'security-guidance', 'references', 'aisvs')));
    assert.ok(existsSync(join(destination, 'code-review-security', 'data', 'mastg')));
    assert.throws(() => exportDshSkills(destination), /would be overwritten/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('DSH export preserves existing unrelated skills and refuses collisions before writing', () => {
  const temp = mkdtempSync(join(tmpdir(), 'g-kari-dsh-existing-'));
  try {
    const destination = join(temp, 'skills');
    mkdirSync(join(destination, 'security-audit'), { recursive: true });
    const sentinel = join(destination, 'security-audit', 'SKILL.md');
    writeFileSync(sentinel, 'existing user skill');
    assert.throws(() => exportDshSkills(destination), /would be overwritten/);
    assert.equal(readFileSync(sentinel, 'utf8'), 'existing user skill');
    assert.deepEqual(readdirSync(destination), ['security-audit']);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
