import { buildKnowledgeChunks, type KnowledgeChunk } from '../data/knowledge';

/**
 * Offline answerer for "Ask Jeevesh": BM25 keyword search over the portfolio
 * knowledge chunks, answering with the most relevant sentences and a citation.
 * Used when the AI endpoint isn't configured or reachable. Deterministic.
 */

const STOPWORDS = new Set(
  (
    'a an and are as at be but by can could did do does for from had has have how i if in into is it its ' +
    'jeevesh jeeveshs bodhani me my of on or our so tell than that the their them then there these they this ' +
    'to us was we were what when where which who will with would you your about any some show give list please ' +
    'he she him her his hers does do did'
  ).split(' ')
);

/** Query expansions for common phrasings. */
const SYNONYMS: Record<string, string[]> = {
  cv: ['computer', 'vision'],
  computer: ['computer', 'opencv', 'yolov8n', 'yolo11n'],
  vision: ['vision', 'opencv', 'yolov8n', 'yolo11n'],
  ml: ['machine', 'learning', 'model'],
  email: ['contact', 'email'],
  hire: ['contact', 'email', 'resume'],
  reach: ['contact', 'email'],
  contact: ['contact', 'email', 'linkedin'],
  phone: ['contact'],
  gpa: ['cgpa'],
  grades: ['cgpa', 'score'],
  college: ['education', 'institution'],
  university: ['education', 'institution'],
  degree: ['education', 'b.tech'],
  finance: ['finance', 'financial', 'dcf'],
  money: ['finance', 'money', 'jarvis'],
  brain: ['tumour', 'neuroscope', 'mri', 'brain'],
  tumor: ['tumour'],
  medical: ['tumour', 'mri', 'medical'],
  exam: ['exam', 'drishti'],
  cheating: ['exam', 'misconduct', 'drishti'],
  border: ['ibvap', 'border', 'ssb'],
  hotel: ['resort', 'hotel360'],
  resort: ['resort', 'hotel360'],
  internship: ['experience', 'simulation'],
  job: ['experience', 'simulation'],
  demo: ['demo', 'live', 'browser'],
  hackathon: ['hackathon'],
  tests: ['test', 'pytest'],
  accuracy: ['dice', 'accuracy', 'benchmark'],
  privacy: ['privacy', 'face', 'biometric'],
  know: ['skill'],
  weakness: ['limit'],
  weaknesses: ['limit'],
  downside: ['limit'],
  downsides: ['limit'],
  challenge: ['limit'],
  challenges: ['limit'],
  future: ['next'],
  roadmap: ['next'],
  plan: ['next'],
  plans: ['next'],
  why: ['decision', 'because'],
  decision: ['decision', 'because'],
  architecture: ['architecture', 'pipeline'],
  skill: ['skill', 'technical'],
  skills: ['skill', 'technical'],
  familiar: ['skill'],
  stack: ['tech', 'skill'],
  language: ['language', 'skill'],
  languages: ['language', 'skill']
};

/** Words that signal the visitor wants figures. */
const NUMBER_INTENT = /\b(number|numbers|accuracy|score|scores|metric|metrics|results?|how many|how much|dice|percent|tests?)\b/i;

/** Crude suffix stripping so "hallucinated" and "hallucination" meet. */
function stem(t: string): string {
  for (const suffix of ['izations', 'ization', 'ations', 'ation', 'ating', 'ated', 'ates', 'ings', 'ing', 'ed', 'ion', 'es', 's']) {
    if (t.length - suffix.length >= 4 && t.endsWith(suffix) && !(suffix === 's' && t.endsWith('ss'))) {
      return t.slice(0, -suffix.length);
    }
  }
  return t;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .split(/[^a-z0-9+#.]+/)
    .map(t => t.replace(/^\.+|\.+$/g, ''))
    .filter(t => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

interface IndexedChunk {
  chunk: KnowledgeChunk;
  tf: Map<string, number>;
  length: number;
  titleTerms: Set<string>;
}

interface Index {
  docs: IndexedChunk[];
  df: Map<string, number>;
  avgLength: number;
}

let cached: Index | null = null;

function getIndex(): Index {
  if (cached) return cached;
  const docs = buildKnowledgeChunks().map(chunk => {
    const terms = tokenize(`${chunk.title} ${chunk.text}`);
    const tf = new Map<string, number>();
    terms.forEach(t => tf.set(t, (tf.get(t) ?? 0) + 1));
    return { chunk, tf, length: terms.length, titleTerms: new Set(tokenize(chunk.title)) };
  });
  const df = new Map<string, number>();
  docs.forEach(d => d.tf.forEach((_, term) => df.set(term, (df.get(term) ?? 0) + 1)));
  const avgLength = docs.reduce((a, d) => a + d.length, 0) / docs.length;
  cached = { docs, df, avgLength };
  return cached;
}

interface QueryTerm {
  /** The visitor's word (stemmed). */
  term: string;
  /** The word plus its expansions. */
  forms: string[];
}

function parseQuery(question: string): QueryTerm[] {
  const words = question
    .toLowerCase()
    .replace(/['’]/g, '')
    .split(/[^a-z0-9+#.]+/)
    .map(t => t.replace(/^\.+|\.+$/g, ''))
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
  const seen = new Set<string>();
  const query: QueryTerm[] = [];
  for (const word of words) {
    const term = stem(word);
    if (seen.has(term)) continue;
    seen.add(term);
    query.push({ term, forms: [...new Set([term, ...(SYNONYMS[word] ?? []).map(stem)])] });
  }
  return query;
}

const allForms = (query: QueryTerm[]) => [...new Set(query.flatMap(q => q.forms))];

/** How many of the visitor's own words (or their expansions) a chunk contains. */
const matchedTerms = (query: QueryTerm[], doc: IndexedChunk) =>
  query.filter(q => q.forms.some(f => doc.tf.has(f))).length;

function rank(terms: string[]): { doc: IndexedChunk; score: number }[] {
  const { docs, df, avgLength } = getIndex();
  const k1 = 1.2;
  const b = 0.75;
  return docs
    .map(doc => {
      let score = 0;
      for (const term of terms) {
        const freq = doc.tf.get(term) ?? 0;
        if (!freq) continue;
        const n = df.get(term) ?? 0;
        const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
        score += (idf * (freq * (k1 + 1))) / (freq + k1 * (1 - b + (b * doc.length) / avgLength));
        if (doc.titleTerms.has(term)) score += 1.5 * idf;
      }
      return { doc, score };
    })
    .sort((a, b2) => b2.score - a.score);
}

/**
 * Split a chunk into answerable units: bullet lines stay whole, prose splits into
 * sentences (but not after initials such as "J." in "Dwarkadas J. Sanghvi").
 */
function units(text: string): string[] {
  return text
    .split('\n')
    .flatMap(line => (line.startsWith('- ') ? [line] : line.split(/(?<=[a-z0-9)%][.!?])\s+(?=[A-Z0-9])/)))
    .map(s => s.trim())
    .filter(s => s.length > 3 && !/^[A-Za-z ()']+:$/.test(s));
}

const idfOf = (term: string) => {
  const { docs, df } = getIndex();
  const n = df.get(term) ?? 0;
  return Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
};

/** Pick the most relevant sentences of one chunk, in their original order. */
function bestUnits(doc: IndexedChunk, query: QueryTerm[], wantsNumbers: boolean, max = 3): string[] {
  // Words already in the chunk's title (e.g. "JARVIS") say nothing about which sentence answers.
  const forms = allForms(query).filter(f => !doc.titleTerms.has(f));
  const scored = units(doc.chunk.text).map((text, i) => {
    const terms = new Set(tokenize(text));
    let score = forms.reduce((acc, f) => acc + (terms.has(f) ? idfOf(f) : 0), 0);
    if (score > 0 && wantsNumbers && /\d/.test(text)) score += 0.75;
    return { text, i, score };
  });
  const best = scored
    .filter(u => u.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, max);
  const picked = new Set((best.length ? best : scored.slice(0, 2)).map(u => u.i));
  for (const i of [...picked]) {
    if (scored[i].text.startsWith('- ')) continue;
    for (let j = i + 1; j <= i + 2 && j < scored.length && scored[j].text.startsWith('- '); j++) picked.add(j);
  }
  return [...picked]
    .sort((a, b) => a - b)
    .slice(0, 5)
    .map(i => scored[i].text);
}

const joinUnits = (parts: string[]) => parts.join(parts.some(p => p.startsWith('- ')) ? '\n' : ' ');

const summaryOf = (chunk: KnowledgeChunk) =>
  chunk.text.match(/^Summary: (.+)$/m)?.[1] ?? chunk.text.split('\n')[1] ?? chunk.title;

const NOT_FOUND = {
  answer:
    "I couldn't find that in the portfolio. Try asking about a specific project, Jeevesh's skills, experience, education, or contact details.",
  sources: [] as string[]
};

const LIST_INTENT =
  /\b(which|what|list|any|all)\b[^?]*\bprojects?\b|\bprojects?\b[^?]*\b(use|uses|using|with|involve|built)\b/i;

export interface LocalAnswer {
  answer: string;
  sources: string[];
}

export function answerLocally(question: string): LocalAnswer {
  const q = question.trim();
  if (/^(hi|hello|hey|namaste)\b/i.test(q) && q.split(/\s+/).length <= 3) {
    return {
      answer: "Hi! Ask me about Jeevesh's projects (JARVIS, Drishti AI, NeuroScope 3D, Hotel360, IBVAP), skills, experience or how to get in touch.",
      sources: []
    };
  }

  const query = parseQuery(q);
  if (query.length === 0) return NOT_FOUND;
  const wantsNumbers = NUMBER_INTENT.test(q);

  // "Which projects use X?": list every project that mentions X.
  if (LIST_INTENT.test(q)) {
    const topical = query.filter(t => !['project', 'use', 'us', 'using', 'built', 'involve'].includes(t.term));
    if (topical.length) {
      const matches = rank(allForms(topical))
        .filter(
          r => r.doc.chunk.link?.kind === 'project' && r.score > 0.5 && matchedTerms(topical, r.doc) === topical.length
        )
        .slice(0, 5);
      if (matches.length) {
        return {
          answer: matches.map(m => `- ${m.doc.chunk.title}: ${summaryOf(m.doc.chunk)} [${m.doc.chunk.id}]`).join('\n'),
          sources: matches.map(m => m.doc.chunk.id)
        };
      }
    }
  }

  const ranked = rank(allForms(query));
  const top = ranked[0];
  // Off-topic guard: the best chunk must cover most of what was asked, not one stray word.
  const coverage = top ? matchedTerms(query, top.doc) / query.length : 0;
  if (!top || top.score < 1.5 || coverage < 0.6) return NOT_FOUND;

  const sources = [top.doc.chunk.id];
  let answer = `${joinUnits(bestUnits(top.doc, query, wantsNumbers))} [${top.doc.chunk.id}]`;

  const second = ranked[1];
  if (second && second.score >= top.score * 0.8 && second.score >= 1.5) {
    answer += `\nSee also: ${second.doc.chunk.title} [${second.doc.chunk.id}]`;
    sources.push(second.doc.chunk.id);
  }
  return { answer, sources };
}
