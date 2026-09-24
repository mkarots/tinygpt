import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ICrawlerService } from '../../domain/interfaces/ICrawlerService';
import { ILLMService } from '../../domain/interfaces/ILLMService';
import { ProcessKnowledgeUseCase } from './ProcessKnowledgeUseCase';

describe('ProcessKnowledgeUseCase', () => {
  it('cleans the crawled markdown with the LLM', async () => {
    const crawler: ICrawlerService = {
      async crawl(url) {
        return { title: 'Help', content: 'raw nav and body', originalUrl: url };
      },
    };
    const llm: ILLMService = {
      async clean(text) {
        assert.equal(text, 'raw nav and body');
        return 'body only';
      },
      async chat() {
        return (async function* () {})();
      },
    };

    const result = await new ProcessKnowledgeUseCase(crawler, llm).execute('https://example.com');
    assert.deepEqual(result, {
      title: 'Help',
      content: 'body only',
      originalUrl: 'https://example.com',
    });
  });
});
