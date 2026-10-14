import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid URL.' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return NextResponse.json(
        { error: 'Please provide a valid HTTP or HTTPS URL.' },
        { status: 400 }
      );
    }

    // Fetch the page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;
    try {
      response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ClearTextAI/1.0; +https://cleartext.ai)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeout);
      const message = fetchError instanceof Error && fetchError.name === 'AbortError'
        ? 'Request timed out. The website took too long to respond.'
        : 'Could not fetch the URL. The website may be blocking automated requests.';
      return NextResponse.json({ error: message }, { status: 502 });
    }
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page (HTTP ${response.status}). The site may require login or be blocking requests.` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Parse with Readability
    const dom = new JSDOM(html, { url: parsedUrl.toString() });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent?.trim()) {
      return NextResponse.json(
        { error: 'Could not extract readable content from this page. It may be paywalled or use heavy JavaScript rendering.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      title: article.title || 'Untitled Article',
      textContent: article.textContent.trim(),
      siteName: article.siteName || parsedUrl.hostname,
    });
  } catch (error) {
    console.error('Parse URL error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the URL.' },
      { status: 500 }
    );
  }
}
