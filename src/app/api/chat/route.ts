import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { ChatUseCase } from '../../../application/use-cases/ChatUseCase';
import { IAgentRepository } from '../../../domain/interfaces/IAgentRepository';
import { IChatRepository } from '../../../domain/interfaces/IChatRepository';
import { ILLMService } from '../../../domain/interfaces/ILLMService';
import { SupabaseAgentRepository } from '../../../infrastructure/repositories/SupabaseAgentRepository';
import { SupabaseChatRepository } from '../../../infrastructure/repositories/SupabaseChatRepository';
import { GeminiLLMService } from '../../../infrastructure/services/GeminiLLMService';
import { CHAT_SESSION_COOKIE, readChatSessionId, readCookieValue } from '../../../lib/chatSession';
import {
  VISITOR_CHAT_CONNECT_ERROR,
  isVisitorChatInfrastructureError,
} from '../../../lib/chatSendError';
import { chatRateLimit, clientAddress } from '../../../lib/rateLimit';
import { createClient as createServerSupabase } from '../../../lib/supabase-server';
import { selectRecentChatTurns } from '../../../utils/chatHistory';

function visitorSafeChatError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Internal server error';
  if (isVisitorChatInfrastructureError(message)) return VISITOR_CHAT_CONNECT_ERROR;
  return message;
}

export type ChatRouteDeps = {
  repository: IAgentRepository;
  llm: ILLMService;
  chats?: IChatRepository;
  createSessionId?: () => string;
  rateLimit?: { allow(key: string): boolean };
};

function enforceChatRateLimit(request: Request, deps?: ChatRouteDeps): NextResponse | null {
  const limiter = deps ? deps.rateLimit : chatRateLimit;
  if (!limiter) return null;
  if (limiter.allow(clientAddress(request))) return null;
  return NextResponse.json({ error: 'Too many messages. Try again shortly.' }, { status: 429 });
}

function sessionFromRequest(request: Request, bodySessionId?: unknown): string | null {
  const url = new URL(request.url);
  return readChatSessionId({
    querySessionId: url.searchParams.get('session'),
    bodySessionId,
    cookieSessionId: readCookieValue(request.headers.get('cookie'), CHAT_SESSION_COOKIE),
  });
}

function withSessionCookie(response: NextResponse, request: Request, sessionId: string) {
  response.headers.set('X-Chat-Session', sessionId);
  response.cookies.set(CHAT_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    secure: new URL(request.url).protocol === 'https:',
  });
  return response;
}

async function resolveDeps(deps?: ChatRouteDeps): Promise<{
  agentRepo: IAgentRepository;
  llmService: ILLMService;
  chats?: IChatRepository;
} | NextResponse> {
  if (deps) {
    return { agentRepo: deps.repository, llmService: deps.llm, chats: deps.chats };
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'LLM API Key configuration missing' }, { status: 500 });
  }
  const supabase = await createServerSupabase();
  return {
    agentRepo: new SupabaseAgentRepository(supabase),
    llmService: new GeminiLLMService(apiKey),
    chats: new SupabaseChatRepository(supabase),
  };
}

export async function handleChatHistory(request: Request, deps?: ChatRouteDeps) {
  try {
    const limited = enforceChatRateLimit(request, deps);
    if (limited) return limited;

    const agentId = new URL(request.url).searchParams.get('agentId');
    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const chats = deps
      ? deps.chats
      : new SupabaseChatRepository(await createServerSupabase());
    if (!chats) {
      return NextResponse.json({ sessionId: null, messages: [] });
    }

    const sessionId = sessionFromRequest(request);
    if (!sessionId) {
      return NextResponse.json({ sessionId: null, messages: [] });
    }

    const chat = await chats.findByAgentAndSession(agentId, sessionId);
    const messages = chat ? await chats.listMessages(chat.id, sessionId) : [];
    return NextResponse.json({ sessionId, messages });
  } catch (error: unknown) {
    console.error('Chat history error:', error);
    return NextResponse.json({ error: visitorSafeChatError(error) }, { status: 500 });
  }
}

export async function handleChat(request: Request, deps?: ChatRouteDeps) {
  try {
    const limited = enforceChatRateLimit(request, deps);
    if (limited) return limited;

    const { agentId, message, config, knowledge, history, sessionId: bodySessionId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const recentHistory = selectRecentChatTurns(history, message);

    const resolved = await resolveDeps(deps);
    if (resolved instanceof NextResponse) return resolved;
    const chatUseCase = new ChatUseCase(resolved.agentRepo, resolved.llmService, resolved.chats);

    let stream;
    let hostedSessionId: string | null = null;
    if (agentId && resolved.chats) {
      hostedSessionId =
        sessionFromRequest(request, bodySessionId) ??
        (deps?.createSessionId ?? randomUUID)();
      stream = await chatUseCase.execute(agentId, message, recentHistory, {
        sessionId: hostedSessionId,
      });
    } else if (agentId) {
      stream = await chatUseCase.execute(agentId, message, recentHistory);
    } else if (config && knowledge) {
      stream = await chatUseCase.executePreview(config, knowledge, message, recentHistory);
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

    const response = new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
    return hostedSessionId ? withSessionCookie(response, request, hostedSessionId) : response;

  } catch (error: unknown) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: visitorSafeChatError(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handleChatHistory(request);
}

export async function POST(request: Request) {
  return handleChat(request);
}
