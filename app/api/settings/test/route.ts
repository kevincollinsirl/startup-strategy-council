import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/storage';
import { testOpenAIConnection } from '@/lib/openai-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let apiKey = body.apiKey;

    // If no key provided, use stored key
    if (!apiKey || apiKey.startsWith('••••')) {
      const settings = await getSettings();
      apiKey = settings.openaiApiKey;
    }

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'No API key provided' });
    }

    const success = await testOpenAIConnection(apiKey);

    return NextResponse.json({
      success,
      error: success ? null : 'Failed to connect to OpenAI API',
    });
  } catch (error) {
    console.error('Error testing OpenAI connection:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    });
  }
}
