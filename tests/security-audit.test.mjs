import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skill = resolve(root, 'security-audit/skills/security-audit');
const source = JSON.parse(readFileSync(resolve(root, 'upstream-lock.json'))).sources.find(item => item.name === 'security-audit');
test('Cloudflare runtime resources and MIT notice preserve pinned bytes', () => {
  const prefix = 'skills/security-audit/';
  const runtime = source.files.filter(file => file.source.startsWith(prefix));
  assert.deepEqual(readdirSync(skill).sort(), runtime.map(file => file.source.slice(prefix.length)).sort());
  for (const file of runtime) assert.deepEqual(readFileSync(resolve(skill, file.source.slice(prefix.length))), readFileSync(resolve(root, file.snapshot)), file.source);
  const license = source.files.find(file => file.source === 'LICENSE');
  assert.deepEqual(readFileSync(resolve(root, 'security-audit/LICENSE')), readFileSync(resolve(root, license.snapshot)));
});
test('packaged Cloudflare validators pass their upstream offline regressions', () => {
  const dir = mkdtempSync(join(tmpdir(), 'gkari-security-audit-'));
  try {
    const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', resolve(skill, 'validate-findings.test.cjs'), resolve(skill, 'validate-coverage-ledger.test.cjs')], {
      cwd: dir, env: { PATH: process.env.PATH, HOME: dir, TMPDIR: dir, LANG: 'C.UTF-8' }, encoding: 'utf8', timeout: 120_000, maxBuffer: 5 * 1024 * 1024,
    });
    assert.equal(result.error, undefined, String(result.error));
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /# fail 0/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
