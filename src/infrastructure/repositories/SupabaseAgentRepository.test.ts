import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SupabaseAgentRepository } from './SupabaseAgentRepository';

type AgentRow = { id: string; name: string; description: string | null };

function listingClient(options: {
  authUserId: string | null;
  rows?: AgentRow[];
  errorMessage?: string;
}) {
  const filters: { column: string; value: string }[] = [];
  let fromCalls = 0;

  const client = {
    filters,
    fromCount: () => fromCalls,
    auth: {
      getUser: async () => ({
        data: { user: options.authUserId ? { id: options.authUserId } : null },
        error: null,
      }),
    },
    from(table: string) {
      assert.equal(table, 'agents');
      fromCalls += 1;
      const query = {
        select() {
          return query;
        },
        eq(column: string, value: string) {
          filters.push({ column, value });
          return query;
        },
        order() {
          return Promise.resolve({
            data: options.errorMessage ? null : (options.rows ?? []),
            error: options.errorMessage ? { message: options.errorMessage } : null,
          });
        },
      };
      return query;
    },
  };

  return client;
}

describe('SupabaseAgentRepository.listByUser', () => {
  it('returns only the signed-in user rows and filters on that user id', async () => {
    const client = listingClient({
      authUserId: 'user-1',
      rows: [
        { id: 'agent-1', name: 'Support', description: 'Help' },
        { id: 'agent-2', name: '', description: null },
      ],
    });
    const repo = new SupabaseAgentRepository(client as never);
    const agents = await repo.listByUser('user-1');

    assert.deepEqual(client.filters, [{ column: 'user_id', value: 'user-1' }]);
    assert.deepEqual(agents, [
      { id: 'agent-1', name: 'Support', description: 'Help' },
      { id: 'agent-2', name: 'Untitled agent', description: '' },
    ]);
  });

  it('does not query when the requested user is not the session user', async () => {
    const client = listingClient({
      authUserId: 'user-1',
      rows: [{ id: 'other', name: 'Secret', description: 'nope' }],
    });
    const repo = new SupabaseAgentRepository(client as never);

    assert.deepEqual(await repo.listByUser('user-2'), []);
    assert.equal(client.fromCount(), 0);
  });

  it('returns an empty list when there is no session', async () => {
    const client = listingClient({ authUserId: null });
    const repo = new SupabaseAgentRepository(client as never);

    assert.deepEqual(await repo.listByUser('user-1'), []);
    assert.equal(client.fromCount(), 0);
  });

  it('throws when the list query fails', async () => {
    const client = listingClient({ authUserId: 'user-1', errorMessage: 'db down' });
    const repo = new SupabaseAgentRepository(client as never);

    await assert.rejects(() => repo.listByUser('user-1'), /Failed to list agents: db down/);
  });
});

describe('SupabaseAgentRepository.getById', () => {
  it('loads one public agent when the table read is denied', async () => {
    const client = {
      from() {
        const query = {
          select() {
            return query;
          },
          eq() {
            return query;
          },
          maybeSingle: async () => ({ data: null, error: { message: 'permission denied' } }),
        };
        return query;
      },
      rpc(name: string, args: { agent_id: string }) {
        assert.equal(name, 'get_public_agent');
        assert.equal(args.agent_id, 'agent-1');
        return Promise.resolve({
          data: [
            {
              id: 'agent-1',
              config: { name: 'Bakery' },
              knowledge: [{ id: 'k1', name: 'FAQ', type: 'text', content: 'Open', status: 'active' }],
              created_at: '2026-01-01T00:00:00.000Z',
            },
          ],
          error: null,
        });
      },
    };
    const repo = new SupabaseAgentRepository(client as never);
    const agent = await repo.getById('agent-1');
    assert.equal(agent?.id, 'agent-1');
    assert.equal(agent?.config.name, 'Bakery');
    assert.equal(agent?.knowledge.length, 1);
    assert.equal('embedding' in (agent?.knowledge[0] ?? {}), false);
  });
});
