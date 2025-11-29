/**
 * 🛡️ IA Guardiã de UX - Função Principal
 */

import OpenAI from 'openai'
import { UX_GUARDIAN_SYSTEM_PROMPT } from './uxGuardianPrompt'
import type { UxGuardianSnapshot, UxGuardianSuggestion } from './uxAnalytics'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function runUxGuardianAnalysis(
  snapshot: UxGuardianSnapshot,
): Promise<UxGuardianSuggestion | null> {
  if (process.env.FEATURE_UX_GUARDIAN !== 'true') {
    return null;
  }

  const userJson = JSON.stringify(snapshot, null, 2);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: UX_GUARDIAN_SYSTEM_PROMPT },
      { role: 'user', content: userJson },
    ],
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';

  try {
    const parsed = JSON.parse(raw) as UxGuardianSuggestion;
    return parsed;
  } catch (err) {
    console.error('Erro ao parsear resposta da IA Guardiã:', err, raw);
    return null;
  }
}

console.log('🛡️ UX Guardian initialized')
