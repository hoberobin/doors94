import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAgentById, AgentId } from '@/lib/agents';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  console.log('[API] Chat request received');
  
  try {
    console.log('[API] Parsing request body...');
    const body = await request.json();
    console.log('[API] Request body parsed successfully');
    
    const { agentId, messages, userContext, agentOverride } = body as {
      agentId: AgentId;
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
      userContext?: string;
      agentOverride?: string;
    };

    console.log('[API] Request data:', {
      agentId,
      messageCount: messages?.length,
      hasContext: !!userContext,
      hasOverride: !!agentOverride,
    });

    // Validate agentId
    if (!agentId) {
      console.error('[API] Missing agentId');
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      );
    }

    // Get agent config
    console.log('[API] Getting agent config...');
    const agent = getAgentById(agentId);
    if (!agent) {
      console.error('[API] Agent not found:', agentId);
      return NextResponse.json(
        { error: `Agent with id "${agentId}" not found` },
        { status: 404 }
      );
    }
    console.log('[API] Agent found:', agent.name);

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

    // Build system message
    console.log('[API] Building system prompt...');
    let systemPrompt = agent.baseSystemPrompt;
    
    // Append agent override if provided
    if (agentOverride && agentOverride.trim()) {
      systemPrompt = `${systemPrompt}\n\n${agentOverride.trim()}`;
    }
    
    // Append user context if provided
    if (userContext) {
      systemPrompt = `${systemPrompt}\n\n---\n\nUser profile and preferences: ${userContext}`;
    }

    // Build messages array for OpenAI
    // First message is the system message, then filter out any previous system messages from client messages
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages
        .filter((msg) => msg.role !== 'system') // Exclude any system messages from client
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
    ];

    console.log('[API] Calling OpenAI API with', openaiMessages.length, 'messages');
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using gpt-4o-mini (similar to gpt-4.1-mini)
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

