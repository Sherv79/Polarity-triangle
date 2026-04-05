# Polarity-Dreieck

Interactive workshop tool for organizational consultants. Participants place AI projects inside a triangle of three organizational paradoxes, then use AI sparring to get an independent assessment. The difference between manual and AI placement becomes a reflection point.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v4 + CSS Custom Properties (no component libraries)
- **Font:** Inter (Google Fonts)
- **State:** React useState/useCallback (no external state management)
- **AI Backend:** Vercel Serverless Functions + Anthropic Claude API
- **Deployment:** Vercel

## Local Development

```bash
npm install
# Standard dev (no AI features):
npm run dev
# With AI features (loads serverless functions + .env):
vercel dev
```

Create a `.env` file with:
```
ANTHROPIC_API_KEY=your-key-here
```

## Component Structure

```
src/
├── components/
│   ├── Header.tsx          # App header with title, PNG export, theme toggle
│   ├── Footer.tsx          # Attribution footer
│   ├── ThemeToggle.tsx     # Dark/Light mode toggle (localStorage + system pref)
│   ├── Triangle.tsx        # Interactive SVG triangle with drag & drop + AI points
│   ├── EditableLabel.tsx   # Inline-editable text labels (foreignObject in SVG)
│   ├── AddProject.tsx      # Project creation form with color picker
│   ├── ProjectList.tsx     # Scrollable list of placed projects
│   ├── AnalysisPanel.tsx   # Barycentric analysis + heat level + AI comparison
│   └── ChatPanel.tsx       # KI-Sparring chat with Anthropic API integration
├── utils/
│   └── triangle.ts         # Math: barycentric coords, point-in-triangle, heat levels, baryToCartesian
├── prompts.ts              # System prompt for AI sparring
├── types.ts                # Shared TypeScript interfaces
├── App.tsx                 # Main layout + state management
├── main.tsx                # Entry point
└── index.css               # Design system (CSS custom properties) + Tailwind
api/
└── chat.ts                 # Vercel serverless function — proxies Anthropic API
```

## Key Features

- **Editable pole labels**: Click any vertex label to edit inline
- **AI Sparring**: 2-3 rounds of diagnostic questions, then AI places its own point (dashed circle)
- **Diff visualization**: Dashed line between manual and AI placement, comparative meter bars
- **Project-specific chat**: Each project has its own chat history
- **PNG export**: Downloads the triangle as a 1360×1080 PNG with resolved CSS variables
- **Drag & drop**: Placed projects can be repositioned within the triangle

## AI Chat Flow

1. User selects a placed project and describes it in the chat
2. AI asks 2-3 rounds of diagnostic questions (Phase 1: Sparring)
3. AI delivers final analysis with JSON block containing barycentric coordinates (Phase 2: Analysis)
4. JSON is parsed, AI point appears as dashed circle in triangle
5. Analysis panel shows side-by-side comparison of manual vs AI assessment

## Triangle Vertices

| Vertex | Position | Color | Default Label |
|---|---|---|---|
| A (top) | (0, -210) | #185FA5 | Entscheidungsgrundlagen |
| B (bottom-right) | (242, 121) | #993C1D | Zurechnung |
| C (bottom-left) | (-242, 121) | #0F6E56 | Steuerbarkeit |

## Planned Features

- Streaming AI responses
- Session persistence (localStorage or DB)
- Multi-user workshop mode
