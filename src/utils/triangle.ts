import type { BarycentricCoords, HeatLevel } from '../types';

// Triangle vertices (in SVG local coordinates, centered at 0,0)
export const VERTICES = {
  A: { x: 0, y: -210 },   // Entscheidungsgrundlagen (top)
  B: { x: 242, y: 121 },  // Zurechnung (bottom-right)
  C: { x: -242, y: 121 }, // Steuerbarkeit (bottom-left)
};

// Triangle center (centroid)
export const CENTER = { x: 0, y: 10.67 };

// Vertex colors
export const VERTEX_COLORS = {
  eg: '#185FA5', // Entscheidungsgrundlagen
  zu: '#993C1D', // Zurechnung
  st: '#0F6E56', // Steuerbarkeit
};

// Heat zone definitions
export const HEAT_ZONES = [
  { radius: 165, label: 'Mittel' as const, color: '#BA7517', opacity: 0.025 },
  { radius: 110, label: 'Hoch' as const, color: '#EF9F27', opacity: 0.04 },
  { radius: 55, label: 'Sehr hoch' as const, color: '#E24B4A', opacity: 0.06 },
];

// Project color palette
export const PROJECT_COLORS = [
  '#378ADD', '#1D9E75', '#BA7517', '#E24B4A', '#534AB7',
  '#D4537E', '#D85A30', '#639922', '#888780',
];

/**
 * Sign-based point-in-triangle test
 */
function sign(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
  return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
}

export function isPointInTriangle(px: number, py: number): boolean {
  const { A, B, C } = VERTICES;
  const d1 = sign(px, py, A.x, A.y, B.x, B.y);
  const d2 = sign(px, py, B.x, B.y, C.x, C.y);
  const d3 = sign(px, py, C.x, C.y, A.x, A.y);

  const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

  return !(hasNeg && hasPos);
}

/**
 * Convert cartesian coordinates to barycentric coordinates (percentages)
 */
export function cartesianToBary(x: number, y: number): BarycentricCoords {
  const { A, B, C } = VERTICES;
  const det = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y);
  const l1 = ((B.y - C.y) * (x - C.x) + (C.x - B.x) * (y - C.y)) / det;
  const l2 = ((C.y - A.y) * (x - C.x) + (A.x - C.x) * (y - C.y)) / det;
  const l3 = 1 - l1 - l2;

  return {
    eg: Math.round(l1 * 100),
    zu: Math.round(l2 * 100),
    st: Math.round(l3 * 100),
  };
}

/**
 * Calculate heat level based on distance from center
 */
export function getHeatLevel(x: number, y: number): { level: HeatLevel; color: string } {
  const dist = Math.sqrt(x * x + (y - 10) * (y - 10));

  if (dist < 55) return { level: 'Sehr hoch', color: '#E24B4A' };
  if (dist < 110) return { level: 'Hoch', color: '#D85A30' };
  if (dist < 165) return { level: 'Mittel', color: '#BA7517' };
  return { level: 'Gering', color: '#1D9E75' };
}

/**
 * Get advisory text based on heat level
 */
export function getHeatAdvice(level: HeatLevel): string {
  switch (level) {
    case 'Sehr hoch':
    case 'Hoch':
      return 'Dieses Projekt erfordert explizite Führungsarbeit an allen drei Paradoxien gleichzeitig.';
    case 'Mittel':
      return 'Eine Paradoxie dominiert — gezielte Intervention möglich.';
    case 'Gering':
      return 'Geringe Paradoxie-Intensität — Standard-Governance ausreichend.';
  }
}

/**
 * Convert barycentric coordinates (percentages) to cartesian coordinates
 */
export function baryToCartesian(eg: number, zu: number, st: number): { x: number; y: number } {
  const total = eg + zu + st;
  const wEg = eg / total;
  const wZu = zu / total;
  const wSt = st / total;
  const x = wEg * VERTICES.A.x + wZu * VERTICES.B.x + wSt * VERTICES.C.x;
  const y = wEg * VERTICES.A.y + wZu * VERTICES.B.y + wSt * VERTICES.C.y;
  return { x, y };
}

/**
 * Parse AI analysis JSON from chat response text
 */
const ANALYSIS_REGEX = /\{[^{}]*"entscheidungsgrundlagen"\s*:\s*\d+[^{}]*\}/;

export function parseAnalysis(text: string): {
  eg: number;
  zu: number;
  st: number;
  intensitaet: 'gering' | 'mittel' | 'hoch' | 'sehr_hoch';
} | null {
  const match = text.match(ANALYSIS_REGEX);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]);
    if (
      typeof obj.entscheidungsgrundlagen === 'number' &&
      typeof obj.zurechnung === 'number' &&
      typeof obj.steuerbarkeit === 'number'
    ) {
      return {
        eg: obj.entscheidungsgrundlagen,
        zu: obj.zurechnung,
        st: obj.steuerbarkeit,
        intensitaet: obj.intensitaet || 'mittel',
      };
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Strip JSON analysis block from display text
 */
export function stripAnalysisJson(text: string): string {
  return text
    .replace(/```json\s*\{[^{}]*"entscheidungsgrundlagen"[^{}]*\}\s*```/g, '')
    .replace(ANALYSIS_REGEX, '')
    .trim();
}
