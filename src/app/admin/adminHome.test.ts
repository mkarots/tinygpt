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

  it('sends /admin/create to the product builder, not Prospector', () => {
    const page = read('src/app/admin/create/page.tsx');
    assert.match(page, /PRODUCT_CREATE_PATH/);
    assert.match(page, /redirect\(PRODUCT_CREATE_PATH\)/);
    assert.doesNotMatch(page, /INTERNAL_PROSPECTOR_PATH|\/internal\/prospector/);
  });

  it('maps /admin/create to the official builder and keeps Prospector internal', () => {
    const map = read('.cursor/skills/tinygpt-early-user/product-map.md');
    assert.match(
      map,
      /\| `\/admin\/create` \| Signed-in \| Opens the official builder\. Redirects to `\/admin\/new`\. \|/
    );
    assert.match(
      map,
      /\| `\/internal\/prospector` \| Signed-in \(founder\) \| Internal demo factory\. Not a product path\. \|/
    );
    assert.doesNotMatch(map, /\/admin\/create` redirects/);
  });

  it('keeps the wizard on /admin/new and loads an owned agent for edit', () => {
    const page = read('src/app/admin/new/page.tsx');
    assert.match(page, /<App \/>/);
    assert.match(page, /ownedAgentForEdit/);
    assert.match(page, /initialAgent/);
    assert.match(page, /Edit agent/);
  });

  it('links each agent to chat, the embed snippet, and edit', () => {
    const dashboard = read('src/components/views/admin/AgentDashboard.tsx');
    assert.match(dashboard, /\/chat\/\$\{agent\.id\}/);
    assert.match(dashboard, /adminSharePath\(agent\.id\)/);
    assert.match(dashboard, /adminEditPath\(agent\.id\)/);
    assert.match(dashboard, />Edit</);
    assert.doesNotMatch(dashboard, /Recreate/);
    assert.match(dashboard, /agentListSubtitle/);
    assert.match(dashboard, /isBoilerplateAgentDescription/);
    assert.match(dashboard, /PRODUCT_CREATE_PATH/);
    assert.match(dashboard, /No agents yet/);
    assert.match(dashboard, /Create your first agent/);
  });

  it('opens a single-page editor for an existing agent', () => {
    const editor = read('src/components/views/admin/EditAgent.tsx');
    const app = read('App.tsx');
    assert.match(app, /<EditAgent/);
    assert.match(editor, /existingAgentId/);
    assert.match(editor, /configWithCompany/);
    assert.doesNotMatch(editor, /ProgressBar|Next Step/);
  });

  it('includes Back to your agents on the share page', () => {
    const share = read('src/components/views/admin/ShareAgentPage.tsx');
    const matches = share.match(/Back to your agents/g) ?? [];
    assert.ok(matches.length >= 2, 'error and success views both need the back link');
  });

  it('keeps Copy code out of the embed snippet text', () => {
    const share = read('src/components/views/admin/ShareAgentPage.tsx');
    assert.match(share, /Copy code/);
    assert.match(share, /Copied/);
    assert.doesNotMatch(
      share,
      /absolute top-4 right-4[\s\S]*Copy code|Copy code[\s\S]*absolute top-4 right-4/,
      'Copy code must not overlay the wrapping snippet'
    );
    assert.match(share, /flex justify-end/);
  });
});
