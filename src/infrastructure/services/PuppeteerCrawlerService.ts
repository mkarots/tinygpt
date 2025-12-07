import { ICrawlerService, CrawlResult } from '../../domain/interfaces/ICrawlerService';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import puppeteer from 'puppeteer';

export class PuppeteerCrawlerService implements ICrawlerService {
  async crawl(url: string): Promise<CrawlResult> {
    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      throw new Error('Invalid URL format');
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Set User Agent
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');

      // Go to URL and wait for network to be idle
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // 1. Expand all details/summary elements
      await page.evaluate(() => {
        document.querySelectorAll('details').forEach(el => el.setAttribute('open', 'true'));
      });
      
      // 2. Auto-scroll to bottom to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      // Get the fully rendered HTML
      const html = await page.content();
      
      const $ = cheerio.load(html);

      // Extract title
      const title = $('title').text().trim() || url;

      // Try to find the main content
      let contentSelector = 'body';
      if ($('main').length) contentSelector = 'main';
      else if ($('article').length) contentSelector = 'article';
      else if ($('#content').length) contentSelector = '#content';
      else if ($('.content').length) contentSelector = '.content';

      const bodyContent = $(contentSelector).html() || $('body').html() || '';

      // Convert to Markdown
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
      });

      // Remove links but keep text
      turndownService.addRule('removeLinks', {
        filter: 'a',
        replacement: function (content) {
          return content;
        }
      });

      const markdown = turndownService.turndown(bodyContent);

      // Basic cleaning
      const cleanedMarkdown = markdown
        .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
        .trim();

      return {
        title,
        content: cleanedMarkdown,
        originalUrl: url
      };

    } catch (error) {
       console.error("Puppeteer navigation error", error);
       throw new Error('Failed to load page');
    } finally {
      await browser.close();
    }
  }
}

