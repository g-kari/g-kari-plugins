import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseDocument, stringify } from 'yaml';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = resolve(root, 'node_modules/.bin/ast-grep');
function run(args, input = '', cwd = root) { return spawnSync(cli, args, { input, cwd, encoding: 'utf8', timeout: 15_000 }); }
function fixture(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'gkari-ast-'));
  try { fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
}
const refs = resolve(root, 'ast-grep-practice/skills/ast-grep-practice/references');
function rules() {
  const result = [];
  for (const name of readdirSync(refs).filter(name => name.endsWith('.md'))) {
    const text = readFileSync(join(refs, name), 'utf8');
    for (const match of text.matchAll(/```yaml\n([\s\S]*?)```/g)) {
      const doc = parseDocument(match[1], { uniqueKeys: true });
      assert.deepEqual(doc.errors, [], `${name}: ${doc.errors.join('; ')}`);
      const rule = doc.toJS();
      if (rule?.id && rule?.language && rule?.rule) result.push({ name, rule });
    }
  }
  return result;
}
test('official local ast-grep version is pinned', () => {
  const result = run(['--version']); assert.equal(result.status, 0); assert.equal(result.stdout.trim(), 'ast-grep 0.45.3');
});
test('structural TypeScript search excludes matching strings and preserves input', () => fixture(dir => {
  const code = "const text = 'oldFunc(1)';\noldFunc (1, 2);\notherFunc(3);\n";
  const file = join(dir, 'sample.ts'); writeFileSync(file, code);
  const result = run(['run', '-p', 'oldFunc($$$ARGS)', '-r', 'newFunc($$$ARGS)', '-l', 'typescript', '--json=compact', file]);
  assert.equal(result.status, 0, result.stderr);
  const matches = JSON.parse(result.stdout); assert.equal(matches.length, 1); assert.equal(matches[0].replacement, 'newFunc(1, 2)');
  assert.equal(readFileSync(file, 'utf8'), code, 'preview must not mutate the file');
}));
test('all complete adapted ast-grep YAML examples parse and compile', () => fixture(dir => {
  let count = 0;
  for (const { name, rule } of rules()) {
    // The context example intentionally refers to a separately defined utility.
    const utils = { 'is-async-function': { regex: '^async\\b', any: [{ kind: 'function_declaration' }, { kind: 'arrow_function' }] } };
    const spec = rule.id === 'async-no-try-catch' ? { ...rule, utils } : rule;
    const path = join(dir, `rule-${count++}.yml`); writeFileSync(path, stringify(spec));
    const result = run(['scan', '--rule', path, '--stdin', '--json=compact'], '', dir);
    assert.equal(result.status, 0, `${name}/${rule.id}: ${result.stderr}`);
  }
  assert.ok(count >= 10, `insufficient examples: ${count}`);
}));
test('async utility distinguishes async and sync functions', () => fixture(dir => {
  const rule = rules().find(item => item.rule.id === 'is-async-function').rule;
  const file = join(dir, 'async.yml'); writeFileSync(file, stringify(rule));
  const result = run(['scan', '--rule', file, '--stdin', '--json=compact'], 'async function yes() {}\nfunction no() {}\nconst f = async () => 1;\nconst g = () => 2;', dir);
  assert.equal(result.status, 0, result.stderr); assert.equal(JSON.parse(result.stdout).length, 2);
}));
test('Go blank-identifier rule retains both structural conditions', () => fixture(dir => {
  const rule = rules().find(item => item.rule.id === 'no-ignored-error').rule;
  const file = join(dir, 'go.yml'); writeFileSync(file, stringify({ ...rule, severity: 'warning' }));
  const result = run(['scan', '--rule', file, '--stdin', '--json=compact'], 'package main\nfunc f() { _, err := call(); value, err := call(); _, value := 1, 2 }', dir);
  assert.equal(result.status, 0, result.stderr); assert.equal(JSON.parse(result.stdout).length, 1);
}));
test('severity override takes rule IDs and JSON flags are current', () => fixture(dir => {
  const file = join(dir, 'rule.yml'); writeFileSync(file, 'id: no-console-log\nlanguage: TypeScript\nseverity: warning\nrule:\n  pattern: console.log($$$ARGS)\nmessage: Debug call\n');
  const base = ['scan', '--rule', file, '--stdin', '--json=compact'];
  assert.equal(run(base, 'console.log(1)', dir).status, 0);
  assert.equal(run([...base, '--error=no-console-log'], 'console.log(1)', dir).status, 1);
  assert.equal(run([...base, '--error=warning'], 'console.log(1)', dir).status, 0, 'warning is not a matching rule ID');
}));
test('classification and rewrite snapshots run in an isolated project', () => fixture(dir => {
  mkdirSync(join(dir, 'rules')); mkdirSync(join(dir, 'rule-tests'));
  writeFileSync(join(dir, 'sgconfig.yml'), 'ruleDirs: [rules]\ntestConfigs:\n  - testDir: rule-tests\n');
  writeFileSync(join(dir, 'rules/migrate.yml'), 'id: migrate-api\nlanguage: TypeScript\nrule:\n  pattern: oldFunc($$$ARGS)\nfix: newFunc($$$ARGS)\n');
  writeFileSync(join(dir, 'rule-tests/migrate.yml'), "id: migrate-api\nvalid:\n  - newFunc(1)\n  - \"const text = 'oldFunc(1)'\"\ninvalid:\n  - oldFunc(1)\n  - oldFunc(1, 2)\n");
  const classification = run(['test', '--skip-snapshot-tests'], '', dir); assert.equal(classification.status, 0, classification.stderr + classification.stdout);
  assert.match(classification.stdout, /1 passed/, 'registered rule tests must actually run');
  const snapshots = run(['test', '-U'], '', dir); assert.equal(snapshots.status, 0, snapshots.stderr + snapshots.stdout);
  const replay = run(['test'], '', dir); assert.equal(replay.status, 0, replay.stderr + replay.stdout);
  const snapshot = readFileSync(join(dir, 'rule-tests/__snapshots__/migrate-api-snapshot.yml'), 'utf8');
  assert.ok(snapshot.includes('newFunc(1)')); assert.ok(snapshot.includes('newFunc(1, 2)'));
  const rulePath = join(dir, 'rules/migrate.yml');
  writeFileSync(rulePath, readFileSync(rulePath, 'utf8').replace('fix: newFunc', 'fix: WRONG'));
  assert.equal(run(['test', '--skip-snapshot-tests'], '', dir).status, 0);
  assert.notEqual(run(['test'], '', dir).status, 0, 'snapshot replay must catch a wrong rewrite');
  rmSync(rulePath);
  const skipped = run(['test'], '', dir);
  assert.equal(skipped.status, 0);
  assert.match(skipped.stdout + skipped.stderr, /Configuration not found!|0 passed; 0 failed/, 'missing rule must be rejected by the output guard');
}));
test('callee-only rewrite retains generic/optional arguments and non-call references', () => fixture(dir => {
  const rule = rules().find(item => item.rule.id === 'migrate-client-callee').rule;
  const file = join(dir, 'callee.yml'); writeFileSync(file, stringify(rule));
  const code = 'oldClient.fetch<Item>( /* keep */ first, ...rest );\noldClient.fetch?.( second );\nconst reference = oldClient.fetch;\n';
  const input = join(dir, 'calls.ts'); writeFileSync(input, code);
  const preview = run(['scan', '--rule', file, '--json=compact', input], '', dir);
  assert.equal(preview.status, 0, preview.stderr); assert.equal(JSON.parse(preview.stdout).length, 2);
  assert.equal(readFileSync(input, 'utf8'), code);
  const apply = run(['scan', '--rule', file, '--update-all', input], '', dir); assert.equal(apply.status, 0, apply.stderr);
  const expected = 'newClient.request<Item>( /* keep */ first, ...rest );\nnewClient.request?.( second );\nconst reference = oldClient.fetch;\n';
  assert.equal(readFileSync(input, 'utf8'), expected);
}));
