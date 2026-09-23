import React, { useState } from 'react';
import { Globe, FileText, CheckCircle } from 'lucide-react';
import { Heading } from '../core/typography/Heading';
import { Text } from '../core/typography/Text';
import { Button } from '../core/button/Button';
import DropZone from '../DropZone';
import { KnowledgeItem, CompanyInfo } from '../../../types';

interface KnowledgeStepProps {
  knowledge: KnowledgeItem[];
  onAddKnowledge: (items: KnowledgeItem[]) => void;
  onUpdateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  companyInfo: CompanyInfo;
}

export const KnowledgeStep: React.FC<KnowledgeStepProps> = ({
  knowledge,
  onAddKnowledge,
  onUpdateKnowledge,
  companyInfo,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(0);

  const performCrawl = async (url: string) => {
    try {
      new URL(url);
    } catch {
      return; 
    }

    const tempId = Math.random().toString(36).substr(2, 9);
    const newItem: KnowledgeItem = {
      id: tempId,
      type: 'url',
      name: new URL(url).hostname,
      content: '',
      status: 'pending',
      dateAdded: Date.now()
    };
    
    onAddKnowledge([newItem]);
    setIsCrawling(true);
    setCrawlProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setCrawlProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 500);
    
    // Start background crawl
    fetch('/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })
    .then(res => res.json())
    .then(data => {
      clearInterval(progressInterval);
      setCrawlProgress(100);
      if (data.error) {
        onUpdateKnowledge(tempId, { status: 'error', name: `Error: ${new URL(url).hostname}` });
      } else {
        onUpdateKnowledge(tempId, { 
          status: 'active', 
          content: data.content,
          name: data.title || new URL(url).hostname
        });
        
        // Simulate Email Trigger
        if (companyInfo.email) {
            console.log(`Email sent to ${companyInfo.email}`);
        }
      }
    })
    .catch(() => {
        clearInterval(progressInterval);
        onUpdateKnowledge(tempId, { status: 'error' });
    })
    .finally(() => {
        setTimeout(() => {
          setIsCrawling(false);
          setCrawlProgress(0);
        }, 500);
    });
  };

  const handleCrawl = () => {
    if (!urlInput) return;
    performCrawl(urlInput);
    setUrlInput('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <Heading level={2}>Add your knowledge</Heading>
        <Text variant="muted" className="mt-2">Upload docs or import your site. The more you add, the smarter it gets.</Text>
      </div>
      
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
           <Globe className="w-4 h-4 text-blue-500" /> Import Website
        </h3>
        <div className="flex gap-2">
          <input 
            type="url" 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={companyInfo.website || "https://example.com"}
            className="flex-1 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg text-sm focus:outline-none"
          />
          <Button 
            onClick={handleCrawl}
            disabled={isCrawling || !urlInput}
            variant="secondary"
            className="min-w-[100px]"
          >
            {isCrawling ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <span>{crawlProgress}%</span>
              </div>
            ) : (
              'Import'
            )}
          </Button>
        </div>
        
        {isCrawling && (
          <div className="mt-4 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-1">
              <div 
                className="bg-brand-600 h-1 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${crawlProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 flex items-center justify-between">
              <span>Analyzing content structure...</span>
              {companyInfo.email && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> We'll email {companyInfo.email} when done.
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <DropZone onFilesAdded={onAddKnowledge} compact />

      {knowledge.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
          <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 border-b border-slate-200">
            Imported ({knowledge.length})
          </div>
          <ul className="divide-y divide-slate-100">
            {knowledge.map(k => (
              <li key={k.id} className="px-4 py-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    {k.type === 'file' && <FileText className="w-4 h-4 text-orange-500" />}
                    {k.type === 'url' && <Globe className="w-4 h-4 text-blue-500" />}
                    <span className="text-sm font-medium text-slate-700">{k.name}</span>
                 </div>
                 <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ready</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

