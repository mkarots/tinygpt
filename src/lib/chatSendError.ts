const NETWORK_MESSAGES = new Set([
  'Failed to fetch',
  'Load failed',
  'NetworkError when attempting to fetch resource.',
  'network error',
]);

/**
 * Visitor-facing send failure. Prefer the server's reason over a dead-end line.
 */
export function chatSendErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (NETWORK_MESSAGES.has(message)) {
      return "Couldn't reach the server. Check your connection and try again.";
    }
    if (message && message !== 'Failed to send message' && message !== 'No response body') {
      return message;
    }
  }
  return "Couldn't send that message. The server did not explain why. Try again.";
}
