import test from 'node:test';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { validatePlugins } from '../scripts/validate-plugins.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function fixture(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'gkari-validate-'));
  try { cpSync(root, dir, { recursive: true, filter: path => !path.includes('node_modules') && !path.includes('/.git/') && !path.endsWith('/.git') }); fn(dir); }
  finally { rmSync(dir, { recursive: true, force: true }); }
}
test('both catalogs and skill packages are valid', () => assert.deepEqual(validatePlugins(root).errors, []));
test('missing required frontmatter is rejected', () => fixture(dir => {
  writeFileSync(join(dir, 'retrospective-codify/skills/retrospective-codify/SKILL.md'), '# Missing metadata\n');
  assert.ok(validatePlugins(dir).errors.some(error => error.includes('missing frontmatter')));
}));
test('catalog traversal cannot resolve outside marketplace', () => fixture(dir => {
  const path = join(dir, '.agents/plugins/marketplace.json');
  const catalog = JSON.parse(readFileSync(path)); catalog.plugins[0].source.path = './../escape';
  writeFileSync(path, JSON.stringify(catalog));
  assert.ok(validatePlugins(dir).errors.some(error => error.includes('invalid source path')));
}));
test('host-specific hooks must remain explicit', () => fixture(dir => {
  const path = join(dir, 'stop-notifier/plugin.json');
  const manifest = JSON.parse(readFileSync(path)); manifest.extensions['com.openai'].hooks = './hooks/hooks.json';
  writeFileSync(path, JSON.stringify(manifest));
  assert.ok(validatePlugins(dir).errors.some(error => error.includes('Claude hooks enabled in Codex')));
}));
test('generated metadata stays synchronized with source manifests', () => fixture(dir => {
  const catalogPath = '.agents/plugins/marketplace.json';
  const catalog = JSON.parse(readFileSync(join(dir, catalogPath), 'utf8'));
  const paths = [catalogPath, '.claude-plugin/marketplace.json', ...catalog.plugins.flatMap(item => [`${item.name}/plugin.json`, `${item.name}/.codex-plugin/plugin.json`])];
  const before = new Map(paths.map(path => [path, readFileSync(join(dir, path), 'utf8')]));
  const result = spawnSync(process.execPath, [join(dir, 'scripts/sync-metadata.mjs')], { cwd: dir, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  for (const path of paths) assert.equal(readFileSync(join(dir, path), 'utf8'), before.get(path), `${path}: regenerate metadata`);
}));
