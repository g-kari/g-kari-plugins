import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, relative, dirname, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseDocument } from 'yaml';
const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function validatePlugins(root = defaultRoot) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  const read = path => readFileSync(resolve(root, path), 'utf8');
  const json = path => JSON.parse(read(path));
  const contained = (base, path) => {
    const rel = relative(base, resolve(base, path));
    return rel !== '..' && !rel.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`) && !isAbsolute(rel);
  };
  try {
    const claude = json('.claude-plugin/marketplace.json');
    const codex = json('.agents/plugins/marketplace.json');
    check(claude.name === codex.name, 'marketplace identity mismatch');
    const names = new Set();
    const skills = new Set();
    check(codex.plugins.length === claude.plugins.length, 'catalog plugin count mismatch');
    for (const entry of codex.plugins) {
      check(!names.has(entry.name), `duplicate plugin: ${entry.name}`); names.add(entry.name);
      check(entry.source.source === 'local', `${entry.name}: expected local source`);
      const validSource = entry.source.path.startsWith('./') && contained(root, entry.source.path);
      check(validSource, `${entry.name}: invalid source path`);
      if (!validSource) continue;
      check(entry.policy.installation === 'AVAILABLE' && ['ON_USE', 'ON_INSTALL'].includes(entry.policy.authentication), `${entry.name}: invalid policy`);
      check(Boolean(entry.category), `${entry.name}: missing category`);
      const folder = resolve(root, entry.source.path);
      const legacy = JSON.parse(readFileSync(resolve(folder, '.claude-plugin/plugin.json'), 'utf8'));
      const portable = JSON.parse(readFileSync(resolve(folder, 'plugin.json'), 'utf8'));
      const overlay = JSON.parse(readFileSync(resolve(folder, '.codex-plugin/plugin.json'), 'utf8'));
      const oldEntry = claude.plugins.find(item => item.name === entry.name);
      check(Boolean(oldEntry), `${entry.name}: absent from Claude catalog`);
      for (const manifest of [legacy, portable, overlay]) {
        check(manifest.name === entry.name, `${entry.name}: manifest identity mismatch`);
        check(manifest.version === oldEntry?.version, `${entry.name}: manifest version mismatch`);
        check(/^\d+\.\d+\.\d+$/.test(manifest.version), `${entry.name}: invalid version`);
      }
      check(portable.$schema === 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', `${entry.name}: missing portable schema`);
      check(!['skills', 'mcpServers', 'apps', 'interface'].some(key => key in portable), `${entry.name}: non-portable root field`);
      const ext = portable.extensions['com.openai'];
      check(ext.interface.shortDescription.length <= 30, `${entry.name}: subtitle too long`);
      check(JSON.stringify(ext) === JSON.stringify({ interface: overlay.interface, hooks: overlay.hooks }), `${entry.name}: overlay mismatch`);
      check(Array.isArray(ext.hooks) && ext.hooks.length === 0, `${entry.name}: Claude hooks enabled in Codex`);
      check(overlay.skills === './skills/', `${entry.name}: incorrect skill path`);
      const skillRoot = resolve(folder, 'skills');
      for (const name of readdirSync(skillRoot)) {
        const skillDir = resolve(skillRoot, name);
        const file = resolve(skillDir, 'SKILL.md');
        check(existsSync(file), `${entry.name}/${name}: missing SKILL.md`);
        if (!existsSync(file)) continue;
        const text = readFileSync(file, 'utf8');
        const fm = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
        check(Boolean(fm), `${entry.name}/${name}: missing frontmatter`);
        if (!fm) continue;
        const doc = parseDocument(fm[1], { uniqueKeys: true });
        check(doc.errors.length === 0, `${entry.name}/${name}: invalid YAML: ${doc.errors.join('; ')}`);
        const meta = doc.toJS();
        check(meta.name === name && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) && name.length <= 64, `${entry.name}/${name}: invalid name`);
        check(typeof meta.description === 'string' && meta.description.trim().length > 0 && meta.description.length <= 1024, `${entry.name}/${name}: invalid description`);
        check(!skills.has(name), `duplicate skill: ${name}`); skills.add(name);
        // Verify relative Markdown links in instructions and references without interpreting code examples.
        const sources = [file];
        const references = resolve(skillDir, 'references');
        if (existsSync(references)) sources.push(...readdirSync(references).filter(x => x.endsWith('.md')).map(x => resolve(references, x)));
        for (const source of sources) {
          const prose = readFileSync(source, 'utf8').replace(/```[\s\S]*?```/g, '');
          for (const match of prose.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
            const target = match[1].split('#')[0];
            if (!target || /^[a-z]+:/i.test(target) || target.startsWith('/')) continue;
            check(contained(folder, relative(folder, resolve(dirname(source), target))), `${name}: reference escapes plugin: ${target}`);
            check(existsSync(resolve(dirname(source), target)), `${name}: missing reference: ${target}`);
          }
        }
      }
    }
    if (existsSync(resolve(root, 'upstream-lock.json'))) {
      const lock = json('upstream-lock.json');
      for (const source of lock.sources) {
        check(/^[0-9a-f]{40}$/.test(source.commit), `${source.name}: invalid upstream commit`);
        for (const file of source.files) {
          const validSnapshot = contained(root, file.snapshot);
          check(validSnapshot, `${source.name}: invalid snapshot path`);
          if (!validSnapshot) continue;
          const hash = createHash('sha256').update(readFileSync(resolve(root, file.snapshot))).digest('hex');
          check(hash === file.sha256, `${source.name}: changed upstream snapshot: ${file.snapshot}`);
        }
      }
    }
    return { errors, plugins: names.size, skills: skills.size };
  } catch (error) { return { errors: [...errors, error.message], plugins: 0, skills: 0 }; }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validatePlugins();
  if (result.errors.length) { console.error(result.errors.join('\n')); process.exitCode = 1; }
  else console.log(`Validated ${result.plugins} plugins / ${result.skills} skills (Claude + Codex).`);
}
