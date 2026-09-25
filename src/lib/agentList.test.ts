import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  agentListSubtitle,
  formatAgentCreatedAt,
  siteFromKnowledge,
  websiteFromSite,
} from './agentList';
import { OwnedAgentSummary } from '../domain/interfaces/IAgentRepository';

function row(partial: Partial<OwnedAgentSummary> & Pick<OwnedAgentSummary, 'id' | 'name'>): OwnedAgentSummary {
  return {
    description: 'A helpful assistant for our customers.',
    createdAt: Date.parse('2026-03-04T00:00:00.000Z'),
    site: null,
    ...partial,
  };
}

describe('siteFromKnowledge', () => {
  it('returns the first url item name', () => {
    assert.equal(
      siteFromKnowledge([
        { type: 'text', name: 'FAQ' },
        { type: 'url', name: 'hartwell.example' },
      ]),
      'hartwell.example'
    );
  });

  it('returns null when there is no url item', () => {
    assert.equal(siteFromKnowledge([{ type: 'file', name: 'notes.txt' }]), null);
    assert.equal(siteFromKnowledge(null), null);
  });
});

describe('agentListSubtitle', () => {
  it('is hidden when the name is unique', () => {
    const agents = [row({ id: 'a', name: 'Support Bot' }), row({ id: 'b', name: 'Sales' })];
    assert.equal(agentListSubtitle(agents[0], agents), null);
  });

  it('prefers the site when two rows share a name', () => {
    const agents = [
      row({ id: 'a', name: 'Support Bot', site: 'alpha.example' }),
      row({ id: 'b', name: 'Support Bot', site: 'beta.example' }),
    ];
    assert.equal(agentListSubtitle(agents[0], agents), 'alpha.example');
    assert.equal(agentListSubtitle(agents[1], agents), 'beta.example');
  });

  it('uses the created date when copies have no site', () => {
    const agents = [
      row({ id: 'a', name: 'Support Bot', createdAt: Date.parse('2026-01-02T00:00:00.000Z') }),
      row({ id: 'b', name: 'Support Bot', createdAt: Date.parse('2026-09-25T00:00:00.000Z') }),
    ];
    assert.equal(agentListSubtitle(agents[0], agents), '2 Jan 2026');
    assert.equal(agentListSubtitle(agents[1], agents), '25 Sep 2026');
  });
});

describe('websiteFromSite', () => {
  it('turns a hostname into an https URL and leaves titles empty', () => {
    assert.equal(websiteFromSite('gb.maxmara.com'), 'https://gb.maxmara.com');
    assert.equal(websiteFromSite('https://shop.example/pages/returns'), 'https://shop.example/pages/returns');
    assert.equal(websiteFromSite('Composo - Teaching machines the human definition of quality'), '');
    assert.equal(websiteFromSite(null), '');
  });
});

describe('formatAgentCreatedAt', () => {
  it('formats in UTC so list tests do not depend on the host timezone', () => {
    assert.equal(formatAgentCreatedAt(Date.parse('2026-09-25T00:00:00.000Z')), '25 Sep 2026');
  });
});
