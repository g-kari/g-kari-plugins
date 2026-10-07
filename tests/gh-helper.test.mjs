import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const script = resolve('gh-fix-ci/skills/gh-fix-ci/scripts/inspect_pr_checks.py');
test('GitHub helper handles real failure/pending exit codes and never equates them with success', () => {
  const source = `
import importlib.util,json
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('ci',${JSON.stringify(script)})
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
for code, state in [(1,'FAILURE'),(8,'IN_PROGRESS')]:
 result=m.GhResult(code,json.dumps([{'name':'check','state':state}]),'')
 with patch.object(m,'run_gh_command',return_value=result):
  checks=m.fetch_checks('1',Path('.'))
 assert checks and checks[0]['state']==state,(code,checks)
assert m.is_failing({'bucket':'fail'})
assert not m.is_failing({'bucket':'pending'})
assert m.is_pending({'bucket':'pending'})
assert m.is_pending({'state':'IN_PROGRESS'})
assert m.is_pending({'state':'unknown'})
assert not m.is_pending({'state':'SUCCESS'})
assert not m.is_pending({'bucket':'pass'})
assert m.extract_run_id('https://buildkite.com/team/builds/123') is None
assert m.extract_run_id('https://buildkite.com/actions/runs/123') is None
assert m.extract_run_id('https://github.com/g-kari/repo/actions/runs/123/job/456')=='123'
print('offline helper regression checks passed')
`;
  const result = spawnSync('python3', ['-c', source], { encoding: 'utf8', timeout: 5000 });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
