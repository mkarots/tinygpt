
import React, { useState } from 'react';
import { Globe, Loader, FileText, Code, Trash2 } from 'lucide-react';
import DropZone from './DropZone';
import { KnowledgeItem } from '../../types';
import { createTextKnowledgeItem } from '../lib/textKnowledge';
import { crawlImportErrorMessage } from '../lib/crawlImportError';
import { knowledgeStatusLabel } from '../lib/knowledgeStatusLabel';

interface KnowledgeTabProps {
  knowledge: KnowledgeItem[];
  onAddItems: (items: KnowledgeItem[]) => void;
  onUpdateItem: (id: string, updates: Partial<KnowledgeItem>) => void;
  onRemoveItem: (id: string) => void;
}

const KnowledgeTab: React.FC<KnowledgeTabProps> = ({ knowledge, onAddItems, onUpdateItem, onRemoveItem }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  
  // Text Modal State
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInputTitle, setTextInputTitle] = useState('');
  const [textInputContent, setTextInputContent] = useState('');

  const handleCrawlWebsite = () => {
    if (!urlInput) return;
    setIsCrawling(true);
    
    const tempId = Math.random().toString(36).substr(2, 9);
    const hostname = new URL(urlInput).hostname;
    
    const newItem: KnowledgeItem = {
      id: tempId,
      type: 'url',
      name: hostname,
      content: '',
      status: 'pending',
      dateAdded: Date.now()
    };
    onAddItems([newItem]);

    fetch('/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        onUpdateItem(tempId, {
          status: 'error',
          name: hostname,
          error: crawlImportErrorMessage(data.error),
        });
      } else {
        onUpdateItem(tempId, { 
          status: 'active', 
          content: data.content,
          name: data.title || hostname,
          error: undefined,
        });
      }
    })
    .catch(() => {
      onUpdateItem(tempId, {
        status: 'error',
        name: hostname,
        error: crawlImportErrorMessage(null),
      });
    })
    .finally(() => {
      setUrlInput('');
      setIsCrawling(false);
    });
  };

  const handleAddText = () => {
    const newItem = createTextKnowledgeItem(textInputTitle, textInputContent);
    if (!newItem) return;
    onAddItems([newItem]);
    setTextInputTitle('');
    setTextInputContent('');
    setShowTextModal(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
        <p className="text-slate-500 mt-1">Train your assistant by adding files, websites, or text.</p>
      </div>

      {/* Add Knowledge Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* URL Input */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" /> Import Website
            </h3>
            <div className="flex gap-2">
              <input 
                type="url" 
                placeholder="https://company.com" 
                className="flex-1 px-3 py-2 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={isCrawling}
              />
              <button 
                onClick={handleCrawlWebsite}
                disabled={isCrawling || !urlInput}
                className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCrawling ? <Loader className="w-4 h-4 animate-spin" /> : 'Add'}
              </button>
            </div>
         </div>

         {/* Text Input Trigger */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" /> Custom Text
            </h3>
            <p className="text-xs text-slate-500 mb-3">Add snippets, FAQs, or internal notes.</p>
            <button 
              onClick={() => setShowTextModal(true)}
              className="w-full bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Write Text
            </button>
         </div>
      </div>

      {/* Dropzone */}
      <div>
        <DropZone onFilesAdded={onAddItems} compact={true} />
      </div>

      {/* Knowledge List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-sm text-slate-900">Active Sources ({knowledge.length})</h3>
          {knowledge.length === 0 && <span className="text-xs text-orange-500 font-medium">Assistant has no knowledge!</span>}
        </div>
        {knowledge.length === 0 ? (
           <div className="p-8 text-center text-slate-400 text-sm">
              No documents added yet. Upload files or add a URL above.
           </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {knowledge.map((item) => (
              <li key={item.id} className="px-6 py-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                    ${item.type === 'file' ? 'bg-orange-50 text-orange-600' : ''}
                    ${item.type === 'url' ? 'bg-blue-50 text-blue-600' : ''}
                    ${item.type === 'text' ? 'bg-emerald-50 text-emerald-600' : ''}
                  `}>
                     {item.type === 'file' && <FileText className="w-4 h-4" />}
                     {item.type === 'url' && <Globe className="w-4 h-4" />}
                     {item.type === 'text' && <Code className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{item.name}</p>
                    {item.status === 'error' && item.error ? (
                      <p className="text-xs text-red-600 mt-0.5 max-w-[240px]">{item.error}</p>
                    ) : (
                      <p className="text-xs text-slate-500">{new Date(item.dateAdded).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                     item.status === 'error'
                       ? 'bg-red-100 text-red-700'
                       : item.status === 'pending'
                         ? 'bg-slate-100 text-slate-600'
                         : 'bg-green-100 text-green-800'
                   }`}>
                     {knowledgeStatusLabel(item.status)}
                   </span>
                   <button 
                     onClick={() => onRemoveItem(item.id)}
                     className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Text Modal */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-slide-up">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Add Custom Text</h2>
              <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                   <input 
                     type="text" 
                     className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm"
                     placeholder="e.g., Return Policy"
                     value={textInputTitle}
                     onChange={e => setTextInputTitle(e.target.value)}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                   <textarea 
                     className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm h-32"
                     placeholder="Paste text content here..."
                     value={textInputContent}
                     onChange={e => setTextInputContent(e.target.value)}
                   />
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setShowTextModal(false)}
                      className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddText}
                      className="px-4 py-2 text-sm bg-brand-600 text-white hover:bg-brand-700 rounded-lg"
                    >
                      Save Knowledge
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeTab;
