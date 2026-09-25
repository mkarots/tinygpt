import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { signOutToLanding } from './signOutToLanding';

describe('signOutToLanding', () => {
  it('clears the session before sending the visitor to /', async () => {
    const calls: string[] = [];
    await signOutToLanding({
      signOut: async () => {
        calls.push('signOut');
      },
      goToLanding: () => {
        calls.push('home');
      },
    });
    assert.deepEqual(calls, ['signOut', 'home']);
  });
});
