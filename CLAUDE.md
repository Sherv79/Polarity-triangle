# Paradoxie-Dreieck

Interactive workshop tool for organizational consultants. Participants place AI projects inside a triangle of three organizational paradoxes and see how strongly each paradox is affected.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v4 + CSS Custom Properties (no component libraries)
- **Font:** Inter (Google Fonts)
- **State:** React useState/useCallback (no external state management)

## Local Development

```bash
npm install
npm run dev
```

## Component Structure

```
src/
├── components/
│   ├── Header.tsx          # App header with title + theme toggle
│   ├── Footer.tsx          # Attribution footer
│   ├── ThemeToggle.tsx     # Dark/Light mode toggle (localStorage + system pref)
│   ├── Triangle.tsx        # Interactive SVG triangle with drag & drop
│   ├── AddProject.tsx      # Project creation form with color picker
│   ├── ProjectList.tsx     # Scrollable list of placed projects
│   └── AnalysisPanel.tsx   # Barycentric analysis + heat level for selected project
├── utils/
│   └── triangle.ts         # Math: barycentric coords, point-in-triangle, heat levels
├── types.ts                # Shared TypeScript interfaces
├── App.tsx                 # Main layout + state management
├── main.tsx                # Entry point
└── index.css               # Design system (CSS custom properties) + Tailwind
```

## Design System

Linear.app-inspired, minimal design with dark (default) and light modes.

- Colors defined as CSS custom properties in `src/index.css`
- No shadows, no gradients
- Border-radius max 8px
- 150ms ease transitions
- Accent: `#2F779E` (Cerulean Blue)

## Triangle Vertices

| Vertex | Position | Color | Label |
|---|---|---|---|
| A (top) | (0, -210) | #185FA5 | Entscheidungsgrundlagen |
| B (bottom-right) | (242, 121) | #993C1D | Zurechnung |
| C (bottom-left) | (-242, 121) | #0F6E56 | Steuerbarkeit |

## Planned Features

- AI chat integration for paradox analysis
- Difference visualization (before/after comparisons)
- PNG export of triangle state
