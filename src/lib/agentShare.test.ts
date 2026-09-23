import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { agentShareLinks, embedSnippet } from './agentShare';

describe('agentShareLinks', () => {
  it('builds the public chat link, embed page, and widget snippet', () => {
    const links = agentShareLinks('https://tinygpt.example/', 'abc');
    assert.equal(links.shareUrl, 'https://tinygpt.example/chat/abc');
    assert.equal(links.embedUrl, 'https://tinygpt.example/embed/abc');
    assert.equal(
      links.snippet,
      '<script src="https://tinygpt.example/tinygpt.js" data-id="abc" async></script>'
    );
  });

  it('escapes quotes in the agent id so the snippet stays a single attribute', () => {
    const snippet = embedSnippet('https://tinygpt.example', 'a"b');
    assert.equal(
      snippet,
      '<script src="https://tinygpt.example/tinygpt.js" data-id="a&quot;b" async></script>'
    );
    assert.equal(snippet.includes('data-id="a"b"'), false);
  });
});
