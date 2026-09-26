const NETWORK_MESSAGES = new Set([
  'Failed to fetch',
  'Load failed',
  'NetworkError when attempting to fetch resource.',
  'network error',
]);

/** Visitor copy when chat storage or PostgREST is unavailable. */
export const VISITOR_CHAT_CONNECT_ERROR =
  "I'm having trouble connecting right now. Please try again.";

/**
 * True when the failure is a missing RPC, schema-cache miss, or other
 * chat-repository database detail that must not reach a visitor.
 */
export function isVisitorChatInfrastructureError(message: string): boolean {
  const text = message.trim();
  if (!text) return false;
  if (/schema cache/i.test(text)) return true;
  if (/could not find the function/i.test(text)) return true;
  if (/\bPGRST20[0-9]\b/i.test(text)) return true;
  if (/^Failed to (load|create) chat(?::|$)/i.test(text)) return true;
  if (/^Failed to (load|save) messages?(?::|$)/i.test(text)) return true;
  return false;
}

/**
 * Visitor-facing send failure. Prefer the server's reason over a dead-end line,
 * except when the reason is infrastructure jargon.
 */
export function chatSendErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (NETWORK_MESSAGES.has(message)) {
      return "Couldn't reach the server. Check your connection and try again.";
    }
    if (isVisitorChatInfrastructureError(message)) {
      return VISITOR_CHAT_CONNECT_ERROR;
    }
    if (message && message !== 'Failed to send message' && message !== 'No response body') {
      return message;
    }
  }
  return "Couldn't send that message. The server did not explain why. Try again.";
}
