import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

function source(relative: string) {
  return readFileSync(path.join(here, relative), 'utf8');
}

const routeFiles = ['agent/route.ts', 'agent/[id]/route.ts', 'chat/route.ts'];

describe('route handlers use the cookie-aware Supabase client', () => {
  for (const file of routeFiles) {
    it(`${file} imports supabase-server and not the browser client`, () => {
      const text = source(file);
      assert.match(text, /supabase-server/);
      assert.doesNotMatch(text, /from ['"][^'"]*\/supabase['"]/);
      assert.doesNotMatch(text, /createBrowserClient/);
    });
  }

  it('rejects an unauthenticated agent create before persisting', () => {
    const text = source('agent/route.ts');
    assert.match(text, /auth\.getUser\(\)/);
    assert.match(text, /status: 401/);
    assert.match(text, /new SupabaseAgentRepository\(supabase\)/);
  });

  it('loads a public agent without requiring a signed-in user', () => {
    const text = source('agent/[id]/route.ts');
    assert.match(text, /getById/);
    assert.doesNotMatch(text, /auth\.getUser\(\)/);
  });

  it('keeps the agent repository off the browser client and writes user_id', () => {
    const text = readFileSync(
      path.join(here, '../../infrastructure/repositories/SupabaseAgentRepository.ts'),
      'utf8'
    );
    assert.doesNotMatch(text, /from ['"][^'"]*\/supabase['"]/);
    assert.doesNotMatch(text, /createBrowserClient/);
    assert.match(text, /user_id: authData\.user\.id/);
  });
});
