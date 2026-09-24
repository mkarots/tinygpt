import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AGENT_STORAGE_NOT_SET_UP,
  agentStorageFailure,
  messageForAgentStorageFailure,
} from './agentStorageError';

describe('messageForAgentStorageFailure', () => {
  it('replaces the PostgREST schema-cache message for a missing agents table', () => {
    const message = messageForAgentStorageFailure(
      {
        code: 'PGRST205',
        message: "Could not find the table 'public.agents' in the schema cache",
      },
      'Failed to save agent',
    );
    assert.equal(message, AGENT_STORAGE_NOT_SET_UP);
    assert.equal(message.includes('schema cache'), false);
  });

  it('treats a missing profiles table the same way', () => {
    const message = messageForAgentStorageFailure(
      { message: "Could not find the table 'public.profiles' in the schema cache" },
      'Failed to save profile',
    );
    assert.equal(message, AGENT_STORAGE_NOT_SET_UP);
  });

  it('treats Postgres undefined_table as storage that is not set up', () => {
    const message = messageForAgentStorageFailure(
      { code: '42P01', message: 'relation "public.agents" does not exist' },
      'Failed to save agent',
    );
    assert.equal(message, AGENT_STORAGE_NOT_SET_UP);
  });

  it('keeps unrelated database errors', () => {
    const message = messageForAgentStorageFailure({ message: 'db down' }, 'Failed to save agent');
    assert.equal(message, 'Failed to save agent: db down');
  });

  it('uses a fallback detail when the database error has no message', () => {
    const message = messageForAgentStorageFailure({}, 'Failed to list agents');
    assert.equal(message, 'Failed to list agents: Unknown database error');
  });

  it('ignores a blank message', () => {
    const message = messageForAgentStorageFailure({ message: '   ' }, 'Failed to save agent');
    assert.equal(message, 'Failed to save agent: Unknown database error');
  });

  it('keeps the original database error as the cause', () => {
    const original = {
      code: 'PGRST205',
      message: "Could not find the table 'public.agents' in the schema cache",
    };
    const failure = agentStorageFailure(original, 'Failed to save agent');
    assert.equal(failure.message, AGENT_STORAGE_NOT_SET_UP);
    assert.equal(failure.cause, original);
  });
});
