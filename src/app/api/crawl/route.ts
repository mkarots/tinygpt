import { NextResponse } from 'next/server';
import { ProcessKnowledgeUseCase } from '../../../application/use-cases/ProcessKnowledgeUseCase';
import { PuppeteerCrawlerService } from '../../../infrastructure/services/PuppeteerCrawlerService';
import { GeminiLLMService } from '../../../infrastructure/services/GeminiLLMService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const crawlerService = new PuppeteerCrawlerService();
    // Prioritize server-side key
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
        console.warn("Gemini API Key missing");
        // We might proceed without cleaning if no key, but LLMService throws if no key.
        // For now fail.
        return NextResponse.json({ error: 'LLM API Key configuration missing' }, { status: 500 });
    }
    const llmService = new GeminiLLMService(apiKey);
    const useCase = new ProcessKnowledgeUseCase(crawlerService, llmService);
    const result = await useCase.execute(url);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Crawl error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during crawling' },
      { status: 500 }
    );
  }
}
