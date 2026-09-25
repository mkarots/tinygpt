import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('embed route param', () => {
  it('loads the agent from params.id and renders WidgetChat', () => {
    const page = read('src/app/embed/[id]/page.tsx');
    const publicChat = read('src/components/PublicAgentChat.tsx');
    assert.match(page, /PublicAgentChat/);
    assert.match(publicChat, /singleRouteParam\(params\.id\)/);
    assert.doesNotMatch(publicChat, /params\.agentId/);
    assert.match(publicChat, /WidgetChat/);
    assert.match(publicChat, /\/api\/agent\/\$\{agentId\}/);
  });

  it('points the widget iframe at /embed/ plus the script data-id', () => {
    const widget = read('public/tinygpt.js');
    assert.match(widget, /getAttribute\('data-id'\)/);
    assert.match(widget, /\/embed\/\$\{agentId\}/);
  });

  it('builds the install snippet from the saved agent id', () => {
    const deploy = read('src/components/DeployTab.tsx');
    assert.match(deploy, /embedSnippet\(/);
    assert.doesNotMatch(deploy, /params\.agentId/);
  });
});
