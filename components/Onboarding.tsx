
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Globe, FileText, Code, CheckCircle, Copy } from 'lucide-react';
import { AgentConfig, KnowledgeItem, CompanyInfo, OnboardingStep } from '../types';
import DropZone from './DropZone';

interface OnboardingProps {
  onComplete: () => void;
  config: AgentConfig;
  onConfigChange: (key: keyof AgentConfig, value: any) => void;
  knowledge: KnowledgeItem[];
  onAddKnowledge: (items: KnowledgeItem[]) => void;
  onUpdateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  companyInfo: CompanyInfo;
  onCompanyInfoChange: (info: CompanyInfo) => void;
}

const STEPS = [
  { id: 1, title: 'Company Info' },
  { id: 2, title: 'Add Knowledge' },
  { id: 3, title: 'Customize' },
  { id: 4, title: 'Quick Questions' },
  { id: 5, title: 'Install' },
];

const Onboarding: React.FC<OnboardingProps> = ({ 
  onComplete, 
  config, 
  onConfigChange,
  knowledge,
  onAddKnowledge,
  onUpdateKnowledge,
  companyInfo,
  onCompanyInfoChange
}) => {
  const [step, setStep] = useState<OnboardingStep>(1);
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
            // In a real app, this would be a server call
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

  const triggerConfetti = (final = false) => {
    if (window.confetti) {
      if (final) {
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
          window.confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: [config.primaryColor, '#ffffff']
          });
          window.confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: [config.primaryColor, '#ffffff']
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        }());
      } else {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
          colors: [config.primaryColor, '#000000']
        });
      }
    }
  };

  const handleNext = () => {
    if (step === 1 && companyInfo.website) {
       // Trigger auto-crawl when leaving step 1
       performCrawl(companyInfo.website);
    }

    if (step < 5) {
      triggerConfetti();
      setStep((prev) => (prev + 1) as OnboardingStep);
    } else {
      triggerConfetti(true);
      setTimeout(onComplete, 1500);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  const handleCrawl = () => {
    if (!urlInput) return;
    performCrawl(urlInput);
    setUrlInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header / Progress */}
      <div className="px-8 py-6 border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <div className="w-8 h-8 bg-brand-600 rounded-lg text-white flex items-center justify-center">
               <span className="font-mono font-bold">T</span>
             </div>
             TinyGPT Setup
           </h1>
           <span className="text-sm text-slate-400 font-medium">Step {step} of 5</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-brand-600 -translate-y-1/2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          ></div>
          <div className="relative flex justify-between">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all duration-300
                    ${step > s.id 
                      ? 'bg-brand-600 border-brand-600 text-white' 
                      : step === s.id 
                        ? 'bg-white border-brand-600 text-brand-600 scale-110 shadow-lg' 
                        : 'bg-white border-slate-200 text-slate-300'
                    }
                  `}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors duration-300 ${step === s.id ? 'text-brand-600' : 'text-slate-300'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto py-10 px-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Tell us about your company</h2>
                <p className="text-slate-500 mt-2">We'll use this to configure your assistant's base knowledge.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    value={companyInfo.name}
                    onChange={(e) => {
                       onCompanyInfoChange({...companyInfo, name: e.target.value});
                       if (!config.name || config.name === 'Support Bot') {
                         onConfigChange('name', `${e.target.value} Assistant`);
                       }
                    }}
                    className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
                  <input 
                    type="url" 
                    value={companyInfo.website}
                    onChange={(e) => onCompanyInfoChange({...companyInfo, website: e.target.value})}
                    className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                    placeholder="https://acme.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                  <select 
                     value={companyInfo.industry}
                     onChange={(e) => onCompanyInfoChange({...companyInfo, industry: e.target.value})}
                     className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                  >
                    <option value="">Select an industry</option>
                    <option value="saas">SaaS / Technology</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="education">Education</option>
                    <option value="agency">Agency / Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Your Email (for crawl reports)</label>
                   <input 
                     type="email" 
                     value={companyInfo.email}
                     onChange={(e) => onCompanyInfoChange({...companyInfo, email: e.target.value})}
                     className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                     placeholder="you@company.com"
                   />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Add your knowledge</h2>
                <p className="text-slate-500 mt-2">Upload docs or import your site. The more you add, the smarter it gets.</p>
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
                  <button 
                    onClick={handleCrawl}
                    disabled={isCrawling || !urlInput}
                    className="bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 min-w-[100px]"
                  >
                    {isCrawling ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        <span>{crawlProgress}%</span>
                      </div>
                    ) : (
                      'Import'
                    )}
                  </button>
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
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Give it personality</h2>
                <p className="text-slate-500 mt-2">Make the assistant sound like your brand.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Assistant Name</label>
                <input 
                  type="text" 
                  value={config.name}
                  onChange={(e) => onConfigChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Tone of Voice</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['professional', 'friendly', 'concise', 'humorous'] as const).map(tone => (
                    <button
                      key={tone}
                      onClick={() => onConfigChange('tone', tone)}
                      className={`p-4 rounded-xl border-2 text-left transition-all
                        ${config.tone === tone 
                          ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                        }
                      `}
                    >
                      <span className="block font-semibold text-sm capitalize mb-1 text-slate-900">{tone}</span>
                      <span className="block text-xs text-slate-500">
                        {tone === 'professional' && "Polite, formal, business-like"}
                        {tone === 'friendly' && "Warm, helpful, conversational"}
                        {tone === 'concise' && "Direct, efficient, minimal fluff"}
                        {tone === 'humorous' && "Witty, fun, light-hearted"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Brand Color</label>
                <div className="flex gap-4">
                  {['#7c3aed', '#2563eb', '#059669', '#dc2626', '#09090b'].map(color => (
                    <button
                      key={color}
                      onClick={() => onConfigChange('primaryColor', color)}
                      className={`w-12 h-12 rounded-full transition-transform hover:scale-110 shadow-sm ${config.primaryColor === color ? 'ring-4 ring-slate-200 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Add Quick Questions</h2>
                <p className="text-slate-500 mt-2">Help users start the conversation with one click.</p>
              </div>
              
              <div className="space-y-4">
                 {config.quickQuestions.map((q, i) => (
                   <div key={i} className="flex gap-3">
                     <div className="w-8 h-10 flex items-center justify-center text-slate-300 font-bold">{i + 1}</div>
                     <input 
                       value={q}
                       onChange={(e) => {
                         const newQ = [...config.quickQuestions];
                         newQ[i] = e.target.value;
                         onConfigChange('quickQuestions', newQ);
                       }}
                       className="flex-1 px-4 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:border-brand-500 outline-none"
                     />
                   </div>
                 ))}
                 {config.quickQuestions.length < 4 && (
                   <button 
                     onClick={() => onConfigChange('quickQuestions', [...config.quickQuestions, 'New Question'])}
                     className="ml-11 text-sm text-brand-600 font-medium hover:underline"
                   >
                     + Add another question
                   </button>
                 )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">You're ready to launch!</h2>
                <p className="text-slate-500 mt-2">Install the widget now or explore your dashboard.</p>
              </div>

              <div className="bg-slate-900 rounded-xl p-6 relative group">
                <div className="absolute top-4 right-4">
                   <button 
                     className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                     onClick={() => navigator.clipboard.writeText('<script src="https://cdn.tinygpt.ai/widget.js" async></script>')}
                   >
                     <Copy className="w-3 h-3" /> Copy
                   </button>
                </div>
                <code className="font-mono text-sm text-green-400 break-all">
                  &lt;script src="https://cdn.tinygpt.ai/widget.js" data-id="tiny_{Math.random().toString(36).substr(2,7)}" async&gt;&lt;/script&gt;
                </code>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-white">
        <button 
          onClick={handleBack}
          disabled={step === 1}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors
            ${step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}
          `}
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        
        <button 
          onClick={handleNext}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-brand-500/30 transition-all transform hover:scale-105"
        >
          {step === 5 ? 'Go to Dashboard' : 'Next Step'} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
