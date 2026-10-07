# ast-grep テストリファレンス

SKILL.md「テスト」節の詳細。

## 2 系統のテスト

| 種類 | コマンド | 何を検証 |
|---|---|---|
| 分類テスト | `ast-grep test --skip-snapshot-tests` | `valid` / `invalid` の分類が正しいか（ルール検出の正否） |
| スナップショットテスト | `ast-grep test` / `ast-grep test -U` | invalid コードへのマッチ位置・fix 適用結果が固定されているか（回帰検出） |

**CI**: レビュー済み snapshot を commit し、`ast-grep test` で分類と fix 結果を再検証する。差分は失敗として止め、人がレビューする。分類だけでは誤った rewrite を検出できない。

**ローカル開発**: `-U` でスナップショット生成・更新、人の目で diff レビュー、commit。

## テストファイル形式

```yaml
# rule-tests/my-rule-test.yml
id: my-rule               # rules/*.yml の id と一致
valid:
  - "valid code 1"
  - "valid code 2"
invalid:
  - "invalid code 1"
  - "invalid code 2"
```

ファイル名は任意（慣例は `{rule-id}-test.yml`）。

## 複数行コード記法

YAML ブロックスカラーで複数行を書ける:

```yaml
id: async-no-try-catch
valid:
  - |
    async function good() {
      try {
        await doWork();
      } catch (e) {
        handle(e);
      }
    }
invalid:
  - |
    async function bad() {
      await doWork();
      return 42;
    }
```

`|`（literal block scalar）はインデントを保持、末尾改行あり。`|-` は末尾改行なし。複雑な `inside:` / `has:` 検証で関数全体を書きたいときに使う。

## テスト結果の記号

- `.` — パス（期待通り）
- `N` — **ノイジー** (false positive — valid コードにマッチしてしまった)
- `M` — **ミッシング** (false negative — invalid コードにマッチしなかった)

N / M が出たらルール or テストを修正する。

## スナップショット運用

### 初回生成

```bash
ast-grep test -U
```

`rule-tests/__snapshots__/` 配下に YAML ファイルが作られる。invalid コードとマッチ位置、fix 結果が記録される。

### 更新の扱い

ルール変更後、スナップショット差分が出る:
- 意図通りの変更 → `-U` で再生成 → diff 確認 → commit
- 意図しない変更 → ルールを見直す

`--interactive` で対話的に 1 件ずつ承認/拒否できる:

```bash
ast-grep test --interactive
```

### スナップショットを commit する理由

- ルールの意図を明文化する（「このコードはこのルールで検出される」の記録）
- 回帰検出（ルール編集でマッチ範囲が変わったときに気付ける）
- レビュー可能にする（snapshot diff がルールの振る舞い変化を可視化）

### CI でのスナップショット扱い

- `ast-grep test` で commit 済み snapshot を再検証し、差分があれば失敗として止める
- `-U` を CI で走らせない（生成されても commit されない、意味がない）
- snapshot の更新はローカルで差分をレビューしてから commit する

## テスト駆動フロー

1. **Red**: valid / invalid と同じ id を持つルールを登録し、TypeScript なら `rule: { kind: call_expression, regex: "a^" }`（他言語は実在 kind）のような意図的に一致しない stub で分類テストを実行する。invalid が検出されず失敗することを確認する。ルールファイルを省略すると未登録として skip され、0 件でも exit 0 になり得る。
2. **Green**: `rules/foo.yml` にルールを書く → `ast-grep test --skip-snapshot-tests` がパス
3. **Snapshot**: `ast-grep test -U` でスナップショット生成、内容レビュー
4. **Commit**: ルール / テスト / スナップショットを一緒に commit
5. **CI**: 分類 + snapshot の再検証と scan（`cli.md` 参照）

## よくある落とし穴

- **id 不一致**: `rule-tests/` の `id` と `rules/` の `id` が一致しない → テストが認識されない。`Configuration not found!` または実行0件は CI で失敗として扱う
- **YAML インデント**: ブロックスカラー `|` のインデントは一貫させる（Tab 混在 NG）
- **シングル / ダブルクォート**: 文字列内に `'` / `"` / `:` が含まれる場合はクォート選択に注意。迷ったらブロックスカラーにする
- **valid の不足**: edge ケース（似て非なるもの）を valid に入れないと誤検出に気付けない。`new Set(arr).size` を禁止したいルールなら、valid に `arr.size`（Set 以外のオブジェクトの size）や `Array.from(arr).length`（Set なし）を明示的に入れる

## 未登録・実行0件を CI で通さない

ast-grep 0.45.3 は未登録 rule ID や実行0件を exit 0 として報告する場合がある。rule-test ID の登録を事前に照合し、出力も確認する。Node/CLI のバージョン更新時は出力形式を再検証する。Bash の例（既存 packageManager の実行コマンドに合わせる）:

```bash
output=$(npx --no-install ast-grep test 2>&1) || { printf '%s\n' "$output"; exit 1; }
printf '%s\n' "$output"
if printf '%s\n' "$output" | grep -Eq 'Configuration not found!|0 passed; 0 failed'; then
  echo 'Missing rule registration or zero executed tests' >&2
  exit 1
fi
```

snapshot は登録されたルールの結果を固定するもの。未登録ルールが skip された場合の保証にはならない。
