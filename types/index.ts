export interface Paper {
  id: string;
  source: 'arxiv' | 'huggingface';
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  ranking?: number;
  upvotes?: number;
  link: string;
  htmlUrl?: string;
  summary?: string;
  summaryGeneratedAt?: string;
}

export interface SummaryRequest {
  paperId: string;
  content: string;
  language: 'en' | 'ar';
}

export interface PapersResponse {
  papers: Paper[];
  cachedAt: string;
  source: 'arxiv' | 'huggingface' | 'all';
}

export interface ArXivResponse {
  entry: {
    id: string;
    title: string;
    summary: string;
    published: string;
    authors: { name: string }[];
    link: { href: string }[];
  }[];
}
