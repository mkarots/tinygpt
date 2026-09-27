import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const layoutPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'layout.tsx');

describe('root layout', () => {
  it('does not load the Tailwind Play CDN, which evaluates strings with eval', () => {
    const source = readFileSync(layoutPath, 'utf8');
    assert.doesNotMatch(source, /cdn\.tailwindcss\.com/);
    assert.doesNotMatch(source, /tailwind\.config\s*=/);
  });

  it('titles the landing tab TinyGPT, not tinygpt', () => {
    const source = readFileSync(layoutPath, 'utf8');
    assert.match(source, /title: \{ absolute: documentTitle\(\) \}/);
    assert.doesNotMatch(source, /title:\s*'tinygpt'/);
  });

  it('titles login in the owner-page pattern', () => {
    const login = readFileSync(path.join(path.dirname(layoutPath), 'login/layout.tsx'), 'utf8');
    assert.match(login, /documentTitle\('Log in'\)/);
    assert.match(login, /absolute:/);
  });
});
