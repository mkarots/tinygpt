import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { CrawlResult, ICrawlerService } from '../../domain/interfaces/ICrawlerService';

const DEFAULT_TIMEOUT_MS = 30_000;

function isTimeout(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = 'name' in error ? String(error.name) : '';
  return name === 'TimeoutError' || name === 'AbortError';
}

export class FetchCrawlerService implements ICrawlerService {
  constructor(
    private readonly fetchPage: typeof fetch = fetch,
    private readonly timeoutMs = DEFAULT_TIMEOUT_MS,
  ) {}

  async crawl(url: string): Promise<CrawlResult> {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error('Invalid URL format');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Invalid URL format');
    }

    let response: Response;
    try {
      response = await this.fetchPage(parsed.toString(), {
        signal: AbortSignal.timeout(this.timeoutMs),
        headers: { 'User-Agent': 'TinyGPT/1.0' },
        redirect: 'follow',
      });
    } catch (error) {
      if (isTimeout(error)) {
        throw new Error('Timed out loading the page');
      }
      throw new Error('Failed to load page');
    }

    if (!response.ok) {
      throw new Error(`Failed to load page (${response.status})`);
    }

    return markdownFromHtml(await response.text(), url);
  }
}

export function markdownFromHtml(html: string, url: string): CrawlResult {
  const $ = cheerio.load(html);
  const title = $('title').text().trim() || url;

  let contentSelector = 'body';
  if ($('main').length) contentSelector = 'main';
  else if ($('article').length) contentSelector = 'article';
  else if ($('#content').length) contentSelector = '#content';
  else if ($('.content').length) contentSelector = '.content';

  const bodyContent = $(contentSelector).html() || $('body').html() || '';
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });
  turndownService.addRule('removeLinks', {
    filter: 'a',
    replacement: (content) => content,
  });

  const content = turndownService.turndown(bodyContent).replace(/\n{3,}/g, '\n\n').trim();
  return { title, content, originalUrl: url };
}
