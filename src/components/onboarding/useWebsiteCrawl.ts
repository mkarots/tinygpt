import { useState } from 'react';
import { KnowledgeItem } from '../../../types';
import { crawlImportErrorMessage } from '../../lib/crawlImportError';

export function useWebsiteCrawl(
  onAddKnowledge: (items: KnowledgeItem[]) => void,
  onUpdateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void
) {
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);

  const performCrawl = async (url: string) => {
    try {
      new URL(url);
    } catch {
      return;
    }

    const tempId = Math.random().toString(36).substr(2, 9);
    const hostname = new URL(url).hostname;
    const newItem: KnowledgeItem = {
      id: tempId,
      type: 'url',
      name: hostname,
      content: '',
      status: 'pending',
      dateAdded: Date.now(),
    };

    onAddKnowledge([newItem]);
    setIsCrawling(true);
    setCrawlProgress(0);

    const progressInterval = setInterval(() => {
      setCrawlProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 1;
      });
    }, 100);

    fetch('/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
      .then((res) => res.json())
      .then((data) => {
        clearInterval(progressInterval);
        setCrawlProgress(100);
        if (data.error) {
          onUpdateKnowledge(tempId, {
            status: 'error',
            name: hostname,
            error: crawlImportErrorMessage(data.error),
          });
        } else {
          onUpdateKnowledge(tempId, {
            status: 'active',
            content: data.content,
            name: data.title || hostname,
            error: undefined,
          });
        }
      })
      .catch(() => {
        clearInterval(progressInterval);
        onUpdateKnowledge(tempId, {
          status: 'error',
          name: hostname,
          error: crawlImportErrorMessage(null),
        });
      })
      .finally(() => {
        setTimeout(() => {
          setIsCrawling(false);
          setCrawlProgress(0);
        }, 500);
      });
  };

  return { isCrawling, crawlProgress, performCrawl };
}
