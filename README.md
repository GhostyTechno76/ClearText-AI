# 📖 ClearText AI — Accessible Reading & Simplification Interface

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![WCAG AAA](https://img.shields.io/badge/Accessibility-WCAG_2.1_AAA-green)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**ClearText AI** is a production-grade web reader and neurodiversity accessibility tool. It transforms complex articles, dense research papers, and raw text into clean, customizable, dyslexia-friendly, and simplified reading layouts with real-time text-to-speech audio tracking.

---

## 🌟 Key Features

### 1. 👁️ Bionic Reading Engine
- Dynamically analyzes word lengths and wraps the initial 40–50% of characters in `<strong>` tags.
- Guides saccadic eye movement and reduces visual wandering across long passages.
- Instant toggle with zero layout shift.

### 2. 🔤 Dyslexia Typography & Spacing Controls
- **Font Switcher**: Standard modern Sans-Serif (`Inter`) vs. `OpenDyslexic` (weighted bottom-heavy font designed to reduce letter confusion and inversion).
- **Font Size Slider**: 14px to 36px real-time adjustment with increment/decrement steppers.
- **Line Height (`leading`)**: 1.2 to 3.0 line-spacing multiplier (critical for readers with dyslexia and ADHD).
- **Letter Spacing (`tracking`)**: 0.00em to 0.25em adjustment.
- **One-Click Reset**: Quickly return to recommended baseline reading settings.

### 3. 🎨 4 High-Contrast WCAG 2.1 AAA Themes
- **Light**: Crisp high-legibility slate on pure white.
- **Dark**: Low-glare deep navy/slate palette for light-sensitive readers.
- **High Contrast**: Pure black background (`#000000`) with high-visibility yellow text (`#ffff00`) and cyan accents (`#00ffff`) meeting strict WCAG 2.1 AAA contrast ratios.
- **Soft Sepia**: Calming warm parchment tones (`#f4ecd8` / `#432818`) proven to decrease visual fatigue and photophobia.

### 4. 🤖 AI Simplification & Bullet Summarizer
- **Simplify (5th-Grade Level)**: Uses OpenAI `gpt-4o-mini` with custom prompt engineering to rewrite technical jargon into clear, direct English while preserving all core facts.
- **Key Bullets**: Synthesizes long articles into structured, high-impact takeaways.
- **Dual-View Toggle**: Switch seamlessly between the original text and the AI-simplified version.
- **Smart Offline Fallback**: Works completely offline or without an OpenAI API key out-of-the-box using an intelligent rule-based plain-English dictionary and sentence extractor.

### 5. 🔊 Synchronized Audio Read-Aloud Player
- **Zero External Dependencies**: Powered by the native browser Web Speech API (`window.speechSynthesis`).
- **Live Active Section Highlighting**: Automatically tracks which paragraph is currently being spoken and highlights it in real time with auto-scroll.
- **Interactive Listening**: Click any paragraph in the canvas to start reading aloud directly from that point.
- **Speed Controls**: Real-time rate toggles (0.75x, 1x, 1.25x, 1.5x), play, pause, stop, and previous/next paragraph skip buttons.

### 6. 🌐 Dual-Input Scraper & Instant Sample
- **Web URL Extraction**: Enter any article or news URL. Server-side scraping via `@mozilla/readability` and `jsdom` extracts the primary article text while stripping away ads, sidebars, cookie banners, and navigation clutter.
- **Direct Text Input**: Paste raw text, assignments, or study notes.
- **"Try Sample Article"**: One-click demo loading a neuroscience article on reading and dyslexia for instant testing.
- **Click-to-Home**: Clicking the brand logo or "New Article" instantly resets the reader state and returns to the home page.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/), `@tailwindcss/typography` |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Fonts** | `Inter` (Google Fonts) & `OpenDyslexic` (Webfont) |
| **Scraping** | `@mozilla/readability`, `jsdom` |
| **AI / LLM** | [OpenAI API](https://platform.openai.com/) (`gpt-4o-mini`) + local intelligent fallback |
| **Speech** | Web Speech API (`SpeechSynthesisUtterance`) |
| **Deployment** | Vercel Edge / Serverless Ready |

---

## 📁 Repository Structure

```
CLEARTEXT/
├── .env.example                     # Environment variable template
├── package.json                     # Scripts & dependencies (Port 3001)
├── tsconfig.json                    # Strict TypeScript configuration
├── tailwind.config.ts               # Custom fonts & themes
├── next.config.mjs                  # Next.js configuration
├── postcss.config.mjs               # PostCSS configuration
├── README.md                        # Project documentation
└── src/
    ├── app/
    │   ├── globals.css              # Typography, OpenDyslexic @font-face, print styles
    │   ├── layout.tsx               # Root HTML layout & meta tags
    │   ├── page.tsx                 # Main application page (Hero, Reader, Reset)
    │   └── api/
    │       ├── parse-url/route.ts   # URL parser with Readability & JSDOM
    │       └── simplify/route.ts    # AI text simplification & bullet summarizer
    ├── components/
    │   ├── InputSection.tsx         # Dual-tab input (URL / Text) + sample button
    │   ├── ReaderCanvas.tsx         # Accessible reading canvas with active highlight
    │   ├── Toolbar.tsx              # Floating typography & theme controls
    │   ├── AudioPlayer.tsx          # Real-time TTS player with speed & skip controls
    │   └── LoadingSkeleton.tsx     # Animated accessible loading placeholder
    └── lib/
        ├── bionic.ts                # Bionic reading algorithm & paragraph splitter
        ├── themes.ts                # Theme palettes (Light, Dark, High Contrast, Sepia)
        ├── sample-article.ts        # Built-in sample article on reading neuroscience
        └── utils.ts                 # Reading time calculator & utilities
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.17+ or v20+ (Node v24+ tested)
- npm or yarn or pnpm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/cleartext-ai.git
cd cleartext-ai
npm install
```

### 2. Environment Configuration (Optional)
The application works immediately out-of-the-box without an API key using smart dynamic fallback data. To enable live OpenAI `gpt-4o-mini` generation:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
OPENAI_API_KEY=sk-your-openai-key-here
```

### 3. Run Development Server (Port 3001)
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
The production server will also serve on [http://localhost:3001](http://localhost:3001).

---

## 📡 API Reference

### `POST /api/parse-url`
Extracts readable main body text from any given URL.

**Request:**
```json
{
  "url": "https://en.wikipedia.org/wiki/Neurodiversity"
}
```

**Response:**
```json
{
  "title": "Neurodiversity - Wikipedia",
  "textContent": "Neurodiversity refers to the diversity of human brains and minds...",
  "siteName": "wikipedia.org"
}
```

---

### `POST /api/simplify`
Simplifies or summarizes provided text using AI or smart rule-based fallback.

**Request:**
```json
{
  "text": "The visual information travels to the fusiform gyrus...",
  "mode": "simplify" // or "summarize"
}
```

**Response:**
```json
{
  "result": "When you look at words, pictures go to a special part of your brain...",
  "isMock": false
}
```

---

## ♿ Accessibility (WCAG 2.1 AAA) Highlights
- **Keyboard Navigation**: All interactive elements (tabs, toggles, sliders, speech controls, paragraphs) are fully keyboard-navigable with clear focus rings (`:focus-visible`).
- **Semantic ARIA**: Proper `role="toolbar"`, `role="region"`, `role="tablist"`, `aria-selected`, `aria-checked`, and `aria-label` tags throughout.
- **Non-Text Contrast**: All controls exceed 3:1 contrast against adjacent background colors.
- **Text Contrast**: High-Contrast theme achieves over 19:1 contrast ratio (far exceeding the 7:1 WCAG AAA standard).
- **Reduced Motion**: Respects browser smooth-scroll and animation preferences.
- **Print Optimization**: Native `@media print` stylesheet strips player bars and toolbars for distraction-free physical printing or PDF generation.

---

## ☁️ Vercel Deployment

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the repository.
4. (Optional) Add `OPENAI_API_KEY` under **Environment Variables**.
5. Click **Deploy**. Next.js App Router will compile and deploy automatically.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
