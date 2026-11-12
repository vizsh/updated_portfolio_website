import { answerLocally } from './askLocal';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskResult {
  answer: string;
  sources: string[];
  /** "ai" = answered by Claude via /api/ask; "offline" = local keyword search. */
  mode: 'ai' | 'offline';
  notice?: string;
}

/** Once the endpoint reports it isn't configured (or doesn't exist), stop calling it this session. */
let apiUnavailable = false;

export const isAiUnavailable = () => apiUnavailable;

export async function askJeevesh(history: ChatTurn[]): Promise<AskResult> {
  const question = [...history].reverse().find(t => t.role === 'user')?.content ?? '';

  if (!apiUnavailable) {
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-8) })
      });
      const data = (await res.json().catch(() => null)) as
        | { answer?: string; sources?: string[]; message?: string; error?: string }
        | null;

      if (res.ok && data?.answer) {
        return { answer: data.answer, sources: data.sources ?? [], mode: 'ai' };
      }
      if (res.status === 429) {
        return {
          ...answerLocally(question),
          mode: 'offline',
          notice: data?.message ?? 'The assistant is busy; this answer comes from offline search.'
        };
      }
      // 404/405: no API deployed (e.g. a static host); 503: no API key configured.
      if (res.status === 404 || res.status === 405 || res.status === 503 || !data) apiUnavailable = true;
    } catch {
      apiUnavailable = true;
    }
  }

  return { ...answerLocally(question), mode: 'offline' };
}
