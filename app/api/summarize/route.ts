import { NextRequest } from 'next/server';
import { generateSummary } from '@/lib/ai';
import { getCachedSummary, setCachedSummary } from '@/lib/cache';
import { fetchPaperHTML } from '@/lib/arxiv';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { paperId, source, language } = await request.json();

    // Check cache first
    const cached = await getCachedSummary(paperId);
    if (cached) {
      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(cached));
            controller.close();
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        }
      );
    }

    // For ArXiv papers, fetch full HTML content
    let content = '';
    if (source === 'arxiv') {
      try {
        content = await fetchPaperHTML(paperId);
      } catch {
        content = '';
      }
    }

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content available for summarization' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stream = await generateSummary(content, language);
    const encoder = new TextEncoder();
    let fullSummary = '';

    const transformedStream = new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const textContent = parsed.choices?.[0]?.delta?.content;
                  if (textContent) {
                    fullSummary += textContent;
                    controller.enqueue(encoder.encode(textContent));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          if (fullSummary) {
            await setCachedSummary(paperId, fullSummary);
          }
          controller.close();
        }
      },
    });

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to generate summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
