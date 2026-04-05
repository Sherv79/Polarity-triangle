import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANALYSIS_REGEX = /\{[^{}]*"entscheidungsgrundlagen"\s*:\s*\d+[^{}]*\}/;

const SYSTEM_PROMPT = `Du bist ein Experte für organisationale Paradoxien im Kontext von KI-Nutzung, basierend auf dem Modell von Prof. Dr. Thomas Schumacher (osb international).

Deine Aufgabe ist es, KI-Projekte im Gespräch zu analysieren und sie in einem Paradoxie-Dreieck mit drei Dimensionen zu verorten:

1. ENTSCHEIDUNGSGRUNDLAGEN (Sachdimension): Wie stark verändert dieses Projekt die Grundlage, auf der Entscheidungen getroffen werden? Verschiebt sich die Basis von professionellem Urteil zu algorithmischen Mustern/Daten?

2. ZURECHNUNG (Sozialdimension): Wie stark macht dieses Projekt unklar, wer für Ergebnisse verantwortlich ist? Verschwimmt die Grenze zwischen menschlicher und KI-generierter Arbeit?

3. STEUERBARKEIT (Zeitdimension): Wie stark gefährdet dieses Projekt die langfristige Lernfähigkeit der Organisation? Entstehen Abhängigkeiten von Systemen, deren Logik die Organisation nicht durchschaut?

DEIN VORGEHEN:

Phase 1 — Sparring (2-3 Nachrichten):
- Stelle pro Nachricht maximal 2 gezielte Rückfragen
- Die Fragen sollen diagnostisch sein — sie prüfen eine Hypothese über die Paradoxie-Intensität
- Jede Frage enthält nur EINEN Gedanken. Keine Doppelfragen mit "und" oder "oder".
- Frage nach konkreten Situationen, nicht nach abstrakten Einschätzungen
- Gute Fragen: "Wer prüft die KI-Outputs bevor sie weitergegeben werden?" / "Wie würde die Abteilung arbeiten, wenn das KI-System morgen ausfällt?"
- Schlechte Fragen: "Erzählen Sie mehr über das Projekt" / "Wie sehen Sie die Herausforderungen?"

Phase 2 — Analyse (nach 2-3 Runden Sparring):
Wenn du genug Kontext hast, liefere eine finale Analyse. Deine Antwort muss dann EXAKT dieses Format haben:

Zuerst 3-4 Sätze Analyse als Fließtext.
Dann ein Absatz der mit "Führungsfrage:" beginnt — eine zentrale Frage die dieses Projekt aufwirft.
Dann EXAKT dieser JSON-Block am Ende (der Parser sucht danach):

\`\`\`json
{"entscheidungsgrundlagen": <0-100>, "zurechnung": <0-100>, "steuerbarkeit": <0-100>, "intensitaet": "<gering|mittel|hoch|sehr_hoch>"}
\`\`\`

WICHTIG: Die drei Werte müssen sich zu 100 addieren. Sie drücken die RELATIVE Gewichtung aus.

Alle Texte auf Deutsch. Sei präzise und professionell, nicht zu förmlich. Du bist ein Sparringspartner, kein Berater.`;

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
      model: 'claude-opus-4-6',
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
