import { AgentConfig, ChatMessage, KnowledgeItem } from "../types";

let currentConfig: AgentConfig | null = null;
let currentKnowledge: KnowledgeItem[] | null = null;
let currentAgentId: string | null = null;

export const initializeChat = async (knowledge: KnowledgeItem[], config: AgentConfig, agentId?: string) => {
  currentKnowledge = knowledge;
  currentConfig = config;
  currentAgentId = agentId || null;
};

export const loadChatTranscript = async (
  agentId: string,
  sessionId?: string
): Promise<{ sessionId: string | null; messages: { id: string; role: 'user' | 'model'; text: string; createdAt: number }[] }> => {
  const params = new URLSearchParams({ agentId });
  if (sessionId) params.set('session', sessionId);
  const response = await fetch(`/api/chat?${params.toString()}`);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load chat');
  }
  return response.json();
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void,
  priorMessages: ChatMessage[] = [],
  sessionId?: string
): Promise<{ text: string; sessionId: string | null }> => {
  let fullResponse = "";
  
  const body: any = {
    message,
    history: priorMessages.map(({ role, text, isStreaming }) => ({
      role,
      text,
      isStreaming,
    })),
  };
  
  if (sessionId) {
    body.sessionId = sessionId;
  }

  if (currentAgentId) {
    body.agentId = currentAgentId;
  } else if (currentConfig && currentKnowledge) {
    body.config = currentConfig;
    body.knowledge = currentKnowledge;
  } else {
    throw new Error("Chat not initialized.");
  }

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
     const err = await response.json().catch(() => ({}));
     throw new Error(
       typeof err.error === 'string' && err.error.trim()
         ? err.error
         : `Couldn't send that message (HTTP ${response.status}).`
     );
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    fullResponse += text;
    onChunk(fullResponse);
  }
  
  return {
    text: fullResponse,
    sessionId: response.headers.get('X-Chat-Session'),
  };
};
