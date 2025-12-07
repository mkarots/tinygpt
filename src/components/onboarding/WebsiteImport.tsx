import React from 'react';
import { Globe, CheckCircle } from 'lucide-react';
import { Button } from '../core/button/Button';
import { Input } from '../core/input/Input';
import { CompanyInfo } from '../../../types';

interface WebsiteImportProps {
  urlInput: string;
  setUrlInput: (url: string) => void;
  isCrawling: boolean;
  crawlProgress: number;
  companyInfo: CompanyInfo;
  onImport: () => void;
}

export const WebsiteImport: React.FC<WebsiteImportProps> = ({
  urlInput,
  setUrlInput,
  isCrawling,
  crawlProgress,
  companyInfo,
  onImport,
}) => {
  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
         <Globe className="w-4 h-4 text-blue-500" /> Import Website
      </h3>
      <div className="flex gap-2">
        <Input 
          type="url" 
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={companyInfo.website || "https://example.com"}
          wrapperClassName="flex-1"
        />
        <Button 
          onClick={onImport}
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
  );
};

