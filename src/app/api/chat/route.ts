import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AgentManifest, buildSystemPrompt, validateAgentManifest } from '@/lib/agentManifest';
import { validateEnv } from '@/lib/env';

// Validate environment on module load
const envValidation = validateEnv();
if (!envValidation.valid && typeof window === 'undefined') {
  console.error('Environment validation failed:', envValidation.error);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_PROMPT_LENGTH = 4000; // Characters, roughly 1000 tokens

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { agentManifest, messages, mode } = body as {
      agentManifest?: AgentManifest;
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
      mode?: 'raw' | 'agent';
    };

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    let systemPrompt: string | undefined = undefined;

    // Handle raw mode (no system prompt)
    if (mode === 'raw') {
      systemPrompt = undefined;
    } else {
      // Agent mode - require manifest
      if (!agentManifest) {
        return NextResponse.json(
          { error: 'agentManifest is required when mode is not "raw"' },
          { status: 400 }
        );
      }

      // Validate manifest
      const validation = validateAgentManifest(agentManifest);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Invalid agent manifest: ${validation.errors.join(', ')}` },
          { status: 400 }
        );
      }

      // Build system prompt from manifest
      systemPrompt = buildSystemPrompt(agentManifest);

      // Check prompt length
      if (systemPrompt.length > MAX_PROMPT_LENGTH) {
        return NextResponse.json(
          { 
            error: `System prompt too long (${systemPrompt.length} chars, max ${MAX_PROMPT_LENGTH}). Please reduce agent manifest fields.` 
          },
          { status: 400 }
        );
      }
    }

    // Build messages array for OpenAI
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    
    // Add system message if present
    if (systemPrompt) {
      openaiMessages.push({
        role: 'system',
        content: systemPrompt,
      });
    }
    
    // Add user/assistant messages (filter out any system messages from client)
    openaiMessages.push(
      ...messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
    );
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ content: assistantMessage });
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
