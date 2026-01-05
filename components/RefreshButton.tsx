'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RefreshButtonProps {
  onRefresh: (source: 'arxiv' | 'huggingface') => Promise<void>;
}

export function RefreshButton({ onRefresh }: RefreshButtonProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const handleRefresh = async (source: 'arxiv' | 'huggingface') => {
    setIsLoading(true);
    try {
      await onRefresh(source);
      setLastRefresh(new Date().toLocaleTimeString('ar-SA'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleRefresh('arxiv')}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
        {t('refresh')}
      </Button>
      {lastRefresh && (
        <span className="text-xs text-muted-foreground">
          آخر تحديث: {lastRefresh}
        </span>
      )}
    </div>
  );
}
