# VoiceMate Frontend

This is the frontend application for VoiceMate, a high-density, professional B2B SaaS application for inventory management.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui, Radix UI primitives
- **Icons**: Lucide React
- **Voice / NLP**: Web Speech API (transcription) + Custom NLP intent parsing (TUNE)
- **State Management**: React Hooks (Zustand/Context as needed)

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Build for Production
```bash
npm run build
npm start
```

## Architecture

- `app/`: Next.js App Router pages and layouts.
  - `app/home/`: Voice Console (Primary Pipeline).
  - `app/inventory/`: Inventory Master (Product and Unit config).
- `components/`: Shared UI components (headers, sidebars, modals).
- `lib/`: Core application logic.
  - `lib/voice/`: Speech adapters and intent parsing logic.
  - `lib/inventory/`: TUNE unit conversion, services, and core models.
- `src/services/api/`: Axios HTTP clients connecting to the FastAPI backend.

## Design Philosophy
VoiceMate follows a clean SaaS design language, prioritizing visual excellence and density:
- **One workspace → one primary task → supporting context → clear action.**
- Focus on micro-interactions and strict state definitions (Review Required, Verified, Flagged).
- A single source of truth for the inventory state.
