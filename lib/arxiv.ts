import * as cheerio from 'cheerio';
import { Paper } from '@/types';

const ARXIV_NEW_LISTINGS = 'https://arxiv.org/list/cs.AI/new';
const ARXIV_HTML_BASE = 'https://arxiv.org/html/';

export async function fetchArXivPapers(
  maxResults: number = 20
): Promise<Paper[]> {
  const response = await fetch(ARXIV_NEW_LISTINGS);
  if (!response.ok) {
    throw new Error(`ArXiv listing error: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const papers: Paper[] = [];

  $('dl').each((index, element) => {
    if (papers.length >= maxResults) return false;

    const $dl = $(element);
    const $dt = $dl.find('dt').first();
    const $dd = $dl.find('dd').first();

    const paperId = $dt.find('a[href*="/abs/"]').attr('href')?.split('/abs/').pop() || '';
    if (!paperId) return;

    const title = $dt.find('.list-title').text().trim() ||
                  $dt.find('a').text().trim();

    const authorsText = $dt.find('.list-authors').text().trim();
    const authors = authorsText
      .split(/,|\sand\s/i)
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const abstract = $dd.find('.list-abstract').text().trim() ||
                     $dd.text().trim();

    const published = $dt.find('.list-submission-date').text().trim() ||
                      new Date().toISOString();

    const ranking = index + 1;

    const link = `https://arxiv.org/abs/${paperId}`;
    const htmlUrl = `${ARXIV_HTML_BASE}${paperId}`;

    papers.push({
      id: paperId,
      source: 'arxiv',
      title,
      authors,
      abstract,
      published,
      ranking,
      link,
      htmlUrl,
    });
  });

  return papers;
}

export async function fetchPaperHTML(paperId: string): Promise<string> {
  const url = `${ARXIV_HTML_BASE}${paperId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ArXiv HTML fetch error: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const content: string[] = [];

  const title = $('h1').first().text().trim();
  if (title) content.push(`# ${title}\n`);

  $('.abstract').each((_, el) => {
    content.push($(el).text().trim());
  });

  $('section h2, .ltx_title').each((_, el) => {
    const sectionTitle = $(el).text().trim();
    const sectionContent = $(el).nextUntil('h2, .ltx_title').text().trim();

    if (sectionTitle && sectionContent) {
      content.push(`\n## ${sectionTitle}\n${sectionContent}`);
    }
  });

  return content.join('\n\n').slice(0, 15000);
}
