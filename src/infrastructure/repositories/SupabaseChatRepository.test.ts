import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SupabaseChatRepository } from './SupabaseChatRepository';

type Row = Record<string, unknown>;

function fakeClient(options?: { insertError?: { message: string; code?: string } }) {
  const chats: Row[] = [];
  const messages: Row[] = [];

  function matches(row: Row, filters: [string, string][]) {
    return filters.every(([column, value]) => row[column] === value);
  }

  return {
    chats,
    messages,
    from(table: string) {
      const filters: [string, string][] = [];
      const rows = () => (table === 'chats' ? chats : messages).filter((row) => matches(row, filters));
      const query = {
        select() {
          return query;
        },
        eq(column: string, value: string) {
          filters.push([column, value]);
          return query;
        },
        order() {
          return query;
        },
        limit() {
          return Promise.resolve({ data: rows(), error: null });
        },
        insert(row: Row) {
          if (options?.insertError && table === 'chats') {
            return {
              select() {
                return { single: async () => ({ data: null, error: options.insertError }) };
              },
            };
          }
          const stored = { id: `${table}-${rows.length}`, ...row };
          (table === 'chats' ? chats : messages).push(stored);
          const result = Promise.resolve({ data: stored, error: null });
          return Object.assign(result, {
            select() {
              return { single: async () => ({ data: stored, error: null }) };
            },
          });
        },
        then(onFulfilled: (value: { data: Row[]; error: null }) => unknown, onRejected?: (reason: unknown) => unknown) {
          return Promise.resolve({ data: rows(), error: null }).then(onFulfilled, onRejected);
        },
      };
      return query;
    },
  };
}

describe('SupabaseChatRepository', () => {
  it('creates a chat, stores both roles, and lists them in order', async () => {
    const client = fakeClient();
    const repo = new SupabaseChatRepository(client as never);
    const chat = await repo.create('agent-1', 'session-1');
    await repo.appendMessage(chat.id, 'user', ' Hours? ');
    await repo.appendMessage(chat.id, 'model', 'Nine to five');
    await repo.appendMessage(chat.id, 'model', '   ');

    const found = await repo.findByAgentAndSession('agent-1', 'session-1');
    assert.equal(found?.id, chat.id);
    const listed = await repo.listMessages(chat.id);
    assert.deepEqual(
      listed.map((message) => message.text),
      ['Hours?', 'Nine to five']
    );
  });

  it('returns the existing chat when insert hits the unique session index', async () => {
    const client = fakeClient({ insertError: { message: 'duplicate', code: '23505' } });
    client.chats.push({ id: 'chats-existing', agent_id: 'agent-1', session_id: 'session-1' });
    const repo = new SupabaseChatRepository(client as never);
    const chat = await repo.create('agent-1', 'session-1');
    assert.equal(chat.id, 'chats-existing');
  });

  it('throws when a message insert fails', async () => {
    const client = fakeClient();
    client.from = (table: string) => {
      const query = fakeClient().from(table);
      if (table === 'messages') {
        return { insert: async () => ({ error: { message: 'db down' } }) };
      }
      return query;
    };
    const repo = new SupabaseChatRepository(client as never);
    await assert.rejects(() => repo.appendMessage('chat-1', 'user', 'Hi'), /Failed to save message: db down/);
  });
});
