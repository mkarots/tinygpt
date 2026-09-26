import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('owner back to agents on public chat', () => {
  it('links signed-in owners to /admin as Your agents and hides for visitors', () => {
    const link = read('components/OwnerBackToAgentsLink.tsx');
    assert.match(link, /useAuth/);
    assert.match(link, /isLoading \|\| !user/);
    assert.match(link, /PRODUCT_BUILDER_PATH/);
    assert.match(link, /Your agents/);
    assert.doesNotMatch(link, />\s*Sign out\s*</);
    assert.doesNotMatch(link, />\s*TinyGPT\s*</);
  });

  it('shows the owner link on both public chat and embed via PublicAgentChat', () => {
    const publicChat = read('components/PublicAgentChat.tsx');
    const chat = read('app/chat/[id]/page.tsx');
    const embed = read('app/embed/[id]/page.tsx');
    assert.match(publicChat, /OwnerBackToAgentsLink/);
    assert.match(chat, /PublicAgentChat/);
    assert.match(embed, /PublicAgentChat/);
  });
});
