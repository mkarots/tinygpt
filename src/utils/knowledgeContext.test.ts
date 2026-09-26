import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildKnowledgeContext } from './knowledgeContext';
import { KnowledgeItem } from '../domain/entities/KnowledgeSource';

const item = (
  overrides: Partial<KnowledgeItem> & Pick<KnowledgeItem, 'name' | 'content' | 'status'>
): KnowledgeItem => ({
  id: overrides.id ?? 'k1',
  type: overrides.type ?? 'text',
  name: overrides.name,
  content: overrides.content,
  status: overrides.status,
  dateAdded: overrides.dateAdded ?? 1,
});

describe('buildKnowledgeContext', () => {
  it('concatenates active sources', () => {
    const context = buildKnowledgeContext([
      item({ name: 'FAQ', content: 'Hours are 9-5', status: 'active' }),
      item({ id: 'k2', name: 'Site', type: 'url', content: 'We sell widgets', status: 'active' }),
    ]);
    assert.match(context, /SOURCE: FAQ \(text\)/);
    assert.match(context, /Hours are 9-5/);
    assert.match(context, /SOURCE: Site \(url\)/);
    assert.match(context, /We sell widgets/);
  });

  it('skips inactive sources', () => {
    const context = buildKnowledgeContext([
      item({ name: 'Draft', content: 'secret', status: 'pending' }),
      item({ id: 'k2', name: 'Live', content: 'public', status: 'active' }),
    ]);
    assert.equal(context.includes('secret'), false);
    assert.match(context, /public/);
  });

  it('returns empty string when nothing is active', () => {
    assert.equal(buildKnowledgeContext([]), '');
    assert.equal(
      buildKnowledgeContext([item({ name: 'x', content: 'y', status: 'error' })]),
      ''
    );
  });

  it('never includes the failed-import reason in chat context', () => {
    const context = buildKnowledgeContext([
      item({
        name: 'en.wikipedia.org',
        content: '',
        status: 'error',
        error: 'The site took too long to answer. Try again, or paste the text.',
      }),
      item({ id: 'k2', name: 'FAQ', content: 'Open daily', status: 'active' }),
    ]);
    assert.equal(context.includes('took too long'), false);
    assert.equal(context.includes('en.wikipedia.org'), false);
    assert.match(context, /Open daily/);
  });
});
