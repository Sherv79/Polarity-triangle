export interface Project {
  id: string;
  name: string;
  color: string;
  number: number;
  x: number;
  y: number;
  status: 'waiting' | 'placed';
}

export interface BarycentricCoords {
  eg: number; // Entscheidungsgrundlagen
  zu: number; // Zurechnung
  st: number; // Steuerbarkeit
}

export type HeatLevel = 'Sehr hoch' | 'Hoch' | 'Mittel' | 'Gering';

export type Theme = 'light' | 'dark';
