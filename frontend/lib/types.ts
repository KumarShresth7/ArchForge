export type Difficulty = "easy" | "medium" | "hard";

export type ProblemStatus = "not_started" | "attempted" | "solved";

export interface ProblemSummary {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
}

export interface StarterNode {
  id: string;
  label: string;
  variant: "input" | "default" | "output";
  position: { x: number; y: number };
}

export interface StarterEdge {
  id: string;
  source: string;
  target: string;
}

export interface StarterGraph {
  nodes: StarterNode[];
  edges: StarterEdge[];
}

export interface ProblemDetail extends ProblemSummary {
  description: string;
  functional_requirements: string[];
  non_functional_requirements: string[];
  hints: string[];
  starter_graph: StarterGraph;
}

export interface EvaluationResult {
  score: number;
  bottlenecks: string[];
  suggestions: string[];
  problem_slug?: string;
}

export interface ProblemProgress {
  status: ProblemStatus;
  bestScore: number | null;
  attemptCount: number;
  lastAttemptAt: string | null;
}

export type ProgressMap = Record<string, ProblemProgress>;

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

export interface DashboardStats {
  problems_attempted: number;
  problems_solved: number;
  total_submissions: number;
  average_score: number | null;
  current_streak: number;
  longest_streak: number;
}

export interface SkillProfileEntry {
  tag: string;
  score: number;
}

export interface RecommendedProblem {
  slug: string;
  reason: string;
}

export interface ProblemContext {
  problem_slug: string;
  hints_unlocked: boolean;
  attempt_count: number;
  best_score: number | null;
  status: ProblemStatus;
  similar_slugs: string[];
}

export interface SubmissionSummary {
  id: string;
  problem_slug: string;
  score: number;
  bottlenecks: string[];
  suggestions: string[];
  submitted_at: string;
}

export interface DashboardData {
  user: UserProfile;
  stats: DashboardStats;
  progress: Array<{
    problem_slug: string;
    status: ProblemStatus;
    best_score: number | null;
    attempt_count: number;
    last_attempt_at: string | null;
  }>;
  recent_submissions: SubmissionSummary[];
  recommended: RecommendedProblem[];
  skill_profile: SkillProfileEntry[];
}
