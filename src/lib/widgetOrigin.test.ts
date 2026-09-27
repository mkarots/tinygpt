import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { widgetBaseUrl } from './widgetOrigin';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

describe('widgetBaseUrl', () => {
  it('uses the origin that served the script', () => {
    assert.equal(
      widgetBaseUrl('https://your-app.vercel.app/tinygpt.js'),
      'https://your-app.vercel.app'
    );
  });

  it('keeps localhost and an alternate loopback port', () => {
    assert.equal(widgetBaseUrl('http://localhost:3000/tinygpt.js'), 'http://localhost:3000');
    assert.equal(widgetBaseUrl('http://127.0.0.1:3001/tinygpt.js'), 'http://127.0.0.1:3001');
  });

  it('ignores a query string on the script URL', () => {
    assert.equal(
      widgetBaseUrl('https://preview.vercel.app/tinygpt.js?v=1'),
      'https://preview.vercel.app'
    );
  });

  it('rejects a script src that is not a URL', () => {
    assert.throws(() => widgetBaseUrl(''), TypeError);
    assert.throws(() => widgetBaseUrl('tinygpt.js'), TypeError);
  });
});

describe('deploy docs', () => {
  it('tells people to run Next.js with Supabase and Gemini env names only', () => {
    const readme = readFileSync(path.join(root, 'README.md'), 'utf8');
    assert.match(readme, /npm run dev/);
    assert.match(readme, /NEXT_PUBLIC_SUPABASE_URL/);
    assert.match(readme, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
    assert.match(readme, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
    assert.match(readme, /GEMINI_API_KEY/);
    assert.match(readme, /Vercel/);
    assert.doesNotMatch(readme, /process\.env\.API_KEY/);
    assert.doesNotMatch(readme, /npm start/);
    assert.doesNotMatch(readme, /Refreshing the page clears/);
    assert.doesNotMatch(readme, /tinyrag/);
  });
});
