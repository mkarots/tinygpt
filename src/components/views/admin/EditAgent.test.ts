import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const source = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'EditAgent.tsx'),
  'utf8'
);
const app = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../../App.tsx'),
  'utf8'
);

describe('edit agent', () => {
  it('is one page of sections, not the setup timeline', () => {
    assert.match(source, /Edit agent/);
    assert.match(source, /CompanyStep/);
    assert.match(source, /KnowledgeStep/);
    assert.match(source, /CustomizeStep/);
    assert.match(source, /QuickQuestionsEditor/);
    assert.match(source, /Save changes/);
    assert.doesNotMatch(source, /ProgressBar|OnboardingHeader|Next Step/);
    assert.doesNotMatch(source, /blocksKnowledgeStep/);
  });

  it('saves the existing agent id and company fields', () => {
    assert.match(source, /configWithCompany\(config, companyInfo\)/);
    assert.match(source, /saveAgent\(/);
    assert.match(source, /existingAgentId/);
    assert.match(app, /<EditAgent/);
    assert.match(app, /companyInfoFromAgent/);
  });

  it('settles abandoned pending imports when opening edit', () => {
    assert.match(app, /settleAbandonedImports/);
    assert.match(app, /onRemoveKnowledge/);
    assert.match(source, /onRemoveKnowledge/);
  });
});
