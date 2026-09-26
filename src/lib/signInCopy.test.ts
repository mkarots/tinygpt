import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { SIGN_IN_CTA } from './signInCopy';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('sign-in call to action', () => {
  it('matches the landing page: sign in, add your site, chat stays there', () => {
    assert.equal(
      SIGN_IN_CTA,
      'Sign in with Google, then add your site. The chat stays on your pages.'
    );
    const landing = readFileSync(path.join(root, 'components/landing/LandingPage.tsx'), 'utf8');
    assert.match(landing, /Sign in with Google, then add your site/);
    assert.match(landing, /stays on your pages/);
  });

  it('is the login description and links back home', () => {
    const login = readFileSync(path.join(root, 'app/login/page.tsx'), 'utf8');
    assert.match(login, /SIGN_IN_CTA/);
    assert.match(login, /Continue with Google/);
    assert.match(login, /href="\/"/);
    assert.match(login, /bg-paper/);
    assert.match(login, /font-serif/);
    assert.doesNotMatch(login, /bg-brand-600|bg-slate-50|shadow-xl/);
    assert.doesNotMatch(login, /manage your AI agents|share a chat link|from your site or files/);
  });
});
