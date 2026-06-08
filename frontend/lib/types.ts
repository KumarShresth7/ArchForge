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
