import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

const SAMPLE_SIMPLIFY = `Here is a simpler version of the text:

Reading is something amazing our brains do. Even though people have been talking for a very long time, reading is pretty new — only about 5,000 years old. Our brains had to learn a new trick to do it.

When you look at words, your eyes send pictures to the back of your brain. Then a special part of your brain called the "letterbox" figures out what the letters and words are. This part gets better the more you practice reading.

Good readers can look at a word and know it right away without sounding it out. Their brains remember what the word looks like as a whole picture.

Your brain uses two ways to read words. The first way is sounding out the letters one by one. New readers use this way a lot. The second way is seeing the whole word and knowing what it means right away, like recognizing a friend's face.

Some people have dyslexia, which makes sounding out words harder. About 15-20 out of every 100 people have it. But with the right help and tools, they can become great readers.

New tools can help everyone read better. Things like bigger text, more space between lines, and special fonts make reading easier for your brain. Some tools make the first part of each word bold, which helps your brain guess the rest of the word faster.

Scientists found that simple changes can help a lot. Just adding more space between lines can help people with dyslexia read 20% faster. Using a clean, simple font and slightly bigger text helps everyone read longer without getting tired.

The future is exciting! Smart computers can now make hard text easier to understand. Together with tools that let you change how text looks and listen to it being read aloud, more people than ever can read and learn from all kinds of information.`;

const SAMPLE_SUMMARY = `Here are the key points:

• Reading is a relatively new skill for humans (only ~5,000 years old), and our brains had to adapt existing brain circuits to handle it

• A special brain region called the Visual Word Form Area (VWFA) or "letterbox" processes letter patterns and whole word shapes

• The brain uses two reading pathways: phonological (sounding out words) and lexical (instant visual recognition)

• Dyslexia affects 15-20% of the population and involves difficulties with the phonological pathway, but can be managed with proper support

• Simple text modifications can dramatically improve reading: 1.5x line spacing improves dyslexic reading speed by up to 20%

• Bionic reading (bolding first portions of words) leverages the brain's word-completion prediction ability

• AI-powered simplification and customizable reading tools are making information more accessible to all reading levels`;

// Dictionary of complex words to 5th-grade friendly synonyms for smart offline fallback
const SIMPLIFY_MAP: Record<string, string> = {
  utilize: 'use',
  utilized: 'used',
  utilizing: 'using',
  demonstrate: 'show',
  demonstrates: 'shows',
  demonstrated: 'showed',
  facilitate: 'help',
  facilitates: 'helps',
  approximately: 'about',
  subsequently: 'then',
  fundamental: 'basic',
  comprehend: 'understand',
  comprehension: 'understanding',
  numerous: 'many',
  substantial: 'large',
  commence: 'start',
  commenced: 'started',
  terminate: 'end',
  terminated: 'ended',
  implement: 'carry out',
  implemented: 'carried out',
  investigate: 'look into',
  investigated: 'looked into',
  endeavor: 'try',
  endeavors: 'tries',
  ascertain: 'find out',
  elucidate: 'explain',
  disseminate: 'spread',
  preponderance: 'majority',
  consequently: 'as a result',
  furthermore: 'also',
  moreover: 'also',
  nevertheless: 'still',
  notwithstanding: 'even though',
  predominantly: 'mostly',
};

function smartSimplifyText(text: string): string {
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return text;

  const simplifiedParagraphs = paragraphs.map(para => {
    let simplified = para;
    for (const [complex, simple] of Object.entries(SIMPLIFY_MAP)) {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    }
    return simplified;
  });

  return simplifiedParagraphs.join('\n\n');
}

function smartSummarizeText(text: string): string {
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const sentences: string[] = [];

  for (const para of paragraphs) {
    const rawSentences = para.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(s => s.length > 25);
    if (rawSentences.length > 0) {
      sentences.push(rawSentences[0]);
      if (rawSentences.length > 2) {
        sentences.push(rawSentences[Math.floor(rawSentences.length / 2)]);
      }
    }
  }

  const selected = sentences.slice(0, 7);
  if (selected.length === 0) return '• ' + text.slice(0, 300);

  return 'Key Takeaways:\n\n' + selected.map(s => `• ${s}`).join('\n\n');
}

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

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const systemPrompt =
      mode === 'simplify'
        ? 'You are an accessibility assistant. Rewrite the following text into plain, direct, 5th-grade level English while preserving all core facts. Remove obscure jargon. Use short sentences. Keep paragraphs brief (2-3 sentences each). Maintain the overall meaning and essential information.'
        : 'You are an accessibility assistant. Summarize the following text into clear, concise bullet points. Each bullet should capture one key fact or idea using plain, accessible language. Aim for 5-8 bullet points. Format each bullet starting with •.';

    const truncatedText = text.slice(0, 10000);

    // 1. First priority: Google Gemini API
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        // Try gemini-3.5-flash-lite, fallback to gemini-3.8-flash
        const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];
        let lastError: unknown = null;

        for (const model of models) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: truncatedText,
              config: {
                systemInstruction: systemPrompt,
                temperature: 0.3,
              },
            });

            const resultText = response.text?.trim();
            if (resultText) {
              return NextResponse.json({
                result: resultText,
                provider: 'gemini',
                model,
                isMock: false,
              });
            }
          } catch (modelErr) {
            lastError = modelErr;
            console.warn(`Gemini model ${model} attempt failed, trying fallback:`, modelErr);
          }
        }

        if (lastError) {
          console.error('All Gemini model attempts failed:', lastError);
        }
      } catch (geminiError) {
        console.error('Google Gemini API initialization/call error:', geminiError);
      }
    }

    // 2. Second priority: OpenAI API (if configured)
    if (openaiKey && openaiKey !== 'your_key_here' && openaiKey !== 'your_openai_key_here') {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: truncatedText },
          ],
          temperature: 0.4,
          max_tokens: 2000,
        });

        const result = completion.choices[0]?.message?.content?.trim();
        if (result) {
          return NextResponse.json({
            result,
            provider: 'openai',
            model: 'gpt-4o-mini',
            isMock: false,
          });
        }
      } catch (openAiError) {
        console.error('OpenAI call error:', openAiError);
      }
    }

    // 3. Fallback: Intelligent dynamic text processor (works offline / zero keys)
    await new Promise(resolve => setTimeout(resolve, 600));

    const isSample =
      text.toLowerCase().includes('visual word form area') ||
      text.toLowerCase().includes('science of reading');

    if (isSample) {
      return NextResponse.json({
        result: mode === 'simplify' ? SAMPLE_SIMPLIFY : SAMPLE_SUMMARY,
        provider: 'fallback-sample',
        isMock: true,
      });
    }

    const dynamicResult =
      mode === 'simplify' ? smartSimplifyText(text) : smartSummarizeText(text);

    return NextResponse.json({
      result: dynamicResult,
      provider: 'fallback-dynamic',
      isMock: true,
    });
  } catch (error: unknown) {
    console.error('Simplify API route fatal error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
