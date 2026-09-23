import { ChatTurn } from '../domain/entities/Chat';

export const DEFAULT_CHAT_HISTORY_LIMIT = 20;

export type { ChatTurn };

export interface ChatTurnInput {
  role?: string;
  text?: string;
  isStreaming?: boolean;
}

/**
 * Window prior turns for a new LLM call.
 * Drops empties/streaming, the current user message, a leading greeting
 * (Gemini history must start with user), and a trailing unmatched user.
 * Caps at `limit` (default 20).
 */
export function selectRecentChatTurns(
  raw: ChatTurnInput[] | undefined,
  currentMessage: string,
  limit: number = DEFAULT_CHAT_HISTORY_LIMIT
): ChatTurn[] {
  const completed: ChatTurn[] = [];

  for (const item of raw ?? []) {
    if (item.isStreaming) continue;
    if (item.role !== 'user' && item.role !== 'model') continue;
    const text = typeof item.text === 'string' ? item.text.trim() : '';
    if (!text) continue;
    completed.push({ role: item.role, text });
  }

  const current = currentMessage.trim();
  const last = completed[completed.length - 1];
  if (last?.role === 'user' && last.text === current) {
    completed.pop();
  }

  while (completed[0]?.role === 'model') {
    completed.shift();
  }

  if (completed[completed.length - 1]?.role === 'user') {
    completed.pop();
  }

  const cap = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_CHAT_HISTORY_LIMIT;
  return completed.slice(-cap);
}
