export interface PaginatedResponse<T> {
  values: T[];
  page: number;
  pagelen: number;
  size: number;
  next?: string;
}

export interface User {
  uuid: string;
  display_name: string;
  nickname: string;
  account_id: string;
  links: {
    avatar?: { href: string };
    html?: { href: string };
  };
}

export interface BranchRef {
  branch: { name: string };
  commit: { hash: string };
  repository?: { full_name: string };
}

export interface Repository {
  uuid: string;
  name: string;
  full_name: string;
  slug: string;
  description: string;
  is_private: boolean;
  language: string;
  mainbranch: { name: string } | null;
  created_on: string;
  updated_on: string;
  size: number;
  links: {
    html?: { href: string };
    clone?: Array<{ href: string; name: string }>;
  };
}

export interface Participant {
  user: User;
  role: "PARTICIPANT" | "REVIEWER" | "AUTHOR";
  approved: boolean;
  state: "approved" | "changes_requested" | null;
}

export interface PullRequest {
  id: number;
  title: string;
  description: string;
  state: "OPEN" | "MERGED" | "DECLINED" | "SUPERSEDED";
  draft: boolean;
  author: User;
  source: BranchRef;
  destination: BranchRef;
  reviewers: User[];
  participants: Participant[];
  close_source_branch: boolean;
  created_on: string;
  updated_on: string;
  merge_commit?: { hash: string };
  links: {
    html?: { href: string };
  };
}

export interface Comment {
  id: number;
  content: {
    raw: string;
    markup: string;
    html: string;
  };
  inline?: {
    path: string;
    from: number | null;
    to: number | null;
  };
  parent?: { id: number };
  user: User;
  created_on: string;
  updated_on: string;
  deleted: boolean;
  resolved?: {
    user: User;
    created_on: string;
  };
  links: Record<string, { href: string }>;
}

export interface Activity {
  comment?: Comment;
  update?: {
    state: string;
    title: string;
    description: string;
    source: BranchRef;
    destination: BranchRef;
    author: User;
    date: string;
  };
  approval?: {
    user: User;
    date: string;
  };
  changes_requested?: {
    user: User;
    date: string;
  };
}

export interface Pipeline {
  uuid: string;
  build_number: number;
  state: {
    name: string;
    result?: { name: string };
  };
  created_on: string;
  completed_on: string | null;
  target: {
    ref_name: string;
    ref_type: string;
  };
  creator: User;
  links: Record<string, { href: string }>;
}

export interface PipelineStep {
  uuid: string;
  name: string;
  state: {
    name: string;
    result?: { name: string };
  };
  started_on: string | null;
  completed_on: string | null;
  duration_in_seconds: number | null;
  links: Record<string, { href: string }>;
}

export interface DiffstatEntry {
  type: string;
  status: string;
  old?: { path: string };
  new?: { path: string };
  lines_added: number;
  lines_removed: number;
}

export interface CommitEntry {
  hash: string;
  message: string;
  author: {
    raw: string;
    user?: User;
  };
  date: string;
}

export interface MergeTask {
  task_status: {
    id: number;
    status: string;
  };
}
