import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { FetchCrawlerService } from './FetchCrawlerService';

const page = `<!doctype html><html><head><title>Acme Help</title></head><body>
<nav>Ignore me</nav>
<main><h1>Pricing</h1><p>Plans start at $10.</p><a href="/x">Details</a></main>
</body></html>`;

describe('FetchCrawlerService', () => {
  it('extracts the title and main text without launching a browser', async () => {
    let called = 0;
    const crawler = new FetchCrawlerService(async () => {
      called += 1;
      return new Response(page, { status: 200 });
    });

    const result = await crawler.crawl('https://example.com/pricing');
    assert.equal(called, 1);
    assert.equal(result.title, 'Acme Help');
    assert.equal(result.originalUrl, 'https://example.com/pricing');
    assert.match(result.content, /Pricing/);
    assert.match(result.content, /Plans start at \$10/);
    assert.doesNotMatch(result.content, /Ignore me/);
  });

  it('rejects an invalid URL before fetching', async () => {
    const crawler = new FetchCrawlerService(async () => {
      throw new Error('should not fetch');
    });
    await assert.rejects(() => crawler.crawl('not a url'), /Invalid URL format/);
    await assert.rejects(() => crawler.crawl('ftp://example.com/file'), /Invalid URL format/);
  });

  it('returns a clear error when the fetch times out', async () => {
    const crawler = new FetchCrawlerService(async () => {
      const error = new Error('The operation was aborted due to timeout');
      error.name = 'TimeoutError';
      throw error;
    });
    await assert.rejects(() => crawler.crawl('https://example.com'), /Timed out loading the page/);
  });

  it('wires the crawl route to fetch, not Puppeteer, and still cleans with the LLM', () => {
    const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');
    const route = readFileSync(path.join(root, 'src/app/api/crawl/route.ts'), 'utf8');
    const useCase = readFileSync(path.join(root, 'src/application/use-cases/ProcessKnowledgeUseCase.ts'), 'utf8');
    assert.match(route, /new FetchCrawlerService\(\)/);
    assert.match(route, /ProcessKnowledgeUseCase/);
    assert.doesNotMatch(route, /puppeteer/i);
    assert.match(useCase, /llmService\.clean/);
  });

  it('returns a clear error when the host responds with an error status', async () => {
    const crawler = new FetchCrawlerService(async () => new Response('nope', { status: 404 }));
    await assert.rejects(() => crawler.crawl('https://example.com/missing'), /Failed to load page \(404\)/);
  });
});
