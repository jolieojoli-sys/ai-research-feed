'use client';

import { useEffect, useState } from 'react';
import { Paper } from '@/types';
import { PaperCard } from '@/components/PaperCard';
import { SummaryModal } from '@/components/SummaryModal';
import { RefreshButton } from '@/components/RefreshButton';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [source, setSource] = useState<'all' | 'arxiv' | 'huggingface'>('all');

  useEffect(() => {
    fetchPapers();
  }, [source]);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/papers?source=${source}`);
      const data = await response.json();
      setPapers(data.papers || []);
    } catch (error) {
      console.error('Failed to fetch papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (refreshSource: 'arxiv' | 'huggingface') => {
    try {
      const response = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: refreshSource }),
      });

      if (response.ok) {
        await fetchPapers();
      }
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  };

  const handleSummarize = (paper: Paper) => {
    setSelectedPaper(paper);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
            </div>
            <RefreshButton onRefresh={handleRefresh} />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button
              size="sm"
              variant={source === 'all' ? 'default' : 'outline'}
              onClick={() => setSource('all')}
            >
              {t('arxiv')} + {t('huggingface')}
            </Button>
            <Button
              size="sm"
              variant={source === 'arxiv' ? 'default' : 'outline'}
              onClick={() => setSource('arxiv')}
            >
              {t('arxiv')}
            </Button>
            <Button
              size="sm"
              variant={source === 'huggingface' ? 'default' : 'outline'}
              onClick={() => setSource('huggingface')}
            >
              {t('huggingface')}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('loading')}</p>
            <Button onClick={() => handleRefresh('arxiv')} className="mt-4">
              {t('refresh')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onSummarize={handleSummarize}
              />
            ))}
          </div>
        )}
      </div>

      <SummaryModal
        paper={selectedPaper}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  );
}
