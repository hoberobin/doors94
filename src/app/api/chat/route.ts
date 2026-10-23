import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AgentManifest, buildSystemPrompt, validateAgentManifest } from '@/lib/agentManifest';
import { validateEnv } from '@/lib/env';
import { CHAT_MODEL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const envValidation = validateEnv();
if (!envValidation.valid && typeof window === 'undefined') {
  console.error('Environment validation failed:', envValidation.error);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_PROMPT_LENGTH = 4000; // Characters, roughly 1000 tokens

/**
 * Streams the assistant reply as plain text chunks. Validation problems and
 * upstream errors are returned as JSON with a non-2xx status before any
 * streaming starts, so clients check `response.ok` first.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { agentManifest, messages, mode } = body as {
      agentManifest?: AgentManifest;
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
      mode?: 'raw' | 'agent';
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured. Add it to .env.local and restart the dev server.' },
        { status: 500 }
      );
    }

    let systemPrompt: string | undefined = undefined;

    if (mode !== 'raw') {
      if (!agentManifest) {
        return NextResponse.json(
          { error: 'agentManifest is required when mode is not "raw"' },
          { status: 400 }
        );
      }

      const validation = validateAgentManifest(agentManifest);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Invalid agent manifest: ${validation.errors.join(', ')}` },
          { status: 400 }
        );
      }

      systemPrompt = buildSystemPrompt(agentManifest);

      if (systemPrompt.length > MAX_PROMPT_LENGTH) {
        return NextResponse.json(
          {
            error: `System prompt too long (${systemPrompt.length} chars, max ${MAX_PROMPT_LENGTH}). Please reduce agent manifest fields.`
          },
          { status: 400 }
        );
      }
    }

    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      openaiMessages.push({ role: 'system', content: systemPrompt });
    }

    openaiMessages.push(
      ...messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
    );

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: openaiMessages,
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
      cancel() {
        completion.controller.abort();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
