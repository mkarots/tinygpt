import { NextResponse } from 'next/server';
import { ProcessKnowledgeUseCase } from '../../../application/use-cases/ProcessKnowledgeUseCase';
import { FetchCrawlerService } from '../../../infrastructure/services/FetchCrawlerService';
import { GeminiLLMService } from '../../../infrastructure/services/GeminiLLMService';
import { createClient as createServerSupabase } from '../../../lib/supabase-server';

export type CrawlDeps = {
  getUser: () => Promise<{ id: string } | null>;
};

export async function handleCrawl(request: Request, deps?: CrawlDeps) {
  try {
    const user = deps
      ? await deps.getUser()
      : (await createServerSupabase()).auth.getUser().then(({ data }) => data.user);
    if (!user) {
      return NextResponse.json({ error: 'Sign in required to import a website' }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const crawlerService = new FetchCrawlerService();
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

export async function POST(request: Request) {
  return handleCrawl(request);
}
