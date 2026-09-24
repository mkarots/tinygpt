import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SupabaseChatRepository } from './SupabaseChatRepository';

function rpcClient(handlers: Record<string, (args: Record<string, string>) => { data: unknown; error: { message: string } | null }>) {
  const calls: { name: string; args: Record<string, string> }[] = [];
  return {
    calls,
    rpc(name: string, args: Record<string, string>) {
      calls.push({ name, args });
      const handler = handlers[name];
      if (!handler) return Promise.resolve({ data: null, error: { message: `missing ${name}` } });
      return Promise.resolve(handler(args));
    },
  };
}

describe('SupabaseChatRepository', () => {
  it('creates a chat through the session function and lists that session only', async () => {
    const messages = [
      { id: 'm1', role: 'user', content: 'Hours?', created_at: '2026-01-01T00:00:00.000Z' },
      { id: 'm2', role: 'model', content: 'Nine to five', created_at: '2026-01-01T00:00:01.000Z' },
    ];
    const client = rpcClient({
      ensure_visitor_chat: () => ({ data: 'chat-1', error: null }),
      find_visitor_chat: () => ({ data: 'chat-1', error: null }),
      append_visitor_message: () => ({ data: null, error: null }),
      list_visitor_messages: (args) => ({
        data: args.p_session_id === 'session-1' ? messages : [],
        error: null,
      }),
    });
    const repo = new SupabaseChatRepository(client as never);
    const chat = await repo.create('agent-1', 'session-1');
    await repo.appendMessage(chat.id, 'user', ' Hours? ', 'session-1');
    await repo.appendMessage(chat.id, 'model', '   ', 'session-1');

    const found = await repo.findByAgentAndSession('agent-1', 'session-1');
    assert.equal(found?.id, 'chat-1');
    const listed = await repo.listMessages(chat.id, 'session-1');
    assert.deepEqual(
      listed.map((message) => message.text),
      ['Hours?', 'Nine to five']
    );
    assert.deepEqual(client.calls[1], {
      name: 'append_visitor_message',
      args: {
        p_chat_id: 'chat-1',
        p_session_id: 'session-1',
        p_role: 'user',
        p_content: 'Hours?',
      },
    });
    assert.equal(client.calls.filter((call) => call.name === 'append_visitor_message').length, 1);
  });

  it('returns null when the session has no chat and skips a blank message', async () => {
    const client = rpcClient({
      find_visitor_chat: () => ({ data: null, error: null }),
    });
    const repo = new SupabaseChatRepository(client as never);
    assert.equal(await repo.findByAgentAndSession('agent-1', 'session-1'), null);
    await repo.appendMessage('chat-1', 'model', '   ', 'session-1');
    assert.equal(client.calls.length, 1);
    assert.deepEqual(await repo.listMessages('chat-1'), []);
  });

  it('throws when a message insert fails', async () => {
    const client = rpcClient({
      append_visitor_message: () => ({ data: null, error: { message: 'db down' } }),
    });
    const repo = new SupabaseChatRepository(client as never);
    await assert.rejects(
      () => repo.appendMessage('chat-1', 'user', 'Hi', 'session-1'),
      /Failed to save message: db down/
    );
  });

  it('requires a session when saving a message', async () => {
    const client = rpcClient({});
    const repo = new SupabaseChatRepository(client as never);
    await assert.rejects(() => repo.appendMessage('chat-1', 'user', 'Hi'), /session required/);
  });
});
