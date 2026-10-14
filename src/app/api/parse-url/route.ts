import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid web URL.' },
        { status: 400 }
      );
    }

    let trimmedUrl = url.trim();
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      trimmedUrl = `https://${trimmedUrl}`;
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmedUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Please provide a valid HTTP or HTTPS website URL.' },
        { status: 400 }
      );
    }

    // Fetch the page with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeout);
      const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
      const message = isTimeout
        ? 'Request timed out after 15 seconds. The target website took too long to respond.'
        : 'Could not connect to this URL. The server may be down or blocking automated requests.';
      return NextResponse.json({ error: message }, { status: 502 });
    }
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Could not retrieve page (HTTP ${response.status} ${response.statusText}). The site may require authentication or be protected by an anti-bot paywall.`,
        },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Parse with Readability via JSDOM
    const dom = new JSDOM(html, { url: parsedUrl.toString() });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    let textContent = article?.textContent?.trim() || '';

    // If Readability was too strict or returned empty, fallback to extracting main tag or body paragraphs
    if (!textContent || textContent.length < 100) {
      const doc = dom.window.document;
      // remove script, style, nav, footer, aside
      ['script', 'style', 'nav', 'footer', 'aside', 'header'].forEach(tag => {
        doc.querySelectorAll(tag).forEach(el => el.remove());
      });

      const bodyParas = Array.from(doc.querySelectorAll('p, article, section, h1, h2, h3, h4, li'))
        .map(el => el.textContent?.trim() || '')
        .filter(t => t.length > 20);

      if (bodyParas.length > 0) {
        textContent = bodyParas.join('\n\n');
      }
    }

    if (!textContent || textContent.length < 50) {
      return NextResponse.json(
        {
          error:
            'Could not extract readable article text from this page. It might be heavily client-side rendered (SPA) or paywalled. You can copy-paste the text directly using the "Direct Text Input" tab.',
        },
        { status: 422 }
      );
    }

    // Clean up excessive blank lines
    textContent = textContent.replace(/\n{3,}/g, '\n\n');

    return NextResponse.json({
      title: article?.title || dom.window.document.title || parsedUrl.hostname,
      textContent,
      siteName: article?.siteName || parsedUrl.hostname.replace(/^www\./, ''),
    });
  } catch (error) {
    console.error('Parse URL error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the URL.' },
      { status: 500 }
    );
  }
}
