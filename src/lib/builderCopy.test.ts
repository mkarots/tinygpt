import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { COMPANY_STEP_HELP, KNOWLEDGE_STEP_HELP } from './builderCopy';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('builder copy', () => {
  it('does not promise an email crawl report', () => {
    const company = read('components/onboarding/CompanyStep.tsx');
    const importUi = read('components/onboarding/WebsiteImport.tsx');
    const onboarding = read('components/Onboarding.tsx');
    assert.match(company, /COMPANY_STEP_HELP/);
    assert.equal(
      COMPANY_STEP_HELP,
      'We use this to add your site so the chat can live on your pages.'
    );
    assert.doesNotMatch(company, /crawl report|Your Email/i);
    assert.doesNotMatch(importUi, /We'll email|email you when done/i);
    assert.doesNotMatch(onboarding, /Email sent/);
  });

  it('says the agent answers from these pages, not that it gets smarter', () => {
    const knowledge = read('components/onboarding/KnowledgeStep.tsx');
    assert.match(knowledge, /KNOWLEDGE_STEP_HELP/);
    assert.equal(
      KNOWLEDGE_STEP_HELP,
      'Upload files, import a site, or paste text. The chat answers from these pages.'
    );
    assert.doesNotMatch(knowledge, /smarter it gets|base knowledge/);
  });
});
