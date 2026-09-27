/** One message already held for a browser session. OwnChat does not read agent facts. */
export interface OwnChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: number;
}

/**
 * Threads already held, keyed by agent and browser session.
 * Opening a chat does not replace this value.
 */
export interface ChatState {
  readonly threads: Readonly<Record<string, readonly OwnChatMessage[]>>;
}

export interface OpenOwnChatInput {
  ownerId: string;
  agentOwnerId: string;
  agentId: string;
  /** This browser’s session with the agent. Null when this browser has no stored thread yet. */
  sessionId: string | null;
}

export const OWN_CHAT_STATEMENT =
  "This is this browser's chat. It is not questions from other people.";

export interface OpenedOwnChat {
  thread: readonly OwnChatMessage[];
  statement: typeof OWN_CHAT_STATEMENT;
  state: ChatState;
}

function sessionKey(agentId: string, sessionId: string | null): string {
  return `${agentId}:${sessionId ?? ''}`;
}

/** ChatState for one browser session. Other sessions are not included. */
export function chatStateFromSession(
  agentId: string,
  sessionId: string | null,
  messages: readonly OwnChatMessage[]
): ChatState {
  return { threads: { [sessionKey(agentId, sessionId)]: messages } };
}

/**
 * This browser’s thread for an agent the owner owns, plus the own-chat statement.
 * Returns null when the person does not own the agent. Does not change ChatState.
 */
export function openOwnChat(state: ChatState, input: OpenOwnChatInput): OpenedOwnChat | null {
  if (!input.ownerId || input.ownerId !== input.agentOwnerId) return null;
  if (!input.agentId) return null;
  const thread = state.threads[sessionKey(input.agentId, input.sessionId)] ?? [];
  return {
    thread,
    statement: OWN_CHAT_STATEMENT,
    state,
  };
}
