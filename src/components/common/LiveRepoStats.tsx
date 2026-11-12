import React from 'react';
import { getRepoStats, isCiPassing, timeAgo, formatDate, GITHUB_STATS_FETCHED_AT } from '../../lib/githubStats';

const chip: React.CSSProperties = {
  fontSize: '10px',
  padding: '2px 7px',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  whiteSpace: 'nowrap'
};

interface LiveRepoBadgesProps {
  repoName?: string;
  /** Shown when no live snapshot exists for this repo. */
  fallbackCommits?: number;
}

/** Win98-style chips: live commit count, last commit, CI (only when passing), stars. */
export const LiveRepoBadges: React.FC<LiveRepoBadgesProps> = ({ repoName, fallbackCommits }) => {
  const stats = getRepoStats(repoName);

  if (!stats) {
    return fallbackCommits ? (
      <span className="win-sunken" style={{ ...chip, background: '#071018', color: '#39ff14' }}>
        Commits: {fallbackCommits}
      </span>
    ) : null;
  }

  return (
    <>
      <span
        className="win-sunken"
        style={{ ...chip, background: '#071018', color: '#39ff14' }}
        title={`Live from GitHub (${repoName}), synced ${formatDate(stats.fetchedAt)}`}
      >
        ● LIVE · {stats.commits} commits
      </span>
      {stats.lastCommitAt && (
        <span
          className="win-sunken"
          style={{ ...chip, background: '#1d1d3a', color: '#c9c9ff' }}
          title={stats.lastCommitMessage ? `Last commit: ${stats.lastCommitMessage}` : undefined}
        >
          Last commit {timeAgo(stats.lastCommitAt)}
        </span>
      )}
      {isCiPassing(stats) && stats.ci && (
        <a
          className="win-sunken"
          href={stats.ci.url}
          target="_blank"
          rel="noreferrer"
          style={{ ...chip, background: '#0a3622', color: '#75b798', textDecoration: 'none' }}
          title={`Latest "${stats.ci.workflow}" run on ${stats.defaultBranch} passed (${formatDate(stats.ci.finishedAt)})`}
        >
          ✔ CI passing
        </a>
      )}
      {stats.stars > 0 && (
        <span className="win-sunken" style={{ ...chip, background: '#3a2e12', color: '#ffca3a' }}>
          ★ {stats.stars}
        </span>
      )}
    </>
  );
};

export const GithubSyncNote: React.FC<{ style?: React.CSSProperties }> = ({ style }) =>
  GITHUB_STATS_FETCHED_AT ? (
    <span style={{ fontSize: '10px', color: '#666', ...style }}>
      Repo stats synced from GitHub {timeAgo(GITHUB_STATS_FETCHED_AT)} ({formatDate(GITHUB_STATS_FETCHED_AT)})
    </span>
  ) : null;
