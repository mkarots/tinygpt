import { ICrawlerService } from '../../domain/interfaces/ICrawlerService';
import { ILLMService } from '../../domain/interfaces/ILLMService';

export class ProcessKnowledgeUseCase {
  constructor(
    private crawlerService: ICrawlerService,
    private llmService: ILLMService
  ) {}

  async execute(url: string): Promise<{ title: string; content: string; originalUrl: string }> {
    // Crawl
    const crawledData = await this.crawlerService.crawl(url);
    
    // Clean
    const cleanedContent = await this.llmService.clean(crawledData.content);

    return {
      ...crawledData,
      content: cleanedContent
    };
  }
}

