import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { documentTitle, documentTitleForAgent, TINYGPT_DOCUMENT_TITLE } from './pageTitle';

describe('documentTitle', () => {
  it('uses the owner-page pattern for a page label', () => {
    assert.equal(documentTitle('Log in'), 'Log in · TinyGPT');
    assert.equal(documentTitle('asafaf Assistant'), 'asafaf Assistant · TinyGPT');
  });

  it('trims the label', () => {
    assert.equal(documentTitle('  Log in  '), 'Log in · TinyGPT');
  });

  it('falls back to TinyGPT when there is no label', () => {
    assert.equal(documentTitle(), TINYGPT_DOCUMENT_TITLE);
    assert.equal(documentTitle(null), 'TinyGPT');
    assert.equal(documentTitle(''), 'TinyGPT');
    assert.equal(documentTitle('   '), 'TinyGPT');
  });
});

describe('documentTitleForAgent', () => {
  it('puts the agent name before TinyGPT', async () => {
    const title = await documentTitleForAgent('agent-1', async () => 'asafaf Assistant');
    assert.equal(title, 'asafaf Assistant · TinyGPT');
  });

  it('falls back when the agent is missing', async () => {
    const title = await documentTitleForAgent('missing', async () => null);
    assert.equal(title, 'TinyGPT');
  });

  it('falls back when the agent name is blank', async () => {
    const title = await documentTitleForAgent('agent-1', async () => '  ');
    assert.equal(title, 'TinyGPT');
  });

  it('falls back when the lookup throws', async () => {
    const title = await documentTitleForAgent('agent-1', async () => {
      throw new Error('Failed to load agent');
    });
    assert.equal(title, 'TinyGPT');
  });

  it('does not look up a missing id', async () => {
    let called = false;
    const title = await documentTitleForAgent('  ', async () => {
      called = true;
      return 'Should not run';
    });
    assert.equal(title, 'TinyGPT');
    assert.equal(called, false);
  });
});
