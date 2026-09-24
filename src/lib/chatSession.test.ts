import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isChatSessionId, readChatSessionId, readCookieValue } from './chatSession';

describe('chat session ids', () => {
  it('accepts uuid-like tokens and rejects blanks', () => {
    assert.equal(isChatSessionId('session-1'), true);
    assert.equal(isChatSessionId('11111111-1111-4111-8111-111111111111'), true);
    assert.equal(isChatSessionId('short'), false);
    assert.equal(isChatSessionId(''), false);
    assert.equal(isChatSessionId('has space!'), false);
  });

  it('prefers the query id, then the body, then the cookie', () => {
    assert.equal(
      readChatSessionId({
        querySessionId: 'query-sess',
        bodySessionId: 'body-session',
        cookieSessionId: 'cookie-session',
      }),
      'query-sess'
    );
    assert.equal(
      readChatSessionId({ bodySessionId: 'nope', cookieSessionId: 'cookie-session' }),
      'cookie-session'
    );
    assert.equal(readChatSessionId({}), null);
  });

  it('reads one cookie from a header', () => {
    assert.equal(
      readCookieValue('other=1; tinygpt_session=abc-def-123; x=y', 'tinygpt_session'),
      'abc-def-123'
    );
    assert.equal(readCookieValue(null, 'tinygpt_session'), null);
  });
});
