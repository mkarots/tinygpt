import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_CHAT_HISTORY_LIMIT, selectRecentChatTurns } from './chatHistory';

describe('selectRecentChatTurns', () => {
  it('returns empty for missing or empty input', () => {
    assert.deepEqual(selectRecentChatTurns(undefined, 'hello'), []);
    assert.deepEqual(selectRecentChatTurns([], 'hello'), []);
  });

  it('drops the greeting so Gemini history starts with user', () => {
    const turns = selectRecentChatTurns(
      [
        { role: 'model', text: 'Hi there!' },
        { role: 'user', text: 'Hours?' },
        { role: 'model', text: '9 to 5.' },
      ],
      'What about weekends?'
    );
    assert.deepEqual(turns, [
      { role: 'user', text: 'Hours?' },
      { role: 'model', text: '9 to 5.' },
    ]);
  });

  it('strips the current user message if the client already appended it', () => {
    const turns = selectRecentChatTurns(
      [
        { role: 'user', text: 'Hours?' },
        { role: 'model', text: '9 to 5.' },
        { role: 'user', text: 'Weekends?' },
      ],
      'Weekends?'
    );
    assert.deepEqual(turns, [
      { role: 'user', text: 'Hours?' },
      { role: 'model', text: '9 to 5.' },
    ]);
  });

  it('drops streaming and empty turns', () => {
    const turns = selectRecentChatTurns(
      [
        { role: 'user', text: 'Hi' },
        { role: 'model', text: 'Hello' },
        { role: 'model', text: '', isStreaming: true },
      ],
      'Next'
    );
    assert.deepEqual(turns, [
      { role: 'user', text: 'Hi' },
      { role: 'model', text: 'Hello' },
    ]);
  });

  it('caps at the last 20 turns by default', () => {
    const raw = Array.from({ length: 30 }, (_, i) =>
      i % 2 === 0
        ? { role: 'user' as const, text: `u${i}` }
        : { role: 'model' as const, text: `m${i}` }
    );
    const turns = selectRecentChatTurns(raw, 'now');
    assert.equal(turns.length, DEFAULT_CHAT_HISTORY_LIMIT);
    assert.equal(turns[0].text, 'u10');
    assert.equal(turns[turns.length - 1].text, 'm29');
  });
});
