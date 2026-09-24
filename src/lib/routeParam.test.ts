import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { singleRouteParam } from './routeParam';

describe('singleRouteParam', () => {
  it('returns a route id string', () => {
    assert.equal(singleRouteParam('11111111-1111-4111-8111-111111111111'), '11111111-1111-4111-8111-111111111111');
  });

  it('reads the first entry when Next passes a list', () => {
    assert.equal(singleRouteParam(['agent-1']), 'agent-1');
  });

  it('returns undefined for a missing or blank id', () => {
    assert.equal(singleRouteParam(undefined), undefined);
    assert.equal(singleRouteParam(null), undefined);
    assert.equal(singleRouteParam(''), undefined);
    assert.equal(singleRouteParam('   '), undefined);
    assert.equal(singleRouteParam([]), undefined);
  });
});
