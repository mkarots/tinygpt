import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { SIGN_IN_CTA } from './signInCopy';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sign-in call to action', () => {
  it('asks a first-time user to create an agent for their business', () => {
    assert.equal(SIGN_IN_CTA, 'Create an agent for your website or business');
  });

  it('is the login description', () => {
    const login = readFileSync(path.join(root, 'app/login/page.tsx'), 'utf8');
    assert.match(login, /SIGN_IN_CTA/);
    assert.match(login, /Continue with Google/);
    assert.doesNotMatch(login, /manage your AI agents|share a chat link/);
  });
});
