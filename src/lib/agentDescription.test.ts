import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  agentDescriptionForCompany,
  BOILERPLATE_AGENT_DESCRIPTION,
  derivedAgentDescription,
  isBoilerplateAgentDescription,
} from './agentDescription';

describe('agentDescription', () => {
  it('treats blank and the old default as boilerplate', () => {
    assert.equal(isBoilerplateAgentDescription(''), true);
    assert.equal(isBoilerplateAgentDescription('   '), true);
    assert.equal(isBoilerplateAgentDescription(BOILERPLATE_AGENT_DESCRIPTION), true);
    assert.equal(isBoilerplateAgentDescription('Answers questions about Acme.'), false);
  });

  it('derives a short line from the company name', () => {
    assert.equal(derivedAgentDescription(''), '');
    assert.equal(derivedAgentDescription('  Hartwell Ceramics '), 'Answers questions about Hartwell Ceramics.');
  });

  it('fills from the company while the description is still automatic', () => {
    assert.equal(
      agentDescriptionForCompany('Acme', BOILERPLATE_AGENT_DESCRIPTION),
      'Answers questions about Acme.'
    );
    assert.equal(
      agentDescriptionForCompany('Beta', 'Answers questions about Acme.', 'Acme'),
      'Answers questions about Beta.'
    );
    assert.equal(
      agentDescriptionForCompany('Acme', 'Custom shop help.'),
      'Custom shop help.'
    );
  });
});
