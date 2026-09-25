import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { chatSendErrorMessage } from './chatSendError';

describe('chatSendErrorMessage', () => {
  it('passes through a specific server error', () => {
    assert.equal(
      chatSendErrorMessage(new Error('LLM API Key configuration missing')),
      'LLM API Key configuration missing'
    );
    assert.equal(chatSendErrorMessage(new Error('Agent not found')), 'Agent not found');
    assert.equal(
      chatSendErrorMessage(new Error('Too many messages. Try again shortly.')),
      'Too many messages. Try again shortly.'
    );
  });

  it('explains a network failure instead of a dead-end connecting line', () => {
    assert.equal(
      chatSendErrorMessage(new Error('Failed to fetch')),
      "Couldn't reach the server. Check your connection and try again."
    );
    assert.doesNotMatch(chatSendErrorMessage(new Error('Failed to fetch')), /trouble connecting/i);
  });

  it('explains an unknown failure instead of hiding the cause', () => {
    assert.equal(
      chatSendErrorMessage(new Error('Failed to send message')),
      "Couldn't send that message. The server did not explain why. Try again."
    );
    assert.equal(
      chatSendErrorMessage('not-an-error'),
      "Couldn't send that message. The server did not explain why. Try again."
    );
  });
});
