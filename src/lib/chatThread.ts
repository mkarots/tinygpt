import { ChatMessage } from '../../types';

export interface StoredThreadTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: number;
}

export function greetingMessage(greeting: string | undefined, now = Date.now()): ChatMessage {
  return {
    id: 'welcome',
    role: 'model',
    text: greeting?.trim() || 'Hello! How can I help you today?',
    timestamp: now,
  };
}

/** Greeting stays local. Stored turns follow it when a session already has messages. */
export function visibleThread(
  greeting: string | undefined,
  stored: StoredThreadTurn[],
  now = Date.now()
): ChatMessage[] {
  const welcome = greetingMessage(greeting, now);
  const turns = stored
    .filter((turn) => (turn.role === 'user' || turn.role === 'model') && turn.text.trim().length > 0)
    .map((turn) => ({
      id: turn.id,
      role: turn.role,
      text: turn.text,
      timestamp: turn.createdAt,
    }));
  return turns.length > 0 ? [welcome, ...turns] : [welcome];
}
