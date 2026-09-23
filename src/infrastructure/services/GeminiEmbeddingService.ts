import { GoogleGenAI } from "@google/genai";

export type EmbedContentFn = (params: {
  model: string;
  contents: string | string[];
}) => Promise<{ embeddings?: Array<{ values?: number[] }> }>;

export function firstEmbeddingValues(
  response: { embeddings?: Array<{ values?: number[] }> }
): number[] {
  const values = response.embeddings?.[0]?.values;
  if (!values?.length) {
    throw new Error("Failed to generate embedding");
  }
  return values;
}

export function embeddingValuesList(
  response: { embeddings?: Array<{ values?: number[] }> },
  expectedCount: number
): number[][] {
  const embeddings = response.embeddings ?? [];
  if (embeddings.length !== expectedCount) {
    throw new Error("Failed to generate embedding");
  }
  return embeddings.map((embedding) => {
    if (!embedding.values?.length) {
      throw new Error("Failed to generate embedding");
    }
    return embedding.values;
  });
}

export class GeminiEmbeddingService {
  private model = "text-embedding-004";
  private embedContent: EmbedContentFn;

  constructor(apiKey: string, embedContent?: EmbedContentFn) {
    if (!apiKey) throw new Error("API Key is missing for Embeddings");
    if (embedContent) {
      this.embedContent = embedContent;
      return;
    }
    const client = new GoogleGenAI({ apiKey });
    this.embedContent = (params) => client.models.embedContent(params);
  }

  async embedText(text: string): Promise<number[]> {
    const response = await this.embedContent({
      model: this.model,
      contents: text,
    });
    return firstEmbeddingValues(response);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const response = await this.embedContent({
      model: this.model,
      contents: texts,
    });
    return embeddingValuesList(response, texts.length);
  }
}
