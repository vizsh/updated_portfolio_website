import snapshot from '../data/githubStats.json';

/**
 * Live repository stats, refreshed from the GitHub API at build time by
 * scripts/fetch-github-stats.mjs (runs automatically before `npm run build`).
 */
export interface RepoLiveStats {
  url: string;
  defaultBranch: string;
  language: string | null;
  stars: number;
  forks: number;
  pushedAt: string;
  commits: number;
  lastCommitAt: string | null;
  lastCommitMessage: string | null;
  ci: { conclusion: string; workflow: string; url: string; finishedAt: string } | null;
  fetchedAt: string;
}

interface Snapshot {
  fetchedAt: string | null;
  repos: Record<string, RepoLiveStats>;
}

const data = snapshot as Snapshot;

export const GITHUB_STATS_FETCHED_AT: string | null = data.fetchedAt;

export function getRepoStats(repoName?: string): RepoLiveStats | undefined {
  return repoName ? data.repos[repoName] : undefined;
}

/** Only a passing CI run is shown as a badge; anything else shows no badge. */
export const isCiPassing = (stats?: RepoLiveStats) => stats?.ci?.conclusion === 'success';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60]
];

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "3 months ago", "yesterday", ... relative to now (or `now`). */
export function timeAgo(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return 'unknown';
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'unknown';

/** Terminal-style summary lines used in dark repo panels and the MS-DOS prompt. */
export const liveRepoSummaryLines = (repoName?: string): string[] => {
  const stats = getRepoStats(repoName);
  if (!stats) return [];
  const lines = [`LIVE COMMITS: ${stats.commits} on ${stats.defaultBranch} · last commit ${timeAgo(stats.lastCommitAt)}`];
  if (stats.lastCommitMessage) lines.push(`LATEST: "${stats.lastCommitMessage}"`);
  if (isCiPassing(stats) && stats.ci) lines.push(`CI: ${stats.ci.workflow} passing on ${stats.defaultBranch}`);
  return lines;
};
