import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Agent } from '../../domain/entities/Agent';
import { AGENT_STORAGE_NOT_SET_UP } from './agentStorageError';
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

const sampleAgent: Agent = {
  id: '11111111-1111-4111-8111-111111111111',
  config: {
    name: 'Support',
    description: 'Help',
    primaryColor: '#000',
    greeting: 'Hi',
    tone: 'friendly',
    quickQuestions: [],
  },
  knowledge: [],
  createdAt: 1,
};

function saveClient(options: {
  profileError?: { message: string; code?: string } | null;
  agentError?: { message: string; code?: string } | null;
}) {
  return {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'user-1', email: 'a@b.c' } },
        error: null,
      }),
    },
    from(table: string) {
      const result =
        table === 'profiles'
          ? { error: options.profileError ?? null }
          : { error: options.agentError ?? null };
      return {
        upsert() {
          return Promise.resolve(result);
        },
      };
    },
  };
}

describe('SupabaseAgentRepository.save', () => {
  it('reports missing agent storage instead of the schema-cache string', async () => {
    const repo = new SupabaseAgentRepository(
      saveClient({
        agentError: {
          code: 'PGRST205',
          message: "Could not find the table 'public.agents' in the schema cache",
        },
      }) as never,
    );

    await assert.rejects(() => repo.save(sampleAgent), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, AGENT_STORAGE_NOT_SET_UP);
      assert.equal(String(error.message).includes('schema cache'), false);
      return true;
    });
  });

  it('reports missing profile storage the same way', async () => {
    const repo = new SupabaseAgentRepository(
      saveClient({
        profileError: {
          message: "Could not find the table 'public.profiles' in the schema cache",
        },
      }) as never,
    );

    await assert.rejects(
      () => repo.save(sampleAgent),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.message, AGENT_STORAGE_NOT_SET_UP);
        return true;
      },
    );
  });

  it('keeps other save failures', async () => {
    const repo = new SupabaseAgentRepository(
      saveClient({ agentError: { message: 'permission denied' } }) as never,
    );

    await assert.rejects(() => repo.save(sampleAgent), /Failed to save agent: permission denied/);
  });
});

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
