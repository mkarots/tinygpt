import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { setQuestionEmoji } from './quickQuestionEmoji';

describe('setQuestionEmoji', () => {
  it('sets the emoji on an object question and leaves the text', () => {
    const next = setQuestionEmoji([{ text: 'Hours?', emoji: '💡' }], 0, '🕐');
    assert.deepEqual(next, [{ text: 'Hours?', emoji: '🕐' }]);
  });

  it('turns a string question into text plus the chosen emoji', () => {
    const next = setQuestionEmoji(['How can I contact you?'], 0, '✉️');
    assert.deepEqual(next, [{ text: 'How can I contact you?', emoji: '✉️' }]);
  });

  it('does not change the other questions', () => {
    const next = setQuestionEmoji(
      [
        { text: 'A', emoji: '💡' },
        { text: 'B', emoji: '✨' },
      ],
      1,
      '📍'
    );
    assert.deepEqual(next[0], { text: 'A', emoji: '💡' });
    assert.equal((next[1] as { emoji: string }).emoji, '📍');
  });
});
