import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('builder quick questions', () => {
  it('starts empty and does not invent industry questions', () => {
    const app = read('../App.tsx');
    const company = read('components/onboarding/CompanyStep.tsx');
    assert.match(app, /quickQuestions: \[\]/);
    assert.doesNotMatch(app, /questionsForIndustry/);
    assert.doesNotMatch(company, /quickQuestionsForIndustry/);
    assert.doesNotMatch(app, /What are your shipping options\?|How can I track my order\?/);
  });
});
