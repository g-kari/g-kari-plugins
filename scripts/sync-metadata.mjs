import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const write = (path, value) => {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
};
const catalog = json('.claude-plugin/marketplace.json');
const plugins = catalog.plugins.map(entry => {
  const folder = entry.source.replace(/^\.\//, '');
  const legacy = json(`${folder}/.claude-plugin/plugin.json`);
  entry.version = legacy.version;
  entry.description = legacy.description;
  const interfaceMetadata = {
    displayName: legacy.name,
    shortDescription: legacy.name,
    longDescription: legacy.description,
    developerName: legacy.author?.name ?? 'g-kari',
    category: 'Developer Tools'
  };
  // Claude hooks depend on Claude paths/tool names. Never discover them implicitly in Codex.
  const openai = { interface: interfaceMetadata, hooks: [] };
  const portable = {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    ...Object.fromEntries(['name', 'version', 'description', 'author', 'homepage', 'repository', 'license', 'keywords']
      .filter(key => legacy[key] !== undefined).map(key => [key, legacy[key]])),
    extensions: { 'com.openai': openai }
  };
  write(`${folder}/plugin.json`, portable);
  write(`${folder}/.codex-plugin/plugin.json`, {
    name: legacy.name, version: legacy.version, description: legacy.description,
    skills: './skills/', ...openai
  });
  return {
    name: legacy.name,
    source: { source: 'local', path: `./${folder}` },
    policy: { installation: 'AVAILABLE', authentication: 'ON_USE' },
    category: 'Developer Tools',
    interface: { displayName: legacy.name }
  };
});
write('.claude-plugin/marketplace.json', catalog);
write('.agents/plugins/marketplace.json', {
  name: catalog.name, interface: { displayName: 'g-kari plugins' }, plugins
});
