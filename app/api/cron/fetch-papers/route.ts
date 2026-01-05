import { NextRequest, NextResponse } from 'next/server';
import { fetchArXivPapers } from '@/lib/arxiv';
import { fetchHuggingFacePapers } from '@/lib/huggingface';
import { setCachedPapers } from '@/lib/cache';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch both sources
    const [arxivPapers, hfPapers] = await Promise.all([
      fetchArXivPapers(20),
      fetchHuggingFacePapers(20),
    ]);

    // Cache both
    await Promise.all([
      setCachedPapers('arxiv', arxivPapers),
      setCachedPapers('huggingface', hfPapers),
    ]);

    return NextResponse.json({
      success: true,
      arxivCount: arxivPapers.length,
      hfCount: hfPapers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch papers', details: String(error) },
      { status: 500 }
    );
  }
}
