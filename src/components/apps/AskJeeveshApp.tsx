import React, { useEffect, useMemo, useRef, useState } from 'react';
import { askJeevesh, isAiUnavailable, type ChatTurn } from '../../lib/ask';
import { parseChatCommand, HELP_TEXT, type ChatCommand } from '../../lib/askCommands';
import { buildKnowledgeChunks, type KnowledgeChunk } from '../../data/knowledge';
import { demoWindowFor } from '../../data/caseStudies';
import { PERSONAL_INFO, PROJECTS_DATA } from '../../data/portfolioData';
import { RetroIcon } from '../common/RetroIcon';
import { retroAudio } from '../../services/audio';
import type { AppId } from '../../types/os';

interface ChatMessage extends ChatTurn {
  sources?: string[];
  mode?: 'ai' | 'offline';
  notice?: string;
  /** Greeting and command replies: shown in the chat, never sent to the assistant. */
  local?: boolean;
}

const STORAGE_KEY = 'ask-jeevesh-chat-v1';
const MAX_STORED = 40;

const GREETING: ChatMessage = {
  role: 'assistant',
  local: true,
  content:
    "Hi! I'm the assistant for this portfolio. Ask me anything about Jeevesh's projects, skills, experience or how to get in touch. I answer only from what's on this site, with sources. Type \"help\" to see what else I can do."
};

const SUGGESTIONS = [
  'Which projects use computer vision?',
  "What are NeuroScope 3D's accuracy numbers?",
  'What did Jeevesh build for Smart India Hackathon?',
  'How does JARVIS avoid hallucinated numbers?',
  'open jarvis',
  'How can I contact Jeevesh?'
];

const DEMO_LABEL: Partial<Record<AppId, string>> = {
  jarvis: 'JARVIS.exe',
  drishti: 'Drishti.exe',
  neuroscope: 'NeuroScope3D.exe'
};

const shortTitle = (title: string) => title.split(' — ')[0];

const isChatMessage = (m: unknown): m is ChatMessage =>
  !!m &&
  typeof m === 'object' &&
  ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant') &&
  typeof (m as ChatMessage).content === 'string';

/** The conversation survives minimising/closing the window for the rest of the browser session. */
function loadMessages(): ChatMessage[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null');
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isChatMessage)) return parsed.slice(-MAX_STORED);
  } catch {
    // Storage unavailable (private mode) or corrupted: start fresh.
  }
  return [GREETING];
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
    if (n >= 0) {
      parts.push(
        <sup key={`${match.index}-${match[1]}`} style={{ color: '#000080', fontWeight: 'bold' }}>
          [{n + 1}]
        </sup>
      );
    }
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

interface Chip {
  label: string;
  run: () => void;
  /** Follow-up questions are sent; other chips act on the desktop. */
  kind: 'action' | 'question';
}

interface AskJeeveshAppProps {
  onOpenProject?: (projectId: string) => void;
  onOpenApp?: (appId: AppId) => void;
  onOpenRecruiterMode?: () => void;
}

export const AskJeeveshApp: React.FC<AskJeeveshAppProps> = ({ onOpenProject, onOpenApp, onOpenRecruiterMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [offline, setOffline] = useState(isAiUnavailable());
  const [emailCopied, setEmailCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chunks = useMemo(() => new Map<string, KnowledgeChunk>(buildKnowledgeChunks().map(c => [c.id, c])), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, pending]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // Storage full or unavailable: the chat still works, it just won't be remembered.
    }
  }, [messages]);

  const openUrl = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

  /** Carry out a site command and return the chat's reply. */
  const runCommand = (command: ChatCommand): string => {
    switch (command.kind) {
      case 'help':
        return HELP_TEXT;
      case 'app':
        onOpenApp?.(command.appId);
        return `Opening ${command.label}…`;
      case 'project':
        onOpenProject?.(command.projectId);
        return `Opening the ${command.label} case study…`;
      case 'url':
        openUrl(command.url);
        return `Opening ${command.label} in a new tab…`;
      case 'recruiter':
        if (!onOpenRecruiterMode) return 'The one-page recruiter summary is at /recruiter/.';
        // Let the reply render and save before the desktop is swapped out.
        setTimeout(onOpenRecruiterMode, 600);
        return 'Switching to the one-page recruiter summary…';
    }
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || pending) return;
    retroAudio.playMouseDown();
    setInput('');

    const command = parseChatCommand(question);
    if (command) {
      const reply = runCommand(command);
      setMessages(prev => [...prev, { role: 'user', content: question, local: true }, { role: 'assistant', content: reply, local: true }]);
      return;
    }

    const next: ChatMessage[] = [...messages, { role: 'user', content: question }];
    setMessages(next);
    setPending(true);
    try {
      const history: ChatTurn[] = next.filter(m => !m.local).map(m => ({ role: m.role, content: m.content.slice(0, 800) }));
      const context = [...messages].reverse().find(m => m.role === 'assistant' && m.sources?.length)?.sources ?? [];
      const result = await askJeevesh(history, context);
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

  const newChat = () => {
    retroAudio.playMouseDown();
    setMessages([GREETING]);
    setInput('');
    inputRef.current?.focus();
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PERSONAL_INFO.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      window.location.assign(`mailto:${PERSONAL_INFO.email}`);
    }
  };

  const openSource = (chunk: KnowledgeChunk) => {
    retroAudio.playMouseDown();
    const link = chunk.link;
    if (!link) return;
    if (link.kind === 'project') onOpenProject?.(link.projectId);
    else if (link.kind === 'app') onOpenApp?.(link.slug);
    else openUrl(link.url);
  };

  /** Next steps for the latest answer: demos, repos, contact actions and follow-up questions. */
  const chipsFor = (message: ChatMessage, question?: string): Chip[] => {
    if (message.local) return [];
    const ids = (message.sources ?? []).filter(id => chunks.has(id));
    const projectIds = ids.filter(id => chunks.get(id)?.link?.kind === 'project');
    const chips: Chip[] = [];

    for (const id of projectIds.slice(0, 2)) {
      const name = shortTitle(chunks.get(id)!.title);
      const demo = demoWindowFor(id);
      if (demo) chips.push({ kind: 'action', label: `▶ Try ${DEMO_LABEL[demo] ?? name}`, run: () => onOpenApp?.(demo) });
      const repo = PROJECTS_DATA.find(p => p.id === id)?.githubUrl;
      if (repo) chips.push({ kind: 'action', label: `🔗 ${name} repo`, run: () => openUrl(repo) });
    }
    if (ids.includes('demos')) {
      (['jarvis', 'drishti', 'neuroscope'] as AppId[]).forEach(app =>
        chips.push({ kind: 'action', label: `▶ ${DEMO_LABEL[app]}`, run: () => onOpenApp?.(app) })
      );
    }
    if (ids.includes('contact')) {
      chips.push({ kind: 'action', label: '✉ Email Jeevesh', run: () => window.location.assign(`mailto:${PERSONAL_INFO.email}`) });
      chips.push({ kind: 'action', label: emailCopied ? '✔ Email copied' : '📋 Copy email', run: () => void copyEmail() });
      chips.push({ kind: 'action', label: '📄 Open resume', run: () => onOpenApp?.('resume') });
    }
    if (ids.length === 0 && question) {
      chips.push({
        kind: 'action',
        label: '✉ Email this question to Jeevesh',
        run: () =>
          window.location.assign(
            `mailto:${PERSONAL_INFO.email}?subject=${encodeURIComponent('Question from your portfolio site')}&body=${encodeURIComponent(question)}`
          )
      });
    }
    if (projectIds.length) {
      chips.push({ kind: 'question', label: 'What are its limits?', run: () => void send('What are its limits?') });
      chips.push({ kind: 'question', label: 'How was it built?', run: () => void send('How was it built?') });
    }
    return chips;
  };

  const lastIndex = messages.length - 1;
  const lastMessage = messages[lastIndex];
  const lastQuestion = [...messages].reverse().find(m => m.role === 'user')?.content;
  const latestChips = !pending && lastMessage?.role === 'assistant' ? chipsFor(lastMessage, lastQuestion) : [];

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
        <div style={{ lineHeight: 1.25, flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'bold', color: '#0b2545' }}>Ask Jeevesh: portfolio assistant</div>
          <div style={{ fontSize: '10.5px', color: offline ? '#8a4b00' : '#2b6e3f' }}>
            {offline
              ? '● Offline mode: keyword search over this portfolio'
              : '● Online: answers by Claude, grounded in this portfolio'}
          </div>
        </div>
        <button
          className="win-button"
          onClick={newChat}
          disabled={pending || messages.length <= 1}
          style={{ fontSize: '10.5px', padding: '2px 8px' }}
          title="Start a new conversation"
        >
          New chat
        </button>
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
              {i === lastIndex && latestChips.length > 0 && (
                <div style={{ paddingLeft: '8px', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {latestChips.map(chip => (
                    <button
                      key={chip.label}
                      className="win-button"
                      onClick={() => {
                        if (chip.kind === 'action') retroAudio.playMouseDown();
                        chip.run();
                      }}
                      style={{
                        fontSize: '10.5px',
                        padding: '1px 7px',
                        fontStyle: chip.kind === 'question' ? 'italic' : 'normal'
                      }}
                    >
                      {chip.kind === 'question' ? `💬 ${chip.label}` : chip.label}
                    </button>
                  ))}
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
            } else if (e.key === 'ArrowUp' && !input && lastQuestion) {
              e.preventDefault();
              setInput(lastQuestion);
            }
          }}
          rows={2}
          placeholder='Ask a question, or type "help" / "open jarvis"…'
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
