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

// SECURITY NOTE: Never use direct string interpolation with shell commands.
// Always use the temp file approach above to avoid command injection vulnerabilities.
