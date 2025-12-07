
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AgentConfig, KnowledgeItem } from "../types";

let chatSession: Chat | null = null;
let currentConfig: AgentConfig | null = null;
let currentContext: string = "";

const getToneInstruction = (tone: AgentConfig['tone']) => {
  switch (tone) {
    case 'professional': return "You are polite, formal, and strictly business-like. Avoid emojis or casual slang.";
    case 'friendly': return "You are warm, helpful, and conversational. Feel free to be approachable and kind.";
    case 'concise': return "You are direct and to the point. Give short, efficient answers with minimal fluff.";
    case 'humorous': return "You are witty and light-hearted. You can use appropriate humor while remaining helpful.";
    default: return "You are a helpful assistant.";
  }
};

const createSystemInstruction = (context: string, config: AgentConfig) => `
You are an AI assistant named "${config.name}".
${getToneInstruction(config.tone)}

Your primary goal is to help users based STRICTLY on the provided knowledge base.

CORE KNOWLEDGE BASE:
<knowledge_base>
${context}
</knowledge_base>

INSTRUCTIONS:
1. Answer ONLY based on the information in the <knowledge_base>.
2. If the answer is not in the knowledge base, strictly say: "I don't have that information in my knowledge base."
3. Do not use outside knowledge or hallucinate facts.
4. Keep your responses aligned with your persona: ${config.tone}.
5. If asked about your identity, describe yourself as ${config.name}, a custom AI assistant.
`;

export const initializeChat = async (knowledge: KnowledgeItem[], config: AgentConfig) => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return;
  }

  // Combine all active knowledge content
  const fullContext = knowledge
    .filter(k => k.status === 'active')
    .map(k => `--- SOURCE: ${k.name} (${k.type}) ---\n${k.content}\n--- END SOURCE ---`)
    .join('\n\n');

  // Only recreate if context or config changed significantly to save resources
  // In this MVP we strictly recreate to ensure settings apply immediately
  const ai = new GoogleGenAI({ apiKey });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: createSystemInstruction(fullContext, config),
      temperature: config.tone === 'humorous' ? 0.7 : 0.2,
    },
  });

  currentContext = fullContext;
  currentConfig = config;
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void
): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Please add knowledge sources first.");
  }

  let fullResponse = "";
  
  try {
    const resultStream = await chatSession.sendMessageStream({ message });

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullResponse += c.text;
        onChunk(fullResponse);
      }
    }
  } catch (error) {
    console.error("Error sending message:", error);
    // Silent fail in UI, let the component handle the error display
    throw error;
  }

  return fullResponse;
};
