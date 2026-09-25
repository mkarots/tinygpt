import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('admin home', () => {
  it('lists agents for the signed-in user', () => {
    const page = read('src/app/admin/page.tsx');
    assert.match(page, /listByUser\(user\.id\)/);
    assert.match(page, /AgentDashboard/);
    assert.doesNotMatch(page, /from ['"].*App['"]/);
  });

  it('keeps the wizard on /admin/new', () => {
    const page = read('src/app/admin/new/page.tsx');
    assert.match(page, /<App \/>/);
    assert.match(page, /title: 'New agent'/);
  });

  it('links each agent to chat, the embed snippet, and create', () => {
    const dashboard = read('src/components/views/admin/AgentDashboard.tsx');
    assert.match(dashboard, /\/chat\/\$\{agent\.id\}/);
    assert.match(dashboard, /adminSharePath\(agent\.id\)/);
    assert.match(dashboard, /PRODUCT_CREATE_PATH/);
    assert.match(dashboard, /No agents yet/);
    assert.match(dashboard, /Create your first agent/);
  });

  it('includes Back to your agents on the share page', () => {
    const share = read('src/components/views/admin/ShareAgentPage.tsx');
    const matches = share.match(/Back to your agents/g) ?? [];
    assert.ok(matches.length >= 2, 'error and success views both need the back link');
  });
});
