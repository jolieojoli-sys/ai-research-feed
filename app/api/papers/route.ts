import { NextRequest, NextResponse } from 'next/server';
import { getCachedPapers } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const source = (searchParams.get('source') || 'all') as 'arxiv' | 'huggingface' | 'all';

  try {
    if (source === 'all') {
      const [arxiv, hf] = await Promise.all([
        getCachedPapers('arxiv'),
        getCachedPapers('huggingface'),
      ]);

      const papers = [
        ...(arxiv || []),
        ...(hf || []),
      ].sort((a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime()
      );

      return NextResponse.json({ papers, source: 'all', cachedAt: new Date().toISOString() });
    }

    const papers = await getCachedPapers(source);
    return NextResponse.json({
      papers: papers || [],
      source,
      cachedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}
