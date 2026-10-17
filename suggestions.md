# ClearText AI: Improvement Roadmap

## What the project does today

ClearText AI is a browser-based reading workspace. Readers can paste text or submit a web URL, adjust typography and color themes, enable bionic styling or a reading ruler, request an AI rewrite or summary, compare text, and listen with browser speech synthesis. The landing page also includes sample articles and interactive previews.

This is a product roadmap based on the current app, components, API routes, and README. It is not a claim that every item is a defect. Priorities:

- **P0 — Trust and safety:** fix before presenting the tool as safe for arbitrary user content.
- **P1 — Core experience:** high-value usability, accessibility, and reliability improvements.
- **P2 — Expansion:** useful additions once the core experience is dependable.

## 1. Make it more efficient

### P1: Reduce work before the reader is needed

- Defer the Spline/WebGL scene until it is near the viewport or the user asks to see it. It is dynamically imported already, but currently mounts as part of the initial hero experience. Offer a lightweight static image or CSS alternative by default, especially on mobile and low-power devices.
- Measure the initial JavaScript and rendering cost before removing libraries. Set budgets for first load, interaction readiness, and the 3D scene; verify on a mid-range phone as well as desktop.
- Keep the reading screen responsive for long documents. For large inputs, render visible paragraphs on demand (virtualization or pagination) and avoid recalculating or animating the entire canvas for each settings change.
- Load third-party fonts locally or provide a dependable system-font path. The current font declarations rely on external font hosts, which can delay typography, fail offline, and disclose a network request to those hosts.

### P1: Make network work predictable

- Set explicit maximum input sizes and request timeouts for both endpoints. The AI route currently slices content at 10,000 characters without telling the reader; show the limit before submission and clearly explain what content will be omitted, or process it in bounded sections.
- Allow in-flight URL and AI requests to be cancelled when the reader changes articles or leaves the task. Prevent stale responses from replacing newer content.
- Avoid sending unchanged text through the AI endpoint again when the user switches display settings. Consider a short-lived, local cache keyed by the text and operation; do not retain article contents on a shared server cache.
- Give URL fetching clear byte and content-type limits before parsing HTML. This protects memory and keeps unexpectedly large or non-HTML responses from tying up a server worker.

### P2: Measure and tune instead of guessing

- Add lightweight performance measurements for extraction, AI response time, first content render, and speech startup. Track aggregate timings without collecting article text.
- Test a short article, a long article, and a very long paste to establish where progressive rendering becomes worthwhile.
- Remove or consolidate unused components and dependencies only after checking actual imports and bundle output.

## 2. Make it more functional

### P0: Render article text as text, not trusted HTML

- Reader paragraphs are passed to `dangerouslySetInnerHTML`; the bionic formatter wraps input in HTML but does not escape the original text first. Pasted content and fetched article text must be treated as untrusted. Render text through React text nodes (with React elements for bionic emphasis), or escape text before adding only application-generated markup. Add a regression test with HTML-like input and an event-handler payload.

### P1: Close gaps in the main reading flow

- Make clicking or keyboard-activating a paragraph do what its accessible label promises. At present, paragraph activation selects an index, but does not start speech unless playback is already running. Either start read-aloud at that paragraph or say that it sets the starting point and make the Play action clear.
- Align the word-definition instruction with the interaction. The reader tells people to double-click, while the handler opens on text selection/mouse-up. Support touch and keyboard selection where possible, and give the feature a clear, accurate instruction.
- Keep the current article visible while another URL is loading, with progress and a cancel option. Replacing the entire reader with a skeleton makes a slow request feel like lost work.
- Make the AI comparison reflect the selected operation. Summaries are stored in the same result state as simplifications, while Split View labels the right pane as a simplified fifth-grade version. Use operation-specific titles, labels, and comparison behavior.
- Keep the last successful AI result available if a later request fails; distinguish a failed attempt from the displayed result and identify whether output came from an AI provider or the local heuristic.
- Add an explicit empty/failed extraction state with practical next steps: retry, paste text, or load an example. Explain that some pages cannot be extracted and that the tool does not bypass access controls.

### P1: Make preferences and reading progress usable

- Persist reader preferences (theme, font, spacing, and reading aids) locally, with a simple way to reset them. Do not persist article text by default; make any save/history feature opt-in.
- Add a compact preset system such as “Comfortable,” “Larger text,” and “Low stimulation,” while keeping every individual control available. Let people try a preset without implying one setting works for everyone.
- Remember the current paragraph during a reading session and restore it when the user switches between original and AI text, where paragraph alignment permits. Clearly reset progress when the article changes.
- Improve read-aloud controls with voice selection, language-aware speech, a visible voice-unavailable state, and keyboard-accessible seeking. Use speech boundary events for word-level highlighting when the browser supports them, with paragraph highlighting as the reliable fallback.
- Make the progress scrubber keyboard-operable and give it a semantic label and current value; its current click-only interaction is difficult or impossible to use without a pointer.
- Provide a structured output for summaries (actual list items rather than relying only on bullet characters) and let readers copy or export the original and transformed versions separately.

### P1: Make accessibility claims testable

- Audit the complete interface with keyboard-only use, screen readers, zoom/reflow, forced colors, and automated contrast checks across every theme. Include the landing page, menus, popovers, loading states, and errors.
- Do not present “WCAG AAA” as a verified product badge until the applicable criteria have been tested and documented. A high-contrast theme by itself does not establish conformance for the whole application.
- Make range controls' current values and units available to assistive technology. Ensure tooltips work on focus, not only mouse hover.
- Check reduced-motion behavior for all animation sources, including the 3D canvas, speech indicators, smooth scrolling, and loading effects. Offer a predictable static mode independently of the operating-system preference.
- Add focused tests for text formatting, paragraph splitting, AI request validation, extraction errors, settings persistence, and accessible controls. There is currently no test script or test suite listed in `package.json`.

### P0/P1: Protect URL extraction and explain AI limits

- Treat the URL parser as a server-side request boundary: block loopback, private, link-local, and other non-public destinations; re-check redirect destinations; and restrict schemes, ports, response size, and content type. Validate this on the server, not just in the input field.
- Do not describe the no-key rewrite as fully offline: it calls a server endpoint and uses a small word-substitution/sentence-selection heuristic. Label that mode honestly, avoid promising a particular grade level or preservation of every fact, and let readers see when the output is heuristic.
- Give readers control over AI use and be explicit about where text is sent when an external provider is configured. Avoid sending content until the reader presses the relevant action; document provider handling and retention accurately.
- For long text, show a clear coverage notice rather than silently returning a rewrite of only its first portion. Consider chunking with overlap and a final consistency pass, or require the reader to select a section.

### P2: Add useful input and output options

- Add file import (TXT/Markdown first; PDF/EPUB only with reliable extraction and clear OCR limitations).
- Offer export to plain text or Markdown, and a print view that preserves titles, source attribution, and readable spacing.
- Consider a browser extension or bookmarklet for sending the current page to ClearText without copying its URL manually.
- Add optional highlights, notes, and saved reading lists only with clear local-storage, deletion, and privacy controls.
- Add translations or additional interface languages after the extraction, dictionary, speech, and AI paths can all handle language selection consistently.

## 3. Make it more interesting

The project already has multiple reading controls and sample previews. Prefer meaningful reader agency and useful outcomes over adding more animation or decorative cards.

- Let people tune simplification to their own needs: “plain language,” “keep technical terms with definitions,” “shorter,” or “explain this paragraph.” Avoid assuming that every reader wants a fifth-grade target.
- Add an optional “learn” mode that keeps the original paragraph beside a plain-language explanation, glossary, and a short comprehension check. Make it skippable and never gate the source text behind it.
- Add a reader-controlled focus mode with adjustable column width, paragraph spacing, background, and distraction-free full screen.
- Make summaries actionable: save key points, copy citations/source links, jump from a takeaway to the relevant source paragraph, and compare a claim against its original context.
- Expand examples with varied, reviewed content (news, instructions, research, forms, and everyday web copy) so users can judge extraction and rewriting on realistic material.
- Invite readers to submit optional, non-content feedback such as “this setting helped,” “the rewrite changed the meaning,” or “this page failed to extract.” Do not collect pasted articles as feedback.
- Validate new ideas with people who use assistive reading tools; treat interactive previews and visual novelty as secondary to whether the tool helps them complete a real reading task.

## 4. Make it more human (less “vibecodey”)

The checklist below is an implementation review, not a generic list of style rules. “Present” means the code or copy contains the pattern; “not found” means no evidence in the reviewed project files, not a guarantee about every deployed page or state.

### Visual and motion red flags

- **Purple as a default brand treatment — mostly not present.** The reader themes use blue, cyan, green, yellow, and sepia rather than a purple palette. The Spline hero/fallback does use indigo among its decorative gradients. Keep that accent only if it is intentional and tested against the brand; do not spread purple glows or fills through controls just to make the UI feel more “AI.”
- **Sparkles everywhere — present enough to trim.** The `Sparkles` icon appears in the header badge, hero/features, and AI actions. Keep it only where it communicates an AI action; remove it from general branding or non-AI status labels. Repeated “✨” and science/brain emoji also appear in the interactive preview and sample badges; use the existing icon set or plain text consistently instead.
- **Hover effects on many elements — present.** Cards and buttons use repeated `hover:scale-*`, animated shadows, and transitions. Keep hover feedback subtle and functional (color, underline, or a restrained shadow); remove scaling from text-heavy cards and controls where it shifts layout or makes the page feel busy.
- **Large icon / tiny text hierarchy — not a major red flag in the reviewed components.** Most Lucide icons are small (roughly 10–18px). Preserve that balance and check any new feature cards at mobile sizes rather than enlarging icons to fill space.
- **Generic font and heavy type — partly present.** The UI uses Inter and frequent `font-black` headings, with some very small uppercase labels. Inter itself is not the issue; establish a small type scale, readable minimum label sizes, consistent line-height, and use heavy weights only for real hierarchy. Keep the reader's chosen font and legibility ahead of brand styling.
- **Translucent sticky header — present.** The sticky header combines a transparent theme backdrop with `backdrop-blur`. Verify text and border contrast over changing content while scrolling and at browser zoom; if contrast or clarity varies, use a more opaque background instead of relying on blur.
- **Decorative / frequent animation — present.** The hero has a 3D animated scene, and the interface includes pulse, spin, bounce, hover-scale, and smooth-scroll effects. Retain only animation that conveys state or supports an explicit preview. Respect reduced motion and provide a quiet/static option; avoid animating every control or moving content during reading.

### Structure and interaction red flags

- **Loading feedback — present, so do not add a second loading pattern just for appearance.** URL extraction has a loading label/spinner and skeleton, and AI actions show a spinner. Improve the existing feedback instead: keep the current article visible while loading another, offer cancellation where possible, and make failures/retries clear.
- **Component consistency — needs a deliberate system.** The UI mixes `rounded-xl`, `2xl`, `3xl`, and full-pill corners, as well as several shadow and spacing strengths. Define a compact set of design tokens for radius, spacing, elevation, and control height, then apply it to the header, reader, toolbar, and feature cards. Do not force every element to have the same radius.
- **Slow actions — possible risk, not proven by static review.** URL extraction has a 15-second timeout, but remote AI calls do not have a clearly bounded timeout in the route, and fallback adds a fixed delay. Add bounded server-side timeouts and meaningful progress/error states; measure actual latency before claiming the app is slow.
- **Misaligned grids or broken responsive layout — not established by code inspection.** Responsive grid breakpoints and flex wrapping exist. Check the landing hero, four-card feature grid, split reader, and toolbar in a browser at narrow widths and zoom levels; fix any overflow or awkward stacking found rather than assuming the classes guarantee a good layout.
- **Interactive elements — mostly respond, but some behavior is misleading or incomplete.** URL/text tabs switch content, feature previews toggle, and speech controls call the browser API. However, the tab roles do not implement the usual arrow-key tab navigation, paragraph activation does not start speech unless it is already playing, and the scrubber is pointer-only. Implement expected keyboard semantics and make each label match its actual effect.
- **No fake testimonials or decorative social links found.** The reviewed app has no testimonial block; its GitHub link points to the project repository. Do not add testimonials without real, permissioned feedback or add social icons unless they link to maintained accounts.

### Copy and presentation red flags

- **Hero is crowded and overclaims — present.** It combines a broad neurodiversity claim, “crystal clarity,” a long feature-heavy subheadline, the input capsule, animated 3D art, and four interactive feature cards. Make the reader's input the clear focus, shorten the copy to explain what users can do, and move secondary demonstrations below the primary task.
- **Decorative jargon and vague slogans — present.** Labels such as “Living Canvas,” “Tactile Studio,” “Clarity Sync,” “Bionic Fixation,” “Refracting & Clarifying,” and “Reading Sanctuary” obscure ordinary actions. Replace them with direct labels such as “Reader settings,” “Read aloud,” “Reading guide,” and “Loading article.”
- **Emoji as interface decoration — present.** Sample chips use emoji, and the feature preview embeds emoji in its state label. Replace these with consistent Lucide icons where an icon adds meaning, or use concise text without decoration.
- **Avoid generic or unsupported claims.** “Empowering Neurodivergent & Dyslexic Readers Everywhere,” “crystal clarity,” and claims that simplification keeps all facts sound more certain or universal than the implementation can guarantee. Use specific, modest language; let readers choose a reading level and explain that AI output may change or omit meaning.
- **Review the sample content and attribution.** Demo articles are locally authored, but some display publisher-like names (for example, “Neuroscience Daily”) that could be mistaken for sources. Label samples as demos, use accurate attribution, and link scientific claims to reviewed sources or remove them.
- **Copyright text — no obvious placeholder found, but confirm ownership.** The footer says “© 2026 ClearText AI” and “Built by SKD,” rather than an obvious “YourSiteName” placeholder. Verify the year, attribution preference, and any license/brand requirements before release; do not add a made-up author identity.

### Technical polish red flags

- **Metadata — partly present.** The root layout sets a descriptive title and description; it does not define Open Graph/Twitter sharing metadata or a share image. Add accurate social metadata and a real preview image if link sharing matters. Do not add an image merely to tick a checklist box.
- **Responsiveness — implementation present, behavior still needs verification.** Tailwind breakpoints are used throughout, but code alone cannot confirm that controls, split view, and typography work at small widths, high zoom, or with long titles. Include these in browser checks.
- **Accessibility claim — needs substantiation.** The header displays “WCAG AAA” and the footer claims WCAG 2.1 AAA, but these reviewed files do not provide evidence of a complete conformance audit. Remove or qualify the badge until the relevant pages, themes, interactions, and assistive technologies have been tested and documented.

### P1: Make the interface more human and trustworthy

- Use respectful, non-prescriptive language: reading preferences differ, and no font, color, bionic styling, or spacing setting works for everyone.
- Keep animation, glows, all-caps micro-labels, and decorative icons subordinate to reading. Provide a reduced-motion path that also stops the 3D scene.
- Use plain, task-focused error messages that explain a next step, rather than technical terms such as “SPA.”
- Explain what happens to submitted URLs and text, which AI providers may receive text, and whether anything is stored. Make no privacy promise that has not been verified for the deployment and providers.
- Add a short “How this works” explanation for extraction, provider-backed AI, the local heuristic fallback, and browser speech. Clearly distinguish those modes.
- Ask people who use assistive reading tools to review the language and interaction patterns; do not infer preferences from diagnosis labels.
- Replace README claims such as “production-grade” and “WCAG 2.1 AAA” with verified scope, known limitations, test status, and a way to report accessibility barriers.

## Suggested order

1. **P0:** Make untrusted article text safe to render; harden server-side URL fetching against private-network access and oversized responses.
2. **P1:** Fix the paragraph/read-aloud interaction and word-definition instructions; clarify AI modes, truncation, and fallback behavior.
3. **P1:** Audit accessibility and privacy claims, add focused tests, and improve loading/error handling.
4. **P1:** Reduce initial 3D/font cost and validate performance with real article sizes and devices.
5. **P2:** Add persistence, richer import/export, learning aids, and broader input sources based on reader feedback.
