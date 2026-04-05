import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from '../src/prompts';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANALYSIS_REGEX = /\{[^{}]*"entscheidungsgrundlagen"\s*:\s*\d+[^{}]*\}/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-api-key-here') {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  const { messages, projectName } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const client = new Anthropic({ apiKey });

  const systemContent = projectName
    ? `${SYSTEM_PROMPT}\n\nDer User analysiert das Projekt: "${projectName}"`
    : SYSTEM_PROMPT;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemContent,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const content =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Check for analysis JSON in response
    const match = content.match(ANALYSIS_REGEX);
    let analysis = null;
    if (match) {
      try {
        analysis = JSON.parse(match[0]);
      } catch {
        // JSON parse failed, ignore
      }
    }

    return res.status(200).json({ content, analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Anthropic API error:', message);
    return res.status(500).json({ error: message });
  }
}
