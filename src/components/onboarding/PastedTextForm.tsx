import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { KnowledgeItem } from '../../../types';
import { Button } from '../core/button/Button';
import { Input } from '../core/input/Input';
import { TextArea } from '../core/input/TextArea';
import { createTextKnowledgeItem } from '../../lib/textKnowledge';

interface PastedTextFormProps {
  onAdd: (item: KnowledgeItem) => void;
}

export const PastedTextForm: React.FC<PastedTextFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const item = createTextKnowledgeItem(title, content);
    if (!item) {
      setError('Add a title and the text you want the agent to know.');
      return;
    }
    onAdd(item);
    setTitle('');
    setContent('');
    setError(null);
  };

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-emerald-500" /> Paste text
      </h3>
      <div className="space-y-3">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Return policy"
        />
        <TextArea
          label="Text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste notes, FAQs, or a policy here"
          rows={5}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="button" variant="secondary" onClick={handleAdd}>
          Add text
        </Button>
      </div>
    </div>
  );
};
