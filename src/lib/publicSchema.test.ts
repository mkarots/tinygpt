import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../supabase/migrations');
const files = readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort();
const latest = readFileSync(path.join(migrationsDir, files[files.length - 1]), 'utf8');

describe('public schema access', () => {
  it('keeps later changes in new timestamped files', () => {
    assert.deepEqual(files, [
      '20260918000000_initial_schema.sql',
      '20260925000000_tighten_public_chat.sql',
    ]);
    for (const name of files) {
      assert.match(name, /^\d{14}_[a-z0-9_]+\.sql$/);
    }
  });

  it('does not grant anonymous table reads of agents, chats, messages, or knowledge', () => {
    assert.match(latest, /drop policy if exists "Public can view agents."/);
    assert.match(latest, /drop policy if exists "Public can read messages."/);
    assert.match(latest, /drop policy if exists "Public can create chats."/);
    assert.match(latest, /drop policy if exists "Public can read chats."/);
    assert.match(latest, /revoke all on table knowledge from anon/);
    assert.match(latest, /revoke all on function match_rag_documents/);
  });

  it('exposes one agent and one visitor session through security-definer functions', () => {
    for (const name of [
      'get_public_agent',
      'find_visitor_chat',
      'ensure_visitor_chat',
      'append_visitor_message',
      'list_visitor_messages',
    ]) {
      assert.match(latest, new RegExp(`function public\\.${name}`));
    }
    assert.match(latest, /security definer/);
    assert.match(latest, /set search_path = public/);
    assert.match(latest, /exception when unique_violation/);
    const agentFn = latest.slice(latest.indexOf('function public.get_public_agent'));
    assert.doesNotMatch(agentFn.slice(0, agentFn.indexOf('$$;')), /embedding/);
  });
});
