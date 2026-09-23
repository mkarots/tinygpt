import { ILLMService } from '../../domain/interfaces/ILLMService';
import { AgentConfig } from '../../domain/entities/Agent';
import { KnowledgeItem } from '../../domain/entities/KnowledgeSource';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatTurn } from '../../domain/entities/Chat';
import { buildKnowledgeContext } from '../../utils/knowledgeContext';

export class GeminiLLMService implements ILLMService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error("API Key is missing");
    this.client = new GoogleGenAI({ apiKey });
  }

  async clean(text: string): Promise<string> {
    if (text.length <= 100) return text;

    try {
        const response = await this.client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [{
            role: "user",
            parts: [{
                text: `You are a web scraper helper. Your job is to clean up the following text extracted from a webpage.
                
                Instructions:
                1. Preserve all useful information (product details, pricing, FAQs, documentation, blog content).
                2. REMOVE navigation menus, website footers (copyright, links), advertisements, cookie notices, and sidebar links.
                3. Keep the structure (headings, lists) intact.
                4. Output ONLY the cleaned markdown.

                --- RAW CONTENT ---
                ${text.slice(0, 30000)}
                --- END RAW CONTENT ---`
            }]
            }]
        });

        const llmCleaned = response.candidates?.[0]?.content?.parts?.[0]?.text;
        return llmCleaned || text;
    } catch (e) {
        console.error("LLM Cleaning failed, using raw markdown:", e);
        return text;
    }
  }

  async chat(
    message: string,
    knowledge: KnowledgeItem[],
    config: AgentConfig,
    history: ChatTurn[] = []
  ): Promise<AsyncIterable<string>> {
      const context = buildKnowledgeContext(knowledge);

      const systemInstruction = `
You are an AI assistant named "${config.name}".
${this.getToneInstruction(config.tone)}

Your primary goal is to help users based STRICTLY on the provided knowledge base.

CORE KNOWLEDGE BASE:
<knowledge_base>
${context || "No relevant knowledge found for this query."}
</knowledge_base>

INSTRUCTIONS:
1. Answer ONLY based on the information in the <knowledge_base>.
2. If the answer is not in the knowledge base, strictly say: "I don't have that information in my knowledge base."
3. Do not use outside knowledge or hallucinate facts.
4. Keep your responses aligned with your persona: ${config.tone}.
5. If asked about your identity, describe yourself as ${config.name}, a custom AI assistant.
`;

      const chatSession = this.client.chats.create({
        model: 'gemini-2.0-flash',
        config: {
          systemInstruction,
          temperature: config.tone === 'humorous' ? 0.7 : 0.2,
        },
        ...(history.length > 0
          ? {
              history: history.map((turn) => ({
                role: turn.role,
                parts: [{ text: turn.text }],
              })),
            }
          : {}),
      });

      const resultStream = await chatSession.sendMessageStream({ message });

      async function* streamGenerator() {
          for await (const chunk of resultStream) {
             const c = chunk as GenerateContentResponse;
             if (c.text) {
                 yield c.text;
             }
          }
      }

      return streamGenerator();
  }

  private getToneInstruction(tone: AgentConfig['tone']) {
    switch (tone) {
        case 'professional': return "You are polite, formal, and strictly business-like. Avoid emojis or casual slang.";
        case 'friendly': return "You are warm, helpful, and conversational. Feel free to be approachable and kind.";
        case 'concise': return "You are direct and to the point. Give short, efficient answers with minimal fluff.";
        case 'humorous': return "You are witty and light-hearted. You can use appropriate humor while remaining helpful.";
        default: return "You are a helpful assistant.";
    }
  }
}
