import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { getSupabaseAnonKey, isSupabaseConfigured } from './supabase-config';

const KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
] as const;

const originals: Record<string, string | undefined> = {};

function snapshotEnv() {
  for (const key of KEYS) {
    originals[key] = process.env[key];
    delete process.env[key];
  }
}

function restoreEnv() {
  for (const key of KEYS) {
    if (originals[key] === undefined) delete process.env[key];
    else process.env[key] = originals[key];
  }
}

afterEach(restoreEnv);

describe('isSupabaseConfigured', () => {
  it('is false when URL or public key is missing', () => {
    snapshotEnv();
    assert.equal(isSupabaseConfigured(), false);
  });

  it('accepts the legacy anon key', () => {
    snapshotEnv();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    assert.equal(isSupabaseConfigured(), true);
    assert.equal(getSupabaseAnonKey(), 'anon');
  });

  it('accepts the dashboard publishable key', () => {
    snapshotEnv();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
    assert.equal(isSupabaseConfigured(), true);
    assert.equal(getSupabaseAnonKey(), 'sb_publishable_test');
  });
});
