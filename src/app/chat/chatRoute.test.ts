import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('public chat route', () => {
  it('renders the same public widget as embed', () => {
    const chat = read('src/app/chat/[id]/page.tsx');
    const embed = read('src/app/embed/[id]/page.tsx');
    assert.match(chat, /PublicAgentChat/);
    assert.match(embed, /PublicAgentChat/);
    assert.doesNotMatch(chat, /Start Chatting|\+500 interactions|KNOWLEDGE BASE|No public knowledge/);
  });

  it('shows only this agent\'s questions, taken from knowledge when stock defaults remain', () => {
    const publicChat = read('src/components/PublicAgentChat.tsx');
    const widget = read('src/components/WidgetChat.tsx');
    assert.match(publicChat, /showQuickQuestions=\{true\}/);
    assert.match(widget, /resolveQuickQuestions\(config\.quickQuestions, knowledge\)/);
    assert.doesNotMatch(publicChat, /Do you offer a free trial/);
    assert.doesNotMatch(widget, /Do you offer a free trial/);
  });

  it('names the send control Send', () => {
    const input = read('src/components/core/input/ChatInput.tsx');
    assert.match(input, /aria-label="Send"/);
  });
});
