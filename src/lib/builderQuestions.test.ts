import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { INDUSTRIES, industrySelectOptions } from './quickQuestionDefaults';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('builder industries and questions', () => {
  it('starts with no invented quick questions', () => {
    const app = read('../App.tsx');
    assert.match(app, /quickQuestions:\s*\[\]/);
    assert.doesNotMatch(app, /questionsForIndustry\(/);
    assert.doesNotMatch(app, /A helpful assistant for our customers/);
  });

  it('uses one catalog for the industry dropdown and does not invent questions from it', () => {
    const company = read('components/onboarding/CompanyStep.tsx');
    const options = industrySelectOptions();
    assert.match(company, /industrySelectOptions\(\)/);
    assert.doesNotMatch(company, /quickQuestionsForIndustry/);
    assert.match(company, /agentDescriptionForCompany/);
    assert.equal(options[0]?.value, '');
    assert.deepEqual(
      options.slice(1).map((option) => option.value),
      INDUSTRIES.map((industry) => industry.id)
    );
  });
});
