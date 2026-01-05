'use client';

import { Paper } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  onSummarize: (paper: Paper) => void;
  isSummarizing?: boolean;
}

export function PaperCard({ paper, onSummarize, isSummarizing }: PaperCardProps) {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{paper.title}</CardTitle>
          {paper.ranking && (
            <Badge variant="default" className="shrink-0 font-mono">
              [{paper.ranking}]
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {paper.authors.slice(0, 3).join(', ')}
          {paper.authors.length > 3 && ' et al.'}
        </CardDescription>
      </CardHeader>

      <div className="px-6 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {paper.abstract}
        </p>
      </div>

      <CardFooter className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{paper.source}</Badge>
          {paper.upvotes && (
            <span>♥ {paper.upvotes}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(paper.link, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onSummarize(paper)}
            disabled={isSummarizing}
          >
            <FileText className="h-4 w-4 me-1" />
            {isSummarizing ? '...' : 'تلخيص'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
