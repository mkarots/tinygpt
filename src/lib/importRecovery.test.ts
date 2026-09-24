import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { blocksKnowledgeStep, needsImportRecovery } from './importRecovery';

describe('import recovery', () => {
  it('asks for another source after a failed site import', () => {
    assert.equal(needsImportRecovery([{ type: 'url', status: 'error' }]), true);
    assert.equal(needsImportRecovery([{ type: 'url', status: 'active' }]), false);
    assert.equal(needsImportRecovery([]), false);
  });

  it('blocks Next while the only knowledge is a failed import', () => {
    assert.equal(blocksKnowledgeStep([{ type: 'url', status: 'error' }]), true);
  });

  it('allows Next after the user adds text or a file', () => {
    assert.equal(
      blocksKnowledgeStep([
        { type: 'url', status: 'error' },
        { type: 'text', status: 'active' },
      ]),
      false
    );
  });
});
