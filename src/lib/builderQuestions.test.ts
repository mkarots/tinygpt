import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { INDUSTRIES, industrySelectOptions, questionsForIndustry } from './quickQuestionDefaults';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relative: string) {
  return readFileSync(path.join(root, relative), 'utf8');
}

describe('builder industries and questions', () => {
  it('starts with the generic industry questions', () => {
    const app = read('../App.tsx');
    assert.match(app, /questionsForIndustry\(''\)/);
    assert.deepEqual(
      questionsForIndustry('').map((question) => question.text),
      ['What are your hours?', 'How can I contact you?', 'Where are you located?']
    );
  });

  it('uses one catalog for the dropdown and the starter questions', () => {
    const company = read('components/onboarding/CompanyStep.tsx');
    const options = industrySelectOptions();
    assert.match(company, /industrySelectOptions\(\)/);
    assert.match(company, /quickQuestionsForIndustry/);
    assert.equal(options[0]?.value, '');
    assert.deepEqual(
      options.slice(1).map((option) => option.value),
      INDUSTRIES.map((industry) => industry.id)
    );
    for (const industry of INDUSTRIES) {
      assert.ok(industry.questions.length > 0, `${industry.id} needs starter questions`);
      assert.equal(questionsForIndustry(industry.id)[0]?.text, industry.questions[0].text);
    }
  });
});
