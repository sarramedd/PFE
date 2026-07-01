// Modeles TS alignes sur les DTO du backend (com.example.gestionprojet.dto)

export interface TaskDescriptionRequest {
  title: string;
  projectId?: number;
  language?: 'fr' | 'en';
}

export interface TaskDescriptionResponse {
  description: string;
  acceptanceCriteria: string[];
  estimatedHours: number;
  suggestedPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  model: string;
}

export interface AssigneeSuggestionRequest {
  projectId: number;
  title: string;
  description?: string;
}

export interface AssigneeSuggestion {
  userId: number;
  name: string;
  email: string;
  score: number;
  currentLoad: number;
  reason: string;
}

export interface AssigneeSuggestionResponse {
  suggestions: AssigneeSuggestion[];
  model: string;
}

export interface RiskTask {
  taskId: number;
  title: string;
  status: string;
  dueDate: string | null;
  assignedTo: string | null;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reason: string;
  recommendation: string;
}

export interface RiskTasksResponse {
  projectId: number;
  atRiskTasks: RiskTask[];
  model: string;
}

export interface DiscussionSummaryResponse {
  projectId: number;
  totalComments: number;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  openQuestions: string[];
  model: string;
}
