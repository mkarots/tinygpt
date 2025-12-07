
import React, { useState } from 'react';
import { CheckCircle, Copy, Link, ExternalLink, Globe, Loader2 } from 'lucide-react';
import { AgentConfig, KnowledgeItem } from '../../types';

interface DeployTabProps {
  config: AgentConfig;
  knowledge: KnowledgeItem[];
}

const DeployTab: React.FC<DeployTabProps> = ({ config, knowledge }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLink = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, knowledge }),
      });
      const data = await response.json();
      if (data.url) {
        setShareUrl(`${window.location.origin}${data.url}`);
      }
    } catch (e) {
      console.error('Failed to generate link', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };


  const handleCopyCode = () => {
    // Extract agentId from the share URL if generated
    const agentId = shareUrl ? shareUrl.split('/').pop() : 'YOUR_AGENT_ID';
    const scriptTag = `<script src="${window.location.origin}/tinygpt.js" data-id="${agentId}" async></script>`;
    navigator.clipboard.writeText(scriptTag);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
       <div>
          <h1 className="text-2xl font-bold text-slate-900">Deploy & Share</h1>
          <p className="text-slate-500 mt-1">Share your agent directly or embed it on your site.</p>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                 <Link className="w-6 h-6" />
              </div>
              <div className="flex-1">
                 <h3 className="font-semibold text-slate-900 text-lg">Shareable Permalink</h3>
                 <p className="text-slate-500 text-sm mt-1">
                   Send this public link to colleagues or customers. They can chat with your agent in a full-page interface without needing an account.
                 </p>
                 
                 <div className="mt-4 flex gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 font-mono flex items-center justify-between min-h-[46px]">
                       {shareUrl ? (
                         <>
                           <span className="truncate">{shareUrl}</span>
                           <button 
                             onClick={handleCopyLink}
                             className="text-brand-600 hover:text-brand-700 font-medium text-xs ml-4 whitespace-nowrap"
                           >
                             {copiedLink ? 'Copied!' : 'Copy'}
                           </button>
                         </>
                       ) : (
                         <span className="text-slate-400 italic">Click generate to create a link</span>
                       )}
                    </div>
                    {shareUrl ? (
                      <a 
                        href={shareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" /> Open
                      </a>
                    ) : (
                      <button 
                        onClick={generateLink}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg text-sm hover:bg-brand-700 flex items-center gap-2 disabled:opacity-70"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Link'}
                      </button>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Widget Embed Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start gap-4">
               <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                 <Globe className="w-6 h-6" />
               </div>
               <div>
                 <h3 className="font-semibold text-slate-900 text-lg">Website Widget</h3>
                 <p className="text-sm text-slate-500 mt-1">Copy and paste this snippet before the closing <code>&lt;/body&gt;</code> tag of your website.</p>
               </div>
           </div>
           
           <div className="p-6 bg-slate-900 relative group">
              <code className="text-sm font-mono text-green-400 block break-all leading-relaxed">
                &lt;!-- TinyGPT Widget --&gt;<br/>
                &lt;script src="{typeof window !== 'undefined' ? window.location.origin : ''}/tinygpt.js" <br/>
                &nbsp;&nbsp;data-id="{shareUrl ? shareUrl.split('/').pop() : 'YOUR_AGENT_ID'}" async&gt;&lt;/script&gt;
              </code>
              <button 
                className={`absolute top-4 right-4 px-3 py-1.5 rounded text-xs font-medium backdrop-blur-sm transition-colors flex items-center gap-2
                  ${copiedCode ? 'bg-green-500/20 text-green-300' : 'bg-white/10 hover:bg-white/20 text-white'}
                `}
                onClick={handleCopyCode}
              >
                {copiedCode ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copied' : 'Copy Code'}
              </button>
           </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 mb-3" />
              <h4 className="font-semibold text-sm mb-1 text-slate-900">Lightweight</h4>
              <p className="text-xs text-slate-500">Only 12kb gzipped. Won't slow down your site.</p>
           </div>
           <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 mb-3" />
              <h4 className="font-semibold text-sm mb-1 text-slate-900">Universal</h4>
              <p className="text-xs text-slate-500">Works with WordPress, React, Shopify, and plain HTML.</p>
           </div>
           <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 mb-3" />
              <h4 className="font-semibold text-sm mb-1 text-slate-900">Secure</h4>
              <p className="text-xs text-slate-500">Sandboxed execution and encrypted data transport.</p>
           </div>
        </div>
    </div>
  );
};

export default DeployTab;
