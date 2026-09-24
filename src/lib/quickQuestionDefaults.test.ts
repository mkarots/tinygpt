import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { questionsForIndustry, quickQuestionsForIndustry } from './quickQuestionDefaults';

describe('quick question defaults', () => {
  it('starts with generic questions when no industry is chosen', () => {
    const questions = questionsForIndustry('');
    assert.deepEqual(
      questions.map((question) => question.text),
      ['What are your hours?', 'How can I contact you?', 'Where are you located?']
    );
    assert.equal(questions.some((question) => question.text.includes('free trial')), false);
  });

  it('uses generic questions for other and unknown industries', () => {
    assert.deepEqual(questionsForIndustry('other'), questionsForIndustry(''));
    assert.deepEqual(questionsForIndustry('bakery'), questionsForIndustry(''));
  });

  it('uses industry questions for a known industry', () => {
    assert.equal(questionsForIndustry('saas')[0].text, 'Do you offer a free trial/version?');
    assert.equal(questionsForIndustry('ecommerce')[0].text, 'What are your shipping options?');
    assert.equal(questionsForIndustry('education')[0].text, 'How do I enroll?');
    assert.equal(questionsForIndustry('agency')[0].text, 'What services do you offer?');
  });

  it('replaces generic questions when an industry is selected', () => {
    const next = quickQuestionsForIndustry('ecommerce', questionsForIndustry(''), '');
    assert.equal(next[0].text, 'What are your shipping options?');
  });

  it('keeps questions the user already edited', () => {
    const custom = [{ text: 'Do you have gluten-free bread?', emoji: '🍞' }];
    assert.deepEqual(quickQuestionsForIndustry('ecommerce', custom, ''), custom);
  });

  it('returns generic questions again when a known industry is cleared', () => {
    const next = quickQuestionsForIndustry('', questionsForIndustry('saas'), 'saas');
    assert.equal(next[0].text, 'What are your hours?');
  });
});
