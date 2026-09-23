import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTextKnowledgeItem } from './textKnowledge';

describe('createTextKnowledgeItem', () => {
  it('builds an active text source from a title and pasted body', () => {
    const item = createTextKnowledgeItem('  Return policy  ', '  30 days  ', {
      id: 'text-1',
      now: 100,
    });
    assert.deepEqual(item, {
      id: 'text-1',
      type: 'text',
      name: 'Return policy',
      content: '30 days',
      status: 'active',
      dateAdded: 100,
    });
  });

  it('rejects a missing title', () => {
    assert.equal(createTextKnowledgeItem('   ', 'body'), null);
  });

  it('rejects a missing body', () => {
    assert.equal(createTextKnowledgeItem('Title', '  '), null);
  });

  it('rejects empty strings', () => {
    assert.equal(createTextKnowledgeItem('', ''), null);
  });
});
