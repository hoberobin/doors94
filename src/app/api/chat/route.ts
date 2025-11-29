import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AgentManifest, buildSystemPrompt, validateAgentManifest } from '@/lib/agentManifest';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_PROMPT_LENGTH = 4000; // Characters, roughly 1000 tokens

export async function POST(request: NextRequest) {
  console.log('[API] Chat request received');
  
  try {
    console.log('[API] Parsing request body...');
    const body = await request.json();
    console.log('[API] Request body parsed successfully');
    
    const { agentManifest, messages, mode } = body as {
      agentManifest?: AgentManifest;
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
      mode?: 'raw' | 'agent';
    };

    console.log('[API] Request data:', {
      hasManifest: !!agentManifest,
      messageCount: messages?.length,
      mode: mode || 'agent',
    });

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      console.error('[API] Invalid messages array');
      return NextResponse.json(
        { error: 'messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('[API] OPENAI_API_KEY not configured');
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      );
    }
    console.log('[API] API key found');

    let systemPrompt: string | undefined = undefined;

    // Handle raw mode (no system prompt)
    if (mode === 'raw') {
      console.log('[API] Raw mode - no system prompt');
      systemPrompt = undefined;
    } else {
      // Agent mode - require manifest
      if (!agentManifest) {
        console.error('[API] Missing agentManifest for agent mode');
        return NextResponse.json(
          { error: 'agentManifest is required when mode is not "raw"' },
          { status: 400 }
        );
      }

      // Validate manifest
      const validation = validateAgentManifest(agentManifest);
      if (!validation.valid) {
        console.error('[API] Invalid agent manifest:', validation.errors);
        return NextResponse.json(
          { error: `Invalid agent manifest: ${validation.errors.join(', ')}` },
          { status: 400 }
        );
      }

      // Build system prompt from manifest
      console.log('[API] Building system prompt from manifest...');
      systemPrompt = buildSystemPrompt(agentManifest);

      // Check prompt length
      if (systemPrompt.length > MAX_PROMPT_LENGTH) {
        console.error('[API] System prompt too long:', systemPrompt.length);
        return NextResponse.json(
          { 
            error: `System prompt too long (${systemPrompt.length} chars, max ${MAX_PROMPT_LENGTH}). Please reduce agent manifest fields.` 
          },
          { status: 400 }
        );
      }

      console.log('[API] System prompt built:', systemPrompt.length, 'characters');
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

    console.log('[API] Calling OpenAI API with', openaiMessages.length, 'messages');
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
    });
    
    console.log('[API] OpenAI API responded');

    const assistantMessage = completion.choices[0]?.message?.content;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    console.log('[API] Returning response');
    return NextResponse.json({ content: assistantMessage });
  } catch (error) {
    console.error('[API] Chat API error:', error);
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof OpenAI.APIError) {
      console.error('[API] OpenAI API error details:', {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
      });
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
