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

  it('lets the intro and sample shop wrap on a narrow phone', () => {
    const page = read('components/landing/LandingPage.tsx');
    assert.match(page, /break-words/);
    assert.match(page, /flex-col items-start/);
    assert.match(page, /max-w-\[100vw\]/);
    assert.match(page, /Hartwell Ceramics/);
    assert.doesNotMatch(page, /shrink-0 gap-3 text-\[13px\]/);
    assert.doesNotMatch(page, /w-\[min\(100%,360px\)\]/);
  });

  it('does not promise store actions, prices, or fake quotes', () => {
    const page = read('components/landing/LandingPage.tsx');
    assert.doesNotMatch(page, /Shopify|Stripe|refund issued|\[£|STORE LOGO|shows its work/i);
  });
});
