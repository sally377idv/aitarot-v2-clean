export interface TarotCard {
  id: string;
  name: string;
  keywords: string[]; // 3个关键词，每个2字
  element: string;
  description: string; // 20字以内
  imageUrl: string;
  upright: string;
  reversed: string;
}

export interface DrawnCard extends TarotCard {
  isReversed: boolean;
  position: number;
}

export interface DivinationSession {
  sessionId: string;
  uid: string;
  ip: string;
  timestamp: string;
  firstQuestion: string;
  tarotResult: DrawnCard[];
  aiInterpretation: AIInterpretation;
  followUpQuestions: FollowUpQuestion[];
}

export interface AIInterpretation {
  conclusion: string;    // 20字以内
  analysis: string;      // 100字以内
  advice: string;        // 50字以内
}

export interface FollowUpQuestion {
  question: string;
  answer: string;        // 100字以内
  timestamp: string;
}

export interface AppState {
  currentSession: DivinationSession | null;
  isLoading: boolean;
  error: string | null;
}

export type Page = 'home' | 'draw' | 'interpretation' | 'followup';