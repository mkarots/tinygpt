
import React, { useState } from 'react';
import { CheckCircle, Copy, Link, ExternalLink, Globe } from 'lucide-react';

const DeployTab: React.FC = () => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  const mockShareUrl = `https://tinygpt.app/chat/p/${Math.random().toString(36).substr(2, 6)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mockShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('<script src="https://cdn.tinygpt.ai/widget.js" async></script>');
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
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600 font-mono flex items-center justify-between">
                       <span>{mockShareUrl}</span>
                       <button 
                         onClick={handleCopyLink}
                         className="text-brand-600 hover:text-brand-700 font-medium text-xs ml-4"
                       >
                         {copiedLink ? 'Copied!' : 'Copy'}
                       </button>
                    </div>
                    <button 
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 flex items-center gap-2"
                      onClick={() => window.alert('In a real app, this would open the public share page.')}
                    >
                      <ExternalLink className="w-4 h-4" /> Open
                    </button>
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
                &lt;script src="https://cdn.tinygpt.ai/widget.js" data-id="project_{Math.random().toString(36).substr(2,7)}" async&gt;&lt;/script&gt;
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
