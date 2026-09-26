import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  VISITOR_CHAT_CONNECT_ERROR,
  chatSendErrorMessage,
  isVisitorChatInfrastructureError,
} from './chatSendError';

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

  it('hides a schema-cache or missing-function error from the visitor', () => {
    const schemaCache = new Error(
      'Failed to load chat: Could not find the function public.find_visitor_chat(p_agent_id, p_session_id) in the schema cache'
    );
    assert.equal(chatSendErrorMessage(schemaCache), VISITOR_CHAT_CONNECT_ERROR);
    assert.equal(
      VISITOR_CHAT_CONNECT_ERROR,
      "I'm having trouble connecting right now. Please try again."
    );
    assert.doesNotMatch(chatSendErrorMessage(schemaCache), /find_visitor_chat|schema cache/i);

    const missingFn = new Error(
      'Could not find the function public.ensure_visitor_chat(p_agent_id, p_session_id) in the schema cache'
    );
    assert.equal(chatSendErrorMessage(missingFn), VISITOR_CHAT_CONNECT_ERROR);
    assert.ok(isVisitorChatInfrastructureError(missingFn.message));
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
