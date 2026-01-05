'use client';

import { useState, useEffect, useRef } from 'react';
import { Paper } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface SummaryModalProps {
  paper: Paper | null;
  open: boolean;
  onClose: () => void;
}

export function SummaryModal({ paper, open, onClose }: SummaryModalProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && paper && !summary) {
      fetchSummary();
    }
  }, [open, paper]);

  const fetchSummary = async () => {
    if (!paper) return;

    setIsLoading(true);
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: paper.id,
          source: paper.source,
          language: 'ar',
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        setSummary(prev => prev + text);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (summaryRef.current) {
      navigator.clipboard.writeText(summaryRef.current.textContent || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl line-clamp-2">
            {paper?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyToClipboard}
              disabled={!summary}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 ml-2" />
                  نسخ
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 ml-2" />
                  نسخ
                </>
              )}
            </Button>
          </div>

          <div
            ref={summaryRef}
            className="prose prose-sm max-w-none"
            dir="rtl"
          >
            {isLoading && !summary && (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            )}
            {summary && (
              <div className="whitespace-pre-wrap">{summary}</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
