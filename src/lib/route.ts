import type { AppId } from '../types/os';
import { PROJECTS_DATA } from '../data/portfolioData';

/**
 * Shareable URLs.
 *
 *   /recruiter/ or  /?mode=recruiter  -> fast one-page summary (no 3D download)
 *   /projects/<projectId>/            -> boots straight into the OS with that case study open
 *
 * Shareable paths end in "/" so static hosts serve the generated per-route HTML
 * (dist/projects/<id>/index.html) with that project's link-preview tags.
 *   /apps/<slug>                      -> boots straight into the OS with that app open
 *   anything else                     -> the normal 3D room experience
 */
export type InitialRoute =
  | { kind: 'home' }
  | { kind: 'recruiter' }
  | { kind: 'project'; projectId: string }
  | { kind: 'app'; appId: AppId };

/** Friendly URL slug -> desktop window id. */
export const APP_SLUGS: Record<string, AppId> = {
  showcase: 'showcase',
  projects: 'projects',
  about: 'about',
  resume: 'resume',
  terminal: 'terminal',
  demo: 'videoDemo',
  jarvis: 'jarvis',
  drishti: 'drishti',
  neuroscope: 'neuroscope',
  ask: 'ask',
  minesweeper: 'minesweeper',
  snake: 'snake'
};

export const appSlugFor = (appId: AppId): string | undefined =>
  Object.keys(APP_SLUGS).find(slug => APP_SLUGS[slug] === appId);

const PROJECT_IDS = new Set(PROJECTS_DATA.map(p => p.id));

export function parseRoute(pathname: string, search: string): InitialRoute {
  const params = new URLSearchParams(search);
  if (params.get('mode') === 'recruiter') return { kind: 'recruiter' };

  const parts = pathname.split('/').filter(Boolean).map(decodeURIComponent);

  if (parts[0] === 'recruiter') return { kind: 'recruiter' };

  if (parts[0] === 'projects' && parts[1] && PROJECT_IDS.has(parts[1])) {
    return { kind: 'project', projectId: parts[1] };
  }

  if (parts[0] === 'apps' && parts[1] && APP_SLUGS[parts[1]]) {
    return { kind: 'app', appId: APP_SLUGS[parts[1]] };
  }

  return { kind: 'home' };
}

export const readInitialRoute = (): InitialRoute =>
  typeof window === 'undefined'
    ? { kind: 'home' }
    : parseRoute(window.location.pathname, window.location.search);

export const projectPath = (projectId: string) => `/projects/${projectId}/`;

export const RECRUITER_PATH = '/recruiter/';

export const appPath = (appId: AppId) => {
  const slug = appSlugFor(appId);
  return slug ? `/apps/${slug}` : '/';
};

/** Update the address bar without adding history entries or reloading. */
export function replaceUrl(path: string) {
  if (typeof window === 'undefined') return;
  const current = window.location.pathname + window.location.search;
  if (current !== path) window.history.replaceState(null, '', path);
}

export const absoluteUrl = (path: string) =>
  typeof window === 'undefined' ? path : `${window.location.origin}${path}`;

/** Copy a shareable link; resolves true when the clipboard write succeeded. */
export async function copyShareLink(path: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(absoluteUrl(path));
    return true;
  } catch {
    return false;
  }
}
