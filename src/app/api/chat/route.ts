import { NextResponse } from 'next/server';
import { ChatUseCase } from '../../../application/use-cases/ChatUseCase';
import { FileAgentRepository } from '../../../infrastructure/repositories/FileAgentRepository';
import { GeminiLLMService } from '../../../infrastructure/services/GeminiLLMService';

export async function POST(request: Request) {
  try {
    const { agentId, message, config, knowledge } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'LLM API Key configuration missing' }, { status: 500 });
    }

    const agentRepo = new FileAgentRepository();
    const llmService = new GeminiLLMService(apiKey);
    const chatUseCase = new ChatUseCase(agentRepo, llmService);

    let stream;
    if (agentId) {
      stream = await chatUseCase.execute(agentId, message);
    } else if (config && knowledge) {
      stream = await chatUseCase.executePreview(config, knowledge, message);
    } else {
      return NextResponse.json({ error: 'Either agentId or (config and knowledge) required' }, { status: 400 });
    }

    // Create a ReadableStream from the AsyncIterable
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

