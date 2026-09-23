import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Heading } from '../core/typography/Heading';
import { Text } from '../core/typography/Text';

export const SuccessStep: React.FC<{ error?: string | null }> = ({ error }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
           <CheckCircle className="w-8 h-8" />
        </div>
        <Heading level={2}>Save your agent</Heading>
        <Text variant="muted" className="mt-2">
          This saves the agent to your account, then opens a page with the public chat link and embed snippet.
        </Text>
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
};
