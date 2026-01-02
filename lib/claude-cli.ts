import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function askClaude(prompt: string, systemPrompt?: string): Promise<string> {
  // Combine system prompt with user prompt
  const fullPrompt = systemPrompt
    ? `[SYSTEM INSTRUCTIONS]\n${systemPrompt}\n\n[USER REQUEST]\n${prompt}`
    : prompt;

  // Write prompt to a temp file to avoid shell escaping issues
  const fs = await import('fs/promises');
  const path = await import('path');
  const os = await import('os');

  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `claude-prompt-${Date.now()}.txt`);

  try {
    await fs.writeFile(tempFile, fullPrompt, 'utf-8');

    // Use claude CLI with --print flag and pipe from file
    // The --print flag outputs response without interactive mode
    const { stdout, stderr } = await execAsync(
      `type "${tempFile}" | claude --print`,
      {
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 120000, // 2 minute timeout
        shell: 'cmd.exe'
      }
    );

    if (stderr && !stderr.includes('warning')) {
      console.error('Claude CLI stderr:', stderr);
    }

    return stdout.trim();
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

// Alternative: Direct string approach for simpler prompts
export async function askClaudeSimple(prompt: string): Promise<string> {
  // Escape for Windows cmd
  const escaped = prompt
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');

  try {
    const { stdout } = await execAsync(
      `echo ${escaped} | claude --print`,
      {
        maxBuffer: 1024 * 1024 * 10,
        timeout: 120000,
        shell: 'cmd.exe'
      }
    );
    return stdout.trim();
  } catch (error) {
    console.error('Claude CLI error:', error);
    throw new Error('Failed to get response from Claude CLI');
  }
}
