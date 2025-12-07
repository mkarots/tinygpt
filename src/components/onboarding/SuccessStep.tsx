import React from 'react';
import { CheckCircle, Copy } from 'lucide-react';
import { Heading } from '../core/typography/Heading';
import { Text } from '../core/typography/Text';
import { Button } from '../core/button/Button';

export const SuccessStep: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
           <CheckCircle className="w-8 h-8" />
        </div>
        <Heading level={2}>You're ready to launch!</Heading>
        <Text variant="muted" className="mt-2">Install the widget now or explore your dashboard.</Text>
      </div>

      <div className="bg-slate-900 rounded-xl p-6 relative group">
        <div className="absolute top-4 right-4">
           <Button 
             variant="ghost"
             className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors h-auto border-none"
             onClick={() => navigator.clipboard.writeText('<script src="https://cdn.tinygpt.ai/widget.js" async></script>')}
           >
             <Copy className="w-3 h-3" /> Copy
           </Button>
        </div>
        <code className="font-mono text-sm text-green-400 break-all">
          &lt;script src="https://cdn.tinygpt.ai/widget.js" data-id="tiny_{Math.random().toString(36).substr(2,7)}" async&gt;&lt;/script&gt;
        </code>
      </div>
    </div>
  );
};

