import { NextRequest, NextResponse } from 'next/server';
import { fetchArXivPapers } from '@/lib/arxiv';
import { fetchHuggingFacePapers } from '@/lib/huggingface';
import { setCachedPapers, checkRateLimit } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const { source } = await request.json();
    const userId = request.headers.get('x-forwarded-for') || 'anonymous';

    // Rate limit: 1 request per 5 minutes
    const allowed = await checkRateLimit(`${userId}:refresh`, 12);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    let papers;
    if (source === 'arxiv') {
      papers = await fetchArXivPapers(20);
    } else if (source === 'huggingface') {
      papers = await fetchHuggingFacePapers(20);
    } else {
      return NextResponse.json(
        { error: 'Invalid source. Use "arxiv" or "huggingface".' },
        { status: 400 }
      );
    }

    await setCachedPapers(source, papers);

    return NextResponse.json({
      success: true,
      count: papers.length,
      source,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to refresh papers' },
      { status: 500 }
    );
  }
}
