import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { KnowledgeItem } from '../../types';
import { questionsForIndustry } from './quickQuestionDefaults';
import { isStockQuickQuestions, resolveQuickQuestions } from './resolveQuickQuestions';

function item(content: string): KnowledgeItem {
  return {
    id: 'k1',
    type: 'url',
    name: 'Shop',
    content,
    status: 'active',
    dateAdded: 1,
  };
}

describe('resolveQuickQuestions', () => {
  it('treats empty and industry packs as stock', () => {
    assert.equal(isStockQuickQuestions([]), true);
    assert.equal(isStockQuickQuestions(questionsForIndustry('saas')), true);
    assert.equal(isStockQuickQuestions(questionsForIndustry('ecommerce')), true);
    assert.equal(
      isStockQuickQuestions([{ text: 'Do you fire stoneware?', emoji: '🔥' }]),
      false
    );
  });

  it('replaces stock SaaS questions with questions from the agent pages', () => {
    const resolved = resolveQuickQuestions(questionsForIndustry('saas'), [
      item('## Return Policy\n\n30 days.\n\n## Shipping options\n\nNext day.\n'),
    ]);
    assert.deepEqual(
      resolved.map((question) => question.text),
      ['What is your return policy?', 'What are your shipping options?']
    );
    assert.equal(resolved.some((question) => question.text.includes('free trial')), false);
  });

  it('keeps questions the owner edited', () => {
    const custom = [{ text: 'Do you stock celadon?', emoji: '🥣' }];
    assert.deepEqual(
      resolveQuickQuestions(custom, [item('## Shipping\nWe ship.')]),
      custom
    );
  });

  it('returns no invented questions when knowledge is empty', () => {
    assert.deepEqual(resolveQuickQuestions(questionsForIndustry('ecommerce'), []), []);
    assert.deepEqual(resolveQuickQuestions([], []), []);
  });
});
