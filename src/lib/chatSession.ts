export const CHAT_SESSION_COOKIE = 'tinygpt_session';

const SESSION_TOKEN = /^[A-Za-z0-9_-]{8,128}$/;

export function isChatSessionId(value: unknown): value is string {
  return typeof value === 'string' && SESSION_TOKEN.test(value);
}

/** Query wins, then an explicit body id, then the cookie. Invalid values are skipped. */
export function readChatSessionId(input: {
  querySessionId?: unknown;
  bodySessionId?: unknown;
  cookieSessionId?: unknown;
}): string | null {
  for (const candidate of [input.querySessionId, input.bodySessionId, input.cookieSessionId]) {
    if (isChatSessionId(candidate)) return candidate;
  }
  return null;
}

export function readCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    const raw = part.slice(separator + 1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}
