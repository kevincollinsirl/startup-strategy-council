import { getSettings } from './storage';
import { askClaude } from './claude-cli';
import { askOpenAI } from './openai-client';

export async function askAI(prompt: string, systemPrompt?: string): Promise<string> {
  const settings = await getSettings();

  if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
    return askOpenAI(prompt, systemPrompt, settings.openaiApiKey, settings.openaiModel);
  }

  // Default to Claude CLI
  return askClaude(prompt, systemPrompt);
}

export async function getAIProviderName(): Promise<string> {
  const settings = await getSettings();

  if (settings.aiProvider === 'openai' && settings.openaiApiKey) {
    return `OpenAI (${settings.openaiModel})`;
  }

  return 'Claude CLI';
}
