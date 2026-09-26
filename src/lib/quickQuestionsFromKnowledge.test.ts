import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { KnowledgeItem } from '../../types';
import { quickQuestionsFromKnowledge } from './quickQuestionsFromKnowledge';

function item(partial: Partial<KnowledgeItem> & Pick<KnowledgeItem, 'content'>): KnowledgeItem {
  return {
    id: partial.id ?? 'k1',
    type: partial.type ?? 'url',
    name: partial.name ?? 'Page',
    content: partial.content,
    status: partial.status ?? 'active',
    dateAdded: partial.dateAdded ?? 1,
  };
}

describe('quickQuestionsFromKnowledge', () => {
  it('builds questions from return and shipping headings on a page', () => {
    const questions = quickQuestionsFromKnowledge([
      item({
        content: `# Hartwell Ceramics\n\n## Return Policy\n\nYou have 30 days.\n\n## Shipping\n\nWe ship weekly.\n`,
      }),
    ]);
    assert.deepEqual(
      questions.map((question) => question.text),
      ['What is your return policy?', 'What are your shipping options?']
    );
  });

  it('keeps a written FAQ question from the page', () => {
    const questions = quickQuestionsFromKnowledge([
      item({
        content: `## How do I glaze a mug?\n\nUse our kit.\n`,
      }),
    ]);
    assert.equal(questions[0]?.text, 'How do I glaze a mug?');
  });

  it('ignores pending or empty knowledge', () => {
    assert.deepEqual(
      quickQuestionsFromKnowledge([
        item({ content: '## Returns', status: 'pending' }),
        item({ content: '   ', status: 'active' }),
      ]),
      []
    );
  });
});
