import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('landing page', () => {
  it('uses the Counter paper palette and sends people to sign in', () => {
    const page = read('components/landing/LandingPage.tsx');
    assert.match(page, /#F6F1E8/);
    assert.match(page, /#B4532A/);
    assert.match(page, /Support that/);
    assert.match(page, /lives on your site/);
    assert.match(page, /\/login/);
    assert.match(page, /router\.replace\('\/admin'\)/);
  });

  it('does not promise store actions, prices, or fake quotes', () => {
    const page = read('components/landing/LandingPage.tsx');
    assert.doesNotMatch(page, /Shopify|Stripe|refund issued|\[£|STORE LOGO|shows its work/i);
  });
});
