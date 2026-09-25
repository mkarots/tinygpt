import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  companyInfoFromAgent,
  companyNameFromAssistant,
  configWithCompany,
  storedCompanyFromConfig,
} from './agentCompany';
import { PRODUCT_TERRACOTTA } from './productTheme';
import type { AgentConfig, KnowledgeItem } from '../../types';

const baseConfig: AgentConfig = {
  name: 'Support Bot',
  description: 'Help',
  primaryColor: PRODUCT_TERRACOTTA,
  greeting: 'Hi',
  tone: 'friendly',
  quickQuestions: [],
};

function urlKnowledge(name: string): KnowledgeItem {
  return {
    id: `url-${name}`,
    type: 'url',
    name,
    content: '',
    status: 'active',
    dateAdded: 1,
  };
}

describe('companyNameFromAssistant', () => {
  it('unwraps a derived company assistant name', () => {
    assert.equal(companyNameFromAssistant('Hartwell Assistant'), 'Hartwell');
  });

  it('leaves a hand-set assistant name empty so we do not invent a company', () => {
    assert.equal(companyNameFromAssistant('Support Bot'), '');
    assert.equal(companyNameFromAssistant('Desk'), '');
  });
});

describe('companyInfoFromAgent', () => {
  it('prefers stored company fields', () => {
    const info = companyInfoFromAgent({
      config: {
        ...baseConfig,
        name: 'Desk',
        company: { name: 'Hartwell', website: 'https://hartwell.example', industry: 'ecommerce' },
      },
      knowledge: [urlKnowledge('other.example')],
    });
    assert.deepEqual(info, {
      name: 'Hartwell',
      website: 'https://hartwell.example',
      industry: 'ecommerce',
    });
  });

  it('falls back to the assistant name and imported host', () => {
    const info = companyInfoFromAgent({
      config: { ...baseConfig, name: 'asafaf Assistant' },
      knowledge: [urlKnowledge('gb.maxmara.com')],
    });
    assert.equal(info.name, 'asafaf');
    assert.equal(info.website, 'https://gb.maxmara.com');
    assert.equal(info.industry, '');
  });
});

describe('configWithCompany', () => {
  it('writes trimmed company fields onto config so the next edit can load them', () => {
    const next = configWithCompany(baseConfig, {
      name: ' Hartwell ',
      website: ' https://hartwell.example ',
      industry: 'ecommerce',
    });
    assert.deepEqual(next.company, {
      name: 'Hartwell',
      website: 'https://hartwell.example',
      industry: 'ecommerce',
    });
    assert.deepEqual(storedCompanyFromConfig(next), next.company);
  });
});
