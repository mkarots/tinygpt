import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Agent } from '../domain/entities/Agent';
import { ownedAgentForEdit } from './ownedAgentForEdit';

const agent: Agent = {
  id: 'owned-1',
  config: {
    name: 'Support Bot',
    description: 'Help',
    primaryColor: '#B4532A',
    greeting: 'Hi',
    tone: 'friendly',
    quickQuestions: [],
  },
  knowledge: [],
  createdAt: 1,
};

describe('ownedAgentForEdit', () => {
  it('returns the agent when the user owns that id', async () => {
    const loaded = await ownedAgentForEdit(
      {
        listByUser: async () => [
          { id: 'owned-1', name: 'Support Bot', description: '', createdAt: 1, site: null },
        ],
        getById: async (id) => (id === 'owned-1' ? agent : null),
      },
      'user-1',
      'owned-1'
    );
    assert.equal(loaded?.id, 'owned-1');
  });

  it('returns null when the id is missing, foreign, or unknown', async () => {
    const repo = {
      listByUser: async () => [
        { id: 'owned-1', name: 'Support Bot', description: '', createdAt: 1, site: null },
      ],
      getById: async () => agent,
    };
    assert.equal(await ownedAgentForEdit(repo, 'user-1', undefined), null);
    assert.equal(await ownedAgentForEdit(repo, 'user-1', 'someone-else'), null);
  });
});
