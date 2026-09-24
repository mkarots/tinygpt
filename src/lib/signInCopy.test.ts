import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { SIGN_IN_PURPOSE } from './signInCopy';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sign-in purpose', () => {
  it('tells a first-time user to create an agent and share a chat link', () => {
    assert.match(SIGN_IN_PURPOSE, /create an agent/);
    assert.match(SIGN_IN_PURPOSE, /share a chat link/);
    assert.doesNotMatch(SIGN_IN_PURPOSE, /manage your AI agents/);
  });

  it('is the sentence on both the home and login screens', () => {
    for (const page of ['app/page.tsx', 'app/login/page.tsx']) {
      const source = readFileSync(path.join(root, page), 'utf8');
      assert.match(source, /SIGN_IN_PURPOSE/);
      assert.doesNotMatch(source, /manage your AI agents/);
    }
  });
});
