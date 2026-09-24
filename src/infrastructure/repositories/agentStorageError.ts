/** Shown when PostgREST or Postgres reports that agent tables were never created. */
export const AGENT_STORAGE_NOT_SET_UP =
  'Agent storage is not set up. Apply supa_schema.sql in the Supabase SQL editor, then try again.';

type StorageError = {
  message?: string;
  code?: string;
};

function isMissingStorageRelation(error: StorageError): boolean {
  const code = error.code ?? '';
  if (code === 'PGRST205' || code === '42P01') return true;

  const message = error.message ?? '';
  if (/could not find the table/i.test(message) && /schema cache/i.test(message)) return true;
  return /relation ["']?[\w.]+["']? does not exist/i.test(message);
}

/**
 * Missing `profiles` / `agents` becomes operator guidance.
 * Other database failures keep their original detail.
 */
export function messageForAgentStorageFailure(error: StorageError, fallbackPrefix: string): string {
  if (isMissingStorageRelation(error)) return AGENT_STORAGE_NOT_SET_UP;
  const detail = error.message?.trim() || 'Unknown database error';
  return `${fallbackPrefix}: ${detail}`;
}

/** User-facing message, with the original PostgREST error kept as `cause` for logs. */
export function agentStorageFailure(error: StorageError, fallbackPrefix: string): Error {
  const failure = new Error(messageForAgentStorageFailure(error, fallbackPrefix));
  failure.cause = error;
  return failure;
}
