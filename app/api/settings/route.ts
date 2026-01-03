import { NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage';
import { z } from 'zod';
import { validateOrThrow } from '@/lib/schemas';

// Settings update schema - partial updates allowed
const settingsUpdateSchema = z.object({
  aiProvider: z.enum(['claude-cli', 'openai']).optional(),
  openaiApiKey: z.string().max(500).optional(),
  openaiModel: z.enum(['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export async function GET() {
  try {
    const settings = await getSettings();
    // Don't expose the full API key for security
    return NextResponse.json({
      ...settings,
      openaiApiKey: settings.openaiApiKey ? '••••••••' + settings.openaiApiKey.slice(-4) : '',
      hasOpenAIKey: !!settings.openaiApiKey,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const validated = validateOrThrow(settingsUpdateSchema, body);

    const currentSettings = await getSettings();

    const updates = {
      aiProvider: validated.aiProvider || currentSettings.aiProvider,
      openaiModel: validated.openaiModel || currentSettings.openaiModel,
      onboardingCompleted: validated.onboardingCompleted ?? currentSettings.onboardingCompleted,
      openaiApiKey: currentSettings.openaiApiKey,
    };

    // Only update API key if a new one is provided (not the masked version)
    if (validated.openaiApiKey && !validated.openaiApiKey.startsWith('••••')) {
      updates.openaiApiKey = validated.openaiApiKey;
    }

    const newSettings = { ...currentSettings, ...updates };
    await saveSettings(newSettings);

    return NextResponse.json({
      ...newSettings,
      openaiApiKey: newSettings.openaiApiKey ? '••••••••' + newSettings.openaiApiKey.slice(-4) : '',
      hasOpenAIKey: !!newSettings.openaiApiKey,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    if (error instanceof Error && error.message.startsWith('Validation failed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
