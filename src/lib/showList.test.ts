import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AgentFact, showList } from './showList';

function fact(partial: Partial<AgentFact> & Pick<AgentFact, 'id'>): AgentFact {
  return {
    ownerId: 'owner-1',
    website: null,
    websiteSourceStatus: null,
    sourceStandings: [],
    ...partial,
  };
}

describe('showList', () => {
  it('marks a saved website as connected and shows its URL', () => {
    const listed = showList('owner-1', [
      fact({ id: 'a', website: 'https://alpha.example', websiteSourceStatus: 'active' }),
      fact({ id: 'b', website: 'https://beta.example' }),
    ]);
    assert.deepEqual(
      listed?.map((entry) => ({
        siteStatus: entry.siteStatus,
        siteDot: entry.siteDot,
        siteUrl: entry.siteUrl,
      })),
      [
        { siteStatus: 'Connected', siteDot: 'green', siteUrl: 'https://alpha.example' },
        { siteStatus: 'Connected', siteDot: 'green', siteUrl: 'https://beta.example' },
      ]
    );
  });

  it('marks a missing website as not set up', () => {
    const listed = showList('owner-1', [
      fact({ id: 'a', website: null }),
      fact({ id: 'b', website: '   ' }),
    ]);
    assert.equal(listed?.[0].siteStatus, 'Not setup yet');
    assert.equal(listed?.[0].siteDot, 'gray');
    assert.equal(listed?.[0].siteUrl, null);
    assert.equal(listed?.[1].siteStatus, 'Not setup yet');
    assert.equal(listed?.[1].siteDot, 'gray');
  });

  it('marks the website failed when that page import failed', () => {
    const listed = showList('owner-1', [
      fact({
        id: 'a',
        website: 'https://shop.example',
        websiteSourceStatus: 'error',
      }),
    ]);
    assert.equal(listed?.[0].siteStatus, 'Failed');
    assert.equal(listed?.[0].siteDot, 'red');
    assert.equal(listed?.[0].siteUrl, 'https://shop.example');
  });

  it('marks an agent with no sources as not set up', () => {
    const listed = showList('owner-1', [fact({ id: 'a', sourceStandings: [] })]);
    assert.equal(listed?.[0].agentStanding, 'Not setup');
    assert.equal(listed?.[0].standingDot, 'gray');
  });

  it('rolls source standings up with the same words as each source', () => {
    const ready = showList('owner-1', [fact({ id: 'a', sourceStandings: ['active', 'active'] })])?.[0];
    assert.equal(ready?.agentStanding, 'Ready');
    assert.equal(ready?.standingDot, 'green');

    const importing = showList('owner-1', [fact({ id: 'b', sourceStandings: ['active', 'pending'] })])?.[0];
    assert.equal(importing?.agentStanding, 'Importing');
    assert.equal(importing?.standingDot, 'blue');

    const failed = showList('owner-1', [fact({ id: 'c', sourceStandings: ['pending', 'error'] })])?.[0];
    assert.equal(failed?.agentStanding, 'Failed');
    assert.equal(failed?.standingDot, 'red');
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
