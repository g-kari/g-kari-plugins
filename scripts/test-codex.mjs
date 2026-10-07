import { spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = mkdtempSync(join(tmpdir(), 'gkari-codex-'));
const home = join(dir, 'home'); const codexHome = join(dir, 'codex');
mkdirSync(home); mkdirSync(codexHome);
const env = { ...process.env, HOME: home, USERPROFILE: home, CODEX_HOME: codexHome };
function run(args) {
  const result = spawnSync('codex', args, { cwd: dir, env, encoding: 'utf8', timeout: 20_000 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr + result.stdout);
  return result.stdout;
}
try {
  const version = run(['--version']).trim();
  const add = JSON.parse(run(['plugin', 'marketplace', 'add', root, '--json']));
  assert.equal(add.marketplaceName, 'g-kari-plugins');
  const catalog = JSON.parse(readFileSync(join(root, '.agents/plugins/marketplace.json'), 'utf8'));
  const listed = JSON.parse(run(['plugin', 'list', '--marketplace', catalog.name, '--available', '--json']));
  assert.deepEqual(listed.available.map(item => item.name).sort(), catalog.plugins.map(item => item.name).sort());
  for (const entry of catalog.plugins) {
    const installed = JSON.parse(run(['plugin', 'add', `${entry.name}@${catalog.name}`, '--json']));
    assert.equal(installed.name, entry.name);
    const manifest = JSON.parse(readFileSync(join(installed.installedPath, 'plugin.json'), 'utf8'));
    assert.equal(manifest.name, entry.name);
    assert.deepEqual(manifest.extensions['com.openai'].hooks, []);
    const skill = readFileSync(join(installed.installedPath, 'skills', entry.name === 'webauthn-front-design' ? 'front-design' : entry.name === 'rules-keeper' ? 'rules-audit' : entry.name === 'stop-notifier' ? 'setup-stop-notifier' : entry.name, 'SKILL.md'), 'utf8');
    assert.ok(/^---\n/.test(skill));
  }
  const final = JSON.parse(run(['plugin', 'list', '--marketplace', catalog.name, '--json']));
  assert.equal(final.installed.length, catalog.plugins.length);
  console.log(`${version}: discovered and installed ${catalog.plugins.length} plugins in isolated HOME/CODEX_HOME. No hooks executed.`);
} finally { rmSync(dir, { recursive: true, force: true }); }
