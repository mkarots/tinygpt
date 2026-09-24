import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { visibleThread } from './chatThread';

describe('visibleThread', () => {
  it('shows only the greeting when nothing is stored', () => {
    const thread = visibleThread('Welcome', [], 5);
    assert.deepEqual(thread, [{ id: 'welcome', role: 'model', text: 'Welcome', timestamp: 5 }]);
  });

  it('keeps the greeting and appends stored turns', () => {
    const thread = visibleThread('Welcome', [
      { id: 'u1', role: 'user', text: 'Hi', createdAt: 2 },
      { id: 'm1', role: 'model', text: '  ', createdAt: 3 },
      { id: 'm2', role: 'model', text: 'Hello', createdAt: 4 },
    ]);
    assert.deepEqual(
      thread.map((message) => message.text),
      ['Welcome', 'Hi', 'Hello']
    );
  });

  it('uses a default greeting when the agent greeting is blank', () => {
    assert.equal(visibleThread('  ', [])[0].text, 'Hello! How can I help you today?');
  });
});
