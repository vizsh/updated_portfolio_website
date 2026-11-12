#!/usr/bin/env node
/**
 * Fetches live repository stats from the GitHub REST API and writes them to
 * src/data/githubStats.json, which the site imports at build time.
 *
 * - Runs automatically before `npm run build` (see "prebuild" in package.json),
 *   and on demand with `npm run stats`.
 * - Repositories are read from the `repoName: 'owner/repo'` fields in
 *   src/data/portfolioData.ts, so adding a project there is enough.
 * - Never fails the build: if GitHub is unreachable or rate-limited, the last
 *   committed snapshot is kept (per repo) and the build continues.
 * - Set GITHUB_TOKEN (or GH_TOKEN) to raise the rate limit from 60 to 5,000
 *   requests/hour. A token with public read-only access is enough.
 * - Set SKIP_GITHUB_STATS=1 to skip fetching entirely.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataFile = path.join(root, 'src/data/portfolioData.ts');
const outFile = path.join(root, 'src/data/githubStats.json');

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const API = 'https://api.github.com';
const TIMEOUT_MS = 8000;

const log = msg => console.log(`[github-stats] ${msg}`);

async function readPrevious() {
  try {
    return JSON.parse(await readFile(outFile, 'utf-8'));
  } catch {
    return { fetchedAt: null, repos: {} };
  }
}

async function repoNames() {
  const source = await readFile(dataFile, 'utf-8');
  const names = [...source.matchAll(/repoName:\s*['"]([\w.-]+\/[\w.-]+)['"]/g)].map(m => m[1]);
  return [...new Set(names)];
}

async function gh(pathname) {
  const res = await fetch(`${API}${pathname}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'portfolio-stats-script',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    throw new Error(`${res.status} ${res.statusText} for ${pathname}${remaining === '0' ? ' (rate limited)' : ''}`);
  }
  return { body: await res.json(), headers: res.headers };
}

/** Total commits on a branch: request 1 per page and read the last page number. */
async function commitSummary(repo, branch) {
  const { body, headers } = await gh(`/repos/${repo}/commits?per_page=1&sha=${encodeURIComponent(branch)}`);
  const link = headers.get('link') || '';
  const last = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
  const latest = Array.isArray(body) ? body[0] : undefined;
  return {
    commits: last ? Number(last[1]) : Array.isArray(body) ? body.length : 0,
    lastCommitAt: latest?.commit?.committer?.date ?? latest?.commit?.author?.date ?? null,
    lastCommitMessage: (latest?.commit?.message ?? '').split('\n')[0].slice(0, 120) || null
  };
}

/**
 * Latest completed GitHub Actions run on the default branch, if the repo uses Actions.
 * Bot-driven runs (Dependabot dependency-graph updates, event "dynamic") are ignored:
 * they say nothing about whether the project's own build or tests pass.
 */
async function ciSummary(repo, branch) {
  const { body } = await gh(
    `/repos/${repo}/actions/runs?per_page=20&status=completed&branch=${encodeURIComponent(branch)}`
  );
  const run = (body.workflow_runs ?? []).find(
    r => r.event !== 'dynamic' && !/dependabot/i.test(r.actor?.login ?? '')
  );
  if (!run) return null;
  return {
    conclusion: run.conclusion, // success | failure | cancelled | ...
    workflow: run.name,
    url: run.html_url,
    finishedAt: run.updated_at
  };
}

async function fetchRepo(repo) {
  const { body: meta } = await gh(`/repos/${repo}`);
  const branch = meta.default_branch;
  const [commits, ci] = await Promise.all([commitSummary(repo, branch), ciSummary(repo, branch).catch(() => null)]);
  return {
    url: meta.html_url,
    defaultBranch: branch,
    language: meta.language,
    stars: meta.stargazers_count,
    forks: meta.forks_count,
    pushedAt: meta.pushed_at,
    ...commits,
    ci
  };
}

async function main() {
  if (process.env.SKIP_GITHUB_STATS === '1') {
    log('SKIP_GITHUB_STATS=1, keeping the existing snapshot.');
    return;
  }

  const previous = await readPrevious();
  const names = await repoNames();
  if (names.length === 0) {
    log('No repoName fields found in portfolioData.ts; nothing to do.');
    return;
  }

  log(`Fetching ${names.length} repositories${token ? ' (authenticated)' : ' (unauthenticated, 60 req/h limit)'}...`);
  const results = await Promise.allSettled(names.map(fetchRepo));

  const repos = {};
  let fresh = 0;
  results.forEach((result, i) => {
    const name = names[i];
    if (result.status === 'fulfilled') {
      repos[name] = { ...result.value, fetchedAt: new Date().toISOString() };
      fresh += 1;
      log(`  ✓ ${name}: ${result.value.commits} commits, CI ${result.value.ci?.conclusion ?? 'none'}`);
    } else if (previous.repos?.[name]) {
      repos[name] = previous.repos[name];
      log(`  ! ${name}: ${result.reason?.message ?? result.reason} — kept previous snapshot`);
    } else {
      log(`  ✗ ${name}: ${result.reason?.message ?? result.reason} — no snapshot available`);
    }
  });

  if (fresh === 0) {
    log('Could not reach GitHub; keeping the committed snapshot unchanged.');
    return;
  }

  const snapshot = { fetchedAt: new Date().toISOString(), source: 'api.github.com', repos };
  await writeFile(outFile, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf-8');
  log(`Wrote ${path.relative(root, outFile)} (${fresh}/${names.length} fresh).`);
}

main().catch(err => {
  // Never block a deploy on stats.
  log(`Skipped: ${err?.message ?? err}`);
});
