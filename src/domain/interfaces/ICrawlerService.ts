export interface CrawlResult {
  title: string;
  content: string;
  originalUrl: string;
}

export interface ICrawlerService {
  crawl(url: string): Promise<CrawlResult>;
}

