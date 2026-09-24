
import React from 'react';
import Link from 'next/link';
import { Database, Palette, Code, Settings, Building2 } from 'lucide-react';
import { DashboardTab } from '../../types';
import { Button } from './core/button/Button';
import { PRODUCT_BUILDER_PATH } from '../lib/routes';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  companyName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, companyName }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col z-20 shadow-sm">
      {/* Header Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xl">
           <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-mono">
             T
           </div>
           TinyGPT
        </div>
      </div>
      
      {/* Workspace Selector */}
      <div className="px-6 pb-6 border-b border-slate-100">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Workspace
        </div>
        <div className="flex items-center gap-3 p-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors cursor-default">
           <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
              <Building2 className="w-4 h-4" />
           </div>
           <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                {companyName}
              </div>
              <div className="text-xs text-slate-500">Free Plan</div>
           </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          href={PRODUCT_BUILDER_PATH}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        >
          Your agents
        </Link>
        <Button 
          variant="ghost"
          onClick={() => onTabChange('knowledge')}
          className={`w-full justify-start gap-3 px-4 py-3 rounded-lg text-sm font-medium
            ${activeTab === 'knowledge' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
          `}
        >
          <Database className="w-4 h-4" />
          Knowledge Base
        </Button>
        <Button 
          variant="ghost"
          onClick={() => onTabChange('appearance')}
          className={`w-full justify-start gap-3 px-4 py-3 rounded-lg text-sm font-medium
            ${activeTab === 'appearance' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
          `}
        >
          <Palette className="w-4 h-4" />
          Appearance & Tone
        </Button>
        <Button 
          variant="ghost"
          onClick={() => onTabChange('deploy')}
          className={`w-full justify-start gap-3 px-4 py-3 rounded-lg text-sm font-medium
            ${activeTab === 'deploy' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
          `}
        >
          <Code className="w-4 h-4" />
          Install Widget
        </Button>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
            D
          </div>
          <div className="text-xs">
            <p className="font-medium text-slate-900">Demo Account</p>
            <p className="text-slate-500">Settings</p>
          </div>
          <Settings className="w-4 h-4 ml-auto text-slate-400" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
