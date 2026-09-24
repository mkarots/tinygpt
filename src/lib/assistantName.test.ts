import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assistantNameForCompany, DEFAULT_ASSISTANT_NAME } from './assistantName';

describe('assistantNameForCompany', () => {
  it('turns the default Support Bot into the company assistant name', () => {
    assert.equal(
      assistantNameForCompany('Harbor Street Bakery', DEFAULT_ASSISTANT_NAME),
      'Harbor Street Bakery Assistant'
    );
  });

  it('keeps updating while the name is still the derived company name', () => {
    assert.equal(
      assistantNameForCompany('Harbor Street', 'Harbor Assistant', 'Harbor'),
      'Harbor Street Assistant'
    );
  });

  it('leaves a hand-edited assistant name alone', () => {
    assert.equal(
      assistantNameForCompany('Harbor Street Bakery', 'Bakery Bot', 'Harbor'),
      'Bakery Bot'
    );
  });

  it('restores the default when an automatic name loses its company', () => {
    assert.equal(
      assistantNameForCompany('   ', 'Harbor Street Bakery Assistant', 'Harbor Street Bakery'),
      DEFAULT_ASSISTANT_NAME
    );
  });

  it('fills a blank assistant name and the old unused sentinel', () => {
    assert.equal(assistantNameForCompany('Acme', ''), 'Acme Assistant');
    assert.equal(assistantNameForCompany('Acme', 'Tiny Support Assistant'), 'Acme Assistant');
  });
});
