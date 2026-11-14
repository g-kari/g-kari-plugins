#!/usr/bin/env node
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const selectedPlugins = ['security-audit', 'owasp-code-security', 'owasp-ai-security'];
const sharedDirectories = ['plays', 'templates', 'agents', 'data'];

function usage() {
  return 'Usage: npm run export:dsh -- --output /path/to/project/.dsh/skills [--dry-run]';
}

function assertRegularTree(directory) {
  for (const entry of readdirSync(directory)) {
    const pathname = join(directory, entry);
    const stat = lstatSync(pathname);
    if (stat.isSymbolicLink()) throw new Error(`Refusing source symlink: ${pathname}`);
    if (stat.isDirectory()) assertRegularTree(pathname);
    else if (!stat.isFile()) throw new Error(`Unsupported source entry: ${pathname}`);
  }
}

export function exportDshSkills(output, { dryRun = false } = {}) {
  if (typeof output !== 'string' || !output.trim()) throw new Error(usage());
  const destination = resolve(output);
  const bundles = [];
  const seen = new Set();

  // Preflight all source and target paths before creating any files.
  for (const plugin of selectedPlugins) {
    const root = join(repositoryRoot, plugin);
    const skillsRoot = join(root, 'skills');
    const insidePlugin = relative(root, destination);
    if (!insidePlugin.startsWith('..') && !insidePlugin.startsWith('/') && insidePlugin !== '..') {
      throw new Error(`Output must be outside source plugin: ${root}`);
    }
    const metadata = JSON.parse(readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8'));
    assertRegularTree(skillsRoot);
    for (const resource of sharedDirectories) {
      if (existsSync(join(root, resource))) assertRegularTree(join(root, resource));
    }
    for (const name of readdirSync(skillsRoot).sort()) {
      const skill = join(skillsRoot, name);
      if (!lstatSync(skill).isDirectory() || !existsSync(join(skill, 'SKILL.md'))) {
        throw new Error(`Invalid skill bundle: ${skill}`);
      }
      if (seen.has(name)) throw new Error(`Duplicate skill: ${name}`);
      seen.add(name);
      const target = join(destination, name);
      if (existsSync(target)) throw new Error(`Existing skill would be overwritten: ${target}`);
      bundles.push({ name, plugin, skill, root, metadata, target });
    }
  }

  if (dryRun) return bundles.map(({ plugin, name }) => ({ plugin, name }));
  mkdirSync(destination, { recursive: true });
  for (const { plugin, name, skill, root, metadata, target } of bundles) {
    cpSync(skill, target, { recursive: true, errorOnExist: true, force: false });
    for (const resource of sharedDirectories) {
      const source = join(root, resource);
      if (existsSync(source)) cpSync(source, join(target, resource), { recursive: true, errorOnExist: true, force: false });
    }
    const license = existsSync(join(root, 'LICENSE.md')) ? 'LICENSE.md' : 'LICENSE';
    cpSync(join(root, license), join(target, license));
    writeFileSync(join(target, 'SOURCE.md'), [
      `# ${name}`,
      '',
      `Managed by g-kari-plugins (${plugin}).`,
      `Upstream: ${metadata.homepage}`,
      `License: ${metadata.license}`,
      'See the g-kari-plugins upstream-lock.json for pinned provenance.',
      '',
    ].join('\n'));
  }
  return bundles.map(({ plugin, name }) => ({ plugin, name }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const arguments_ = process.argv.slice(2);
    const outputIndex = arguments_.indexOf('--output');
    const allowed = arguments_.filter(arg => arg !== '--dry-run' && arg !== '--output');
    if (outputIndex === -1 || !arguments_[outputIndex + 1] || allowed.length !== 1 || allowed[0] !== arguments_[outputIndex + 1]) {
      throw new Error(usage());
    }
    const entries = exportDshSkills(arguments_[outputIndex + 1], { dryRun: arguments_.includes('--dry-run') });
    console.log(`${arguments_.includes('--dry-run') ? 'Ready to export' : 'Exported'} ${entries.length} DSH skills: ${entries.map(entry => entry.name).join(', ')}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
