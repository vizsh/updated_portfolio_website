import React, { useEffect, useMemo, useRef, useState } from 'react';
import { askJeevesh, isAiUnavailable, type ChatTurn } from '../../lib/ask';
import { buildKnowledgeChunks, type KnowledgeChunk } from '../../data/knowledge';
import { RetroIcon } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';
import type { AppId } from '../../types/os';

interface ChatMessage extends ChatTurn {
  sources?: string[];
  mode?: 'ai' | 'offline';
  notice?: string;
}

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm the assistant for this portfolio. Ask me anything about Jeevesh's projects, skills, experience or how to get in touch. I answer only from what's on this site, with sources."
};

const SUGGESTIONS = [
  'Which projects use computer vision?',
  "What are NeuroScope 3D's accuracy numbers?",
  'What did Jeevesh build for Smart India Hackathon?',
  'How does JARVIS avoid hallucinated numbers?',
  'How can I contact Jeevesh?'
];

interface AskJeeveshAppProps {
  onOpenProject?: (projectId: string) => void;
  onOpenApp?: (appId: AppId) => void;
}

/** Render "[id]" citations as numbered markers, in order of first appearance. */
function renderWithCitations(text: string, order: string[]): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\[([a-z0-9-]+)\]/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    parts.push(text.slice(last, match.index));
    const n = order.indexOf(match[1]);
    parts.push(
      n >= 0 ? (
        <sup key={`${match.index}-${match[1]}`} style={{ color: '#000080', fontWeight: 'bold' }}>
          [{n + 1}]
        </sup>
      ) : (
        ''
      )
    );
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

export const AskJeeveshApp: React.FC<AskJeeveshAppProps> = ({ onOpenProject, onOpenApp }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [offline, setOffline] = useState(isAiUnavailable());
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chunks = useMemo(() => new Map<string, KnowledgeChunk>(buildKnowledgeChunks().map(c => [c.id, c])), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, pending]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || pending) return;
    retroAudio.playMouseDown();
    const next: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setInput('');
    setPending(true);
    try {
      const history: ChatTurn[] = next
        .filter(m => m !== GREETING)
        .map(m => ({ role: m.role, content: m.content.slice(0, 800) }));
      const result = await askJeevesh(history);
      setOffline(result.mode === 'offline');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: result.answer, sources: result.sources, mode: result.mode, notice: result.notice }
      ]);
      retroAudio.playBeep(988, 0.05);
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  };

  const openSource = (chunk: KnowledgeChunk) => {
    retroAudio.playMouseDown();
    const link = chunk.link;
    if (!link) return;
    if (link.kind === 'project') onOpenProject?.(link.projectId);
    else if (link.kind === 'app') onOpenApp?.(link.slug);
    else window.open(link.url, '_blank', 'noopener');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ece9d8', fontSize: '12px' }}>
      {/* Buddy header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          background: 'linear-gradient(#ffffff, #d6e4f7)',
          borderBottom: '1px solid #7a96df'
        }}
      >
        <RetroIcon name="chat" size={30} />
        <div style={{ lineHeight: 1.25 }}>
          <div style={{ fontWeight: 'bold', color: '#0b2545' }}>Ask Jeevesh: portfolio assistant</div>
          <div style={{ fontSize: '10.5px', color: offline ? '#8a4b00' : '#2b6e3f' }}>
            {offline
              ? '● Offline mode: keyword search over this portfolio'
              : '● Online: answers by Claude, grounded in this portfolio'}
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="win-inset" style={{ flex: 1, margin: '8px', background: '#ffffff', overflowY: 'auto', padding: '8px 10px' }}>
        {messages.map((m, i) => {
          const order = (m.sources ?? []).filter(id => chunks.has(id));
          return (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11px', color: '#6b6b6b', marginBottom: '2px' }}>
                {m.role === 'user' ? 'You say:' : `Assistant says${m.mode === 'offline' ? ' (offline search)' : ''}:`}
              </div>
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.45,
                  color: m.role === 'user' ? '#1a1a6e' : '#111111',
                  paddingLeft: '8px'
                }}
              >
                {m.role === 'assistant' ? renderWithCitations(m.content, order) : m.content}
              </div>
              {m.notice && <div style={{ paddingLeft: '8px', fontSize: '10.5px', color: '#8a4b00' }}>{m.notice}</div>}
              {order.length > 0 && (
                <div style={{ paddingLeft: '8px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {order.map((id, n) => {
                    const chunk = chunks.get(id)!;
                    return (
                      <button
                        key={id}
                        onClick={() => openSource(chunk)}
                        disabled={!chunk.link}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          textAlign: 'left',
                          cursor: chunk.link ? 'pointer' : 'default',
                          color: chunk.link ? '#0b5cad' : '#555',
                          fontSize: '10.5px',
                          fontFamily: 'inherit',
                          textDecoration: chunk.link ? 'underline' : 'none'
                        }}
                      >
                        [{n + 1}] {chunk.title}
                        {chunk.link?.kind === 'project' ? ': open case study' : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {pending && <div style={{ color: '#6b6b6b', fontStyle: 'italic' }}>Assistant is typing…</div>}
        {messages.length === 1 && !pending && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="win-button" onClick={() => send(s)} style={{ fontSize: '10.5px', padding: '2px 8px' }}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={e => {
          e.preventDefault();
          void send(input);
        }}
        style={{ display: 'flex', gap: '6px', padding: '0 8px 6px 8px', alignItems: 'stretch' }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 800))}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          placeholder="Type a question and press Enter…"
          className="win-inset"
          aria-label="Your question"
          style={{ flex: 1, resize: 'none', padding: '4px 6px', fontSize: '12px', fontFamily: 'inherit', background: '#ffffff' }}
        />
        <button type="submit" className="win-button" disabled={pending || !input.trim()} style={{ padding: '0 14px', fontWeight: 'bold' }}>
          Send
        </button>
      </form>
      <div style={{ padding: '0 10px 6px 10px', fontSize: '10px', color: '#666' }}>
        Answers come only from this portfolio and can be imperfect. Check the linked sources.
      </div>
    </div>
  );
};
