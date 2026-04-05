export interface AiPosition {
  x: number;
  y: number;
  eg: number;
  zu: number;
  st: number;
  intensitaet: 'gering' | 'mittel' | 'hoch' | 'sehr_hoch';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  number: number;
  x: number;
  y: number;
  status: 'waiting' | 'placed';
  aiPosition: AiPosition | null;
  chatMessages: ChatMessage[];
}

export interface BarycentricCoords {
  eg: number;
  zu: number;
  st: number;
}

export type HeatLevel = 'Sehr hoch' | 'Hoch' | 'Mittel' | 'Gering';

export type Theme = 'light' | 'dark';

export interface PoleLabels {
  eg: { name: string; subtitle: string };
  zu: { name: string; subtitle: string };
  st: { name: string; subtitle: string };
}
