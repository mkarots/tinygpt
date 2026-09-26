import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { knowledgeStatusLabel } from './knowledgeStatusLabel';

describe('knowledgeStatusLabel', () => {
  it('labels error as Failed, not Ready', () => {
    assert.equal(knowledgeStatusLabel('error'), 'Failed');
  });

  it('labels pending as Importing and active as Ready', () => {
    assert.equal(knowledgeStatusLabel('pending'), 'Importing');
    assert.equal(knowledgeStatusLabel('active'), 'Ready');
  });
});
