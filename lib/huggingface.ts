import * as cheerio from 'cheerio';
import { Paper } from '@/types';

const HF_TRENDING_URL = 'https://huggingface.co/papers/trending';

export async function fetchHuggingFacePapers(
  maxResults: number = 20
): Promise<Paper[]> {
  const response = await fetch(HF_TRENDING_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ResearchBot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`HuggingFace trending page error: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const papers: Paper[] = [];

  $('a[href^="/papers/"]').each((index, element) => {
    if (papers.length >= maxResults) return false;

    const $el = $(element);
    const paperUrl = $el.attr('href');
    if (!paperUrl || paperUrl === '/papers/trending') return;

    const paperId = paperUrl.split('/papers/').pop()?.split('?')[0] || '';
    if (!paperId || papers.some(p => p.id === paperId)) return;

    const $card = $el.closest('[class*="paper"], article, .SLOTSab]');

    const title = $card.find('h2, h3, .paper-title').text().trim() ||
                  $el.find('h2, h3').text().trim() ||
                  $el.text().trim();

    if (!title || title.length < 5) return;

    const likesText = $card.find('[class*="like"], [class*="vote"], button')
      .filter((_, e) => !!$(e).text().match(/\d+/))
      .first()
      .text()
      .match(/\d+/)?.[0];
    const upvotes = likesText ? parseInt(likesText) : 0;

    const authorsText = $card.find('[class*="author"]').text().trim();
    const authors = authorsText
      ? authorsText.split(/,|\sand\s/i).map(a => a.trim()).filter(a => a)
      : ['Unknown'];

    const abstract = $card.find('[class*="abstract"], [class*="summary"], p')
      .first()
      .text()
      .trim() || '';

    const published = $card.find('[class*="date"], time, span').text().trim() ||
                      new Date().toISOString();

    const ranking = papers.length + 1;

    papers.push({
      id: paperId,
      source: 'huggingface',
      title,
      authors,
      abstract,
      published,
      ranking,
      upvotes,
      link: `https://huggingface.co${paperUrl}`,
      htmlUrl: `https://huggingface.co${paperUrl}`,
    });
  });

  return papers;
}
