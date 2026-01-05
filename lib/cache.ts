import { Redis } from '@upstash/redis';
import { Paper } from '@/types';

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const CACHE_KEYS = {
  ARXIV_PAPERS: 'arxiv:cs:ai',
  HF_PAPERS: 'huggingface:trending',
  SUMMARY: (id: string) => `summaries:${id}`,
  RATE_LIMIT: (userId: string) => `ratelimit:${userId}`,
} as const;

const CACHE_TTL = {
  PAPERS: 7200,
  SUMMARY: 86400,
  RATE_LIMIT: 3600,
} as const;

export async function getCachedPapers(
  source: 'arxiv' | 'huggingface'
): Promise<Paper[] | null> {
  const key = source === 'arxiv' ? CACHE_KEYS.ARXIV_PAPERS : CACHE_KEYS.HF_PAPERS;
  const data = await redis.get<Paper[]>(key);
  return data;
}

export async function setCachedPapers(
  source: 'arxiv' | 'huggingface',
  papers: Paper[]
): Promise<void> {
  const key = source === 'arxiv' ? CACHE_KEYS.ARXIV_PAPERS : CACHE_KEYS.HF_PAPERS;
  await redis.set(key, papers, { ex: CACHE_TTL.PAPERS });
}

export async function getCachedSummary(paperId: string): Promise<string | null> {
  return await redis.get<string>(CACHE_KEYS.SUMMARY(paperId));
}

export async function setCachedSummary(
  paperId: string,
  summary: string
): Promise<void> {
  await redis.set(CACHE_KEYS.SUMMARY(paperId), summary, { ex: CACHE_TTL.SUMMARY });
}

export async function checkRateLimit(userId: string, limit: number = 10): Promise<boolean> {
  const key = CACHE_KEYS.RATE_LIMIT(userId);
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, CACHE_TTL.RATE_LIMIT);
  }

  return current <= limit;
}

export { CACHE_KEYS, CACHE_TTL };
