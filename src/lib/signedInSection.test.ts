import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { signedInSection } from './signedInSection';

describe('signedInSection', () => {
  it('names the agent list and hides the back link there', () => {
    const section = signedInSection('/admin');
    assert.equal(section.label, 'Your agents');
    assert.equal(section.title, 'Your agents · TinyGPT');
    assert.equal(section.showBackToAgents, false);
  });

  it('names the builder and share pages and links back to Your agents', () => {
    assert.deepEqual(signedInSection('/admin/new'), {
      label: 'New agent',
      title: 'New agent · TinyGPT',
      showBackToAgents: true,
    });
    assert.deepEqual(signedInSection('/admin/share/agent-1'), {
      label: 'Share',
      title: 'Share · TinyGPT',
      showBackToAgents: true,
    });
  });

  it('names the internal prospector without treating it as the product home', () => {
    const section = signedInSection('/internal/prospector');
    assert.equal(section.label, 'Prospector');
    assert.equal(section.showBackToAgents, true);
  });
});
