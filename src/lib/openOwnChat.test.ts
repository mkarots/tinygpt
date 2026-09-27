import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ChatState, OWN_CHAT_STATEMENT, chatStateFromSession, openOwnChat } from './openOwnChat';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const here: ChatState = {
  threads: {
    'agent-1:session-a': [
      { id: 'm1', role: 'user', text: 'Hours?', createdAt: 1 },
      { id: 'm2', role: 'model', text: 'Nine to five.', createdAt: 2 },
    ],
    'agent-1:session-b': [{ id: 'other', role: 'user', text: 'From another browser', createdAt: 3 }],
    'agent-2:session-a': [{ id: 'elsewhere', role: 'user', text: 'Another agent', createdAt: 4 }],
  },
};

const ownerOpen = {
  ownerId: 'owner-1',
  agentOwnerId: 'owner-1',
  agentId: 'agent-1',
  sessionId: 'session-a',
};

describe('openOwnChat', () => {
  it('returns this browser’s thread and says it is not other people’s questions', () => {
    const opened = openOwnChat(here, ownerOpen);
    assert.deepEqual(
      opened?.thread.map((message) => message.text),
      ['Hours?', 'Nine to five.']
    );
    assert.equal(opened?.statement, OWN_CHAT_STATEMENT);
    assert.match(opened?.statement ?? '', /this browser's chat/);
    assert.match(opened?.statement ?? '', /not questions from other people/);
  });

  it('leaves out every other browser session', () => {
    const opened = openOwnChat(here, ownerOpen);
    const texts = opened?.thread.map((message) => message.text) ?? [];
    assert.equal(texts.includes('From another browser'), false);
    assert.equal(texts.includes('Another agent'), false);
  });

  it('returns the same thread when the chat is opened again and does not change ChatState', () => {
    const first = openOwnChat(here, ownerOpen);
    const second = openOwnChat(first?.state ?? here, ownerOpen);
    assert.equal(first?.state, here);
    assert.equal(second?.state, here);
    assert.deepEqual(second?.thread, first?.thread);
    assert.deepEqual(here.threads['agent-1:session-b'][0]?.text, 'From another browser');
  });

  it('holds only the session it was given', () => {
    const state = chatStateFromSession('agent-1', 'session-a', here.threads['agent-1:session-a']);
    const opened = openOwnChat(state, ownerOpen);
    assert.deepEqual(opened?.thread, here.threads['agent-1:session-a']);
    assert.equal(openOwnChat(state, { ...ownerOpen, sessionId: 'session-b' })?.thread.length, 0);
  });

  it('returns an empty thread when this browser has not stored messages', () => {
    const opened = openOwnChat(here, { ...ownerOpen, sessionId: null });
    assert.deepEqual(opened?.thread, []);
    assert.equal(opened?.statement, OWN_CHAT_STATEMENT);
    assert.equal(opened?.state, here);
  });

  it('returns nothing when the person does not own the agent', () => {
    assert.equal(openOwnChat(here, { ...ownerOpen, ownerId: 'visitor' }), null);
    assert.equal(openOwnChat(here, { ...ownerOpen, ownerId: '' }), null);
    assert.equal(openOwnChat(here, { ...ownerOpen, agentId: '' }), null);
    assert.deepEqual(here.threads['agent-1:session-a'].map((message) => message.text), [
      'Hours?',
      'Nine to five.',
    ]);
  });

  it('does not say that a refresh clears the conversation', () => {
    const map = readFileSync(
      path.join(root, '.cursor/skills/tinygpt-early-user/product-map.md'),
      'utf8'
    );
    assert.doesNotMatch(map, /Refresh clears the conversation/);
  });
});
