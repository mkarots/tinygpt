import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const schema = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '../../supa_schema.sql'),
  'utf8'
);

describe('public schema access', () => {
  it('does not grant anonymous table reads of agents, chats, messages, or knowledge', () => {
    assert.doesNotMatch(schema, /Public can view agents/);
    assert.doesNotMatch(schema, /Public can read messages/);
    assert.doesNotMatch(schema, /Public can create chats/);
    assert.doesNotMatch(schema, /Public can read chats/);
    assert.doesNotMatch(schema, /on knowledge for select using \( true \)/);
    assert.match(schema, /revoke all on table knowledge from anon/);
    assert.match(schema, /revoke all on function match_rag_documents/);
  });

  it('exposes one agent and one visitor session through security-definer functions', () => {
    for (const name of [
      'get_public_agent',
      'find_visitor_chat',
      'ensure_visitor_chat',
      'append_visitor_message',
      'list_visitor_messages',
    ]) {
      assert.match(schema, new RegExp(`function public\\.${name}`));
    }
    assert.match(schema, /security definer/);
    assert.match(schema, /set search_path = public/);
    assert.match(schema, /exception when unique_violation/);
    const agentFn = schema.slice(schema.indexOf('function public.get_public_agent'));
    assert.doesNotMatch(agentFn.slice(0, agentFn.indexOf('$$;')), /embedding/);
  });
});
