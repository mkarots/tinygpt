import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { profileFromAuthUser } from './profileFromAuthUser';

describe('profileFromAuthUser', () => {
  it('maps Google metadata onto a profiles row', () => {
    const row = profileFromAuthUser(
      {
        id: '11111111-1111-4111-8111-111111111111',
        email: 'a@example.com',
        user_metadata: { full_name: 'Ada', avatar_url: 'https://example.com/a.png' },
      },
      '2026-09-23T00:00:00.000Z'
    );
    assert.deepEqual(row, {
      id: '11111111-1111-4111-8111-111111111111',
      email: 'a@example.com',
      full_name: 'Ada',
      avatar_url: 'https://example.com/a.png',
      updated_at: '2026-09-23T00:00:00.000Z',
    });
  });

  it('falls back to name and picture when full_name is missing', () => {
    const row = profileFromAuthUser(
      {
        id: '22222222-2222-4222-8222-222222222222',
        email: null,
        user_metadata: { name: 'Grace', picture: 'https://example.com/g.png' },
      },
      '2026-09-23T00:00:00.000Z'
    );
    assert.equal(row.full_name, 'Grace');
    assert.equal(row.avatar_url, 'https://example.com/g.png');
    assert.equal(row.email, null);
  });

  it('leaves name and avatar empty when metadata is missing', () => {
    const row = profileFromAuthUser(
      { id: '33333333-3333-4333-8333-333333333333' },
      '2026-09-23T00:00:00.000Z'
    );
    assert.equal(row.full_name, null);
    assert.equal(row.avatar_url, null);
    assert.equal(row.email, null);
  });
});
