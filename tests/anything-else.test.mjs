import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const json = path => JSON.parse(read(path));
const skill = read('anything-else/skills/anything-else/SKILL.md');

test('anything-else has synchronized portable, Codex and Claude identities', () => {
  const manifests = ['plugin.json', '.codex-plugin/plugin.json', '.claude-plugin/plugin.json']
    .map(path => json(`anything-else/${path}`));
  for (const manifest of manifests) {
    assert.equal(manifest.name, 'anything-else');
    assert.equal(manifest.version, '1.0.0');
  }
  assert.equal(manifests[1].skills, './skills/');
  assert.deepEqual(manifests[0].extensions['com.openai'].hooks, []);
  assert.deepEqual(manifests[1].hooks, []);
  assert.equal(manifests[2].hooks, undefined);
  assert.equal(existsSync(resolve(root, 'anything-else/hooks')), false);
});

test('both catalogs register anything-else exactly once at the shared directory', () => {
  const claude = json('.claude-plugin/marketplace.json').plugins.filter(item => item.name === 'anything-else');
  const codex = json('.agents/plugins/marketplace.json').plugins.filter(item => item.name === 'anything-else');
  assert.equal(claude.length, 1);
  assert.equal(codex.length, 1);
  assert.equal(claude[0].source, './anything-else');
  assert.deepEqual(codex[0].source, { source: 'local', path: './anything-else' });
  assert.equal(codex[0].policy.installation, 'AVAILABLE');
});

test('skill preserves the requested name, trigger description and three workflows', () => {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(skill);
  assert.ok(match);
  const doc = parseDocument(match[1], { uniqueKeys: true });
  assert.deepEqual(doc.errors, []);
  assert.deepEqual(doc.toJS(), {
    name: 'anything-else',
    description: 'セッションの終わりに、やり残したタスクや次にやるべきことを確認する時に使用する。'
  });
  for (const heading of ['## 1. 関連Issue・タスクの整理', '## 2. Issueの自動作成提案', '## 3. リファクタリング・テストの提案']) {
    assert.ok(skill.includes(heading), heading);
  }
});

test('instructions explicitly limit proposals, history access and repository changes', () => {
  for (const contract of [
    '初回の確認は読み取り専用',
    'この確認依頼だけでは実行しない',
    '隠れた会話ログや他セッションを探さず',
    '未追跡ファイルは最初に名前だけ',
    'ユーザーの未コミット変更を保持する',
    'open / closed 両方',
    '重複未確認',
    '未実施のテストを成功済みとして書かず',
    '確認できた範囲では追加のやり残しなし'
  ]) assert.ok(skill.includes(contract), contract);
});

test('Issue command example uses explicit destination and literal heredoc without executing it', () => {
  const reference = read('anything-else/skills/anything-else/references/issue-proposals.md');
  assert.ok(reference.includes("gh issue create --repo 'OWNER/REPO'"));
  assert.ok(reference.includes("<<'ANYTHING_ELSE_ISSUE'"));
  assert.ok(reference.includes('形式の例であり、実行しない'));
  assert.ok(reference.includes('本文の行と衝突しない区切り文字'));
  assert.ok(read('anything-else/evals.md').includes('モデル応答'));
});
