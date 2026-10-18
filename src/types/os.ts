export type CameraViewMode = 'room' | 'desk' | 'screen';

export type AppId = 
  | 'showcase'
  | 'about'
  | 'projects'
  | 'resume'
  | 'terminal'
  | 'minesweeper'
  | 'snake'
  | 'player'
  | 'recycleBin'
  | 'displayProperties';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowState {
  id: AppId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: Position;
  size: Size;
  preMaxSize?: { position: Position; size: Size };
  minSize: Size;
}

export interface DesktopShortcut {
  id: AppId;
  title: string;
  icon: string;
  row: number;
  col: number;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'Full-Stack' | '3D & Graphics' | 'AI & Systems' | 'Open Source';
  tech: string[];
  liveUrl?: string;
  githubUrl?: string;
  features: string[];
  year: string;
  status: 'Production' | 'Completed' | 'Featured';
  repoStats?: {
    commits: number;
    tests?: string;
    verifiedBadge?: string;
    highlights?: string;
    repoName: string;
  };
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  achievements: string[];
  tech: string[];
}

export interface HackathonItem {
  event: string;
  project: string;
  year: string;
  summary: string;
  tech: string[];
  githubUrl?: string;
}
