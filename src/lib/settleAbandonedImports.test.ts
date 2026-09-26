import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { KnowledgeItem } from '../../types';
import {
  ABANDONED_IMPORT_ERROR,
  settleAbandonedImports,
  websiteRetryUrl,
} from './settleAbandonedImports';

function item(partial: Partial<KnowledgeItem> & Pick<KnowledgeItem, 'status'>): KnowledgeItem {
  return {
    id: 'k1',
    type: 'url',
    name: 'gb.maxmara.com',
    content: '',
    dateAdded: 1,
    ...partial,
  };
}

describe('settleAbandonedImports', () => {
  it('turns pending rows into Failed with a reason', () => {
    const [settled] = settleAbandonedImports([item({ status: 'pending' })]);
    assert.equal(settled.status, 'error');
    assert.equal(settled.error, ABANDONED_IMPORT_ERROR);
    assert.equal(settled.name, 'gb.maxmara.com');
  });

  it('leaves Ready and Failed rows unchanged', () => {
    const ready = item({ status: 'active', content: 'text', name: 'Example Domain' });
    const failed = item({ status: 'error', error: 'Timed out' });
    const settled = settleAbandonedImports([ready, failed]);
    assert.deepEqual(settled, [ready, failed]);
  });

  it('keeps an existing error message on a pending row', () => {
    const [settled] = settleAbandonedImports([
      item({ status: 'pending', error: 'Already explained' }),
    ]);
    assert.equal(settled.status, 'error');
    assert.equal(settled.error, 'Already explained');
  });
});

describe('websiteRetryUrl', () => {
  it('builds https URL from a hostname name', () => {
    assert.equal(websiteRetryUrl({ type: 'url', name: 'example.com' }), 'https://example.com/');
  });

  it('returns null for non-url rows or empty names', () => {
    assert.equal(websiteRetryUrl({ type: 'text', name: 'FAQ' }), null);
    assert.equal(websiteRetryUrl({ type: 'url', name: '  ' }), null);
  });
});
