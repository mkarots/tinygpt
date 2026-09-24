import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SlidingWindowRateLimit, clientAddress } from './rateLimit';

describe('SlidingWindowRateLimit', () => {
  it('allows calls inside the limit and rejects the next one', () => {
    let time = 1_000;
    const limit = new SlidingWindowRateLimit(2, 60_000, () => time);
    assert.equal(limit.allow('1.2.3.4'), true);
    assert.equal(limit.allow('1.2.3.4'), true);
    assert.equal(limit.allow('1.2.3.4'), false);
    assert.equal(limit.allow('5.6.7.8'), true);
  });

  it('allows again after the window passes', () => {
    let time = 1_000;
    const limit = new SlidingWindowRateLimit(1, 1_000, () => time);
    assert.equal(limit.allow('ip'), true);
    assert.equal(limit.allow('ip'), false);
    time = 2_100;
    assert.equal(limit.allow('ip'), true);
  });

  it('reads the first forwarded address', () => {
    const request = new Request('http://localhost/api/chat', {
      headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' },
    });
    assert.equal(clientAddress(request), '203.0.113.5');
  });
});
