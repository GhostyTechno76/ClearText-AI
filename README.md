# ClearText AI

> A clean, distraction-free reading workspace that adapts to how your brain works.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Most web articles and documents are formatted for aesthetics rather than comfortable reading. For people with **dyslexia**, **ADHD**, **visual crowding**, or **reading fatigue**, long walls of small text on harsh white backgrounds can make staying focused a chore.

**ClearText AI** turns any article or pasted text into a quiet, customizable reading space. Strip away website clutter, fine-tune font sizing and line spacing, anchor your focus with a reading ruler or bionic text, and simplify dense passages into plain language whenever you need a breather.

---

## What You Can Do

### 🔤 Read Comfortably
- **Choose Your Font**: Switch between a clean modern sans-serif (`Inter`) and `OpenDyslexic` (weighted bottom-heavy letterforms that help prevent letters from flipping or crowding).
- **Tune Spacing with Precision**:
  - **Text Size**: 14px to 36px with smooth sliders and stepper buttons (`+` / `-`).
  - **Line Spacing**: 1.2× to 3.0× line height to give your eyes room to track lines naturally.
  - **Letter Spacing**: 0.00em to 0.25em tracking to combat visual crowding.
- **One-Click Reset**: Quickly restore comfortable default typography whenever you want a clean slate.

### 🎨 4 High-Legibility Themes
- **Paper Light**: A soft, warm off-white (`#FAF8F5`) that cuts out blinding screen glare.
- **Warm Obsidian**: A deep, low-glare dark palette (`#121316`) for night reading or light sensitivity.
- **OLED Contrast**: High-contrast golden text on pure pitch black (`#000000` / `#FACC15`) with emerald accents, delivering an ultra-crisp >19:1 contrast ratio.
- **Restorative Sepia**: Calming parchment tones (`#F6EEDB` / `#3C3226`) inspired by vintage book paper to reduce eye strain.

### 👁️ Visual Reading Aids
- **Bionic Reading**: Dynamically bolds the initial letters of words to create visual anchors for your eyes, supporting smooth saccadic jumping and reducing regressive rereading.
- **Reading Ruler (Focus Guide)**: A soft spotlight bar that follows your cursor across the page to keep you grounded on the line you are currently reading.
- **Instant Word Definitions**: Double-click or select any tricky word to open an accessible plain-language definition with phonetic pronunciation guides and a one-click audio pronunciation button.

### 🔊 Synchronized Read-Aloud (Text-to-Speech)
- **100% In-Browser Speech**: Built on the native Web Speech API (`window.speechSynthesis`) — no external audio servers, zero data sent over the wire for voice playback.
- **Interactive Listening**: Click or press `Enter` on any paragraph to start listening directly from that spot.
- **Live Active Highlighting**: Automatically tracks which paragraph is currently being spoken and smoothly scrolls along with you.
- **Accessible Audio Controls**: Adjust speed (0.75×, 1×, 1.25×, 1.5×), pause, resume, skip paragraphs, or seek with keyboard arrow keys.

### 🤖 Plain-Language Simplification & Takeaways
- **Simplify Text**: Uses AI to rewrite dense academic or technical language into clear, accessible prose while retaining core facts.
- **Key Takeaways**: Distills long articles into structured, high-impact bullet points.
- **Side-by-Side Split View**: Compare the original text and the simplified version side-by-side on larger screens.
- **Smart Zero-Key Fallback**: Works out of the box even without API keys using an intelligent local heuristic dictionary and sentence extractor.

### 🌐 Flexible Content Input
- **Web URL Cleaner**: Paste any public article or blog link. Server-side extraction powered by Mozilla's Readability engine strips out navigation, sidebars, cookie banners, and ads.
- **Direct Paste**: Paste essays, research notes, assignments, or textbook excerpts.
- **Built-in Sample Library**: Three curated demo articles (Reading Neuroscience, Neurodiversity in the Workplace, and Saccadic Eye Movements) for instant one-click testing.

---

## ⌨️ Keyboard Shortcuts & Accessibility

ClearText is designed from the ground up to be keyboard-friendly and accessible:

| Shortcut / Key | Action |
|---|---|
| <kbd>Ctrl</kbd> + <kbd>\</kbd> or <kbd>Cmd</kbd> + <kbd>\</kbd> | Toggle the Reading Settings sidebar open/closed |
| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Navigate sequentially through all controls with visible focus rings |
| <kbd>←</kbd> / <kbd>→</kbd> (in Input Tabs) | Switch between **Web URL** and **Direct Text** input tabs |
| <kbd>←</kbd> / <kbd>→</kbd> (on Audio Scrubber) | Seek backward or forward by 5% through the audio track |
| <kbd>Home</kbd> / <kbd>End</kbd> (on Audio Scrubber) | Jump to the very beginning or end of the reading |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on a Paragraph | Start speech synthesis immediately from that paragraph |

### Accessibility Highlights
- **Strict Input Sanitization**: Text is sanitized against XSS before applying bionic formatting; non-bionic text renders as safe native React elements.
- **Semantic ARIA**: Proper `role="toolbar"`, `role="region"`, `role="switch"`, `aria-valuenow`, and `aria-valuetext` for screen readers and assistive devices.
- **Respects Motion**: Smooth scrolling and animations are restrained to prevent visual vertigo or distraction.
- **Print Optimization**: Clean `@media print` styling strips navigation bars, audio controls, and toolbars for distraction-free physical printing or PDF export.

---

## 🛠️ Tech Stack

| Layer | Tools & Libraries |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript 5.6) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) with responsive design tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Typography** | `Inter` and `OpenDyslexic` |
| **Content Scraping** | `@mozilla/readability` and `jsdom` |
| **AI Providers** | [Google Gemini API](https://ai.google.dev/) (`gemini-3.5-flash-lite`, `gemini-3.8-flash`), [OpenAI](https://platform.openai.com/) (`gpt-4o-mini`), and local heuristic fallback |
| **Audio** | Native Web Speech API (`SpeechSynthesis`) |
| **3D Elements** | `@splinetool/react-spline` and `three` |

---

## 📁 Project Structure

```
CLEARTEXT/
├── package.json                    # Scripts and dependencies (runs on port 3001)
├── tsconfig.json                   # Strict TypeScript setup
├── tailwind.config.ts              # Theme tokens and custom fonts
├── next.config.mjs                 # Next.js transpile and alias rules
├── suggestions.md                  # Comprehensive improvement roadmap & audit
├── README.md                       # Project documentation
└── src/
    ├── app/
    │   ├── globals.css             # Typography rules, OpenDyslexic @font-face, print styles
    │   ├── layout.tsx              # Root HTML layout and metadata
    │   ├── page.tsx                # Main workspace (Hero, Reader, Split View, Reset)
    │   └── api/
    │       ├── parse-url/route.ts  # Clean article extraction via Readability & JSDOM
    │       └── simplify/route.ts   # Multi-tier AI simplification & offline fallback
    ├── components/
    │   ├── AudioPlayer.tsx         # Synchronized TTS player with accessible scrubber
    │   ├── InputSection.tsx        # Accessible dual-tab input (URL / Text) & sample loader
    │   ├── InteractiveFeatureGrid.tsx # 4 live interactive micro-playgrounds on the home screen
    │   ├── LoadingSkeleton.tsx    # Accessible animated loading placeholder
    │   ├── ReaderCanvas.tsx        # High-legibility reading canvas with line-tracking
    │   ├── ReadingRuler.tsx        # Cursor-following spotlight guide
    │   ├── SplineHeroPrism.tsx     # Lightweight interactive 3D hero prism
    │   ├── Toolbar.tsx             # Collapsible typography & theme adjustment dock
    │   └── WordDefinitionPopover.tsx # Inline 5th-grade dictionary popover & pronunciation
    └── lib/
        ├── bionic.ts               # XSS-safe bionic reading algorithm & paragraph parser
        ├── dictionary.ts           # Curated 5th-grade vocabulary dictionary
        ├── sample-article.ts       # Built-in demo articles on reading science & cognition
        ├── themes.ts               # Theme palettes (Paper Light, Obsidian, High Contrast, Sepia)
        └── utils.ts                # Reading time estimator and helper utilities
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18.17+ or v20+ (Node v20 or v24 recommended)
- **npm**, **yarn**, or **pnpm**

### 1. Clone & Install
```bash
git clone https://github.com/GhostyTechno76/ClearText-AI.git
cd ClearText-AI
npm install
```

### 2. Configure Environment Variables (Optional)
ClearText works immediately out of the box without any API keys. If you want live LLM simplification, configure your keys in a `.env.local` file:

```bash
cp .env.example .env.local
```

Inside `.env.local`:
```env
# Google Gemini API Key (Recommended)
# Get a free key from Google AI Studio: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# OpenAI API Key (Optional fallback)
OPENAI_API_KEY=your_openai_key_here
```

### 3. Run the Development Server
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

## 📡 API Overview

### `POST /api/parse-url`
Extracts clean body text from a provided article URL.

- **Request Body**:
  ```json
  { "url": "https://en.wikipedia.org/wiki/Neurodiversity" }
  ```
- **Response**:
  ```json
  {
    "title": "Neurodiversity - Wikipedia",
    "textContent": "Neurodiversity refers to the natural variations in human brain function...",
    "siteName": "wikipedia.org"
  }
  ```

### `POST /api/simplify`
Simplifies or summarizes text with multi-tier failover (Gemini → OpenAI → Local Heuristic).

- **Request Body**:
  ```json
  {
    "text": "The visual information travels to the fusiform gyrus...",
    "mode": "simplify"
  }
  ```
  *(Set `"mode": "summarize"` to generate bullet takeaways).*

- **Response**:
  ```json
  {
    "result": "When you look at words, pictures go to a special part of your brain...",
    "provider": "gemini",
    "model": "gemini-3.5-flash-lite",
    "isMock": false
  }
  ```

---

## 🔒 Privacy & Content Handling

- **In-Memory Processing**: Text pasted or fetched is processed transiently in your current session. No articles, reading histories, or user data are stored on servers or written to databases.
- **External AI Providers**: If you configure a Gemini or OpenAI key, text you choose to simplify is transmitted directly to that provider's secure API. If no keys are provided, processing falls back to the local client/server heuristic dictionary.
- **Scraper Boundaries**: The URL parser fetches public HTML pages to extract article content. It does not bypass paywalls, handle private logins, or scrape protected data.

---

## 🛣️ Roadmap

Check out [`suggestions.md`](suggestions.md) for a comprehensive product review and prioritized engineering roadmap covering:
- Safe local persistence for reader preferences (without storing article text)
- Presets for reading comfort ("Comfortable", "Large Print", "Low Sensory")
- Document file imports (Markdown, TXT) and export options
- Enhanced speech controls with voice selection and language detection

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Created by [GhostyTechno76](https://github.com/GhostyTechno76).
