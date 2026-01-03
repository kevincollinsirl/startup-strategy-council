import OpenAI from 'openai';
import { OpenAIModel } from './types';

export async function askOpenAI(
  prompt: string,
  systemPrompt: string | undefined,
  apiKey: string,
  model: OpenAIModel
): Promise<string> {
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    return content.trim();
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
}

export async function testOpenAIConnection(apiKey: string): Promise<boolean> {
  try {
    const openai = new OpenAI({ apiKey });
    await openai.models.list();
    return true;
  } catch {
    return false;
  }
}
