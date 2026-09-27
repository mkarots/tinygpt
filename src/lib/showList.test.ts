import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AgentFact, showList } from './showList';

function fact(partial: Partial<AgentFact> & Pick<AgentFact, 'id'>): AgentFact {
  return {
    ownerId: 'owner-1',
    website: null,
    sourceStandings: [],
    ...partial,
  };
}

describe('showList', () => {
  it('shows the website URL set on the agent, including when another agent has a different name', () => {
    const listed = showList('owner-1', [
      fact({ id: 'a', website: 'https://alpha.example' }),
      fact({ id: 'b', website: 'https://beta.example' }),
    ]);
    assert.deepEqual(
      listed?.map((entry) => entry.siteLine),
      ['https://alpha.example', 'https://beta.example']
    );
  });

  it('says there is no website when the website is missing or blank', () => {
    const listed = showList('owner-1', [
      fact({ id: 'a', website: null }),
      fact({ id: 'b', website: '   ' }),
    ]);
    assert.equal(listed?.[0].siteLine, 'there is no website');
    assert.equal(listed?.[1].siteLine, 'there is no website');
  });

  it('says the agent has no knowledge when it has no sources', () => {
    const listed = showList('owner-1', [fact({ id: 'a', sourceStandings: [] })]);
    assert.equal(listed?.[0].agentStanding, 'the agent has no knowledge');
  });

  it('rolls source standings up with the same words as each source', () => {
    assert.equal(
      showList('owner-1', [fact({ id: 'a', sourceStandings: ['active', 'active'] })])?.[0].agentStanding,
      'Ready'
    );
    assert.equal(
      showList('owner-1', [fact({ id: 'b', sourceStandings: ['active', 'pending'] })])?.[0].agentStanding,
      'Importing'
    );
    assert.equal(
      showList('owner-1', [fact({ id: 'c', sourceStandings: ['pending', 'error'] })])?.[0].agentStanding,
      'Failed'
    );
  });

  it('does not show the list when a fact belongs to another owner', () => {
    assert.equal(
      showList('owner-1', [
        fact({ id: 'a', website: 'https://alpha.example' }),
        fact({ id: 'b', ownerId: 'owner-2' }),
      ]),
      null
    );
  });

  it('returns an empty list when the owner has no agents', () => {
    assert.deepEqual(showList('owner-1', []), []);
  });
});
