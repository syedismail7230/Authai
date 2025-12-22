export enum ContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  CODE = 'CODE'
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COMPLETE = 'COMPLETE',
  CERTIFIED = 'CERTIFIED'
}

export interface ForensicLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'OK' | 'WARN' | 'CRITICAL';
}

export interface AnalysisResult {
  verdict: 'HUMAN' | 'AI_GENERATED' | 'AI_ASSISTED' | 'UNCERTAIN';
  confidenceScore: number; // 0-100
  perplexityScore: number; // 0-100 (Simulated normalized)
  burstinessScore: number; // 0-100
  entropyScore: number; // 0-100
  aiProbability: number;
  humanProbability: number;
  detectedPatterns: string[];
  forensicLogs: ForensicLog[];
  contentHash: string;
}

export interface CertificateData {
  id: string;
  issueDate: string;
  contentHash: string;
  owner: string;
  verdict: string;
  contentPreview?: string;
  contentType: ContentType;
}