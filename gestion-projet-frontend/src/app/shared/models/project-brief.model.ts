export interface ProjectBrief {
  projectId: number;
  projectName: string;
  generatedAt: string;
  model: string;
  summary: string;
  progressPercent: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  risks: string[];
  blockers: string[];
  suggestions: string[];
}
