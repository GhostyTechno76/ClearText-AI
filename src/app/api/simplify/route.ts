import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const MOCK_SIMPLIFY = `Here is a simpler version of the text:

Reading is something amazing our brains do. Even though people have been talking for a very long time, reading is pretty new — only about 5,000 years old. Our brains had to learn a new trick to do it.

When you look at words, your eyes send pictures to the back of your brain. Then a special part of your brain called the "letterbox" figures out what the letters and words are. This part gets better the more you practice reading.

Good readers can look at a word and know it right away without sounding it out. Their brains remember what the word looks like as a whole picture.

Your brain uses two ways to read words. The first way is sounding out the letters one by one. New readers use this way a lot. The second way is seeing the whole word and knowing what it means right away, like recognizing a friend's face.

Some people have dyslexia, which makes sounding out words harder. About 15-20 out of every 100 people have it. But with the right help and tools, they can become great readers.

New tools can help everyone read better. Things like bigger text, more space between lines, and special fonts make reading easier for your brain. Some tools make the first part of each word bold, which helps your brain guess the rest of the word faster.

Scientists found that simple changes can help a lot. Just adding more space between lines can help people with dyslexia read 20% faster. Using a clean, simple font and slightly bigger text helps everyone read longer without getting tired.

The future is exciting! Smart computers can now make hard text easier to understand. Together with tools that let you change how text looks and listen to it being read aloud, more people than ever can read and learn from all kinds of information.`;

const MOCK_SUMMARY = `Here are the key points:

• Reading is a relatively new skill for humans (only ~5,000 years old), and our brains had to adapt existing brain circuits to handle it

• A special brain region called the Visual Word Form Area (VWFA) or "letterbox" processes letter patterns and whole word shapes

• The brain uses two reading pathways: phonological (sounding out words) and lexical (instant visual recognition)

• Dyslexia affects 15-20% of the population and involves difficulties with the phonological pathway, but can be managed with proper support

• Simple text modifications can dramatically improve reading: 1.5x line spacing improves dyslexic reading speed by up to 20%

• Bionic reading (bolding first portions of words) leverages the brain's word-completion prediction ability

• AI-powered simplification and customizable reading tools are making information more accessible to all reading levels`;

export async function POST(request: NextRequest) {
  try {
    const { text, mode } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Please provide text content.' },
        { status: 400 }
      );
    }

    if (!mode || !['simplify', 'summarize'].includes(mode)) {
      return NextResponse.json(
        { error: 'Mode must be "simplify" or "summarize".' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Fallback to mock data if no API key
    if (!apiKey || apiKey === 'your_key_here') {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({
        result: mode === 'simplify' ? MOCK_SIMPLIFY : MOCK_SUMMARY,
        isMock: true,
      });
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt =
      mode === 'simplify'
        ? 'You are an accessibility assistant. Rewrite the following text into plain, direct, 5th-grade level English while preserving all core facts. Remove obscure jargon. Use short sentences. Keep paragraphs brief (2-3 sentences each). Maintain the overall structure and key information.'
        : 'You are an accessibility assistant. Summarize the following text into clear, concise bullet points. Each bullet should capture one key fact or idea. Use plain language. Aim for 5-8 bullet points. Format each bullet starting with •';

    const truncatedText = text.slice(0, 8000);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: truncatedText },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ result, isMock: false });
  } catch (error: unknown) {
    console.error('Simplify API error:', error);
    
    const isAuthError = error instanceof Error && 'status' in error && (error as { status: number }).status === 401;
    if (isAuthError) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
